import AppLayout from "@/layouts/app-layout";
import { PlanList } from "@/pages/Admin/Plans/Partials/PlanList";
import { PlanProps } from "@/pages/Admin/Plans/types";
import { Head } from "@inertiajs/react";

export default function Plans({ pagination, filters }: PlanProps) {
    return (
        <AppLayout>
            <Head title="Planos" />

            <PlanList pagination={pagination} filters={filters} />
        </AppLayout>
    );
}
