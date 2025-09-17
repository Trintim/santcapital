import { SortState } from "@/types";
import { ClientResource } from "@/types/client";
import { PaginationData } from "@/types/pagination";

export interface ClientProps {
    pagination: PaginationData<ClientResource>;
    filters: SortState & {
        search: string;
        "per-page": number;
    };
}
