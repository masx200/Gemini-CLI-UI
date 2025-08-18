type Listener = (data: any) => void;
declare const trigger: (key: string, data: any) => void;
declare const subscribe: (key: string, listener: Listener) => () => void;
export { subscribe, trigger };
//# sourceMappingURL=cacheSubscribe.d.ts.map