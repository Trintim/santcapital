import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { LoaderCircle } from "lucide-react";
import React from "react";

type AnimatedButtonProps = React.ComponentProps<typeof Button> & {
    processing?: boolean;
    label?: string;
};

export function AnimatedOrangeButton({ processing, label = "Entrar", className = "", children, ...props }: AnimatedButtonProps) {
    return (
        <div className="group relative mt-4 w-full overflow-visible">
            <div
                className="pointer-events-none absolute -inset-px rounded-xl opacity-60 blur-md transition duration-300 group-hover:opacity-90"
                style={{
                    background: "radial-gradient(60% 100% at 50% 0%, rgba(251,146,60,0.35) 0%, rgba(251,146,60,0.05) 60%, transparent 100%)",
                }}
            />

            <Button
                {...props}
                className={`relative z-10 h-10 w-full overflow-hidden rounded-md bg-orange-400 font-semibold text-white shadow-lg shadow-orange-500/30 transition hover:-translate-y-px hover:shadow-orange-500/50 active:translate-y-0 disabled:opacity-60 ${className}`}
            >
                <motion.span
                    aria-hidden
                    initial={{ left: "-40%", opacity: 0 }}
                    animate={{ left: ["-40%", "140%"], opacity: [0, 1, 1, 0] }}
                    transition={{ repeat: Infinity, duration: 2.2, ease: "linear" }}
                    className="pointer-events-none absolute inset-y-0 w-[38%] skew-x-[-20deg]"
                    style={{
                        background: "linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.24) 50%, rgba(255,255,255,0) 100%)",
                    }}
                />

                {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                <span className="relative z-10">{children ?? label}</span>
            </Button>
        </div>
    );
}
