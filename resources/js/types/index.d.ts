import { LucideIcon } from "lucide-react";
import type { Config } from "ziggy-js";

export type UserRole = "admin" | "employee" | "customer" | null;

export interface Auth {
    user: User;
}

export interface BreadcrumbItem {
    title: string;
    href: string;
}

export interface NavGroup {
    title: string;
    items: NavItem[];
}

export interface NavItem {
    title: string;
    href: string;
    icon?: LucideIcon | null;
    isActive?: boolean;
    routeName?: string;
}

export interface SharedData {
    name: string;
    quote: { message: string; author: string };
    auth: Auth;
    theme: UserRole | null; // Pode ser "admin", "employee", "customer" ou null (nenhum usuário logado)
    ziggy: Config & { location: string };
    sidebarOpen: boolean;

    [key: string]: unknown;
}

export interface User {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
    role: UserRole;

    [key: string]: unknown; // This allows for additional properties...
}

export type SortDirection = "asc" | "desc";

export type SortState = {
    "sort-by": string;
    direction: SortDirection;
};
