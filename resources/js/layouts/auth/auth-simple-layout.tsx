import LogoIcon from "@/components/LogoIcon";
import { Link } from "@inertiajs/react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { MouseEventHandler, ReactNode } from "react";

interface AuthLayoutProps {
    name?: string;
    title?: string;
    description?: string;
    children: ReactNode;
}

export default function AuthSimpleLayout({ children, title, description }: AuthLayoutProps) {
    const mx = useMotionValue(0);
    const my = useMotionValue(0);
    const sx = useSpring(mx, { stiffness: 120, damping: 20, mass: 0.2 });
    const sy = useSpring(my, { stiffness: 120, damping: 20, mass: 0.2 });
    const spotlight = useTransform([sx, sy], ([x, y]) => `radial-gradient(600px circle at ${x}px ${y}px, rgba(99,102,241,0.20), transparent 60%)`);

    const onMove: MouseEventHandler<HTMLDivElement> = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        mx.set(e.clientX - rect.left);
        my.set(e.clientY - rect.top);
    };

    return (
        <div className="relative min-h-svh overflow-hidden bg-slate-950" onMouseMove={onMove}>
            <div className="pointer-events-none absolute inset-x-0 top-0 h-2/5 rounded-b-3xl bg-indigo-950" />

            <motion.div
                aria-hidden
                className="pointer-events-none absolute inset-0 opacity-[0.12]"
                initial={{ x: 0 }}
                animate={{ x: [0, -48, 0] }}
                transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
            >
                <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeOpacity="0.25" strokeWidth="1" />
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#grid)" />
                </svg>
            </motion.div>

            <div className="pointer-events-none absolute top-24 -left-24 h-72 w-72 [animation:spin_60s_linear_infinite] rounded-full bg-indigo-500/30 blur-3xl" />
            <div className="pointer-events-none absolute -right-20 bottom-16 h-72 w-72 [animation:spin_90s_linear_infinite] rounded-full bg-orange-500/20 blur-3xl" />

            <motion.div aria-hidden className="pointer-events-none absolute inset-0" style={{ background: spotlight }} />

            <div className="relative z-10 flex items-center justify-center pt-20 md:pt-32">
                <Link href={route("home")} className="flex items-center gap-2">
                    <LogoIcon className="w-50 fill-current text-white" />
                </Link>
            </div>

            <div className="relative z-10 mx-auto mt-6 flex min-h-[60vh] w-full max-w-md items-center justify-center px-4 pb-10 md:mt-8">
                <div className="absolute inset-0 mx-auto my-auto h-80 w-[90%] -skew-y-2 rounded-[2rem] bg-indigo-500/25 blur-3xl" />

                <div className="group relative w-full">
                    <div className="pointer-events-none absolute -inset-[1px] rounded-3xl bg-gradient-to-br from-white/40 via-indigo-300/30 to-transparent opacity-0 blur transition-opacity duration-300 group-hover:opacity-100" />

                    <div className="relative w-full rounded-3xl border border-white/30 bg-white/90 p-6 shadow-[0_8px_30px_rgba(0,0,0,0.12),0_4px_10px_rgba(0,0,0,0.08)] backdrop-blur-md md:p-8">
                        {(title || description) && (
                            <div className="mb-6 flex flex-col gap-2 text-center">
                                {title && <h1 className="text-base font-semibold tracking-wide">{title}</h1>}
                                {description && <p className="mt-1 text-sm text-secondary">{description}</p>}
                            </div>
                        )}
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}
