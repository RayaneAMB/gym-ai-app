import { Link } from "react-router-dom";
import { Dumbbell } from "lucide-react";
import { UserButton, SignedIn, SignedOut } from "@neondatabase/neon-js/auth/react";

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-[#09090B]/80 backdrop-blur-md border-b border-white/5">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        
        {/* Logo Sport agressif */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="bg-[#CCFF00] p-2 rounded-lg group-hover:scale-110 transition-transform skew-x-[-10deg]">
            <Dumbbell className="w-5 h-5 text-black skew-x-[10deg]" />
          </div>
          <span className="text-2xl font-black tracking-tighter text-white uppercase" style={{ fontFamily: "'Oswald', 'Bebas Neue', sans-serif" }}>
            Gym<span className="text-[#CCFF00]">AI</span>
          </span>
        </Link>

        {/* Menu de droite */}
        <div className="flex items-center gap-6">
          <SignedIn>
            <Link to="/profile" className="text-sm font-bold text-zinc-400 hover:text-white uppercase tracking-wider transition-colors">
              Mon programme
            </Link>
            {/* On s'assure que le menu de l'utilisateur correspond au thème sombre */}
            <div className="neon-dark-force">
              <UserButton size="icon" />
            </div>
          </SignedIn>

          <SignedOut>
            <Link to="/auth/sign-in" className="text-sm font-bold text-zinc-400 hover:text-white uppercase tracking-wider transition-colors">
              Login
            </Link>
            <Link to="/onboarding">
              <button className="bg-[#CCFF00] text-black px-6 py-2.5 font-black uppercase tracking-wider text-sm hover:scale-105 transition-transform skew-x-[-10deg]">
                <span className="skew-x-[10deg] block">Start Free</span>
              </button>
            </Link>
          </SignedOut>
        </div>
      </div>
    </nav>
  );
}