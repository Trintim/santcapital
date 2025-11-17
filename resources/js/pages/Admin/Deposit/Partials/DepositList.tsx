import Paginate from "@/components/Pagination/Index";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useFilter } from "@/hooks/useFilter";
import { useSort } from "@/hooks/useSort";
import type { SortDirection } from "@/types";
import { filterQueryParams } from "@/utils";
import { router, useForm } from "@inertiajs/react";
import { CheckCircle2, MoreHorizontal, PlusIcon, Search, Trash2, XCircle } from "lucide-react";
import { toast } from "sonner";
import { route } from "ziggy-js";

export interface Deposit {
    id: number;
    amount: number;
    effective_date: string;
    status: string;
    created_at: string;
    customer_plan?: {
        customer?: {
            name?: string;
            email?: string;
        };
        plan?: {
            name?: string;
        };
    };
}

export interface DepositPagination {
    data: Deposit[];
    meta: any;
}

export interface DepositFilters {
    [key: string]: string | number | undefined;
    search?: string;
    "per-page"?: number;
    "sort-by"?: string;
    direction?: SortDirection;
}

export function DepositList({ pagination, filters }: { pagination: DepositPagination; filters: DepositFilters }) {
    const { data, setData } = useForm<DepositFilters>({
        search: filters.search || "",
        "per-page": typeof filters["per-page"] === "number" ? filters["per-page"] : 15,
    });

    const { handleDebounceFilter } = useFilter({
        path: route("admin.deposits.index"),
        initialData: data,
        onDataChange: setData,
    });

    const { handleSort, getSortDirection } = useSort({
        sortBy: filters["sort-by"] || "id",
        sortDirection: filters.direction || "asc",
    });

    const handlePerPage = (perPage: number) => {
        const updatedData = { ...data, "per-page": perPage };

        setData(updatedData);

        router.get(route("admin.deposits.index"), filterQueryParams(updatedData), {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleOnSort = (key: string) => {
        const newSort = handleSort(key);

        const query = { ...data, ...newSort };

        router.get(route("admin.deposits.index"), filterQueryParams(query), {
            preserveState: true,
            preserveScroll: true,
        });
    };

    function approve(id: number) {
        router.post(
            route("admin.deposits.approve", { transaction: id }),
            {},
            {
                onSuccess: () => {
                    toast.success("Aporte aprovado com sucesso.");
                },
                onError: () => {
                    toast.error("Erro ao aprovar o aporte.");
                },
            },
        );
    }

    function reject(id: number) {
        router.post(
            route("admin.deposits.reject", { transaction: id }),
            {},
            {
                onSuccess: () => {
                    toast.success("Aporte rejeitado com sucesso.");
                },
                onError: () => {
                    toast.error("Erro ao rejeitar o aporte.");
                },
            },
        );
    }

    function removeTx(id: number) {
        router.delete(route("admin.deposits.destroy", { transaction: id }), {
            onSuccess: () => {
                toast.success("Aporte excluído com sucesso.");
            },
            onError: () => {
                toast.error("Erro ao excluir o aporte.");
            },
        });
    }

    const hasDeposits = pagination.data.length > 0;

    return (
        <div className="rounded-xl bg-accent px-3 pt-4">
            <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                <h1 className="text-lg font-bold">Aportes</h1>

                <div className="flex items-center gap-2">
                    <Input
                        leftIcon={<Search className="size-4" />}
                        name="search"
                        placeholder="Buscar por nome, email, telefone ou documento"
                        id="search"
                        value={data.search}
                        onChange={handleDebounceFilter}
                        className="w-full sm:max-w-sm"
                    />

                    <Button type="button" size={"sm"} className="cursor-pointer" onClick={() => router.visit(route("admin.deposits.create"))}>
                        <span className="text-xs">Novo aporte</span>
                        <PlusIcon className="size-4" />
                    </Button>
                </div>
            </div>

            <div className="mt-4">
                <div className="overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead sortable sortBy={"id"} sortDirection={getSortDirection("id")} onSort={handleOnSort}>
                                    ID
                                </TableHead>
                                <TableHead>Cliente</TableHead>
                                <TableHead>Plano</TableHead>
                                <TableHead sortable sortBy={"amount"} sortDirection={getSortDirection("amount")} onSort={handleOnSort}>
                                    Valor
                                </TableHead>
                                <TableHead
                                    sortable
                                    sortBy={"effective_date"}
                                    sortDirection={getSortDirection("effective_date")}
                                    onSort={handleOnSort}
                                >
                                    Data
                                </TableHead>
                                <TableHead sortable sortBy={"status"} sortDirection={getSortDirection("status")} onSort={handleOnSort}>
                                    Status
                                </TableHead>
                                <TableHead>
                                    <span className="sr-only">Ações</span>
                                </TableHead>
                            </TableRow>
                        </TableHeader>

                        <TableBody>
                            {!hasDeposits ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="h-24 text-center text-sm text-muted-foreground">
                                        Nenhum aporte encontrado.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                pagination.data.map((t: Deposit, index: number) => (
                                    <TableRow className={"hover:!bg-secondary/10"} key={String(t.id)}>
                                        <TableCell>{index + 1}</TableCell>
                                        <TableCell className={"max-w-32 truncate"}>
                                            <div className="flex flex-col">
                                                {t.customer_plan?.customer?.name}
                                                <span className="text-xs text-muted-foreground"> ({t.customer_plan?.customer?.email})</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className={"max-w-36 truncate"}>{t.customer_plan?.plan?.name}</TableCell>
                                        <TableCell className={"max-w-36 truncate"}>
                                            R$ {Number(t.amount).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                                        </TableCell>

                                        <TableCell>
                                            {new Date(t.effective_date).toLocaleDateString("pt-BR", {
                                                day: "2-digit",
                                                month: "2-digit",
                                                year: "numeric",
                                            })}
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                className={
                                                    t.status === "approved"
                                                        ? "bg-emerald-600 hover:bg-emerald-600"
                                                        : t.status === "rejected"
                                                          ? "bg-red-600 hover:bg-red-600"
                                                          : "bg-yellow-500 hover:bg-yellow-500"
                                                }
                                            >
                                                {t.status === "approved" ? "Aprovado" : t.status === "rejected" ? "Rejeitado" : "Pendente"}
                                            </Badge>
                                        </TableCell>

                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                                        <span className="sr-only">Abrir menu</span>
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuLabel>Ações</DropdownMenuLabel>
                                                    <DropdownMenuSeparator />
                                                    {t.status === "pending" && (
                                                        <>
                                                            <DropdownMenuItem onClick={() => approve(t.id)}>
                                                                <CheckCircle2 className="mr-2 h-4 w-4 text-emerald-600" />
                                                                Aprovar
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => reject(t.id)}>
                                                                <XCircle className="mr-2 h-4 w-4 text-red-600" />
                                                                Rejeitar
                                                            </DropdownMenuItem>
                                                        </>
                                                    )}
                                                    <DropdownMenuItem onClick={() => removeTx(t.id)} className="text-red-600">
                                                        <Trash2 className="mr-2 h-4 w-4" />
                                                        Excluir
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>

            <Paginate meta={pagination?.meta} perPage={Number(data["per-page"])} setPerPage={handlePerPage} />
        </div>
    );
}
