import Paginate from "@/components/Pagination/Index";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import AppLayout from "@/layouts/app-layout";
import { Head, Link, router, useForm } from "@inertiajs/react";
import { Edit2, Search, Trash2 } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { route } from "ziggy-js";

type CustomYield = {
    id: number;
    customer_plan_id: number;
    period: string;
    percent_decimal: string;
    customer_plan?: {
        customer?: { name: string };
        plan?: { name: string };
    };
};

type PaginationMeta = {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    links: { url: string | null; label: string; active: boolean }[];
};

type Props = {
    customYields: { data: CustomYield[]; meta: PaginationMeta };
};

export default function WeeklyYieldsIndex({ customYields, filters }: Props & { filters: Record<string, string | number> }) {
    const { data, setData } = useForm({
        search: filters?.search || "",
        "per-page": filters?.["per-page"] || 15,
        "sort-by": filters?.["sort-by"] || "period",
        direction: filters?.direction || "desc",
    });
    const [perPage, setPerPage] = useState(data["per-page"]);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [toDelete, setToDelete] = useState<{ id: number; label: string } | null>(null);
    const [jobLoading, setJobLoading] = useState(false);
    const deleteCancelRef = useRef<HTMLButtonElement | null>(null);
    const hasItems = customYields.data.length > 0;

    console.log(customYields);

    const handlePerPage = (perPage: number) => {
        setPerPage(perPage);
        setData((prev: typeof data) => ({ ...prev, "per-page": perPage }));
        window.location.href = route("admin.weekly-yields.index", { ...data, "per-page": perPage });
    };

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setData((prev: typeof data) => ({ ...prev, search: e.target.value }));
        window.location.href = route("admin.weekly-yields.index", { ...data, search: e.target.value });
    };

    const openDelete = (item: CustomYield) => {
        setToDelete({ id: item.id, label: `${item.customer_plan?.customer?.name ?? item.customer_plan_id} — ${item.period}` });
        requestAnimationFrame(() => setConfirmOpen(true));
    };

    const doDelete = () => {
        if (!toDelete) return;
        router.delete(route("admin.weekly-yields.delete", { id: toDelete.id }), {
            preserveState: true,
            onSuccess: () => toast.success("Rendimento removido com sucesso."),
            onError: () => toast.error("Erro ao remover rendimento. Tente novamente."),
            onFinish: () => setConfirmOpen(false),
        });
    };

    const handleRunJob = () => {
        setJobLoading(true);
        router.post(
            route("admin.weekly-yields.run-job"),
            {},
            {
                preserveState: true,
                onSuccess: () => {
                    toast.success("Job semanal disparado com sucesso!");
                    window.location.reload();
                },
                onError: () => toast.error("Erro ao executar job semanal."),
                onFinish: () => setJobLoading(false),
            },
        );
    };

    return (
        <AppLayout>
            <Head title="Rendimentos Semanais" />

            <Card className={"bg-accent"}>
                <CardHeader>
                    <CardTitle>Lista de rendimentos semanais</CardTitle>
                    <CardDescription>Rendimentos aplicados manualmente para clientes em seus planos, por semana.</CardDescription>
                </CardHeader>

                <CardContent>
                    {" "}
                    <div className="mb-4 flex items-center justify-between gap-2">
                        <Input
                            leftIcon={<Search className="size-4" />}
                            name="search"
                            placeholder="Buscar cliente..."
                            id="search"
                            value={data.search}
                            onChange={handleSearch}
                            className="w-full sm:max-w-sm"
                        />
                        <div className="flex gap-2">
                            <Link href={route("admin.weekly-yields.create")}>
                                {" "}
                                <Button>Cadastrar rendimento</Button>{" "}
                            </Link>
                            <Button variant="outline" disabled={jobLoading} onClick={handleRunJob}>
                                {jobLoading ? "Executando..." : "Testar Job Semanal"}
                            </Button>
                        </div>
                    </div>
                    {hasItems ? (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Cliente</TableHead>
                                    <TableHead>Plano</TableHead>
                                    <TableHead>Período</TableHead>
                                    <TableHead>Percentual</TableHead>
                                    <TableHead>Ações</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {customYields.data.map((item) => (
                                    <TableRow key={item.id}>
                                        <TableCell>{item.customer_plan?.customer?.name ?? item.customer_plan_id}</TableCell>
                                        <TableCell>{item.customer_plan?.plan?.name ?? "-"}</TableCell>
                                        <TableCell>{item.period}</TableCell>
                                        <TableCell>
                                            <Badge variant={parseFloat(item.percent_decimal) >= 0 ? "default" : "destructive"}>
                                                {parseFloat(item.percent_decimal).toLocaleString("pt-BR", {
                                                    minimumFractionDigits: 2,
                                                    maximumFractionDigits: 2,
                                                })}
                                                %
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Link href={route("admin.weekly-yields.edit", { id: item.id })}>
                                                        <Button variant="outline" size="icon" className="mr-1">
                                                            <Edit2 className="size-4" />
                                                        </Button>
                                                    </Link>
                                                </TooltipTrigger>
                                                <TooltipContent>Editar</TooltipContent>
                                            </Tooltip>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Button variant="destructive" size="icon" onClick={() => openDelete(item)}>
                                                        <Trash2 className="size-4" />
                                                    </Button>
                                                </TooltipTrigger>
                                                <TooltipContent>Remover</TooltipContent>
                                            </Tooltip>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    ) : (
                        <div className="py-12 text-center text-muted-foreground">Nenhum rendimento personalizado cadastrado.</div>
                    )}
                    {hasItems && <Paginate meta={customYields.meta} perPage={perPage} setPerPage={handlePerPage} />}
                </CardContent>
            </Card>
            <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
                <AlertDialogContent
                    onOpenAutoFocus={(e) => {
                        e.preventDefault();
                        deleteCancelRef.current?.focus();
                    }}
                >
                    <AlertDialogHeader>
                        <AlertDialogTitle>Remover rendimento?</AlertDialogTitle>
                    </AlertDialogHeader>
                    <div className="mb-2">{toDelete?.label}</div>
                    <AlertDialogFooter>
                        <AlertDialogCancel ref={deleteCancelRef}>Cancelar</AlertDialogCancel>
                        <AlertDialogAction className="bg-red-600 hover:bg-red-700" onClick={doDelete}>
                            Remover
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AppLayout>
    );
}
