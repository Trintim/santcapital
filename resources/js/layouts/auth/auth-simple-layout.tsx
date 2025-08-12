import AppLogoIcon from '@/components/app-logo-icon';
import { Link } from '@inertiajs/react';
import { type PropsWithChildren } from 'react';
import LogoIcon from '@/components/LogoIcon';

interface AuthLayoutProps {
    name?: string;
    title?: string;
    description?: string;
}

export default function AuthSimpleLayout({ children, title, description }: PropsWithChildren<AuthLayoutProps>) {
    return (
        <div className="relative min-h-svh">
            <div className="absolute inset-x-0 top-0 h-2/5 rounded-b-3xl bg-indigo-950" />

            <div className="relative z-10 flex items-center justify-center pt-20 md:pt-32">
                <Link href={route('home')} className="flex items-center gap-2">
                    <LogoIcon className={"w-50 fill-current text-white"} />
                </Link>
            </div>

            <div className="relative z-10 mx-auto mt-6 flex min-h-[60vh] w-full max-w-md items-center justify-center px-4 pb-10 md:mt-8">
                <div className="w-full rounded-3xl bg-white p-6 drop-shadow-lg md:p-8">
                    {(title || description) && (
                        <div className="mb-6 text-center flex flex-col gap-2">
                            {title && <h1 className="text-base font-semibold tracking-wide">{title}</h1>}
                            {description && (
                                <p className="mt-1 text-sm text-secondary">{description}</p>
                            )}
                        </div>
                    )}

                    {children}
                </div>
            </div>
        </div>
    );
}
