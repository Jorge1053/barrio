"use client";

import { cn } from "@/lib/utils";

const baseClasses =
  "inline-flex items-center justify-center rounded-full font-medium transition-all " +
  "focus:outline-none focus:ring-2 focus:ring-b-accent/70 focus:ring-offset-2 focus:ring-offset-background " +
  "disabled:opacity-50 disabled:cursor-not-allowed";

const variantClasses = {
  primary: "bg-b-accent text-b-card hover:bg-emerald-400 shadow-soft",
  ghost: "bg-b-card/40 text-b-text border border-b-border hover:bg-b-card/80",
};

const sizeClasses = {
  md: "text-sm px-5 py-2.5",
  lg: "text-base px-6 py-3",
};

export function Button({
  variant = "primary",
  size = "md",
  className,
  ...props
}) {
  return (
    <button
      className={cn(
        baseClasses,
        variantClasses[variant] || variantClasses.primary,
        sizeClasses[size] || sizeClasses.md,
        className
      )}
      {...props}
    />
  );
}
