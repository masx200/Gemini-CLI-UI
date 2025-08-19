import { useEffect, useState } from "react";
import {
  parseToolsContent,
  type ToolInfo,
} from "../utils/parseToolsContent.ts";
import ToolList from "./ToolList.tsx";
import { CommandApi } from "../CodeGenerator/apis/CommandApi.ts";
import { Configuration } from "../CodeGenerator/index.ts";
import { getglobalSessionId } from "./MCPSERVERSTATUS.tsx";

export function ToolsViewer() {
  const [tools, setTools] = useState<ToolInfo[]>([]);
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState<boolean>(false);
  useEffect(() => {
    const fetchTools = async () => {
      try {
        setLoading(true);
        const tools = parseToolsContent(await fetchToolsDescriptions());
        setTools(tools);
        setLoading(false);
      } catch (error: any) {
        setError(error.message);
        setLoading(false);
      }
    };
    fetchTools().then(console.log, console.error);
  }, []);

  return (
    <div>
      {loading && (
        <div className="flex items-center justify-center p-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          <span className="ml-2">加载中...</span>
        </div>
      )}
      {error && (
        <div
          className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative"
          role="alert"
        >
          <strong className="font-bold">错误：</strong>
          <span className="block sm:inline">{error}</span>
        </div>
      )}
      {!loading && !error && (
        <div>
          <div>可用工具详情</div>
          <hr></hr>
          <ToolList tools={tools}></ToolList>
        </div>
      )}
    </div>
  );
}

export async function fetchToolsDescriptions() {
  const token = localStorage.getItem("auth-token");

  const commandapi = new CommandApi(
    new Configuration({
      headers: {
        "Content-Type": "application/json",

        Authorization: `Bearer ${token}`,
      },
    })
  );
  const sessionid = await getglobalSessionId();

  const data1 = await commandapi.commandToolsPost({
    //@ts-ignore
    inlineObject: { sessionId: sessionid, args: "desc" },
  });
  if (data1.error) {
    throw new Error(data1.error);
  }
  return data1.itemData?.text?.toString();
}
