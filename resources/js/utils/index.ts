import { RequestPayload } from "@inertiajs/core";

export function filterQueryParams<T extends object>(data: T): RequestPayload {
    return Object.fromEntries(Object.entries(data).filter(([, v]) => !!v)) as RequestPayload;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function debounce<F extends (...args: any[]) => void>(func: F, delay: number) {
    let timeoutId: ReturnType<typeof setTimeout>;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return function (this: any, ...args: Parameters<F>) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
}
