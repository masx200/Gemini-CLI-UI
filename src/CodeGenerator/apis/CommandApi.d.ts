import * as runtime from "../runtime.ts";
import { type InlineObject, type InlineResponse200 } from "../models/index.ts";
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
    commandToolsPost(requestParameters: CommandToolsPostRequest): Promise<InlineResponse2>;
    commandToolsPostRaw(requestParameters: CommandToolsPostRequest): Promise<runtime.JSONApiResponse<InlineResponse2>>;
}
export interface CommandToolsPostRequest {
    inlineObject: inlineObject2;
}
export interface inlineObject2 {
    sessionId: string;
    args: string;
}
export declare function InlineObjectToJSON2(value?: inlineObject2 | null): any;
export interface InlineResponse2 {
    success: boolean;
    error?: string;
    baseTimestamp: number;
    itemData: {
        type: string;
        text: string;
    };
}
export declare function InlineResponse2FromJSON(json: any): InlineResponse2;
export declare function InlineResponse2FromJSONTyped(json: any, ignoreDiscriminator: boolean): InlineResponse2;
//# sourceMappingURL=CommandApi.d.ts.map