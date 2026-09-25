import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],

  server: {
    port: Number(process.env.PORT) || 5173,
    // Keeps API calls same-origin in development, so VITE_API_URL only has to
    // be set for deployed builds.
    proxy: {
      "/api": {
        target: "http://127.0.0.1:3001",
        changeOrigin: true,
      },
    },
  },

  build: {
    // Source maps make production stack traces readable without shipping
    // the original sources to the browser.
    sourcemap: "hidden",
    rollupOptions: {
      output: {
        // Rolldown (Vite 8) only accepts the function form here.
        manualChunks(id) {
          if (!id.includes("node_modules")) return;
          if (/[\\/]node_modules[\\/](react|react-dom|react-router|react-router-dom)[\\/]/.test(id)) {
            return "react";
          }
          // Nothing else is pinned. Framer Motion and Neon's account UI are
          // only reachable through lazy routes, and naming them here would
          // promote them to static dependencies of the entry chunk.
        },
      },
    },
  },
});
