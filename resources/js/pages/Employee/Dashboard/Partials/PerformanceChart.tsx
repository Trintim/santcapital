import { router } from "@inertiajs/react";
import { Area, AreaChart, CartesianGrid, Line, XAxis, YAxis } from "recharts";
import { route } from "ziggy-js";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type Point = {
    key: string;
    label: string;
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
                <ChartContainer config={chartConfig} className="aspect-auto h-[250px] w-full">
                    <AreaChart margin={{ top: 10, right: 20, left: 0, bottom: 0 }} data={series}>
                        <defs>
                            {/* IDs e cores alinhados ao chartConfig */}
                            <linearGradient id="fillDeposits" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="var(--color-deposits)" stopOpacity={0.5} />
                                <stop offset="95%" stopColor="var(--color-deposits)" stopOpacity={0.05} />
                            </linearGradient>
                            <linearGradient id="fillYields" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="var(--color-yields)" stopOpacity={0.5} />
                                <stop offset="95%" stopColor="var(--color-yields)" stopOpacity={0.05} />
                            </linearGradient>
                            <linearGradient id="fillWithdraws" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="var(--color-withdraws)" stopOpacity={0.45} />
                                <stop offset="95%" stopColor="var(--color-withdraws)" stopOpacity={0.03} />
                            </linearGradient>
                        </defs>

                        <CartesianGrid vertical={false} strokeOpacity={0.15} />
                        <XAxis strokeLinecap={"round"} dataKey="label" tickLine={false} axisLine={false} tickMargin={8} minTickGap={32} />
                        <YAxis
                            width={90}
                            tickFormatter={(v: number) => `R$ ${v.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}`}
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            minTickGap={16}
                        />

                        <ChartTooltip
                            cursor={false}
                            content={
                                <ChartTooltipContent
                                    indicator="dot"
                                    labelFormatter={(label) => {
                                        const date = new Date(label);
                                        return dimension.mode === "day"
                                            ? date.toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })
                                            : date.toLocaleDateString("pt-BR", { year: "numeric", month: "short", day: "numeric" });
                                    }}
                                />
                            }
                        />

                        {/* 3) dataKey, stroke/fill usando as vars do config */}
                        <Area dataKey="deposits" name="Aportes" type="natural" fill="url(#fillDeposits)" stroke="var(--color-deposits)" />
                        <Area dataKey="yields" name="Rendimentos" type="natural" fill="url(#fillYields)" stroke="var(--color-yields)" />
                        <Area dataKey="withdraws" name="Saques" type="natural" fill="url(#fillWithdraws)" stroke="var(--color-withdraws)" />

                        {/* Linha de destaque também com a var correspondente */}
                        <Line dataKey="net" name="Fluxo líquido" type="monotone" stroke="var(--color-net)" strokeWidth={3} dot={{ r: 2.5 }} />
                        <ChartLegend content={<ChartLegendContent />} />
                    </AreaChart>
                </ChartContainer>
            </CardContent>
        </Card>
    );
}
