// Load environment variables from .env file
import fs from "fs";
import path, { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

try {
  const envPath = path.join(__dirname, "../.env");
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
} catch (e) {
  // console.log('No .env file found or error reading it:', e.message);
}

// console.log('PORT from env:', process.env.PORT);

import { spawn } from "child_process";
import cors from "cors";
import express from "express";
import { promises as fsPromises } from "fs";
import http from "http";
import mime from "mime-types";
import fetch from "node-fetch";
import pty, {type IPty } from "node-pty-prebuilt-multiarch";
import WebSocket, { WebSocketServer } from "ws";

import os from "os";
//@ts-ignore
import { initializeDatabase } from "./database/db.js";
//@ts-ignore
import { abortGeminiSession, spawnGemini } from "./gemini-cli.js";
import {
  authenticateToken,
  authenticateWebSocket,
  validateApiKey,
  //@ts-ignore
} from "./middleware/auth.js";
import {
  addProjectManually,
  clearProjectDirectoryCache,
  deleteProject,
  extractProjectDirectory,
  getProjects,
  renameProject,
  //@ts-ignore
} from "./projects.js";
//@ts-ignore
import authRoutes from "./routes/auth.js";
//@ts-ignore
import gitRoutes from "./routes/git.js";
import mcpRoutes from "./routes/mcp.js";
import modelProvidersRoutes from "./routes/model-providers.js";
//@ts-ignore
import sessionManager from "./sessionManager.js";
import { FSWatcher } from "chokidar";
// File system watcher for projects folder
let projectsWatcher :FSWatcher|null= null;
const connectedClients = new Set();

function run(cmd: string, args: readonly string[] | undefined, opts = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, { stdio: "pipe", ...opts });
     //@ts-ignore
    const out = [],
     //@ts-ignore
      err = [];
    //@ts-ignore
    child.stdout?.on("data", (b) => out.push(b));
    //@ts-ignore
    child.stderr?.on("data", (b) => err.push(b));
    child.on("close", (code) =>
      code === 0
     //@ts-ignore
        ? resolve(Buffer.concat(out).toString())
         //@ts-ignore
        : reject(new Error(Buffer.concat(err).toString()))
    );
  });
}
// Setup file system watcher for Gemini projects folder using chokidar
async function setupProjectsWatcher() {
  const chokidar = (await import("chokidar")).default;
  const geminiProjectsPath = path.join(
     //@ts-ignore
    process.env.HOME || os.homedir(),
    ".gemini",
    "projects"
  );

  if (projectsWatcher) {
    //@ts-ignore
    projectsWatcher.close();
  }

  try {
    // Initialize chokidar watcher with optimized settings
    //@ts-ignore
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
      ignoreInitial: true, // Don't fire events for existing files on startup
      followSymlinks: false,
      depth: 10, // Reasonable depth limit
      awaitWriteFinish: {
        stabilityThreshold: 100, // Wait 100ms for file to stabilize
        pollInterval: 50,
      },
    });

    // Debounce function to prevent excessive notifications
    let debounceTimer: string | number | NodeJS.Timeout | undefined;
    const debouncedUpdate = async (eventType: string, filePath: string) => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(async () => {
        try {
          // Clear project directory cache when files change
          clearProjectDirectoryCache();

          // Get updated projects list
          const updatedProjects = await getProjects();

          // Notify all connected clients about the project changes
          const updateMessage = JSON.stringify({
            type: "projects_updated",
            projects: updatedProjects,
            timestamp: new Date().toISOString(),
            changeType: eventType,
            changedFile: path.relative(geminiProjectsPath, filePath),
          });

          connectedClients.forEach((client) => {
            //@ts-ignore
            if (client.readyState === client.OPEN) {
              //@ts-ignore
              client.send(updateMessage);
            }
          });
        } catch (error) {
          // console.error('❌ Error handling project changes:', error);
        }
      }, 300); // 300ms debounce (slightly faster than before)
    };

    // Set up event listeners
    //@ts-ignore
    projectsWatcher
      .on("add", (filePath: any) => debouncedUpdate("add", filePath))
      .on("change", (filePath: any) => debouncedUpdate("change", filePath))
      .on("unlink", (filePath: any) => debouncedUpdate("unlink", filePath))
      .on("addDir", (dirPath: any) => debouncedUpdate("addDir", dirPath))
      .on("unlinkDir", (dirPath: any) => debouncedUpdate("unlinkDir", dirPath))
      .on("error", (error: any) => {
        // console.error('❌ Chokidar watcher error:', error);
      })
      .on("ready", () => {});
  } catch (error) {
    // console.error('❌ Failed to setup projects watcher:', error);
  }
}

