import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import AppLayout from "@/layouts/app-layout";
import { Head, Link, useForm } from "@inertiajs/react";

export default function Edit({ customer }) {
    const { data, setData, put, processing, errors } = useForm({
        name: customer.data.name ?? "",
        email: customer.data.email ?? "",
        password: "",
        phone: customer.data.phone ?? "",
        document: customer.data.document ?? "",
        birthdate: customer.data.birthdate ?? "",
        pix_key: customer.data.pix_key ?? "",
        is_active: !!customer.data.is_active,
        additional: {
            beneficiary_name: customer.data.customer_additional_information?.beneficiary_name ?? "",
            beneficiary_document: customer.data.customer_additional_information?.beneficiary_document ?? "",
            beneficiary_phone: customer.data.customer_additional_information?.beneficiary_phone ?? "",
            beneficiary_2_name: customer.data.customer_additional_information?.beneficiary_2_name ?? "",
            beneficiary_2_document: customer.data.customer_additional_information?.beneficiary_2_document ?? "",
            beneficiary_2_phone: customer.data.customer_additional_information?.beneficiary_2_phone ?? "",
        },
    });

    console.log(data, customer);

    function submit(e: React.FormEvent) {
        e.preventDefault();
        put(route("admin.customers.update", customer.data.id));
    }

    return (
        <AppLayout>
            <Head title={`Editar: ${customer.data.name}`} />

            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl">Editar cliente</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={submit} className="grid gap-6 md:grid-cols-2">
                        <div>
                            <Label htmlFor="name">Nome</Label>
                            <Input id="name" value={data.name} onChange={(e) => setData("name", e.target.value)} />
                            {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
                        </div>
                        <div>
                            <Label htmlFor="email">E-mail</Label>
                            <Input id="email" value={data.email} onChange={(e) => setData("email", e.target.value)} />
                            {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
                        </div>

                        <div>
                            <Label htmlFor="password">Nova senha (opcional)</Label>
                            <Input id="password" type="password" value={data.password} onChange={(e) => setData("password", e.target.value)} />
                            {errors.password && <p className="mt-1 text-sm text-red-500">{errors.password}</p>}
                        </div>

                        <div>
                            <Label htmlFor="phone">Telefone (11 dígitos)</Label>
                            <Input id="phone" value={data.phone ?? ""} onChange={(e) => setData("phone", e.target.value)} />
                            {errors.phone && <p className="mt-1 text-sm text-red-500">{errors.phone}</p>}
                        </div>
                        <div>
                            <Label htmlFor="document">Documento (14 dígitos)</Label>
                            <Input id="document" value={data.document ?? ""} onChange={(e) => setData("document", e.target.value)} />
                            {errors.document && <p className="mt-1 text-sm text-red-500">{errors.document}</p>}
                        </div>

                        <div>
                            <Label htmlFor="birthdate">Data de nascimento</Label>
                            <Input id="birthdate" type="date" value={data.birthdate ?? ""} onChange={(e) => setData("birthdate", e.target.value)} />
                            {errors.birthdate && <p className="mt-1 text-sm text-red-500">{errors.birthdate}</p>}
                        </div>
                        <div>
                            <Label htmlFor="pix_key">Chave PIX</Label>
                            <Input id="pix_key" value={data.pix_key ?? ""} onChange={(e) => setData("pix_key", e.target.value)} />
                            {errors.pix_key && <p className="mt-1 text-sm text-red-500">{errors.pix_key}</p>}
                        </div>

                        <div className="flex items-center gap-2">
                            <Checkbox id="is_active" checked={data.is_active} onCheckedChange={(c) => setData("is_active", Boolean(c))} />
                            <Label htmlFor="is_active">Cliente ativo</Label>
                        </div>

                        <fieldset className="space-y-4 rounded border p-4 md:col-span-2">
                            <legend className="px-1 text-sm font-medium text-muted-foreground">Informações adicionais</legend>

                            <div className="grid gap-4 md:grid-cols-3">
                                <div>
                                    <Label htmlFor="beneficiary_name">Beneficiário 1 — Nome</Label>
                                    <Input
                                        id="beneficiary_name"
                                        value={data.additional.beneficiary_name}
                                        onChange={(e) =>
                                            setData("additional", {
                                                ...data.additional,
                                                beneficiary_name: e.target.value,
                                            })
                                        }
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="beneficiary_document">Beneficiário 1 — Documento</Label>
                                    <Input
                                        id="beneficiary_document"
                                        value={data.additional.beneficiary_document}
                                        onChange={(e) =>
                                            setData("additional", {
                                                ...data.additional,
                                                beneficiary_document: e.target.value,
                                            })
                                        }
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="beneficiary_phone">Beneficiário 1 — Telefone</Label>
                                    <Input
                                        id="beneficiary_phone"
                                        value={data.additional.beneficiary_phone}
                                        onChange={(e) =>
                                            setData("additional", {
                                                ...data.additional,
                                                beneficiary_phone: e.target.value,
                                            })
                                        }
                                    />
                                </div>
                            </div>

                            <div className="grid gap-4 md:grid-cols-3">
                                <div>
                                    <Label htmlFor="beneficiary_2_name">Beneficiário 2 — Nome</Label>
                                    <Input
                                        id="beneficiary_2_name"
                                        value={data.additional.beneficiary_2_name}
                                        onChange={(e) =>
                                            setData("additional", {
                                                ...data.additional,
                                                beneficiary_2_name: e.target.value,
                                            })
                                        }
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="beneficiary_2_document">Beneficiário 2 — Documento</Label>
                                    <Input
                                        id="beneficiary_2_document"
                                        value={data.additional.beneficiary_2_document}
                                        onChange={(e) =>
                                            setData("additional", {
                                                ...data.additional,
                                                beneficiary_2_document: e.target.value,
                                            })
                                        }
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="beneficiary_2_phone">Beneficiário 2 — Telefone</Label>
                                    <Input
                                        id="beneficiary_2_phone"
                                        value={data.additional.beneficiary_2_phone}
                                        onChange={(e) =>
                                            setData("additional", {
                                                ...data.additional,
                                                beneficiary_2_phone: e.target.value,
                                            })
                                        }
                                    />
                                </div>
                            </div>
                        </fieldset>

                        <div className="flex gap-2 md:col-span-2">
                            <Link href={route("admin.customers.index")}>
                                <Button variant="outline">Voltar</Button>
                            </Link>
                            <Button disabled={processing}>Salvar alterações</Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </AppLayout>
    );
}
