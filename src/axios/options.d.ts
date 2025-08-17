import type { CreateAxiosDefaults } from 'axios';
import type { IAxiosRetryConfig } from 'axios-retry';
import type { RequestOption } from './type.ts';
export declare function createDefaultOptions<ResponseData = any>(options?: Partial<RequestOption<ResponseData>>): RequestOption<ResponseData>;
export declare function createRetryOptions(config?: Partial<CreateAxiosDefaults>): IAxiosRetryConfig;
export declare function createAxiosConfig(config?: Partial<CreateAxiosDefaults>): CreateAxiosDefaults<any>;
//# sourceMappingURL=options.d.ts.map