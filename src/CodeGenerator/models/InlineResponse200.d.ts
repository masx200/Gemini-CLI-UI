export interface InlineResponse200 {
    success: boolean;
    type?: string;
    messageType?: string;
    content?: string;
    error?: string;
    message?: string;
}
export declare function InlineResponse200FromJSON(json: any): InlineResponse200;
export declare function InlineResponse200FromJSONTyped(json: any, ignoreDiscriminator: boolean): InlineResponse200;
export declare function InlineResponse200ToJSON(value?: InlineResponse200 | null): any;
//# sourceMappingURL=InlineResponse200.d.ts.map