const app = express();
const server = http.createServer(app);

// Single WebSocket server that handles both paths
const wss = new WebSocketServer({
  server,
  //@ts-ignore
  verifyClient: (info: {
    req: { url: string | URL; headers: { authorization: string }; user: any };
  }) => {
    // console.log('WebSocket connection attempt to:', info.req.url);

    // Extract token from query parameters or headers
    const url = new URL(info.req.url, "http://localhost");
    const token =
      url.searchParams.get("token") ||
      info.req.headers.authorization?.split(" ")[1];

    // Verify token
    const user = authenticateWebSocket(token);
    if (!user) {
      // console.log('❌ WebSocket authentication failed');
      return false;
    }

    // Store user info in the request for later use
    info.req.user = user;
    // console.log('✅ WebSocket authenticated for user:', user.username);
    return true;
  },
});

app.use(cors());
app.use(express.json());

// Optional API key validation (if configured)
app.use("/api", validateApiKey);

// Authentication routes (public)
app.use("/api/auth", authRoutes);

// Git API Routes (protected)
app.use("/api/git", authenticateToken, gitRoutes);

// MCP API Routes (protected)
app.use("/api/mcp", authenticateToken, mcpRoutes);

// Model Providers API Routes (protected)
app.use("/api/model-providers", authenticateToken, modelProvidersRoutes);

// Static files served after API routes
app.use(express.static(path.join(__dirname, "../dist")));

// API Routes (protected)
app.get("/api/config", authenticateToken, (req, res) => {
  const host = req.headers.host || `${req.hostname}:${PORT}`;
  const protocol =
    req.protocol === "https" || req.get("x-forwarded-proto") === "https"
      ? "wss"
      : "ws";

  // console.log('Config API called - Returning host:', host, 'Protocol:', protocol);

  res.json({
    serverPort: PORT,
    wsUrl: `${protocol}://${host}`,
  });
});

app.get("/api/projects", authenticateToken, async (req, res) => {
  try {
    const projects = await getProjects();
    res.json(projects);
  } catch (error) {
     //@ts-ignore
    res.status(500).json({ error: error.message });
  }
});

app.get(
  "/api/projects/:projectName/sessions",
  authenticateToken,
  async (req, res) => {
    try {
      // Extract the actual project directory path
      const projectPath = await extractProjectDirectory(req.params.projectName);

      // Get sessions from sessionManager
      const sessions = sessionManager.getProjectSessions(projectPath);

      // Apply pagination
      const { limit = 5, offset = 0 } = req.query;
      const paginatedSessions = sessions.slice(
        //@ts-ignore
        parseInt(offset),
        //@ts-ignore
        parseInt(offset) + parseInt(limit)
      );

      res.json({
        sessions: paginatedSessions,
        total: sessions.length,
      });
    } catch (error) {
       //@ts-ignore
      res.status(500).json({ error: error.message });
    }
  }
);

// Get messages for a specific session
app.get(
  "/api/projects/:projectName/sessions/:sessionId/messages",
  authenticateToken,
  async (req, res) => {
    try {
      const {/*  projectName,  */sessionId } = req.params;
      const messages = sessionManager.getSessionMessages(sessionId);
      res.json({ messages });
    } catch (error) {
       //@ts-ignore
      res.status(500).json({ error: error.message });
    }
  }
);

// Rename project endpoint
app.put(
  "/api/projects/:projectName/rename",
  authenticateToken,
  async (req, res) => {
    try {
      const { displayName } = req.body;
      await renameProject(req.params.projectName, displayName);
      res.json({ success: true });
    } catch (error) {
       //@ts-ignore
      res.status(500).json({ error: error.message });
    }
  }
);

// Delete session endpoint
app.delete(
  "/api/projects/:projectName/sessions/:sessionId",
  authenticateToken,
  async (req, res) => {
    try {
      const {/*  projectName, */ sessionId } = req.params;
      await sessionManager.deleteSession(sessionId);
      res.json({ success: true });
    } catch (error) { 
      //@ts-ignore
      res.status(500).json({ error: error.message });
    }
  }
);

