import { SortDirection, SortState } from "@/types";
import { useState } from "react";

interface UseSort {
    sortBy: string;
    sortDirection?: SortDirection;
}

export function useSort({ sortBy, sortDirection = "asc" }: UseSort) {
    const [sort, setSort] = useState<SortState>({
        "sort-by": sortBy,
        direction: sortDirection,
    });

    const handleSort = (key: string): SortState => {
        const newSort = {
            "sort-by": key,
            direction: sort["sort-by"] === key && sort.direction === "asc" ? "desc" : "asc",
        } as SortState;

        setSort(newSort);

        return newSort;
    };

    const getSortDirection = (columnKey: string): SortDirection | false => {
        return sort["sort-by"] === columnKey ? sort.direction : false;
    };

    return { sort, handleSort, getSortDirection };
}
