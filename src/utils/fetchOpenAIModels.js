async function fetchOpenAIModels(params) {
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
            throw new Error(`HTTP error! status: ${response.status}` + "\n" + "url=" + url);
        }
        const data = (await response.json());
        return data.data;
    }
    catch (error) {
        console.error("Error fetching OpenAI models:", error);
        throw error;
    }
}
export { fetchOpenAIModels };
//# sourceMappingURL=fetchOpenAIModels.js.map