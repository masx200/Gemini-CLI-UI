import React from "react";

export interface ToolInfo {
  name: string;
  alias?: string;
  description: string;
}
export interface ToolListProps {
  tools: ToolInfo[];
}

export const ToolList: React.FC<ToolListProps> = ({ tools }) => {
  return (
    <div className="space-y-4">
      {tools.map((tool, index) => (
        <div
          key={index}
          className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-2 mb-2">
            <h3 className="font-semibold text-gray-900">{tool.name}</h3>
            {tool.alias && (
              <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                {tool.alias}
              </span>
            )}
          </div>
          <details>
            <summary>查看工具详情描述</summary>
            <p className="text-gray-600 text-sm">
              {tool.description.split("\n").map((line) => {
                return <div><div key={line}>{line}</div><br></br></div>;
              })}
            </p>
          </details>
        </div>
      ))}

      {tools.length === 0 && (
        <div className="text-center py-8 text-gray-500">暂无工具</div>
      )}
    </div>
  );
};

export default ToolList;
