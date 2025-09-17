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
import { ClientProps } from "@/pages/Admin/Clients/types";
import { filterQueryParams } from "@/utils";
import { router, useForm } from "@inertiajs/react";
import { MoreHorizontal, PlusIcon, Search } from "lucide-react";
import { route } from "ziggy-js";

export function ClientList({ pagination, filters }: Readonly<ClientProps>) {
    const { data, setData } = useForm({
        search: filters.search || "",
        "per-page": filters["per-page"] || 15,
    });

    const { handleDebounceFilter } = useFilter({
        path: route("admin.clients.index"),
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

        router.get(route("admin.clients.index"), filterQueryParams(updatedData), {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleOnSort = (key: string) => {
        console.log(key);
        const newSort = handleSort(key);

        const query = { ...data, ...newSort };

        router.get(route("admin.clients.index"), filterQueryParams(query), {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const hasClients = pagination.data.length > 0;

    const headers = ["ID", "Nome", "Email", "Telefone", "CPF/CNPJ", "Status", ""];

    return (
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

                    <Button type="button" size={"sm"} className="cursor-pointer" onClick={() => router.visit("/admin/clients/create")}>
                        <span className="text-xs">Novo Cliente</span>
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
                            {!hasClients ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="h-24 text-center text-sm text-muted-foreground">
                                        Nenhum cliente encontrado.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                pagination.data.map((client, index) => (
                                    <TableRow className={"hover:!bg-secondary/10"} key={String(client.id)}>
                                        <TableCell>{index + 1}</TableCell>
                                        <TableCell className={"max-w-32 truncate"}>{client.name}</TableCell>
                                        <TableCell className={"max-w-36 truncate"}>{client.email}</TableCell>
                                        <TableCell>{client.phone}</TableCell>
                                        <TableCell>{client.document}</TableCell>
                                        <TableCell>{client.is_active}</TableCell>

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
                                                    <DropdownMenuItem onClick={() => navigator.clipboard.writeText(String(client.id))}>
                                                        Copiar ID
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem onClick={() => router.visit(`/admin/clients/${client.id}`)}>
                                                        Ver cliente
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => router.visit(`/admin/clients/${client.id}/edit`)}>
                                                        Editar
                                                    </DropdownMenuItem>
                                                    {/* Exemplo extra:
                        <DropdownMenuItem onClick={() => router.post(`/admin/clients/${id}/toggle-status`)}>
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
            <Paginate meta={pagination?.meta} perPage={data["per-page"]} setPerPage={handlePerPage} />
        </div>
    );
}
