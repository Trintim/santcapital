import { type BreadcrumbItem, type SharedData } from "@/types";
import { Transition } from "@headlessui/react";
import { Head, useForm, usePage } from "@inertiajs/react";
import { FormEventHandler } from "react";

import DeleteUser from "@/components/delete-user";
import InputError from "@/components/input-error";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import AppLayout from "@/layouts/app-layout";
import SettingsLayout from "@/layouts/settings/layout";

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: "Profile settings",
        href: "/settings/profile",
    },
];

type CustomerAdditional = {
    beneficiary_name?: string;
    beneficiary_document?: string;
    beneficiary_phone?: string;
    beneficiary_2_name?: string;
    beneficiary_2_document?: string;
    beneficiary_2_phone?: string;
};

type EmployeeAdditional = {
    bank_name?: string;
    bank_code?: string;
    agency_number?: string;
    account_number?: string;
};

type ProfileForm = {
    name: string;
    email: string;
    phone?: string;
    document?: string;
    birthdate?: string;
    pix_key?: string;
    password?: string;
} & Partial<CustomerAdditional> &
    Partial<EmployeeAdditional>;

export default function Profile({ user, role, additional }: { mustVerifyEmail: boolean; status?: string; user: any; role: string; additional: any }) {
    const { auth } = usePage<SharedData>().props;

    const initialData: ProfileForm = {
        name: user?.name ?? auth.user.name,
        email: user?.email ?? auth.user.email,
        phone: user?.phone ?? "",
        document: user?.document ?? "",
        birthdate: user?.birthdate ? user.birthdate.split("T")[0] : "",
        pix_key: user?.pix_key ?? "",
        ...additional,
    };

    const { data, setData, patch, errors, processing, recentlySuccessful } = useForm<ProfileForm>(initialData);

    console.log(data);
    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        patch(route("profile.update"), {
            preserveScroll: true,
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Profile settings" />
            <SettingsLayout>
                <form onSubmit={submit} className="space-y-8">
                    <Card className="space-y-6 p-6 shadow-md">
                        <h2 className="mb-2 text-lg font-semibold">Dados Pessoais</h2>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div>
                                <Label htmlFor="name">Nome completo</Label>
                                <Input
                                    id="name"
                                    value={data.name}
                                    onChange={(e) => setData("name", e.target.value)}
                                    required
                                    autoComplete="name"
                                    placeholder="Seu nome completo"
                                />
                                <InputError className="mt-1" message={errors.name} />
                            </div>
                            <div>
                                <Label htmlFor="birthdate">Data de nascimento</Label>
                                <Input
                                    id="birthdate"
                                    type="date"
                                    value={data.birthdate || ""}
                                    onChange={(e) => setData("birthdate", e.target.value)}
                                />
                                <InputError className="mt-1" message={errors.birthdate} />
                            </div>
                            <div>
                                <Label htmlFor="document">Documento</Label>
                                <Input id="document" value={data.document || ""} placeholder="CPF ou RG" />
                                <InputError className="mt-1" message={errors.document} />
                            </div>
                        </div>
                    </Card>
                    <Card className="space-y-6 p-6 shadow-md">
                        <h2 className="mb-2 text-lg font-semibold">Contato</h2>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div>
                                <Label htmlFor="email">E-mail</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={data.email}
                                    onChange={(e) => setData("email", e.target.value)}
                                    required
                                    autoComplete="username"
                                    placeholder="Seu e-mail"
                                />
                                <InputError className="mt-1" message={errors.email} />
                            </div>
                            <div>
                                <Label htmlFor="phone">Telefone</Label>
                                <Input
                                    id="phone"
                                    value={data.phone || ""}
                                    onChange={(e) => setData("phone", e.target.value)}
                                    placeholder="(99) 99999-9999"
                                />
                                <InputError className="mt-1" message={errors.phone} />
                            </div>
                            <div>
                                <Label htmlFor="pix_key">Chave Pix</Label>
                                <Input
                                    id="pix_key"
                                    value={data.pix_key || ""}
                                    onChange={(e) => setData("pix_key", e.target.value)}
                                    placeholder="Sua chave Pix"
                                />
                                <InputError className="mt-1" message={errors.pix_key} />
                            </div>
                        </div>
                    </Card>
                    {(role === "customer" || role === "employee") && (
                        <Card className="space-y-6 p-6 shadow-md">
                            <h2 className="mb-2 text-lg font-semibold">Informações Adicionais</h2>
                            {role === "customer" && (
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <div>
                                        <Label htmlFor="beneficiary_name">Beneficiário 1 - Nome</Label>
                                        <Input
                                            id="beneficiary_name"
                                            value={data.beneficiary_name || ""}
                                            onChange={(e) => setData("beneficiary_name", e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="beneficiary_document">Beneficiário 1 - Documento</Label>
                                        <Input
                                            id="beneficiary_document"
                                            value={data.beneficiary_document || ""}
                                            onChange={(e) => setData("beneficiary_document", e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="beneficiary_phone">Beneficiário 1 - Telefone</Label>
                                        <Input
                                            id="beneficiary_phone"
                                            value={data.beneficiary_phone || ""}
                                            onChange={(e) => setData("beneficiary_phone", e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="beneficiary_2_name">Beneficiário 2 - Nome</Label>
                                        <Input
                                            id="beneficiary_2_name"
                                            value={data.beneficiary_2_name || ""}
                                            onChange={(e) => setData("beneficiary_2_name", e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="beneficiary_2_document">Beneficiário 2 - Documento</Label>
                                        <Input
                                            id="beneficiary_2_document"
                                            value={data.beneficiary_2_document || ""}
                                            onChange={(e) => setData("beneficiary_2_document", e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="beneficiary_2_phone">Beneficiário 2 - Telefone</Label>
                                        <Input
                                            id="beneficiary_2_phone"
                                            value={data.beneficiary_2_phone || ""}
                                            onChange={(e) => setData("beneficiary_2_phone", e.target.value)}
                                        />
                                    </div>
                                </div>
                            )}
                            {role === "employee" && (
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <div>
                                        <Label htmlFor="bank_name">Banco</Label>
                                        <Input id="bank_name" value={data.bank_name || ""} onChange={(e) => setData("bank_name", e.target.value)} />
                                    </div>
                                    <div>
                                        <Label htmlFor="bank_code">Código do Banco</Label>
                                        <Input id="bank_code" value={data.bank_code || ""} onChange={(e) => setData("bank_code", e.target.value)} />
                                    </div>
                                    <div>
                                        <Label htmlFor="agency_number">Agência</Label>
                                        <Input
                                            id="agency_number"
                                            value={data.agency_number || ""}
                                            onChange={(e) => setData("agency_number", e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="account_number">Conta</Label>
                                        <Input
                                            id="account_number"
                                            value={data.account_number || ""}
                                            onChange={(e) => setData("account_number", e.target.value)}
                                        />
                                    </div>
                                </div>
                            )}
                        </Card>
                    )}
                    <div className="flex items-center gap-4">
                        <Button disabled={processing} className="px-8 py-2 text-lg">
                            Salvar
                        </Button>
                        <Transition
                            show={recentlySuccessful}
                            enter="transition ease-in-out"
                            enterFrom="opacity-0"
                            leave="transition ease-in-out"
                            leaveTo="opacity-0"
                        >
                            <p className="text-sm font-medium text-green-600">Salvo com sucesso!</p>
                        </Transition>
                    </div>
                </form>
                <DeleteUser />
            </SettingsLayout>
        </AppLayout>
    );
}
