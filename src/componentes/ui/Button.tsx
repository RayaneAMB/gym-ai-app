import { type ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
}

const VARIANTS = {
  primary:
    "bg-[var(--color-accent)] text-[var(--color-accent-ink)] hover:bg-[var(--color-accent-strong)]",
  secondary:
    "bg-[var(--color-surface-raised)] text-[var(--color-ink)] border border-white/10 hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]",
  ghost:
    "text-[var(--color-ink-subtle)] hover:text-[var(--color-ink)] border border-[var(--color-line)] hover:border-white/30",
} as const;

const SIZES = {
  sm: "px-4 py-2 text-xs",
  md: "px-6 py-3 text-sm",
  lg: "px-8 py-4 text-base",
} as const;

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className = "", variant = "primary", size = "md", children, ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      className={`group relative inline-flex items-center justify-center font-display font-extrabold uppercase tracking-widest transition-colors skew-x-[-5deg] disabled:opacity-60 disabled:cursor-not-allowed ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
      {...props}
    >
      {/* The wrapper un-skews the label so text stays readable. */}
      <span className="skew-x-[5deg] flex items-center justify-center gap-2 w-full">
        {children}
      </span>
    </button>
  );
});
