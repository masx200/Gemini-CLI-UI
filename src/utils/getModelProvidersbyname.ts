import type { Provider } from "../components/ModelProvidersManagement.tsx";
import { authenticatedFetch } from "./api.ts";
import { fetchOpenAIModels } from "./fetchOpenAIModels.ts";

export async function getModelProvidersbyname(name: string) {
  const url = `/api/model-providers/name/${name}`;
  const res = await authenticatedFetch(url);
  if (!res.ok) {
    throw new Error("Failed to fetch model providers,url=" + url);
  }
  return (await res.json()) as { provider: Provider };
}

export async function getModelsbyProvidername(name: string) {
  const provider = (await getModelProvidersbyname(name)).provider;

  const models = await fetchOpenAIModels({
    OPENAI_API_KEY: provider.api_key,
    OPENAI_BASE_URL: provider.base_url,
  });
  return models;
}
