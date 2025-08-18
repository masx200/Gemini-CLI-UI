import localforage from "localforage";
export type StorageType = "local" | "session";
export declare function createStorage<T extends object>(type: StorageType, storagePrefix: string): {
    clear(): void;
    get<K extends keyof T>(key: K): T[K] | null;
    remove(key: keyof T): void;
    set<K extends keyof T>(key: K, value: T[K]): void;
};
type LocalForage<T extends object> = Omit<typeof localforage, "getItem" | "removeItem" | "setItem"> & {
    getItem<K extends keyof T>(key: K, callback?: (err: any, value: T[K] | null) => void): Promise<T[K] | null>;
    removeItem(key: keyof T, callback?: (err: any) => void): Promise<void>;
    setItem<K extends keyof T>(key: K, value: T[K], callback?: (err: any, value: T[K]) => void): Promise<T[K]>;
};
type LocalforageDriver = "indexedDB" | "local" | "webSQL";
export declare function createLocalforage<T extends object>(driver: LocalforageDriver): LocalForage<T>;
export {};
//# sourceMappingURL=storage.d.ts.map