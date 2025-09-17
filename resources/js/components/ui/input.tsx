import * as React from "react";

import { cn } from "@/lib/utils";

export interface InputProps extends React.ComponentProps<"input"> {
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
    onRightIconClick?: () => void;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, type, leftIcon, rightIcon, onRightIconClick, ...props }, ref) => {
        return (
            <div className={cn("relative", className)}>
                {leftIcon && (
                    <div
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground pointer-events-none">
                        {leftIcon}
                    </div>
                )}
                <input
                    type={type}
                    data-slot="input"
                    className={cn(
                        "border-input file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
                        "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] bg-background",
                        "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
                        leftIcon && "pl-8",
                        rightIcon && "pr-8",
                        className
                    )}
                    ref={ref}
                    {...props}
                />
                {rightIcon && (
                    <div
                        className={cn(
                            "absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground",
                            onRightIconClick && "cursor-pointer hover:text-foreground transition-colors"
                        )}
                        onClick={onRightIconClick}
                    >
                        {rightIcon}
                    </div>
                )}
            </div>
        );
    }
);
Input.displayName = "Input";

export { Input };
