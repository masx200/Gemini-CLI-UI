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
import { useEffect, useState } from "react";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
//@ts-ignore
import { useTheme } from "../contexts/ThemeContext.jsx";
//@ts-ignore
import { Button } from "./ui/button.jsx";
//@ts-ignore
import ModelProvidersSettings from "./ModelProvidersSettings.tsx";
import McpServerManagement from "./mcp-server-management.tsx";
import { Input } from "./ui/input.jsx";
function ToolsSettings({ isOpen, onClose, projects = [] }) {
  const { isDarkMode, toggleDarkMode } = useTheme();
  const [allowedTools, setAllowedTools] = useState([]);
  const [disallowedTools, setDisallowedTools] = useState([]);
  const [newAllowedTool, setNewAllowedTool] = useState("");
  const [newDisallowedTool, setNewDisallowedTool] = useState("");
  const [skipPermissions, setSkipPermissions] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null);
  const [projectSortOrder, setProjectSortOrder] = useState("name");
  const [activeTab, setActiveTab] = useState("tools");
  const [selectedModel, setSelectedModel] = useState("qwen-2.5-flash");
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
  // Available qwen models (tested and verified)
  const availableModels = [
    {
      value: "qwen-2.5-flash",
      label: "qwen 2.5 Flash",
      description: "Fast and efficient latest model (Recommended)",
    },
    {
      value: "qwen-2.5-pro",
      label: "qwen 2.5 Pro",
      description: "Most advanced model (Note: May have quota limits)",
    },
  ];
  useEffect(() => {
    if (isOpen) {
      loadSettings();
    }
  }, [isOpen]);
  const loadSettings = async () => {
    try {
      // Load from localStorage
      const savedSettings = localStorage.getItem("qwen-tools-settings");
      if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        setAllowedTools(settings.allowedTools || []);
        setDisallowedTools(settings.disallowedTools || []);
        setSkipPermissions(settings.skipPermissions || false);
        setProjectSortOrder(settings.projectSortOrder || "name");
        setSelectedModel(settings.selectedModel || "qwen-2.5-flash");
        setEnableNotificationSound(settings.enableNotificationSound || false);
      } else {
        // Set defaults
        setAllowedTools([]);
        setDisallowedTools([]);
        setSkipPermissions(false);
        setProjectSortOrder("name");
      }
      // Load MCP servers from API
      await fetchMcpServers();
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
      const settings = {
        allowedTools,
        disallowedTools,
        skipPermissions,
        projectSortOrder,
        selectedModel,
        enableNotificationSound,
        lastUpdated: new Date().toISOString(),
      };
      // Save to localStorage
      localStorage.setItem("qwen-tools-settings", JSON.stringify(settings));
      // Trigger storage event for current window
      window.dispatchEvent(
        new StorageEvent("storage", {
          key: "qwen-tools-settings",
          newValue: JSON.stringify(settings),
          oldValue: localStorage.getItem("qwen-tools-settings"),
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
  const addAllowedTool = (tool) => {
    if (tool && !allowedTools.includes(tool)) {
      setAllowedTools([...allowedTools, tool]);
      setNewAllowedTool("");
    }
  };
  const removeAllowedTool = (tool) => {
    setAllowedTools(allowedTools.filter((t) => t !== tool));
  };
  const addDisallowedTool = (tool) => {
    if (tool && !disallowedTools.includes(tool)) {
      setDisallowedTools([...disallowedTools, tool]);
      setNewDisallowedTool("");
    }
  };
  const removeDisallowedTool = (tool) => {
    setDisallowedTools(disallowedTools.filter((t) => t !== tool));
  };
  // MCP form handling functions
  const handleTestConfiguration = async () => {
    setMcpConfigTesting(true);
    try {
      const result = await testMcpConfiguration(mcpFormData);
      setMcpConfigTestResult(result);
      setMcpConfigTested(true);
    } catch (error) {
      setMcpConfigTestResult({
        success: false,
        message: error.message,
        details: [],
      });
      setMcpConfigTested(true);
    } finally {
      setMcpConfigTesting(false);
    }
  };
  if (!isOpen) {
    return null;
  }
  return _jsx("div", {
    className:
      "modal-backdrop fixed inset-0 flex items-center justify-center z-[100] md:p-4 bg-background/95",
    children: _jsxs("div", {
      className:
        "bg-background border border-border md:rounded-lg shadow-xl w-full md:max-w-4xl h-full md:h-[90vh] flex flex-col",
      children: [
        _jsxs("div", {
          className:
            "flex items-center justify-between p-4 md:p-6 border-b border-border flex-shrink-0",
          children: [
            _jsxs("div", {
              className: "flex items-center gap-3",
              children: [
                _jsx(Settings, {
                  className: "w-5 h-5 md:w-6 md:h-6 text-blue-600",
                }),
                _jsx("h2", {
                  className: "text-lg md:text-xl font-semibold text-foreground",
                  children: "Settings",
                }),
              ],
            }),
            _jsx(Button, {
              variant: "ghost",
              size: "sm",
              onClick: onClose,
              className:
                "text-muted-foreground hover:text-foreground touch-manipulation",
              children: _jsx(X, { className: "w-5 h-5" }),
            }),
          ],
        }),
        _jsxs("div", {
          className: "flex-1 overflow-y-auto",
          children: [
            _jsx("div", {
              className: "border-b border-border",
              children: _jsxs("div", {
                className: "flex px-4 md:px-6",
                children: [
                  _jsx("button", {
                    onClick: () => setActiveTab("models"),
                    className: `px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                      activeTab === "models"
                        ? "border-blue-600 text-blue-600 dark:text-blue-400"
                        : "border-transparent text-muted-foreground hover:text-foreground"
                    }`,
                    children: "Models",
                  }),
                  _jsx("button", {
                    onClick: () => setActiveTab("tools"),
                    className: `px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                      activeTab === "tools"
                        ? "border-blue-600 text-blue-600 dark:text-blue-400"
                        : "border-transparent text-muted-foreground hover:text-foreground"
                    }`,
                    children: "Tools",
                  }),
                  _jsx("button", {
                    onClick: () => setActiveTab("appearance"),
                    className: `px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                      activeTab === "appearance"
                        ? "border-blue-600 text-blue-600 dark:text-blue-400"
                        : "border-transparent text-muted-foreground hover:text-foreground"
                    }`,
                    children: "Appearance",
                  }),
                  _jsx("button", {
                    onClick: () => setActiveTab("mcp"),
                    className: `px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                      activeTab === "mcp"
                        ? "border-blue-600 text-blue-600 dark:text-blue-400"
                        : "border-transparent text-muted-foreground hover:text-foreground"
                    }`,
                    children: "MCP",
                  }),
                ],
              }),
            }),
            _jsxs("div", {
              className:
                "p-4 md:p-6 space-y-6 md:space-y-8 pb-safe-area-inset-bottom",
              children: [
                activeTab === "models" &&
                  _jsxs("div", {
                    className: "space-y-6 md:space-y-8",
                    children: [
                      _jsx(ModelProvidersSettings, {}),
                      _jsxs("div", {
                        className: "space-y-4",
                        children: [
                          _jsxs("div", {
                            className: "flex items-center gap-3",
                            children: [
                              _jsx(Zap, { className: "w-5 h-5 text-cyan-500" }),
                              _jsx("h3", {
                                className:
                                  "text-lg font-medium text-foreground",
                                children: "qwen Model",
                              }),
                            ],
                          }),
                          _jsx("div", {
                            className:
                              "bg-cyan-50 dark:bg-cyan-900/20 border border-cyan-200 dark:border-cyan-800 rounded-lg p-4",
                            children: _jsxs("div", {
                              className: "space-y-3",
                              children: [
                                _jsx("label", {
                                  className:
                                    "block text-sm font-medium text-foreground",
                                  children: "Select Model",
                                }),
                                _jsx("select", {
                                  value: selectedModel,
                                  onChange: (e) =>
                                    setSelectedModel(e.target.value),
                                  className:
                                    "w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-cyan-500 focus:border-cyan-500",
                                  children: availableModels.map((model) =>
                                    _jsx(
                                      "option",
                                      {
                                        value: model.value,
                                        children: model.label,
                                      },
                                      model.value
                                    )
                                  ),
                                }),
                                _jsx("div", {
                                  className:
                                    "text-sm text-gray-600 dark:text-gray-400",
                                  children: availableModels.find(
                                    (m) => m.value === selectedModel
                                  )?.description,
                                }),
                              ],
                            }),
                          }),
                        ],
                      }),
                    ],
                  }),
                activeTab === "appearance" &&
                  _jsx("div", {
                    className: "space-y-6 md:space-y-8",
                    children:
                      activeTab === "appearance" &&
                      _jsxs("div", {
                        className: "space-y-6 md:space-y-8",
                        children: [
                          _jsx("div", {
                            className: "space-y-4",
                            children: _jsx("div", {
                              className:
                                "bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-lg p-4",
                              children: _jsxs("div", {
                                className: "flex items-center justify-between",
                                children: [
                                  _jsxs("div", {
                                    children: [
                                      _jsx("div", {
                                        className:
                                          "font-medium text-foreground",
                                        children: "Dark Mode",
                                      }),
                                      _jsx("div", {
                                        className:
                                          "text-sm text-muted-foreground",
                                        children:
                                          "Toggle between light and dark themes",
                                      }),
                                    ],
                                  }),
                                  _jsxs("button", {
                                    onClick: toggleDarkMode,
                                    className:
                                      "relative inline-flex h-8 w-14 items-center rounded-full bg-gray-200 dark:bg-gray-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900",
                                    role: "switch",
                                    "aria-checked": isDarkMode,
                                    "aria-label": "Toggle dark mode",
                                    children: [
                                      _jsx("span", {
                                        className: "sr-only",
                                        children: "Toggle dark mode",
                                      }),
                                      _jsx("span", {
                                        className: `${
                                          isDarkMode
                                            ? "translate-x-7"
                                            : "translate-x-1"
                                        } inline-block h-6 w-6 transform rounded-full bg-white shadow-lg transition-transform duration-200 flex items-center justify-center`,
                                        children: isDarkMode
                                          ? _jsx(Moon, {
                                              className:
                                                "w-3.5 h-3.5 text-gray-700",
                                            })
                                          : _jsx(Sun, {
                                              className:
                                                "w-3.5 h-3.5 text-yellow-500",
                                            }),
                                      }),
                                    ],
                                  }),
                                ],
                              }),
                            }),
                          }),
                          _jsx("div", {
                            className: "space-y-4",
                            children: _jsx("div", {
                              className:
                                "bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-lg p-4",
                              children: _jsxs("div", {
                                className: "flex items-center justify-between",
                                children: [
                                  _jsxs("div", {
                                    children: [
                                      _jsx("div", {
                                        className:
                                          "font-medium text-foreground",
                                        children: "Project Sorting",
                                      }),
                                      _jsx("div", {
                                        className:
                                          "text-sm text-muted-foreground",
                                        children:
                                          "How projects are ordered in the sidebar",
                                      }),
                                    ],
                                  }),
                                  _jsxs("select", {
                                    value: projectSortOrder,
                                    onChange: (e) =>
                                      setProjectSortOrder(e.target.value),
                                    className:
                                      "text-sm bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2 w-32",
                                    children: [
                                      _jsx("option", {
                                        value: "name",
                                        children: "Alphabetical",
                                      }),
                                      _jsx("option", {
                                        value: "date",
                                        children: "Recent Activity",
                                      }),
                                    ],
                                  }),
                                ],
                              }),
                            }),
                          }),
                        ],
                      }),
                  }),
                activeTab === "tools" &&
                  _jsxs("div", {
                    className: "space-y-6 md:space-y-8",
                    children: [
                      _jsxs("div", {
                        className: "space-y-4",
                        children: [
                          _jsxs("div", {
                            className: "flex items-center gap-3",
                            children: [
                              _jsx(AlertTriangle, {
                                className: "w-5 h-5 text-orange-500",
                              }),
                              _jsx("h3", {
                                className:
                                  "text-lg font-medium text-foreground",
                                children: "Permission Settings",
                              }),
                            ],
                          }),
                          _jsx("div", {
                            className:
                              "bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4",
                            children: _jsxs("label", {
                              className: "flex items-center gap-3",
                              children: [
                                _jsx("input", {
                                  type: "checkbox",
                                  checked: skipPermissions,
                                  onChange: (e) =>
                                    setSkipPermissions(e.target.checked),
                                  className:
                                    "w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500",
                                }),
                                _jsxs("div", {
                                  children: [
                                    _jsx("div", {
                                      className:
                                        "font-medium text-orange-900 dark:text-orange-100",
                                      children:
                                        "YOLO mode - Skip all confirmations",
                                    }),
                                    _jsx("div", {
                                      className:
                                        "text-sm text-orange-700 dark:text-orange-300",
                                      children:
                                        "Equivalent to --yolo flag (use with caution)",
                                    }),
                                  ],
                                }),
                              ],
                            }),
                          }),
                        ],
                      }),
                      _jsxs("div", {
                        className: "space-y-4",
                        children: [
                          _jsxs("div", {
                            className: "flex items-center gap-3",
                            children: [
                              _jsx(Volume2, {
                                className: "w-5 h-5 text-blue-500",
                              }),
                              _jsx("h3", {
                                className:
                                  "text-lg font-medium text-foreground",
                                children: "Notification Settings",
                              }),
                            ],
                          }),
                          _jsx("div", {
                            className:
                              "bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4",
                            children: _jsxs("div", {
                              className: "space-y-3",
                              children: [
                                _jsxs("label", {
                                  className: "flex items-center gap-3",
                                  children: [
                                    _jsx("input", {
                                      type: "checkbox",
                                      checked: enableNotificationSound,
                                      onChange: (e) =>
                                        setEnableNotificationSound(
                                          e.target.checked
                                        ),
                                      className:
                                        "w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500",
                                    }),
                                    _jsxs("div", {
                                      children: [
                                        _jsx("div", {
                                          className:
                                            "font-medium text-blue-900 dark:text-blue-100",
                                          children: "Enable notification sound",
                                        }),
                                        _jsx("div", {
                                          className:
                                            "text-sm text-blue-700 dark:text-blue-300",
                                          children:
                                            "Play a sound when qwen responds",
                                        }),
                                      ],
                                    }),
                                  ],
                                }),
                                enableNotificationSound &&
                                  _jsx("button", {
                                    onClick: async () => {
                                      const { playNotificationSound } =
                                        await import(
                                          //@ts-ignore
                                          "../utils/notificationSound.js"
                                        );
                                      // Temporarily enable sound for testing
                                      const currentSettings = JSON.parse(
                                        localStorage.getItem(
                                          "qwen-tools-settings"
                                        ) || "{}"
                                      );
                                      localStorage.setItem(
                                        "qwen-tools-settings",
                                        JSON.stringify({
                                          ...currentSettings,
                                          enableNotificationSound: true,
                                        })
                                      );
                                      playNotificationSound();
                                      // Restore original settings
                                      localStorage.setItem(
                                        "qwen-tools-settings",
                                        JSON.stringify(currentSettings)
                                      );
                                    },
                                    className:
                                      "ml-7 px-3 py-1 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors",
                                    children: "Test Sound",
                                  }),
                              ],
                            }),
                          }),
                        ],
                      }),
                      _jsxs("div", {
                        className: "space-y-4",
                        children: [
                          _jsxs("div", {
                            className: "flex items-center gap-3",
                            children: [
                              _jsx(Shield, {
                                className: "w-5 h-5 text-green-500",
                              }),
                              _jsx("h3", {
                                className:
                                  "text-lg font-medium text-foreground",
                                children: "Allowed Tools",
                              }),
                            ],
                          }),
                          _jsx("p", {
                            className: "text-sm text-muted-foreground",
                            children:
                              "Tools that are automatically allowed without prompting for permission",
                          }),
                          _jsxs("div", {
                            className: "flex flex-col sm:flex-row gap-2",
                            children: [
                              _jsx(Input, {
                                value: newAllowedTool,
                                onChange: (e) =>
                                  setNewAllowedTool(e.target.value),
                                placeholder:
                                  'e.g., "Bash(git log:*)" or "Write"',
                                onKeyPress: (e) => {
                                  if (e.key === "Enter") {
                                    addAllowedTool(newAllowedTool);
                                  }
                                },
                                className: "flex-1 h-10 touch-manipulation",
                                style: { fontSize: "16px" },
                              }),
                              _jsxs(Button, {
                                onClick: () => addAllowedTool(newAllowedTool),
                                disabled: !newAllowedTool,
                                size: "sm",
                                className: "h-10 px-4 touch-manipulation",
                                children: [
                                  _jsx(Plus, {
                                    className: "w-4 h-4 mr-2 sm:mr-0",
                                  }),
                                  _jsx("span", {
                                    className: "sm:hidden",
                                    children: "Add Tool",
                                  }),
                                ],
                              }),
                            ],
                          }),
                          _jsxs("div", {
                            className: "space-y-2",
                            children: [
                              _jsx("p", {
                                className:
                                  "text-sm font-medium text-gray-700 dark:text-gray-300",
                                children: "Quick add common tools:",
                              }),
                              _jsx("div", {
                                className:
                                  "grid grid-cols-2 sm:flex sm:flex-wrap gap-2",
                                children: commonTools.map((tool) =>
                                  _jsx(
                                    Button,
                                    {
                                      variant: "outline",
                                      size: "sm",
                                      onClick: () => addAllowedTool(tool),
                                      disabled: allowedTools.includes(tool),
                                      className:
                                        "text-xs h-8 touch-manipulation truncate",
                                      children: tool,
                                    },
                                    tool
                                  )
                                ),
                              }),
                            ],
                          }),
                          _jsxs("div", {
                            className: "space-y-2",
                            children: [
                              allowedTools.map((tool) =>
                                _jsxs(
                                  "div",
                                  {
                                    className:
                                      "flex items-center justify-between bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3",
                                    children: [
                                      _jsx("span", {
                                        className:
                                          "font-mono text-sm text-green-800 dark:text-green-200",
                                        children: tool,
                                      }),
                                      _jsx(Button, {
                                        variant: "ghost",
                                        size: "sm",
                                        onClick: () => removeAllowedTool(tool),
                                        className:
                                          "text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300",
                                        children: _jsx(X, {
                                          className: "w-4 h-4",
                                        }),
                                      }),
                                    ],
                                  },
                                  tool
                                )
                              ),
                              allowedTools.length === 0 &&
                                _jsx("div", {
                                  className:
                                    "text-center py-8 text-gray-500 dark:text-gray-400",
                                  children: "No allowed tools configured",
                                }),
                            ],
                          }),
                        ],
                      }),
                      _jsxs("div", {
                        className: "space-y-4",
                        children: [
                          _jsxs("div", {
                            className: "flex items-center gap-3",
                            children: [
                              _jsx(AlertTriangle, {
                                className: "w-5 h-5 text-red-500",
                              }),
                              _jsx("h3", {
                                className:
                                  "text-lg font-medium text-foreground",
                                children: "Disallowed Tools",
                              }),
                            ],
                          }),
                          _jsx("p", {
                            className: "text-sm text-muted-foreground",
                            children:
                              "Tools that are automatically blocked without prompting for permission",
                          }),
                          _jsxs("div", {
                            className: "flex flex-col sm:flex-row gap-2",
                            children: [
                              _jsx(Input, {
                                value: newDisallowedTool,
                                onChange: (e) =>
                                  setNewDisallowedTool(e.target.value),
                                placeholder: 'e.g., "Bash(rm:*)" or "Write"',
                                onKeyPress: (e) => {
                                  if (e.key === "Enter") {
                                    addDisallowedTool(newDisallowedTool);
                                  }
                                },
                                className: "flex-1 h-10 touch-manipulation",
                                style: { fontSize: "16px" },
                              }),
                              _jsxs(Button, {
                                onClick: () =>
                                  addDisallowedTool(newDisallowedTool),
                                disabled: !newDisallowedTool,
                                size: "sm",
                                className: "h-10 px-4 touch-manipulation",
                                children: [
                                  _jsx(Plus, {
                                    className: "w-4 h-4 mr-2 sm:mr-0",
                                  }),
                                  _jsx("span", {
                                    className: "sm:hidden",
                                    children: "Add Tool",
                                  }),
                                ],
                              }),
                            ],
                          }),
                          _jsxs("div", {
                            className: "space-y-2",
                            children: [
                              disallowedTools.map((tool) =>
                                _jsxs(
                                  "div",
                                  {
                                    className:
                                      "flex items-center justify-between bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3",
                                    children: [
                                      _jsx("span", {
                                        className:
                                          "font-mono text-sm text-red-800 dark:text-red-200",
                                        children: tool,
                                      }),
                                      _jsx(Button, {
                                        variant: "ghost",
                                        size: "sm",
                                        onClick: () =>
                                          removeDisallowedTool(tool),
                                        className:
                                          "text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300",
                                        children: _jsx(X, {
                                          className: "w-4 h-4",
                                        }),
                                      }),
                                    ],
                                  },
                                  tool
                                )
                              ),
                              disallowedTools.length === 0 &&
                                _jsx("div", {
                                  className:
                                    "text-center py-8 text-gray-500 dark:text-gray-400",
                                  children: "No disallowed tools configured",
                                }),
                            ],
                          }),
                        ],
                      }),
                      _jsxs("div", {
                        className:
                          "bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4",
                        children: [
                          _jsx("h4", {
                            className:
                              "font-medium text-blue-900 dark:text-blue-100 mb-2",
                            children: "Tool Pattern Examples:",
                          }),
                          _jsxs("ul", {
                            className:
                              "text-sm text-blue-800 dark:text-blue-200 space-y-1",
                            children: [
                              _jsxs("li", {
                                children: [
                                  _jsx("code", {
                                    className:
                                      "bg-blue-100 dark:bg-blue-800 px-1 rounded",
                                    children: '"Bash(git log:*)"',
                                  }),
                                  "- Allow all git log commands",
                                ],
                              }),
                              _jsxs("li", {
                                children: [
                                  _jsx("code", {
                                    className:
                                      "bg-blue-100 dark:bg-blue-800 px-1 rounded",
                                    children: '"Bash(git diff:*)"',
                                  }),
                                  "- Allow all git diff commands",
                                ],
                              }),
                              _jsxs("li", {
                                children: [
                                  _jsx("code", {
                                    className:
                                      "bg-blue-100 dark:bg-blue-800 px-1 rounded",
                                    children: '"Write"',
                                  }),
                                  "- Allow all Write tool usage",
                                ],
                              }),
                              _jsxs("li", {
                                children: [
                                  _jsx("code", {
                                    className:
                                      "bg-blue-100 dark:bg-blue-800 px-1 rounded",
                                    children: '"Read"',
                                  }),
                                  "- Allow all Read tool usage",
                                ],
                              }),
                              _jsxs("li", {
                                children: [
                                  _jsx("code", {
                                    className:
                                      "bg-blue-100 dark:bg-blue-800 px-1 rounded",
                                    children: '"Bash(rm:*)"',
                                  }),
                                  "- Block all rm commands (dangerous)",
                                ],
                              }),
                            ],
                          }),
                        ],
                      }),
                    ],
                  }),
                activeTab === "mcp" &&
                  _jsx(McpServerManagement, { projects: projects }),
              ],
            }),
          ],
        }),
        _jsxs("div", {
          className:
            "flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 md:p-6 border-t border-border flex-shrink-0 gap-3 pb-safe-area-inset-bottom",
          children: [
            _jsxs("div", {
              className:
                "flex items-center justify-center sm:justify-start gap-2 order-2 sm:order-1",
              children: [
                saveStatus === "success" &&
                  _jsxs("div", {
                    className:
                      "text-green-600 dark:text-green-400 text-sm flex items-center gap-1",
                    children: [
                      _jsx("svg", {
                        className: "w-4 h-4",
                        fill: "currentColor",
                        viewBox: "0 0 20 20",
                        children: _jsx("path", {
                          fillRule: "evenodd",
                          d: "M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z",
                          clipRule: "evenodd",
                        }),
                      }),
                      "Settings saved successfully!",
                    ],
                  }),
                saveStatus === "error" &&
                  _jsxs("div", {
                    className:
                      "text-red-600 dark:text-red-400 text-sm flex items-center gap-1",
                    children: [
                      _jsx("svg", {
                        className: "w-4 h-4",
                        fill: "currentColor",
                        viewBox: "0 0 20 20",
                        children: _jsx("path", {
                          fillRule: "evenodd",
                          d: "M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z",
                          clipRule: "evenodd",
                        }),
                      }),
                      "Failed to save settings",
                    ],
                  }),
              ],
            }),
            _jsxs("div", {
              className: "flex items-center gap-3 order-1 sm:order-2",
              children: [
                _jsx(Button, {
                  variant: "outline",
                  onClick: onClose,
                  disabled: isSaving,
                  className: "flex-1 sm:flex-none h-10 touch-manipulation",
                  children: "Cancel",
                }),
                _jsx(Button, {
                  onClick: saveSettings,
                  disabled: isSaving,
                  className:
                    "flex-1 sm:flex-none h-10 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 touch-manipulation",
                  children: isSaving
                    ? _jsxs("div", {
                        className: "flex items-center gap-2",
                        children: [
                          _jsx("div", {
                            className:
                              "w-4 h-4 animate-spin rounded-full border-2 border-white border-t-transparent",
                          }),
                          "Saving...",
                        ],
                      })
                    : "Save Settings",
                }),
              ],
            }),
          ],
        }),
      ],
    }),
  });
}
export default ToolsSettings;
//# sourceMappingURL=ToolsSettings.js.map
