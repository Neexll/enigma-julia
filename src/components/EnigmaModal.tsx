import React, { useState } from 'react'
import {
  X,
  Lock,
  Unlock,
  Sparkles,
  CheckCircle2,
  HelpCircle,
  KeyRound,
  Clock,
  Heart,
} from 'lucide-react'
import { EnigmaItem, ProgressoItem } from '../data/enigmasConfig'

interface EnigmaModalProps {
  enigma: EnigmaItem | null
  progresso?: ProgressoItem
  liberadoEfetivo: boolean
  onClose: () => void
  onSubmitAnswer: (
    enigma: EnigmaItem,
    tentativa: string
  ) => Promise<{ acertou: boolean; mensagem: string }>
}

export const EnigmaModal: React.FC<EnigmaModalProps> = ({
  enigma,
  progresso,
  liberadoEfetivo,
  onClose,
  onSubmitAnswer,
}) => {
  const [resposta, setResposta] = useState('')
  const [mostrarDica, setMostrarDica] = useState(false)
  const [enviando, setEnviando] = useState(false)
  const [feedback, setFeedback] = useState<{
    tipo: 'erro' | 'sucesso'
    texto: string
  } | null>(null)
  const [shakeKey, setShakeKey] = useState(0)

  if (!enigma) return null

  const jaResolvido = Boolean(progresso?.resolvido)

  const handleResolver = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!resposta.trim() || enviando) return

    setEnviando(true)
    setFeedback(null)

    const resultado = await onSubmitAnswer(enigma, resposta)
    setEnviando(false)

    if (resultado.acertou) {
      setFeedback({ tipo: 'sucesso', texto: resultado.mensagem })
      setResposta('')
    } else {
      setFeedback({ tipo: 'erro', texto: resultado.mensagem })
      setShakeKey((k) => k + 1)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div
        key={shakeKey}
        className={`relative w-full max-w-xl overflow-hidden rounded-2xl border bg-[#121016] p-6 sm:p-8 shadow-[0_25px_80px_-15px_rgba(0,0,0,0.9)] transition-all ${
          jaResolvido
            ? 'border-emerald-500/30'
            : feedback?.tipo === 'erro'
            ? 'border-rose-500/40 animate-shake'
            : 'border-rose-500/25'
        }`}
      >
        {/* Brilho superior */}
        <div
          className={`absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent ${
            jaResolvido ? 'via-emerald-400/50' : 'via-rose-500/50'
          } to-transparent`}
        />

        {/* Cabeçalho do Modal */}
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-rose-300/90">
                {enigma.codigo}
              </span>
              <span className="text-zinc-600">•</span>
              <span className="font-mono text-[11px] text-zinc-400">
                {enigma.subtitulo}
              </span>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-zinc-100">
              {enigma.titulo}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="rounded-xl border border-white/10 bg-white/5 p-2 text-zinc-400 hover:bg-white/10 hover:text-zinc-100 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Conteúdo conforme status */}
        <div className="mt-6 space-y-5">
          {!liberadoEfetivo && !jaResolvido ? (
            <div className="rounded-xl border border-amber-500/20 bg-amber-950/10 p-6 text-center space-y-3">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-300">
                <Clock className="h-5 w-5" />
              </div>
              <h3 className="font-serif text-xl font-medium text-amber-100">
                Mistério em Preparação
              </h3>
              <p className="text-sm text-zinc-300 leading-relaxed max-w-md mx-auto">
                {enigma.descricao}
              </p>
              <p className="font-mono text-[11px] uppercase tracking-widest text-amber-300/80 pt-2">
                Status: Aguardando Liberação Oficial
              </p>
            </div>
          ) : (
            <>
              {/* Texto do Enigma */}
              <div className="rounded-xl border border-white/10 bg-black/40 p-5 space-y-3">
                <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-500 block">
                  Descrição da Pista
                </span>
                <p className="font-serif text-lg sm:text-xl text-zinc-200 leading-relaxed italic">
                  “{enigma.descricao}”
                </p>
              </div>

              {/* Dica Opcional */}
              <div className="rounded-xl border border-rose-500/15 bg-rose-950/10 p-4">
                {!mostrarDica ? (
                  <button
                    type="button"
                    onClick={() => setMostrarDica(true)}
                    className="flex items-center gap-2 text-xs font-mono text-rose-300/85 hover:text-rose-200 transition-colors"
                  >
                    <HelpCircle className="h-4 w-4" />
                    <span>Precisa de uma pista para este enigma?</span>
                  </button>
                ) : (
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-wider text-rose-300">
                      <Sparkles className="h-3.5 w-3.5" />
                      <span>Pista Confidencial</span>
                    </div>
                    <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
                      {enigma.dica}
                    </p>
                  </div>
                )}
              </div>

              {/* Estado já resolvido vs Formulário de tentativa */}
              {jaResolvido ? (
                <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-emerald-300 font-mono text-xs uppercase tracking-wider">
                      <CheckCircle2 className="h-4 w-4" />
                      <span>Cadeado Destrancado!</span>
                    </div>
                    <Heart className="h-4 w-4 text-rose-400 fill-rose-400/40" />
                  </div>
                  <p className="font-serif text-lg text-zinc-100 leading-relaxed">
                    “{enigma.recompensa}”
                  </p>
                  {progresso?.resposta_enviada && (
                    <p className="text-xs font-mono text-emerald-300/80 pt-1 border-t border-emerald-500/20">
                      Chave utilizada: {progresso.resposta_enviada}
                    </p>
                  )}
                </div>
              ) : (
                <form onSubmit={handleResolver} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="block font-mono text-[11px] uppercase tracking-[0.18em] text-zinc-400">
                      Sua Resposta para o {enigma.codigo}
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={resposta}
                        onChange={(e) => {
                          setResposta(e.target.value)
                          if (feedback) setFeedback(null)
                        }}
                        placeholder="Digite a resposta para abrir o cadeado..."
                        autoFocus
                        className="w-full rounded-xl border border-white/15 bg-black/60 px-4 py-3.5 pl-10 text-sm text-zinc-100 placeholder-zinc-600 focus:border-rose-500/50 focus:outline-none focus:ring-2 focus:ring-rose-500/20 font-mono"
                      />
                      <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-rose-400/70" />
                    </div>
                  </div>

                  {feedback && (
                    <div
                      className={`rounded-xl border px-4 py-3 text-xs flex items-center gap-2.5 ${
                        feedback.tipo === 'sucesso'
                          ? 'border-emerald-500/30 bg-emerald-950/30 text-emerald-200'
                          : 'border-rose-500/30 bg-rose-950/30 text-rose-200'
                      }`}
                    >
                      {feedback.tipo === 'sucesso' ? (
                        <Unlock className="h-4 w-4 text-emerald-400 shrink-0" />
                      ) : (
                        <Lock className="h-4 w-4 text-rose-400 shrink-0" />
                      )}
                      <span>{feedback.texto}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-end gap-3 pt-1">
                    <button
                      type="button"
                      onClick={onClose}
                      className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-xs font-mono uppercase tracking-wider text-zinc-300 hover:bg-white/10 transition-colors"
                    >
                      Fechar
                    </button>
                    <button
                      type="submit"
                      disabled={enviando || !resposta.trim()}
                      className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-rose-700 to-rose-600 px-5 py-3 text-xs font-mono uppercase tracking-wider font-medium text-white shadow-lg shadow-rose-950/50 hover:from-rose-600 hover:to-rose-500 disabled:opacity-40 transition-all"
                    >
                      <Unlock className="h-3.5 w-3.5" />
                      <span>
                        {enviando ? 'Verificando...' : 'Destrancar Cadeado'}
                      </span>
                    </button>
                  </div>
                </form>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

