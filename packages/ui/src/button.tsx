"use client";

import { cn } from "./utils";
import { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string;
  variant?: "default" | "outline" | "ghost" | "link";
}

export function Button({
  className,
  variant = "default",
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        "disabled:opacity-50 disabled:pointer-events-none",
        {
          "bg-primary text-primary-foreground hover:bg-primary/90":
            variant === "default",
          "border border-input hover:bg-accent hover:text-accent-foreground":
            variant === "outline",
          "hover:bg-accent hover:text-accent-foreground": variant === "ghost",
          "underline-offset-4 hover:underline text-primary": variant === "link",
        },
        className
      )}
      {...props}
    />
  );
}
