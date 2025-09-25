import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import AppLayout from "@/layouts/app-layout";
import { Head, Link, useForm } from "@inertiajs/react";
import { toast } from "sonner";

export default function Edit({ plan }) {
    const { data, setData, put, processing, errors } = useForm({
        name: plan.data.name ?? "",
        description: plan.data.description ?? "",
        lockup_days: plan.data.lockup_days ?? 0,
        minimum_deposit_amount: plan.data.minimum_deposit_amount ?? 0,
        contract_term_months: plan.data.contract_term_months,
        expected_return_min_decimal: plan.data.expected_return_min_decimal ?? "",
        expected_return_max_decimal: plan.data.expected_return_max_decimal ?? "",
        extra_bonus_percent_on_capital_decimal: plan.data.extra_bonus_percent_on_capital_decimal ?? "",
        withdrawal_only_at_maturity: !!plan.data.withdrawal_only_at_maturity,
        guaranteed_min_multiplier_after_24m: plan.data.guaranteed_min_multiplier_after_24m ?? "",
        is_active: !!plan.data.is_active,
    });

    function submit(e: any) {
        e.preventDefault();
        put(route("admin.plans.update", { plan: plan.data.id }), {
            onSuccess: () => {
                toast.success("Plano atualizado com sucesso!");
            },
            onError: () => {
                toast.error("Erro ao atualizar o plano.");
            },
        });
    }

    return (
        <AppLayout>
            <div className="space-y-6 p-6">
                <Head title={`Editar: ${plan.data.name}`} />

                <Card className="mx-auto max-w-4xl">
                    <CardHeader>
                        <CardTitle className="text-2xl">Editar plano</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={submit} className="grid gap-6 md:grid-cols-2">
                            {/* mesmos campos do create */}
                            <div>
                                <Label htmlFor="name">Nome</Label>
                                <Input id="name" value={data.name} onChange={(e) => setData("name", e.target.value)} />
                                {errors.name && <div className="mt-1 text-sm text-red-600">{errors.name}</div>}
                            </div>
                            <div>
                                <Label htmlFor="lockup_days">Carência padrão (dias)</Label>
                                <Input
                                    id="lockup_days"
                                    type="number"
                                    value={data.lockup_days}
                                    onChange={(e) => setData("lockup_days", Number(e.target.value))}
                                />
                                {errors.lockup_days && <div className="mt-1 text-sm text-red-600">{errors.lockup_days}</div>}
                            </div>
                            <div>
                                <Label htmlFor="minimum_deposit_amount">Aporte mínimo (R$)</Label>
                                <Input
                                    id="minimum_deposit_amount"
                                    type="number"
                                    step="0.01"
                                    value={data.minimum_deposit_amount}
                                    onChange={(e) => setData("minimum_deposit_amount", e.target.value)}
                                />
                                {errors.minimum_deposit_amount && <div className="mt-1 text-sm text-red-600">{errors.minimum_deposit_amount}</div>}
                            </div>
                            <div>
                                <Label htmlFor="contract_term_months">Prazo (meses)</Label>
                                <Input
                                    id="contract_term_months"
                                    type="number"
                                    value={data.contract_term_months ?? ""}
                                    onChange={(e) => setData("contract_term_months", e.target.value ? Number(e.target.value) : null)}
                                />
                                {errors.contract_term_months && <div className="mt-1 text-sm text-red-600">{errors.contract_term_months}</div>}
                            </div>
                            <div className="md:col-span-2">
                                <Label htmlFor="description">Descrição</Label>
                                <Textarea
                                    id="description"
                                    rows={4}
                                    value={data.description}
                                    onChange={(e) => setData("description", e.target.value)}
                                />
                                {errors.description && <div className="mt-1 text-sm text-red-600">{errors.description}</div>}
                            </div>
                            <div>
                                <Label htmlFor="expected_return_min_decimal">Rendimento esperado (mín., decimal)</Label>
                                <Input
                                    id="expected_return_min_decimal"
                                    value={data.expected_return_min_decimal}
                                    onChange={(e) => setData("expected_return_min_decimal", e.target.value)}
                                />
                                {errors.expected_return_min_decimal && (
                                    <div className="mt-1 text-sm text-red-600">{errors.expected_return_min_decimal}</div>
                                )}
                            </div>
                            <div>
                                <Label htmlFor="expected_return_max_decimal">Rendimento esperado (máx., decimal)</Label>
                                <Input
                                    id="expected_return_max_decimal"
                                    value={data.expected_return_max_decimal}
                                    onChange={(e) => setData("expected_return_max_decimal", e.target.value)}
                                />
                                {errors.expected_return_max_decimal && (
                                    <div className="mt-1 text-sm text-red-600">{errors.expected_return_max_decimal}</div>
                                )}
                            </div>
                            <div>
                                <Label htmlFor="extra_bonus_percent_on_capital_decimal">Bônus sobre capital (decimal)</Label>
                                <Input
                                    id="extra_bonus_percent_on_capital_decimal"
                                    value={data.extra_bonus_percent_on_capital_decimal}
                                    onChange={(e) => setData("extra_bonus_percent_on_capital_decimal", e.target.value)}
                                />
                                {errors.extra_bonus_percent_on_capital_decimal && (
                                    <div className="mt-1 text-sm text-red-600">{errors.extra_bonus_percent_on_capital_decimal}</div>
                                )}
                            </div>
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="withdrawal_only_at_maturity"
                                    checked={data.withdrawal_only_at_maturity}
                                    onCheckedChange={(c) => setData("withdrawal_only_at_maturity", Boolean(c))}
                                />
                                <Label htmlFor="withdrawal_only_at_maturity">Saque somente no vencimento</Label>
                            </div>
                            <div>
                                <Label htmlFor="guaranteed_min_multiplier_after_24m">Garantia mínima (após 24m)</Label>
                                <Input
                                    id="guaranteed_min_multiplier_after_24m"
                                    value={data.guaranteed_min_multiplier_after_24m}
                                    onChange={(e) => setData("guaranteed_min_multiplier_after_24m", e.target.value)}
                                />
                                {errors.guaranteed_min_multiplier_after_24m && (
                                    <div className="mt-1 text-sm text-red-600">{errors.guaranteed_min_multiplier_after_24m}</div>
                                )}
                            </div>
                            <div className="flex items-center space-x-2">
                                <Checkbox id="is_active" checked={data.is_active} onCheckedChange={(c) => setData("is_active", Boolean(c))} />
                                <Label htmlFor="is_active">Plano ativo</Label>
                            </div>
                            <div className="flex gap-2 md:col-span-2">
                                <Link href={route("admin.plans.index")}>
                                    <Button variant="outline">Voltar</Button>
                                </Link>
                                <Button disabled={processing}>Salvar alterações</Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>

                <LockupOptions plan={plan} />
            </div>
        </AppLayout>
    );
}

