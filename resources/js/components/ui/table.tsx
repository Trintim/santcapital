import * as React from "react";

import { cn } from "@/lib/utils";
import { ArrowDownWideNarrow, ArrowUpNarrowWide } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

interface TableHeadProps extends React.ComponentProps<"th"> {
    sortable?: boolean;
    children: React.ReactNode;
    className?: string;
    sortBy?: string;
    sortDirection?: "asc" | "desc" | false;
    onSort?: (sortBy: string) => void;
}

function Table({ className, ...props }: React.ComponentProps<"table">) {
    return (
        <div
            data-slot="table-container"
            className="relative w-full overflow-x-auto"
        >
            <table
                data-slot="table"
                className={cn("w-full caption-bottom text-sm", className)}
                {...props}
            />
        </div>
    );
}

function TableHeader({ className, ...props }: React.ComponentProps<"thead">) {
    return (
        <thead
            data-slot="table-header"
            className={cn("[&_tr]:border-b", className)}
            {...props}
        />
    );
}

function TableBody({ className, ...props }: React.ComponentProps<"tbody">) {
    return (
        <tbody
            data-slot="table-body"
            className={cn("[&_tr:last-child]:border-0", className)}
            {...props}
        />
    );
}

function TableFooter({ className, ...props }: React.ComponentProps<"tfoot">) {
    return (
        <tfoot
            data-slot="table-footer"
            className={cn(
                "bg-muted/50 border-t font-medium [&>tr]:last:border-b-0",
                className
            )}
            {...props}
        />
    );
}

function TableRow({ className, ...props }: React.ComponentProps<"tr">) {
    return (
        <tr
            data-slot="table-row"
            className={cn(
                "hover:bg-muted/50 data-[state=selected]:bg-muted border-b transition-colors",
                className
            )}
            {...props}
        />
    );
}

function TableHead({
                       children,
                       sortable,
                       onSort,
                       sortBy,
                       sortDirection,
                       className,
                       ...props
                   }: TableHeadProps) {

    const handleSort = () => {
        if (sortable && onSort && sortBy) {
            onSort(sortBy);
        }
    };

    const arrowIcon = sortable ? (
        <AnimatePresence mode="wait">
            {sortDirection === "asc" ? (
                <motion.span
                    key="asc"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.2 }}
                >
                    <ArrowUpNarrowWide className="size-4" />
                </motion.span>
            ) : sortDirection === "desc" ? (
                <motion.span
                    key="desc"
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    transition={{ duration: 0.2 }}
                >
                    <ArrowDownWideNarrow className="size-4" />
                </motion.span>
            ) : (
                <motion.span
                    key="none"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.5 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                >
                    <ArrowUpNarrowWide className="size-4 opacity-50" />
                </motion.span>
            )}
        </AnimatePresence>
    ) : null;

    return (
        <th
            scope="col"
            data-slot="table-head"
            className={cn(
                "text-foreground h-10 px-2 text-left align-middle font-medium whitespace-nowrap [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
                sortable ? "cursor-pointer" : "",
                className ? className : ""
            )}
            {...props}
            onClick={sortable ? handleSort : undefined}
        >
            {sortable ? (
                <div className="flex items-center gap-2">
                    {children}
                    {arrowIcon}
                </div>
            ) : (
                children
            )}
        </th>
    );
}

function TableCell({ className, ...props }: React.ComponentProps<"td">) {
    return (
        <td
            data-slot="table-cell"
            className={cn(
                "p-2 align-middle whitespace-nowrap [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
                className
            )}
            {...props}
        />
    );
}

function TableCaption({
                          className,
                          ...props
                      }: React.ComponentProps<"caption">) {
    return (
        <caption
            data-slot="table-caption"
            className={cn("text-muted-foreground mt-4 text-sm", className)}
            {...props}
        />
    );
}

export {
    Table,
    TableHeader,
    TableBody,
    TableFooter,
    TableHead,
    TableRow,
    TableCell,
    TableCaption
};
