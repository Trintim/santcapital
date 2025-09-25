import { SortState } from "@/types";
import { PaginationData } from "@/types/pagination";
import { PlanResource } from "@/types/plan";

export interface PlanProps {
    pagination: PaginationData<PlanResource>;
    filters: SortState & {
        search: string;
        "per-page": number;
    };
}
