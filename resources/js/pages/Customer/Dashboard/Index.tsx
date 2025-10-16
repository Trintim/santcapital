// resources/js/pages/Customer/Dashboard/Index.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import AppLayout from "@/layouts/app-layout";
import { Head } from "@inertiajs/react";
import { PerformanceMonthly } from "./Partials/PerformanceMonthly";

export default function Dashboard({ kpis, series, dimension }) {
    const fmtBRL = (n?: number) =>
        typeof n === "number" ? `R$ ${n.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "—";

    return (
        <AppLayout>
            <Head title="Meu painel" />

            <div className="grid auto-rows-min gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
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
            </div>

            <div className="mt-6">
                <PerformanceMonthly series={series} />
            </div>
        </AppLayout>
    );
}
