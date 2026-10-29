import React, { useEffect, useState } from 'react'
import { LoginView } from './components/LoginView'
import { DashboardView } from './components/DashboardView'
import { supabase, verificarSessaoAtiva } from './lib/supabase'

export function App() {
  const [autenticado, setAutenticado] = useState<boolean | null>(null)

  useEffect(() => {
    let ativo = true

    verificarSessaoAtiva().then((logado) => {
      if (ativo) setAutenticado(logado)
    })

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (!ativo) return
        if (session) {
          setAutenticado(true)
        }
      }
    )

    return () => {
      ativo = false
      listener.subscription.unsubscribe()
    }
  }, [])

  if (autenticado === null) {
    return (
      <div className="min-h-screen w-full bg-[#09080b] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 rounded-full border-2 border-rose-500/30 border-t-rose-400 animate-spin" />
          <span className="font-mono text-xs uppercase tracking-widest text-zinc-500">
            Carregando Arquivo Confidencial...
          </span>
        </div>
      </div>
    )
  }

  if (!autenticado) {
    return <LoginView onLoginSuccess={() => setAutenticado(true)} />
  }

  return <DashboardView onLogout={() => setAutenticado(false)} />
}

export default App

