interface OpenAIModel {
  id: string;
  object: string;
  created: number;
  owned_by: string;
}
interface OpenAIModelsResponse {
  object: string;
  data: OpenAIModel[];
}
interface FetchModelsParams {
  OPENAI_API_KEY: string;
  OPENAI_BASE_URL: string;
}
declare function fetchOpenAIModels(
  params: FetchModelsParams,
): Promise<OpenAIModel[]>;
export { fetchOpenAIModels };
export type { FetchModelsParams, OpenAIModel, OpenAIModelsResponse };
//# sourceMappingURL=fetchOpenAIModels.d.ts.map
