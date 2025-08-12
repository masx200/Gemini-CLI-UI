import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from "react";
import { Server } from "lucide-react";
//@ts-ignore
import { Button } from "./ui/button.jsx";
import ModelProvidersManagement from "./ModelProvidersManagement.jsx";
function ModelProvidersSettings({ isOpen, onClose }) {
    const [showModelProviders, setShowModelProviders] = useState(false);
    if (!isOpen)
        return null;
    return (_jsxs(_Fragment, { children: [_jsxs("div", { className: "bg-background border border-border md:rounded-lg shadow-xl w-full md:max-w-4xl h-full md:h-[90vh] flex flex-col", children: [_jsxs("div", { className: "flex items-center justify-between p-4 md:p-6 border-b border-border flex-shrink-0", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx(Server, { className: "w-5 h-5 md:w-6 md:h-6 text-blue-600" }), _jsx("h2", { className: "text-lg md:text-xl font-semibold text-foreground", children: "Model Providers Settings" })] }), _jsx(Button, { variant: "ghost", size: "sm", onClick: onClose, className: "text-muted-foreground hover:text-foreground touch-manipulation", children: "Close" })] }), _jsx("div", { className: "flex-1 overflow-y-auto p-4 md:p-6", children: _jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4", children: [_jsx("h3", { className: "text-lg font-medium text-blue-900 dark:text-blue-100 mb-2", children: "Manage AI Model Providers" }), _jsx("p", { className: "text-sm text-blue-700 dark:text-blue-300", children: "Configure and manage your AI model providers including OpenAI, Anthropic, Google, and more." })] }), _jsxs(Button, { onClick: () => setShowModelProviders(true), className: "w-full md:w-auto", children: [_jsx(Server, { className: "w-4 h-4 mr-2" }), "Open Model Providers Manager"] })] }) })] }), _jsx(ModelProvidersManagement, { isOpen: showModelProviders, onClose: () => setShowModelProviders(false) })] }));
}
export default ModelProvidersSettings;
//# sourceMappingURL=ModelProvidersSettings.js.map