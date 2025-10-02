// resources/js/pages/Employee/Customer/Show.tsx

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import AppLayout from "@/layouts/app-layout";
import { Head, Link } from "@inertiajs/react";
import { route } from "ziggy-js";

export default function Show({ customer }) {
    const c = customer?.data ?? customer;

    return (
        <AppLayout>
            <Head title={`Cliente: ${c.name}`} />

            <div className="mb-4">
                <Link href={route("employee.customers.index")}>
                    <Button variant="outline">Voltar</Button>
                </Link>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Dados do cliente</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                        <div>
                            <strong>Nome: </strong>
                            {c.name}
                        </div>
                        <div>
                            <strong>E-mail: </strong>
                            {c.email}
                        </div>
                        <div>
                            <strong>Telefone: </strong>
                            {c.phone ?? "—"}
                        </div>
                        <div>
                            <strong>Documento: </strong>
                            {c.document ?? "—"}
                        </div>
                        <div>
                            <strong>Status: </strong>
                            {c.is_active ? <Badge>Ativo</Badge> : <Badge variant="destructive">Inativo</Badge>}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Informações adicionais</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                        <div>
                            <strong>Beneficiário: </strong>
                            {c.customer_additional_information?.beneficiary_name ?? "—"}
                        </div>
                        <div>
                            <strong>Telefone Benef.: </strong>
                            {c.customer_additional_information?.beneficiary_phone ?? "—"}
                        </div>
                        {/* adicione os demais campos que achar necessário */}
                    </CardContent>
                </Card>
            </div>

            <Card className="mt-4">
                <CardHeader>
                    <CardTitle>Planos vinculados</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Plano</TableHead>
                                <TableHead>Carência</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Ativado em</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {c.customer_plans?.length ? (
                                c.customer_plans.map((cp) => (
                                    <TableRow key={cp.id}>
                                        <TableCell>{cp.plan?.name ?? "—"}</TableCell>
                                        <TableCell>{cp.chosen_lockup_days ?? cp.plan?.lockup_days ?? "—"}</TableCell>
                                        <TableCell>{cp.status}</TableCell>
                                        <TableCell>{cp.activated_on ? new Date(cp.activated_on).toLocaleDateString("pt-BR") : "—"}</TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-16 text-center text-muted-foreground">
                                        Sem vínculos
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </AppLayout>
    );
}
