// resources/js/pages/Employee/Customer/Index.tsx

import Paginate from "@/components/Pagination/Index";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useFilter } from "@/hooks/useFilter";
import { useSort } from "@/hooks/useSort";
import AppLayout from "@/layouts/app-layout";
import { Head, router, useForm } from "@inertiajs/react";
import { CheckCircle2, Eye, MoreHorizontal, PlusIcon, Search, ToggleLeft, XCircle } from "lucide-react";
import { toast } from "sonner";
import { route } from "ziggy-js";

export default function Index({ pagination, filters }) {
    const { data, setData } = useForm({
        search: filters.search || "",
        "per-page": filters["per-page"] || 15,
    });

    const { handleDebounceFilter } = useFilter({
        path: route("employee.customers.index"),
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
        router.get(route("employee.customers.index"), updatedData, { preserveState: true, preserveScroll: true });
    };

    const handleOnSort = (key: string) => {
        const newSort = handleSort(key);
        const query = { ...data, ...newSort };
        router.get(route("employee.customers.index"), query, { preserveState: true, preserveScroll: true });
    };

    const hasClients = pagination.data.length > 0;

    return (
        <AppLayout>
            <Head title="Clientes" />
            <div className="rounded-xl bg-accent px-3 pt-4">
                <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                    <h1 className="text-lg font-bold">Clientes</h1>

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

                        <Button type="button" size="sm" className="cursor-pointer" onClick={() => router.visit(route("employee.customers.create"))}>
                            <span className="text-xs">Novo Cliente</span>
                            <PlusIcon className="size-4" />
                        </Button>
                    </div>
                </div>

                <div className="mt-4 overflow-hidden">
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
                            {!hasClients ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="h-24 text-center text-sm text-muted-foreground">
                                        Nenhum cliente encontrado.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                pagination.data.map((client, index) => (
                                    <TableRow className="hover:!bg-secondary/10" key={String(client.id)}>
                                        <TableCell>{index + 1}</TableCell>
                                        <TableCell className="max-w-32 truncate">{client.name}</TableCell>
                                        <TableCell className="max-w-36 truncate">{client.email}</TableCell>
                                        <TableCell>{client.phone}</TableCell>
                                        <TableCell>{client.document}</TableCell>
                                        <TableCell>
                                            <Badge
                                                variant={"default"}
                                                className={client.is_active ? "bg-emerald-600 hover:bg-emerald-600" : "bg-red-600 hover:bg-red-600"}
                                            >
                                                {client.is_active ? (
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
                                            <DropdownMenu>
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
                                                            router.visit(route("employee.customers.show", { customer: client.id }));
                                                        }}
                                                    >
                                                        <Eye className="mr-2 h-4 w-4" />
                                                        Ver ficha
                                                    </DropdownMenuItem>

                                                    <DropdownMenuItem
                                                        onSelect={(e) => {
                                                            e.preventDefault();
                                                            router.post(
                                                                route("employee.customers.toggle-active", { customer: client.id }),
                                                                {},
                                                                {
                                                                    preserveState: true,
                                                                    onSuccess: () =>
                                                                        toast.success(
                                                                            client.is_active
                                                                                ? "Cliente desativado com sucesso!"
                                                                                : "Cliente ativado com sucesso!",
                                                                        ),
                                                                    onError: () => toast.error("Erro ao alterar status do cliente. Tente novamente."),
                                                                },
                                                            );
                                                        }}
                                                    >
                                                        <ToggleLeft className="mr-2 h-4 w-4" />
                                                        {client.is_active ? "Desativar" : "Ativar"}
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

                <Paginate meta={pagination?.meta} perPage={data["per-page"]} setPerPage={handlePerPage} />
            </div>
        </AppLayout>
    );
}
