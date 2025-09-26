import { Input } from "@/components/ui/input";
import * as React from "react";

/**
 * Exibe/edita como percentual humano (ex.: "2,5") mas você pode pegar
 * o decimal (0.025) com `getDecimal()`.
 */
export function usePercentDecimal(initialPercentDecimal?: number) {
    const [display, setDisplay] = React.useState<string>(() => {
        if (initialPercentDecimal === undefined || initialPercentDecimal === null) return "";
        const pct = initialPercentDecimal * 100;
        return String(pct).replace(".", ",");
    });

    const setFromDecimal = (decimal?: number) => {
        if (decimal === undefined || decimal === null) {
            setDisplay("");
            return;
        }
        const pct = decimal * 100;
        setDisplay(String(pct).replace(".", ","));
    };

    const getDecimal = React.useCallback(() => {
        if (!display?.length) return undefined;
        const normalized = display.replace(/\s/g, "").replace(".", "").replace(",", "."); // aceita "2,5" ou "2.5"
        const n = Number(normalized);
        if (isNaN(n)) return undefined;
        return n / 100; // volta para decimal
    }, [display]);

    return { display, setDisplay, getDecimal, setFromDecimal };
}

type Props = {
    value: string;
    onChange: (s: string) => void;
    placeholder?: string;
};

export function PercentInput({ value, onChange, placeholder = "0,00" }: Props) {
    return (
        <div className="flex items-center gap-2">
            <Input inputMode="decimal" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="max-w-[120px]" />
            <span className="text-sm text-muted-foreground">%</span>
        </div>
    );
}
