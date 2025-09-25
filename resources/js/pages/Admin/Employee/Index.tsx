import Layout from "@/layouts/app-layout";
import { ClientProps } from "@/pages/Admin/Customer/types";
import { EmployeeList } from "@/pages/Admin/Employee/Partials/EmployeeList";
import { Head } from "@inertiajs/react";

export default function Index({ pagination, filters }: ClientProps) {
    return (
        <Layout>
            <Head title="Funcionários" />

            <EmployeeList pagination={pagination} filters={filters} />
        </Layout>
    );
}
