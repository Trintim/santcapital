import Layout from "@/layouts/app-layout";
import { EmployeeList } from "@/pages/Admin/Employee/Partials/EmployeeList";
import { EmployeeProps } from "@/pages/Admin/Employee/types";
import { Head } from "@inertiajs/react";

export default function Index({ pagination, filters }: EmployeeProps) {
    return (
        <Layout>
            <Head title="Funcionários" />

            <EmployeeList pagination={pagination} filters={filters} />
        </Layout>
    );
}