function LockupOptions({ plan }: any) {
    const { data, setData, post, processing, errors } = useForm({
        lockup_days: "" as string,
        is_default: false as boolean,
    });

    const submit = (e: any) => {
        e.preventDefault();
        post(route("admin.plans.lockups.store", { plan: plan.data.id }), {
            preserveScroll: true,
            onSuccess: () => {
                toast.success("Opção de carência adicionada com sucesso!");
            },
            onError: () => {
                toast.error("Erro ao adicionar a opção de carência.");
            },
        });
    };

    return (
        <Card className="mx-auto mt-6 max-w-4xl">
            <CardHeader>
                <CardTitle>Opções de carência</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                <ul className="divide-y rounded border">
                    {plan.data.lockup_options?.length > 0 ? (
                        plan.data.lockup_options.map((o: any) => (
                            <li key={o.id} className="flex items-center justify-between p-3">
                                <div>
                                    {o.lockup_days} dias{" "}
                                    {(o.is_default && <span className="ml-2 rounded bg-muted px-2 py-0.5 text-xs">padrão</span>) || ""}
                                </div>

                                <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => {
                                        if (confirm("Tem certeza que deseja remover esta opção de carência?")) {
                                            window.location.href = route("admin.plans.lockups.destroy", {
                                                plan: plan.data.id,
                                                option: o.id,
                                            });
                                        }
                                    }}
                                >
                                    Remover
                                </Button>
                            </li>
                        ))
                    ) : (
                        <li className="p-3 text-sm text-muted-foreground">Sem opções adicionais.</li>
                    )}
                </ul>

                <form onSubmit={submit} className="flex flex-col gap-4 md:flex-row md:items-end md:gap-8">
                    <div className="flex items-center gap-8">
                        <div>
                            <Label htmlFor="lockup_days_new">Nova carência (dias)</Label>
                            <Input
                                id="lockup_days_new"
                                type="number"
                                value={data.lockup_days}
                                onChange={(e) => setData("lockup_days", e.target.value)}
                            />
                            {errors.lockup_days && <div className="mt-1 text-sm text-red-600">{errors.lockup_days}</div>}
                        </div>
                        <div className="flex items-center space-x-2">
                            <Checkbox id="is_default_new" checked={data.is_default} onCheckedChange={(c) => setData("is_default", Boolean(c))} />
                            <Label htmlFor="is_default_new">Definir como padrão</Label>
                        </div>
                    </div>
                    <Button disabled={processing} type="submit">
                        Adicionar
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
