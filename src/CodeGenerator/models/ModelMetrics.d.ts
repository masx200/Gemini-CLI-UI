import { type InlineResponse2001SessionMetricsApi, type InlineResponse2001SessionMetricsTokens } from './index.ts';
export interface ModelMetrics {
    api: InlineResponse2001SessionMetricsApi;
    tokens: InlineResponse2001SessionMetricsTokens;
}
export declare function ModelMetricsFromJSON(json: any): ModelMetrics;
export declare function ModelMetricsFromJSONTyped(json: any, ignoreDiscriminator: boolean): ModelMetrics;
export declare function ModelMetricsToJSON(value?: ModelMetrics | null): any;
//# sourceMappingURL=ModelMetrics.d.ts.map