// Delete project endpoint (only if empty)
app.delete(
  "/api/projects/:projectName",
  authenticateToken,
  async (req, res) => {
    try {
      const { projectName } = req.params;
      await deleteProject(projectName);
      res.json({ success: true });
    } catch (error) {
       //@ts-ignore
      res.status(500).json({ error: error.message });
    }
  }
);

// Create project endpoint
app.post("/api/projects/create", authenticateToken, async (req, res) => {
  try {
    const { path: projectPath } = req.body;

    if (!projectPath || !projectPath.trim()) {
      return res.status(400).json({ error: "Project path is required" });
    }

    const project = await addProjectManually(projectPath.trim());
    res.json({ success: true, project });
  } catch (error) {
    // console.error('Error creating project:', error);
     //@ts-ignore
    res.status(500).json({ error: error.message });
  }
});

// Read file content endpoint
app.get(
  "/api/projects/:projectName/file",
  authenticateToken,
  async (req, res) => {
    try {
      // const { projectName } = req.params;
      const { filePath } = req.query;

      // console.log('📄 File read request:', projectName, filePath);

      // Using fsPromises from import

      // Security check - ensure the path is safe and absolute
      //@ts-ignore
      if (!filePath || !path.isAbsolute(filePath)) {
        return res.status(400).json({ error: "Invalid file path" });
      }
      //@ts-ignore
      const content = await fsPromises.readFile(filePath, "utf8");
      res.json({ content, path: filePath });
    } catch (error:any) {
      // console.error('Error reading file:', error);
       //@ts-ignore
      if (error.code === "ENOENT") {
        res.status(404).json({ error: "File not found" });
      } else if (error.code === "EACCES") {
        res.status(403).json({ error: "Permission denied" });
      } else {
        res.status(500).json({ error: error.message });
      }
    }
  }
);

// Serve binary file content endpoint (for images, etc.)
app.get(
  "/api/projects/:projectName/files/content",
  authenticateToken,
  async (req, res) => {
    try {
      // const { projectName } = req.params;
      const { path: filePath } = req.query;

      // console.log('🖼️ Binary file serve request:', projectName, filePath);

      // Using fs from import
      // Using mime from import

      // Security check - ensure the path is safe and absolute
      //@ts-ignore
      if (!filePath || !path.isAbsolute(filePath)) {
        return res.status(400).json({ error: "Invalid file path" });
      }

      // Check if file exists
      try {
        //@ts-ignore
        await fsPromises.access(filePath);
      } catch (error) {
        return res.status(404).json({ error: "File not found" });
      }

      // Get file extension and set appropriate content type
      //@ts-ignore
      const mimeType = mime.lookup(filePath) || "application/octet-stream";
      res.setHeader("Content-Type", mimeType);

      // Stream the file
      //@ts-ignore
      const fileStream = fs.createReadStream(filePath);
      fileStream.pipe(res);

      fileStream.on("error", (error) => {
        // console.error('Error streaming file:', error);
        if (!res.headersSent) {
          res.status(500).json({ error: "Error reading file" });
        }
      });
    } catch (error:any) {
      // console.error('Error serving binary file:', error);
      if (!res.headersSent) {
        res.status(500).json({ error: error.message });
      }
    }
  }
);

// Save file content endpoint
app.put(
  "/api/projects/:projectName/file",
  authenticateToken,
  async (req, res) => {
    try {
      // const { projectName } = req.params;
      const { filePath, content } = req.body;

      // console.log('💾 File save request:', projectName, filePath);

      // Using fsPromises from import

      // Security check - ensure the path is safe and absolute
      if (!filePath || !path.isAbsolute(filePath)) {
        return res.status(400).json({ error: "Invalid file path" });
      }

      if (content === undefined) {
        return res.status(400).json({ error: "Content is required" });
      }

      // Create backup of original file
      try {
        const backupPath = filePath + ".backup." + Date.now();
        await fsPromises.copyFile(filePath, backupPath);
        // console.log('📋 Created backup:', backupPath);
      } catch (backupError) {
        // console.warn('Could not create backup:', backupError.message);
      }

      // Write the new content
      await fsPromises.writeFile(filePath, content, "utf8");

      res.json({
        success: true,
        path: filePath,
        message: "File saved successfully",
      });
    } catch (error) {
      // console.error('Error saving file:', error);
      //@ts-ignore
      if (error.code === "ENOENT") {
        res.status(404).json({ error: "File or directory not found" });
        //@ts-ignore
      } else if (error.code === "EACCES") {
        res.status(403).json({ error: "Permission denied" });
      } else {
        //@ts-ignore
        res.status(500).json({ error: error.message });
      }
    }
  }
);

