import { type ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary";
  size?: "sm" | "md" | "lg";
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = "", variant = "primary", size = "md", children, ...props }, ref) => {
    // Le style de base "Sport" (penché, police grasse, majuscule)
    const baseStyle = "group relative inline-flex items-center justify-center font-extrabold uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-[0.98] skew-x-[-5deg]";
    
    const variants = {
      primary: "bg-[#CCFF00] text-black",
      secondary: "bg-[#18181B] text-white border border-white/10 hover:border-[#CCFF00] hover:text-[#CCFF00]",
    };
    
    const sizes = {
      sm: "px-4 py-2 text-xs",
      md: "px-6 py-3 text-sm",
      lg: "px-8 py-4 text-base",
    };

    return (
      <button ref={ref} className={`${baseStyle} ${variants[variant]} ${sizes[size]} ${className}`} {...props}>
        {/* On redresse le texte à l'intérieur pour qu'il soit lisible */}
        <span className="skew-x-[5deg] flex items-center justify-center gap-2 w-full">
          {children}
        </span>
      </button>
    );
  }
);
Button.displayName = "Button";