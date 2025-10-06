import { NavMain } from "@/components/nav-main";
import { Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import { type NavItem, type SharedData } from "@/types";
import { Link, usePage } from "@inertiajs/react";
import { ChartCandlestickIcon, HandCoinsIcon, HomeIcon, TagIcon, UserPenIcon, UserRoundCheckIcon, UsersIcon } from "lucide-react";
import AppLogo from "./app-logo";

const mainNavItems: NavItem[] = [
    {
        title: "Dashboard",
        href: "/admin",
        icon: HomeIcon,
    },
    {
        title: "Rendimentos Mensais",
        href: "/admin/rendimentos-mensais",
        icon: ChartCandlestickIcon,
    },
    {
        title: "Funcionários",
        href: "/admin/funcionarios",
        icon: UserRoundCheckIcon,
    },
    {
        title: "Clientes",
        href: "/admin/clientes",
        icon: UsersIcon,
    },
    {
        title: "Planos",
        href: "/admin/planos",
        icon: TagIcon,
    },
    {
        title: "Planos de Clientes",
        href: "/admin/planos-cliente",
        icon: UserPenIcon,
    },
    {
        title: "Aportes",
        href: "/admin/depositos",
        icon: HandCoinsIcon,
    },
    {
        title: "Solicitações de Saque",
        href: "/admin/saques",
        icon: ChartCandlestickIcon,
    },
];

const funcionarioNavItems: NavItem[] = [
    { title: "Dashboard", href: "/funcionarios", icon: HomeIcon },
    {
        title: "Clientes",
        href: "/funcionarios/clientes",
        icon: UsersIcon,
    },
    {
        title: "Planos de Clientes",
        href: "/funcionarios/planos-cliente",
        icon: UserPenIcon,
    },
    {
        title: "Aportes",
        href: "/funcionarios/depositos",
        icon: HandCoinsIcon,
    },
    {
        title: "Solicitações de Saque",
        href: "/funcionarios/saques",
        icon: ChartCandlestickIcon,
    },
];

const clienteNavItems: NavItem[] = [
    { title: "Dashboard", href: "/cliente", icon: HomeIcon },
    {
        title: "Meus Aportes",
        href: "/cliente/aportes",
        icon: HandCoinsIcon,
    },
];

export function AppSidebar() {
    const { auth } = usePage<SharedData>().props;

    const authUserRole = auth.user.role;

    const navItems = authUserRole === "admin" ? mainNavItems : authUserRole === "employee" ? funcionarioNavItems : clienteNavItems;

    return (
        <Sidebar collapsible="icon" variant="sidebar">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={route("admin.dashboard")} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={navItems} />
            </SidebarContent>
        </Sidebar>
    );
}