app.get(
  "/api/projects/:projectName/files",
  authenticateToken,
  async (req, res) => {
    try {
      // Using fsPromises from import

      // Use extractProjectDirectory to get the actual project path
      let actualPath: fs.PathLike;
      try {
        actualPath = await extractProjectDirectory(req.params.projectName);
      } catch (error) {
        // console.error('Error extracting project directory:', error);
        // Fallback to simple dash replacement
        actualPath = req.params.projectName.replace(/-/g, "/");
      }

      // Check if path exists
      try {
        await fsPromises.access(actualPath);
      } catch (e) {
        return res.status(404).json({
          error: `Project path not found: ${actualPath}`,
        });
      }
      //@ts-ignore
      const files = await getFileTree(actualPath, 3, 0, true);
      //@ts-ignore
      const hiddenFiles = files.filter((f) => f.name.startsWith("."));
      res.json(files);
    } catch (error) {
      // console.error('❌ File tree error:', error.message);
      //@ts-ignore
      res.status(500).json({ error: error.message });
    }
  }
);

// WebSocket connection handler that routes based on URL path
wss.on("connection", (ws: WebSocket, request: { url: any }) => {
  const url = request.url;
  // console.log('🔗 Client connected to:', url);

  // Parse URL to get pathname without query parameters
  const urlObj = new URL(url, "http://localhost");
  const pathname = urlObj.pathname;

  if (pathname === "/shell") {
    //@ts-ignore
    handleShellConnection(ws);
  } else if (pathname === "/ws") {
    handleChatConnection(ws);
  } else {
    // console.log('❌ Unknown WebSocket path:', pathname);
    ws.close();
  }
});

// Handle chat WebSocket connections
function handleChatConnection(ws: WebSocket) {
  // console.log('💬 Chat WebSocket connected');

  // Add to connected clients for project updates
  connectedClients.add(ws);
  //@ts-ignore
  ws.on("message", async (message: string) => {
    try {
      const data = JSON.parse(message);

      if (data.type === "gemini-command") {
        // console.log('💬 User message:', data.command || '[Continue/Resume]');
        // console.log('📁 Project:', data.options?.projectPath || 'Unknown');
        // console.log('🔄 Session:', data.options?.sessionId ? 'Resume' : 'New');
        await spawnGemini(data.command, data.options, ws);
      } else if (data.type === "abort-session") {
        // console.log('🛑 Abort session request:', data.sessionId);
        const success = abortGeminiSession(data.sessionId);
        //@ts-ignore
        ws.send(
          JSON.stringify({
            type: "session-aborted",
            sessionId: data.sessionId,
            success,
          })
        );
      }
    } catch (error) {
      // console.error('❌ Chat WebSocket error:', error.message);
      //@ts-ignore
      ws.send(
        JSON.stringify({
          type: "error",
          //@ts-ignore
          error: error.message,
        })
      );
    }
  });

  ws.on("close", () => {
    // console.log('🔌 Chat client disconnected');
    // Remove from connected clients
    connectedClients.delete(ws);
  });
}

