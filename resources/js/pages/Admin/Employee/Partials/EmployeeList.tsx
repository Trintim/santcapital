import Paginate from "@/components/Pagination/Index";
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
import { EmployeeProps } from "@/pages/Admin/Employee/types";
import { filterQueryParams } from "@/utils";
import { router, useForm } from "@inertiajs/react";
import { MoreHorizontal, PlusIcon, Search } from "lucide-react";
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

                    <Button type="button" size={"sm"} className="cursor-pointer" onClick={() => router.visit(route("admin.employees.create"))}>
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
                                pagination.data.map((employee, index) => (
                                    <TableRow className={"hover:!bg-secondary/10"} key={String(employee.id)}>
                                        <TableCell>{index + 1}</TableCell>
                                        <TableCell className={"max-w-32 truncate"}>{employee.name}</TableCell>
                                        <TableCell className={"max-w-36 truncate"}>{employee.email}</TableCell>
                                        <TableCell>{employee.phone}</TableCell>
                                        <TableCell>{employee.document}</TableCell>
                                        <TableCell>{employee.is_active}</TableCell>

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
                                                    <DropdownMenuItem onClick={() => navigator.clipboard.writeText(String(employee.id))}>
                                                        Copiar ID
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem
                                                        onClick={() => router.visit(route("admin.employees.edit", { employee: employee.id }))}
                                                    >
                                                        Editar
                                                    </DropdownMenuItem>
                                                    {/* Exemplo extra:
                        <DropdownMenuItem onClick={() => router.post(`/admin/employees/${id}/toggle-status`)}>
                          Ativar/Desativar
                        </DropdownMenuItem> */}
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
            {/*{console.log(pagination?.meta)}*/}
            <Paginate meta={pagination?.meta} perPage={data["per-page"]} setPerPage={handlePerPage} />
        </div>
    );
}
