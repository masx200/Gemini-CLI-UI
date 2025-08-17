import type { Provider } from "../components/ModelProvidersManagement.tsx";
import { authenticatedFetch } from "./api.ts";

export async function getModelProvidersbyname(name: string) {
  const url = `/api/modelproviders/name/${name}`;
  const res = await authenticatedFetch(`/api/modelproviders/name/${name}`);
  if (!res.ok) {
    throw new Error("Failed to fetch model providers,url=" + url);
  }
  return (await res.json()) as { provider: Provider };
}