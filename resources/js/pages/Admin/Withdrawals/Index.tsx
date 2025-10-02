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
import { useRef, useState } from "react";
import { toast } from "sonner";
import { route } from "ziggy-js";

export default function Index({ withdrawals, filters }: any) {
    const approveRoute = (id: number) => route(`admin.withdrawals.approve`, { transaction: id });
    const rejectRoute = (id: number) => route(`admin.withdrawals.reject`, { transaction: id });

    const { data, setData } = useForm({
        status: filters.status || "pending",
        per_page: Number(filters.per_page || 15),
    });

    const go = (patch: any) => {
        router.get(route(`admin.withdrawals.index`), { ...data, ...patch }, { preserveScroll: true, preserveState: true });
    };

    const setStatus = (s: string) => {
        setData("status", s);
        go({ status: s });
    };
    const setPerPage = (pp: number) => {
        setData("per_page", pp);
        go({ per_page: pp });
    };

    // dialogs + refs para foco seguro
    const [confirmApprove, setConfirmApprove] = useState<{ id: number; label: string } | null>(null);
    const [confirmReject, setConfirmReject] = useState<{ id: number; label: string } | null>(null);
    const cancelApproveRef = useRef<HTMLButtonElement | null>(null);
    const cancelRejectRef = useRef<HTMLButtonElement | null>(null);

    const openApprove = (payload: { id: number; label: string }) => {
        // 1) desfoca o trigger do dropdown
        (document.activeElement as HTMLElement | null)?.blur?.();
        // 2) aguarda o menu fechar, então abre o dialog
        requestAnimationFrame(() => setConfirmApprove(payload));
    };

    const openReject = (payload: { id: number; label: string }) => {
        (document.activeElement as HTMLElement | null)?.blur?.();
        requestAnimationFrame(() => setConfirmReject(payload));
    };

    const doApprove = () => {
        if (!confirmApprove) return;
        router.post(
            approveRoute(confirmApprove.id),
            {},
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success("Saque aprovado com sucesso.");
                },
                onError: () => {
                    toast.error("Erro ao aprovar o saque.");
                },
                onFinish: () => setConfirmApprove(null),
            },
        );
    };

    const doReject = () => {
        if (!confirmReject) return;
        router.post(
            rejectRoute(confirmReject.id),
            {},
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success("Saque rejeitado com sucesso.");
                },
                onError: () => {
                    toast.error("Erro ao rejeitar o saque.");
                },
                onFinish: () => setConfirmReject(null),
            },
        );
    };

    const fmt = (n: number) => `R$ ${n.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;
    const fmtDate = (iso: string) => new Date(iso).toLocaleDateString("pt-BR");

    const statusBadge = (s: string) => {
        if (s === "approved") return <Badge>aprovado</Badge>;
        if (s === "pending") return <Badge variant="secondary">pendente</Badge>;
        return <Badge variant="destructive">rejeitado</Badge>;
    };

    return (
        <AppLayout>
            <Head title="Solicitações de saque" />

            <div className="mb-3 flex items-center gap-2">
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

            <div className="rounded-lg border bg-card">
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
                        {withdrawals?.data?.length ? (
                            withdrawals.data.map((w: any) => (
                                <TableRow key={w.id} className="hover:!bg-secondary/10">
                                    <TableCell>{w.id}</TableCell>
                                    <TableCell>{w.customer_plan?.customer?.name ?? "—"}</TableCell>
                                    <TableCell>{w.customer_plan?.plan?.name ?? "—"}</TableCell>
                                    <TableCell>{fmtDate(w.effective_date)}</TableCell>
                                    <TableCell className="text-right">{fmt(w.amount)}</TableCell>
                                    <TableCell>{statusBadge(w.status)}</TableCell>
                                    <TableCell className="text-right">
                                        {w.status === "pending" ? (
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
                                                    <DropdownMenuItem
                                                        onSelect={(e) => {
                                                            e.preventDefault();
                                                            openApprove({ id: w.id, label: `${w.customer_plan?.customer?.name} — ${fmt(w.amount)}` });
                                                        }}
                                                    >
                                                        <CheckCircle className="mr-2 h-4 w-4" />
                                                        Aprovar
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        className="text-red-600 focus:text-red-600"
                                                        onSelect={(e) => {
                                                            e.preventDefault();
                                                            openReject({ id: w.id, label: `${w.customer_plan?.customer?.name} — ${fmt(w.amount)}` });
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
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={7} className="h-24 text-center text-sm text-muted-foreground">
                                    Nada encontrado.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            <div className="mt-3">
                <Paginate meta={withdrawals?.meta} perPage={data.per_page} setPerPage={(pp) => setPerPage(pp)} />
            </div>

            {/* APPROVE dialog */}
            <AlertDialog open={!!confirmApprove} onOpenChange={(o) => !o && setConfirmApprove(null)}>
                <AlertDialogContent
                    // 3) bloqueia auto-focus do Radix
                    onOpenAutoFocus={(e) => {
                        e.preventDefault();
                    }}
                    // opcional: ao montar, foca o cancelar
                    onPointerDownOutside={(e) => e.preventDefault()}
                    onInteractOutside={(e) => e.preventDefault()}
                >
                    <AlertDialogHeader>
                        <AlertDialogTitle>Aprovar saque?</AlertDialogTitle>
                        <AlertDialogDescription>{confirmApprove?.label}</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel ref={cancelApproveRef}>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={doApprove}>Aprovar</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* REJECT dialog */}
            <AlertDialog open={!!confirmReject} onOpenChange={(o) => !o && setConfirmReject(null)}>
                <AlertDialogContent
                    onOpenAutoFocus={(e) => {
                        e.preventDefault();
                    }}
                    onPointerDownOutside={(e) => e.preventDefault()}
                    onInteractOutside={(e) => e.preventDefault()}
                >
                    <AlertDialogHeader>
                        <AlertDialogTitle>Rejeitar saque?</AlertDialogTitle>
                        <AlertDialogDescription>{confirmReject?.label}</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel ref={cancelRejectRef}>Cancelar</AlertDialogCancel>
                        <AlertDialogAction className="bg-red-600 hover:bg-red-700" onClick={doReject}>
                            Rejeitar
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AppLayout>
    );
}
