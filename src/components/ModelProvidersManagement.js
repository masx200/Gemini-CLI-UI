import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Plus, Edit, Trash2, Key, Globe, Server, X } from "lucide-react";
import { useEffect, useState } from "react";
//@ts-ignore
import { Button } from "./ui/button.jsx";
//@ts-ignore
import { Input } from "./ui/input.jsx";
const PROVIDER_TYPES = [
    { value: "openai", label: "OpenAI", icon: "🤖" },
    { value: "anthropic", label: "Anthropic", icon: "🦾" },
    { value: "gemini", label: "Gemini", icon: "🔍" },
    { value: "bedrock", label: "Bedrock", icon: "☁️" },
    { value: "baidu", label: "Baidu", icon: "🔍" },
    { value: "dashscope", label: "DashScope", icon: "⚡" },
    { value: "deepseek", label: "DeepSeek", icon: "🔍" },
    { value: "volcengine", label: "VolcEngine", icon: "☁️" },
    { value: "moonshot", label: "Moonshot", icon: "🌙" },
    { value: "siliconflow", label: "SiliconFlow", icon: "💻" },
    { value: "modelscope", label: "ModelScope", icon: "🔬" },
    { value: "openrouter", label: "OpenRouter", icon: "🔀" },
    { value: "pangu", label: "Pangu", icon: "☁️" },
    { value: "xunfei", label: "Xunfei", icon: "🎤" },
];
function ModelProvidersManagement({ isOpen, onClose, }) {
    const [providers, setProviders] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [editingProvider, setEditingProvider] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        provider_name: "",
        provider_type: "",
        api_key: "",
        base_url: "",
        description: "",
        is_active: true,
    });
    useEffect(() => {
        if (isOpen) {
            loadProviders();
        }
    }, [isOpen]);
    const loadProviders = async () => {
        setIsLoading(true);
        try {
            const response = await fetch("/api/model-providers");
            const data = await response.json();
            setProviders(data.providers || []);
        }
        catch (error) {
            console.error("Error loading providers:", error);
            setProviders([]);
        }
        finally {
            setIsLoading(false);
        }
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const url = editingProvider
                ? `/api/model-providers/${editingProvider.id}`
                : "/api/model-providers";
            const method = editingProvider ? "PUT" : "POST";
            const response = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            });
            if (response.ok) {
                await loadProviders();
                resetForm();
            }
        }
        catch (error) {
            console.error("Error saving provider:", error);
        }
        finally {
            setIsSaving(false);
        }
    };
    const handleDelete = async (id) => {
        if (!confirm("Are you sure you want to delete this provider?"))
            return;
        try {
            const response = await fetch(`/api/model-providers/${id}`, {
                method: "DELETE",
            });
            if (response.ok) {
                await loadProviders();
            }
        }
        catch (error) {
            console.error("Error deleting provider:", error);
        }
    };
    const handleToggleActive = async (provider) => {
        try {
            const response = await fetch(`/api/model-providers/${provider.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ ...provider, is_active: !provider.is_active }),
            });
            if (response.ok) {
                await loadProviders();
            }
        }
        catch (error) {
            console.error("Error toggling provider:", error);
        }
    };
    const resetForm = () => {
        setFormData({
            provider_name: "",
            provider_type: "",
            api_key: "",
            base_url: "",
            description: "",
            is_active: true,
        });
        setEditingProvider(null);
        setShowForm(false);
    };
    const startEdit = (provider) => {
        setEditingProvider(provider);
        setFormData({
            provider_name: provider.provider_name,
            provider_type: provider.provider_type,
            api_key: provider.api_key,
            base_url: provider.base_url || "",
            description: provider.description || "",
            is_active: provider.is_active,
        });
        setShowForm(true);
    };
    const startAdd = () => {
        resetForm();
        setShowForm(true);
    };
    if (!isOpen)
        return null;
    return (_jsx("div", { className: "modal-backdrop fixed inset-0 flex items-center justify-center z-[100] md:p-4 bg-background/95", children: _jsxs("div", { className: "bg-background border border-border md:rounded-lg shadow-xl w-full md:max-w-6xl h-full md:h-[90vh] flex flex-col", children: [_jsxs("div", { className: "flex items-center justify-between p-4 md:p-6 border-b border-border flex-shrink-0", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx(Server, { className: "w-5 h-5 md:w-6 md:h-6 text-blue-600" }), _jsx("h2", { className: "text-lg md:text-xl font-semibold text-foreground", children: "Model Providers" })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsxs(Button, { onClick: startAdd, className: "h-8 md:h-10 touch-manipulation", children: [_jsx(Plus, { className: "w-4 h-4 mr-2" }), "Add Provider"] }), _jsx(Button, { variant: "ghost", size: "sm", onClick: onClose, className: "text-muted-foreground hover:text-foreground touch-manipulation", children: _jsx(X, { className: "w-5 h-5" }) })] })] }), _jsxs("div", { className: "flex-1 overflow-y-auto p-4 md:p-6", children: [showForm && (_jsxs(Card, { className: "mb-6", children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: editingProvider ? "Edit Provider" : "Add New Provider" }), _jsx(CardDescription, { children: "Configure a new AI model provider" })] }), _jsx(CardContent, { children: _jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "provider_name", children: "Provider Name *" }), _jsx(Input, { id: "provider_name", value: formData.provider_name, onChange: (e) => setFormData({
                                                                    ...formData,
                                                                    provider_name: e.target.value,
                                                                }), placeholder: "e.g., My OpenAI Provider", required: true })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "provider_type", children: "Provider Type *" }), _jsxs(Select, { value: formData.provider_type, onValueChange: (value) => setFormData({ ...formData, provider_type: value }), required: true, children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, { placeholder: "Select provider type" }) }), _jsx(SelectContent, { children: PROVIDER_TYPES.map((type) => (_jsxs(SelectItem, { value: type.value, children: [type.icon, " ", type.label] }, type.value))) })] })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "api_key", children: "API Key *" }), _jsxs("div", { className: "relative", children: [_jsx(Key, { className: "absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" }), _jsx(Input, { id: "api_key", type: "password", value: formData.api_key, onChange: (e) => setFormData({
                                                                            ...formData,
                                                                            api_key: e.target.value,
                                                                        }), placeholder: "Enter your API key", className: "pl-10", required: true })] })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "base_url", children: "Base URL" }), _jsxs("div", { className: "relative", children: [_jsx(Globe, { className: "absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" }), _jsx(Input, { id: "base_url", value: formData.base_url, onChange: (e) => setFormData({
                                                                            ...formData,
                                                                            base_url: e.target.value,
                                                                        }), placeholder: "https://api.openai.com/v1", className: "pl-10" })] })] })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "description", children: "Description" }), _jsx(Textarea, { id: "description", value: formData.description, onChange: (e) => setFormData({
                                                            ...formData,
                                                            description: e.target.value,
                                                        }), placeholder: "Optional description for this provider", rows: 3 })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Switch, { id: "is_active", checked: formData.is_active, onCheckedChange: (checked) => setFormData({ ...formData, is_active: checked }) }), _jsx(Label, { htmlFor: "is_active", children: "Active" })] }), _jsxs("div", { className: "flex gap-2 justify-end", children: [_jsx(Button, { type: "button", variant: "outline", onClick: resetForm, disabled: isSaving, children: "Cancel" }), _jsx(Button, { type: "submit", disabled: isSaving, children: isSaving
                                                            ? "Saving..."
                                                            : editingProvider
                                                                ? "Update"
                                                                : "Add" })] })] }) })] })), isLoading ? (_jsx("div", { className: "flex items-center justify-center h-64", children: _jsx("div", { className: "animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" }) })) : (_jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4", children: providers.map((provider) => (_jsxs(Card, { className: "relative", children: [_jsx(CardHeader, { children: _jsxs("div", { className: "flex items-start justify-between", children: [_jsxs("div", { children: [_jsx(CardTitle, { className: "text-lg", children: provider.provider_name }), _jsx(CardDescription, { children: PROVIDER_TYPES.find((t) => t.value === provider.provider_type)?.label || provider.provider_type })] }), _jsx("div", { className: "flex items-center gap-2", children: _jsx(Switch, { checked: provider.is_active, onCheckedChange: () => handleToggleActive(provider) }) })] }) }), _jsxs(CardContent, { children: [_jsxs("div", { className: "space-y-2 text-sm", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Key, { className: "w-4 h-4 text-gray-400" }), _jsx("span", { className: "text-gray-600 dark:text-gray-400", children: provider.api_key ? "••••••••" : "No API key" })] }), provider.base_url && (_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Globe, { className: "w-4 h-4 text-gray-400" }), _jsx("span", { className: "text-gray-600 dark:text-gray-400 truncate", children: provider.base_url })] })), provider.description && (_jsx("p", { className: "text-gray-600 dark:text-gray-400 text-xs", children: provider.description }))] }), _jsxs("div", { className: "flex gap-2 mt-4", children: [_jsxs(Button, { size: "sm", variant: "outline", onClick: () => startEdit(provider), className: "flex-1", children: [_jsx(Edit, { className: "w-4 h-4 mr-1" }), "Edit"] }), _jsxs(Button, { size: "sm", variant: "destructive", onClick: () => handleDelete(provider.id), className: "flex-1", children: [_jsx(Trash2, { className: "w-4 h-4 mr-1" }), "Delete"] })] })] })] }, provider.id))) })), !isLoading && providers.length === 0 && !showForm && (_jsxs("div", { className: "text-center py-12", children: [_jsx(Server, { className: "w-12 h-12 mx-auto text-gray-400 mb-4" }), _jsx("h3", { className: "text-lg font-medium text-gray-900 dark:text-gray-100 mb-2", children: "No model providers" }), _jsx("p", { className: "text-gray-600 dark:text-gray-400 mb-4", children: "Get started by adding your first model provider." }), _jsxs(Button, { onClick: startAdd, children: [_jsx(Plus, { className: "w-4 h-4 mr-2" }), "Add Provider"] })] }))] })] }) }));
}
export default ModelProvidersManagement;
//# sourceMappingURL=ModelProvidersManagement.js.map