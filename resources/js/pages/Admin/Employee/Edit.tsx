import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import AppLayout from "@/layouts/app-layout";
import { Head, Link, useForm } from "@inertiajs/react";
import { FormEvent } from "react";
import { toast } from "sonner";

export default function Edit({ employee }) {
    const { data, setData, put, processing, errors } = useForm({
        name: employee.data.name ?? "",
        email: employee.data.email ?? "",
        password: "",
        phone: employee.data.phone ?? "",
        document: employee.data.document ?? "",
        birthdate: employee.data.birthdate ?? "",
        pix_key: employee.data.pix_key ?? "",
        is_active: !!employee.data.is_active,
        // additional
        additional: {
            bank_name: employee.data.employee_additional_information?.bank_name ?? "",
            bank_code: employee.data.employee_additional_information?.bank_code ?? "",
            agency_number: employee.data.employee_additional_information?.agency_number ?? "",
            account_number: employee.data.employee_additional_information?.account_number ?? "",
        },
    });

    console.log(employee);

    function submit(e: FormEvent) {
        e.preventDefault();
        put(route("admin.employees.update", { employee: employee.id }), {
            onSuccess: () => {
                toast.success("Funcionário atualizado com sucesso.");
            },
            onError: () => {
                toast.error("Erro ao atualizar funcionário. Verifique os campos.");
            },
        });
    }

    return (
        <AppLayout>
            <Head title={`Editar: ${employee.name}`} />

            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl">Editar funcionário</CardTitle>
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
                            <Label htmlFor="is_active">Funcionário ativo</Label>
                        </div>

                        <fieldset className="space-y-4 rounded border p-4 md:col-span-2">
                            <legend className="px-1 text-sm font-medium text-muted-foreground">Dados bancários</legend>

                            <div className="grid gap-4 md:grid-cols-4">
                                <div>
                                    <Label htmlFor="bank_name">Banco — Nome</Label>
                                    <Input
                                        id="bank_name"
                                        value={data.additional.bank_name}
                                        onChange={(e) =>
                                            setData("additional", {
                                                ...data.additional,
                                                bank_name: e.target.value,
                                            })
                                        }
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="bank_code">Banco — Código</Label>
                                    <Input
                                        id="bank_code"
                                        value={data.additional.bank_code}
                                        onChange={(e) =>
                                            setData("additional", {
                                                ...data.additional,
                                                bank_code: e.target.value,
                                            })
                                        }
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="agency_number">Agência</Label>
                                    <Input
                                        id="agency_number"
                                        value={data.additional.agency_number}
                                        onChange={(e) =>
                                            setData("additional", {
                                                ...data.additional,
                                                agency_number: e.target.value,
                                            })
                                        }
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="account_number">Conta</Label>
                                    <Input
                                        id="account_number"
                                        value={data.additional.account_number}
                                        onChange={(e) =>
                                            setData("additional", {
                                                ...data.additional,
                                                account_number: e.target.value,
                                            })
                                        }
                                    />
                                </div>
                            </div>
                        </fieldset>

                        <div className="flex gap-2 md:col-span-2">
                            <Link href={route("admin.employees.index")}>
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
