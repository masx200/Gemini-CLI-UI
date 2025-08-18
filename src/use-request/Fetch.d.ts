import type { FlatResponseData } from "../axios/index.ts";
import type { MutableRefObject } from "react";
import type {
  FetchState,
  Options,
  PluginReturn,
  Service,
  Subscribe,
} from "./type.ts";
export default class Fetch<
  TData extends FlatResponseData,
  TParams extends any[],
> {
  serviceRef: MutableRefObject<Service<TData, TParams>>;
  options: Options<TData, TParams>;
  subscribe: Subscribe;
  pluginImpls: PluginReturn<TData, TParams>[];
  count: number;
  options: Options<TData, TParams>;
  state: FetchState<TData, TParams>;
  constructor(
    serviceRef: MutableRefObject<Service<TData, TParams>>,
    options: Options<TData, TParams>,
    subscribe: Subscribe,
  );
  setState(s?: Partial<FetchState<TData, TParams>>): void;
  runPluginHandler(
    event: keyof PluginReturn<TData, TParams>,
    ...rest: any[]
  ): any;
  runAsync(...params: TParams): Promise<TData>;
  run(...params: TParams): void;
  cancel(): void;
  refresh(): void;
  refreshAsync(): Promise<TData>;
  mutate(data?: TData | ((oldData: TData | null) => TData | null)): void;
}
//# sourceMappingURL=Fetch.d.ts.map
