import React from "react";
export interface ToolInfo {
    name: string;
    alias?: string;
    description: string;
}
export interface ToolListProps {
    tools: ToolInfo[];
}
export declare const ToolList: React.FC<ToolListProps>;
export default ToolList;
//# sourceMappingURL=ToolList.d.ts.map