import { PercentInput } from "@/components/form/PercentInput";
import InputError from "@/components/input-error";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import AppLayout from "@/layouts/app-layout";
import { Head, useForm } from "@inertiajs/react";
import { toast } from "sonner";

type CustomerPlan = { id: number; customer_name: string; plan_id: number; plan_name: string };

type Props = {
    customYield: {
        id: number;
        customer_plan_id: number;
        period: string;
        percent_decimal: string;
    };
    customerPlans: CustomerPlan[];
};

export default function WeeklyYieldEdit({ customYield, customerPlans }: Props) {
    const { data, setData, put, errors } = useForm({
        customer_plan_id: String(customYield.customer_plan_id),
        period: customYield.period,
        percent_decimal: customYield.percent_decimal,
    });
    console.log(data);

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        put(`/admin/rendimentos-semanais/update/${customYield.id}`, {
            onSuccess: () => toast.success("Rendimento personalizado atualizado!"),
            onError: () => toast.error("Erro ao atualizar rendimento. Verifique os campos e tente novamente."),
        });
    }

    return (
        <AppLayout>
            <Head title="Editar rendimento personalizado" />
            <div className="mx-auto max-w-xl py-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Editar rendimento personalizado</CardTitle>
                        <CardDescription>Altere os dados do rendimento manual para o cliente/plano.</CardDescription>
                    </CardHeader>
                    <form onSubmit={handleSubmit} className="space-y-6 px-6 pb-6">
                        <div>
                            <Label htmlFor="customer_plan_id">Cliente/Plano</Label>
                            <Select value={data.customer_plan_id} onValueChange={(v) => setData("customer_plan_id", v)}>
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
                            <InputError message={errors.customer_plan_id} />
                        </div>
                        <div>
                            <Label htmlFor="period">Período (início da semana)</Label>
                            <input
                                type="date"
                                name="period"
                                id="period"
                                value={data.period}
                                onChange={(e) => setData("period", e.target.value)}
                                required
                                className="w-full rounded border px-3 py-2"
                            />
                            <InputError message={errors.period} />
                        </div>
                        <div>
                            <Label htmlFor="percent_decimal">Percentual</Label>
                            <PercentInput value={data.percent_decimal} onChange={(v) => setData("percent_decimal", v)} placeholder="0,00" />
                            <InputError message={errors.percent_decimal} />
                        </div>
                        <Button type="submit" className="mt-6 w-full">
                            Salvar alterações
                        </Button>
                    </form>
                </Card>
            </div>
        </AppLayout>
    );
}
