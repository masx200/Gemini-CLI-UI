import * as runtime from '../runtime.ts';
import { type InlineObject, type InlineResponse200 } from '../models/index.ts';
export interface CommandMcpPostRequest {
    inlineObject?: InlineObject;
}
export interface CommandMcpPost0Request {
    inlineObject?: InlineObject;
}
export interface CommandApiInterface {
    commandMcpPostRaw(requestParameters: CommandMcpPostRequest): Promise<runtime.ApiResponse<InlineResponse200>>;
    commandMcpPost(requestParameters: CommandMcpPostRequest): Promise<InlineResponse200>;
    commandMcpPost_1Raw(requestParameters: CommandMcpPost0Request): Promise<runtime.ApiResponse<InlineResponse200>>;
    commandMcpPost_1(requestParameters: CommandMcpPost0Request): Promise<InlineResponse200>;
}
export declare class CommandApi extends runtime.BaseAPI implements CommandApiInterface {
    commandMcpPostRaw(requestParameters: CommandMcpPostRequest): Promise<runtime.ApiResponse<InlineResponse200>>;
    commandMcpPost(requestParameters: CommandMcpPostRequest): Promise<InlineResponse200>;
    commandMcpPost_1Raw(requestParameters: CommandMcpPost0Request): Promise<runtime.ApiResponse<InlineResponse200>>;
    commandMcpPost_1(requestParameters: CommandMcpPost0Request): Promise<InlineResponse200>;
}
//# sourceMappingURL=CommandApi.d.ts.map