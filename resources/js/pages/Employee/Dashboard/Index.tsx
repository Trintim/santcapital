import AppLayout from "@/layouts/app-layout";
import { Head } from "@inertiajs/react";

export default function EmployeeDashboard() {
    return (
        <AppLayout>
            <Head title="Dashboard da Equipe" />
            <h1 className="text-2xl font-bold">Dashboard da Equipe</h1>
            <p className="text-sm text-muted-foreground">Aqui virão os atalhos de clientes, aportes e aprovações de saque.</p>
        </AppLayout>
    );
}
