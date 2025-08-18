//@ts-ignore
import { useRequest } from "ahooks";
//@ts-ignore
import styles from "./aboutview.module.css";
import { useEffect } from "react";
const data = {
  gitCommit: "14e6d3c0",
  success: true,
  itemData: {
    type: "about",
    cliVersion: "0.0.7",
    osVersion: "win32",
    modelVersion: "kimi-k2-instruct",
    selectedAuthType: "openai",
    gcpProject: "",
  },
  baseTimestamp: 1755501426410,
};

export type AboutViewData = typeof data;
export default function AboutView() {
  const settings = localStorage.getItem("qwen-tools-settings");

  if (!settings) {
    return (
      <div className={styles.aboutview}>
        <h1
          className={styles.aboutview}
          style={{ color: "red", fontSize: "40px" }}
        >
          <strong>no settings found</strong>
          <p>please click the settings button to configure</p>
        </h1>
      </div>
    );
  }
  const model = (() => {
    try {
      return JSON.parse(settings)?.selectedModel;
    } catch (error) {
      console.error("error parsing settings", error);
    }
  })();
  const { data, error, loading, run } = useRequest<
    AboutViewData | null,
    string[]
  >(
    async function (model) {
      if (!model) {
        return null;
      }
      const models = await getaboutbymodel(model);
      return models;
    },
    { manual: true }
  );
  useEffect(() => {
    if (!model) {
      return;
    }
    run(model);
  }, [model]);

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };
  if (error) {
    return (
      <div className={styles.aboutview}>
        <h1
          className={styles.aboutview}
          style={{ color: "red", fontSize: "40px" }}
        >
          <strong>error loading about view</strong>
          <p>{error.message}</p>
        </h1>
      </div>
    );
  }
  if (loading) {
    return (
      <div className={styles.aboutview}>
        <h1
          className={styles.aboutview}
          style={{ color: "gray", fontSize: "40px" }}
        >
          <strong>loading about view...</strong>
        </h1>
      </div>
    );
  }
  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          About qwen code cli UI
        </h1>

        <div className="space-y-4">
          <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              System Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  CLI Version:
                </span>
                <p className="text-gray-900 dark:text-white">
                  {data?.itemData.cliVersion}
                </p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  OS Version:
                </span>
                <p className="text-gray-900 dark:text-white">
                  {data?.itemData.osVersion}
                </p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Model Version:
                </span>
                <p className="text-gray-900 dark:text-white">
                  {data?.itemData.modelVersion}
                </p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Auth Type:
                </span>
                <p className="text-gray-900 dark:text-white capitalize">
                  {data?.itemData.selectedAuthType}
                </p>
              </div>
            </div>
          </div>

          <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              Development Details
            </h2>
            <div className="space-y-2">
              <div>
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Git Commit:
                </span>
                <p className="text-gray-900 dark:text-white font-mono text-sm">
                  {data?.gitCommit}
                </p>
              </div>
              {data?.itemData.gcpProject && (
                <div>
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    GCP Project:
                  </span>
                  <p className="text-gray-900 dark:text-white">
                    {data?.itemData.gcpProject}
                  </p>
                </div>
              )}
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              Build Information
            </h2>
            <div>
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Last Updated:
              </span>
              <p className="text-gray-900 dark:text-white">
                {formatDate(data?.baseTimestamp || 0)}
              </p>
            </div>
          </div>

          {data?.success && (
            <div className="mt-6 p-3 bg-green-50 dark:bg-green-900/20 rounded-md">
              <p className="text-sm text-green-800 dark:text-green-200">
                ✅ System is running successfully
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
async function getaboutbymodel(model: string): Promise<AboutViewData> {
  const token = localStorage.getItem("auth-token");

  // Try to read directly from config files for complete details
  const configResponse = await fetch("/api/qwen/command/about", {
    method: "post",

    body: JSON.stringify({
      model: model,
    }),
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  if (!configResponse.ok) {
    throw new Error("Failed to load about view data");
  }
  const configData = await configResponse.json();
  if (configData.success) {
    return configData as AboutViewData;
  }
  throw new Error("Failed to load about view data");
}
