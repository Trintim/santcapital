import { debounce, filterQueryParams } from "@/utils";
import { router } from "@inertiajs/react";
import { FormEvent, useCallback, useMemo } from "react";

interface UseFilterOptions<T extends Record<string, unknown>> {
    path: string;
    initialData: T;
    onDataChange: (data: T) => void;
    debounceTime?: number;
}

export function useFilter<T extends Record<string, unknown>>({ path, initialData, onDataChange, debounceTime = 400 }: UseFilterOptions<T>) {
    const debouncedRequest = useMemo(
        () =>
            debounce((data: T) => {
                router.get(path, filterQueryParams(data), {
                    preserveState: true,
                });
            }, debounceTime),
        [path, debounceTime],
    );

    const handleDebounceFilter = useCallback(
        (event: FormEvent<HTMLInputElement>) => {
            const { name, value } = event.currentTarget;
            const updatedData = { ...initialData, [name]: value } as T;

            onDataChange(updatedData);
            debouncedRequest(updatedData);
        },
        [initialData, onDataChange, debouncedRequest],
    );

    const handleFilter = useCallback(
        (event: FormEvent<HTMLSelectElement>) => {
            const { name, value } = event.currentTarget;
            const updatedData = { ...initialData, [name]: value } as T;

            onDataChange(updatedData);

            router.get(path, filterQueryParams(updatedData), {
                preserveState: true,
            });
        },
        [initialData, onDataChange, path],
    );

    const handleClearFilter = useCallback(
        (updatedData: Partial<T>) => {
            const newData = { ...initialData, ...updatedData } as T;

            onDataChange(newData);

            router.get(path, filterQueryParams(newData), {
                preserveState: true,
            });
        },
        [initialData, onDataChange, path],
    );

    return {
        handleDebounceFilter,
        handleFilter,
        handleClearFilter,
    };
}
