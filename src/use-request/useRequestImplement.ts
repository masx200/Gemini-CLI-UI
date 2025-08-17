import type { FlatResponseData } from '../axios/type.ts';
import { useCreation, useLatest, useMemoizedFn, useUnmount, useUpdate } from 'ahooks';
import Fetch from './Fetch.ts';
import type { Options, Plugin, Result, Service } from './type.ts';

function useRequestImplement<
  TData extends FlatResponseData<T, ResponseData>,
  TParams extends any[],
  T = any,
  ResponseData = any
>(
  service: Service<TData, TParams>,
  options: Options<TData, TParams> = {},
  plugins: Plugin<TData, TParams>[] = []
): Result<TData, TParams> {
  const { manual = false, ready = true, ...rest } = options;

  const fetchOptions = {
    manual,
    ready,
    ...rest
  };

  const serviceRef = useLatest(service);

  const update = useUpdate();

  const fetchInstance = useCreation(() => {
     //@ts-ignore
    return new Fetch<TData, TParams>(serviceRef, fetchOptions, update);
  }, []);

  // run all plugins hooks
  fetchInstance.pluginImpls = plugins.map(p => p(fetchInstance, fetchOptions));

  useUnmount(() => {
    fetchInstance.cancel();
  });

  return {
    cancel: useMemoizedFn(fetchInstance.cancel.bind(fetchInstance)),
    data: fetchInstance.state.data,
    error: fetchInstance.state.error,
    loading: fetchInstance.state.loading,
    mutate: useMemoizedFn(fetchInstance.mutate.bind(fetchInstance)),
    params: fetchInstance.state.params || [],
    refresh: useMemoizedFn(fetchInstance.refresh.bind(fetchInstance)),
    refreshAsync: useMemoizedFn(fetchInstance.refreshAsync.bind(fetchInstance)),
    run: useMemoizedFn(fetchInstance.run.bind(fetchInstance)),
    runAsync: useMemoizedFn(fetchInstance.runAsync.bind(fetchInstance))
  } as Result<TData, TParams>;
}

export default useRequestImplement;
