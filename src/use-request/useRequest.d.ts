import type { FlatResponseData } from "../axios/type.ts";
import type { Options, Plugin, Service } from "./type.ts";
declare function useRequest<TData extends FlatResponseData, TParams extends any[]>(service: Service<TData, TParams>, options?: Options<TData, TParams>, plugins?: Plugin<TData, TParams>[]): import("./type.ts").Result<TData, TParams>;
export default useRequest;
//# sourceMappingURL=useRequest.d.ts.map