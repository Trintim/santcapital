import { Input } from "@/components/ui/input";
import * as React from "react";

type Props = React.ComponentProps<typeof Input> & {
    /** Recebe APENAS os dígitos e deve retornar a string já mascarada */
    mask: (rawDigits: string) => string;
};

/** Remove tudo que não for dígito */
function onlyDigits(v: string): string {
    return (v || "").replace(/\D+/g, "");
}

export function MaskedInput({ mask, value, onChange, ...rest }: Props) {
    const inputRef = React.useRef<HTMLInputElement | null>(null);
    const lastKeyRef = React.useRef<string | null>(null);
    const prevDigitsLenRef = React.useRef<number>(onlyDigits(String(value ?? "")).length);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        lastKeyRef.current = e.key;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const typed = e.target.value ?? "";
        let digits = onlyDigits(typed);

        // Se o usuário apertou Backspace/Delete e a quantidade de dígitos não mudou,
        // significa que ele está tentando apagar um caractere da máscara.
        // Forçamos a remoção de 1 dígito.
        const prevLen = prevDigitsLenRef.current;
        const isDeletion = lastKeyRef.current === "Backspace" || lastKeyRef.current === "Delete";

        if (isDeletion && digits.length === prevLen && prevLen > 0) {
            digits = digits.slice(0, -1);
        }

        const masked = mask(digits);

        // Atualiza o "prev" para o próximo ciclo
        prevDigitsLenRef.current = digits.length;

        // Propaga para cima simulando o mesmo onChange do Input do shadcn
        onChange?.({
            ...e,
            target: {
                ...e.target,
                value: masked,
            },
        });

        // Opcional: tentar manter o caret o mais à direita.
        // (Para um caret perfeito seria preciso mapear posição; manter simples aqui.)
        requestAnimationFrame(() => {
            try {
                const el = inputRef.current;
                if (el) {
                    el.selectionStart = el.selectionEnd = masked.length;
                }
            } catch {}
        });
    };

    React.useEffect(() => {
        // Se o valor "externo" mudou, atualiza o prevDigitsLenRef
        prevDigitsLenRef.current = onlyDigits(String(value ?? "")).length;
    }, [value]);

    return (
        <Input
            ref={inputRef}
            {...rest}
            value={typeof value === "string" ? value : ""}
            onKeyDown={handleKeyDown}
            onChange={handleChange}
            inputMode="numeric"
            autoComplete="off"
        />
    );
}
