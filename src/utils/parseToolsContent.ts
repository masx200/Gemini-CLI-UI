export interface ToolInfo {
  name: string;
  alias?: string;
  description: string;
}

/**
 * 解析tools内容，提取工具名称和描述信息
 * @param content 包含工具信息的文本内容
 * @returns 工具信息数组
 */
export function parseToolsContent(content: string): ToolInfo[] {
  const tools: ToolInfo[] = [];
  
  // 使用正则表达式匹配工具条目
  // 格式：- [36m工具名称 (别名)[0m: 描述信息
  const toolRegex = /- \x1b\[36m([^\x1b]+)\x1b\[0m:\s*([\s\S]*?)(?=\s*- \x1b\[36m|$)/g;
  
  let match;
  while ((match = toolRegex.exec(content)) !== null) {
    //@ts-ignore
    const toolNameWithAlias = match[1].trim();
    //@ts-ignore
    const description = match[2].trim();
    
    // 解析工具名称和别名
    let name = toolNameWithAlias;
    let alias: string | undefined;
    
    // 检查是否包含别名格式：工具名称 (别名)
    const aliasMatch = toolNameWithAlias.match(/^(.*?)\s*\(([^)]+)\)$/);
    if (aliasMatch) {
       //@ts-ignore
      name = aliasMatch[1].trim();
       //@ts-ignore
      alias = aliasMatch[2].trim();
    }
    
    // 清理描述中的ANSI颜色代码
    const cleanDescription = description.replace(/\x1b\[\d+m/g, '').trim();
    
    tools.push({
      name,
      alias,
      description: cleanDescription
    });
  }
  
  return tools;
}