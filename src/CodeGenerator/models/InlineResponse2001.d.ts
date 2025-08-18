import { type InlineResponse2001Session } from "./index.ts";
export interface InlineResponse2001 {
    success?: boolean;
    error?: string;
    message?: string;
    sessionId?: string;
    session?: InlineResponse2001Session;
}
export declare function InlineResponse2001FromJSON(json: any): InlineResponse2001;
export declare function InlineResponse2001FromJSONTyped(json: any, ignoreDiscriminator: boolean): InlineResponse2001;
export declare function InlineResponse2001ToJSON(value?: InlineResponse2001 | null): any;
//# sourceMappingURL=InlineResponse2001.d.ts.map