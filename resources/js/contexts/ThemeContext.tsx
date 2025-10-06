// resources/js/contexts/ThemeContext.tsx
import { SharedData } from "@/types";
import { usePage } from "@inertiajs/react";
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

type Theme = "admin" | "customer" | "employee" | null;
type Ctx = { theme: Theme };

const ThemeCtx = createContext<Ctx>({ theme: "none" });

function applyTheme(theme: Theme) {
    if (typeof document === "undefined") return; // SSR-safe
    const root = document.documentElement;

    root.classList.remove("role-customer", "role-employee");
    root.removeAttribute("data-theme");

    if (theme === "customer" || theme === "employee") {
        root.classList.add(`role-${theme}`);
        root.setAttribute("data-theme", theme);
    }
}

function deriveTheme(props: any): Theme {
    // Se você enviar `theme` do backend (via share), ele tem prioridade:
    const serverTheme = props?.theme as Theme | undefined;

    if (serverTheme) return serverTheme;

    // Caso contrário, deriva do papel do usuário:
    const role = (props?.auth?.user?.role as string | undefined)?.toLowerCase();
    if (!props?.auth?.user) return "none";
    if (role === "customer" || role === "employee") return role as Theme;
    return "admin";
}

export function ThemeProvider({ children }: { children: ReactNode }) {
    const props = usePage<SharedData>().props;
    console.log("ThemeProvider props:", props);

    const [theme, setTheme] = useState<Theme>(() => deriveTheme(props.theme));

    // Atualiza quando login/logout ou serverTheme mudarem
    useEffect(() => {
        setTheme(deriveTheme(props));
    }, [props?.auth?.user, (props as any)?.theme]);

    // Reflete no DOM
    useEffect(() => {
        applyTheme(theme);
    }, [theme]);

    const value = useMemo(() => ({ theme }), [theme]);

    return <ThemeCtx.Provider value={value}>{children}</ThemeCtx.Provider>;
}

export function useTheme() {
    return useContext(ThemeCtx);
}
