import AppLayout from "@/layouts/app-layout";
import { Head } from "@inertiajs/react";

export default function CustomerDashboard() {
    return (
        <AppLayout>
            <Head title="Meu Dashboard" />
            <h1 className="text-2xl font-bold">Meu Dashboard</h1>
            <p className="text-sm text-muted-foreground">Aqui virão total investido, média de rendimentos e gráficos.</p>
        </AppLayout>
    );
}
