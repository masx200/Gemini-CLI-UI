import { type InlineResponse2001SessionMetrics } from "./index.ts";
export interface InlineResponse2001Session {
    sessionStartTime?: Date;
    promptCount?: number;
    lastPromptTokenCount?: number;
    metrics?: InlineResponse2001SessionMetrics;
}
export declare function InlineResponse2001SessionFromJSON(json: any): InlineResponse2001Session;
export declare function InlineResponse2001SessionFromJSONTyped(json: any, ignoreDiscriminator: boolean): InlineResponse2001Session;
export declare function InlineResponse2001SessionToJSON(value?: InlineResponse2001Session | null): any;
//# sourceMappingURL=InlineResponse2001Session.d.ts.map