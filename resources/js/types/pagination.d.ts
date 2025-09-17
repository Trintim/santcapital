export type PaginationLink = {
    url: string | null;
    label: string;
    active: boolean;
};

export interface PaginationData<T> {
    data: T[];
    links: {
        first: string;
        last: string;
        prev: string | null;
        next: string | null;
    };
    meta: {
        total: number;
        per_page: number;
        current_page: number;
        last_page: number;
        links: PaginationLink[];
        path: string;
        from: number | null;
        to: number | null;
    };
}
