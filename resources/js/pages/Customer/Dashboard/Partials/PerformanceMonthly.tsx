// resources/js/pages/Customer/Dashboard/Partials/PerformanceMonthly.tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Bar, CartesianGrid, ComposedChart, Line, ReferenceLine, Tooltip, XAxis, YAxis } from "recharts";

type Point = {
    key: string; // "YYYY-MM-01"
    label: string; // "YYYY-MM-01"
    deposits: number;
    yields: number; // pode ser negativo!
    withdraws: number;
    net: number; // dep + yields - withdraws (no mês)
    equity_close: number; // saldo ao fim do mês
};

export function PerformanceMonthly({ series }: { series: Point[] }) {
    const tickFmt = (iso: string) => new Date(iso).toLocaleDateString("pt-BR", { month: "short", year: "2-digit" });

    const fmtBRL = (n: number) => `R$ ${n.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;

    return (
        <Card className="pt-0">
            <CardHeader className="flex items-center gap-3 space-y-0 border-b py-5 sm:flex-row">
                <div className="grid flex-1 gap-1">
                    <CardTitle>Variação mensal & Patrimônio</CardTitle>
                    <CardDescription>
                        Barras: rendimento (pode ser negativo) e aporte líquido. Linha: saldo acumulado no fim de cada mês.
                    </CardDescription>
                </div>
            </CardHeader>

            <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
                <div className="aspect-auto h-[300px] w-full">
                    <ComposedChart data={series}>
                        <CartesianGrid vertical={false} strokeOpacity={0.15} />

                        <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} minTickGap={24} tickFormatter={tickFmt} />

                        <YAxis
                            yAxisId="left"
                            width={90}
                            tickFormatter={(v: number) => `R$ ${v.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}`}
                        />
                        <YAxis
                            yAxisId="right"
                            orientation="right"
                            width={80}
                            tickFormatter={(v: number) => `R$ ${v.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}`}
                        />

                        {/* Zero line para destacar positivo/negativo */}
                        <ReferenceLine y={0} yAxisId="left" stroke="var(--border)" strokeOpacity={0.6} />

                        <Tooltip
                            formatter={(value: any, name: any) => {
                                if (typeof value === "number") return [fmtBRL(value), name];
                                return [value, name];
                            }}
                            labelFormatter={(label) => new Date(label).toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}
                        />

                        {/* Aporte líquido do mês (depósitos - saques) */}
                        <Bar
                            yAxisId="left"
                            dataKey={(p: Point) => p.deposits - p.withdraws}
                            name="Aporte líquido"
                            fill="var(--chart-3)" // usa paleta do tema
                            radius={[4, 4, 0, 0]}
                        />

                        {/* Rendimento do mês (pode ser negativo) */}
                        <Bar yAxisId="left" dataKey="yields" name="Rendimento do mês" fill="var(--chart-2)" radius={[4, 4, 0, 0]} />

                        {/* Patrimônio (fim do mês) */}
                        <Line
                            yAxisId="right"
                            type="monotone"
                            dataKey="equity_close"
                            name="Saldo acumulado (fim do mês)"
                            stroke="var(--foreground)"
                            strokeWidth={3}
                            dot={{ r: 2 }}
                            activeDot={{ r: 4 }}
                        />
                    </ComposedChart>
                </div>
            </CardContent>
        </Card>
    );
}
