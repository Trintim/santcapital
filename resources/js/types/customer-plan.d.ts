import { CustomerResource } from "./customer";
import { PlanResource } from "./plan";

export interface CustomerPlanResource {
    id: number;
    user_id: number;
    plan_id: number;
    status: string;
    activated_on: string | null;
    chosen_lockup_days: number | null;
    customer?: CustomerResource | null;
    plan?: PlanResource | null;
    created_at?: string;
    updated_at?: string;
}
