import Layout from "@/layouts/app-layout";
import { DepositList } from "@/pages/Employee/Deposit/Partials/DepositList";
import { Head } from "@inertiajs/react";

export default function Index({ pagination, filters }) {
    return (
        <Layout>
            <Head title="Index" />

            <DepositList pagination={pagination} filters={filters} />
        </Layout>
    );
}
