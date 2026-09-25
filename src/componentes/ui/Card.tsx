import { type HTMLAttributes, forwardRef } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "bordered";
}

const VARIANTS = {
  default: "shadow-2xl shadow-black/50",
  bordered: "border border-white/5",
} as const;

export const Card = forwardRef<HTMLDivElement, CardProps>(function Card(
  { className = "", variant = "default", children, ...props },
  ref,
) {
  return (
    <div
      ref={ref}
      className={`bg-[var(--color-surface-raised)] rounded-xl overflow-hidden p-6 ${VARIANTS[variant]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
});
