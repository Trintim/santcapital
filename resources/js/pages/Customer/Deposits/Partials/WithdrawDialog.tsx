// resources/js/components/customer/WithdrawDialog.tsx
"use client";

import { router } from "@inertiajs/react";
import * as React from "react";
import { useRef } from "react";
import { route } from "ziggy-js";

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export type PlanForWithdraw = {
    id: number;
    plan_name?: string;
    available: number;
};

type Props = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    plan: PlanForWithdraw | null;
};

const fmtBRL = (n: number) => `R$ ${Number(n ?? 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;

export default function WithdrawDialog({ open, onOpenChange, plan }: Props) {
    const cancelBtnRef = useRef<HTMLButtonElement | null>(null);

    const [form, setForm] = React.useState({
        customer_plan_id: plan ? String(plan.id) : "",
        amount: "",
        method: "pix" as "pix" | "ted",
        pix_key: "",
        bank_name: "",
        bank_code: "",
        agency_number: "",
        account_number: "",
        holder_name: "",
        holder_cpf_cnpj: "",
    });

    // quando trocar o plano, refletir no estado
    React.useEffect(() => {
        setForm((prev) => ({
            ...prev,
            customer_plan_id: plan ? String(plan.id) : "",
            amount: "",
            method: "pix",
            pix_key: "",
            bank_name: "",
            bank_code: "",
            agency_number: "",
            account_number: "",
            holder_name: "",
            holder_cpf_cnpj: "",
        }));
    }, [plan?.id]);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();

        router.post(
            route("customer.withdrawals.store"),
            {
                customer_plan_id: Number(form.customer_plan_id),
                amount: Number(String(form.amount).replace(/\./g, "").replace(",", ".")),
                method: form.method,
                pix_key: form.method === "pix" ? form.pix_key : undefined,
                bank_name: form.method === "ted" ? form.bank_name : undefined,
                bank_code: form.method === "ted" ? form.bank_code : undefined,
                agency_number: form.method === "ted" ? form.agency_number : undefined,
                account_number: form.method === "ted" ? form.account_number : undefined,
                holder_name: form.method === "ted" ? form.holder_name : undefined,
                holder_cpf_cnpj: form.method === "ted" ? form.holder_cpf_cnpj : undefined,
            },
            {
                preserveState: true,
                onFinish: () => onOpenChange(false),
            },
        );
    };

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent
                onOpenAutoFocus={(e) => {
                    e.preventDefault();
                    cancelBtnRef.current?.focus();
                }}
            >
                <form onSubmit={submit}>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Solicitar saque</AlertDialogTitle>
                        <AlertDialogDescription>
                            Plano: <strong>{plan?.plan_name ?? "—"}</strong>
                            <br />
                            Saldo disponível: <strong>{fmtBRL(plan?.available ?? 0)}</strong>
                        </AlertDialogDescription>
                    </AlertDialogHeader>

                    <div className="mt-2 grid gap-3">
                        <div>
                            <Label htmlFor="wd-amount">Valor</Label>
                            <Input
                                id="wd-amount"
                                placeholder="0,00"
                                value={form.amount}
                                onChange={(e) => setForm((p) => ({ ...p, amount: e.target.value }))}
                            />
                        </div>

                        <div>
                            <Label className="mb-2 block">Forma de recebimento</Label>
                            <RadioGroup
                                value={form.method}
                                onValueChange={(v: "pix" | "ted") => setForm((p) => ({ ...p, method: v }))}
                                className="flex gap-6"
                            >
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem id="wd-m-pix" value="pix" />
                                    <Label htmlFor="wd-m-pix">PIX</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem id="wd-m-ted" value="ted" />
                                    <Label htmlFor="wd-m-ted">TED</Label>
                                </div>
                            </RadioGroup>
                        </div>

                        {form.method === "pix" && (
                            <div>
                                <Label htmlFor="wd-pix">Chave PIX</Label>
                                <Input
                                    id="wd-pix"
                                    placeholder="Informe sua chave (CPF, e-mail, aleatória...)"
                                    value={form.pix_key}
                                    onChange={(e) => setForm((p) => ({ ...p, pix_key: e.target.value }))}
                                />
                            </div>
                        )}

                        {form.method === "ted" && (
                            <div className="grid gap-3 sm:grid-cols-2">
                                <div>
                                    <Label htmlFor="wd-bank">Banco</Label>
                                    <Input
                                        id="wd-bank"
                                        value={form.bank_name}
                                        onChange={(e) => setForm((p) => ({ ...p, bank_name: e.target.value }))}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="wd-bankcode">Código do banco</Label>
                                    <Input
                                        id="wd-bankcode"
                                        value={form.bank_code}
                                        onChange={(e) => setForm((p) => ({ ...p, bank_code: e.target.value }))}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="wd-ag">Agência</Label>
                                    <Input
                                        id="wd-ag"
                                        value={form.agency_number}
                                        onChange={(e) => setForm((p) => ({ ...p, agency_number: e.target.value }))}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="wd-acc">Conta</Label>
                                    <Input
                                        id="wd-acc"
                                        value={form.account_number}
                                        onChange={(e) => setForm((p) => ({ ...p, account_number: e.target.value }))}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="wd-holder">Titular</Label>
                                    <Input
                                        id="wd-holder"
                                        value={form.holder_name}
                                        onChange={(e) => setForm((p) => ({ ...p, holder_name: e.target.value }))}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="wd-doc">CPF/CNPJ do titular</Label>
                                    <Input
                                        id="wd-doc"
                                        value={form.holder_cpf_cnpj}
                                        onChange={(e) => setForm((p) => ({ ...p, holder_cpf_cnpj: e.target.value }))}
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    <AlertDialogFooter className="mt-4">
                        <AlertDialogCancel ref={cancelBtnRef} type="button">
                            Cancelar
                        </AlertDialogCancel>
                        <AlertDialogAction type="submit">Enviar solicitação</AlertDialogAction>
                    </AlertDialogFooter>
                </form>
            </AlertDialogContent>
        </AlertDialog>
    );
}
