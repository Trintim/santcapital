import Heading from "@/components/heading";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { type NavItem } from "@/types";
import { Link } from "@inertiajs/react";
import { Lock, User } from "lucide-react";
import { type PropsWithChildren } from "react";

const sidebarNavItems: NavItem[] = [
    {
        title: "Perfil",
        href: "/settings/profile",
        icon: <User className="mr-2 h-4 w-4" />,
    },
    {
        title: "Senha",
        href: "/settings/password",
        icon: <Lock className="mr-2 h-4 w-4" />,
    },
];

export default function SettingsLayout({ children }: PropsWithChildren) {
    // When server-side rendering, we only render the layout on the client...
    if (typeof window === "undefined") {
        return null;
    }

    const currentPath = window.location.pathname;

    return (
        <div className="mx-auto flex h-full w-full max-w-7xl flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4 py-6">
            <Heading title="Configurações" description="Gerencie seu perfil e preferências da conta" />
            <div className="flex flex-col space-y-8 lg:flex-row lg:space-y-0 lg:space-x-12">
                <aside className="w-full max-w-xs lg:w-64">
                    <nav className="flex flex-col gap-2">
                        {sidebarNavItems.map((item, index) => (
                            <Link
                                key={`${item.href}-${index}`}
                                href={item.href}
                                className={cn(
                                    "flex items-center rounded-lg px-4 py-2 text-base font-medium transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800",
                                    currentPath === item.href
                                        ? "bg-neutral-200 text-primary dark:bg-neutral-800 dark:text-primary"
                                        : "text-neutral-700 dark:text-neutral-300",
                                )}
                            >
                                {item.icon}
                                {item.title}
                            </Link>
                        ))}
                    </nav>
                </aside>
                <Separator orientation="vertical" className="hidden lg:block" />
                <main className="mx-auto w-full max-w-3xl flex-1">{children}</main>
            </div>
        </div>
    );
}
