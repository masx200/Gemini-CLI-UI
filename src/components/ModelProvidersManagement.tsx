import { Plus, Edit, Trash2, Key, Globe, Server, X } from "lucide-react";
import { useEffect, useState } from "react";
import {
  Button,
  Card,
  CardHeader, CardContent,
  TextField,
  Switch,
  FormControlLabel,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Box,
  Dialog,
  DialogTitle,
  DialogContent, IconButton, Grid
} from "@mui/material";
export interface ProviderType {
  value: string;
  label: string;
  icon: string;
}
const PROVIDER_TYPES: ProviderType[] = [
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
export interface ModelProvidersManagementProps {
  isOpen: boolean;
  onClose: () => void;
}
export interface Provider {
  id: number;
  provider_name: string;
  provider_type: string;
  api_key: string;
  base_url: string;
  description: string;
  is_active: boolean;
}
function ModelProvidersManagement({
  isOpen,
  onClose,
}: ModelProvidersManagementProps) {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [editingProvider, setEditingProvider] = useState<Provider | null>(null);
  const [showForm, setShowForm] = useState<boolean>(false);
  const [formData, setFormData] = useState<{
    provider_name: string;
    provider_type: string;
    api_key: string;
    base_url: string;
    description: string;
    is_active: boolean;
  }>({
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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
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

  const handleDelete = async (id: number) => {
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

  const handleToggleActive = async (provider: Provider) => {
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

  const startEdit = (provider: Provider) => {
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
    <Dialog
      open={isOpen}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      fullScreen
      PaperProps={{
        sx: {
          height: { xs: '100vh', md: '90vh' },
          margin: { xs: 0, md: 2 },
          borderRadius: { xs: 0, md: 2 },
        },
      }}
    >
      <DialogTitle sx={{ m: 0, p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Server className="w-5 h-5 md:w-6 md:h-6 text-blue-600" />
          <Typography variant="h6" component="span">
            Model Providers
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="contained"
            onClick={startAdd}
            startIcon={<Plus className="w-4 h-4" />}
            size="small"
          >
            Add Provider
          </Button>
          <IconButton onClick={onClose} size="small">
            <X className="w-5 h-5" />
          </IconButton>
        </Box>
      </DialogTitle>

        <DialogContent dividers sx={{ p: 2 }}>
          {showForm && (
            <Card sx={{ mb: 2 }}>
              <CardHeader
                title={editingProvider ? "Edit Provider" : "Add New Provider"}
                subheader="Configure a new AI model provider"
              />
              <CardContent>
                <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        id="provider_name"
                        label="Provider Name *"
                        value={formData.provider_name}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            provider_name: e.target.value,
                          })
                        }
                        placeholder="e.g., My OpenAI Provider"
                        required
                      />
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <FormControl fullWidth required>
                        <InputLabel id="provider_type-label">Provider Type *</InputLabel>
                        <Select
                          labelId="provider_type-label"
                          id="provider_type"
                          value={formData.provider_type}
                          onChange={(e) =>
                            setFormData({ ...formData, provider_type: e.target.value })
                          }
                          label="Provider Type *"
                        >
                          {PROVIDER_TYPES.map((type) => (
                            <MenuItem key={type.value} value={type.value}>
                              {type.icon} {type.label}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        id="api_key"
                        label="API Key *"
                        type="password"
                        value={formData.api_key}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            api_key: e.target.value,
                          })
                        }
                        placeholder="Enter your API key"
                        required
                        InputProps={{
                          startAdornment: <Key className="w-4 h-4 text-gray-400 mr-2" />,
                        }}
                      />
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        id="base_url"
                        label="Base URL"
                        value={formData.base_url}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            base_url: e.target.value,
                          })
                        }
                        placeholder="https://api.openai.com/v1"
                        InputProps={{
                          startAdornment: <Globe className="w-4 h-4 text-gray-400 mr-2" />,
                        }}
                      />
                    </Grid>
                  </Grid>

                  <TextField
                    fullWidth
                    id="description"
                    label="Description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        description: e.target.value,
                      })
                    }
                    placeholder="Optional description for this provider"
                    multiline
                    rows={3}
                  />

                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.is_active}
                        onChange={(e) =>
                          setFormData({ ...formData, is_active: e.target.checked })
                        }
                      />
                    }
                    label="Active"
                  />

                  <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                    <Button
                      variant="outlined"
                      onClick={resetForm}
                      disabled={isSaving}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      variant="contained"
                      disabled={isSaving}
                    >
                      {isSaving
                        ? "Saving..."
                        : editingProvider
                        ? "Update"
                        : "Add"}
                    </Button>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          )

          {isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 256 }}>
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </Box>
          ) : (
            <Grid container spacing={2}>
              {providers.map((provider) => (
                <Grid item xs={12} md={6} lg={4} key={provider.id}>
                  <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <CardHeader
                      title={provider.provider_name}
                      subheader={PROVIDER_TYPES.find(
                        (t) => t.value === provider.provider_type
                      )?.label || provider.provider_type}
                      action={
                        <Switch
                          checked={provider.is_active}
                          onChange={() => handleToggleActive(provider)}
                        />
                      }
                    />
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Key className="w-4 h-4 text-gray-400" />
                          <Typography variant="body2" color="text.secondary">
                            {provider.api_key ? "••••••••" : "No API key"}
                          </Typography>
                        </Box>
                        {provider.base_url && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Globe className="w-4 h-4 text-gray-400" />
                            <Typography variant="body2" color="text.secondary" noWrap>
                              {provider.base_url}
                            </Typography>
                          </Box>
                        )}
                        {provider.description && (
                          <Typography variant="body2" color="text.secondary">
                            {provider.description}
                          </Typography>
                        )}
                      </Box>
                      <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => startEdit(provider)}
                          startIcon={<Edit className="w-4 h-4" />}
                          sx={{ flex: 1 }}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="contained"
                          color="error"
                          size="small"
                          onClick={() => handleDelete(provider.id)}
                          startIcon={<Trash2 className="w-4 h-4" />}
                          sx={{ flex: 1 }}
                        >
                          Delete
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}

          {!isLoading && providers.length === 0 && !showForm && (
            <Box sx={{ textAlign: 'center', py: 6 }}>
              <Server className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <Typography variant="h6" gutterBottom>
                No model providers
              </Typography>
              <Typography variant="body1" color="text.secondary" gutterBottom>
                Get started by adding your first model provider.
              </Typography>
              <Button
                variant="contained"
                onClick={startAdd}
                startIcon={<Plus className="w-4 h-4" />}
              >
                Add Provider
              </Button>
            </Box>
          )}
        </DialogContent>
      </Dialog>
    );
  }

export default ModelProvidersManagement;
