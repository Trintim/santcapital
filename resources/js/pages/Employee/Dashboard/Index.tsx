import AppLayout from "@/layouts/app-layout";
import { Head, Link, router } from "@inertiajs/react";
import { route } from "ziggy-js";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PerformanceChart } from "@/pages/Employee/Dashboard/Partials/PerformanceChart";

type KPI = {
    activeCustomers: number;
    totalInvested: number;
    avgYield12m: number | null; // decimal ex.: 0.0245
    pendingWithdrawals?: { count: number; total: number };
};

type Point = { key: string; label: string; deposits: number; yields: number; withdraws: number; net: number };

type Props = {
    kpis: KPI;
    series: Point[];
    range: "7d" | "3m" | "9m" | "12m";
    dimension: { mode: "day" | "month" };
};

export default function DashboardIndex({ kpis, series, range, dimension }: Props) {
    const onRangeChange = (value: Props["range"]) => {
        if (value === range) return;
        router.get(route("employee.dashboard"), { range: value }, { preserveState: true, preserveScroll: true });
    };

    const fmtBRL = (n?: number) =>
        typeof n === "number" ? `R$ ${n.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "—";

    const fmtPct = (dec?: number | string | null) => {
        const num = typeof dec === "string" ? parseFloat(dec) : dec;
        return typeof num === "number" && !isNaN(num) ? `${(num * 100).toFixed(2)}%` : "—";
    };

    return (
        <AppLayout>
            <Head title="Dashboard" />

            <div className="mb-4 flex items-center justify-end">
                <Select value={range} onValueChange={onRangeChange}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Intervalo" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="7d">Últimos 7 dias</SelectItem>
                        <SelectItem value="3m">Últimos 3 meses</SelectItem>
                        <SelectItem value="9m">Últimos 9 meses</SelectItem>
                        <SelectItem value="12m">Últimos 12 meses</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="grid auto-rows-min gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm text-muted-foreground">Clientes ativos</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-semibold">{kpis?.activeCustomers ?? "—"}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm text-muted-foreground">Total investido</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-semibold">{fmtBRL(kpis?.totalInvested)}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm text-muted-foreground">Média de rendimentos (12m)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-semibold">{fmtPct(kpis?.avgYield12m)}</div>
                    </CardContent>
                </Card>

                {/* NOVO CARD: Saques pendentes */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="text-sm text-muted-foreground">Saques pendentes</CardTitle>
                        <Link
                            href={route("admin.withdrawals.index", { status: "pending" })}
                            className="text-xs text-primary underline underline-offset-4"
                        >
                            ver
                        </Link>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-semibold">{kpis?.pendingWithdrawals?.count ?? 0}</div>
                        <p className="mt-1 text-xs text-muted-foreground">
                            Total: <span className="font-medium">{fmtBRL(kpis?.pendingWithdrawals?.total ?? 0)}</span>
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="mt-6">
                <PerformanceChart series={series} range={range} dimension={dimension} />
            </div>
        </AppLayout>
    );
}
