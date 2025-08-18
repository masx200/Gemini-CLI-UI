import { spawn } from "child_process";
import { promises as fs } from "fs";
import os from "os";
import path from "path";
import sessionManager from "./sessionManager.js";

let activeqwenProcesses = new Map(); // Track active processes by session ID

async function spawnqwen(command, options = {}, ws) {
  return new Promise(async (resolve, reject) => {
    const {
      sessionId,
      projectPath,
      cwd,
      resume,
      toolsSettings,
      permissionMode,
      images,
    } = options;
    let capturedSessionId = sessionId; // Track session ID throughout the process
    let sessionCreatedSent = false; // Track if we've already sent session-created event
    let fullResponse = ""; // Accumulate the full response

    // Process images if provided

    // Use tools settings passed from frontend, or defaults
    const settings = toolsSettings || {
      allowedTools: [],
      disallowedTools: [],
      skipPermissions: false,
    };

    // Use tools settings

    // Build qwen CLI command - start with print/resume flags first
    const args = [];

    // Add prompt flag with command if we have a command
    if (command && command.trim()) {
      // If we have a sessionId, include conversation history
      if (sessionId) {
        const context = sessionManager.buildConversationContext(sessionId);
        if (context) {
          // Combine context with current command
          const fullPrompt = context + command;
          args.push("--prompt", fullPrompt);
        } else {
          args.push("--prompt", command);
        }
      } else {
        args.push("--prompt", command);
      }
    }

    // Use cwd (actual project directory) instead of projectPath (qwen's metadata directory)
    // Debug - cwd and projectPath
    // Clean the path by removing any non-printable characters
    const cleanPath = (cwd || process.cwd())
      .replace(/[^\x20-\x7E]/g, "")
      .trim();
    const workingDir = cleanPath;
    // Debug - workingDir

    // Handle images by saving them to temporary files and passing paths to qwen
    const tempImagePaths = [];
    let tempDir = null;
    if (images && images.length > 0) {
      try {
        // Create temp directory in the project directory so qwen can access it
        tempDir = path.join(
          workingDir,
          ".tmp",
          "images",
          Date.now().toString()
        );
        await fs.mkdir(tempDir, { recursive: true });

        // Save each image to a temp file
        for (const [index, image] of images.entries()) {
          // Extract base64 data and mime type
          const matches = image.data.match(/^data:([^;]+);base64,(.+)$/);
          if (!matches) {
            // console.error('Invalid image data format');
            continue;
          }

          const [, mimeType, base64Data] = matches;
          const extension = mimeType.split("/")[1] || "png";
          const filename = `image_${index}.${extension}`;
          const filepath = path.join(tempDir, filename);

          // Write base64 data to file
          await fs.writeFile(filepath, Buffer.from(base64Data, "base64"));
          tempImagePaths.push(filepath);
        }

        // Include the full image paths in the prompt for qwen to reference
        // qwen CLI can read images from file paths in the prompt
        if (tempImagePaths.length > 0 && command && command.trim()) {
          const imageNote = `\n\n[画像を添付しました: ${
            tempImagePaths.length
          }枚の画像があります。以下のパスに保存されています:]\n${tempImagePaths
            .map((p, i) => `${i + 1}. ${p}`)
            .join("\n")}`;
          const modifiedCommand = command + imageNote;

          // Update the command in args
          const promptIndex = args.indexOf("--prompt");
          if (promptIndex !== -1 && args[promptIndex + 1] === command) {
            args[promptIndex + 1] = modifiedCommand;
          } else if (promptIndex !== -1) {
            // If we're using context, update the full prompt
            args[promptIndex + 1] = args[promptIndex + 1] + imageNote;
          }
        }
      } catch (error) {
        // console.error('Error processing images for qwen:', error);
      }
    }

    // qwen doesn't support resume functionality
    // Skip resume handling

    // Add basic flags for qwen
    // Only add debug flag if explicitly requested
    if (options.debug) {
      args.push("--debug");
    }

    // Add MCP config flag only if MCP servers are configured
    try {
      // Use already imported modules (fs.promises is imported as fs, path, os)
      const fsSync = await import("fs"); // Import synchronous fs methods

      // Check for MCP config in ~/.qwen/settings.json
      const qwenConfigPath = path.join(os.homedir(), ".qwen/settings.json");

      let hasMcpServers = false;

      // Check qwen config for MCP servers
      if (fsSync.existsSync(qwenConfigPath)) {
        try {
          const qwenConfig = JSON.parse(
            fsSync.readFileSync(qwenConfigPath, "utf8")
          );

          // Check global MCP servers
          if (
            qwenConfig.mcpServers &&
            Object.keys(qwenConfig.mcpServers).length > 0
          ) {
            hasMcpServers = true;
          }

          // Check project-specific MCP servers
          if (!hasMcpServers && qwenConfig.qwenProjects) {
            const currentProjectPath = process.cwd();
            const projectConfig = qwenConfig.qwenProjects[currentProjectPath];
            if (
              projectConfig &&
              projectConfig.mcpServers &&
              Object.keys(projectConfig.mcpServers).length > 0
            ) {
              hasMcpServers = true;
            }
          }
        } catch (e) {}
      }

      if (hasMcpServers) {
        // Use qwen config file if it has MCP servers
        let configPath = null;

        if (fsSync.existsSync(qwenConfigPath)) {
          try {
            const qwenConfig = JSON.parse(
              fsSync.readFileSync(qwenConfigPath, "utf8")
            );

            // Check if we have any MCP servers (global or project-specific)
            const hasGlobalServers =
              qwenConfig.mcpServers &&
              Object.keys(qwenConfig.mcpServers).length > 0;
            const currentProjectPath = process.cwd();
            const projectConfig =
              qwenConfig.qwenProjects &&
              qwenConfig.qwenProjects[currentProjectPath];
            const hasProjectServers =
              projectConfig &&
              projectConfig.mcpServers &&
              Object.keys(projectConfig.mcpServers).length > 0;

            if (hasGlobalServers || hasProjectServers) {
              configPath = qwenConfigPath;
            }
          } catch (e) {
            // No valid config found
          }
        }

        if (configPath) {
          args.push("--mcp-config", configPath);
        } else {
        }
      }
    } catch (error) {
      // If there's any error checking for MCP configs, don't add the flag
      // MCP config check failed, proceeding without MCP support
    }

    // Add model for all sessions (both new and resumed)
    // Debug - Model from options and resume session
    const modelToUse = options.model || "qwen-2.5-flash";
    // Debug - Using model
    args.push("--model", modelToUse);

    // Add --yolo flag if skipPermissions is enabled
    if (settings.skipPermissions) {
      args.push("--yolo");
    } else {
    }

    // qwen doesn't support these tool permission flags
    // Skip all tool settings

    // console.log('Spawning qwen CLI with args:', args);
    // console.log('Working directory:', workingDir);

    // Try to find qwen in PATH first, then fall back to environment variable
    const qwenPath = process.env.qwen_PATH || "qwen";
    // console.log('Full command:', qwenPath, args.join(' '));

    const qwenProcess = spawn(qwenPath, args, {
      cwd: workingDir,
      stdio: ["pipe", "pipe", "pipe"],
      env: { ...process.env }, // Inherit all environment variables
    });

    // Attach temp file info to process for cleanup later
    qwenProcess.tempImagePaths = tempImagePaths;
    qwenProcess.tempDir = tempDir;

    // Store process reference for potential abort
    const processKey = capturedSessionId || sessionId || Date.now().toString();
    activeqwenProcesses.set(processKey, qwenProcess);
    // Debug - Stored qwen process with key

    // Store sessionId on the process object for debugging
    qwenProcess.sessionId = processKey;

    // Close stdin to signal we're done sending input
    qwenProcess.stdin.end();

    // Add timeout handler
    let hasReceivedOutput = false;
    const timeoutMs = 30000; // 30 seconds
    const timeout = setTimeout(() => {
      if (!hasReceivedOutput) {
        // console.error('⏰ qwen CLI timeout - no output received after', timeoutMs, 'ms');
        ws.send(
          JSON.stringify({
            type: "qwen-error",
            error: "qwen CLI timeout - no response received",
          })
        );
        qwenProcess.kill("SIGTERM");
      }
    }, timeoutMs);

    // Save user message to session when starting
    if (command && capturedSessionId) {
      sessionManager.addMessage(capturedSessionId, "user", command);
    }

    // Handle stdout (qwen outputs plain text)
    let outputBuffer = "";

    qwenProcess.stdout.on("data", (data) => {
      const rawOutput = data.toString();
      outputBuffer += rawOutput;
      // Debug - Raw qwen stdout
      hasReceivedOutput = true;
      clearTimeout(timeout);

      // Filter out debug messages and system messages
      const lines = rawOutput.split("\n");
      const filteredLines = lines.filter((line) => {
        // Skip debug messages
        if (
          line.includes("[DEBUG]") ||
          line.includes("Flushing log events") ||
          line.includes("Clearcut response") ||
          line.includes("[MemoryDiscovery]") ||
          line.includes("[BfsFileSearch]")
        ) {
          return false;
        }
        return true;
      });

      const filteredOutput = filteredLines.join("\n").trim();

      if (filteredOutput) {
        // Debug - qwen response

        // Accumulate the full response
        fullResponse += (fullResponse ? "\n" : "") + filteredOutput;

        // Send the filtered output as a message
        ws.send(
          JSON.stringify({
            type: "qwen-response",
            data: {
              type: "message",
              content: filteredOutput,
            },
          })
        );
      }

      // For new sessions, create a session ID
      if (!sessionId && !sessionCreatedSent && !capturedSessionId) {
        capturedSessionId = `qwen_${Date.now()}`;
        sessionCreatedSent = true;

        // Create session in session manager
        sessionManager.createSession(capturedSessionId, cwd || process.cwd());

        // Save the user message now that we have a session ID
        if (command) {
          sessionManager.addMessage(capturedSessionId, "user", command);
        }

        // Update process key with captured session ID
        if (processKey !== capturedSessionId) {
          activeqwenProcesses.delete(processKey);
          activeqwenProcesses.set(capturedSessionId, qwenProcess);
        }

        ws.send(
          JSON.stringify({
            type: "session-created",
            sessionId: capturedSessionId,
          })
        );
      }
    });

    // Handle stderr
    qwenProcess.stderr.on("data", (data) => {
      const errorMsg = data.toString();
      // Debug - Raw qwen stderr

      // Filter out deprecation warnings
      if (
        errorMsg.includes("[DEP0040]") ||
        errorMsg.includes("DeprecationWarning") ||
        errorMsg.includes("--trace-deprecation")
      ) {
        // Log but don't send to client
        // Debug - qwen CLI warning (suppressed)
        return;
      }

      // console.error('qwen CLI stderr:', errorMsg);
      ws.send(
        JSON.stringify({
          type: "qwen-error",
          error: errorMsg,
        })
      );
    });

    // Handle process completion
    qwenProcess.on("close", async (code) => {
      // console.log(`qwen CLI process exited with code ${code}`);
      clearTimeout(timeout);

      // Clean up process reference
      const finalSessionId = capturedSessionId || sessionId || processKey;
      activeqwenProcesses.delete(finalSessionId);

      // Save assistant response to session if we have one
      if (finalSessionId && fullResponse) {
        sessionManager.addMessage(finalSessionId, "assistant", fullResponse);
      }

      ws.send(
        JSON.stringify({
          type: "qwen-complete",
          exitCode: code,
          isNewSession: !sessionId && !!command, // Flag to indicate this was a new session
        })
      );

      // Clean up temporary image files if any
      if (qwenProcess.tempImagePaths && qwenProcess.tempImagePaths.length > 0) {
        for (const imagePath of qwenProcess.tempImagePaths) {
          await fs.unlink(imagePath).catch((err) => {
            // console.error(`Failed to delete temp image ${imagePath}:`, err)
          });
        }
        if (qwenProcess.tempDir) {
          await fs
            .rm(qwenProcess.tempDir, { recursive: true, force: true })
            .catch((err) => {
              // console.error(`Failed to delete temp directory ${qwenProcess.tempDir}:`, err)
            });
        }
      }

      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`qwen CLI exited with code ${code}`));
      }
    });

    // Handle process errors
    qwenProcess.on("error", (error) => {
      // console.error('qwen CLI process error:', error);

      // Clean up process reference on error
      const finalSessionId = capturedSessionId || sessionId || processKey;
      activeqwenProcesses.delete(finalSessionId);

      ws.send(
        JSON.stringify({
          type: "qwen-error",
          error: error.message,
        })
      );

      reject(error);
    });

    // Handle stdin for interactive mode
    // qwen with --prompt flag doesn't need stdin
    if (command && command.trim()) {
      // We're using --prompt flag, so just close stdin
      qwenProcess.stdin.end();
    } else {
      // Interactive mode without initial prompt
      // Keep stdin open for interactive use
    }
  });
}

