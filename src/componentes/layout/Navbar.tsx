import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Dumbbell, LogOut, Settings, User as UserIcon } from "lucide-react";

import { useAuth } from "../../hooks/useAuth";

/**
 * The signed-in menu is built from our own auth context rather than Neon's
 * `<SignedIn>` / `<UserButton>` components. Those live in the account-UI entry
 * point, which is roughly a megabyte of JavaScript — pulling it into the navbar
 * put it on the critical path of every page, including the landing page.
 */
function UserMenu() {
  const { user, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!open) return;

    function onPointerDown(event: PointerEvent) {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  if (!user) return null;

  const initial = (user.name ?? user.email ?? "?").trim().charAt(0).toUpperCase();

  async function handleSignOut() {
    setOpen(false);
    await signOut();
    navigate("/", { replace: true });
  }

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Menu du compte"
        className="w-9 h-9 rounded-full bg-[var(--color-accent)] text-[var(--color-accent-ink)] font-display font-black text-sm flex items-center justify-center hover:bg-[var(--color-accent-strong)] transition-colors overflow-hidden"
      >
        {user.image ? (
          <img src={user.image} alt="" className="w-full h-full object-cover" />
        ) : (
          initial
        )}
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 mt-2 w-56 bg-[var(--color-surface-raised)] border border-[var(--color-line)] rounded-xl shadow-2xl shadow-black/60 overflow-hidden"
        >
          <div className="px-4 py-3 border-b border-[var(--color-line)]">
            {user.name && (
              <p className="text-sm font-bold text-[var(--color-ink)] truncate">{user.name}</p>
            )}
            <p className="text-xs text-[var(--color-ink-subtle)] truncate">{user.email}</p>
          </div>

          <Link
            to="/profile"
            role="menuitem"
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 px-4 py-3 text-sm text-[var(--color-ink-muted)] hover:bg-white/5 hover:text-[var(--color-ink)] transition-colors"
          >
            <UserIcon className="w-4 h-4" aria-hidden="true" />
            Mon programme
          </Link>
          <Link
            to="/account/settings"
            role="menuitem"
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 px-4 py-3 text-sm text-[var(--color-ink-muted)] hover:bg-white/5 hover:text-[var(--color-ink)] transition-colors"
          >
            <Settings className="w-4 h-4" aria-hidden="true" />
            Paramètres
          </Link>
          <button
            role="menuitem"
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm text-[var(--color-ink-muted)] hover:bg-white/5 hover:text-[var(--color-danger)] transition-colors border-t border-[var(--color-line)]"
          >
            <LogOut className="w-4 h-4" aria-hidden="true" />
            Déconnexion
          </button>
        </div>
      )}
    </div>
  );
}

export default function Navbar() {
  const { user, isAuthLoading } = useAuth();

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-[var(--color-bg)]/80 backdrop-blur-md border-b border-white/5">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-3 group shrink-0">
          <div className="bg-[var(--color-accent)] p-2 rounded-lg group-hover:scale-110 transition-transform skew-x-[-10deg]">
            <Dumbbell
              className="w-5 h-5 text-[var(--color-accent-ink)] skew-x-[10deg]"
              aria-hidden="true"
            />
          </div>
          <span className="font-display text-2xl font-black tracking-tighter uppercase">
            Gym<span className="text-[var(--color-accent)]">AI</span>
          </span>
        </Link>

        {/* Render nothing until the session is known, so the header doesn't
            flash "Connexion" at someone who is already signed in. */}
        {!isAuthLoading && (
          <div className="flex items-center gap-4 sm:gap-6">
            {user ? (
              <>
                <NavLink
                  to="/profile"
                  className={({ isActive }) =>
                    `hidden sm:block text-sm font-bold uppercase tracking-wider transition-colors ${
                      isActive
                        ? "text-[var(--color-accent)]"
                        : "text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]"
                    }`
                  }
                >
                  Mon programme
                </NavLink>
                <UserMenu />
              </>
            ) : (
              <>
                <Link
                  to="/auth/sign-in"
                  className="text-sm font-bold text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] uppercase tracking-wider transition-colors"
                >
                  Connexion
                </Link>
                <Link to="/onboarding">
                  <button className="bg-[var(--color-accent)] text-[var(--color-accent-ink)] px-4 sm:px-6 py-2.5 font-display font-black uppercase tracking-wider text-sm hover:bg-[var(--color-accent-strong)] transition-colors skew-x-[-10deg]">
                    <span className="skew-x-[10deg] block">Commencer</span>
                  </button>
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
