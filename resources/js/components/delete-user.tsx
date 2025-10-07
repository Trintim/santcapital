import { useForm } from "@inertiajs/react";
import { FormEventHandler, useRef } from "react";

import InputError from "@/components/input-error";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import HeadingSmall from "@/components/heading-small";

import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export default function DeleteUser() {
    const passwordInput = useRef<HTMLInputElement>(null);
    const { data, setData, delete: destroy, processing, reset, errors, clearErrors } = useForm<Required<{ password: string }>>({ password: "" });

    const deleteUser: FormEventHandler = (e) => {
        e.preventDefault();

        destroy(route("profile.destroy"), {
            preserveScroll: true,
            onSuccess: () => closeModal(),
            onError: () => passwordInput.current?.focus(),
            onFinish: () => reset(),
        });
    };

    const closeModal = () => {
        clearErrors();
        reset();
    };

    return (
        <div className="mt-4 space-y-6">
            <HeadingSmall title="Excluir conta" description="Exclua sua conta e todos os seus dados permanentemente." />
            <div className="space-y-4 rounded-lg border border-red-100 bg-red-50 p-4 dark:border-red-200/10 dark:bg-red-700/10">
                <p className="text-sm text-red-700 dark:text-red-300">
                    Tem certeza que deseja excluir sua conta? Esta ação é irreversível e todos os seus dados serão apagados.
                </p>
                <Dialog>
                    <DialogTrigger asChild>
                        <Button variant="destructive">Excluir conta</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogTitle>Confirmar exclusão</DialogTitle>
                        <DialogDescription>Digite sua senha para confirmar a exclusão da conta. Esta ação não poderá ser desfeita.</DialogDescription>
                        <form onSubmit={deleteUser} className="space-y-4">
                            <div>
                                <Label htmlFor="password">Senha</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    ref={passwordInput}
                                    value={data.password}
                                    onChange={(e) => setData("password", e.target.value)}
                                    autoComplete="current-password"
                                    placeholder="Digite sua senha"
                                />
                                <InputError className="mt-1" message={errors.password} />
                            </div>
                            <DialogFooter>
                                <DialogClose asChild>
                                    <Button type="button" variant="outline" onClick={closeModal}>
                                        Cancelar
                                    </Button>
                                </DialogClose>
                                <Button variant="destructive" disabled={processing} type="submit">
                                    Excluir definitivamente
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
}
