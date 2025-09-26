// src/components/form/MonthYearPicker.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Check, ChevronsUpDown } from "lucide-react";
import * as React from "react";

type Props = {
    value?: string; // "YYYY-MM"
    onChange: (v: string) => void; // "YYYY-MM"
    placeholder?: string;
};

const MONTHS = [
    { mm: "01", label: "Janeiro" },
    { mm: "02", label: "Fevereiro" },
    { mm: "03", label: "Março" },
    { mm: "04", label: "Abril" },
    { mm: "05", label: "Maio" },
    { mm: "06", label: "Junho" },
    { mm: "07", label: "Julho" },
    { mm: "08", label: "Agosto" },
    { mm: "09", label: "Setembro" },
    { mm: "10", label: "Outubro" },
    { mm: "11", label: "Novembro" },
    { mm: "12", label: "Dezembro" },
];

const YEARS = Array.from({ length: 2101 - 2000 + 1 }, (_, i) => String(2101 - i));

export function MonthYearPicker({ value, onChange }: Props) {
    const [open, setOpen] = React.useState(false);

    // determina mês/ano atuais se value não vier
    const now = new Date();
    const defaultYear = String(now.getFullYear());
    const defaultMonth = String(now.getMonth() + 1).padStart(2, "0");

    const currentYear = value?.slice(0, 4) ?? defaultYear;
    const currentMonth = value?.slice(5, 7) ?? defaultMonth;

    const handlePick = (year: string, month: string) => {
        onChange(`${year}-${month}`);
        setOpen(false);
    };

    const label = React.useMemo(() => {
        const m = MONTHS.find((m) => m.mm === currentMonth);
        return `${m?.label ?? currentMonth}/${currentYear}`;
    }, [currentMonth, currentYear]);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button variant="outline" role="combobox" aria-expanded={open} className="w-48 justify-between">
                    {label}
                    <ChevronsUpDown className="size-4 opacity-50" />
                </Button>
            </PopoverTrigger>

            <PopoverContent className="w-[360px] p-0" align="start">
                <div className="grid grid-cols-2 divide-x">
                    {/* Meses */}
                    <Command>
                        <CommandInput placeholder="Buscar mês…" className="h-9" />
                        <CommandList>
                            <CommandEmpty>Nenhum mês</CommandEmpty>
                            <CommandGroup heading="Meses">
                                {MONTHS.map((m) => (
                                    <CommandItem key={m.mm} value={m.mm} onSelect={() => handlePick(currentYear, m.mm)}>
                                        {m.label}
                                        <Check className={cn("ml-auto", currentMonth === m.mm ? "opacity-100" : "opacity-0")} />
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        </CommandList>
                    </Command>

                    {/* Anos */}
                    <Command>
                        <CommandInput placeholder="Buscar ano…" className="h-9" />
                        <CommandList>
                            <CommandEmpty>Nenhum ano</CommandEmpty>
                            <CommandGroup heading="Anos">
                                {YEARS.map((y) => (
                                    <CommandItem key={y} value={y} onSelect={() => handlePick(y, currentMonth)}>
                                        {y}
                                        <Check className={cn("ml-auto", currentYear === y ? "opacity-100" : "opacity-0")} />
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        </CommandList>
                    </Command>
                </div>
            </PopoverContent>
        </Popover>
    );
}
