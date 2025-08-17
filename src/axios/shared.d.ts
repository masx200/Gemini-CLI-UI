import type { AxiosResponse, InternalAxiosRequestConfig } from "axios";
export declare function getContentType(
  config: InternalAxiosRequestConfig,
): string | number | true | import("axios").AxiosHeaders | string[];
export declare function isHttpSuccess(status: number): boolean;
export declare function isResponseJson(response: AxiosResponse): boolean;
//# sourceMappingURL=shared.d.ts.map
