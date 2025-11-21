export type DocumentType = 'photo' | 'invoice' | 'receipt' | 'report' | 'warranty' | 'other';

export type ServiceType =
    | 'oil_change'
    | 'tire_replacement'
    | 'brake_service'
    | 'chain_maintenance'
    | 'engine_repair'
    | 'electrical'
    | 'bodywork'
    | 'general_maintenance'
    | 'inspection'
    | 'custom_modification'
    | 'other';

export interface ServiceDocument {
    id: string;
    user_id: string;
    motorcycle_id: string;
    document_type: DocumentType;
    title: string;
    description: string | null;
    service_type: ServiceType | null;
    service_date: string | null;
    service_mileage: number | null;
    service_provider: string | null;
    cost: number | null;
    currency: string;
    file_path: string;
    file_name: string;
    file_size: number | null;
    file_type: string | null;
    tags: string[] | null;
    is_favorite: boolean;
    created_at: string;
    updated_at: string;
}

export interface ServiceDocumentFormData {
    title: string;
    description: string;
    document_type: DocumentType | '';
    service_type: ServiceType | '';
    service_date: string;
    service_mileage: string;
    service_provider: string;
    cost: string;
    currency: string;
    tags: string;
}

export const SERVICE_TYPE_LABELS: Record<ServiceType, string> = {
    oil_change: 'Oil Change',
    tire_replacement: 'Tire Replacement',
    brake_service: 'Brake Service',
    chain_maintenance: 'Chain Maintenance',
    engine_repair: 'Engine Repair',
    electrical: 'Electrical',
    bodywork: 'Bodywork',
    general_maintenance: 'General Maintenance',
    inspection: 'Inspection',
    custom_modification: 'Custom Modification',
    other: 'Other'
};

export const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
    photo: 'Photo',
    invoice: 'Invoice',
    receipt: 'Receipt',
    report: 'Service Report',
    warranty: 'Warranty',
    other: 'Other'
};
