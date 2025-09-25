export interface EmployeeResource {
    id: number;
    name: string;
    email: string;
    phone?: string;
    document?: string;
    is_active: boolean;
}
