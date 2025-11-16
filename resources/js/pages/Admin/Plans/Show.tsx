import { router } from "@inertiajs/react";
import { useRef, useState } from "react";
import { route } from "ziggy-js";

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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import AppLayout from "@/layouts/app-layout";
import { Head } from "@inertiajs/react";

import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { ArrowLeft, CheckCircle2, Pencil, Trash2, XCircle } from "lucide-react";
import { toast } from "sonner";

type LockupOption = {
    id: number;
    lockup_days: number;
    is_default: boolean;
};

type Plan = {
    id: number;
    name: string;
    description?: string | null;
    lockup_days: number | null;
    minimum_deposit_amount: number;
    contract_term_months?: number | null;
    expected_return_min_decimal?: number | null;
    expected_return_max_decimal?: number | null;
    extra_bonus_percent_on_capital_decimal?: number | null;
    withdrawal_only_at_maturity: boolean;
    guaranteed_min_multiplier_after_24m?: number | null;
    is_active: boolean;
    lockup_options?: LockupOption[];
};

type Recent = {
    id: number;
    type: "deposit" | "yield" | "withdrawal";
    status: "pending" | "approved" | "rejected";
    amount: number;
    effective_date: string;
    customer_name?: string | null;
};

export default function PlanShow({
    plan,
    metrics,
    recentActivity,
}: {
    plan: Plan;
    metrics: { activeCount: number; totalCount: number; totalInvested: number };
    recentActivity: Recent[];
}) {
    const [deleteOpen, setDeleteOpen] = useState(false);
    const cancelRef = useRef<HTMLButtonElement | null>(null);

    const [lockupDeleteOpen, setLockupDeleteOpen] = useState(false);
    const [lockupToDelete, setLockupToDelete] = useState<LockupOption | null>(null);
    const lockupDeleteCancelRef = useRef<HTMLButtonElement | null>(null);

    const fmtBRL = (n?: number | null) =>
        typeof n === "number" ? `R$ ${n.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "—";

    const fmtPct = (d?: number | null) =>
        typeof d === "number" ? `${(d * 100).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%` : "—";

    const goBack = () => router.visit(route("admin.plans.index"));

    const toggleActive = () => {
        if (!plan?.id) return;
        router.patch(
            route("admin.plans.toggle-active", { plan: plan.id }),
            {},
            {
                preserveScroll: true,
                onSuccess: () => toast.success("Status do plano alterado."),
                onError: () => toast.error("Falha ao alterar status."),
            },
        );
    };

    const destroy = () => {
        router.delete(route("admin.plans.destroy", { plan: plan.id }), {
            preserveScroll: true,
            onSuccess: () => {
                toast.success("Plano removido.");
                goBack();
            },
            onError: () => toast.error("Falha ao remover plano."),
            onFinish: () => setDeleteOpen(false),
        });
    };

    function openLockupDelete(opt: LockupOption) {
        setLockupToDelete(opt);
        setLockupDeleteOpen(true);
    }

    function destroyLockup() {
        if (!lockupToDelete) return;
        router.delete(route("admin.plans.lockups.destroy", { plan: plan.id, option: lockupToDelete.id }), {
            preserveScroll: true,
            onSuccess: () => toast.success("Opção removida."),
            onError: () => toast.error("Falha ao remover opção."),
            onFinish: () => {
                setLockupDeleteOpen(false);
                setLockupToDelete(null);
            },
        });
    }

    return (
        <AppLayout>
            <Head title={`Plano • ${plan.name}`} />

            <div className="mb-3 flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={goBack}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Voltar
                </Button>

                <div className="ml-auto inline-flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => router.visit(route("admin.plans.edit", { plan: plan.id }))}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Editar
                    </Button>

                    <Button variant="outline" size="sm" onClick={toggleActive}>
                        {plan.is_active ? (
                            <>
                                <XCircle className="mr-2 h-4 w-4 text-red-600" />
                                Desativar
                            </>
                        ) : (
                            <>
                                <CheckCircle2 className="mr-2 h-4 w-4 text-emerald-600" />
                                Ativar
                            </>
                        )}
                    </Button>

                    <Button variant="destructive" size="sm" onClick={() => setDeleteOpen(true)}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Remover
                    </Button>
                </div>
            </div>

            {/* Header + métricas do plano */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            {plan.name} {plan.is_active ? <Badge>Ativo</Badge> : <Badge variant="destructive">Inativo</Badge>}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {plan.description ? <p className="text-sm text-muted-foreground">{plan.description}</p> : null}

                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                            <div>
                                <div className="text-xs text-muted-foreground">Carência padrão</div>
                                <div className="text-base font-medium">{plan.lockup_days ?? 0} dias</div>
                            </div>

                            <div>
                                <div className="text-xs text-muted-foreground">Aporte mínimo</div>
                                <div className="text-base font-medium">{fmtBRL(plan.minimum_deposit_amount)}</div>
                            </div>

                            <div>
                                <div className="text-xs text-muted-foreground">Prazo (meses)</div>
                                <div className="text-base font-medium">{plan.contract_term_months ?? "—"}</div>
                            </div>

                            <div>
                                <div className="text-xs text-muted-foreground">Rendimento esperado (mín)</div>
                                <div className="text-base font-medium">{fmtPct(plan.expected_return_min_decimal)}</div>
                            </div>

                            <div>
                                <div className="text-xs text-muted-foreground">Rendimento esperado (máx)</div>
                                <div className="text-base font-medium">{fmtPct(plan.expected_return_max_decimal)}</div>
                            </div>

                            <div>
                                <div className="text-xs text-muted-foreground">Bônus (% sobre capital)</div>
                                <div className="text-base font-medium">{fmtPct(plan.extra_bonus_percent_on_capital_decimal)}</div>
                            </div>

                            <div>
                                <div className="text-xs text-muted-foreground">Saque só no vencimento?</div>
                                <div className="text-base font-medium">{plan.withdrawal_only_at_maturity ? "Sim" : "Não"}</div>
                            </div>

                            <div>
                                <div className="text-xs text-muted-foreground">Garantia mínima (24m)</div>
                                <div className="text-base font-medium">
                                    {typeof plan.guaranteed_min_multiplier_after_24m === "number"
                                        ? `${plan.guaranteed_min_multiplier_after_24m}x`
                                        : "—"}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Métricas agregadas deste plano */}
                <Card>
                    <CardHeader>
                        <CardTitle>Métricas do plano</CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-3">
                        <div>
                            <div className="text-xs text-muted-foreground">Vínculos ativos</div>
                            <div className="text-2xl font-semibold">{metrics.activeCount}</div>
                        </div>
                        <div>
                            <div className="text-xs text-muted-foreground">Vínculos totais</div>
                            <div className="text-2xl font-semibold">{metrics.totalCount}</div>
                        </div>
                        <div>
                            <div className="text-xs text-muted-foreground">Total investido (aprovado)</div>
                            <div className="text-2xl font-semibold">{fmtBRL(metrics.totalInvested)}</div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Opções de carência (lockups) */}
            <div className="mt-6 grid gap-4 lg:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Opções de carência</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-lg border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>ID</TableHead>
                                        <TableHead>Dias</TableHead>
                                        <TableHead>Padrão</TableHead>
                                        <TableHead className="text-right">
                                            <span className="sr-only">Ações</span>
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {plan.lockup_options?.data.length ? (
                                        plan.lockup_options.data.map((opt) => (
                                            <TableRow key={opt.id} className="hover:!bg-secondary/10">
                                                <TableCell>{opt.id}</TableCell>
                                                <TableCell>{opt.lockup_days}</TableCell>
                                                <TableCell>
                                                    {opt.is_default ? <Badge>Sim</Badge> : <span className="text-muted-foreground">Não</span>}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Button variant="destructive" size="icon" onClick={() => openLockupDelete(opt)}>
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent>Remover opção</TooltipContent>
                                                    </Tooltip>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={4} className="h-24 text-center text-sm text-muted-foreground">
                                                Nenhuma opção cadastrada.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>

                {/* Atividades recentes relacionadas ao plano */}
                <Card>
                    <CardHeader>
                        <CardTitle>Atividades recentes</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-lg border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>ID</TableHead>
                                        <TableHead>Cliente</TableHead>
                                        <TableHead>Tipo</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Valor</TableHead>
                                        <TableHead>Data</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {recentActivity?.length ? (
                                        recentActivity.map((r) => (
                                            <TableRow key={r.id} className="hover:!bg-secondary/10">
                                                <TableCell>{r.id}</TableCell>
                                                <TableCell className="max-w-48 truncate">{r.customer_name ?? "—"}</TableCell>
                                                <TableCell>
                                                    {r.type === "deposit" ? (
                                                        <Badge>Depósito</Badge>
                                                    ) : r.type === "yield" ? (
                                                        <Badge variant="secondary">Rendimento</Badge>
                                                    ) : (
                                                        <Badge variant="destructive">Saque</Badge>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    {r.status === "approved" ? (
                                                        <Badge>Aprovado</Badge>
                                                    ) : r.status === "pending" ? (
                                                        <Badge variant="secondary">Pendente</Badge>
                                                    ) : (
                                                        <Badge variant="destructive">Rejeitado</Badge>
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-right">{fmtBRL(r.amount)}</TableCell>
                                                <TableCell>{new Date(r.effective_date).toLocaleDateString("pt-BR")}</TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={6} className="h-24 text-center text-sm text-muted-foreground">
                                                Sem movimentações recentes.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Dialog de remover plano */}
            <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                <AlertDialogContent
                    onOpenAutoFocus={(e) => {
                        e.preventDefault();
                        cancelRef.current?.focus();
                    }}
                >
                    <AlertDialogHeader>
                        <AlertDialogTitle>Remover plano?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta ação não poderá ser desfeita. Todos os vínculos existentes permanecerão, mas o plano deixará de existir para novos
                            cadastros.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel ref={cancelRef}>Cancelar</AlertDialogCancel>
                        <AlertDialogAction className="bg-red-600 hover:bg-red-700" onClick={destroy}>
                            Remover
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Dialog de remover opção de carência */}
            <AlertDialog open={lockupDeleteOpen} onOpenChange={setLockupDeleteOpen}>
                <AlertDialogContent
                    onOpenAutoFocus={(e) => {
                        e.preventDefault();
                        lockupDeleteCancelRef.current?.focus();
                    }}
                >
                    <AlertDialogHeader>
                        <AlertDialogTitle>Remover opção de carência?</AlertDialogTitle>
                        <AlertDialogDescription>Esta ação não poderá ser desfeita. A opção será removida do plano.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel ref={lockupDeleteCancelRef}>Cancelar</AlertDialogCancel>
                        <AlertDialogAction className="bg-red-600 hover:bg-red-700" onClick={destroyLockup}>
                            Remover
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AppLayout>
    );
}
