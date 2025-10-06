import { CustomerPlanResource } from "./customer-plan";

export interface WithdrawalResource {
    id: number;
    customer_plan: CustomerPlanResource | null;
    amount: number;
    status: string;
    created_at: string;
    updated_at: string;
}
