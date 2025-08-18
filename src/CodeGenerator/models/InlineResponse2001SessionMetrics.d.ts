import { type InlineResponse2001SessionMetricsTools, type ModelMetrics } from "./index.ts";
export interface InlineResponse2001SessionMetrics {
    models?: {
        [key: string]: ModelMetrics;
    };
    tools?: InlineResponse2001SessionMetricsTools;
}
export declare function InlineResponse2001SessionMetricsFromJSON(json: any): InlineResponse2001SessionMetrics;
export declare function InlineResponse2001SessionMetricsFromJSONTyped(json: any, ignoreDiscriminator: boolean): InlineResponse2001SessionMetrics;
export declare function InlineResponse2001SessionMetricsToJSON(value?: InlineResponse2001SessionMetrics | null): any;
//# sourceMappingURL=InlineResponse2001SessionMetrics.d.ts.map