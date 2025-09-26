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
import { formatCpfCnpj, formatPhoneBr } from "@/lib/utils";
import { EmployeeProps } from "@/pages/Admin/Employee/types";
import { filterQueryParams } from "@/utils";
import { router, useForm } from "@inertiajs/react";
import { MoreHorizontal, PlusIcon, Search, Trash2 } from "lucide-react";
import { useRef, useState } from "react";
import { route } from "ziggy-js";

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
        const updatedData = { ...data, "per-page": perPage };
        setData(updatedData);
        router.get(route("admin.employees.index"), filterQueryParams(updatedData), {
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

    // ===== Dropdown controlado por linha (fecha antes do dialog)
    const [menuOpenId, setMenuOpenId] = useState<number | null>(null);

    // ===== AlertDialog CONTROLADO + fix de foco
    const [openDelete, setOpenDelete] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [target, setTarget] = useState<{ id: number; name: string } | null>(null);
    const cancelBtnRef = useRef<HTMLButtonElement | null>(null);

    const askDelete = (id: number, name: string) => {
        setMenuOpenId(null);
        (document.activeElement as HTMLElement | null)?.blur?.();
        requestAnimationFrame(() => {
            setTarget({ id, name });
            setOpenDelete(true);
        });
    };

    const confirmDelete = () => {
        if (!target) return;
        setDeleting(true);
        router.delete(route("admin.employees.destroy", { employee: target.id }), {
            preserveScroll: true,
            onFinish: () => {
                setDeleting(false);
                setOpenDelete(false);
                setTarget(null);
            },
        });
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

                    <Button type="button" size="sm" className="cursor-pointer" onClick={() => router.visit(route("admin.employees.create"))}>
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
                                <TableHead sortable sortBy={"name"} sortDirection={getSortDirection("name")} onSort={handleOnSort}>
                                    Nome
                                </TableHead>
                                <TableHead sortable sortBy={"email"} sortDirection={getSortDirection("email")} onSort={handleOnSort}>
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
                                pagination.data.map((employee, index) => {
                                    const isMenuOpen = menuOpenId === employee.id;

                                    return (
                                        <TableRow className="hover:!bg-secondary/10" key={String(employee.id)}>
                                            <TableCell>{index + 1}</TableCell>
                                            <TableCell className="max-w-32 truncate">{employee.name}</TableCell>
                                            <TableCell className="max-w-36 truncate">{employee.email}</TableCell>
                                            <TableCell>{formatPhoneBr(employee.phone || "")}</TableCell>
                                            <TableCell>{formatCpfCnpj(employee.document || "")}</TableCell>
                                            <TableCell>
                                                {employee.is_active ? (
                                                    <Badge variant="default">Ativo</Badge>
                                                ) : (
                                                    <Badge variant="destructive">Inativo</Badge>
                                                )}
                                            </TableCell>

                                            <TableCell className="text-right">
                                                <DropdownMenu open={isMenuOpen} onOpenChange={(open) => setMenuOpenId(open ? employee.id : null)}>
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
                                                                (document.activeElement as HTMLElement | null)?.blur?.();

                                                                router.patch(
                                                                    route("admin.employees.toggle-active", { employee: employee.id }),
                                                                    {},
                                                                    { preserveState: true, preserveScroll: true },
                                                                );
                                                            }}
                                                        >
                                                            {employee.is_active ? "Desativar" : "Ativar"}
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            onSelect={(e) => {
                                                                e.preventDefault();
                                                                setMenuOpenId(null);
                                                                (document.activeElement as HTMLElement | null)?.blur?.();
                                                                router.visit(route("admin.employees.edit", { employee: employee.id }));
                                                            }}
                                                        >
                                                            Editar
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem
                                                            className="text-destructive focus:text-destructive"
                                                            onSelect={(e) => {
                                                                e.preventDefault();
                                                                askDelete(employee.id, employee.name);
                                                            }}
                                                        >
                                                            <Trash2 className="mr-2 h-4 w-4" />
                                                            Excluir
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

            {/* Modal de confirmação (controlado) */}
            <AlertDialog
                open={openDelete}
                onOpenChange={(o) => {
                    setOpenDelete(o);
                    if (!o) setTarget(null);
                }}
            >
                <AlertDialogContent
                    onOpenAutoFocus={(e) => {
                        e.preventDefault();
                        // opcional: focar o botão cancelar
                        cancelBtnRef.current?.focus();
                    }}
                >
                    <AlertDialogHeader>
                        <AlertDialogTitle>Excluir funcionário?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta ação não pode ser desfeita. O funcionário <span className="font-medium">{target?.name}</span> será removido
                            permanentemente.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel ref={cancelBtnRef} disabled={deleting}>
                            Cancelar
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmDelete}
                            disabled={deleting}
                            className="bg-destructive hover:bg-destructive/90 focus:ring-destructive"
                        >
                            {deleting ? "Removendo..." : "Sim, excluir"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
