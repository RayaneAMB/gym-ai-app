import { type HTMLAttributes, forwardRef } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "bordered";
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className = "", variant = "default", children, ...props }, ref) => {
    const base = "bg-[#18181B] rounded-xl overflow-hidden";
    const variants = {
      default: "shadow-2xl shadow-black/50",
      bordered: "border border-white/5",
    };

    return (
      <div ref={ref} className={`${base} ${variants[variant]} ${className}`} {...props}>
        {children}
      </div>
    );
  }
);
Card.displayName = "Card";