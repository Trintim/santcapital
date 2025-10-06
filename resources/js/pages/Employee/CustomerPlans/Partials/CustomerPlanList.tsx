import Paginate from "@/components/Pagination/Index";
import { StatusBadge } from "@/components/status-badge";
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
import { CustomerPlanResource } from "@/types/customer-plan";
import { PaginationData } from "@/types/pagination";
import { filterQueryParams } from "@/utils";
import { router, useForm } from "@inertiajs/react";
import { Bolt, MoreHorizontal, PlusIcon, Search } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { route } from "ziggy-js";

interface Props {
    pagination: PaginationData<CustomerPlanResource>;
    filters: any;
}

export function CustomerPlanList({ pagination, filters }: Props) {
    const { data, setData } = useForm({
        search: filters.search || "",
        "per-page": filters["per-page"] || 15,
    });

    const { handleDebounceFilter } = useFilter({
        path: route("admin.customer-plans.index"),
        initialData: data,
        onDataChange: setData,
    });

    const { handleSort, getSortDirection } = useSort({
        sortBy: filters["sort-by"] || "status",
        sortDirection: filters.direction || "asc",
    });

    const handlePerPage = (perPage: number) => {
        const updatedData = { ...data, "per-page": perPage };
        setData(updatedData);
        router.get(route("admin.customer-plans.index"), filterQueryParams(updatedData), {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleOnSort = (key: string) => {
        const newSort = handleSort(key);
        const query = { ...data, ...newSort };
        router.get(route("admin.customer-plans.index"), filterQueryParams(query), {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const hasCustomerPlans = pagination.data.length > 0;
    const formatDate = (iso?: string | null) => (iso ? new Date(iso).toLocaleDateString("pt-BR") : "—");

    // Dropdown controlado por linha (fecha antes de abrir dialog)
    const [menuOpenId, setMenuOpenId] = useState<number | null>(null);

    return (
        <div className="rounded-xl bg-accent px-3 pt-4">
            <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                <h1 className="text-lg font-bold">Planos de Clientes</h1>

                <div className="flex items-center gap-2">
                    <Input
                        leftIcon={<Search className="size-4" />}
                        name="search"
                        placeholder="Buscar clientes..."
                        id="search"
                        value={data.search}
                        onChange={handleDebounceFilter}
                        className="w-full sm:max-w-sm"
                    />

                    <Button type="button" size={"sm"} className="cursor-pointer" onClick={() => router.visit(route("admin.customer-plans.create"))}>
                        <span className="text-xs">Vincular plano</span>
                        <PlusIcon className="size-4" />
                    </Button>
                </div>
            </div>

            <div className="mt-4">
                <div className="overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>ID</TableHead>
                                <TableHead sortable sortBy={"name"} sortDirection={getSortDirection("name")} onSort={handleOnSort}>
                                    Cliente
                                </TableHead>
                                <TableHead>Plano</TableHead>
                                <TableHead sortable onSort={() => handleOnSort("chosen_lockup_days")}>
                                    Carência escolhida (dias)
                                </TableHead>
                                <TableHead sortable sortBy={"status"} sortDirection={getSortDirection("status")} onSort={handleOnSort}>
                                    Status
                                </TableHead>
                                <TableHead sortable onSort={() => handleOnSort("activated_on")}>
                                    Ativado em
                                </TableHead>
                                <TableHead>
                                    <span className="sr-only">Ações</span>
                                </TableHead>
                            </TableRow>
                        </TableHeader>

                        <TableBody>
                            {!hasCustomerPlans ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="h-24 text-center text-sm text-muted-foreground">
                                        Nenhum plano de cliente encontrado.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                pagination.data.map((cp: any, index: number) => {
                                    const canActivate = cp.status === "pre_active";
                                    const isMenuOpen = menuOpenId === cp.id;

                                    return (
                                        <TableRow className={"hover:!bg-secondary/10"} key={String(cp.id)}>
                                            <TableCell>{index + 1}</TableCell>
                                            <TableCell>{cp.customer?.name}</TableCell>
                                            <TableCell>{cp.plan?.name}</TableCell>
                                            <TableCell>{cp.chosen_lockup_days || cp.plan?.lockup_days || "—"}</TableCell>
                                            <TableCell>
                                                <StatusBadge status={cp.status} />
                                            </TableCell>
                                            <TableCell>{formatDate(cp.activated_on)}</TableCell>

                                            <TableCell className="text-right">
                                                <DropdownMenu open={isMenuOpen} onOpenChange={(open) => setMenuOpenId(open ? cp.id : null)}>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" className="h-8 w-8 p-0">
                                                            <span className="sr-only">Abrir menu</span>
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuLabel>Ações</DropdownMenuLabel>
                                                        <DropdownMenuSeparator />

                                                        {canActivate && (
                                                            <DropdownMenuItem
                                                                onSelect={(e) => {
                                                                    e.preventDefault();
                                                                    setMenuOpenId(null);
                                                                    (document.activeElement as HTMLElement | null)?.blur?.();
                                                                    router.post(
                                                                        route("admin.customer-plans.activate", { customerPlan: cp.id }),
                                                                        {},
                                                                        {
                                                                            preserveState: true,
                                                                            preserveScroll: true,
                                                                            onSuccess: () => toast.success("Plano ativado com sucesso!"),
                                                                            onError: () => toast.error("Erro ao ativar plano. Tente novamente."),
                                                                        },
                                                                    );
                                                                }}
                                                            >
                                                                <Bolt className="mr-2 h-4 w-4" />
                                                                Ativar plano
                                                            </DropdownMenuItem>
                                                        )}

                                                        <DropdownMenuItem
                                                            onSelect={(e) => {
                                                                e.preventDefault();
                                                                setMenuOpenId(null);
                                                                (document.activeElement as HTMLElement | null)?.blur?.();
                                                                router.visit(route("admin.deposits.create", { cp: cp.id }));
                                                            }}
                                                        >
                                                            Novo aporte
                                                        </DropdownMenuItem>

                                                        <DropdownMenuSeparator />
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>

            <Paginate meta={pagination?.meta} perPage={data["per-page"]} setPerPage={handlePerPage} />
        </div>
    );
}
