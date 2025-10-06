// resources/js/app.tsx
import "../css/app.css";

import { ThemeProvider } from "@/contexts/ThemeContext";
import { createInertiaApp } from "@inertiajs/react";
import { resolvePageComponent } from "laravel-vite-plugin/inertia-helpers";
import { Fragment } from "react";
import { createRoot } from "react-dom/client";
import { Toaster } from "sonner";
import { initializeTheme } from "./hooks/use-appearance";

const appName = import.meta.env.VITE_APP_NAME || "Sant Capital";

createInertiaApp({
    title: (title) => (title ? `${title} - ${appName}` : appName),

    resolve: (name) => {
        const loader = resolvePageComponent(`./pages/${name}.tsx`, import.meta.glob("./pages/**/*.tsx"));
        return loader.then((mod: any) => {
            const Page = mod.default;
            // Garante que ThemeProvider esteja DENTRO do App do Inertia
            Page.layout ??= (pageEl: React.ReactNode) => <ThemeProvider>{pageEl}</ThemeProvider>;
            return mod;
        });
    },

    setup({ el, App, props }) {
        createRoot(el).render(
            <Fragment>
                <Toaster richColors />
                <App {...props} />
            </Fragment>,
        );
    },
    progress: {
        color: "#4B5563",
    },
});

// seu dark/light inicial (independe do tema por role)
initializeTheme();