// Handle shell WebSocket connections
function handleShellConnection(ws: WebSocket) {
  // console.log('🐚 Shell client connected');
  let shellProcess :null|IPty= null;

  ws.on("message", async (message: string) => {
    try {
      const data = JSON.parse(message);
      // console.log('📨 Shell message received:', data.type);

      if (data.type === "init") {
        // Initialize shell with project path and session info
        const projectPath = data.projectPath || process.cwd();
        const sessionId = data.sessionId;
        const hasSession = data.hasSession;

        // First send a welcome message
        const welcomeMsg = hasSession
          ? `\x1b[36mResuming Gemini session ${sessionId} in: ${projectPath}\x1b[0m\r\n`
          : `\x1b[36mStarting new Gemini session in: ${projectPath}\x1b[0m\r\n`;

        ws.send(
          JSON.stringify({
            type: "output",
            data: welcomeMsg,
          })
        );

        try {
          // Get gemini command from environment or use default
          //@ts-ignore
          const geminiPath = process.env.GEMINI_PATH || "gemini";
          const cmd =
            process.platform === "win32"
              ? "cmd"
              //@ts-ignore
              : process.env.GEMINI_PATH || `which ${geminiPath}`;
          // First check if gemini CLI is available
          try {
            const cmd =
              process.platform === "win32"
                ? "cmd"
                //@ts-ignore
                : process.env.GEMINI_PATH || `which ${geminiPath}`;
            const args = [] as string[];
            if (process.platform === "win32") {
              args.push("/c");
              //@ts-ignore
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
          } catch (error) {
            console.error(error);
            const args = [] as string[];
            if (process.platform === "win32") {
              args.push("/c");
              //@ts-ignore
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
            //@ts-ignore
            console.error("GEMINI_PATH:", process.env.GEMINI_PATH || "gemini");
            ws.send(
              JSON.stringify({
                type: "output",
                data: `\r\n\x1b[31mError: Gemini CLI not found. Please check:\x1b[0m\r\n\x1b[33m1. Install gemini globally: npm install -g @google/gemini-cli\x1b[0m\r\n\x1b[33m2. Or set GEMINI_PATH in .env file\x1b[0m\r\n`,
              })
            );
            return;
          }

          // Build shell command that changes to project directory first, then runs gemini
          let geminiCommand = geminiPath;

          if (hasSession && sessionId) {
            // Try to resume session, but with fallback to new session if it fails
            geminiCommand = `${geminiPath} --resume ${sessionId} || ${geminiPath}`;
          }

          // Create shell command that cds to the project directory first
          const shellCommand = `cd "${projectPath}" && ${geminiCommand}`;

          // Detect operating system and use appropriate shell
          const isWindows = process.platform === "win32";
          const shell = isWindows ? "cmd.exe" : "bash";
          const shellArgs = isWindows
            ? ["/c", shellCommand]
            : ["-c", shellCommand];
          const homeDir = isWindows
          //@ts-ignore
            ? process.env.USERPROFILE
            //@ts-ignore
            : process.env.HOME || "/";

          // Start shell using PTY for proper terminal emulation
          shellProcess = pty.spawn(shell, shellArgs, {
            name: "xterm-256color",
            cols: 80,
            rows: 24,
            cwd: homeDir, // Start from home directory
            env: {
              ...process.env,
              TERM: "xterm-256color",
              COLORTERM: "truecolor",
              FORCE_COLOR: "3",
              // Override browser opening commands to echo URL for detection
              BROWSER: isWindows ? "echo OPEN_URL:" : 'echo "OPEN_URL:"',
            },
          });

          // console.log('🟢 Shell process started with PTY, PID:', shellProcess.pid);

          // Handle data output
          shellProcess.onData((data: string) => {
            if (ws.readyState === ws.OPEN) {
              let outputData = data;

              // Check for various URL opening patterns
              const patterns = [
                // Direct browser opening commands
                /(?:xdg-open|open|start)\s+(https?:\/\/[^\s\x1b\x07]+)/g,
                // BROWSER environment variable override
                /OPEN_URL:\s*(https?:\/\/[^\s\x1b\x07]+)/g,
                // Git and other tools opening URLs
                /Opening\s+(https?:\/\/[^\s\x1b\x07]+)/gi,
                // General URL patterns that might be opened
                /Visit:\s*(https?:\/\/[^\s\x1b\x07]+)/gi,
                /View at:\s*(https?:\/\/[^\s\x1b\x07]+)/gi,
                /Browse to:\s*(https?:\/\/[^\s\x1b\x07]+)/gi,
              ];

              patterns.forEach((pattern) => {
                let match: any[] | null;
                while ((match = pattern.exec(data)) !== null) {
                  const url = match[1];
                  // console.log('🔗 Detected URL for opening:', url);

                  // Send URL opening message to client
                  ws.send(
                    JSON.stringify({
                      type: "url_open",
                      url: url,
                    })
                  );

                  // Replace the OPEN_URL pattern with a user-friendly message
                  if (pattern.source.includes("OPEN_URL")) {
                    outputData = outputData.replace(
                      match[0],
                      `🌐 Opening in browser: ${url}`
                    );
                  }
                }
              });

              // Send regular output
              ws.send(
                JSON.stringify({
                  type: "output",
                  data: outputData,
                })
              );
            }
          });

          // Handle process exit
          //@ts-ignore
          shellProcess.onExit((exitCode: { exitCode: any; signal: any }) => {
            // console.log('🔚 Shell process exited with code:', exitCode.exitCode, 'signal:', exitCode.signal);
            if (ws.readyState === ws.OPEN) {
              ws.send(
                JSON.stringify({
                  type: "output",
                  data: `\r\n\x1b[33mProcess exited with code ${
                    exitCode.exitCode
                  }${
                    exitCode.signal ? ` (${exitCode.signal})` : ""
                  }\x1b[0m\r\n`,
                })
              );
            }
            shellProcess = null;
          });
        } catch (spawnError) {
          console.error("❌ Error spawning process:", spawnError);
          ws.send(
            JSON.stringify({
              type: "output",

              //@ts-ignore
              data: `\r\n\x1b[31mError: ${spawnError.message}\x1b[0m\r\n`,
            })
          );
        }
      } else if (data.type === "input") {
        // Send input to shell process
        if (shellProcess && shellProcess.write) {
          try {
            shellProcess.write(data.data);
          } catch (error) {
            // console.error('Error writing to shell:', error);
          }
        } else {
          // console.warn('No active shell process to send input to');
        }
      } else if (data.type === "resize") {
        // Handle terminal resize
        if (shellProcess && shellProcess.resize) {
          // console.log('Terminal resize requested:', data.cols, 'x', data.rows);
          shellProcess.resize(data.cols, data.rows);
        }
      }
    } catch (error) {
      // console.error('❌ Shell WebSocket error:', error.message);
      if (ws.readyState === ws.OPEN) {
        ws.send(
          JSON.stringify({
            type: "output",
            //@ts-ignore
            data: `\r\n\x1b[31mError: ${error.message}\x1b[0m\r\n`,
          })
        );
      }
    }
  });
  //@ts-ignore
  ws.on("close", () => {
    // console.log('🔌 Shell client disconnected');
    //@ts-ignore
    if (shellProcess && shellProcess.kill) {
      // console.log('🔴 Killing shell process:', shellProcess.pid);
      //@ts-ignore
      shellProcess.kill();
    }
  });
  //@ts-ignore
  ws.on("error", (error: any) => {
    // console.error('❌ Shell WebSocket error:', error);
  });
}
// Audio transcription endpoint
app.post("/api/transcribe", authenticateToken, async (req, res) => {
  try {
    const multer = (await import("multer")).default;
    const upload = multer({ storage: multer.memoryStorage() });

    // Handle multipart form data
    upload.single("audio")(req, res, async (err: any) => {
      if (err) {
        return res.status(400).json({ error: "Failed to process audio file" });
      }

      if (!req.file) {
        return res.status(400).json({ error: "No audio file provided" });
      }
      //@ts-ignore
      const apiKey = process.env.OPENAI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({
          error:
            "OpenAI API key not configured. Please set OPENAI_API_KEY in server environment.",
        });
      }

      try {
        // Create form data for OpenAI
        const FormData = (await import("form-data")).default;
        const formData = new FormData();
        formData.append("file", req.file.buffer, {
          filename: req.file.originalname,
          contentType: req.file.mimetype,
        });
        formData.append("model", "whisper-1");
        formData.append("response_format", "json");
        formData.append("language", "en");
        //@ts-ignore
        const OPENAI_BASE_URL = process.env.OPENAI_BASE_URL;
        // Make request to OpenAI
        const response = await fetch(
          (
            (OPENAI_BASE_URL ?? "https://api.openai.com/v1/") +
            "/audio/transcriptions"
          ).replaceAll("//", "/"),
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${apiKey}`,
              ...formData.getHeaders(),
            },
            body: formData,
          }
        );

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.error?.message || `Whisper API error: ${response.status}`
          );
        }

        const data = await response.json();
        let transcribedText = data.text || "";

        // Check if enhancement mode is enabled
        const mode = req.body.mode || "default";

        // If no transcribed text, return empty
        if (!transcribedText) {
          return res.json({ text: "" });
        }

        // If default mode, return transcribed text without enhancement
        if (mode === "default") {
          return res.json({ text: transcribedText });
        }

        // Handle different enhancement modes
        try {
          //@ts-ignore
          const OpenAI = (await import("openai")).default;
          const openai = new OpenAI({ apiKey });

          let prompt: string,
            systemMessage: string,
            temperature = 0.7,
            maxTokens = 800;

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
              temperature = 0.5; // Lower temperature for more controlled output
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
              // No enhancement needed
              break;
          }

          // Only make GPT call if we have a prompt
          //@ts-ignore
          if (prompt) {
            const completion = await openai.chat.completions.create({
              model: "gpt-4o-mini",
              messages: [
                //@ts-ignore
                { role: "system", content: systemMessage },
                { role: "user", content: prompt },
              ],
              temperature: temperature,
              max_tokens: maxTokens,
            });

            transcribedText =
              //@ts-ignore
              completion.choices[0].message.content || transcribedText;
          }
        } catch (gptError) {
          // console.error('GPT processing error:', gptError);
          // Fall back to original transcription if GPT fails
        }

        res.json({ text: transcribedText });
      } catch (error) {
        // console.error('Transcription error:', error);
        //@ts-ignore
        res.status(500).json({ error: error.message });
      }
    });
  } catch (error) {
    // console.error('Endpoint error:', error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Image upload endpoint
app.post(
  "/api/projects/:projectName/upload-images",
  authenticateToken,
  async (req, res) => {
    try {
      const multer = (await import("multer")).default;
      const path = (await import("path")).default;
      const fs = (await import("fs")).promises;
      const os = (await import("os")).default;

      // Configure multer for image uploads
      const storage = multer.diskStorage({
        //@ts-ignore
        destination: async (
          req: { user: { id: any } },
          file: any,
          cb: (arg0: null, arg1: string) => void
        ) => {
          const uploadDir = path.join(
            os.tmpdir(),
            "gemini-ui-uploads",
            String(req.user.id)
          );
          await fs.mkdir(uploadDir, { recursive: true });
          cb(null, uploadDir);
        },
        filename: (
          req: any,
          file: { originalname: string },
          cb: (arg0: null, arg1: string) => void
        ) => {
          const uniqueSuffix =
            Date.now() + "-" + Math.round(Math.random() * 1e9);
          const sanitizedName = file.originalname.replace(
            /[^a-zA-Z0-9.-]/g,
            "_"
          );
          cb(null, uniqueSuffix + "-" + sanitizedName);
        },
      });

      const fileFilter = (
        req: any,
        file: { mimetype: string },
        cb: (arg0: Error | null, arg1: boolean | undefined) => void
      ) => {
        const allowedMimes = [
          "image/jpeg",
          "image/png",
          "image/gif",
          "image/webp",
          "image/svg+xml",
        ];
        if (allowedMimes.includes(file.mimetype)) {
          cb(null, true);
        } else {
          //@ts-ignore
          cb(
            new Error(
              "Invalid file type. Only JPEG, PNG, GIF, WebP, and SVG are allowed."
            )
          );
        }
      };

      const upload = multer({
        storage,
        //@ts-ignore
        fileFilter,
        limits: {
          fileSize: 5 * 1024 * 1024, // 5MB
          files: 5,
        },
      });

      // Handle multipart form data
      //@ts-ignore
      upload.array("images", 5)(req, res, async (err: { message: any }) => {
        if (err) {
          return res.status(400).json({ error: err.message });
        }
        //@ts-ignore
        if (!req.files || req.files.length === 0) {
          return res.status(400).json({ error: "No image files provided" });
        }

        try {
          // Process uploaded images
          const processedImages = await Promise.all(
            //@ts-ignore
            req.files.map(
              async (file: {
                path: string;
                mimetype: any;
                originalname: any;
                size: any;
              }) => {
                // Read file and convert to base64
                const buffer = await fs.readFile(file.path);
                const base64 = buffer.toString("base64");
                const mimeType = file.mimetype;

                // Clean up temp file immediately
                //@ts-ignore
                await fs.unlink(file.path);

                return {
                  name: file.originalname,
                  data: `data:${mimeType};base64,${base64}`,
                  size: file.size,
                  mimeType: mimeType,
                };
              }
            )
          );

          res.json({ images: processedImages });
        } catch (error) {
          // console.error('Error processing images:', error);
          // Clean up any remaining files
          await Promise.all(
            //@ts-ignore
            req.files.map((f: { path: fs.PathLike }) =>
              fs.unlink(f.path).catch(() => {})
            )
          );
          res.status(500).json({ error: "Failed to process images" });
        }
      });
    } catch (error) {
      // console.error('Error in image upload endpoint:', error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// Serve React app for all other routes
app.get("*splat", (req, res) => {
  res.sendFile(path.join(__dirname, "../dist/index.html"));
});

// Helper function to convert permissions to rwx format
function permToRwx(perm: number) {
  const r = perm & 4 ? "r" : "-";
  const w = perm & 2 ? "w" : "-";
  const x = perm & 1 ? "x" : "-";
  return r + w + x;
}

async function getFileTree(
  dirPath: string,
  maxDepth = 3,
  currentDepth = 0,
  showHidden = true
) {
  // Using fsPromises from import
  const items = [];

  try {
    const entries = await fsPromises.readdir(dirPath, { withFileTypes: true });

    for (const entry of entries) {
      // Debug: log all entries including hidden files

      // Skip only heavy build directories
      if (
        entry.name === "node_modules" ||
        entry.name === "dist" ||
        entry.name === "build"
      ) {
        continue;
      }

      const itemPath = path.join(dirPath, entry.name);
      const item = {
        name: entry.name,
        path: itemPath,
        type: entry.isDirectory() ? "directory" : "file",
      };

      // Get file stats for additional metadata
      try {
        const stats = await fsPromises.stat(itemPath);
        //@ts-ignore
        item.size = stats.size;
        //@ts-ignore
        item.modified = stats.mtime.toISOString();

        // Convert permissions to rwx format
        const mode = stats.mode;
        const ownerPerm = (mode >> 6) & 7;
        const groupPerm = (mode >> 3) & 7;
        const otherPerm = mode & 7;
        //@ts-ignore
        item.permissions =
          ((mode >> 6) & 7).toString() +
          ((mode >> 3) & 7).toString() +
          (mode & 7).toString();
        //@ts-ignore
        item.permissionsRwx =
          permToRwx(ownerPerm) + permToRwx(groupPerm) + permToRwx(otherPerm);
      } catch (statError) {
        // If stat fails, provide default values
        //@ts-ignore
        item.size = 0;
        //@ts-ignore
        item.modified = null;
        //@ts-ignore
        item.permissions = "000";
        //@ts-ignore
        item.permissionsRwx = "---------";
      }

      if (entry.isDirectory() && currentDepth < maxDepth) {
        // Recursively get subdirectories but limit depth
        try {
          // Check if we can access the directory before trying to read it
          await fsPromises.access(item.path, fs.constants.R_OK);
          //@ts-ignore
          item.children = await getFileTree(
            item.path,
            maxDepth,
            currentDepth + 1,
            showHidden
          );
        } catch (e) {
          // Silently skip directories we can't access (permission denied, etc.)
          //@ts-ignore
          item.children = [];
        }
      }
      //@ts-ignore
      items.push(item);
    }
  } catch (error) {
    // Only log non-permission errors to avoid spam
    //@ts-ignore
    if (error.code !== "EACCES" && error.code !== "EPERM") {
      // console.error('Error reading directory:', error);
    }
  }

  return items.sort((a, b) => {
    //@ts-ignore
    if (a.type !== b.type) {
      //@ts-ignore
      return a.type === "directory" ? -1 : 1;
    }
    //@ts-ignore
    return a.name.localeCompare(b.name);
  });
}
//@ts-ignore
const PORT = Number(process.env.PORT || 4008);

// Initialize database and start server
async function startServer() {
  try {
    // Initialize authentication database
    await initializeDatabase();
    // console.log('✅ Database initialization skipped (testing)');
    server.on("error", (error) => {
      if (error) {
        throw error; // e.g. EADDRINUSE
      }
    });
    server.listen(PORT, "0.0.0.0", async () => {
      console.log(`easy-llm-cli-ui server running on http://0.0.0.0:${PORT}`);

      // Start watching the projects folder for changes
      await setupProjectsWatcher(); // Re-enabled with better-sqlite3
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
}

startServer();
