import { useState } from "react";
import { Settings, Server } from "lucide-react";
import { Button } from "./ui/button";
import ModelProvidersManagement from "./ModelProvidersManagement";

function ModelProvidersSettings({ isOpen, onClose }) {
  const [showModelProviders, setShowModelProviders] = useState(false);

  if (!isOpen) return null;

  return (
    <>
      <div className="bg-background border border-border md:rounded-lg shadow-xl w-full md:max-w-4xl h-full md:h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-4 md:p-6 border-b border-border flex-shrink-0">
          <div className="flex items-center gap-3">
            <Server className="w-5 h-5 md:w-6 md:h-6 text-blue-600" />
            <h2 className="text-lg md:text-xl font-semibold text-foreground">
              Model Providers Settings
            </h2>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground touch-manipulation"
          >
            Close
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="space-y-6">
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <h3 className="text-lg font-medium text-blue-900 dark:text-blue-100 mb-2">
                Manage AI Model Providers
              </h3>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Configure and manage your AI model providers including OpenAI, Anthropic, Google, and more.
              </p>
            </div>

            <Button
              onClick={() => setShowModelProviders(true)}
              className="w-full md:w-auto"
            >
              <Server className="w-4 h-4 mr-2" />
              Open Model Providers Manager
            </Button>
          </div>
        </div>
      </div>

      <ModelProvidersManagement
        isOpen={showModelProviders}
        onClose={() => setShowModelProviders(false)}
      />
    </>
  );
}

export default ModelProvidersSettings;