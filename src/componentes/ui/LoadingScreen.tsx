export function Spinner({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <div
      role="status"
      aria-label="Chargement"
      className={`${className} rounded-full border-2 border-[var(--color-line)] border-t-[var(--color-accent)] animate-spin`}
    />
  );
}

export function LoadingScreen({ message }: { message?: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-[var(--color-bg)]">
      <div className="flex flex-col items-center gap-5 text-center max-w-xs">
        <Spinner className="w-12 h-12" />
        {message && (
          <p className="text-[13px] text-[var(--color-ink-faint)] leading-relaxed">{message}</p>
        )}
      </div>
    </div>
  );
}
