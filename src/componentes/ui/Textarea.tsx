import { forwardRef } from "react";

export const Textarea = forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label?: string }>(
  ({ className = "", label, id, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-2">
        {label && <label htmlFor={id} className="text-xs font-bold text-zinc-400 uppercase tracking-widest">{label}</label>}
        <textarea
          ref={ref}
          id={id}
          className={`w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#CCFF00] focus:ring-1 focus:ring-[#CCFF00] transition-all min-h-[120px] resize-y ${className}`}
          {...props}
        />
      </div>
    );
  }
);
Textarea.displayName = "Textarea";