import { NavMain } from "@/components/nav-main";
import { Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import { type NavItem } from "@/types";
import { Link } from "@inertiajs/react";
import { HandCoinsIcon, HomeIcon, TagIcon, UserPenIcon, UserRoundCheckIcon, UsersIcon } from "lucide-react";
import AppLogo from "./app-logo";

const mainNavItems: NavItem[] = [
    {
        title: "Dashboard",
        href: "/admin/dashboard",
        icon: HomeIcon,
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
];

export function AppSidebar() {
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
                <NavMain items={mainNavItems} />
            </SidebarContent>
        </Sidebar>
    );
}
