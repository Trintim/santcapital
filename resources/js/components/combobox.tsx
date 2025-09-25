import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Check, ChevronsUpDown } from "lucide-react";
import * as React from "react";

export type ComboItem = { value: string; label: string; meta?: any };

type Props = {
    value: string;
    onChange: (v: string, picked?: ComboItem | null) => void;
    items: ComboItem[];
    placeholder?: string;
    searchPlaceholder?: string;
    emptyText?: string;
    disabled?: boolean;
    className?: string;
    buttonClassName?: string;
};

export function ComboBox({
    value,
    onChange,
    items,
    placeholder = "Selecionar…",
    searchPlaceholder = "Buscar…",
    emptyText = "Nada encontrado.",
    disabled,
    className,
    buttonClassName,
}: Props) {
    const [open, setOpen] = React.useState(false);
    const current = items.find((i) => String(i.value) === String(value)) || null;

    function pick(v: string) {
        const found = items.find((i) => String(i.value) === String(v)) || null;
        onChange(v, found);
        setOpen(false);
    }

    return (
        <div className={cn("w-full", className)}>
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        type="button"
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        className={cn("w-full justify-between", buttonClassName)}
                        disabled={disabled}
                    >
                        {current ? current.label : <span className="text-muted-foreground">{placeholder}</span>}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                    <Command shouldFilter>
                        <CommandInput placeholder={searchPlaceholder} />
                        <CommandList>
                            <CommandEmpty>{emptyText}</CommandEmpty>
                            <CommandGroup>
                                {items.map((i) => (
                                    <CommandItem key={i.value} value={i.label} onSelect={() => pick(i.value)}>
                                        <Check className={cn("mr-2 h-4 w-4", value === i.value ? "opacity-100" : "opacity-0")} />
                                        {i.label}
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>
        </div>
    );
}
