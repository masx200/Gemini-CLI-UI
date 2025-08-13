export type ModelProviderType = "openai" | "anthropic" | "gemini" | "bedrock" | "baidu" | "dashscope" | "deepseek" | "volcengine" | "moonshot" | "siliconflow" | "modelscope" | "openrouter" | "pangu" | "xunfei";
export interface ModelProvider {
    id: number;
    provider_name: string;
    provider_type: ModelProviderType;
    api_key: string;
    base_url?: string;
    created_at: Date;
    updated_at: Date;
    is_active: boolean;
    description?: string;
}
export interface CreateModelProviderRequest {
    provider_name: string;
    provider_type: ModelProviderType;
    api_key: string;
    base_url?: string;
    description?: string;
    is_active?: boolean;
}
export interface UpdateModelProviderRequest {
    provider_name: string;
    provider_type: ModelProviderType;
    api_key: string;
    base_url?: string;
    description?: string;
    is_active: boolean;
}
export interface TestProviderResponse {
    success: boolean;
    message: string;
    provider: {
        id: number;
        provider_name: string;
        provider_type: ModelProviderType;
    };
}
//# sourceMappingURL=model-provider.d.ts.map