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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import AppLayout from "@/layouts/app-layout";
import { Head, router, useForm } from "@inertiajs/react";
import { CheckCircle, MoreHorizontal, XCircle } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";
import { route } from "ziggy-js";

type Withdrawal = {
    id: number;
    amount: number;
    effective_date: string; // ISO
    status: "pending" | "approved" | "rejected";
    created_at?: string;
    customer_plan?: {
        customer?: { name?: string; email?: string };
        plan?: { name?: string };
    };
};

type PageProps = {
    withdrawals: { data: Withdrawal[]; meta?: any };
    filters: { status: string; per_page: number };
};

export default function Index({ withdrawals, filters }: PageProps) {
    // rotas do employee
    const approveRoute = (id: number) => route("employee.withdrawals.approve", { transaction: id });
    const rejectRoute = (id: number) => route("employee.withdrawals.reject", { transaction: id });

    const { data, setData } = useForm({
        status: filters.status || "pending",
        per_page: Number(filters.per_page || 15),
    });

    const go = (patch: Record<string, any>) => {
        router.get(route("employee.withdrawals.index"), { ...data, ...patch }, { preserveScroll: true, preserveState: true });
    };

    const setStatus = (s: string) => {
        setData("status", s);
        go({ status: s });
    };
    const setPerPage = (pp: number) => {
        setData("per_page", pp);
        go({ per_page: pp });
    };

    // controle do Dropdown por linha (evita foco “perdido”)
    const [menuOpenId, setMenuOpenId] = React.useState<number | null>(null);

    // dialogs + refs (foco seguro no "Cancelar")
    const [approveOpen, setApproveOpen] = React.useState(false);
    const [rejectOpen, setRejectOpen] = React.useState(false);
    const [approveCtx, setApproveCtx] = React.useState<{ id: number; label: string } | null>(null);
    const [rejectCtx, setRejectCtx] = React.useState<{ id: number; label: string } | null>(null);
    const approveCancelRef = React.useRef<HTMLButtonElement | null>(null);
    const rejectCancelRef = React.useRef<HTMLButtonElement | null>(null);

    const openApprove = (payload: { id: number; label: string }) => {
        setMenuOpenId(null);
        (document.activeElement as HTMLElement | null)?.blur?.();
        requestAnimationFrame(() => {
            setApproveCtx(payload);
            setApproveOpen(true);
        });
    };

    const openReject = (payload: { id: number; label: string }) => {
        setMenuOpenId(null);
        (document.activeElement as HTMLElement | null)?.blur?.();
        requestAnimationFrame(() => {
            setRejectCtx(payload);
            setRejectOpen(true);
        });
    };

    const doApprove = () => {
        if (!approveCtx) return;
        router.post(
            approveRoute(approveCtx.id),
            {},
            {
                preserveScroll: true,
                onSuccess: () => toast.success("Saque aprovado com sucesso!"),
                onError: () => toast.error("Erro ao aprovar saque. Tente novamente."),
                onFinish: () => setApproveOpen(false),
            },
        );
    };

    const doReject = () => {
        if (!rejectCtx) return;
        router.post(
            rejectRoute(rejectCtx.id),
            {},
            {
                preserveScroll: true,
                onSuccess: () => toast.success("Saque rejeitado com sucesso!"),
                onError: () => toast.error("Erro ao rejeitar saque. Tente novamente."),
                onFinish: () => setRejectOpen(false),
            },
        );
    };

    // helpers
    const fmt = (n: number) => `R$ ${Number(n ?? 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;
    const fmtDate = (iso?: string) => (iso ? new Date(iso).toLocaleDateString("pt-BR") : "—");
    const statusBadge = (s: Withdrawal["status"]) => {
        if (s === "approved") return <Badge>aprovado</Badge>;
        if (s === "pending") return <Badge variant="secondary">pendente</Badge>;
        return <Badge variant="destructive">rejeitado</Badge>;
    };

    const hasRows = withdrawals?.data?.length > 0;

    return (
        <AppLayout>
            <Head title="Solicitações de saque" />
            <div className="rounded-xl bg-accent px-3 pt-4">
                <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                    <h1 className="text-lg font-bold">Solicitações de saque</h1>
                </div>
                <div className="mt-4 mb-3 flex items-center gap-2">
                    <Button size="sm" variant={data.status === "pending" ? "default" : "outline"} onClick={() => setStatus("pending")}>
                        Pendentes
                    </Button>
                    <Button size="sm" variant={data.status === "approved" ? "default" : "outline"} onClick={() => setStatus("approved")}>
                        Aprovados
                    </Button>
                    <Button size="sm" variant={data.status === "rejected" ? "default" : "outline"} onClick={() => setStatus("rejected")}>
                        Rejeitados
                    </Button>
                </div>
                <div className="mb-4 rounded-lg">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>ID</TableHead>
                                <TableHead>Cliente</TableHead>
                                <TableHead>Plano</TableHead>
                                <TableHead>Data</TableHead>
                                <TableHead className="text-right">Valor</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">
                                    <span className="sr-only">Ações</span>
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {!hasRows ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="h-24 text-center text-sm text-muted-foreground">
                                        Nada encontrado.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                withdrawals.data.map((w) => {
                                    const label = `${w.customer_plan?.customer?.name ?? "Cliente"} — ${fmt(w.amount)}`;
                                    const menuOpen = menuOpenId === w.id;

                                    return (
                                        <TableRow key={w.id} className="hover:!bg-secondary/10">
                                            <TableCell>{w.id}</TableCell>
                                            <TableCell className="max-w-48 truncate">
                                                {w.customer_plan?.customer?.name ?? "—"}
                                                {w.customer_plan?.customer?.email && (
                                                    <div className="text-xs text-muted-foreground">{w.customer_plan.customer.email}</div>
                                                )}
                                            </TableCell>
                                            <TableCell className="max-w-48 truncate">{w.customer_plan?.plan?.name ?? "—"}</TableCell>
                                            <TableCell>{fmtDate(w.created_at || w.effective_date)}</TableCell>
                                            <TableCell className="text-right">{fmt(w.amount)}</TableCell>
                                            <TableCell>{statusBadge(w.status)}</TableCell>
                                            <TableCell className="text-right">
                                                {w.status === "pending" ? (
                                                    <DropdownMenu open={menuOpen} onOpenChange={(o) => setMenuOpenId(o ? w.id : null)}>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" className="h-8 w-8 p-0">
                                                                <span className="sr-only">Abrir menu</span>
                                                                <MoreHorizontal className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuLabel>Ações</DropdownMenuLabel>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem
                                                                onSelect={(e) => {
                                                                    e.preventDefault();
                                                                    openApprove({ id: w.id, label });
                                                                }}
                                                            >
                                                                <CheckCircle className="mr-2 h-4 w-4" />
                                                                Aprovar
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem
                                                                className="text-red-600 focus:text-red-600"
                                                                onSelect={(e) => {
                                                                    e.preventDefault();
                                                                    openReject({ id: w.id, label });
                                                                }}
                                                            >
                                                                <XCircle className="mr-2 h-4 w-4" />
                                                                Rejeitar
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                ) : (
                                                    <span className="text-muted-foreground">—</span>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </div>
                <div className="mt-3">
                    <Paginate meta={withdrawals?.meta} perPage={data.per_page} setPerPage={setPerPage} />
                </div>
            </div>

            {/* APPROVE dialog */}
            <AlertDialog open={approveOpen} onOpenChange={setApproveOpen}>
                <AlertDialogContent
                    onOpenAutoFocus={(e) => {
                        e.preventDefault();
                        approveCancelRef.current?.focus();
                    }}
                >
                    <AlertDialogHeader>
                        <AlertDialogTitle>Aprovar saque?</AlertDialogTitle>
                        <AlertDialogDescription>{approveCtx?.label}</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel ref={approveCancelRef}>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={doApprove}>Aprovar</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* REJECT dialog */}
            <AlertDialog open={rejectOpen} onOpenChange={setRejectOpen}>
                <AlertDialogContent
                    onOpenAutoFocus={(e) => {
                        e.preventDefault();
                        rejectCancelRef.current?.focus();
                    }}
                >
                    <AlertDialogHeader>
                        <AlertDialogTitle>Rejeitar saque?</AlertDialogTitle>
                        <AlertDialogDescription>{rejectCtx?.label}</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel ref={rejectCancelRef}>Cancelar</AlertDialogCancel>
                        <AlertDialogAction className="bg-red-600 hover:bg-red-700" onClick={doReject}>
                            Rejeitar
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AppLayout>
    );
}
