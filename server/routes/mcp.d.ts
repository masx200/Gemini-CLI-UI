declare const router: import("express-serve-static-core").Router;
export interface ClaudeListServer {
    name: string;
    type: string;
    status: string;
    description: string;
}
export interface ClaudeGetOutput {
    name?: string;
    type?: string;
    command?: string;
    url?: string;
    raw_output?: string;
    parse_error?: string;
    [key: string]: any;
}
export default router;
//# sourceMappingURL=mcp.d.ts.map