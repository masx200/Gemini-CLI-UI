import { useRequest } from "ahooks";
import { useEffect } from "react";
import { SessionsApi } from "../CodeGenerator/apis/SessionsApi.ts";
import { CommandApi } from "../CodeGenerator/index.ts";
import { Configuration } from "../CodeGenerator/runtime.ts";

//@ts-ignore
import { MCPServerStatusDisplay } from "./MCPServerStatusDisplay.tsx";
//@ts-ignore
import styles from "./aboutview.module.css";
import { parseMCPServerStatus } from "./parseMCPServerStatus.ts";
export function MCPSERVERSTATUS() {
  const { data, error, loading, run } = useRequest<
    string | null | undefined,
    string[]
  >(
    async function () {
      const content = await fetchMCPSERVERSTATUS();
      return content;
    },
    { manual: true }
  );
  useEffect(() => {
    run();
    //fetchMCPSERVERSTATUS().then(console.log, console.error);
  }, []);
  if (error) {
    return (
      //@ts-ignore
      <div className={styles.aboutview}>
        <h1
          className={styles["aboutview"]}
          style={{ color: "red", fontSize: "40px" }}
        >
          <strong>error loading mcp view</strong>
          <p>{error.message}</p>
        </h1>
      </div>
    );
  }
  if (loading) {
    return (
      <div className={styles["aboutview"]}>
        <h1
          className={styles["aboutview"]}
          style={{ color: "gray", fontSize: "40px" }}
        >
          <strong>loading about mcp...</strong>
        </h1>
      </div>
    );
  }
  const content = data;

  try {
    //@ts-ignore
    const servers = parseMCPServerStatus(content);
    return (
      <div>
        <hr></hr>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            flexDirection: "row",
          }}
        >
          <h1 style={{ fontSize: "20px" }}>mcp server status:</h1>
          <button
            onClick={async () => {
              await refreshMCPSERVERSTATUS();
              location.reload();
            }}
            style={{
              padding: "8px 16px",
              backgroundColor: "#4CAF50",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              marginBottom: "10px",
            }}
          >
            刷新MCP服务器
          </button>
        </div>

        <hr></hr>
        <MCPServerStatusDisplay
          servers={servers}
          loading={loading}
          error={error}
        />
      </div>
    );
  } catch (error: any) {
    return (
      <div className={styles["aboutview"]}>
        <h1
          className={styles["aboutview"]}
          style={{ color: "red", fontSize: "40px" }}
        >
          <strong>error loading mcp view</strong>
          <p>{error.message}</p>
        </h1>
      </div>
    );
  }
}
export async function fetchMCPSERVERSTATUS() {
  const token = localStorage.getItem("auth-token");

  const commandapi = new CommandApi(
    new Configuration({
      headers: {
        "Content-Type": "application/json",

        Authorization: `Bearer ${token}`,
      },
    })
  );
  const sessionid = await getglobalSessionId();

  const data1 = await commandapi.commandMcpPost({
    //@ts-ignore
    inlineObject: { sessionId: sessionid, args: "desc" },
  });
  if (data1.error) {
    throw new Error(data1.error);
  }
  return data1.content?.toString();
}

// 解析MCP服务器状态文本，提取工具信息

export async function getglobalSessionId() {
  const token = localStorage.getItem("auth-token");

  const sessionapi = new SessionsApi(
    new Configuration({
      headers: {
        "Content-Type": "application/json",

        Authorization: `Bearer ${token}`,
      },
    })
  );
  const data1 = await sessionapi.sessionsCwdPost({
    inlineObject2: { cwd: "" },
  });
  if (data1.success) {
    if (data1.sessions?.length) {
      const sessionid = data1.sessions[0];
      return sessionid;
    } else {
      const data2 = await sessionapi.sessionsCreatePost({
        inlineObject1: { cwd: "", argv: [] },
      });
      if (data2.success) {
        const sessionid = data2.sessionId;
        return sessionid;
      } else {
        throw new Error(data2.error);
      }
    }
  } else {
    throw new Error(data1.error);
  }
}

export async function refreshMCPSERVERSTATUS() {
  const token = localStorage.getItem("auth-token");


  const sessionid = await getglobalSessionId();

  return;
}
