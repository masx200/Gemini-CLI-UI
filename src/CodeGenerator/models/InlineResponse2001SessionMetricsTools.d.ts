import { type InlineResponse2001SessionMetricsToolsTotalDecisions } from "./index.ts";
export interface InlineResponse2001SessionMetricsTools {
    totalCalls?: number;
    totalSuccess?: number;
    totalFail?: number;
    totalDurationMs?: number;
    totalDecisions?: InlineResponse2001SessionMetricsToolsTotalDecisions;
    byName?: object;
}
export declare function InlineResponse2001SessionMetricsToolsFromJSON(json: any): InlineResponse2001SessionMetricsTools;
export declare function InlineResponse2001SessionMetricsToolsFromJSONTyped(json: any, ignoreDiscriminator: boolean): InlineResponse2001SessionMetricsTools;
export declare function InlineResponse2001SessionMetricsToolsToJSON(value?: InlineResponse2001SessionMetricsTools | null): any;
//# sourceMappingURL=InlineResponse2001SessionMetricsTools.d.ts.map