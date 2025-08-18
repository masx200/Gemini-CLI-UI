export interface MCPTool {
  name: string;
  description: string;
  details: string[];
}
export interface MCPServer {
  status: "Ready" | "Disconnected";
  name: string;
  description: string;
  tools: MCPTool[];
}

export function parseMCPServerStatus(content: string): MCPServer[] {
  content = content.replaceAll("[0m  [36mTools:[0m", "\n");
  const lines = content.split("\n");
  const servers: MCPServer[] = [];
  let currentServer: MCPServer | null = null;
  let currentTool: MCPTool | null = null;

  for (let i = 0; i < lines.length; i++) {
    //@ts-ignore
    const line = lines[i].trim();

    // 清理ANSI转义字符
    const cleanLine = line
      .replaceAll("\u001b", " ")
      .replaceAll("[1m", " ")
      .replaceAll("[36m", " ")
      .replaceAll("[32m", " ")
      .replaceAll("[0m", " ")
      .trim();

    // 检测服务器行 (包含🔴或🟢)
    if (cleanLine.includes("🔴") || cleanLine.includes("🟢")) {
      // 保存前一个服务器（如果有）
      if (currentServer) {
        servers.push(currentServer);
      }

      // 解析服务器信息
      const statusMatch = cleanLine.match(/(🔴|🟢)\s*(.+?)\s*-\s*(.+)/);
      if (statusMatch) {
        const [, status, name, description] = statusMatch;
        currentServer = {
          status: status === "🟢" ? "Ready" : "Disconnected",
          //@ts-ignore
          name: name.trim(),
          //@ts-ignore
          description: description.trim(),
          tools: [],
        };
      }
    }
    // 检测工具行 (以-开头)
    else if (cleanLine.startsWith("-") && currentServer) {
      // 保存前一个工具（如果有）
      if (currentTool) {
        currentServer.tools.push(currentTool);
      }

      // 解析工具名称
      const toolNameMatch = cleanLine.match(/-\s*(.+?):/);
      if (toolNameMatch) {
        currentTool = {
          //@ts-ignore
          name: toolNameMatch[1].trim(),
          description: "",
          details: [],
        };
      }
    }
    // 检测工具描述行（不以-开头且不为空）
    else if (
      cleanLine &&
      !cleanLine.startsWith("-") &&
      currentTool &&
      currentServer
    ) {
      if (cleanLine.includes("：") || cleanLine.includes(":")) {
        // 如果包含冒号，可能是新的描述项
        currentTool.details.push(cleanLine);
      } else {
        // 否则追加到当前描述
        if (currentTool.description) {
          currentTool.description += " " + cleanLine;
        } else {
          currentTool.description = cleanLine;
        }
      }
    }
  }

  // 添加最后一个服务器和工具
  if (currentTool && currentServer) {
    currentServer.tools.push(currentTool);
  }
  if (currentServer) {
    servers.push(currentServer);
  }

  return servers;
}
