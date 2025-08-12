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

async function fetchOpenAIModels(
  params: FetchModelsParams
): Promise<OpenAIModel[]> {
  const { OPENAI_API_KEY, OPENAI_BASE_URL } = params;

  if (!OPENAI_API_KEY || !OPENAI_BASE_URL) {
    throw new Error("OPENAI_API_KEY and OPENAI_BASE_URL are required");
  }
  const url = `${OPENAI_BASE_URL}/models`.replaceAll("//", "/");
  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(
        `HTTP error! status: ${response.status}` + "\n" + "url=" + url
      );
    }

    const data: OpenAIModelsResponse =
      (await response.json()) as OpenAIModelsResponse;
    return data.data;
  } catch (error) {
    console.error("Error fetching OpenAI models:", error);
    throw error;
  }
}

export { fetchOpenAIModels };
export type { OpenAIModel, OpenAIModelsResponse, FetchModelsParams };
