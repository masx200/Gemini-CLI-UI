declare const router: import("express-serve-static-core").Router;
export interface Provider {
    id: number;
    provider_name: string;
    provider_type: string;
    api_key: string;
    base_url: string;
    description: string;
    is_active: boolean;
}
export default router;
//# sourceMappingURL=model-providers.d.ts.map