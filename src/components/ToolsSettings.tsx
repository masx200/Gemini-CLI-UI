import BoltIcon from "@mui/icons-material/Bolt";
import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  CircularProgress,
} from "@mui/material";
import {
  AlertTriangle,
  Moon,
  Plus,
  Settings,
  Shield,
  Sun,
  Volume2,
  X,
  Zap,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
//@ts-ignore
import { useTheme } from "../contexts/ThemeContext.jsx";

//@ts-ignore
import type { OpenAIModel } from "../utils/fetchOpenAIModels.ts";
//@ts-ignore
import { Button } from "./ui/button.jsx";
//@ts-ignore
import ModelProvidersSettings from "./ModelProvidersSettings.tsx";
import McpServerManagement, { type Project } from "./mcp-server-management.tsx";
//@ts-ignore
import { useRequest } from "ahooks";
import { getModelsbyProvidername } from "../utils/getModelProvidersbyname.ts";
//@ts-ignore
import { Input } from "./ui/input.jsx";
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
function ToolsSettings({
  isOpen,
  onClose,
  projects = [],
}: {
  isOpen: boolean;
  onClose: () => void;
  projects: Project[];
}) {
  const [selectedProvider, setSelectedProvider] = useState<string>("");
  const { data, error, loading, run } = useRequest<OpenAIModel[], string[]>(
    async function (selectedProvider) {
      if (!selectedProvider) {
        return [];
      }
      const models = await getModelsbyProvidername(selectedProvider);
      return models;
    },
    { manual: true }
  );

  useEffect(() => {
    if (error) {
      console.error(error);
      return;
    }
    if (data && data?.[0]?.id) {
      // console.log(data?.[0]?.id)
      setSelectedModel(data?.[0]?.id);
    }
  }, [error, data]);
  useEffect(() => {
    if (!selectedProvider) {
      return;
    }
    run(selectedProvider);
  }, [selectedProvider]);
  useEffect(() => {
    try {
      setSelectedProvider(
        JSON.parse(localStorage.getItem("gemini-tools-settings") || "")[
          "selectedProvider"
        ]
      );
    } catch (error) {
      console.error("Error loading selectedProvider:", error);
    }
  }, []);
  function getSelectedProvider() {
    return selectedProvider;
  }

  const { isDarkMode, toggleDarkMode } = useTheme();
  const [allowedTools, setAllowedTools] = useState<string[]>([]);
  const [disallowedTools, setDisallowedTools] = useState<string[]>([]);
  const [newAllowedTool, setNewAllowedTool] = useState("");
  const [newDisallowedTool, setNewDisallowedTool] = useState("");
  const [skipPermissions, setSkipPermissions] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [projectSortOrder, setProjectSortOrder] = useState("name");

  const [activeTab, setActiveTab] = useState("tools");
  const [selectedModel, setSelectedModel] = useState("gemini-2.5-flash");
  const [enableNotificationSound, setEnableNotificationSound] = useState(false);

  // Common tool patterns
  const commonTools = [
    "Bash(git log:*)",
    "Bash(git diff:*)",
    "Bash(git status:*)",
    "Write",
    "Read",
    "Edit",
    "Glob",
    "Grep",
    "MultiEdit",
    "Task",
    "TodoWrite",
    "TodoRead",
    "WebFetch",
    "WebSearch",
  ];

  // Available Gemini models (tested and verified)
  const availableModels = useMemo(() => {
    if (data) {
      return data.map((item) => ({
        value: item.id,
        label: item.id,
        description: item.id,
      }));
    }
    return [
      {
        value: "gemini-2.5-flash",
        label: "Gemini 2.5 Flash",
        description: "Fast and efficient latest model (Recommended)",
      },
      {
        value: "gemini-2.5-pro",
        label: "Gemini 2.5 Pro",
        description: "Most advanced model (Note: May have quota limits)",
      },
    ];
  }, [data]);

  useEffect(() => {
    if (isOpen) {
      loadSettings();
    }
  }, [isOpen]);

  const loadSettings = async () => {
    try {
      // Load from localStorage
      const savedSettings = localStorage.getItem("gemini-tools-settings");

      if (savedSettings) {
        const settings = JSON.parse(savedSettings) as ToolsSettingsLocal;
        setAllowedTools(settings.allowedTools || []);
        setDisallowedTools(settings.disallowedTools || []);
        setSkipPermissions(settings.skipPermissions || false);
        setProjectSortOrder(settings.projectSortOrder || "name");
        setSelectedModel(settings.selectedModel || "gemini-2.5-flash");
        setEnableNotificationSound(settings.enableNotificationSound || false);
      } else {
        // Set defaults
        setAllowedTools([]);
        setDisallowedTools([]);
        setSkipPermissions(false);
        setProjectSortOrder("name");
      }

      // Load MCP servers from API
      // await fetchMcpServers();
    } catch (error) {
      // console.error('Error loading tool settings:', error);
      // Set defaults on error
      setAllowedTools([]);
      setDisallowedTools([]);
      setSkipPermissions(false);
      setProjectSortOrder("name");
    }
  };

  const saveSettings = () => {
    setIsSaving(true);
    setSaveStatus(null);

    try {
      const settings: ToolsSettingsLocal = {
        allowedTools,
        disallowedTools,
        skipPermissions,
        projectSortOrder,
        selectedModel,
        enableNotificationSound,
        lastUpdated: new Date().toISOString(),
        selectedProvider,
      } satisfies ToolsSettingsLocal;

      // Save to localStorage
      localStorage.setItem("gemini-tools-settings", JSON.stringify(settings));

      // Trigger storage event for current window
      window.dispatchEvent(
        new StorageEvent("storage", {
          key: "gemini-tools-settings",
          newValue: JSON.stringify(settings),
          oldValue: localStorage.getItem("gemini-tools-settings"),
          storageArea: localStorage,
          url: window.location.href,
        })
      );

      setSaveStatus("success");

      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (error) {
      // console.error('Error saving tool settings:', error);
      setSaveStatus("error");
    } finally {
      setIsSaving(false);
    }
  };

  const addAllowedTool = (tool: string) => {
    if (tool && !allowedTools.includes(tool)) {
      setAllowedTools([...allowedTools, tool]);
      setNewAllowedTool("");
    }
  };

  const removeAllowedTool = (tool: string) => {
    setAllowedTools(allowedTools.filter((t) => t !== tool));
  };

  const addDisallowedTool = (tool: string) => {
    if (tool && !disallowedTools.includes(tool)) {
      setDisallowedTools([...disallowedTools, tool]);
      setNewDisallowedTool("");
    }
  };

  const removeDisallowedTool = (tool: string) => {
    setDisallowedTools(disallowedTools.filter((t) => t !== tool));
  };

  // MCP form handling functions

  // const handleTestConfiguration = async () => {
  //   setMcpConfigTesting(true);
  //   try {
  //     const result = await testMcpConfiguration(mcpFormData);
  //     setMcpConfigTestResult(result);
  //     setMcpConfigTested(true);
  //   } catch (error) {
  //     setMcpConfigTestResult({
  //       success: false,
  //       message: error.message,
  //       details: [],
  //     });
  //     setMcpConfigTested(true);
  //   } finally {
  //     setMcpConfigTesting(false);
  //   }
  // };

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop fixed inset-0 flex items-center justify-center z-[100] md:p-4 bg-background/95">
      <div className="bg-background border border-border md:rounded-lg shadow-xl w-full md:max-w-4xl h-full md:h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-4 md:p-6 border-b border-border flex-shrink-0">
          <div className="flex items-center gap-3">
            <Settings className="w-5 h-5 md:w-6 md:h-6 text-blue-600" />
            <h2 className="text-lg md:text-xl font-semibold text-foreground">
              Settings
            </h2>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground touch-manipulation"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* Tab Navigation */}
          <div className="border-b border-border">
            <div className="flex px-4 md:px-6">
              <button
                onClick={() => setActiveTab("models")}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === "models"
                    ? "border-blue-600 text-blue-600 dark:text-blue-400"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                Models
              </button>
              <button
                onClick={() => setActiveTab("tools")}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === "tools"
                    ? "border-blue-600 text-blue-600 dark:text-blue-400"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                Tools
              </button>
              <button
                onClick={() => setActiveTab("appearance")}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === "appearance"
                    ? "border-blue-600 text-blue-600 dark:text-blue-400"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                Appearance
              </button>

              <button
                onClick={() => setActiveTab("mcp")}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === "mcp"
                    ? "border-blue-600 text-blue-600 dark:text-blue-400"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                MCP
              </button>
            </div>
          </div>

          <div className="p-4 md:p-6 space-y-6 md:space-y-8 pb-safe-area-inset-bottom">
            {activeTab === "models" && (
              <div className="space-y-6 md:space-y-8">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div style={{ backgroundColor: "lightgreen" }}>
                      <BoltIcon sx={{ fontSize: 32 }} />
                    </div>

                    <h3 className="text-lg font-medium text-foreground">
                      Model Providers Settings
                    </h3>
                  </div>
                  <ModelProvidersSettings
                    getSelectedProvider={getSelectedProvider}
                    setSelectedProvider={setSelectedProvider}
                  ></ModelProvidersSettings>
                </div>

                {/* Model Selection */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Zap className="w-5 h-5 text-cyan-500" />
                    <h3 className="text-lg font-medium text-foreground">
                      Gemini Model
                    </h3>
                  </div>
                  <div className="bg-cyan-50 dark:bg-cyan-900/20 border border-cyan-200 dark:border-cyan-800 rounded-lg p-4">
                    <div className="space-y-3">
                      <label className="block text-sm font-medium text-foreground">
                        Select Model
                      </label>
                      {error ? (
                        <p style={{ color: "red" }}>
                          <span>Error:{String(error)}</span>
                        </p>
                      ) : null}
                      <FormControl fullWidth>
                        <InputLabel id="model-select-label">
                          Select Model
                        </InputLabel>
                        <Select
                          labelId="model-select-label"
                          id="model-select"
                          value={selectedModel}
                          onChange={(e) => setSelectedModel(e.target.value)}
                          label="Select Model"
                          disabled={loading}
                          endAdornment={
                            loading ? <CircularProgress size={20} /> : null
                          }
                        >
                          {availableModels.map((model) => (
                            <MenuItem key={model.value} value={model.value}>
                              {model.label}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {
                          availableModels.find((m) => m.value === selectedModel)
                            ?.description
                        }
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {/* Appearance Tab */}
            {activeTab === "appearance" && (
              <div className="space-y-6 md:space-y-8">
                {activeTab === "appearance" && (
                  <div className="space-y-6 md:space-y-8">
                    {/* Theme Settings */}
                    <div className="space-y-4">
                      <div className="bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium text-foreground">
                              Dark Mode
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Toggle between light and dark themes
                            </div>
                          </div>
                          <button
                            onClick={toggleDarkMode}
                            className="relative inline-flex h-8 w-14 items-center rounded-full bg-gray-200 dark:bg-gray-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
                            role="switch"
                            aria-checked={isDarkMode}
                            aria-label="Toggle dark mode"
                          >
                            <span className="sr-only">Toggle dark mode</span>
                            <span
                              className={`${
                                isDarkMode ? "translate-x-7" : "translate-x-1"
                              } inline-block h-6 w-6 transform rounded-full bg-white shadow-lg transition-transform duration-200 flex items-center justify-center`}
                            >
                              {isDarkMode ? (
                                <Moon className="w-3.5 h-3.5 text-gray-700" />
                              ) : (
                                <Sun className="w-3.5 h-3.5 text-yellow-500" />
                              )}
                            </span>
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Project Sorting */}
                    <div className="space-y-4">
                      <div className="bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium text-foreground">
                              Project Sorting
                            </div>
                            <div className="text-sm text-muted-foreground">
                              How projects are ordered in the sidebar
                            </div>
                          </div>
                          <select
                            value={projectSortOrder}
                            onChange={(e) =>
                              setProjectSortOrder(e.target.value)
                            }
                            className="text-sm bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2 w-32"
                          >
                            <option value="name">Alphabetical</option>
                            <option value="date">Recent Activity</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Tools Tab */}
            {activeTab === "tools" && (
              <div className="space-y-6 md:space-y-8">
                {/* Model Selection */}

                {/* Skip Permissions */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="w-5 h-5 text-orange-500" />
                    <h3 className="text-lg font-medium text-foreground">
                      Permission Settings
                    </h3>
                  </div>
                  <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={skipPermissions}
                        onChange={(e) => setSkipPermissions(e.target.checked)}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <div>
                        <div className="font-medium text-orange-900 dark:text-orange-100">
                          YOLO mode - Skip all confirmations
                        </div>
                        <div className="text-sm text-orange-700 dark:text-orange-300">
                          Equivalent to --yolo flag (use with caution)
                        </div>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Notification Sound Settings */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Volume2 className="w-5 h-5 text-blue-500" />
                    <h3 className="text-lg font-medium text-foreground">
                      Notification Settings
                    </h3>
                  </div>
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                    <div className="space-y-3">
                      <label className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={enableNotificationSound}
                          onChange={(e) =>
                            setEnableNotificationSound(e.target.checked)
                          }
                          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <div>
                          <div className="font-medium text-blue-900 dark:text-blue-100">
                            Enable notification sound
                          </div>
                          <div className="text-sm text-blue-700 dark:text-blue-300">
                            Play a sound when Gemini responds
                          </div>
                        </div>
                      </label>
                      {enableNotificationSound && (
                        <button
                          onClick={async () => {
                            const { playNotificationSound } = await import(
                              //@ts-ignore
                              "../utils/notificationSound.js"
                            );
                            // Temporarily enable sound for testing
                            const currentSettings = JSON.parse(
                              localStorage.getItem("gemini-tools-settings") ||
                                "{}"
                            );
                            localStorage.setItem(
                              "gemini-tools-settings",
                              JSON.stringify({
                                ...currentSettings,
                                enableNotificationSound: true,
                              })
                            );
                            playNotificationSound();
                            // Restore original settings
                            localStorage.setItem(
                              "gemini-tools-settings",
                              JSON.stringify(currentSettings)
                            );
                          }}
                          className="ml-7 px-3 py-1 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
                        >
                          Test Sound
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Allowed Tools */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Shield className="w-5 h-5 text-green-500" />
                    <h3 className="text-lg font-medium text-foreground">
                      Allowed Tools
                    </h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Tools that are automatically allowed without prompting for
                    permission
                  </p>

                  <div className="flex flex-col sm:flex-row gap-2">
                    <Input
                      value={newAllowedTool}
                      onChange={(e: any) => setNewAllowedTool(e.target.value)}
                      placeholder='e.g., "Bash(git log:*)" or "Write"'
                      onKeyPress={(e: any) => {
                        if (e.key === "Enter") {
                          addAllowedTool(newAllowedTool);
                        }
                      }}
                      className="flex-1 h-10 touch-manipulation"
                      style={{ fontSize: "16px" }}
                    />
                    <Button
                      onClick={() => addAllowedTool(newAllowedTool)}
                      disabled={!newAllowedTool}
                      size="sm"
                      className="h-10 px-4 touch-manipulation"
                    >
                      <Plus className="w-4 h-4 mr-2 sm:mr-0" />
                      <span className="sm:hidden">Add Tool</span>
                    </Button>
                  </div>

                  {/* Common tools quick add */}
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Quick add common tools:
                    </p>
                    <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2">
                      {commonTools.map((tool) => (
                        <Button
                          key={tool}
                          variant="outline"
                          size="sm"
                          onClick={() => addAllowedTool(tool)}
                          disabled={allowedTools.includes(tool)}
                          className="text-xs h-8 touch-manipulation truncate"
                        >
                          {tool}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    {allowedTools.map((tool) => (
                      <div
                        key={tool}
                        className="flex items-center justify-between bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3"
                      >
                        <span className="font-mono text-sm text-green-800 dark:text-green-200">
                          {tool}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeAllowedTool(tool)}
                          className="text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                    {allowedTools.length === 0 && (
                      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                        No allowed tools configured
                      </div>
                    )}
                  </div>
                </div>

                {/* Disallowed Tools */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="w-5 h-5 text-red-500" />
                    <h3 className="text-lg font-medium text-foreground">
                      Disallowed Tools
                    </h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Tools that are automatically blocked without prompting for
                    permission
                  </p>

                  <div className="flex flex-col sm:flex-row gap-2">
                    <Input
                      value={newDisallowedTool}
                      onChange={(e: any) =>
                        setNewDisallowedTool(e.target.value)
                      }
                      placeholder='e.g., "Bash(rm:*)" or "Write"'
                      onKeyPress={(e: any) => {
                        if (e.key === "Enter") {
                          addDisallowedTool(newDisallowedTool);
                        }
                      }}
                      className="flex-1 h-10 touch-manipulation"
                      style={{ fontSize: "16px" }}
                    />
                    <Button
                      onClick={() => addDisallowedTool(newDisallowedTool)}
                      disabled={!newDisallowedTool}
                      size="sm"
                      className="h-10 px-4 touch-manipulation"
                    >
                      <Plus className="w-4 h-4 mr-2 sm:mr-0" />
                      <span className="sm:hidden">Add Tool</span>
                    </Button>
                  </div>

                  <div className="space-y-2">
                    {disallowedTools.map((tool) => (
                      <div
                        key={tool}
                        className="flex items-center justify-between bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3"
                      >
                        <span className="font-mono text-sm text-red-800 dark:text-red-200">
                          {tool}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeDisallowedTool(tool)}
                          className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                    {disallowedTools.length === 0 && (
                      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                        No disallowed tools configured
                      </div>
                    )}
                  </div>
                </div>

                {/* Help Section */}
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                    Tool Pattern Examples:
                  </h4>
                  <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                    <li>
                      <code className="bg-blue-100 dark:bg-blue-800 px-1 rounded">
                        "Bash(git log:*)"
                      </code>
                      - Allow all git log commands
                    </li>
                    <li>
                      <code className="bg-blue-100 dark:bg-blue-800 px-1 rounded">
                        "Bash(git diff:*)"
                      </code>
                      - Allow all git diff commands
                    </li>
                    <li>
                      <code className="bg-blue-100 dark:bg-blue-800 px-1 rounded">
                        "Write"
                      </code>
                      - Allow all Write tool usage
                    </li>
                    <li>
                      <code className="bg-blue-100 dark:bg-blue-800 px-1 rounded">
                        "Read"
                      </code>
                      - Allow all Read tool usage
                    </li>
                    <li>
                      <code className="bg-blue-100 dark:bg-blue-800 px-1 rounded">
                        "Bash(rm:*)"
                      </code>
                      - Block all rm commands (dangerous)
                    </li>
                  </ul>
                </div>
              </div>
            )}

            {activeTab === "mcp" && (
              <McpServerManagement
                setSaveStatus={setSaveStatus}
                projects={projects}
              />
            )}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 md:p-6 border-t border-border flex-shrink-0 gap-3 pb-safe-area-inset-bottom">
          <div className="flex items-center justify-center sm:justify-start gap-2 order-2 sm:order-1">
            {saveStatus === "success" && (
              <div className="text-green-600 dark:text-green-400 text-sm flex items-center gap-1">
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                Settings saved successfully!
              </div>
            )}
            {saveStatus === "error" && (
              <div className="text-red-600 dark:text-red-400 text-sm flex items-center gap-1">
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                Failed to save settings
              </div>
            )}
          </div>
          <div className="flex items-center gap-3 order-1 sm:order-2">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isSaving}
              className="flex-1 sm:flex-none h-10 touch-manipulation"
            >
              Cancel
            </Button>
            <Button
              onClick={saveSettings}
              disabled={isSaving}
              className="flex-1 sm:flex-none h-10 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 touch-manipulation"
            >
              {isSaving ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Saving...
                </div>
              ) : (
                "Save Settings"
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ToolsSettings;
