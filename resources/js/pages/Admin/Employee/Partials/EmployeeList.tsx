// resources/js/pages/Admin/Employee/Partials/EmployeeList.tsx
import Paginate from "@/components/Pagination/Index";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
import { filterQueryParams } from "@/utils";
import { router, useForm } from "@inertiajs/react";
import { CheckCircle2, MoreHorizontal, PlusIcon, Search, XCircle } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { route } from "ziggy-js";
import type { EmployeeProps } from "../types";

export function EmployeeList({ pagination, filters }: Readonly<EmployeeProps>) {
    const { data, setData } = useForm({
        search: filters.search || "",
        "per-page": filters["per-page"] || 15,
    });

    const { handleDebounceFilter } = useFilter({
        path: route("admin.employees.index"),
        initialData: data,
        onDataChange: setData,
    });

    const { handleSort, getSortDirection } = useSort({
        sortBy: filters["sort-by"] || "name",
        sortDirection: filters.direction || "asc",
    });

    const handlePerPage = (perPage: number) => {
        const updated = { ...data, "per-page": perPage };
        setData(updated);
        router.get(route("admin.employees.index"), filterQueryParams(updated), {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleOnSort = (key: string) => {
        const newSort = handleSort(key);
        const query = { ...data, ...newSort };
        router.get(route("admin.employees.index"), filterQueryParams(query), {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const hasEmployees = pagination.data.length > 0;

    // ===== Menu por linha =====
    const [menuOpenId, setMenuOpenId] = useState<number | null>(null);

    // ===== Dialog de exclusão (controlado) =====
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [confirmId, setConfirmId] = useState<number | null>(null);
    const [confirmLabel, setConfirmLabel] = useState<string>("");
    const cancelBtnRef = useRef<HTMLButtonElement | null>(null);

    const openConfirm = (id: number, label: string) => {
        setMenuOpenId(null);
        (document.activeElement as HTMLElement | null)?.blur?.();
        requestAnimationFrame(() => {
            setConfirmId(id);
            setConfirmLabel(label);
            setConfirmOpen(true);
        });
    };

    const doDelete = () => {
        if (!confirmId) return;
        router.delete(route("admin.employees.destroy", { employee: confirmId }), {
            preserveState: true,
            preserveScroll: true,
            onSuccess: () => {
                toast.success("Funcionário excluído com sucesso.");
            },
            onError: () => {
                toast.error("Erro ao excluir funcionário.");
            },
            onFinish: () => setConfirmOpen(false),
        });
    };

    const toggleActive = (id: number) => {
        setMenuOpenId(null);
        (document.activeElement as HTMLElement | null)?.blur?.();
        router.post(
            route("admin.employees.toggle-active", { employee: id }),
            {},
            {
                preserveState: true,
                preserveScroll: true,
                onSuccess: () => {
                    toast.success("Status do funcionário alterado com sucesso.");
                },
                onError: () => {
                    toast.error("Erro ao alterar status do funcionário.");
                },
            },
        );
    };

    return (
        <div className="rounded-xl bg-accent px-3 pt-4">
            <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                <h1 className="text-lg font-bold">Funcionários</h1>

                <div className="flex items-center gap-2">
                    <Input
                        leftIcon={<Search className="size-4" />}
                        name="search"
                        placeholder="Buscar funcionários..."
                        id="search"
                        value={data.search}
                        onChange={handleDebounceFilter}
                        className="w-full sm:max-w-sm"
                    />

                    <Button type="button" size="sm" onClick={() => router.visit(route("admin.employees.create"))}>
                        <span className="text-xs">Novo Funcionário</span>
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
                                <TableHead sortable sortBy="name" sortDirection={getSortDirection("name")} onSort={handleOnSort}>
                                    Nome
                                </TableHead>
                                <TableHead sortable sortBy="email" sortDirection={getSortDirection("email")} onSort={handleOnSort}>
                                    Email
                                </TableHead>
                                <TableHead>Telefone</TableHead>
                                <TableHead>CPF/CNPJ</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>
                                    <span className="sr-only">Ações</span>
                                </TableHead>
                            </TableRow>
                        </TableHeader>

                        <TableBody>
                            {!hasEmployees ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="h-24 text-center text-sm text-muted-foreground">
                                        Nenhum funcionário encontrado.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                pagination.data.map((emp: any, index: number) => {
                                    const isMenuOpen = menuOpenId === emp.id;
                                    return (
                                        <TableRow key={String(emp.id)} className="hover:!bg-secondary/10">
                                            <TableCell>{index + 1}</TableCell>
                                            <TableCell className="max-w-32 truncate">{emp.name}</TableCell>
                                            <TableCell className="max-w-36 truncate">{emp.email}</TableCell>
                                            <TableCell>{emp.phone ?? "—"}</TableCell>
                                            <TableCell>{emp.document ?? "—"}</TableCell>
                                            <TableCell className="whitespace-nowrap">
                                                <Badge
                                                    variant={"default"}
                                                    className={emp.is_active ? "bg-emerald-600 hover:bg-emerald-600" : "bg-red-600 hover:bg-red-600"}
                                                >
                                                    {emp.is_active ? (
                                                        <>
                                                            <CheckCircle2 className="size-4" />
                                                            Ativo
                                                        </>
                                                    ) : (
                                                        <>
                                                            <XCircle className="size-4" />
                                                            Inativo
                                                        </>
                                                    )}
                                                </Badge>
                                            </TableCell>

                                            <TableCell className="text-right">
                                                <DropdownMenu open={isMenuOpen} onOpenChange={(open) => setMenuOpenId(open ? emp.id : null)}>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" className="h-8 w-8 p-0" aria-label="Abrir menu">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuLabel>Ações</DropdownMenuLabel>
                                                        <DropdownMenuItem
                                                            onSelect={(e) => {
                                                                e.preventDefault();
                                                                setMenuOpenId(null);
                                                                router.visit(route("admin.employees.edit", { employee: emp.id }));
                                                            }}
                                                        >
                                                            Editar
                                                        </DropdownMenuItem>

                                                        <DropdownMenuItem
                                                            onSelect={(e) => {
                                                                e.preventDefault();
                                                                toggleActive(emp.id);
                                                            }}
                                                        >
                                                            {emp.is_active ? "Desativar" : "Ativar"}
                                                        </DropdownMenuItem>

                                                        <DropdownMenuSeparator />

                                                        <DropdownMenuItem
                                                            className="text-red-600 focus:text-red-600"
                                                            onSelect={(e) => {
                                                                e.preventDefault();
                                                                openConfirm(emp.id, emp.name);
                                                            }}
                                                        >
                                                            Remover
                                                        </DropdownMenuItem>
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

            {/* Dialog de exclusão com foco seguro */}
            <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
                <AlertDialogContent
                    onOpenAutoFocus={(e) => {
                        e.preventDefault();
                        cancelBtnRef.current?.focus();
                    }}
                >
                    <AlertDialogHeader>
                        <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta ação removerá o funcionário <strong>{confirmLabel}</strong>.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel ref={cancelBtnRef}>Cancelar</AlertDialogCancel>
                        <AlertDialogAction className="bg-red-600 hover:bg-red-700" onClick={doDelete}>
                            Remover
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
