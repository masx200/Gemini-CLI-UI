import type { FlatResponseData } from "../axios/type.ts";

import useAutoRunPlugin from "./plugins/useAutoRunPlugin.ts";
import useCachePlugin from "./plugins/useCachePlugin.ts";
import useDebouncePlugin from "./plugins/useDebouncePlugin.ts";
import useLoadingDelayPlugin from "./plugins/useLoadingDelayPlugin.ts";
import usePollingPlugin from "./plugins/usePollingPlugin.ts";
import useRefreshOnWindowFocusPlugin from "./plugins/useRefreshOnWindowFocusPlugin.ts";
import useRetryPlugin from "./plugins/useRetryPlugin.ts";
import useThrottlePlugin from "./plugins/useThrottlePlugin.ts";
import type { Options, Plugin, Service } from "./type.ts";
import useRequestImplement from "./useRequestImplement.ts";

function useRequest<TData extends FlatResponseData, TParams extends any[]>(
  service: Service<TData, TParams>,
  options?: Options<TData, TParams>,
  plugins?: Plugin<TData, TParams>[],
) {
  return useRequestImplement<TData, TParams>(service, options, [
    ...(plugins || []),
    useDebouncePlugin,
    useLoadingDelayPlugin,
    usePollingPlugin,
    useRefreshOnWindowFocusPlugin,
    useThrottlePlugin,
    useAutoRunPlugin,
    useCachePlugin,
    useRetryPlugin,
  ] as Plugin<TData, TParams>[]);
}

export default useRequest;