function abortqwenSession(sessionId) {
  // Debug - Attempting to abort qwen session
  // Debug - Active processes

  // Try to find the process by session ID or any key that contains the session ID
  let process = activeqwenProcesses.get(sessionId);
  let processKey = sessionId;

  if (!process) {
    // Search for process with matching session ID in keys
    for (const [key, proc] of activeqwenProcesses.entries()) {
      if (key.includes(sessionId) || sessionId.includes(key)) {
        process = proc;
        processKey = key;
        break;
      }
    }
  }

  if (process) {
    // Debug - Found process for session
    try {
      // First try SIGTERM
      process.kill("SIGTERM");

      // Set a timeout to force kill if process doesn't exit
      setTimeout(() => {
        if (activeqwenProcesses.has(processKey)) {
          // Debug - Process didn't terminate, forcing kill
          try {
            process.kill("SIGKILL");
          } catch (e) {
            // console.error('Error force killing process:', e);
          }
        }
      }, 2000); // Wait 2 seconds before force kill

      activeqwenProcesses.delete(processKey);
      return true;
    } catch (error) {
      // console.error('Error killing process:', error);
      activeqwenProcesses.delete(processKey);
      return false;
    }
  }

  // Debug - No process found for session
  return false;
}

export { abortqwenSession, spawnqwen };
