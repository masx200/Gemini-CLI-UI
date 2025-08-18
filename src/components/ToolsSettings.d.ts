import { type Project } from "./mcp-server-management.tsx";
export interface ToolsSettingsLocal {
    allowedTools: string[];
    disallowedTools: string[];
    skipPermissions: boolean;
    projectSortOrder: string;
    selectedModel: string;
    enableNotificationSound: boolean;
    lastUpdated: string;
    selectedProvider: string;
}
declare function ToolsSettings({ isOpen, onClose, projects, }: {
    isOpen: boolean;
    onClose: () => void;
    projects: Project[];
}): import("react/jsx-runtime").JSX.Element | null;
export default ToolsSettings;
//# sourceMappingURL=ToolsSettings.d.ts.map