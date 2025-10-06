import { router } from "@inertiajs/react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { route } from "ziggy-js";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
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

    const filteredData = series.filter((item) => {
        const date = new Date(item.label);
        //hoje
        const referenceDate = new Date();

        let daysToSubtract = 365;

        if (range === "12m") {
            daysToSubtract = 365;
        } else if (range === "9m") {
            daysToSubtract = 270;
        } else if (range === "3m") {
            daysToSubtract = 90;
        } else if (range === "7d") {
            daysToSubtract = 7;
        }

        const startDate = new Date(referenceDate);

        startDate.setDate(startDate.getDate() - daysToSubtract);

        return date >= startDate;
    });

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
                    <AreaChart accessibilityLayer data={filteredData}>
                        <CartesianGrid vertical={false} />

                        <XAxis
                            dataKey="label"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            minTickGap={32}
                            tickFormatter={(value) => {
                                const date = new Date(value);
                                // return day = 23 Mai 2025, se nao Mai 2025 ...
                                return dimension.mode === "day"
                                    ? date.toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "2-digit" })
                                    : date.toLocaleDateString("pt-BR", { month: "short", year: "2-digit" });
                            }}
                        />

                        <ChartTooltip
                            cursor={false}
                            content={
                                <ChartTooltipContent
                                    labelFormatter={(label) => {
                                        const date = new Date(label);
                                        return dimension.mode === "day"
                                            ? date.toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })
                                            : date.toLocaleDateString("pt-BR", { year: "numeric", month: "short", day: "numeric" });
                                    }}
                                    indicator="dot"
                                />
                            }
                        />

                        <defs>
                            {/* IDs e cores alinhados ao chartConfig */}
                            <linearGradient id="fillDeposits" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="var(--color-deposits)" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="var(--color-deposits)" stopOpacity={0.1} />
                            </linearGradient>
                            <linearGradient id="fillYields" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="var(--color-yields)" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="var(--color-yields)" stopOpacity={0.1} />
                            </linearGradient>
                            <linearGradient id="fillWithdraws" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="var(--color-withdraws)" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="var(--color-withdraws)" stopOpacity={0.1} />
                            </linearGradient>
                        </defs>

                        <YAxis
                            width={90}
                            tickFormatter={(v: number) => `R$ ${v.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}`}
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            minTickGap={16}
                        />

                        <Area dataKey="deposits" type="natural" fill="url(#fillDeposits)" stroke="var(--color-deposits)" />
                        <Area dataKey="yields" type="natural" fill="url(#fillYields)" stroke="var(--color-yields)" />
                        <Area dataKey="withdraws" type="natural" fill="url(#fillWithdraws)" stroke="var(--color-withdraws)" />
                    </AreaChart>
                </ChartContainer>
            </CardContent>
        </Card>
    );
}
