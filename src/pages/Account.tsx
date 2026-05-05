import { AccountView } from "@neondatabase/neon-js/auth/react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { User, Shield, ArrowLeft } from "lucide-react";

export default function Account() {
  const { pathname } = useParams();
  const navigate = useNavigate();

  const tabs = [
    { id: "account", label: "Profil", icon: User, path: "/account" },
    { id: "security", label: "Sécurité", icon: Shield, path: "/account/security" },
  ];

  return (
    <div className="min-h-screen pt-24 pb-12 px-6 bg-[#09090B] text-white selection:bg-[#CCFF00] selection:text-black">
      
      {/* 🛠️ CSS DE NETTOYAGE ET STYLE GRIS POUR TOUS LES TEXTES D'AIDE */}
      <style>{`
        /* Supprime les fonds blancs du composant Neon */
        .neon-clean-fix [class*="bg-white"],
        .neon-clean-fix [class*="bg-zinc-"],
        .neon-clean-fix [class*="bg-gray-"],
        .neon-clean-fix div[style*="background"] {
          background-color: transparent !important;
          box-shadow: none !important;
          border: none !important;
        }

        /* Titres et descriptions principales en blanc */
        .neon-clean-fix h2, .neon-clean-fix h3, .neon-clean-fix p {
          color: #FFFFFF !important;
        }

        /* 🎯 FIX GLOBAL : RENDRE LES TEXTES D'AIDE (NOM, EMAIL, PASSWORD) GRIS */
        .neon-clean-fix span, 
        .neon-clean-fix .text-xs,
        .neon-clean-fix [class*="text-muted"],
        /* Cible les couleurs injectées par défaut pour le texte d'aide */
        .neon-clean-fix div[style*="color: rgb(113, 113, 122)"],
        .neon-clean-fix div[style*="color: rgb(161, 161, 170)"] {
          color: #a1a1aa !important; /* Gris Zinc-400 */
          background-color: transparent !important;
          border: none !important;
          font-weight: 400 !important;
        }

        /* Style Volt pour le bouton SAVE */
        .neon-clean-fix button[type='submit'] {
          background-color: #CCFF00 !important;
          color: #000000 !important;
          font-weight: 900 !important;
          text-transform: uppercase !important;
          border-radius: 8px !important;
          padding: 10px 24px !important;
        }

        /* Champs de saisie noirs */
        .neon-clean-fix input {
          background-color: #000000 !important;
          border: 1px solid rgba(255, 255, 255, 0.1) !important;
          color: #FFFFFF !important;
          border-radius: 8px !important;
        }

        /* Cache la navigation par défaut de Neon */
        .neon-clean-fix nav { display: none !important; }
      `}</style>

      <div className="max-w-6xl mx-auto">
        {/* EN-TÊTE PROGRESIVF */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-4 mb-10">
          <button onClick={() => navigate("/profile")} className="p-2 hover:bg-white/5 rounded-full transition-colors text-[#CCFF00]">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-4xl font-black uppercase tracking-tighter italic">
            Athlete <span className="text-[#CCFF00]">Settings</span>
          </h1>
        </motion.div>

        <div className="flex flex-col md:flex-row gap-8">
          {/* SIDEBAR PERSONNALISÉE */}
          <div className="w-full md:w-64 space-y-2">
            {tabs.map((tab) => {
              const isActive = pathname === tab.path || (tab.id === 'account' && !pathname?.includes('security'));
              return (
                <button
                  key={tab.id}
                  onClick={() => navigate(tab.path)}
                  className={`w-full flex items-center gap-4 px-6 py-4 rounded-xl font-bold uppercase tracking-widest text-sm transition-all
                    ${isActive ? "bg-[#CCFF00] text-black shadow-[0_0_20px_rgba(204,255,0,0.2)]" : "text-zinc-500 hover:text-white"}`}
                >
                  <tab.icon className="w-5 h-5" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* ZONE DE CONTENU SOMBRE UNIFIÉE SANS LIGNE BLANCHE */}
          <div className="flex-1 bg-[#18181B] border border-white/5 rounded-2xl overflow-hidden neon-clean-fix p-8 shadow-2xl">
            <AccountView pathname={pathname} />
          </div>
        </div>
      </div>
    </div>
  );
}