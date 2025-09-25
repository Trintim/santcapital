export interface PlanResource {
    id: number;
    name: string;
    lockup_days: number;
    minimum_deposit_amount: number;
    description?: string;
    is_active: boolean;
}
