import Layout from "@/layouts/app-layout";
import { CustomerPlanList } from "@/pages/Employee/CustomerPlans/Partials/CustomerPlanList";
import { Head } from "@inertiajs/react";

export default function Index({ pagination, filters }) {
    return (
        <Layout>
            <Head title="Planos de Clientes" />

            <CustomerPlanList pagination={pagination} filters={filters} />
        </Layout>
    );
}
