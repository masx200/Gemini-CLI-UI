declare const data: {
    gitCommit: string;
    success: boolean;
    itemData: {
        type: string;
        cliVersion: string;
        osVersion: string;
        modelVersion: string;
        selectedAuthType: string;
        gcpProject: string;
    };
    baseTimestamp: number;
};
export type AboutViewData = typeof data;
export default function AboutView(): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=AboutView.d.ts.map