import Paginate from "@/components/Pagination/Index";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import AppLayout from "@/layouts/app-layout";
import WithdrawDialog, { PlanForWithdraw } from "@/pages/Customer/Deposits/Partials/WithdrawDialog";
import { PaginationData } from "@/types/pagination";
import { filterQueryParams } from "@/utils";
import { Head, router, useForm } from "@inertiajs/react";
import * as React from "react";
import { route } from "ziggy-js";

type PlanRow = PlanForWithdraw & {
    status: "active" | "pre_active" | "inactive" | string;
    activated_on?: string | null;
    lockup_days?: number | null;
    withdraw_eligible: boolean;
};

type Tx = {
    id: number;
    customer_plan_id: number;
    type: "deposit" | "yield" | "withdrawal";
    status: "pending" | "approved" | "rejected";
    amount: number;
    effective_date: string; // ISO
    customer_plan?: { plan?: { name?: string } };
};

type PageProps = {
    plans: PlanRow[];
    deposits: PaginationData<Tx>;
    statement: PaginationData<Tx>;
    filters: { dep_per_page: number; tx_per_page: number };
};

const fmtBRL = (n: number) => `R$ ${Number(n ?? 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;
const fmtDate = (iso?: string | null) => (iso ? new Date(iso).toLocaleDateString("pt-BR") : "—");

export default function Index({ plans, deposits, statement, filters }: PageProps) {
    // Paginação independente
    const depForm = useForm({ dep_per_page: Number(filters.dep_per_page || 10) });
    const txForm = useForm({ tx_per_page: Number(filters.tx_per_page || 10) });

    const goWith = (params: Record<string, any>) => {
        router.get(route("customer.deposits.index"), filterQueryParams(params), {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleDepPerPage = (n: number) => {
        depForm.setData("dep_per_page", n);
        goWith({
            dep_per_page: n,
            tx_per_page: txForm.data.tx_per_page,
            tx_page: statement.meta.current_page,
        });
    };

    const handleTxPerPage = (n: number) => {
        txForm.setData("tx_per_page", n);
        goWith({
            tx_per_page: n,
            dep_per_page: depForm.data.dep_per_page,
            dep_page: deposits.meta.current_page,
        });
    };

    // Modal saque
    const [dialogOpen, setDialogOpen] = React.useState(false);
    const [selectedPlan, setSelectedPlan] = React.useState<PlanForWithdraw | null>(null);

    const openDialogFor = (p: PlanRow) => {
        setSelectedPlan({ id: p.id, plan_name: p.plan_name, available: p.available });
        (document.activeElement as HTMLElement | null)?.blur?.();
        requestAnimationFrame(() => setDialogOpen(true));
    };

    const typeBadge = (type: Tx["type"]) => {
        if (type === "deposit") return <Badge variant="default">Aporte</Badge>;
        if (type === "yield") return <Badge variant="secondary">Rendimento</Badge>;
        return <Badge variant="destructive">Saque</Badge>;
    };

    const statusBadge = (st: Tx["status"]) => {
        if (st === "approved") return <Badge variant="default">Aprovado</Badge>;
        if (st === "pending") return <Badge variant="secondary">Pendente</Badge>;
        return <Badge variant="destructive">Rejeitado</Badge>;
    };

    return (
        <AppLayout>
            <Head title="Meus aportes" />

            {/* Meus planos */}
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle>Meus planos</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-hidden rounded-lg border bg-card">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Plano</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Ativado em</TableHead>
                                    <TableHead>Carência (dias)</TableHead>
                                    <TableHead className="text-right">Saldo disponível</TableHead>
                                    <TableHead>
                                        <span className="sr-only">Ações</span>
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {plans.length ? (
                                    plans.map((p) => (
                                        <TableRow key={p.id}>
                                            <TableCell>{p.plan_name ?? "—"}</TableCell>
                                            <TableCell>
                                                {p.status === "active" ? (
                                                    <Badge variant="default">Ativo</Badge>
                                                ) : p.status === "pre_active" ? (
                                                    <Badge variant="secondary">Pré-ativo</Badge>
                                                ) : (
                                                    <Badge variant="destructive">Inativo</Badge>
                                                )}
                                            </TableCell>
                                            <TableCell>{fmtDate(p.activated_on)}</TableCell>
                                            <TableCell>{p.lockup_days ?? "—"}</TableCell>
                                            <TableCell className="text-right">{fmtBRL(p.available)}</TableCell>
                                            <TableCell className="text-right">
                                                <Button
                                                    size="sm"
                                                    disabled={!p.withdraw_eligible || p.available <= 0}
                                                    onClick={() => openDialogFor(p)}
                                                >
                                                    Solicitar saque
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-24 text-center text-sm text-muted-foreground">
                                            Nenhum plano encontrado.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            {/* Aportes */}
            <Card className="mb-6">
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Aportes</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-hidden rounded-lg border bg-card">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Data</TableHead>
                                    <TableHead>Plano</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Valor</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {deposits.data.length ? (
                                    deposits.data.map((t) => (
                                        <TableRow key={t.id}>
                                            <TableCell>{fmtDate(t.effective_date)}</TableCell>
                                            <TableCell>{t.customer_plan?.plan?.name ?? "—"}</TableCell>
                                            <TableCell>{statusBadge(t.status)}</TableCell>
                                            <TableCell className="text-right">{fmtBRL(t.amount)}</TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={4} className="h-24 text-center text-sm text-muted-foreground">
                                            Nenhum aporte encontrado.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    <div className="mt-3">
                        <Paginate meta={deposits.meta} perPage={depForm.data.dep_per_page} setPerPage={handleDepPerPage} />
                    </div>
                </CardContent>
            </Card>

            {/* Extrato */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Extrato</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-hidden rounded-lg border bg-card">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Data</TableHead>
                                    <TableHead>Plano</TableHead>
                                    <TableHead>Tipo</TableHead>
                                    <TableHead className="text-right">Valor</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {statement.data.length ? (
                                    statement.data.map((t) => (
                                        <TableRow key={t.id}>
                                            <TableCell>{fmtDate(t.effective_date)}</TableCell>
                                            <TableCell>{t.customer_plan?.plan?.name ?? "—"}</TableCell>
                                            <TableCell>
                                                {t.type === "deposit" ? (
                                                    <Badge variant="default">Aporte</Badge>
                                                ) : t.type === "yield" ? (
                                                    <Badge variant="secondary">Rendimento</Badge>
                                                ) : (
                                                    <Badge variant="destructive">Saque</Badge>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right">{fmtBRL(t.amount)}</TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={4} className="h-24 text-center text-sm text-muted-foreground">
                                            Nenhum lançamento encontrado.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    <div className="mt-3">
                        <Paginate meta={statement.meta} perPage={txForm.data.tx_per_page} setPerPage={handleTxPerPage} />
                    </div>
                </CardContent>
            </Card>

            {/* Modal extraído */}
            <WithdrawDialog open={dialogOpen} onOpenChange={setDialogOpen} plan={selectedPlan} />
        </AppLayout>
    );
}
