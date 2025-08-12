import { Head, useForm } from "@inertiajs/react";
import { FormEventHandler, useState } from "react";

import InputError from "@/components/input-error";
import TextLink from "@/components/text-link";

import { AnimatedOrangeButton } from "@/components/AnimatedOrangeButton";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import AuthLayout from "@/layouts/auth-layout";
import { EyeIcon, EyeSlashIcon, KeyIcon, UserIcon } from "@heroicons/react/24/outline";

type LoginForm = {
    email: string;
    password: string;
    remember: boolean;
};

interface LoginProps {
    status?: string;
    canResetPassword: boolean;
}

export default function Login({ status, canResetPassword }: LoginProps) {
    const { data, setData, post, processing, errors, reset } = useForm<Required<LoginForm>>({
        email: "",
        password: "",
        remember: false,
    });

    const [showPassword, setShowPassword] = useState(false);
    const togglePasswordVisibility = () => setShowPassword((v) => !v);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route("login"), { onFinish: () => reset("password") });
    };

    return (
        <AuthLayout title="Entre na sua conta" description="Digite seu e-mail e senha abaixo para fazer login">
            <Head title="Log in" />

            <form className="flex flex-col gap-6" onSubmit={submit}>
                <div className="grid gap-6">
                    <div className="grid gap-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            leftIcon={<UserIcon className="size-4" />}
                            id="email"
                            type="email"
                            required
                            autoFocus
                            tabIndex={1}
                            autoComplete="email"
                            value={data.email}
                            onChange={(e) => setData("email", e.target.value)}
                            placeholder="your@email.com"
                        />
                        <InputError message={errors.email} />
                    </div>

                    <div className="grid gap-2">
                        <div className="flex items-center">
                            <Label htmlFor="password">Senha</Label>
                        </div>
                        <Input
                            leftIcon={<KeyIcon className="size-4" />}
                            rightIcon={!showPassword ? <EyeSlashIcon className="size-4" /> : <EyeIcon className="size-4" />}
                            onRightIconClick={togglePasswordVisibility}
                            id="password"
                            type={showPassword ? "text" : "password"}
                            required
                            tabIndex={2}
                            autoComplete="current-password"
                            value={data.password}
                            onChange={(e) => setData("password", e.target.value)}
                            placeholder="sua-senha"
                        />
                        <InputError message={errors.password} />
                    </div>

                    <div className="flex items-center space-x-3">
                        <Checkbox
                            id="remember"
                            name="remember"
                            checked={data.remember}
                            onClick={() => setData("remember", !data.remember)}
                            tabIndex={3}
                        />
                        <Label htmlFor="remember">Lembrar de mim</Label>

                        {canResetPassword && (
                            <TextLink href={route("password.request")} className="ml-auto text-sm" tabIndex={5}>
                                Esqueceu sua senha?
                            </TextLink>
                        )}
                    </div>

                    <AnimatedOrangeButton type="submit" processing={processing}>
                        Entrar
                    </AnimatedOrangeButton>
                </div>
            </form>

            {status && <div className="mb-4 text-center text-sm font-medium text-green-600">{status}</div>}
        </AuthLayout>
    );
}
