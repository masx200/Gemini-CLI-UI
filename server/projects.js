import fsSync, { promises as fs } from "fs";
import os from "os";
import path from "path";
import readline from "readline";
const projectDirectoryCache = new Map();
let cacheTimestamp = Date.now();
function clearProjectDirectoryCache() {
    projectDirectoryCache.clear();
    cacheTimestamp = Date.now();
}
async function loadProjectConfig() {
    const configPath = path.join(process.env.HOME || os.homedir(), ".qwen", "project-config.json");
    try {
        const configData = await fs.readFile(configPath, "utf8");
        return JSON.parse(configData);
    }
    catch (error) {
        return {};
    }
}
async function saveProjectConfig(config) {
    const configPath = path.join(process.env.HOME || os.homedir(), ".qwen", "project-config.json");
    await fs.writeFile(configPath, JSON.stringify(config, null, 2), "utf8");
}
async function generateDisplayName(projectName, actualProjectDir = null) {
    let projectPath = actualProjectDir || projectName.replace(/-/g, "/");
    try {
        const packageJsonPath = path.join(projectPath, "package.json");
        const packageData = await fs.readFile(packageJsonPath, "utf8");
        const packageJson = JSON.parse(packageData);
        if (packageJson.name) {
            return packageJson.name;
        }
    }
    catch (error) {
    }
    if (projectPath.startsWith("/")) {
        const parts = projectPath.split("/").filter(Boolean);
        if (parts.length > 3) {
            return `.../${parts.slice(-2).join("/")}`;
        }
        else {
            return projectPath;
        }
    }
    return projectPath;
}
async function extractProjectDirectory(projectName) {
    if (projectDirectoryCache.has(projectName)) {
        return projectDirectoryCache.get(projectName);
    }
    const projectDir = path.join(process.env.HOME || os.homedir(), ".qwen", "projects", projectName);
    const cwdCounts = new Map();
    let latestTimestamp = 0;
    let latestCwd = null;
    let extractedPath;
    try {
        const files = await fs.readdir(projectDir);
        const jsonlFiles = files.filter((file) => file.endsWith(".jsonl"));
        if (jsonlFiles.length === 0) {
            try {
                let base64Name = projectName.replace(/_/g, "+").replace(/-/g, "/");
                if (base64Name.endsWith("++")) {
                    base64Name = base64Name.slice(0, -2) + "==";
                }
                extractedPath = Buffer.from(base64Name, "base64").toString("utf8");
                extractedPath = extractedPath.replace(/[^\x20-\x7E]/g, "").trim();
            }
            catch (e) {
                extractedPath = projectName.replace(/-/g, "/");
            }
        }
        else {
            for (const file of jsonlFiles) {
                const jsonlFile = path.join(projectDir, file);
                const fileStream = fsSync.createReadStream(jsonlFile);
                const rl = readline.createInterface({
                    input: fileStream,
                    crlfDelay: Infinity,
                });
                for await (const line of rl) {
                    if (line.trim()) {
                        try {
                            const entry = JSON.parse(line);
                            if (entry.cwd) {
                                cwdCounts.set(entry.cwd, (cwdCounts.get(entry.cwd) || 0) + 1);
                                const timestamp = new Date(entry.timestamp || 0).getTime();
                                if (timestamp > latestTimestamp) {
                                    latestTimestamp = timestamp;
                                    latestCwd = entry.cwd;
                                }
                            }
                        }
                        catch (parseError) {
                        }
                    }
                }
            }
            if (cwdCounts.size === 0) {
                extractedPath = projectName.replace(/-/g, "/");
            }
            else if (cwdCounts.size === 1) {
                extractedPath = Array.from(cwdCounts.keys())[0];
            }
            else {
                const mostRecentCount = cwdCounts.get(latestCwd) || 0;
                const maxCount = Math.max(...cwdCounts.values());
                if (mostRecentCount >= maxCount * 0.25) {
                    extractedPath = latestCwd;
                }
                else {
                    for (const [cwd, count] of cwdCounts.entries()) {
                        if (count === maxCount) {
                            extractedPath = cwd;
                            break;
                        }
                    }
                }
                if (!extractedPath) {
                    try {
                        extractedPath =
                            latestCwd ||
                                Buffer.from(projectName.replace(/_/g, "+").replace(/-/g, "/"), "base64").toString("utf8");
                    }
                    catch (e) {
                        extractedPath = latestCwd || projectName.replace(/-/g, "/");
                    }
                }
            }
        }
        extractedPath = extractedPath.replace(/[^\x20-\x7E]/g, "").trim();
        projectDirectoryCache.set(projectName, extractedPath);
        return extractedPath;
    }
    catch (error) {
        try {
            let base64Name = projectName.replace(/_/g, "+").replace(/-/g, "/");
            if (base64Name.endsWith("++")) {
                base64Name = base64Name.slice(0, -2) + "==";
            }
            extractedPath = Buffer.from(base64Name, "base64").toString("utf8");
            extractedPath = extractedPath.replace(/[^\x20-\x7E]/g, "").trim();
        }
        catch (e) {
            extractedPath = projectName.replace(/-/g, "/");
        }
        projectDirectoryCache.set(projectName, extractedPath);
        return extractedPath;
    }
}
async function getProjects() {
    const qwenDir = path.join(process.env.HOME || os.homedir(), ".qwen", "projects");
    const config = await loadProjectConfig();
    const projects = [];
    const existingProjects = new Set();
    try {
        const entries = await fs.readdir(qwenDir, { withFileTypes: true });
        for (const entry of entries) {
            if (entry.isDirectory()) {
                existingProjects.add(entry.name);
                const actualProjectDir = await extractProjectDirectory(entry.name);
                const customName = config[entry.name]?.displayName;
                const autoDisplayName = await generateDisplayName(entry.name, actualProjectDir);
                const fullPath = actualProjectDir;
                const project = {
                    name: entry.name,
                    path: actualProjectDir,
                    displayName: customName || autoDisplayName,
                    fullPath: fullPath,
                    isCustomName: !!customName,
                    sessions: [],
                };
                try {
                    const sessionManager = (await import("./sessionManager.js")).default;
                    const allSessions = sessionManager.getProjectSessions(actualProjectDir);
                    const paginatedSessions = allSessions.slice(0, 5);
                    project.sessions = paginatedSessions;
                    project.sessionMeta = {
                        hasMore: allSessions.length > 5,
                        total: allSessions.length,
                    };
                }
                catch (e) {
                }
                projects.push(project);
            }
        }
    }
    catch (error) {
    }
    for (const [projectName, projectConfig] of Object.entries(config)) {
        if (!existingProjects.has(projectName) && projectConfig.manuallyAdded) {
            let actualProjectDir = projectConfig.originalPath;
            if (!actualProjectDir) {
                try {
                    actualProjectDir = await extractProjectDirectory(projectName);
                }
                catch (error) {
                    actualProjectDir = projectName.replace(/-/g, "/");
                }
            }
            const project = {
                name: projectName,
                path: actualProjectDir,
                displayName: projectConfig.displayName ||
                    (await generateDisplayName(projectName, actualProjectDir)),
                fullPath: actualProjectDir,
                isCustomName: !!projectConfig.displayName,
                isManuallyAdded: true,
                sessions: [],
            };
            projects.push(project);
        }
    }
    return projects;
}
async function getSessions(projectName, limit = 5, offset = 0) {
    const projectDir = path.join(process.env.HOME || os.homedir(), ".qwen", "projects", projectName);
    try {
        const files = await fs.readdir(projectDir);
        const jsonlFiles = files.filter((file) => file.endsWith(".jsonl"));
        if (jsonlFiles.length === 0) {
            return { sessions: [], hasMore: false, total: 0 };
        }
        const filesWithStats = await Promise.all(jsonlFiles.map(async (file) => {
            const filePath = path.join(projectDir, file);
            const stats = await fs.stat(filePath);
            return { file, mtime: stats.mtime };
        }));
        filesWithStats.sort((a, b) => b.mtime - a.mtime);
        const allSessions = new Map();
        let processedCount = 0;
        for (const { file } of filesWithStats) {
            const jsonlFile = path.join(projectDir, file);
            const sessions = await parseJsonlSessions(jsonlFile);
            sessions.forEach((session) => {
                if (!allSessions.has(session.id)) {
                    allSessions.set(session.id, session);
                }
            });
            processedCount++;
            if (allSessions.size >= (limit + offset) * 2 &&
                processedCount >= Math.min(3, filesWithStats.length)) {
                break;
            }
        }
        const sortedSessions = Array.from(allSessions.values()).sort((a, b) => new Date(b.lastActivity) - new Date(a.lastActivity));
        const total = sortedSessions.length;
        const paginatedSessions = sortedSessions.slice(offset, offset + limit);
        const hasMore = offset + limit < total;
        return {
            sessions: paginatedSessions,
            hasMore,
            total,
            offset,
            limit,
        };
    }
    catch (error) {
        return { sessions: [], hasMore: false, total: 0 };
    }
}
async function parseJsonlSessions(filePath) {
    const sessions = new Map();
    try {
        const fileStream = fsSync.createReadStream(filePath);
        const rl = readline.createInterface({
            input: fileStream,
            crlfDelay: Infinity,
        });
        let lineCount = 0;
        for await (const line of rl) {
            if (line.trim()) {
                lineCount++;
                try {
                    const entry = JSON.parse(line);
                    if (entry.sessionId) {
                        if (!sessions.has(entry.sessionId)) {
                            sessions.set(entry.sessionId, {
                                id: entry.sessionId,
                                summary: "New Session",
                                messageCount: 0,
                                lastActivity: new Date(),
                                cwd: entry.cwd || "",
                            });
                        }
                        const session = sessions.get(entry.sessionId);
                        if (entry.type === "summary" && entry.summary) {
                            session.summary = entry.summary;
                        }
                        else if (entry.message?.role === "user" &&
                            entry.message?.content &&
                            session.summary === "New Session") {
                            const content = entry.message.content;
                            if (typeof content === "string" && content.length > 0) {
                                if (!content.startsWith("<command-name>")) {
                                    session.summary =
                                        content.length > 50
                                            ? content.substring(0, 50) + "..."
                                            : content;
                                }
                            }
                        }
                        session.messageCount = (session.messageCount || 0) + 1;
                        if (entry.timestamp) {
                            session.lastActivity = new Date(entry.timestamp);
                        }
                    }
                }
                catch (parseError) {
                }
            }
        }
    }
    catch (error) {
    }
    return Array.from(sessions.values()).sort((a, b) => new Date(b.lastActivity) - new Date(a.lastActivity));
}
async function getSessionMessages(projectName, sessionId) {
    const projectDir = path.join(process.env.HOME || os.homedir(), ".qwen", "projects", projectName);
    try {
        const files = await fs.readdir(projectDir);
        const jsonlFiles = files.filter((file) => file.endsWith(".jsonl"));
        if (jsonlFiles.length === 0) {
            return [];
        }
        const messages = [];
        for (const file of jsonlFiles) {
            const jsonlFile = path.join(projectDir, file);
            const fileStream = fsSync.createReadStream(jsonlFile);
            const rl = readline.createInterface({
                input: fileStream,
                crlfDelay: Infinity,
            });
            for await (const line of rl) {
                if (line.trim()) {
                    try {
                        const entry = JSON.parse(line);
                        if (entry.sessionId === sessionId) {
                            messages.push(entry);
                        }
                    }
                    catch (parseError) {
                    }
                }
            }
        }
        return messages.sort((a, b) => new Date(a.timestamp || 0) - new Date(b.timestamp || 0));
    }
    catch (error) {
        return [];
    }
}
async function renameProject(projectName, newDisplayName) {
    const config = await loadProjectConfig();
    if (!newDisplayName || newDisplayName.trim() === "") {
        delete config[projectName];
    }
    else {
        config[projectName] = {
            displayName: newDisplayName.trim(),
        };
    }
    await saveProjectConfig(config);
    return true;
}
async function deleteSession(projectName, sessionId) {
    const projectDir = path.join(process.env.HOME || os.homedir(), ".qwen", "projects", projectName);
    try {
        const files = await fs.readdir(projectDir);
        const jsonlFiles = files.filter((file) => file.endsWith(".jsonl"));
        if (jsonlFiles.length === 0) {
            throw new Error("No session files found for this project");
        }
        for (const file of jsonlFiles) {
            const jsonlFile = path.join(projectDir, file);
            const content = await fs.readFile(jsonlFile, "utf8");
            const lines = content.split("\n").filter((line) => line.trim());
            const hasSession = lines.some((line) => {
                try {
                    const data = JSON.parse(line);
                    return data.sessionId === sessionId;
                }
                catch {
                    return false;
                }
            });
            if (hasSession) {
                const filteredLines = lines.filter((line) => {
                    try {
                        const data = JSON.parse(line);
                        return data.sessionId !== sessionId;
                    }
                    catch {
                        return true;
                    }
                });
                await fs.writeFile(jsonlFile, filteredLines.join("\n") + (filteredLines.length > 0 ? "\n" : ""));
                return true;
            }
        }
        throw new Error(`Session ${sessionId} not found in any files`);
    }
    catch (error) {
        throw error;
    }
}
async function isProjectEmpty(projectName) {
    try {
        const sessionsResult = await getSessions(projectName, 1, 0);
        return sessionsResult.total === 0;
    }
    catch (error) {
        return false;
    }
}
async function deleteProject(projectName) {
    const projectDir = path.join(process.env.HOME || os.homedir(), ".qwen", "projects", projectName);
    try {
        const isEmpty = await isProjectEmpty(projectName);
        if (!isEmpty) {
            throw new Error("Cannot delete project with existing sessions");
        }
        await fs.rm(projectDir, { recursive: true, force: true });
        const config = await loadProjectConfig();
        delete config[projectName];
        await saveProjectConfig(config);
        return true;
    }
    catch (error) {
        throw error;
    }
}
async function addProjectManually(projectPath, displayName = null) {
    const absolutePath = path.resolve(projectPath);
    try {
        await fs.mkdir(absolutePath, { recursive: true });
        await fs.access(absolutePath);
    }
    catch (error) {
        throw new Error(`Path does not exist: ${absolutePath}` + "\n" + String(error));
    }
    const projectName = Buffer.from(absolutePath)
        .toString("base64")
        .replace(/[/+=]/g, "_");
    const config = await loadProjectConfig();
    const projectDir = path.join(process.env.HOME || os.homedir(), ".qwen", "projects", projectName);
    try {
        await fs.access(projectDir);
        throw new Error(`Project already exists for path: ${absolutePath}`);
    }
    catch (error) {
        if (error.code !== "ENOENT") {
            throw error;
        }
    }
    if (config[projectName]) {
        throw new Error(`Project already configured for path: ${absolutePath}`);
    }
    config[projectName] = {
        manuallyAdded: true,
        originalPath: absolutePath,
    };
    if (displayName) {
        config[projectName].displayName = displayName;
    }
    await saveProjectConfig(config);
    try {
        await fs.mkdir(projectDir, { recursive: true });
    }
    catch (error) {
    }
    return {
        name: projectName,
        path: absolutePath,
        fullPath: absolutePath,
        displayName: displayName ||
            (await generateDisplayName(projectName, absolutePath)),
        isManuallyAdded: true,
        sessions: [],
    };
}
export { addProjectManually, clearProjectDirectoryCache, deleteProject, deleteSession, extractProjectDirectory, getProjects, getSessionMessages, getSessions, isProjectEmpty, loadProjectConfig, parseJsonlSessions, renameProject, saveProjectConfig, };
//# sourceMappingURL=projects.js.map