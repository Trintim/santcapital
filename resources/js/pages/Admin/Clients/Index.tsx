// imports da tabela shadcn

import Layout from "@/layouts/app-layout";
import { ClientList } from "@/pages/Admin/Clients/Partials/ClientList";
import { ClientProps } from "@/pages/Admin/Clients/types";
import { Head } from "@inertiajs/react";

export default function Index({ pagination, filters }: ClientProps) {
    return (
        <Layout>
            <Head title="Clientes" />

            <ClientList pagination={pagination} filters={filters} />
        </Layout>
    );
}
