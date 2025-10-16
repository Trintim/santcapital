import { ImgHTMLAttributes } from "react";

export default function LogoIcon(props: ImgHTMLAttributes<HTMLImageElement>) {
    return <img src="/assets/logos/logo-amarela-branca.svg" alt="Logo" {...props} />;
}
