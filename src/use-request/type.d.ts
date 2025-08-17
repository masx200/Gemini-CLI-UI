import type { FlatResponseData } from '../axios/type.ts';
import type { AxiosError } from 'axios';
import type Fetch from './Fetch.ts';
import type { CachedData } from './utils/cache.ts';
export type Service<TData, TParams extends any[]> = (...args: TParams) => Promise<TData>;
export type Subscribe = () => void;
export interface FetchState<TData extends FlatResponseData, TParams extends any[]> {
    data: NonNullable<TData['data']>;
    error: AxiosError | null;
    loading: boolean;
    params?: TParams;
    response: TData['response'];
}
export interface PluginReturn<TData extends FlatResponseData, TParams extends any[]> {
    onBefore?: (params: TParams) => ({
        returnNow?: boolean;
        stopNow?: boolean;
    } & Partial<FetchState<FlatResponseData, TParams>>) | null;
    onCancel?: () => void;
    onError?: (e: AxiosError, params: TParams) => void;
    onFinally?: (params: TParams, data?: TData, e?: AxiosError) => void;
    onMutate?: (data: TData['data']) => void;
    onRequest?: (service: Service<TData, TParams>, params: TParams) => {
        servicePromise?: Promise<TData>;
    };
    onSuccess?: (data: TData['data'], params: TParams) => void;
}
export interface Options<TData extends FlatResponseData, TParams extends any[]> {
    cacheKey?: string;
    cacheTime?: number;
    debounceLeading?: boolean;
    debounceMaxWait?: number;
    debounceTrailing?: boolean;
    debounceWait?: number;
    defaultData?: TData['data'];
    defaultParams?: TParams;
    focusTimespan?: number;
    getCache?: (params: TParams) => CachedData<TData, TParams> | undefined;
    loadingDelay?: number;
    manual?: boolean;
    onBefore?: (params: TParams) => void;
    onError?: (e: Error, params: TParams) => void;
    onFinally?: (params: TParams, data: TData['data'] | null, e: Error | null) => void;
    onSuccess?: (data: TData['data'], params: TParams) => void;
    params?: TParams[0];
    pollingErrorRetryCount?: number;
    pollingInterval?: number;
    pollingWhenHidden?: boolean;
    ready?: boolean;
    refreshDepsAction?: () => void;
    refreshOnWindowFocus?: boolean;
    retryCount?: number;
    retryInterval?: number;
    setCache?: (data: CachedData<TData, TParams>) => void;
    staleTime?: number;
    throttleLeading?: boolean;
    throttleTrailing?: boolean;
    throttleWait?: number;
}
export type Plugin<TData extends FlatResponseData, TParams extends any[]> = {
    (fetchInstance: Fetch<TData, TParams>, options: Options<TData, TParams>): PluginReturn<TData, TParams>;
    onInit?: (options: Options<TData, TParams>) => Partial<FetchState<TData, TParams>>;
};
export interface Result<TData extends FlatResponseData, TParams extends any[]> extends FetchState<TData, TParams> {
    cancel: Fetch<TData, TParams>['cancel'];
    mutate: Fetch<TData['data'], TParams>['mutate'];
    refresh: Fetch<TData, TParams>['refresh'];
    refreshAsync: Fetch<TData, TParams>['refreshAsync'];
    run: Fetch<TData, TParams>['run'];
    runAsync: Fetch<TData, TParams>['runAsync'];
}
export type Timeout = ReturnType<typeof setTimeout>;
//# sourceMappingURL=type.d.ts.map