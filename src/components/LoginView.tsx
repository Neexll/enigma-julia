import React, { useState } from 'react'
import {
  Lock,
  Unlock,
  Sparkles,
  Eye,
  EyeOff,
  Heart,
  HelpCircle,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react'
import { LOGIN_CONFIG } from '../data/enigmasConfig'
import { realizarLoginJulia } from '../lib/supabase'

interface LoginViewProps {
  onLoginSuccess: () => void
}

export const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess }) => {
  const [senha, setSenha] = useState('')
  const [mostrarSenha, setMostrarSenha] = useState(false)
  const [mostrarDicaExtra, setMostrarDicaExtra] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const [carregando, setCarregando] = useState(false)
  const [desbloqueando, setDesbloqueando] = useState(false)
  const [shakeKey, setShakeKey] = useState(0)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!senha.trim() || carregando || desbloqueando) return

    setCarregando(true)
    setErro(null)

    const resultado = await realizarLoginJulia(senha)

    if (!resultado.sucesso) {
      setCarregando(false)
      setErro(
        resultado.erro ||
          'Senha incorreta. Observe a dica com carinho e tente novamente.'
      )
      setShakeKey((prev) => prev + 1)
      return
    }

    setDesbloqueando(true)
    setTimeout(() => {
      onLoginSuccess()
    }, 850)
  }

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center px-4 py-12 overflow-hidden bg-[#09080b]">
      {/* Luzes atmosféricas de fundo (Romântico + Noir Minimalista) */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[580px] h-[580px] rounded-full bg-rose-950/25 blur-[130px] animate-pulse-slow" />
        <div className="absolute bottom-[-180px] right-[-100px] w-[420px] h-[420px] rounded-full bg-amber-950/15 blur-[120px]" />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              'radial-gradient(#f4eff2 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
        />
      </div>

      {/* Cabeçalho minimalista de arquivo confidencial */}
      <div className="relative z-10 mb-6 flex items-center gap-2.5 px-3.5 py-1.5 rounded-full border border-rose-500/20 bg-rose-950/15 backdrop-blur-md">
        <span className="h-1.5 w-1.5 rounded-full bg-rose-400 animate-ping" />
        <span className="font-mono text-[11px] uppercase tracking-[0.25em] text-rose-200/80">
          Arquivo Confidencial • Destinatária: Júlia
        </span>
      </div>

      {/* Card Principal de Login */}
      <div
        key={shakeKey}
        className={`relative z-10 w-full max-w-md rounded-2xl border border-white/10 bg-[#121016]/90 p-7 sm:p-9 shadow-[0_25px_70px_-15px_rgba(0,0,0,0.85)] backdrop-blur-xl transition-all duration-500 ${
          erro ? 'animate-shake border-rose-500/40' : ''
        } ${desbloqueando ? 'scale-[0.98] opacity-0' : 'scale-100 opacity-100'}`}
      >
        {/* Linha sutil iluminada no topo */}
        <div className="absolute inset-x-12 top-0 h-px bg-gradient-to-r from-transparent via-rose-500/40 to-transparent" />

        {/* Ícone Central do Cadeado */}
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-rose-500/25 bg-gradient-to-b from-rose-500/15 to-transparent shadow-inner">
          {desbloqueando ? (
            <Unlock className="h-7 w-7 text-rose-300 transition-transform duration-500 scale-110" />
          ) : (
            <Lock className="h-7 w-7 text-rose-300/90 animate-float" />
          )}
        </div>

        {/* Título e Introdução */}
        <div className="text-center space-y-2 mb-7">
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-zinc-400">
            Caso N.º 05 • Acesso Restrito
          </p>
          <h1 className="font-serif text-3xl sm:text-4xl font-semibold tracking-wide text-zinc-100">
            Para você, <span className="italic text-rose-300">Júlia</span>
          </h1>
          <p className="text-sm text-zinc-400 leading-relaxed pt-1">
            Cinco mistérios foram trancados neste dossiê. Para abrir a primeira
            porta, digite a senha secreta abaixo.
          </p>
        </div>

        {/* Box da Dica Fácil & Romântica */}
        <div className="mb-6 rounded-xl border border-rose-500/20 bg-rose-950/15 p-4 text-left transition-all">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 rounded-lg bg-rose-500/15 p-1.5 text-rose-300 shrink-0">
              <Sparkles className="h-4 w-4" />
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[11px] uppercase tracking-wider text-rose-300/90 font-medium">
                  Dica da Senha
                </span>
                <Heart className="h-3 w-3 text-rose-400/70 fill-rose-400/30" />
              </div>
              <p className="text-xs sm:text-[13px] text-zinc-300 leading-relaxed italic font-serif text-[15px]">
                “{LOGIN_CONFIG.dicaPrincipal}”
              </p>

              {!mostrarDicaExtra ? (
                <button
                  type="button"
                  onClick={() => setMostrarDicaExtra(true)}
                  className="inline-flex items-center gap-1 pt-1 text-[11px] font-mono text-rose-300/75 hover:text-rose-200 transition-colors"
                >
                  <HelpCircle className="h-3 w-3" />
                  Quer deixar ainda mais fácil? Clique aqui
                </button>
              ) : (
                <p className="pt-1.5 text-[11px] font-mono text-rose-200/90 border-t border-rose-500/15">
                  Pista extra: {LOGIN_CONFIG.dicaExtra}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Formulário da Senha */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label
              htmlFor="senha-acesso"
              className="block font-mono text-[11px] uppercase tracking-[0.18em] text-zinc-400"
            >
              Chave de Desbloqueio
            </label>
            <div className="relative">
              <input
                id="senha-acesso"
                type={mostrarSenha ? 'text' : 'password'}
                value={senha}
                onChange={(e) => {
                  setSenha(e.target.value)
                  if (erro) setErro(null)
                }}
                placeholder="Digite a senha secreta..."
                autoComplete="off"
                autoFocus
                className="w-full rounded-xl border border-white/10 bg-black/50 px-4 py-3.5 pr-11 text-sm text-zinc-100 placeholder-zinc-600 focus:border-rose-500/50 focus:outline-none focus:ring-2 focus:ring-rose-500/20 font-mono tracking-wider transition-all"
              />
              <button
                type="button"
                onClick={() => setMostrarSenha((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-zinc-500 hover:text-zinc-300 transition-colors"
                title={mostrarSenha ? 'Ocultar senha' : 'Mostrar senha'}
              >
                {mostrarSenha ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          {erro && (
            <div className="rounded-lg border border-rose-500/30 bg-rose-950/30 px-3.5 py-2.5 text-xs text-rose-200 flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-rose-400 shrink-0" />
              <span>{erro}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={carregando || desbloqueando || !senha.trim()}
            className="group relative w-full flex items-center justify-center gap-2.5 rounded-xl bg-gradient-to-r from-rose-700 via-rose-600 to-rose-700 px-5 py-3.5 text-sm font-medium text-white shadow-lg shadow-rose-950/50 hover:from-rose-600 hover:to-rose-500 disabled:opacity-40 disabled:pointer-events-none transition-all duration-300"
          >
            <span>
              {desbloqueando
                ? 'Abrindo Arquivo Confidencial...'
                : carregando
                ? 'Verificando Chave...'
                : 'Destrancar Dossiê'}
            </span>
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
          </button>
        </form>

        {/* Rodapé de garantia de progresso salvo */}
        <div className="mt-6 pt-5 border-t border-white/5 flex items-center justify-center gap-2 text-[11px] text-zinc-500">
          <ShieldCheck className="h-3.5 w-3.5 text-rose-400/70" />
          <span>Seu progresso é salvo automaticamente e nunca reseta ao sair</span>
        </div>
      </div>
    </div>
  )
}

