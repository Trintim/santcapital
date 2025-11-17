import { ComboBox } from "@/components/combobox";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Layout from "@/layouts/app-layout";
import { Head, Link, useForm } from "@inertiajs/react";
import { FormEvent, useMemo } from "react";
import { toast } from "sonner";

export default function Create({ customerPlans }) {
    const preselectedCp = (() => {
        if (typeof window === "undefined") return "";
        const params = new URLSearchParams(window.location.search);
        return params.get("cp") ?? "";
    })();

    const { data, setData, post, processing, errors } = useForm({
        customer_plan_id: preselectedCp, // <-- inicia com o cp
        amount: "",
        effective_date: "",
    });

    const cpItems = useMemo(
        () =>
            customerPlans.map((cp: { id: number; customer?: { name?: string }; plan?: { name?: string }; status?: string }) => ({
                value: String(cp.id),
                label: `${cp.customer?.name} — ${cp.plan?.name}${cp.status === "pre_active" ? " (pré-ativo)" : ""}`,
            })),
        [customerPlans],
    );

    function submit(e: FormEvent) {
        e.preventDefault();
        post(route("admin.deposits.store"), {
            onSuccess: () => {
                toast.success("Aporte criado com sucesso.");
            },
            onError: () => {
                toast.error("Erro ao criar aporte. Verifique os campos.");
            },
        });
    }

    return (
        <Layout>
            <Head title="Novo Aporte" />

            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl">Novo aporte</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={submit} className="grid gap-6 md:grid-cols-2">
                        <div className="md:col-span-2">
                            <Label>Cliente — Plano</Label>
                            <ComboBox
                                value={String(data.customer_plan_id || "")}
                                onChange={(v) => setData("customer_plan_id", v)}
                                items={cpItems}
                                placeholder="Selecione o vínculo…"
                                searchPlaceholder="Buscar cliente/plano…"
                            />
                            {errors.customer_plan_id && <p className="mt-1 text-sm text-red-500">{errors.customer_plan_id}</p>}
                        </div>

                        <div>
                            <Label htmlFor="amount">Valor (R$)</Label>
                            <Input id="amount" type="number" step="0.01" value={data.amount} onChange={(e) => setData("amount", e.target.value)} />
                            {errors.amount && <p className="mt-1 text-sm text-red-500">{errors.amount}</p>}
                        </div>

                        <div>
                            <Label htmlFor="effective_date">Data (opcional)</Label>
                            <Input
                                id="effective_date"
                                type="date"
                                value={data.effective_date}
                                onChange={(e) => setData("effective_date", e.target.value)}
                            />
                            {errors.effective_date && <p className="mt-1 text-sm text-red-500">{errors.effective_date}</p>}
                        </div>

                        <div className="flex gap-2 md:col-span-2">
                            <Link href={route("admin.deposits.index")}>
                                <Button variant="outline">Cancelar</Button>
                            </Link>
                            <Button type="submit" disabled={processing}>
                                Salvar
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </Layout>
    );
}
