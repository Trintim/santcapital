import { MonthYearPicker } from "@/components/form/MonthYearPicker";
import { PercentInput, usePercentDecimal } from "@/components/form/PercentInput";

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
import { Button } from "@/components/ui/button";
import { Combobox } from "@/components/ui/combobox";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Layout from "@/layouts/app-layout";
import { Head, router, useForm, usePage } from "@inertiajs/react";
import { MoreHorizontal, Trash2 } from "lucide-react";
import * as React from "react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { route } from "ziggy-js";

type Plan = { id: number; name: string };
type YieldItem = {
    id: number;
    investment_plan_id: number;
    plan?: { id: number; name: string };
    period: string; // "YYYY-MM-01"
    percent_decimal: number; // 0.025
    created_at: string;
};

export default function MonthlyYieldsIndex() {
    const { plans, yields }: any = usePage().props;

    const { data, setData, post, processing, errors, reset, transform } = useForm({
        investment_plan_id: "",
        // now as "YYYY-MM-01"
        period: new Date().toISOString().slice(0, 7),
        percent_decimal: "",
    });

    const { display, setDisplay, getDecimal } = usePercentDecimal(undefined);
    React.useEffect(() => {
        setDisplay(data.percent_decimal);
    }, [data.percent_decimal]);

    const planItems = (plans as Plan[]).map((p) => ({ value: String(p.id), label: p.name }));

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!data.investment_plan_id) return;
        if (!/^\d{4}-\d{2}$/.test(data.period)) return;

        const dec = getDecimal(); // "2,50" => 0.025
        transform((payload) => ({
            investment_plan_id: payload.investment_plan_id,
            period: payload.period,
            percent_decimal: dec,
        }));

        post(route("admin.monthly-yields.store"), {
            onSuccess: () => {
                toast.success("Rendimento registrado com sucesso.");
                reset();
                setDisplay("");
            },
            onError: () => {
                toast.error("Erro ao registrar rendimento. Verifique os campos.");
            },
        });
    };

    // ===== Dropdown controlado por linha =====
    const [menuOpenId, setMenuOpenId] = useState<number | null>(null);

    // ===== Delete dialog (controle de foco seguro) =====
    const [confirmOpen, setConfirmOpen] = React.useState(false);
    const [toDelete, setToDelete] = React.useState<{ id: number; label: string } | null>(null);
    const deleteCancelRef = useRef<HTMLButtonElement | null>(null);

    const openDelete = (item: YieldItem) => {
        // fecha menu, desfoca trigger e abre dialog no próximo frame
        setMenuOpenId(null);
        (document.activeElement as HTMLElement | null)?.blur?.();
        setToDelete({ id: item.id, label: `${item.plan?.name ?? "Plano"} — ${formatMonthLabel(item.period)}` });
        requestAnimationFrame(() => setConfirmOpen(true));
    };

    const doDelete = () => {
        if (!toDelete) return;
        router.delete(route("admin.monthly-yields.destroy", { monthlyYield: toDelete.id }), {
            preserveState: true,
            onSuccess: () => toast.success("Rendimento removido com sucesso."),
            onError: () => toast.error("Erro ao remover rendimento. Tente novamente."),
            onFinish: () => setConfirmOpen(false),
        });
    };

    // ===== Apply dialog (controle de foco seguro) =====
    const [applyOpen, setApplyOpen] = React.useState(false);
    const [toApply, setToApply] = React.useState<{ planId: number; period: string; label: string } | null>(null);
    const applyCancelRef = useRef<HTMLButtonElement | null>(null);

    const openApply = (item: YieldItem) => {
        setMenuOpenId(null);
        (document.activeElement as HTMLElement | null)?.blur?.();
        setToApply({
            planId: item.investment_plan_id,
            period: item.period,
            label: `${item.plan?.name ?? "Plano"} — ${formatMonthLabel(item.period)}`,
        });
        requestAnimationFrame(() => setApplyOpen(true));
    };

    const doApply = () => {
        if (!toApply) return;
        router.post(
            route("admin.monthly-yields.apply"),
            {
                investment_plan_id: toApply.planId,
                period: toApply.period,
            },
            {
                preserveState: true,
                onSuccess: () => toast.success("Rendimento aplicado com sucesso."),
                onError: () => toast.error("Erro ao aplicar rendimento. Tente novamente."),
                onFinish: () => setApplyOpen(false),
            },
        );
    };

    const fmtPct = (d?: string | number) => {
        const num = typeof d === "string" ? parseFloat(d) : d;
        return typeof num === "number" && !isNaN(num)
            ? `${(num * 100).toLocaleString("pt-BR", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
              })}%`
            : "—";
    };

    function formatMonthLabel(period: string) {
        const [year, month] = period.split("-").map(Number);
        return new Date(year, month - 1).toLocaleDateString("pt-BR", { year: "numeric", month: "2-digit" });
    }

    return (
        <Layout>
            <Head title="Rendimentos Mensais" />

            <div className="space-y-6">
                <h1 className="text-xl font-semibold">Rendimentos Mensais</h1>

                {/* Formulário inline de criação */}
                <form onSubmit={handleSubmit} className="rounded-lg border bg-card p-4">
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
                        <div className="sm:col-span-2">
                            <label className="mb-1 block text-sm font-medium">Plano</label>
                            <Combobox
                                value={data.investment_plan_id}
                                onChange={(v: string) => setData("investment_plan_id", v)}
                                items={planItems}
                                placeholder="Selecione um plano"
                                emptyMessage="Nenhum plano encontrado"
                            />
                            {errors.investment_plan_id && <p className="mt-1 text-sm text-destructive">{errors.investment_plan_id}</p>}
                        </div>

                        <div>
                            <label className="mb-1 block text-sm font-medium">Mês</label>
                            <MonthYearPicker
                                value={data.period} // "YYYY-MM"
                                onChange={(v) => setData("period", v)}
                            />
                            {errors.period && <p className="mt-1 text-sm text-destructive">{errors.period}</p>}
                        </div>

                        <div>
                            <label className="mb-1 block text-sm font-medium">Rendimento (%)</label>
                            <PercentInput
                                value={display}
                                onChange={(v) => {
                                    setDisplay(v);
                                    setData("percent_decimal", v);
                                }}
                                placeholder="0,00"
                            />
                            {errors.percent_decimal && <p className="mt-1 text-sm text-destructive">{errors.percent_decimal}</p>}
                        </div>
                    </div>

                    <div className="mt-4 flex justify-end">
                        <Button type="submit" disabled={processing}>
                            Registrar
                        </Button>
                    </div>
                </form>

                {/* Tabela de rendimentos */}
                <div className="rounded-lg border bg-card">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>ID</TableHead>
                                <TableHead>Plano</TableHead>
                                <TableHead>Mês</TableHead>
                                <TableHead>Percentual</TableHead>
                                <TableHead>
                                    <span className="sr-only">Ações</span>
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {yields?.data?.length ? (
                                yields.data.map((item: YieldItem) => {
                                    const isOpen = menuOpenId === item.id;
                                    return (
                                        <TableRow key={item.id}>
                                            <TableCell>{item.id}</TableCell>
                                            <TableCell>{item.plan?.name ?? "—"}</TableCell>
                                            <TableCell>{formatMonthLabel(item.period)}</TableCell>
                                            <TableCell>{fmtPct(item?.percent_decimal)}</TableCell>
                                            <TableCell className="text-right">
                                                <DropdownMenu open={isOpen} onOpenChange={(open) => setMenuOpenId(open ? item.id : null)}>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" className="h-8 w-8 p-0">
                                                            <span className="sr-only">Abrir menu</span>
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuLabel>Ações</DropdownMenuLabel>

                                                        <DropdownMenuItem
                                                            onSelect={(e) => {
                                                                e.preventDefault();
                                                                openApply(item);
                                                            }}
                                                        >
                                                            Aplicar rendimento
                                                        </DropdownMenuItem>

                                                        <DropdownMenuSeparator />

                                                        <DropdownMenuItem
                                                            className="text-red-600 focus:text-red-600"
                                                            onSelect={(e) => {
                                                                e.preventDefault();
                                                                openDelete(item);
                                                            }}
                                                        >
                                                            <Trash2 className="mr-2 h-4 w-4" />
                                                            Remover
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-24 text-center text-sm text-muted-foreground">
                                        Nenhum rendimento cadastrado.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>

            {/* Dialog de exclusão */}
            <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
                <AlertDialogContent
                    onOpenAutoFocus={(e) => {
                        e.preventDefault();
                        deleteCancelRef.current?.focus();
                    }}
                >
                    <AlertDialogHeader>
                        <AlertDialogTitle>Remover rendimento?</AlertDialogTitle>
                        <AlertDialogDescription>{toDelete?.label}</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel ref={deleteCancelRef}>Cancelar</AlertDialogCancel>
                        <AlertDialogAction className="bg-red-600 hover:bg-red-700" onClick={doDelete}>
                            Remover
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Dialog de aplicar rendimento */}
            <AlertDialog open={applyOpen} onOpenChange={setApplyOpen}>
                <AlertDialogContent
                    onOpenAutoFocus={(e) => {
                        e.preventDefault();
                        applyCancelRef.current?.focus();
                    }}
                >
                    <AlertDialogHeader>
                        <AlertDialogTitle>Aplicar rendimento deste mês?</AlertDialogTitle>
                        <AlertDialogDescription>
                            {toApply?.label}
                            <br />
                            Esta ação irá lançar o rendimento como transações aprovadas para todos os vínculos ativos deste plano que já estavam
                            ativados até o fim do período selecionado.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel ref={applyCancelRef}>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={doApply}>Aplicar rendimento</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </Layout>
    );
}
