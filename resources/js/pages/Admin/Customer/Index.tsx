// imports da tabela shadcn

import Layout from "@/layouts/app-layout";
import { CustomerList } from "@/pages/Admin/Customer/Partials/CustomerList";
import { CustomerProps } from "@/pages/Admin/Customer/types";
import { Head } from "@inertiajs/react";

export default function Index({ pagination, filters }: CustomerProps) {
    return (
        <Layout>
            <Head title="Clientes" />

            <CustomerList pagination={pagination} filters={filters} />
        </Layout>
    );
}
