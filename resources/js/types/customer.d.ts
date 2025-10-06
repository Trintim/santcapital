export interface CustomerResource {
    id: number;
    name: string;
    email: string;
    phone: string;
    document: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    additional?: any;
}
