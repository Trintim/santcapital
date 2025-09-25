import { ComboBox, ComboItem } from "@/components/combobox";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import Layout from "@/layouts/app-layout";
import { ClientResource } from "@/types/client";
import { Head, Link, useForm } from "@inertiajs/react";
import { useEffect, useMemo, useState } from "react";

type Plan = {
    id: number;
    name: string;
    lockup_days: number | null;
    lockup_options?: { id: number; investment_plan_id: number; lockup_days: number; is_default: boolean }[];
};
export default function Create({ customers, plans }: { customers: ClientResource[]; plans: Plan[] }) {
    const { data, setData, post, processing, errors } = useForm({
        user_id: "",
        investment_plan_id: "",
        chosen_lockup_days: "",
    });

    const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);

    // opções dos combobox
    const customerItems: ComboItem[] = useMemo(
        () => customers.map((c: any) => ({ value: String(c.id), label: `${c.name} — ${c.email}`, meta: c })),
        [customers],
    );

    const planItems: ComboItem[] = useMemo(
        () =>
            plans.map((p: Plan) => ({
                value: String(p.id),
                label: p.name,
                meta: p,
            })),
        [plans],
    );

    const lockupItems: ComboItem[] = useMemo(() => {
        if (!selectedPlan) return [];
        const base = [...(selectedPlan.lockup_options?.map((o) => o.lockup_days) ?? []), selectedPlan.lockup_days].filter(
            (v): v is number => typeof v === "number",
        );
        const uniq = Array.from(new Set(base)).sort((a, b) => a - b);
        return uniq.map((d) => ({ value: String(d), label: `${d}` }));
    }, [selectedPlan]);

    useEffect(() => {
        const p = plans.find((pl: Plan) => String(pl.id) === String(data.investment_plan_id)) || null;
        setSelectedPlan(p);
        setData("chosen_lockup_days", "");
    }, [data.investment_plan_id]);

    function submit(e: React.FormEvent) {
        e.preventDefault();
        post(route("admin.customer-plans.store"));
    }

    return (
        <Layout>
            <Head title="Vincular Plano" />
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl">Vincular plano a cliente</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={submit} className="grid gap-6 md:grid-cols-2">
                        <div className="md:col-span-2">
                            <Label>Cliente</Label>
                            <ComboBox
                                value={String(data.user_id || "")}
                                onChange={(v) => setData("user_id", v)}
                                items={customerItems}
                                placeholder="Selecione o cliente…"
                                searchPlaceholder="Buscar cliente…"
                            />
                            {errors.user_id && <p className="mt-1 text-sm text-red-500">{errors.user_id}</p>}
                        </div>

                        {/* Plano */}
                        <div className="md:col-span-2">
                            <Label>Plano</Label>
                            <ComboBox
                                value={String(data.investment_plan_id || "")}
                                onChange={(v, picked) => setData("investment_plan_id", v)}
                                items={planItems}
                                placeholder="Selecione o plano…"
                                searchPlaceholder="Buscar plano…"
                            />
                            {errors.investment_plan_id && <p className="mt-1 text-sm text-red-500">{errors.investment_plan_id}</p>}
                        </div>

                        {/* Carência (opcional) */}
                        <div className="md:col-span-2">
                            <Label>Carência (dias) — opcional</Label>
                            <ComboBox
                                value={String(data.chosen_lockup_days || "")}
                                onChange={(v) => setData("chosen_lockup_days", v)}
                                items={lockupItems}
                                placeholder={selectedPlan ? "Escolha ou deixe em branco p/ padrão" : "Selecione um plano primeiro"}
                                searchPlaceholder="Buscar carência…"
                            />
                            {errors.chosen_lockup_days && <p className="mt-1 text-sm text-red-500">{errors.chosen_lockup_days}</p>}
                            <p className="mt-1 text-xs text-muted-foreground">Deixe vazio para usar a carência padrão do plano.</p>
                        </div>

                        <div className="flex gap-2 md:col-span-2">
                            <Link href={route("admin.customer-plans.index")}>
                                <Button variant="outline">Cancelar</Button>
                            </Link>
                            <Button type="submit" disabled={processing}>
                                Salvar vínculo
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </Layout>
    );
}
