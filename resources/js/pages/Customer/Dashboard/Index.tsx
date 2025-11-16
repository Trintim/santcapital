// resources/js/pages/Customer/Dashboard/Index.tsx
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import AppLayout from "@/layouts/app-layout";
import { Head, router } from "@inertiajs/react";
import { useState } from "react";
import { toast } from "sonner";
import { PerformanceLines } from "./Partials/PerformanceLines";

type KPIs = {
    qtdAportes: number;
    totalInvestido: number;
    totalRendimentos: number;
    avgYield12m?: string | number | null;
};
type SeriesPoint = {
    key: string;
    label: string;
    deposits: number;
    yields: number;
    withdraws: number;
    net: number;
    equity_close: number;
};
type Props = {
    kpis: KPIs;
    series: SeriesPoint[];
    dimension?: { mode: string };
};

export default function Dashboard({ kpis, series }: Props) {
    const fmtBRL = (n?: number) =>
        typeof n === "number" ? `R$ ${n.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "—";
    console.log(kpis);
    const [loading, setLoading] = useState(false);
    const handleExport = async () => {
        setLoading(true);
        try {
            router.post(
                route("customer.dashboard.export-pdf"),
                {},
                {
                    onSuccess: () => {
                        toast.success("PDF dos rendimentos enviado para seu email!");
                    },
                    onError: () => {
                        toast.error("Erro ao enviar PDF por email. Tente novamente.");
                    },
                    onFinish: () => {
                        setLoading(false);
                    },
                },
            );
        } catch {
            toast.error("Erro inesperado ao exportar PDF.");
            setLoading(false);
        }
    };

    return (
        <AppLayout>
            <Head title="Meu painel" />

            <div className="grid auto-rows-min gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm text-muted-foreground">Meus aportes</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-semibold">{kpis?.qtdAportes ?? 0}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm text-muted-foreground">Meu total investido</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-semibold">{fmtBRL(kpis?.totalInvestido)}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm text-muted-foreground">Rendimentos acumulados</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-semibold">{fmtBRL(kpis?.totalRendimentos)}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm text-muted-foreground">Média de rendimento (12 meses)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-semibold">
                            {(typeof kpis.avgYield12m === "string" || typeof kpis.avgYield12m === "number") && !isNaN(Number(kpis.avgYield12m))
                                ? `${(Number(kpis.avgYield12m) * 100).toFixed(2)}%`
                                : "—"}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="mt-6 flex justify-end">
                <Button variant="outline" onClick={handleExport} disabled={loading}>
                    {loading ? "Exportando..." : "Exportar PDF dos rendimentos"}
                </Button>
            </div>

            <div className="mt-6">
                {series && Array.isArray(series) && series.length > 0 ? (
                    <PerformanceLines series={series} />
                ) : (
                    <Card className="py-12 text-center">
                        <CardHeader>
                            <CardTitle>Nenhum dado para exibir o gráfico</CardTitle>
                            <CardContent className="text-muted-foreground">
                                Os fluxos mensais e patrimônio só aparecem após movimentações.
                            </CardContent>
                        </CardHeader>
                    </Card>
                )}
            </div>
        </AppLayout>
    );
}
