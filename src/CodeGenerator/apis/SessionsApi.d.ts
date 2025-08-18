import { type InlineObject1, type InlineObject2, type InlineResponse2001, type InlineResponse2002 } from "../models/index.ts";
import * as runtime from "../runtime.ts";
export interface SessionsCreatePostRequest {
    inlineObject1?: InlineObject1;
}
export interface SessionsCreatePost0Request {
    inlineObject1?: InlineObject1;
}
export interface SessionsCwdPostRequest {
    inlineObject2?: InlineObject2;
}
export interface SessionsCwdPost0Request {
    inlineObject2?: InlineObject2;
}
export interface SessionsApiInterface {
    sessionsCreatePostRaw(requestParameters: SessionsCreatePostRequest): Promise<runtime.ApiResponse<InlineResponse2001>>;
    sessionsCreatePost(requestParameters: SessionsCreatePostRequest): Promise<InlineResponse2001>;
    sessionsCreatePost_1Raw(requestParameters: SessionsCreatePost0Request): Promise<runtime.ApiResponse<InlineResponse2001>>;
    sessionsCreatePost_1(requestParameters: SessionsCreatePost0Request): Promise<InlineResponse2001>;
    sessionsCwdPostRaw(requestParameters: SessionsCwdPostRequest): Promise<runtime.ApiResponse<InlineResponse2002>>;
    sessionsCwdPost(requestParameters: SessionsCwdPostRequest): Promise<InlineResponse2002>;
    sessionsCwdPost_2Raw(requestParameters: SessionsCwdPost0Request): Promise<runtime.ApiResponse<InlineResponse2002>>;
    sessionsCwdPost_2(requestParameters: SessionsCwdPost0Request): Promise<InlineResponse2002>;
}
export declare class SessionsApi extends runtime.BaseAPI implements SessionsApiInterface {
    sessionsCreatePostRaw(requestParameters: SessionsCreatePostRequest): Promise<runtime.ApiResponse<InlineResponse2001>>;
    sessionsCreatePost(requestParameters: SessionsCreatePostRequest): Promise<InlineResponse2001>;
    sessionsCreatePost_1Raw(requestParameters: SessionsCreatePost0Request): Promise<runtime.ApiResponse<InlineResponse2001>>;
    sessionsCreatePost_1(requestParameters: SessionsCreatePost0Request): Promise<InlineResponse2001>;
    sessionsCwdPostRaw(requestParameters: SessionsCwdPostRequest): Promise<runtime.ApiResponse<InlineResponse2002>>;
    sessionsCwdPost(requestParameters: SessionsCwdPostRequest): Promise<InlineResponse2002>;
    sessionsCwdPost_2Raw(requestParameters: SessionsCwdPost0Request): Promise<runtime.ApiResponse<InlineResponse2002>>;
    sessionsCwdPost_2(requestParameters: SessionsCwdPost0Request): Promise<InlineResponse2002>;
}
//# sourceMappingURL=SessionsApi.d.ts.map