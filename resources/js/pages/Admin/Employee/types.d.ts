import { SortState } from "@/types";
import { EmployeeResource } from "@/types/employee";
import { PaginationData } from "@/types/pagination";

export interface EmployeeProps {
    pagination: PaginationData<EmployeeResource>;
    filters: SortState & {
        search: string;
        "per-page": number;
    };
}
