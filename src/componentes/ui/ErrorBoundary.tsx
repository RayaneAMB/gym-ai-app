import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

/**
 * Without this, any render error in a page blanks the whole app — the user
 * sees a white screen with no way to recover.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Erreur non gérée dans l'interface :", error, info.componentStack);
  }

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;

    return (
      <div className="min-h-screen flex items-center justify-center px-6 bg-[var(--color-bg)]">
        <div className="max-w-md text-center">
          <p className="text-[10px] font-black tracking-[0.3em] uppercase text-[var(--color-accent)] mb-3">
            Erreur
          </p>
          <h1 className="text-3xl font-black uppercase tracking-tight text-[var(--color-ink)] mb-3">
            Quelque chose a cassé
          </h1>
          <p className="text-sm text-[var(--color-ink-subtle)] mb-8 leading-relaxed">
            L'application a rencontré un problème inattendu. Rechargez la page pour repartir
            d'un état propre.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 font-black text-sm uppercase tracking-widest bg-[var(--color-accent)] text-[var(--color-accent-ink)]"
          >
            Recharger
          </button>
          {import.meta.env.DEV && (
            <pre className="mt-8 text-left text-[11px] text-[var(--color-danger)] whitespace-pre-wrap break-words">
              {error.message}
            </pre>
          )}
        </div>
      </div>
    );
  }
}
