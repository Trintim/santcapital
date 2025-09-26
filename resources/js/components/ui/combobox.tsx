import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger
} from "@/components/ui/popover";

type Item = { value: string; label: string };

type ComboboxProps = {
    value: string;
    onChange: (value: string) => void;
    items: Item[];
    placeholder?: string;
    searchPlaceholder?: string;
    emptyMessage?: string;
    className?: string;
    buttonClassName?: string;
    buttonRightIcon?: React.ReactNode;
    disabled?: boolean;
    /** largura do popover; se não passar, segue o width do botão */
    contentWidthClass?: string; // ex.: "w-[280px]"
};

export function Combobox({
                             value,
                             onChange,
                             items,
                             placeholder = "Selecione...",
                             searchPlaceholder = "Buscar...",
                             emptyMessage = "Nenhum item encontrado.",
                             className,
                             buttonClassName,
                             buttonRightIcon,
                             disabled,
                             contentWidthClass
                         }: ComboboxProps) {
    const [open, setOpen] = React.useState(false);
    const selected = items.find((i) => i.value === value);

    return (
        <div className={cn("w-full", className)}>
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        type="button"
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        disabled={disabled}
                        className={cn("w-full justify-between", buttonClassName)}
                    >
            <span className="truncate">
              {selected ? selected.label : placeholder}
            </span>
                        {buttonRightIcon ?? <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />}
                    </Button>
                </PopoverTrigger>

                <PopoverContent
                    className={cn("p-0", contentWidthClass ?? "w-[--radix-popover-trigger-width]")}
                    align="start"
                >
                    <Command>
                        <CommandInput placeholder={searchPlaceholder} className="h-9" />
                        <CommandList>
                            <CommandEmpty>{emptyMessage}</CommandEmpty>
                            <CommandGroup>
                                {items.map((item) => (
                                    <CommandItem
                                        key={item.value}
                                        value={item.value}
                                        onSelect={(currentValue) => {
                                            const next = currentValue === value ? "" : currentValue;
                                            onChange(next);
                                            setOpen(false);
                                        }}
                                    >
                                        <span className="truncate">{item.label}</span>
                                        <Check
                                            className={cn(
                                                "ml-auto h-4 w-4",
                                                value === item.value ? "opacity-100" : "opacity-0"
                                            )}
                                        />
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
