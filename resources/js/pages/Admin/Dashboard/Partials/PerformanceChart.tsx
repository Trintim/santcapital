import { router } from "@inertiajs/react";
import { Area, AreaChart, CartesianGrid, Line, XAxis, YAxis } from "recharts";
import { route } from "ziggy-js";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type Point = {
    key: string; // "YYYY-MM" ou "YYYY-MM-DD"
    label: string; // já formatado do back: "dd/mm" ou "set/25"
    deposits: number;
    yields: number;
    withdraws: number;
    net: number;
};

type Props = {
    series: Point[];
    range: "7d" | "3m" | "9m" | "12m";
    dimension: { mode: "day" | "month" };
};

const chartConfig = {
    deposits: { label: "Aportes", color: "var(--chart-1)" },
    yields: { label: "Rendimentos", color: "var(--chart-2)" },
    withdraws: { label: "Saques", color: "var(--chart-3)" },
    net: { label: "Fluxo líquido", color: "var(--foreground)" },
} satisfies ChartConfig;

export function PerformanceChart({ series, range, dimension }: Props) {
    const onRangeChange = (r: Props["range"]) => {
        if (r === range) return;
        router.get(route("admin.dashboard"), { range: r }, { preserveState: true, preserveScroll: true });
    };

    const tickFmt = (label: string) => label; // já vem pronto do backend

    return (
        <Card className="pt-0">
            <CardHeader className="flex items-center gap-3 space-y-0 border-b py-5 sm:flex-row">
                <div className="grid flex-1 gap-1">
                    <CardTitle>Desempenho</CardTitle>
                    <CardDescription>
                        {dimension.mode === "day" ? "Fluxo diário (apenas dias com movimento)" : "Fluxo mensal (apenas meses com movimento)"}
                    </CardDescription>
                </div>

                <Select value={range} onValueChange={onRangeChange}>
                    <SelectTrigger className="hidden w-[160px] rounded-lg sm:ml-auto sm:flex" aria-label="Intervalo">
                        <SelectValue placeholder="Intervalo" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                        <SelectItem value="7d" className="rounded-lg">
                            Últimos 7 dias
                        </SelectItem>
                        <SelectItem value="3m" className="rounded-lg">
                            Últimos 3 meses
                        </SelectItem>
                        <SelectItem value="9m" className="rounded-lg">
                            Últimos 9 meses
                        </SelectItem>
                        <SelectItem value="12m" className="rounded-lg">
                            Últimos 12 meses
                        </SelectItem>
                    </SelectContent>
                </Select>
            </CardHeader>

            <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
                <ChartContainer config={chartConfig} className="aspect-auto h-[300px] w-full">
                    <AreaChart data={series}>
                        <defs>
                            <linearGradient id="fillDesktop" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="var(--color-desktop)" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="var(--color-desktop)" stopOpacity={0.1} />
                            </linearGradient>
                            <linearGradient id="fillMobile" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="var(--color-mobile)" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="var(--color-mobile)" stopOpacity={0.1} />
                            </linearGradient>
                        </defs>

                        <CartesianGrid vertical={false} strokeOpacity={0.15} />

                        <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} minTickGap={24} tickFormatter={tickFmt} />

                        <YAxis width={90} tickFormatter={(v: number) => `R$ ${v.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}`} />

                        <ChartTooltip
                            cursor={{ strokeOpacity: 0.08 }}
                            content={
                                <ChartTooltipContent
                                    labelFormatter={(label) => label}
                                    formatter={(value, name) => {
                                        if (typeof value === "number") {
                                            const labelPt = chartConfig[name as keyof typeof chartConfig]?.label ?? name;
                                            return [`R$ ${value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`, labelPt];
                                        }
                                        return [value, name];
                                    }}
                                    indicator="dot"
                                />
                            }
                        />

                        {/* Áreas (preenchidas) */}
                        <Area dataKey="deposits" type="natural" fill="url(#fillDeposits)" stroke="var(--color-deposits)" name="deposits" />
                        <Area dataKey="yields" type="natural" fill="url(#fillYields)" stroke="var(--color-yields)" name="yields" />
                        <Area dataKey="withdraws" type="natural" fill="url(#fillWithdraws)" stroke="var(--color-withdraws)" name="withdraws" />

                        {/* Linha de destaque */}
                        <Line dataKey="net" type="monotone" stroke="var(--color-foreground)" strokeWidth={3} dot={{ r: 2.5 }} name="net" />

                        <ChartLegend content={<ChartLegendContent />} />
                    </AreaChart>
                </ChartContainer>
            </CardContent>
        </Card>
    );
}
