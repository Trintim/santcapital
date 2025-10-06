import Layout from "@/layouts/app-layout";
import { CustomerPlanList } from "@/pages/Employee/CustomerPlans/Partials/CustomerPlanList";
import { CustomerPlanResource } from "@/types/customer-plan";
import { PaginationData } from "@/types/pagination";
import { Head } from "@inertiajs/react";

interface Props {
    pagination: PaginationData<CustomerPlanResource>;
    filters: any;
}

export default function Index({ pagination, filters }: Props) {
    return (
        <Layout>
            <Head title="Planos de Clientes" />

            <CustomerPlanList pagination={pagination} filters={filters} />
        </Layout>
    );
}
