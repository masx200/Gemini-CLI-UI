import type { FlatResponseData } from '../axios/type.ts';
import type { Options, Plugin, Result, Service } from './type.ts';
declare function useRequestImplement<TData extends FlatResponseData<T, ResponseData>, TParams extends any[], T = any, ResponseData = any>(service: Service<TData, TParams>, options?: Options<TData, TParams>, plugins?: Plugin<TData, TParams>[]): Result<TData, TParams>;
export default useRequestImplement;
//# sourceMappingURL=useRequestImplement.d.ts.map