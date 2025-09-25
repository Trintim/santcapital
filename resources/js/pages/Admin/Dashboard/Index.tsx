import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import AppLayout from "@/layouts/app-layout";
import { Head } from "@inertiajs/react";

export default function Dashboard({ kpis }) {
    return (
        <AppLayout>
            <Head title="Dashboard" />
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
                            {kpis?.totalInvested !== undefined
                                ? `R$ ${Number(kpis.totalInvested).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`
                                : "—"}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm text-muted-foreground">Média de rendimentos (12m)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-semibold">
                            {kpis?.avgYield12m !== null && kpis?.avgYield12m !== undefined ? `${(kpis.avgYield12m * 100).toFixed(2)}%` : "—"}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/*<div className="grid auto-rows-min gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-4">*/}
            {/*    <div className="relative aspect-video overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border">*/}
            {/*        <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" />*/}
            {/*    </div>*/}
            {/*    <div className="relative aspect-video overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border">*/}
            {/*        <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" />*/}
            {/*    </div>*/}
            {/*    <div className="relative aspect-video overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border">*/}
            {/*        <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" />*/}
            {/*    </div>*/}
            {/*    <div className="relative aspect-video overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border">*/}
            {/*        <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" />*/}
            {/*    </div>*/}
            {/*</div>*/}
            {/*<div className="relative min-h-[100vh] flex-1 overflow-hidden rounded-xl border border-sidebar-border/70 md:min-h-min dark:border-sidebar-border">*/}
            {/*    <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" />*/}
            {/*</div>*/}
        </AppLayout>
    );
}
