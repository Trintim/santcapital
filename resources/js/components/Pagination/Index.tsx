import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { PaginationData } from "@/types/pagination";
import { Link } from "@inertiajs/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import React from "react";

interface PaginationProps {
    meta: PaginationData<unknown>["meta"];
    perPage: number;
    setPerPage: (perPage: number) => void;
    preserveScroll?: boolean;
    preserveState?: boolean;
    only?: string[];
}

export default function Paginate({ meta, perPage, setPerPage, preserveScroll = true, preserveState = true, only = [] }: PaginationProps) {
    if (!meta) return null;

    const isPrev = (label: string) => /pagination\.previous|&laquo;|«|previous|anterior/i.test(label);
    const isNext = (label: string) => /pagination\.next|&raquo;|»|next|próximo|proximo/i.test(label);

    const prevLink = meta.links.find((l) => isPrev(String(l.label)));
    const nextLink = meta.links.find((l) => isNext(String(l.label)));

    type PageLinkProps = {
        url?: string | null;
        className?: string;
        ariaLabel?: string;
        isActive?: boolean;
        children: React.ReactNode;
    };

    const PageLink = React.memo<PageLinkProps>(function PageLink({ url, className, ariaLabel, isActive, children }) {
        const disabled = !url;
        return (
            <Link
                href={url ?? "#"}
                onClick={(e) => {
                    if (disabled) e.preventDefault();
                }}
                aria-label={ariaLabel}
                aria-disabled={disabled || undefined}
                aria-current={isActive ? "page" : undefined}
                preserveScroll={preserveScroll}
                preserveState={preserveState}
                only={only}
                className={cn(className, disabled && "pointer-events-none opacity-50")}
            >
                {children}
            </Link>
        );
    });

    const arrowBase =
        "cursor-base inline-flex h-8 w-8 items-center justify-center text-muted-foreground bg-background ring-1 ring-inset ring-border/0 hover:bg-accent focus:outline-none transition-colors";

    const pageBase =
        "inline-flex h-8 w-9 items-center justify-center rounded text-xs leading-none font-medium tabular-nums bg-background ring-1 ring-inset ring-border/0 hover:bg-accent hover:text-accent-foreground focus:outline-none transition-colors";

    const pageActive =
        "inline-flex h-8 w-9 items-center justify-center rounded text-xs leading-none font-semibold tabular-nums bg-primary text-primary-foreground ring-1 ring-inset ring-border/0 focus:outline-none";

    const ellipsisBase = "inline-flex h-8 w-9 items-center justify-center text-xs leading-none text-muted-foreground cursor-default";

    return (
        <div className="flex items-center justify-between border-t border-border py-3">
            <div className="flex flex-1 justify-between sm:hidden">
                <PageLink
                    url={prevLink?.url}
                    ariaLabel="prev"
                    className="relative inline-flex items-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                >
                    Anterior
                </PageLink>
                <PageLink
                    url={nextLink?.url}
                    ariaLabel="Próximo"
                    className="relative ml-3 inline-flex items-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                >
                    Próximo
                </PageLink>
            </div>

            <div className="hidden w-full sm:flex sm:flex-1 sm:items-center sm:justify-between">
                <div>
                    <p className="text-sm text-muted-foreground">
                        Mostrando <span className="font-medium">{meta?.from ?? 0}</span> até <span className="font-medium">{meta?.to ?? 0}</span> de{" "}
                        <span className="font-medium">{meta?.total ?? 0}</span> resultados
                    </p>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">por página</span>
                        <Select value={String(perPage)} onValueChange={(v) => setPerPage(Number(v))}>
                            <SelectTrigger className="w-20 bg-background">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    {[5, 15, 25, 50, 75, 100].map((n) => (
                                        <SelectItem key={n} value={String(n)}>
                                            {n}
                                        </SelectItem>
                                    ))}
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </div>

                    <nav aria-label="pagination" className="-space-y-py isolate inline-flex gap-1 rounded-md bg-background py-0.25 shadow-sm">
                        <PageLink url={prevLink?.url} ariaLabel="prev" className={cn(arrowBase, "rounded-l-md")}>
                            <span className="sr-only">Anterior</span>
                            <ChevronLeft aria-hidden="true" className="size-4" />
                        </PageLink>

                        {meta.links
                            .filter((l) => !isPrev(String(l.label)) && !isNext(String(l.label)))
                            .map((link, i) => {
                                const raw = String(link.label).trim();
                                const isEllipsis = raw === "...";
                                const isActive = link.active;

                                if (isEllipsis) {
                                    return (
                                        <span key={`ellipsis-${meta.current_page}-${i}`} className={ellipsisBase}>
                                            …
                                        </span>
                                    );
                                }

                                const number = raw;

                                return (
                                    <PageLink
                                        key={`page-${number}`}
                                        url={link.url || undefined}
                                        ariaLabel={`page-${number}`}
                                        isActive={isActive}
                                        className={isActive ? pageActive : pageBase}
                                    >
                                        <span>{number}</span>
                                    </PageLink>
                                );
                            })}

                        <PageLink url={nextLink?.url} ariaLabel="next" className={cn(arrowBase, "rounded-r-md")}>
                            <span className="sr-only">Próximo</span>
                            <ChevronRight aria-hidden="true" className="size-4" />
                        </PageLink>
                    </nav>
                </div>
            </div>
        </div>
    );
}
