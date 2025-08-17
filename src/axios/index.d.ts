import { AxiosError } from 'axios';
import type { CreateAxiosDefaults } from 'axios';
import { BACKEND_ERROR_CODE, REQUEST_ID_KEY } from './constant.ts';
import type { FlatRequestInstance, RequestInstance, RequestOption } from './type.ts';
export type * from './type.ts';
export declare function createRequest<ResponseData = any, State = Record<string, unknown>>(axiosConfig?: CreateAxiosDefaults, options?: Partial<RequestOption<ResponseData>>): RequestInstance<State>;
export declare function createFlatRequest<ResponseData = any, State = Record<string, unknown>>(axiosConfig?: CreateAxiosDefaults, options?: Partial<RequestOption<ResponseData>>): FlatRequestInstance<State, ResponseData>;
export { BACKEND_ERROR_CODE, REQUEST_ID_KEY };
export type { AxiosError, CreateAxiosDefaults };
//# sourceMappingURL=index.d.ts.map