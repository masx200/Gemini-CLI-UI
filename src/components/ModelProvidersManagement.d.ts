export interface ProviderType {
    value: string;
    label: string;
    icon: string;
}
export interface ModelProvidersManagementProps {
    isOpen: boolean;
    onClose: () => void;
}
export interface Provider {
    id: number;
    provider_name: string;
    provider_type: string;
    api_key: string;
    base_url: string;
    description: string;
    is_active: boolean;
}
declare function ModelProvidersManagement({ isOpen, onClose, }: ModelProvidersManagementProps): import("react/jsx-runtime").JSX.Element | null;
export default ModelProvidersManagement;
//# sourceMappingURL=ModelProvidersManagement.d.ts.map