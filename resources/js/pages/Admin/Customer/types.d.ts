import { SortState } from "@/types";
import { CustomerResource } from "@/types/customer";
import { PaginationData } from "@/types/pagination";

export interface CustomerProps {
    pagination: PaginationData<CustomerResource>;
    filters: SortState & {
        search: string;
        "per-page": number;
    };
}
