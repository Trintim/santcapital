import Paginate from "@/components/Pagination/Index";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import AppLayout from "@/layouts/app-layout";
import { Head, Link } from "@inertiajs/react";

type CustomYield = {
    id: number;
    customer_plan_id: number;
    period: string;
    percent_decimal: string;
    customer_plan?: {
        customer?: { name: string };
        plan?: { name: string };
    };
};

type Props = {
    customYields: { data: CustomYield[]; meta: any };
};

export default function WeeklyYieldsIndex({ customYields }: Props) {
    const hasItems = customYields.data.length > 0;
    return (
        <AppLayout>
            <Head title="Rendimentos Semanais" />
            <div className="container mx-auto p-4">
                <div className="mb-4 flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Rendimentos Semanais</h1>
                    <Link href={route("admin.weekly-yields.create")}>
                        {" "}
                        <Button>Cadastrar rendimento</Button>{" "}
                    </Link>
                </div>
                {hasItems ? (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Cliente</TableHead>
                                <TableHead>Plano</TableHead>
                                <TableHead>Período</TableHead>
                                <TableHead>Percentual</TableHead>
                                <TableHead>Ações</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {customYields.data.map((item) => (
                                <TableRow key={item.id}>
                                    <TableCell>{item.customer_plan?.customer?.name ?? item.customer_plan_id}</TableCell>
                                    <TableCell>{item.customer_plan?.plan?.name ?? "-"}</TableCell>
                                    <TableCell>{item.period}</TableCell>
                                    <TableCell>{parseFloat(item.percent_decimal).toFixed(2)}%)</TableCell>
                                    <TableCell>
                                        <Link href={route("admin.weekly-yields.edit", { id: item.id })}>
                                            <Button variant="outline" size="sm">
                                                Editar
                                            </Button>
                                        </Link>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                ) : (
                    <div className="py-12 text-center text-muted-foreground">Nenhum rendimento personalizado cadastrado.</div>
                )}
                {hasItems && <Paginate meta={customYields.meta} />}
            </div>
        </AppLayout>
    );
}
