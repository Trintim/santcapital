import { MaskedInput } from "@/components/form/MaskedInput";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import AppLayout from "@/layouts/app-layout";
import { formatCpfCnpj, formatPhoneBr } from "@/lib/utils";
import { Head, Link, useForm } from "@inertiajs/react";
import { toast } from "sonner";
import { FormEvent } from "react";

export default function Create() {
    const { data, setData, post, processing, errors } = useForm({
        name: "",
        email: "",
        phone: "",
        document: "",
        birthdate: "",
        pix_key: "",
        is_active: true as boolean,
        additional: {
            beneficiary_name: "",
            beneficiary_document: "",
            beneficiary_phone: "",
            beneficiary_2_name: "",
            beneficiary_2_document: "",
            beneficiary_2_phone: "",
        },
    });

    function submit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        post(route("employee.customers.store"), {
            onSuccess: () => toast.success("Cliente criado com sucesso!"),
            onError: () => toast.error("Erro ao criar cliente. Verifique os campos."),
        });
    }

    return (
        <AppLayout>
            <Head title={"Novo Cliente"} />

            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl">Novo Cliente</CardTitle>
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
                            <Label htmlFor="phone">Telefone</Label>
                            <MaskedInput
                                id="phone"
                                mask={formatPhoneBr}
                                value={data.phone}
                                onChange={(e) => setData("phone", e.target.value)}
                                placeholder="(00) 00000-0000"
                            />
                            {errors.phone && <p className="mt-1 text-sm text-red-500">{errors.phone}</p>}
                        </div>

                        <div>
                            <Label htmlFor="document">Documento</Label>
                            <MaskedInput
                                id="document"
                                mask={formatCpfCnpj}
                                value={data.document}
                                onChange={(e) => setData("document", e.target.value)}
                                placeholder="CPF/CNPJ"
                            />
                            {errors.document && <p className="mt-1 text-sm text-red-500">{errors.document}</p>}
                        </div>

                        <div>
                            <Label htmlFor="birthdate">Data de nascimento</Label>
                            <Input id="birthdate" type="date" value={data.birthdate ?? ""} onChange={(e) => setData("birthdate", e.target.value)} />
                            {errors.birthdate && <p className="mt-1 text-sm text-red-500">{errors.birthdate}</p>}
                        </div>

                        <div>
                            <Label htmlFor="pix_key">Chave PIX</Label>
                            <Input id="pix_key" value={data.pix_key} onChange={(e) => setData("pix_key", e.target.value)} />
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
                                    {errors["additional.beneficiary_name"] && (
                                        <p className="mt-1 text-sm text-red-500">{errors["additional.beneficiary_name"]}</p>
                                    )}
                                </div>
                                <div>
                                    <Label htmlFor="beneficiary_document">Beneficiário 1 — Documento</Label>
                                    <MaskedInput
                                        id="beneficiary_document"
                                        mask={formatCpfCnpj}
                                        value={data.additional.beneficiary_document}
                                        onChange={(e) =>
                                            setData("additional", {
                                                ...data.additional,
                                                beneficiary_document: e.target.value,
                                            })
                                        }
                                        placeholder="CPF/CNPJ"
                                    />
                                    {errors["additional.beneficiary_document"] && (
                                        <p className="mt-1 text-sm text-red-500">{errors["additional.beneficiary_document"]}</p>
                                    )}
                                </div>
                                <div>
                                    <Label htmlFor="beneficiary_phone">Beneficiário 1 — Telefone</Label>
                                    <MaskedInput
                                        id="beneficiary_phone"
                                        mask={formatPhoneBr}
                                        value={data.additional.beneficiary_phone}
                                        onChange={(e) =>
                                            setData("additional", {
                                                ...data.additional,
                                                beneficiary_phone: e.target.value,
                                            })
                                        }
                                        placeholder="(00) 00000-0000"
                                    />
                                    {errors["additional.beneficiary_phone"] && (
                                        <p className="mt-1 text-sm text-red-500">{errors["additional.beneficiary_phone"]}</p>
                                    )}
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
                                    <MaskedInput
                                        id="beneficiary_2_document"
                                        mask={formatCpfCnpj}
                                        value={data.additional.beneficiary_2_document}
                                        onChange={(e) =>
                                            setData("additional", {
                                                ...data.additional,
                                                beneficiary_2_document: e.target.value,
                                            })
                                        }
                                        placeholder="CPF/CNPJ"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="beneficiary_2_phone">Beneficiário 2 — Telefone</Label>
                                    <MaskedInput
                                        id="beneficiary_2_phone"
                                        mask={formatPhoneBr}
                                        value={data.additional.beneficiary_2_phone}
                                        onChange={(e) =>
                                            setData("additional", {
                                                ...data.additional,
                                                beneficiary_2_phone: e.target.value,
                                            })
                                        }
                                        placeholder="(00) 00000-0000"
                                    />
                                </div>
                            </div>
                        </fieldset>

                        <div className="md:col-span-2 flex justify-end">
                            <Link href={route("employee.customers.index")}>
                                <Button variant="outline">Cancelar</Button>
                            </Link>
                            <Button type="submit" disabled={processing}>
                                {processing ? "Salvando..." : "Salvar"}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </AppLayout>
    );
}
