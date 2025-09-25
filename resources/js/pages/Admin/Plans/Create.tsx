import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { Textarea } from "@/components/ui/textarea";
import AppLayout from "@/layouts/app-layout";
import { Head, Link, useForm } from "@inertiajs/react";

export default function Create() {
    const { data, setData, post, processing, errors } = useForm({
        name: "",
        description: "",
        lockup_days: 30,
        minimum_deposit_amount: 0,
        contract_term_months: 12,
        expected_return_min_decimal: "",
        expected_return_max_decimal: "",
        extra_bonus_percent_on_capital_decimal: "",
        withdrawal_only_at_maturity: false,
        guaranteed_min_multiplier_after_24m: "",
        is_active: true,
    });

    function submit(e: any) {
        e.preventDefault();
        post(route("admin.plans.store"));
    }

    return (
        <AppLayout>
            <Head title="Novo Plano" />

            <Card className="space-y-4 p-6">
                <CardHeader>
                    <CardTitle className="text-2xl">Novo Plano de Investimento</CardTitle>
                </CardHeader>

                <CardContent>
                    <form onSubmit={submit} className="grid gap-6 md:grid-cols-2">
                        <div>
                            <Label htmlFor="name">Nome (visível ao usuário)</Label>
                            <Input id="name" value={data.name} onChange={(e) => setData("name", e.target.value)} />
                            {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
                        </div>

                        <div>
                            <Label htmlFor="lockup_days">Carência padrão (dias)</Label>
                            <Input
                                id="lockup_days"
                                type="number"
                                value={data.lockup_days}
                                onChange={(e) => setData("lockup_days", Number(e.target.value))}
                            />
                        </div>

                        <div>
                            <Label htmlFor="minimum_deposit_amount">Aporte mínimo (R$)</Label>
                            <Input
                                id="minimum_deposit_amount"
                                type="number"
                                step="0.01"
                                value={data.minimum_deposit_amount}
                                onChange={(e) => {
                                    setData("minimum_deposit_amount", e.target.value);
                                }}
                            />
                        </div>

                        <div>
                            <Label htmlFor="contract_term_months">Prazo (meses)</Label>
                            <Input
                                id="contract_term_months"
                                type="number"
                                value={data.contract_term_months ?? 0}
                                onChange={(e) => {
                                    setData("contract_term_months", e.target.value ? Number(e.target.value) : null);
                                }}
                            />
                        </div>

                        <div className="md:col-span-2">
                            <Label htmlFor="description">Descrição (PT-BR)</Label>
                            <Textarea id="description" rows={4} value={data.description} onChange={(e) => setData("description", e.target.value)} />
                        </div>

                        <div>
                            <Label htmlFor="expected_return_min_decimal">Rendimento esperado (mín., decimal)</Label>
                            <Input
                                id="expected_return_min_decimal"
                                placeholder="0.0265 = 2,65%"
                                value={data.expected_return_min_decimal}
                                onChange={(e) => setData("expected_return_min_decimal", e.target.value)}
                            />
                        </div>

                        <div>
                            <Label htmlFor="expected_return_max_decimal">Rendimento esperado (máx., decimal)</Label>
                            <Input
                                id="expected_return_max_decimal"
                                placeholder="0.0392 = 3,92%"
                                value={data.expected_return_max_decimal}
                                onChange={(e) => setData("expected_return_max_decimal", e.target.value)}
                            />
                        </div>

                        <div>
                            <Label htmlFor="extra_bonus_percent_on_capital_decimal">Bônus sobre capital (decimal)</Label>
                            <Input
                                id="extra_bonus_percent_on_capital_decimal"
                                placeholder="0.015 = +1,5%"
                                value={data.extra_bonus_percent_on_capital_decimal}
                                onChange={(e) => setData("extra_bonus_percent_on_capital_decimal", e.target.value)}
                            />
                        </div>

                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="withdrawal_only_at_maturity"
                                checked={data.withdrawal_only_at_maturity}
                                onCheckedChange={(checked) => {
                                    setData("withdrawal_only_at_maturity", Boolean(checked));
                                }}
                            />
                            <Label htmlFor="withdrawal_only_at_maturity">Saque somente no vencimento</Label>
                        </div>

                        <div>
                            <Label htmlFor="guaranteed_min_multiplier_after_24m">Garantia mínima (após 24m, multiplicador)</Label>
                            <Input
                                id="guaranteed_min_multiplier_after_24m"
                                placeholder="2.00"
                                value={data.guaranteed_min_multiplier_after_24m}
                                onChange={(e) => setData("guaranteed_min_multiplier_after_24m", e.target.value)}
                            />
                        </div>

                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="is_active"
                                checked={data.is_active}
                                onCheckedChange={(checked) => {
                                    setData("is_active", Boolean(checked));
                                }}
                            />
                            <Label htmlFor="is_active">Plano ativo</Label>
                        </div>

                        <div className="flex gap-2 md:col-span-2">
                            <Link href={route("admin.plans.index")}>
                                <Button variant="outline">Cancelar</Button>
                            </Link>
                            <Button type="submit" disabled={processing}>
                                Salvar
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>

            {/*<div className="space-y-4 p-6">*/}
            {/*    <h1 className="text-2xl font-bold">Novo Plano</h1>*/}

            {/*    <form onSubmit={submit} className="grid gap-4 md:grid-cols-2">*/}
            {/*        <div>*/}
            {/*            <label className="mb-1 block text-sm">Nome (visível ao usuário)</label>*/}
            {/*            <input className="w-full rounded border p-2" value={data.name} onChange={(e) => setData("name", e.target.value)} />*/}
            {/*            {errors.name && <p className="text-sm text-red-600">{errors.name}</p>}*/}
            {/*        </div>*/}

            {/*        <div>*/}
            {/*            <label className="mb-1 block text-sm">Carência padrão (dias)</label>*/}
            {/*            <input*/}
            {/*                type="number"*/}
            {/*                className="w-full rounded border p-2"*/}
            {/*                value={data.lockup_days}*/}
            {/*                onChange={(e) => setData("lockup_days", Number(e.target.value))}*/}
            {/*            />*/}
            {/*        </div>*/}

            {/*        <div>*/}
            {/*            <label className="mb-1 block text-sm">Aporte mínimo (R$)</label>*/}
            {/*            <input*/}
            {/*                type="number"*/}
            {/*                step="0.01"*/}
            {/*                className="w-full rounded border p-2"*/}
            {/*                value={data.minimum_deposit_amount}*/}
            {/*                onChange={(e) => setData("minimum_deposit_amount", e.target.value)}*/}
            {/*            />*/}
            {/*        </div>*/}

            {/*        <div>*/}
            {/*            <label className="mb-1 block text-sm">Prazo (meses)</label>*/}
            {/*            <input*/}
            {/*                type="number"*/}
            {/*                className="w-full rounded border p-2"*/}
            {/*                value={data.contract_term_months || ""}*/}
            {/*                onChange={(e) => setData("contract_term_months", e.target.value ? Number(e.target.value) : null)}*/}
            {/*            />*/}
            {/*        </div>*/}

            {/*        <div className="md:col-span-2">*/}
            {/*            <label className="mb-1 block text-sm">Descrição (PT-BR)</label>*/}
            {/*            <textarea*/}
            {/*                className="w-full rounded border p-2"*/}
            {/*                rows={4}*/}
            {/*                value={data.description}*/}
            {/*                onChange={(e) => setData("description", e.target.value)}*/}
            {/*            />*/}
            {/*        </div>*/}

            {/*        <div>*/}
            {/*            <label className="mb-1 block text-sm">Rendimento esperado (mín., decimal)</label>*/}
            {/*            <input*/}
            {/*                placeholder="Ex.: 0.0265 = 2,65%"*/}
            {/*                className="w-full rounded border p-2"*/}
            {/*                value={data.expected_return_min_decimal}*/}
            {/*                onChange={(e) => setData("expected_return_min_decimal", e.target.value)}*/}
            {/*            />*/}
            {/*        </div>*/}

            {/*        <div>*/}
            {/*            <label className="mb-1 block text-sm">Rendimento esperado (máx., decimal)</label>*/}
            {/*            <input*/}
            {/*                placeholder="Ex.: 0.0392 = 3,92%"*/}
            {/*                className="w-full rounded border p-2"*/}
            {/*                value={data.expected_return_max_decimal}*/}
            {/*                onChange={(e) => setData("expected_return_max_decimal", e.target.value)}*/}
            {/*            />*/}
            {/*        </div>*/}

            {/*        <div>*/}
            {/*            <label className="mb-1 block text-sm">Bônus sobre capital (decimal)</label>*/}
            {/*            <input*/}
            {/*                placeholder="Ex.: 0.015 = +1,5%"*/}
            {/*                className="w-full rounded border p-2"*/}
            {/*                value={data.extra_bonus_percent_on_capital_decimal}*/}
            {/*                onChange={(e) => setData("extra_bonus_percent_on_capital_decimal", e.target.value)}*/}
            {/*            />*/}
            {/*        </div>*/}

            {/*        <div className="flex items-center gap-2">*/}
            {/*            <input*/}
            {/*                id="wom"*/}
            {/*                type="checkbox"*/}
            {/*                checked={data.withdrawal_only_at_maturity}*/}
            {/*                onChange={(e) => setData("withdrawal_only_at_maturity", e.target.checked)}*/}
            {/*            />*/}
            {/*            <label htmlFor="wom">Saque somente no vencimento</label>*/}
            {/*        </div>*/}

            {/*        <div>*/}
            {/*            <label className="mb-1 block text-sm">Garantia mínima (após 24m, multiplicador)</label>*/}
            {/*            <input*/}
            {/*                placeholder="Ex.: 2.00"*/}
            {/*                className="w-full rounded border p-2"*/}
            {/*                value={data.guaranteed_min_multiplier_after_24m}*/}
            {/*                onChange={(e) => setData("guaranteed_min_multiplier_after_24m", e.target.value)}*/}
            {/*            />*/}
            {/*        </div>*/}

            {/*        <div className="flex items-center gap-2">*/}
            {/*            <input id="active" type="checkbox" checked={data.is_active} onChange={(e) => setData("is_active", e.target.checked)} />*/}
            {/*            <label htmlFor="active">Plano ativo</label>*/}
            {/*        </div>*/}

            {/*        <div className="flex gap-2 md:col-span-2">*/}
            {/*            <Link href={route("admin.plans.index")} className="rounded border px-3 py-2">*/}
            {/*                Cancelar*/}
            {/*            </Link>*/}
            {/*            <button disabled={processing} className="rounded bg-black px-3 py-2 text-white">*/}
            {/*                Salvar*/}
            {/*            </button>*/}
            {/*        </div>*/}
            {/*    </form>*/}
            {/*</div>*/}
        </AppLayout>
    );
}
