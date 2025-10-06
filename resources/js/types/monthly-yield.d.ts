import { PlanResource } from "./plan";

export interface MonthlyYieldResource {
    id: number;
    plan_id: number;
    plan: PlanResource | null;
    period: string;
    yield: number;
    percent_decimal: number;
    created_at: string;
    updated_at: string;
}
