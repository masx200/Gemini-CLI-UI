import fs from "fs";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import { v4 as uuidv4 } from "uuid";
import { spawn } from "child_process";
import cors from "cors";
import express from "express";
import { promises as fsPromises } from "fs";
import http from "http";
import mime from "mime-types";
import fetch from "node-fetch";
import pty, {} from "node-pty-prebuilt-multiarch";
import WebSocket, { WebSocketServer } from "ws";
import os from "os";
import { initializeDatabase } from "./database/db.js";
import { abortGeminiSession, spawnGemini } from "./gemini-cli.js";
import { authenticateToken, authenticateWebSocket, validateApiKey, } from "./middleware/auth.js";
import { createQwenProxy } from "./middleware/proxy.js";
import { addProjectManually, clearProjectDirectoryCache, deleteProject, extractProjectDirectory, getProjects, renameProject, } from "./projects.js";
import authRoutes from "./routes/auth.js";
import gitRoutes from "./routes/git.js";
import mcpRoutes from "./routes/mcp.js";
import modelProvidersRoutes from "./routes/model-providers.js";
import { FSWatcher } from "chokidar";
import sessionManager from "./sessionManager.js";
let projectsWatcher = null;
const connectedClients = new Set();
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
try {
    const envPath = path.join(__dirname, "../.env");
    if (fs.existsSync(envPath)) {
        const envFile = fs.readFileSync(envPath, "utf8");
        envFile.split("\n").forEach((line) => {
            const trimmedLine = line.trim();
            if (trimmedLine && !trimmedLine.startsWith("#")) {
                const [key, ...valueParts] = trimmedLine.split("=");
                if (key && valueParts.length > 0 && !process.env[key]) {
                    process.env[key] = valueParts.join("=").trim();
                }
            }
        });
    }
}
catch (e) {
    console.log("Error loading .env file:", e);
}
function run(cmd, args, opts = {}) {
    return new Promise((resolve, reject) => {
        const child = spawn(cmd, args, { stdio: "pipe", ...opts });
        const out = [], err = [];
        child.stdout?.on("data", (b) => out.push(b));
        child.stderr?.on("data", (b) => err.push(b));
        child.on("close", (code) => code === 0
            ?
                resolve(Buffer.concat(out).toString())
            :
                reject(new Error(Buffer.concat(err).toString())));
    });
}
async function setupProjectsWatcher() {
    const chokidar = (await import("chokidar")).default;
    const geminiProjectsPath = path.join(process.env.HOME || os.homedir(), ".gemini", "projects");
    if (projectsWatcher) {
        projectsWatcher.close();
    }
    try {
        projectsWatcher = chokidar.watch(geminiProjectsPath, {
            ignored: [
                "**/node_modules/**",
                "**/.git/**",
                "**/dist/**",
                "**/build/**",
                "**/*.tmp",
                "**/*.swp",
                "**/.DS_Store",
            ],
            persistent: true,
            ignoreInitial: true,
            followSymlinks: false,
            depth: 10,
            awaitWriteFinish: {
                stabilityThreshold: 100,
                pollInterval: 50,
            },
        });
        let debounceTimer;
        const debouncedUpdate = async (eventType, filePath) => {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(async () => {
                try {
                    clearProjectDirectoryCache();
                    const updatedProjects = await getProjects();
                    const updateMessage = JSON.stringify({
                        type: "projects_updated",
                        projects: updatedProjects,
                        timestamp: new Date().toISOString(),
                        changeType: eventType,
                        changedFile: path.relative(geminiProjectsPath, filePath),
                    });
                    connectedClients.forEach((client) => {
                        if (client.readyState === client.OPEN) {
                            client.send(updateMessage);
                        }
                    });
                }
                catch (error) {
                }
            }, 300);
        };
        projectsWatcher
            .on("add", (filePath) => debouncedUpdate("add", filePath))
            .on("change", (filePath) => debouncedUpdate("change", filePath))
            .on("unlink", (filePath) => debouncedUpdate("unlink", filePath))
            .on("addDir", (dirPath) => debouncedUpdate("addDir", dirPath))
            .on("unlinkDir", (dirPath) => debouncedUpdate("unlinkDir", dirPath))
            .on("error", (error) => {
        })
            .on("ready", () => { });
    }
    catch (error) {
    }
}
const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({
    server,
    verifyClient: (info) => {
        const url = new URL(info.req.url, "http://localhost");
        const token = url.searchParams.get("token") ||
            info.req.headers.authorization?.split(" ")[1];
        const user = authenticateWebSocket(token);
        if (!user) {
            return false;
        }
        info.req.user = user;
        return true;
    },
});
app.use(cors());
app.use(express.json());
app.use("/api", validateApiKey);
const username = uuidv4();
const password = uuidv4();
const authOptions = {
    username: username,
    password: password,
    document: "false",
    port: Number(Math.round(Math.random() * 30000 + 20000)),
    host: "0.0.0.0",
};
app.use((req, res, next) => {
    if (req.path.startsWith("/api/qwen")) {
        return authenticateToken(req, res, function () {
            return createQwenProxy(`http://localhost:${authOptions.port}`, username, password, "/api/qwen", "/api/qwen")(req, res, next);
        });
    }
    else {
        return next();
    }
});
app.use("/api/auth", authRoutes);
app.use("/api/git", authenticateToken, gitRoutes);
app.use("/api/mcp", authenticateToken, mcpRoutes);
app.use("/api/model-providers", authenticateToken, modelProvidersRoutes);
app.use(express.static(path.join(__dirname, "../dist")));
app.get("/api/config", authenticateToken, (req, res) => {
    const host = req.headers.host || `${req.hostname}:${PORT}`;
    const protocol = req.protocol === "https" || req.get("x-forwarded-proto") === "https"
        ? "wss"
        : "ws";
    res.json({
        serverPort: PORT,
        wsUrl: `${protocol}://${host}`,
    });
});
app.get("/api/projects", authenticateToken, async (req, res) => {
    try {
        const projects = await getProjects();
        res.json(projects);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});
app.get("/api/projects/:projectName/sessions", authenticateToken, async (req, res) => {
    try {
        const projectPath = await extractProjectDirectory(req.params.projectName);
        const sessions = sessionManager.getProjectSessions(projectPath);
        const { limit = 5, offset = 0 } = req.query;
        const paginatedSessions = sessions.slice(parseInt(offset), parseInt(offset) + parseInt(limit));
        res.json({
            sessions: paginatedSessions,
            total: sessions.length,
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
app.get("/api/projects/:projectName/sessions/:sessionId/messages", authenticateToken, async (req, res) => {
    try {
        const { sessionId } = req.params;
        const messages = sessionManager.getSessionMessages(sessionId);
        res.json({ messages });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
app.put("/api/projects/:projectName/rename", authenticateToken, async (req, res) => {
    try {
        const { displayName } = req.body;
        await renameProject(req.params.projectName, displayName);
        res.json({ success: true });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
app.delete("/api/projects/:projectName/sessions/:sessionId", authenticateToken, async (req, res) => {
    try {
        const { sessionId } = req.params;
        await sessionManager.deleteSession(sessionId);
        res.json({ success: true });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
app.delete("/api/projects/:projectName", authenticateToken, async (req, res) => {
    try {
        const { projectName } = req.params;
        await deleteProject(projectName);
        res.json({ success: true });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
app.post("/api/projects/create", authenticateToken, async (req, res) => {
    try {
        const { path: projectPath } = req.body;
        if (!projectPath || !projectPath.trim()) {
            return res.status(400).json({ error: "Project path is required" });
        }
        const project = await addProjectManually(projectPath.trim());
        res.json({ success: true, project });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
app.get("/api/projects/:projectName/file", authenticateToken, async (req, res) => {
    try {
        const { filePath } = req.query;
        if (!filePath || !path.isAbsolute(filePath)) {
            return res.status(400).json({ error: "Invalid file path" });
        }
        const content = await fsPromises.readFile(filePath, "utf8");
        res.json({ content, path: filePath });
    }
    catch (error) {
        if (error.code === "ENOENT") {
            res.status(404).json({ error: "File not found" });
        }
        else if (error.code === "EACCES") {
            res.status(403).json({ error: "Permission denied" });
        }
        else {
            res.status(500).json({ error: error.message });
        }
    }
});
app.get("/api/projects/:projectName/files/content", authenticateToken, async (req, res) => {
    try {
        const { path: filePath } = req.query;
        if (!filePath || !path.isAbsolute(filePath)) {
            return res.status(400).json({ error: "Invalid file path" });
        }
        try {
            await fsPromises.access(filePath);
        }
        catch (error) {
            return res.status(404).json({ error: "File not found" });
        }
        const mimeType = mime.lookup(filePath) || "application/octet-stream";
        res.setHeader("Content-Type", mimeType);
        const fileStream = fs.createReadStream(filePath);
        fileStream.pipe(res);
        fileStream.on("error", (error) => {
            if (!res.headersSent) {
                res.status(500).json({ error: "Error reading file" });
            }
        });
    }
    catch (error) {
        if (!res.headersSent) {
            res.status(500).json({ error: error.message });
        }
    }
});
app.put("/api/projects/:projectName/file", authenticateToken, async (req, res) => {
    try {
        const { filePath, content } = req.body;
        if (!filePath || !path.isAbsolute(filePath)) {
            return res.status(400).json({ error: "Invalid file path" });
        }
        if (content === undefined) {
            return res.status(400).json({ error: "Content is required" });
        }
        try {
            const backupPath = filePath + ".backup." + Date.now();
            await fsPromises.copyFile(filePath, backupPath);
        }
        catch (backupError) {
        }
        await fsPromises.writeFile(filePath, content, "utf8");
        res.json({
            success: true,
            path: filePath,
            message: "File saved successfully",
        });
    }
    catch (error) {
        if (error.code === "ENOENT") {
            res.status(404).json({ error: "File or directory not found" });
        }
        else if (error.code === "EACCES") {
            res.status(403).json({ error: "Permission denied" });
        }
        else {
            res.status(500).json({ error: error.message });
        }
    }
});
app.get("/api/projects/:projectName/files", authenticateToken, async (req, res) => {
    try {
        let actualPath;
        try {
            actualPath = await extractProjectDirectory(req.params.projectName);
        }
        catch (error) {
            actualPath = req.params.projectName.replace(/-/g, "/");
        }
        try {
            await fsPromises.access(actualPath);
        }
        catch (e) {
            return res.status(404).json({
                error: `Project path not found: ${actualPath}`,
            });
        }
        const files = await getFileTree(actualPath, 3, 0, true);
        const hiddenFiles = files.filter((f) => f.name.startsWith("."));
        res.json(files);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
wss.on("connection", (ws, request) => {
    const url = request.url;
    const urlObj = new URL(url, "http://localhost");
    const pathname = urlObj.pathname;
    if (pathname === "/shell") {
        handleShellConnection(ws);
    }
    else if (pathname === "/ws") {
        handleChatConnection(ws);
    }
    else {
        ws.close();
    }
});
function handleChatConnection(ws) {
    connectedClients.add(ws);
    ws.on("message", async (message) => {
        try {
            const data = JSON.parse(message);
            if (data.type === "gemini-command") {
                await spawnGemini(data.command, data.options, ws);
            }
            else if (data.type === "abort-session") {
                const success = abortGeminiSession(data.sessionId);
                ws.send(JSON.stringify({
                    type: "session-aborted",
                    sessionId: data.sessionId,
                    success,
                }));
            }
        }
        catch (error) {
            ws.send(JSON.stringify({
                type: "error",
                error: error.message,
            }));
        }
    });
    ws.on("close", () => {
        connectedClients.delete(ws);
    });
}
function handleShellConnection(ws) {
    let shellProcess = null;
    ws.on("message", async (message) => {
        try {
            const data = JSON.parse(message);
            if (data.type === "init") {
                const projectPath = data.projectPath || process.cwd();
                const sessionId = data.sessionId;
                const hasSession = data.hasSession;
                const welcomeMsg = hasSession
                    ? `\x1b[36mResuming Gemini session ${sessionId} in: ${projectPath}\x1b[0m\r\n`
                    : `\x1b[36mStarting new Gemini session in: ${projectPath}\x1b[0m\r\n`;
                ws.send(JSON.stringify({
                    type: "output",
                    data: welcomeMsg,
                }));
                try {
                    const geminiPath = process.env.GEMINI_PATH || "gemini";
                    const cmd = process.platform === "win32"
                        ? "cmd"
                        :
                            process.env.GEMINI_PATH || `which ${geminiPath}`;
                    try {
                        const cmd = process.platform === "win32"
                            ? "cmd"
                            :
                                process.env.GEMINI_PATH || `which ${geminiPath}`;
                        const args = [];
                        if (process.platform === "win32") {
                            args.push("/c");
                            args.push(process.env.GEMINI_PATH || `which ${geminiPath}`);
                        }
                        args.push("--version");
                        const version = await run(cmd, args, {
                            cwd: projectPath,
                            stdio: "pipe",
                            shell: false,
                            env: process.env,
                            args: args,
                        });
                        console.log("Gemini version:", version);
                    }
                    catch (error) {
                        console.error(error);
                        const args = [];
                        if (process.platform === "win32") {
                            args.push("/c");
                            args.push(process.env.GEMINI_PATH || `which ${geminiPath}`);
                        }
                        args.push("--version");
                        console.log({
                            cwd: projectPath,
                            cmd,
                            stdio: "ignore",
                            shell: true,
                            env: process.env,
                            args: args,
                        });
                        console.error("❌ Gemini CLI not found in PATH or GEMINI_PATH");
                        console.error("GEMINI_PATH:", process.env.GEMINI_PATH || "gemini");
                        ws.send(JSON.stringify({
                            type: "output",
                            data: `\r\n\x1b[31mError: Gemini CLI not found. Please check:\x1b[0m\r\n\x1b[33m1. Install gemini globally: npm install -g @google/gemini-cli\x1b[0m\r\n\x1b[33m2. Or set GEMINI_PATH in .env file\x1b[0m\r\n`,
                        }));
                        return;
                    }
                    let geminiCommand = geminiPath;
                    if (hasSession && sessionId) {
                        geminiCommand = `${geminiPath} --resume ${sessionId} || ${geminiPath}`;
                    }
                    const shellCommand = `cd "${projectPath}" && ${geminiCommand}`;
                    const isWindows = process.platform === "win32";
                    const shell = isWindows ? "cmd.exe" : "bash";
                    const shellArgs = isWindows
                        ? ["/c", shellCommand]
                        : ["-c", shellCommand];
                    const homeDir = isWindows
                        ?
                            process.env.USERPROFILE
                        :
                            process.env.HOME || "/";
                    shellProcess = pty.spawn(shell, shellArgs, {
                        name: "xterm-256color",
                        cols: 80,
                        rows: 24,
                        cwd: homeDir,
                        env: {
                            ...process.env,
                            TERM: "xterm-256color",
                            COLORTERM: "truecolor",
                            FORCE_COLOR: "3",
                            BROWSER: isWindows ? "echo OPEN_URL:" : 'echo "OPEN_URL:"',
                        },
                    });
                    shellProcess.onData((data) => {
                        if (ws.readyState === ws.OPEN) {
                            let outputData = data;
                            const patterns = [
                                /(?:xdg-open|open|start)\s+(https?:\/\/[^\s\x1b\x07]+)/g,
                                /OPEN_URL:\s*(https?:\/\/[^\s\x1b\x07]+)/g,
                                /Opening\s+(https?:\/\/[^\s\x1b\x07]+)/gi,
                                /Visit:\s*(https?:\/\/[^\s\x1b\x07]+)/gi,
                                /View at:\s*(https?:\/\/[^\s\x1b\x07]+)/gi,
                                /Browse to:\s*(https?:\/\/[^\s\x1b\x07]+)/gi,
                            ];
                            patterns.forEach((pattern) => {
                                let match;
                                while ((match = pattern.exec(data)) !== null) {
                                    const url = match[1];
                                    ws.send(JSON.stringify({
                                        type: "url_open",
                                        url: url,
                                    }));
                                    if (pattern.source.includes("OPEN_URL")) {
                                        outputData = outputData.replace(match[0], `🌐 Opening in browser: ${url}`);
                                    }
                                }
                            });
                            ws.send(JSON.stringify({
                                type: "output",
                                data: outputData,
                            }));
                        }
                    });
                    shellProcess.onExit((exitCode) => {
                        if (ws.readyState === ws.OPEN) {
                            ws.send(JSON.stringify({
                                type: "output",
                                data: `\r\n\x1b[33mProcess exited with code ${exitCode.exitCode}${exitCode.signal ? ` (${exitCode.signal})` : ""}\x1b[0m\r\n`,
                            }));
                        }
                        shellProcess = null;
                    });
                }
                catch (spawnError) {
                    console.error("❌ Error spawning process:", spawnError);
                    ws.send(JSON.stringify({
                        type: "output",
                        data: `\r\n\x1b[31mError: ${spawnError.message}\x1b[0m\r\n`,
                    }));
                }
            }
            else if (data.type === "input") {
                if (shellProcess && shellProcess.write) {
                    try {
                        shellProcess.write(data.data);
                    }
                    catch (error) {
                    }
                }
                else {
                }
            }
            else if (data.type === "resize") {
                if (shellProcess && shellProcess.resize) {
                    shellProcess.resize(data.cols, data.rows);
                }
            }
        }
        catch (error) {
            if (ws.readyState === ws.OPEN) {
                ws.send(JSON.stringify({
                    type: "output",
                    data: `\r\n\x1b[31mError: ${error.message}\x1b[0m\r\n`,
                }));
            }
        }
    });
    ws.on("close", () => {
        if (shellProcess && shellProcess.kill) {
            shellProcess.kill();
        }
    });
    ws.on("error", (error) => {
    });
}
app.post("/api/transcribe", authenticateToken, async (req, res) => {
    try {
        const multer = (await import("multer")).default;
        const upload = multer({ storage: multer.memoryStorage() });
        upload.single("audio")(req, res, async (err) => {
            if (err) {
                return res.status(400).json({ error: "Failed to process audio file" });
            }
            if (!req.file) {
                return res.status(400).json({ error: "No audio file provided" });
            }
            const apiKey = process.env.OPENAI_API_KEY;
            if (!apiKey) {
                return res.status(500).json({
                    error: "OpenAI API key not configured. Please set OPENAI_API_KEY in server environment.",
                });
            }
            try {
                const FormData = (await import("form-data")).default;
                const formData = new FormData();
                formData.append("file", req.file.buffer, {
                    filename: req.file.originalname,
                    contentType: req.file.mimetype,
                });
                formData.append("model", "whisper-1");
                formData.append("response_format", "json");
                formData.append("language", "en");
                const OPENAI_BASE_URL = process.env.OPENAI_BASE_URL;
                const response = await fetch(((OPENAI_BASE_URL ?? "https://api.openai.com/v1/") +
                    "/audio/transcriptions").replaceAll("//", "/"), {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${apiKey}`,
                        ...formData.getHeaders(),
                    },
                    body: formData,
                });
                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    throw new Error(errorData.error?.message || `Whisper API error: ${response.status}`);
                }
                const data = await response.json();
                let transcribedText = data.text || "";
                const mode = req.body.mode || "default";
                if (!transcribedText) {
                    return res.json({ text: "" });
                }
                if (mode === "default") {
                    return res.json({ text: transcribedText });
                }
                try {
                    const OpenAI = (await import("openai")).default;
                    const openai = new OpenAI({ apiKey });
                    let prompt, systemMessage, temperature = 0.7, maxTokens = 800;
                    switch (mode) {
                        case "prompt":
                            systemMessage =
                                "You are an expert prompt engineer who creates clear, detailed, and effective prompts.";
                            prompt = `You are an expert prompt engineer. Transform the following rough instruction into a clear, detailed, and context-aware AI prompt.

Your enhanced prompt should:
1. Be specific and unambiguous
2. Include relevant context and constraints
3. Specify the desired output format
4. Use clear, actionable language
5. Include examples where helpful
6. Consider edge cases and potential ambiguities

Transform this rough instruction into a well-crafted prompt:
"${transcribedText}"

Enhanced prompt:`;
                            break;
                        case "vibe":
                        case "instructions":
                        case "architect":
                            systemMessage =
                                "You are a helpful assistant that formats ideas into clear, actionable instructions for AI agents.";
                            temperature = 0.5;
                            prompt = `Transform the following idea into clear, well-structured instructions that an AI agent can easily understand and execute.

IMPORTANT RULES:
- Format as clear, step-by-step instructions
- Add reasonable implementation details based on common patterns
- Only include details directly related to what was asked
- Do NOT add features or functionality not mentioned
- Keep the original intent and scope intact
- Use clear, actionable language an agent can follow

Transform this idea into agent-friendly instructions:
"${transcribedText}"

Agent instructions:`;
                            break;
                        default:
                            break;
                    }
                    if (prompt) {
                        const completion = await openai.chat.completions.create({
                            model: "gpt-4o-mini",
                            messages: [
                                { role: "system", content: systemMessage },
                                { role: "user", content: prompt },
                            ],
                            temperature: temperature,
                            max_tokens: maxTokens,
                        });
                        transcribedText =
                            completion.choices[0].message.content || transcribedText;
                    }
                }
                catch (gptError) {
                }
                res.json({ text: transcribedText });
            }
            catch (error) {
                res.status(500).json({ error: error.message });
            }
        });
    }
    catch (error) {
        res.status(500).json({ error: "Internal server error" });
    }
});
app.post("/api/projects/:projectName/upload-images", authenticateToken, async (req, res) => {
    try {
        const multer = (await import("multer")).default;
        const path = (await import("path")).default;
        const fs = (await import("fs")).promises;
        const os = (await import("os")).default;
        const storage = multer.diskStorage({
            destination: async (req, file, cb) => {
                const uploadDir = path.join(os.tmpdir(), "gemini-ui-uploads", String(req.user.id));
                await fs.mkdir(uploadDir, { recursive: true });
                cb(null, uploadDir);
            },
            filename: (req, file, cb) => {
                const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
                const sanitizedName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, "_");
                cb(null, uniqueSuffix + "-" + sanitizedName);
            },
        });
        const fileFilter = (req, file, cb) => {
            const allowedMimes = [
                "image/jpeg",
                "image/png",
                "image/gif",
                "image/webp",
                "image/svg+xml",
            ];
            if (allowedMimes.includes(file.mimetype)) {
                cb(null, true);
            }
            else {
                cb(new Error("Invalid file type. Only JPEG, PNG, GIF, WebP, and SVG are allowed."));
            }
        };
        const upload = multer({
            storage,
            fileFilter,
            limits: {
                fileSize: 5 * 1024 * 1024,
                files: 5,
            },
        });
        upload.array("images", 5)(req, res, async (err) => {
            if (err) {
                return res.status(400).json({ error: err.message });
            }
            if (!req.files || req.files.length === 0) {
                return res.status(400).json({ error: "No image files provided" });
            }
            try {
                const processedImages = await Promise.all(req.files.map(async (file) => {
                    const buffer = await fs.readFile(file.path);
                    const base64 = buffer.toString("base64");
                    const mimeType = file.mimetype;
                    await fs.unlink(file.path);
                    return {
                        name: file.originalname,
                        data: `data:${mimeType};base64,${base64}`,
                        size: file.size,
                        mimeType: mimeType,
                    };
                }));
                res.json({ images: processedImages });
            }
            catch (error) {
                await Promise.all(req.files.map((f) => fs.unlink(f.path).catch(() => { })));
                res.status(500).json({ error: "Failed to process images" });
            }
        });
    }
    catch (error) {
        res.status(500).json({ error: "Internal server error" });
    }
});
app.get("*splat", (req, res) => {
    res.sendFile(path.join(__dirname, "../dist/index.html"));
});
function permToRwx(perm) {
    const r = perm & 4 ? "r" : "-";
    const w = perm & 2 ? "w" : "-";
    const x = perm & 1 ? "x" : "-";
    return r + w + x;
}
async function getFileTree(dirPath, maxDepth = 3, currentDepth = 0, showHidden = true) {
    const items = [];
    try {
        const entries = await fsPromises.readdir(dirPath, { withFileTypes: true });
        for (const entry of entries) {
            if (entry.name === "node_modules" ||
                entry.name === "dist" ||
                entry.name === "build") {
                continue;
            }
            const itemPath = path.join(dirPath, entry.name);
            const item = {
                name: entry.name,
                path: itemPath,
                type: entry.isDirectory() ? "directory" : "file",
            };
            try {
                const stats = await fsPromises.stat(itemPath);
                item.size = stats.size;
                item.modified = stats.mtime.toISOString();
                const mode = stats.mode;
                const ownerPerm = (mode >> 6) & 7;
                const groupPerm = (mode >> 3) & 7;
                const otherPerm = mode & 7;
                item.permissions =
                    ((mode >> 6) & 7).toString() +
                        ((mode >> 3) & 7).toString() +
                        (mode & 7).toString();
                item.permissionsRwx =
                    permToRwx(ownerPerm) + permToRwx(groupPerm) + permToRwx(otherPerm);
            }
            catch (statError) {
                item.size = 0;
                item.modified = null;
                item.permissions = "000";
                item.permissionsRwx = "---------";
            }
            if (entry.isDirectory() && currentDepth < maxDepth) {
                try {
                    await fsPromises.access(item.path, fs.constants.R_OK);
                    item.children = await getFileTree(item.path, maxDepth, currentDepth + 1, showHidden);
                }
                catch (e) {
                    item.children = [];
                }
            }
            items.push(item);
        }
    }
    catch (error) {
        if (error.code !== "EACCES" && error.code !== "EPERM") {
        }
    }
    return items.sort((a, b) => {
        if (a.type !== b.type) {
            return a.type === "directory" ? -1 : 1;
        }
        return a.name.localeCompare(b.name);
    });
}
const PORT = Number(process.env.PORT || 4008);
async function startServer() {
    try {
        await initializeDatabase();
        server.on("error", (error) => {
            if (error) {
                throw error;
            }
        });
        server.listen(PORT, "0.0.0.0", async () => {
            console.log(`easy-llm-cli-ui server running on http://127.0.0.1:${PORT}`);
            await setupProjectsWatcher();
        });
    }
    catch (error) {
        console.error("❌ Failed to start server:", error);
        throw error;
    }
}
async function main(authOptions) {
    const qwenCodeApiServer = spawn(process.execPath, [
        path.join(__dirname, "../../qwen-code-api-server/index.js"),
        "--username",
        String(authOptions.username || ""),
        "--password",
        String(authOptions.password || ""),
        "--document",
        String(authOptions.document || ""),
        "--port",
        String(authOptions.port || ""),
        "--host",
        String(authOptions.host || ""),
    ], {
        stdio: "pipe",
    });
    qwenCodeApiServer.on("error", (error) => {
        console.error(`qwen-code-api-server error: ${error}`);
    });
    qwenCodeApiServer.stdout?.on("data", (data) => {
        console.log(`qwen-code-api-server stdout: ${data}`);
    });
    qwenCodeApiServer.stderr?.on("data", (data) => {
        console.error(`qwen-code-api-server stderr: ${data}`);
    });
    qwenCodeApiServer.on("exit", (code, signal) => {
        console.log(`qwen-code-api-server exit: code ${code}, signal ${signal}`);
        if (code !== 0) {
            process.exit(code);
        }
    });
}
await Promise.all([
    startServer().then(console.log, console.error),
    await main(authOptions).then(console.log, console.error),
]);
//# sourceMappingURL=index.js.map