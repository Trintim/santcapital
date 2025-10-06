import AppLayout from "@/layouts/app-layout";
import { Head, router } from "@inertiajs/react";
import { route } from "ziggy-js";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PerformanceChart } from "@/pages/Admin/Dashboard/Partials/PerformanceChart";

type KPI = {
    activeCustomers: number;
    totalInvested: number;
    avgYield12m: number | null; // decimal (ex.: 0.0245)
};

type Point = {
    key: string;
    label: string;
    deposits: number;
    yields: number;
    withdraws: number;
    net: number;
};

type Props = {
    kpis: KPI;
    series: Point[];
    range: "7d" | "3m" | "9m" | "12m";
    dimension: { mode: "day" | "month" };
};

export default function DashboardIndex({ kpis, series, range, dimension }: Props) {
    const onRangeChange = (value: Props["range"]) => {
        if (value === range) return;
        router.get(route("admin.dashboard"), { range: value }, { preserveState: true, preserveScroll: true });
    };

    return (
        <AppLayout>
            <Head title="Dashboard" />

            {/* Filtro de intervalo */}
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

            {/* KPIs */}
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
                        <div className="text-2xl font-semibold">
                            {typeof kpis?.totalInvested === "number"
                                ? `R$ ${kpis.totalInvested.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                                : "—"}
                        </div>
                    </CardContent>
                </Card>

                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle className="text-sm text-muted-foreground">Média de rendimentos (12m)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-semibold">{kpis?.avgYield12m}</div>
                    </CardContent>
                </Card>
            </div>
            {/* Gráfico */}
            <div className="mt-6">
                <PerformanceChart series={series} range={range} dimension={dimension} />
            </div>
        </AppLayout>
    );
}
