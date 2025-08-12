import {
  Plus,
  Edit,
  Trash2,
  Key,
  Globe,
  Server, X
} from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Switch } from "./ui/switch";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";

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

function ModelProvidersManagement({ isOpen, onClose }) {
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
    } catch (error) {
      console.error("Error loading providers:", error);
      setProviders([]);
    } finally {
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
    } catch (error) {
      console.error("Error saving provider:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this provider?")) return;

    try {
      const response = await fetch(`/api/model-providers/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        await loadProviders();
      }
    } catch (error) {
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
    } catch (error) {
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

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop fixed inset-0 flex items-center justify-center z-[100] md:p-4 bg-background/95">
      <div className="bg-background border border-border md:rounded-lg shadow-xl w-full md:max-w-6xl h-full md:h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-4 md:p-6 border-b border-border flex-shrink-0">
          <div className="flex items-center gap-3">
            <Server className="w-5 h-5 md:w-6 md:h-6 text-blue-600" />
            <h2 className="text-lg md:text-xl font-semibold text-foreground">
              Model Providers
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={startAdd}
              className="h-8 md:h-10 touch-manipulation"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Provider
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground touch-manipulation"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          {showForm && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>
                  {editingProvider ? "Edit Provider" : "Add New Provider"}
                </CardTitle>
                <CardDescription>
                  Configure a new AI model provider
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="provider_name">Provider Name *</Label>
                      <Input
                        id="provider_name"
                        value={formData.provider_name}
                        onChange={(e) =>
                          setFormData({ ...formData, provider_name: e.target.value })
                        }
                        placeholder="e.g., My OpenAI Provider"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="provider_type">Provider Type *</Label>
                      <Select
                        value={formData.provider_type}
                        onValueChange={(value) =>
                          setFormData({ ...formData, provider_type: value })
                        }
                        required
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select provider type" />
                        </SelectTrigger>
                        <SelectContent>
                          {PROVIDER_TYPES.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.icon} {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="api_key">API Key *</Label>
                      <div className="relative">
                        <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                          id="api_key"
                          type="password"
                          value={formData.api_key}
                          onChange={(e) =>
                            setFormData({ ...formData, api_key: e.target.value })
                          }
                          placeholder="Enter your API key"
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="base_url">Base URL</Label>
                      <div className="relative">
                        <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                          id="base_url"
                          value={formData.base_url}
                          onChange={(e) =>
                            setFormData({ ...formData, base_url: e.target.value })
                          }
                          placeholder="https://api.openai.com/v1"
                          className="pl-10"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({ ...formData, description: e.target.value })
                      }
                      placeholder="Optional description for this provider"
                      rows={3}
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="is_active"
                      checked={formData.is_active}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, is_active: checked })
                      }
                    />
                    <Label htmlFor="is_active">Active</Label>
                  </div>

                  <div className="flex gap-2 justify-end">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={resetForm}
                      disabled={isSaving}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isSaving}>
                      {isSaving ? "Saving..." : editingProvider ? "Update" : "Add"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {providers.map((provider) => (
                <Card key={provider.id} className="relative">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">
                          {provider.provider_name}
                        </CardTitle>
                        <CardDescription>
                          {PROVIDER_TYPES.find((t) => t.value === provider.provider_type)?.label || provider.provider_type}
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={provider.is_active}
                          onCheckedChange={() => handleToggleActive(provider)}
                        />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Key className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600 dark:text-gray-400">
                          {provider.api_key ? "••••••••" : "No API key"}
                        </span>
                      </div>
                      {provider.base_url && (
                        <div className="flex items-center gap-2">
                          <Globe className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-600 dark:text-gray-400 truncate">
                            {provider.base_url}
                          </span>
                        </div>
                      )}
                      {provider.description && (
                        <p className="text-gray-600 dark:text-gray-400 text-xs">
                          {provider.description}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => startEdit(provider)}
                        className="flex-1"
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(provider.id)}
                        className="flex-1"
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {!isLoading && providers.length === 0 && !showForm && (
            <div className="text-center py-12">
              <Server className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                No model providers
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Get started by adding your first model provider.
              </p>
              <Button onClick={startAdd}>
                <Plus className="w-4 h-4 mr-2" />
                Add Provider
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ModelProvidersManagement;