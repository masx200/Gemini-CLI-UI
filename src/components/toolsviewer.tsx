import { useState } from "react";
import type { ToolInfo } from "../utils/parseToolsContent.ts";
import ToolList from "./ToolList.tsx";

export function ToolsViewer() {
  const [tools, setTools] = useState<ToolInfo[]>([]);
  return (
    <div>
      <ToolList tools={tools}></ToolList>
    </div>
  );
}
