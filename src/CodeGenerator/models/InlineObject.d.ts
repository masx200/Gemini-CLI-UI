export interface InlineObject {
    sessionId: string;
    args: string;
}
export declare function InlineObjectFromJSON(json: any): InlineObject;
export declare function InlineObjectFromJSONTyped(json: any, ignoreDiscriminator: boolean): InlineObject;
export declare function InlineObjectToJSON(value?: InlineObject | null): any;
//# sourceMappingURL=InlineObject.d.ts.map