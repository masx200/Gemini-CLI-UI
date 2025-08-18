import * as runtime from '../runtime.ts';
import { type InlineObject, type InlineResponse200 } from '../models/index.ts';
export interface CommandMcpPostRequest {
    inlineObject?: InlineObject;
}
export interface McpApiInterface {
    commandMcpPostRaw(requestParameters: CommandMcpPostRequest): Promise<runtime.ApiResponse<InlineResponse200>>;
    commandMcpPost(requestParameters: CommandMcpPostRequest): Promise<InlineResponse200>;
}
export declare class McpApi extends runtime.BaseAPI implements McpApiInterface {
    commandMcpPostRaw(requestParameters: CommandMcpPostRequest): Promise<runtime.ApiResponse<InlineResponse200>>;
    commandMcpPost(requestParameters: CommandMcpPostRequest): Promise<InlineResponse200>;
}
//# sourceMappingURL=McpApi.d.ts.map