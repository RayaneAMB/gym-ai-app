import { BrowserRouter , Route, Routes } from "react-router-dom"
import Home from "./pages/Home"
import Onboarding from "./pages/Onboarding"
import Auth from "./pages/Auth"
import Account from "./pages/Account"
import Profile from "./pages/Profile"
import Navbar from "./componentes/layout/Navbar"
import { NeonAuthUIProvider } from '@neondatabase/neon-js/auth/react';
import { authClient } from "./lib/auth";
import AuthProvider from "./context/AuthContext"

function App() {
 return (
  <NeonAuthUIProvider authClient={authClient}>
    <AuthProvider> 
      <BrowserRouter>
        <Navbar />
        <div className="min-h-screen flex flex-col">
    
           <main className="flex-1">
            <Routes>
              <Route index element={<Home />} />
              <Route path="/onboarding" element={<Onboarding />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/account/:pathname" element={<Account />} />
              <Route path="/auth/:pathname" element={<Auth />} />
            </Routes>
           </main>
          </div>
    
      </BrowserRouter>
      </AuthProvider>
  </NeonAuthUIProvider>)
   
}

export default App
