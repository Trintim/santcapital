import { PercentInput } from "@/components/form/PercentInput";
import InputError from "@/components/input-error";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import AppLayout from "@/layouts/app-layout";
import { Head, useForm } from "@inertiajs/react";
import { useState } from "react";
import { toast } from "sonner";

type CustomerPlan = { id: number; customer_name: string; plan_id: number; plan_name: string };

type Props = {
    customerPlans: CustomerPlan[];
    userId: number;
};

export default function WeeklyYieldForm({ customerPlans, userId }: Props) {
    const { data, setData, post, errors } = useForm({
        period: "",
        custom_yields: [] as { customer_plan_id: number; percent_decimal: string }[],
        recorded_by: userId,
    });
    const [customYield, setCustomYield] = useState({ customer_plan_id: "", percent_decimal: "" });

    function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
        setData(e.target.name as keyof typeof data, e.target.value);
    }

    function handleCustomYieldAdd() {
        if (customYield.customer_plan_id && customYield.percent_decimal) {
            setData("custom_yields", [
                ...data.custom_yields,
                {
                    customer_plan_id: Number(customYield.customer_plan_id),
                    percent_decimal: customYield.percent_decimal,
                },
            ]);
            setCustomYield({ customer_plan_id: "", percent_decimal: "" });
        }
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        post("/admin/rendimentos-semanais", {
            onSuccess: () => toast.success("Rendimento registrado com sucesso."),
            onError: () => toast.error("Erro ao registrar rendimento. Verifique os campos e tente novamente."),
        });
    }

    return (
        <AppLayout>
            <Head title="Cadastrar rendimento semanal personalizado" />
            <div className="mx-auto max-w-xl py-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Cadastro de rendimento semanal personalizado</CardTitle>
                        <CardDescription>
                            Adicione rendimentos manuais para clientes em seus planos ativos. O rendimento padrão do plano será aplicado
                            automaticamente para os demais.
                        </CardDescription>
                    </CardHeader>
                    <form onSubmit={handleSubmit} className="space-y-6 px-6 pb-6">
                        <div>
                            <Label htmlFor="period">Período (início da semana)</Label>
                            <input
                                type="date"
                                name="period"
                                id="period"
                                value={data.period}
                                onChange={handleChange}
                                required
                                className="w-full rounded border px-3 py-2"
                            />
                            <InputError message={errors.period} />
                        </div>
                        <div className="mt-8">
                            <CardTitle className="mb-2 text-base">Rendimentos personalizados para clientes</CardTitle>
                            <div className="mb-2 flex items-end gap-2">
                                <div className="flex-1">
                                    <Label htmlFor="customer_plan_id">Cliente/Plano</Label>
                                    <Select
                                        value={customYield.customer_plan_id}
                                        onValueChange={(v) => setCustomYield({ ...customYield, customer_plan_id: v })}
                                    >
                                        <SelectTrigger id="customer_plan_id">
                                            <SelectValue placeholder="Selecione o cliente/plano" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {customerPlans.map((cp) => (
                                                <SelectItem key={cp.id} value={String(cp.id)}>
                                                    {cp.customer_name} - {cp.plan_name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="w-32">
                                    <Label htmlFor="custom_percent">Percentual</Label>
                                    <PercentInput
                                        value={customYield.percent_decimal}
                                        onChange={(v) => setCustomYield({ ...customYield, percent_decimal: v })}
                                        placeholder="0,00"
                                    />
                                </div>
                                <Button type="button" variant="secondary" onClick={handleCustomYieldAdd}>
                                    Adicionar
                                </Button>
                            </div>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Cliente</TableHead>
                                        <TableHead>Plano</TableHead>
                                        <TableHead>Percentual</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {data.custom_yields.map((cy, idx) => {
                                        const cp = customerPlans.find((cp) => cp.id === cy.customer_plan_id);
                                        return (
                                            <TableRow key={idx}>
                                                <TableCell>{cp?.customer_name ?? cy.customer_plan_id}</TableCell>
                                                <TableCell>{cp?.plan_name ?? "-"}</TableCell>
                                                <TableCell>{cy.percent_decimal}%</TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </div>
                        <Button type="submit" className="mt-6 w-full">
                            Registrar rendimentos
                        </Button>
                    </form>
                </Card>
            </div>
        </AppLayout>
    );
}
