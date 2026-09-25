import { forwardRef } from "react";

export const Select = forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement> & { label?: string; options: { value: string; label: string }[] }>(
  ({ className = "", label, id, options, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-2">
        {label && <label htmlFor={id} className="text-xs font-bold text-zinc-400 uppercase tracking-widest">{label}</label>}
        <select
          ref={ref}
          id={id}
          className={`w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)] transition-all appearance-none cursor-pointer ${className}`}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-[#18181B] text-white">
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    );
  }
);
Select.displayName = "Select";