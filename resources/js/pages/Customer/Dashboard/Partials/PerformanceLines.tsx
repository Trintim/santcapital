import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { CartesianGrid, Line, LineChart, ReferenceLine, XAxis, YAxis } from "recharts";

type Point = {
    key: string; // "YYYY-MM-01"
    label: string; // "YYYY-MM-01"
    deposits: number;
    yields: number; // pode ser negativo
    withdraws: number;
    net: number; // dep + yields - withdraws (no mês)
    equity_close: number; // saldo ao fim do mês
};

// Evita bug do Safari com "YYYY-MM-DD"
function parseYmd(s: string) {
    const [y, m, d] = s.split("-").map(Number);
    return new Date(y, (m ?? 1) - 1, d ?? 1);
}

const chartConfig = {
    net: { label: "Aporte líquido", color: "var(--chart-3)" },
    yields: { label: "Rendimento do mês", color: "var(--chart-2)" },
    equity_close: { label: "Patrimônio (fim do mês)", color: "var(--foreground)" },
} satisfies ChartConfig;

export function PerformanceLines({ series }: { series: Point[] }) {
    const data = Array.isArray(series) ? series : [];

    return (
        <Card className="pt-0">
            <CardHeader className="flex items-center gap-3 space-y-0 border-b py-5 sm:flex-row">
                <div className="grid flex-1 gap-1">
                    <CardTitle>Fluxos mensais & Patrimônio</CardTitle>
                    <CardDescription>Linhas: aporte líquido, rendimento do mês e patrimônio acumulado ao fim de cada mês.</CardDescription>
                </div>
            </CardHeader>

            <CardContent className="px-2 pt-2 sm:px-2 sm:pt-2">
                <ChartContainer config={chartConfig} className="aspect-auto h-[300px] w-full">
                    <LineChart data={data} margin={{ top: 8, right: 8, bottom: 8, left: 8 }}>
                        <CartesianGrid vertical={false} />

                        <XAxis
                            dataKey="label"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            minTickGap={24}
                            tickFormatter={(v: string) => parseYmd(v).toLocaleDateString("pt-BR", { month: "short", year: "2-digit" })}
                        />

                        {/* Eixo esquerdo para fluxos (pode ser negativo) */}
                        <YAxis
                            yAxisId="left"
                            width={90}
                            tickMargin={0}
                            tickLine={{ stroke: "hsl(var(--border))", strokeOpacity: 0.6 }}
                            tickFormatter={(v: number) => `R$ ${v.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}`}
                        />
                        <YAxis
                            yAxisId="right"
                            orientation="right"
                            tickFormatter={() => ""} // sem texto
                            tickLine={false}
                            axisLine={false}
                        />

                        {/* Linha do zero para destacar positivos/negativos */}
                        <ReferenceLine yAxisId="left" y={0} stroke="hsl(var(--border))" strokeOpacity={0.6} />

                        <ChartTooltip
                            cursor={false}
                            content={
                                <ChartTooltipContent
                                    indicator="line"
                                    labelFormatter={(label) =>
                                        parseYmd(String(label)).toLocaleDateString("pt-BR", { month: "long", year: "numeric" })
                                    }
                                />
                            }
                        />

                        {/* Linhas de fluxos (esquerda) */}
                        <Line
                            yAxisId="left"
                            type="monotone"
                            dataKey="net"
                            name="Aporte líquido"
                            stroke="var(--color-net)"
                            strokeWidth={2}
                            dot={{ r: 2 }}
                            activeDot={{ r: 4 }}
                        />
                        <Line
                            yAxisId="left"
                            type="monotone"
                            dataKey="yields"
                            name="Rendimento do mês"
                            stroke="var(--color-yields)"
                            strokeWidth={2}
                            dot={{ r: 2 }}
                            activeDot={{ r: 4 }}
                        />

                        {/* Linha do patrimônio (direita) */}
                        <Line
                            yAxisId="right"
                            type="monotone"
                            dataKey="equity_close"
                            name="Patrimônio (fim do mês)"
                            stroke="var(--color-equity_close)"
                            strokeWidth={3}
                            dot={{ r: 2 }}
                            activeDot={{ r: 4 }}
                        />
                    </LineChart>
                </ChartContainer>
            </CardContent>
        </Card>
    );
}
