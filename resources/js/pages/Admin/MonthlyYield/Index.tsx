import AppLayout from "@/layouts/app-layout";
import { Head, useForm, usePage } from "@inertiajs/react";

export default function MonthlyYield() {
    const { plans, yields }: any = usePage().props;
    const form = useForm({ investment_plan_id: "", period: "", percent_decimal: "" });
    const applyForm = useForm({ investment_plan_id: "", period: "" });

    return (
        <AppLayout>
            <Head title="Rendimentos Mensais" />

            <div className="space-y-6 p-6">
                <h1 className="text-2xl font-bold">Rendimentos Mensais</h1>

                <section className="space-y-3 rounded border p-4">
                    <h2 className="font-semibold">Registrar rendimento</h2>
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            form.post(route("admin.monthly-yields.store"));
                        }}
                        className="grid gap-3 md:grid-cols-4"
                    >
                        <select
                            className="rounded border p-2"
                            value={form.data.investment_plan_id}
                            onChange={(e) => form.setData("investment_plan_id", e.target.value)}
                        >
                            <option value="">Selecione o plano…</option>
                            {plans.map((p: any) => (
                                <option key={p.id} value={p.id}>
                                    {p.name}
                                </option>
                            ))}
                        </select>
                        <input
                            placeholder="AAAA-MM"
                            className="rounded border p-2"
                            value={form.data.period}
                            onChange={(e) => form.setData("period", e.target.value)}
                        />
                        <input
                            placeholder="decimal ex.: 0.012 = 1,2%"
                            className="rounded border p-2"
                            value={form.data.percent_decimal}
                            onChange={(e) => form.setData("percent_decimal", e.target.value)}
                        />
                        <button className="rounded bg-black px-3 py-2 text-white">Salvar</button>
                    </form>
                </section>

                <section className="space-y-3 rounded border p-4">
                    <h2 className="font-semibold">Aplicar rendimento</h2>
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            applyForm.post(route("admin.monthly-yields.apply"));
                        }}
                        className="flex flex-wrap gap-3"
                    >
                        <select
                            className="rounded border p-2"
                            value={applyForm.data.investment_plan_id}
                            onChange={(e) => applyForm.setData("investment_plan_id", e.target.value)}
                        >
                            <option value="">Selecione o plano…</option>
                            {plans.map((p: any) => (
                                <option key={p.id} value={p.id}>
                                    {p.name}
                                </option>
                            ))}
                        </select>
                        <input
                            placeholder="AAAA-MM"
                            className="rounded border p-2"
                            value={applyForm.data.period}
                            onChange={(e) => applyForm.setData("period", e.target.value)}
                        />
                        <button className="rounded bg-black px-3 py-2 text-white">Aplicar</button>
                    </form>
                </section>

                <section className="rounded border p-4">
                    <h2 className="mb-2 font-semibold">Histórico</h2>
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-sm">
                            <thead>
                                <tr className="bg-gray-100">
                                    <th className="p-2 text-left">Plano</th>
                                    <th className="p-2 text-left">Competência</th>
                                    <th className="p-2 text-left">Percentual (decimal)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {yields.data.map((y: any) => (
                                    <tr key={y.id} className="border-t">
                                        <td className="p-2">{y.plan?.name}</td>
                                        <td className="p-2">{y.period}</td>
                                        <td className="p-2">{y.percent_decimal}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>
            </div>
        </AppLayout>
    );
}
