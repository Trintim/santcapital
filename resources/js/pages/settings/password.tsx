import InputError from "@/components/input-error";
import AppLayout from "@/layouts/app-layout";
import SettingsLayout from "@/layouts/settings/layout";
import { type BreadcrumbItem } from "@/types";
import { Transition } from "@headlessui/react";
import { Head, useForm } from "@inertiajs/react";
import { Eye, EyeOff } from "lucide-react";
import { FormEventHandler, useRef, useState } from "react";

import HeadingSmall from "@/components/heading-small";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: "Alterar senha",
        href: "/settings/password",
    },
];

export default function Password() {
    const passwordInput = useRef<HTMLInputElement>(null);
    const currentPasswordInput = useRef<HTMLInputElement>(null);
    const [showPassword, setShowPassword] = useState(false);
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);

    const { data, setData, errors, put, reset, processing, recentlySuccessful } = useForm({
        current_password: "",
        password: "",
        password_confirmation: "",
    });

    const updatePassword: FormEventHandler = (e) => {
        e.preventDefault();
        put(route("password.update"), {
            preserveScroll: true,
            onSuccess: () => reset(),
            onError: (errors) => {
                if (errors.password) {
                    reset("password", "password_confirmation");
                    passwordInput.current?.focus();
                }
                if (errors.current_password) {
                    reset("current_password");
                    currentPasswordInput.current?.focus();
                }
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Alterar senha" />
            <SettingsLayout>
                <form onSubmit={updatePassword} className="mx-auto max-w-xl space-y-8">
                    <HeadingSmall title="Alterar senha" description="Atualize sua senha de acesso com segurança." />
                    <div className="space-y-6 rounded-lg bg-white p-6 shadow dark:bg-neutral-900">
                        <div>
                            <Label htmlFor="current_password">Senha atual</Label>
                            <div className="relative">
                                <Input
                                    id="current_password"
                                    ref={currentPasswordInput}
                                    type={showCurrentPassword ? "text" : "password"}
                                    value={data.current_password}
                                    onChange={(e) => setData("current_password", e.target.value)}
                                    autoComplete="current-password"
                                    placeholder="Digite sua senha atual"
                                />
                                <button
                                    type="button"
                                    className="absolute top-2 right-2 text-neutral-500"
                                    tabIndex={-1}
                                    onClick={() => setShowCurrentPassword((v) => !v)}
                                >
                                    {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                            <InputError className="mt-1" message={errors.current_password} />
                        </div>
                        <div>
                            <Label htmlFor="password">Nova senha</Label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    ref={passwordInput}
                                    type={showPassword ? "text" : "password"}
                                    value={data.password}
                                    onChange={(e) => setData("password", e.target.value)}
                                    autoComplete="new-password"
                                    placeholder="Digite a nova senha"
                                />
                                <button
                                    type="button"
                                    className="absolute top-2 right-2 text-neutral-500"
                                    tabIndex={-1}
                                    onClick={() => setShowPassword((v) => !v)}
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                            <InputError className="mt-1" message={errors.password} />
                        </div>
                        <div>
                            <Label htmlFor="password_confirmation">Confirme a nova senha</Label>
                            <Input
                                id="password_confirmation"
                                type="password"
                                value={data.password_confirmation}
                                onChange={(e) => setData("password_confirmation", e.target.value)}
                                autoComplete="new-password"
                                placeholder="Confirme a nova senha"
                            />
                            <InputError className="mt-1" message={errors.password_confirmation} />
                        </div>
                        <div className="mt-4 flex items-center gap-4">
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
                                <p className="text-sm font-medium text-green-600">Senha alterada com sucesso!</p>
                            </Transition>
                        </div>
                    </div>
                </form>
            </SettingsLayout>
        </AppLayout>
    );
}
