import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Dialog,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import { Edit, Globe, Key, Plus, Server, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
//@ts-ignore
import { authenticatedFetch } from "../../src/utils/api.js";
const PROVIDER_TYPES = [
  { value: "openai", label: "OpenAI", icon: "🤖" },
  { value: "anthropic", label: "Anthropic", icon: "🦾" },
  { value: "qwen", label: "qwen", icon: "🔍" },
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
      const response = await authenticatedFetch("/api/model-providers");
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
      const response = await authenticatedFetch(url, {
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
    if (!confirm("Are you sure you want to delete this provider?")) {
      return;
    }
    try {
      const response = await authenticatedFetch(`/api/model-providers/${id}`, {
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
      const response = await authenticatedFetch(
        `/api/model-providers/${provider.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ ...provider, is_active: !provider.is_active }),
        }
      );
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
  if (!isOpen) {
    return null;
  }
  return _jsxs(Dialog, {
    open: isOpen,
    onClose: onClose,
    maxWidth: "lg",
    fullWidth: true,
    fullScreen: true,
    PaperProps: {
      sx: {
        height: { xs: "100vh", md: "90vh" },
        margin: { xs: 0, md: 2 },
        borderRadius: { xs: 0, md: 2 },
      },
    },
    children: [
      _jsxs(DialogTitle, {
        sx: {
          m: 0,
          p: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        },
        children: [
          _jsxs(Box, {
            sx: { display: "flex", alignItems: "center", gap: 1 },
            children: [
              _jsx(Server, {
                className: "w-5 h-5 md:w-6 md:h-6 text-blue-600",
              }),
              _jsx(Typography, {
                variant: "h6",
                component: "span",
                children: "Model Providers",
              }),
            ],
          }),
          _jsxs(Box, {
            sx: { display: "flex", gap: 1 },
            children: [
              _jsx(Button, {
                variant: "contained",
                onClick: startAdd,
                startIcon: _jsx(Plus, { className: "w-4 h-4" }),
                size: "small",
                children: "Add Provider",
              }),
              _jsx(IconButton, {
                onClick: onClose,
                size: "small",
                children: _jsx(X, { className: "w-5 h-5" }),
              }),
            ],
          }),
        ],
      }),
      _jsxs(DialogContent, {
        dividers: true,
        sx: { p: 2 },
        children: [
          showForm &&
            _jsxs(Card, {
              sx: { mb: 2 },
              children: [
                _jsx(CardHeader, {
                  title: editingProvider ? "Edit Provider" : "Add New Provider",
                  subheader: "Configure a new AI model provider",
                }),
                _jsx(CardContent, {
                  children: _jsxs(Box, {
                    component: "form",
                    onSubmit: handleSubmit,
                    sx: { display: "flex", flexDirection: "column", gap: 2 },
                    children: [
                      _jsxs(Grid, {
                        container: true,
                        spacing: 2,
                        children: [
                          _jsx(Grid, {
                            children: _jsx(TextField, {
                              fullWidth: true,
                              id: "provider_name",
                              label: "Provider Name *",
                              value: formData.provider_name,
                              onChange: (e) =>
                                setFormData({
                                  ...formData,
                                  provider_name: e.target.value,
                                }),
                              placeholder: "e.g., My OpenAI Provider",
                              required: true,
                            }),
                          }),
                          _jsx(Grid, {
                            children: _jsxs(FormControl, {
                              fullWidth: true,
                              required: true,
                              children: [
                                _jsx(InputLabel, {
                                  id: "provider_type-label",
                                  children: "Provider Type *",
                                }),
                                _jsx(Select, {
                                  labelId: "provider_type-label",
                                  id: "provider_type",
                                  value: formData.provider_type,
                                  onChange: (e) =>
                                    setFormData({
                                      ...formData,
                                      provider_type: e.target.value,
                                    }),
                                  label: "Provider Type *",
                                  children: PROVIDER_TYPES.map((type) =>
                                    _jsxs(
                                      MenuItem,
                                      {
                                        value: type.value,
                                        children: [type.icon, " ", type.label],
                                      },
                                      type.value
                                    )
                                  ),
                                }),
                              ],
                            }),
                          }),
                          _jsx(Grid, {
                            children: _jsx(TextField, {
                              fullWidth: true,
                              id: "api_key",
                              label: "API Key *",
                              type: "password",
                              value: formData.api_key,
                              onChange: (e) =>
                                setFormData({
                                  ...formData,
                                  api_key: e.target.value,
                                }),
                              placeholder: "Enter your API key",
                              required: true,
                              InputProps: {
                                startAdornment: _jsx(Key, {
                                  className: "w-4 h-4 text-gray-400 mr-2",
                                }),
                              },
                            }),
                          }),
                          _jsx(Grid, {
                            children: _jsx(TextField, {
                              fullWidth: true,
                              id: "base_url",
                              label: "Base URL",
                              value: formData.base_url,
                              onChange: (e) =>
                                setFormData({
                                  ...formData,
                                  base_url: e.target.value,
                                }),
                              placeholder: "https://api.openai.com/v1",
                              InputProps: {
                                startAdornment: _jsx(Globe, {
                                  className: "w-4 h-4 text-gray-400 mr-2",
                                }),
                              },
                            }),
                          }),
                        ],
                      }),
                      _jsx(TextField, {
                        fullWidth: true,
                        id: "description",
                        label: "Description",
                        value: formData.description,
                        onChange: (e) =>
                          setFormData({
                            ...formData,
                            description: e.target.value,
                          }),
                        placeholder: "Optional description for this provider",
                        multiline: true,
                        rows: 3,
                      }),
                      _jsx(FormControlLabel, {
                        control: _jsx(Switch, {
                          checked: formData.is_active,
                          onChange: (e) =>
                            setFormData({
                              ...formData,
                              is_active: e.target.checked,
                            }),
                        }),
                        label: "Active",
                      }),
                      _jsxs(Box, {
                        sx: {
                          display: "flex",
                          gap: 1,
                          justifyContent: "flex-end",
                        },
                        children: [
                          _jsx(Button, {
                            variant: "outlined",
                            onClick: resetForm,
                            disabled: isSaving,
                            children: "Cancel",
                          }),
                          _jsx(Button, {
                            type: "submit",
                            variant: "contained",
                            disabled: isSaving,
                            children: isSaving
                              ? "Saving..."
                              : editingProvider
                              ? "Update"
                              : "Add",
                          }),
                        ],
                      }),
                    ],
                  }),
                }),
              ],
            }),
          isLoading
            ? _jsx(Box, {
                sx: {
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  height: 256,
                },
                children: _jsx("div", {
                  className:
                    "animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600",
                }),
              })
            : _jsx(Grid, {
                container: true,
                spacing: 2,
                children: providers.map((provider) =>
                  _jsx(
                    Grid,
                    {
                      children: _jsxs(Card, {
                        sx: {
                          height: "100%",
                          display: "flex",
                          flexDirection: "column",
                        },
                        children: [
                          _jsx(CardHeader, {
                            title: provider.provider_name,
                            subheader:
                              PROVIDER_TYPES.find(
                                (t) => t.value === provider.provider_type
                              )?.label || provider.provider_type,
                            action: _jsx(Switch, {
                              checked: provider.is_active,
                              onChange: () => handleToggleActive(provider),
                            }),
                          }),
                          _jsxs(CardContent, {
                            sx: { flexGrow: 1 },
                            children: [
                              _jsxs(Box, {
                                sx: {
                                  display: "flex",
                                  flexDirection: "column",
                                  gap: 1,
                                },
                                children: [
                                  _jsxs(Box, {
                                    sx: {
                                      display: "flex",
                                      alignItems: "center",
                                      gap: 1,
                                    },
                                    children: [
                                      _jsx(Key, {
                                        className: "w-4 h-4 text-gray-400",
                                      }),
                                      _jsx(Typography, {
                                        variant: "body2",
                                        color: "text.secondary",
                                        children: provider.api_key
                                          ? "••••••••"
                                          : "No API key",
                                      }),
                                    ],
                                  }),
                                  provider.base_url &&
                                    _jsxs(Box, {
                                      sx: {
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 1,
                                      },
                                      children: [
                                        _jsx(Globe, {
                                          className: "w-4 h-4 text-gray-400",
                                        }),
                                        _jsx(Typography, {
                                          variant: "body2",
                                          color: "text.secondary",
                                          noWrap: true,
                                          children: provider.base_url,
                                        }),
                                      ],
                                    }),
                                  provider.description &&
                                    _jsx(Typography, {
                                      variant: "body2",
                                      color: "text.secondary",
                                      children: provider.description,
                                    }),
                                ],
                              }),
                              _jsxs(Box, {
                                sx: { display: "flex", gap: 1, mt: 2 },
                                children: [
                                  _jsx(Button, {
                                    variant: "outlined",
                                    size: "small",
                                    onClick: () => startEdit(provider),
                                    startIcon: _jsx(Edit, {
                                      className: "w-4 h-4",
                                    }),
                                    sx: { flex: 1 },
                                    children: "Edit",
                                  }),
                                  _jsx(Button, {
                                    variant: "contained",
                                    color: "error",
                                    size: "small",
                                    onClick: () => handleDelete(provider.id),
                                    startIcon: _jsx(Trash2, {
                                      className: "w-4 h-4",
                                    }),
                                    sx: { flex: 1 },
                                    children: "Delete",
                                  }),
                                ],
                              }),
                            ],
                          }),
                        ],
                      }),
                    },
                    provider.id
                  )
                ),
              }),
          !isLoading &&
            providers.length === 0 &&
            !showForm &&
            _jsxs(Box, {
              sx: { textAlign: "center", py: 6 },
              children: [
                _jsx(Server, {
                  className: "w-12 h-12 mx-auto text-gray-400 mb-4",
                }),
                _jsx(Typography, {
                  variant: "h6",
                  gutterBottom: true,
                  children: "No model providers",
                }),
                _jsx(Typography, {
                  variant: "body1",
                  color: "text.secondary",
                  gutterBottom: true,
                  children: "Get started by adding your first model provider.",
                }),
                _jsx(Button, {
                  variant: "contained",
                  onClick: startAdd,
                  startIcon: _jsx(Plus, { className: "w-4 h-4" }),
                  children: "Add Provider",
                }),
              ],
            }),
        ],
      }),
    ],
  });
}
export default ModelProvidersManagement;
//# sourceMappingURL=ModelProvidersManagement.js.map
