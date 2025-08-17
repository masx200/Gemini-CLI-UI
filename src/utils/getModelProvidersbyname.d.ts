import type { Provider } from "../components/ModelProvidersManagement.tsx";
export declare function getModelProvidersbyname(name: string): Promise<{
    provider: Provider;
}>;
export declare function getModelsbyProvidername(name: string): Promise<import("./fetchOpenAIModels.ts").OpenAIModel[]>;
//# sourceMappingURL=getModelProvidersbyname.d.ts.map