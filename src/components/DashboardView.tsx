import React, { useEffect, useState, useCallback } from 'react'
import {
  Lock,
  Unlock,
  CheckCircle2,
  Clock,
  LogOut,
  Heart,
  Sparkles,
  KeyRound,
  Settings,
  RefreshCw,
  ShieldCheck,
  ChevronRight,
  FileLock2,
} from 'lucide-react'
import { EnigmaItem, ProgressoItem } from '../data/enigmasConfig'
import {
  SyncStatus,
  alterarModoSimulacaoLiberado,
  carregarDadosDashboard,
  lerModoSimulacaoLiberado,
  realizarLogoutJulia,
  salvarProgressoLocal,
  submeterRespostaEnigma,
} from '../lib/supabase'
import { EnigmaModal } from './EnigmaModal'
import { DatabaseSetupModal } from './DatabaseSetupModal'

interface DashboardViewProps {
  onLogout: () => void
}

const ALGARISMOS_ROMANOS = ['I', 'II', 'III', 'IV', 'V']

export const DashboardView: React.FC<DashboardViewProps> = ({ onLogout }) => {
  const [enigmas, setEnigmas] = useState<EnigmaItem[]>([])
  const [progresso, setProgresso] = useState<Record<number, ProgressoItem>>({})
  const [statusSync, setStatusSync] = useState<SyncStatus>({
    supabaseAuthAtivo: false,
    tabelaBancoAtiva: false,
    mensagem: 'Carregando progresso...',
  })
  const [carregando, setCarregando] = useState(true)
  const [enigmaSelecionado, setEnigmaSelecionado] =
    useState<EnigmaItem | null>(null)
  const [avisoBloqueio, setAvisoBloqueio] = useState<string | null>(null)
  const [cardShakeId, setCardShakeId] = useState<number | null>(null)
  const [modalBancoAberto, setModalBancoAberto] = useState(false)
  const [modoSimulacao, setModoSimulacao] = useState<boolean>(() =>
    lerModoSimulacaoLiberado()
  )

  const atualizarDados = useCallback(async () => {
    setCarregando(true)
    const dados = await carregarDadosDashboard()
    setEnigmas(dados.enigmas)
    setProgresso(dados.progresso)
    setStatusSync(dados.status)
    setCarregando(false)
  }, [])

  useEffect(() => {
    atualizarDados()
  }, [atualizarDados])

  const handleToggleSimulacao = (ativo: boolean) => {
    setModoSimulacao(ativo)
    alterarModoSimulacaoLiberado(ativo)
  }

  const handleResetarProgressoTeste = () => {
    salvarProgressoLocal({})
    setProgresso({})
  }

  const handleSair = async () => {
    await realizarLogoutJulia()
    onLogout()
  }

  const totalResolvidos = enigmas.filter(
    (e) => progresso[e.ordem]?.resolvido
  ).length
  const percentualConcluido = Math.round(
    (totalResolvidos / Math.max(enigmas.length, 5)) * 100
  )

  // Determina qual é o próximo enigma na sequência
  const proximoEnigma = enigmas.find((e) => !progresso[e.ordem]?.resolvido)

  const handleClickEnigma = (enigma: EnigmaItem) => {
    const resolvido = Boolean(progresso[enigma.ordem]?.resolvido)
    const anteriorResolvido =
      enigma.ordem === 1 || Boolean(progresso[enigma.ordem - 1]?.resolvido)

    if (!resolvido && !anteriorResolvido) {
      setCardShakeId(enigma.ordem)
      setAvisoBloqueio(
        `Cadeado trancado! Você precisa resolver o Enigma ${
          ALGARISMOS_ROMANOS[enigma.ordem - 2] || enigma.ordem - 1
        } antes de abrir este arquivo.`
      )
      setTimeout(() => setCardShakeId(null), 500)
      return
    }

    setAvisoBloqueio(null)
    setEnigmaSelecionado(enigma)
  }

  const handleResponderEnigma = async (
    enigma: EnigmaItem,
    tentativa: string
  ) => {
    const res = await submeterRespostaEnigma(enigma, tentativa, progresso)
    setProgresso(res.progressoAtualizado)
    return {
      acertou: res.acertou,
      mensagem: res.mensagem,
    }
  }

  return (
    <div className="relative min-h-screen w-full bg-[#09080b] text-[#f4eff2] pb-20">
      {/* Luzes atmosféricas de fundo */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-48 left-1/4 w-[520px] h-[520px] rounded-full bg-rose-950/20 blur-[140px]" />
        <div className="absolute bottom-[-160px] right-1/4 w-[480px] h-[480px] rounded-full bg-rose-900/10 blur-[140px]" />
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage:
              'radial-gradient(#f4eff2 1px, transparent 1px)',
            backgroundSize: '30px 30px',
          }}
        />
      </div>

      {/* Barra Superior Minimalista */}
      <header className="sticky top-0 z-30 border-b border-white/10 bg-[#09080b]/85 backdrop-blur-xl">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-300">
              <Heart className="h-4 w-4 fill-rose-400/30" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif text-lg font-semibold tracking-wide text-zinc-100">
                  Dossiê Júlia
                </span>
                <span className="hidden sm:inline-flex items-center rounded-full border border-rose-500/20 bg-rose-500/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest text-rose-300">
                  Confidencial
                </span>
              </div>
              <p className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">
                5 Enigmas • Progresso Persistente
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {modoSimulacao && (
              <span className="hidden md:inline-flex items-center gap-1.5 rounded-lg border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 font-mono text-[11px] text-amber-300">
                Modo Simulação Ativo
              </span>
            )}

            <button
              type="button"
              onClick={atualizarDados}
              title="Sincronizar progresso"
              className="rounded-xl border border-white/10 bg-white/5 p-2 text-zinc-400 hover:bg-white/10 hover:text-zinc-200 transition-colors"
            >
              <RefreshCw
                className={`h-4 w-4 ${carregando ? 'animate-spin' : ''}`}
              />
            </button>

            <button
              type="button"
              onClick={handleSair}
              className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3.5 py-2 text-xs font-mono text-zinc-300 hover:border-rose-500/30 hover:bg-rose-950/30 hover:text-rose-200 transition-all"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Sair</span>
            </button>
          </div>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main className="relative z-10 mx-auto max-w-5xl px-4 sm:px-6 pt-8 sm:pt-10 space-y-8">
        {/* Card de Boas-vindas e Resumo de Progresso */}
        <section className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#121016]/90 p-6 sm:p-8 shadow-2xl">
          <div className="absolute inset-x-16 top-0 h-px bg-gradient-to-r from-transparent via-rose-500/40 to-transparent" />

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2 max-w-xl">
              <div className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.22em] text-rose-300/90">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Painel de Investigação</span>
              </div>
              <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-zinc-100">
                Bem-vinda ao seu arquivo secreto,{' '}
                <span className="italic text-rose-300">Júlia</span>.
              </h1>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Cada enigma guarda um pedaço da nossa história. Os cadeados
                seguem uma ordem estrita: um novo mistério só pode ser aberto
                após a resolução do anterior.
              </p>
            </div>

            {/* Contador de Progresso */}
            <div className="rounded-xl border border-white/10 bg-black/40 p-4 sm:p-5 min-w-[240px] space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[11px] uppercase tracking-wider text-zinc-400">
                  Cadeados Abertos
                </span>
                <span className="font-mono text-sm font-semibold text-rose-300">
                  {totalResolvidos} / {enigmas.length || 5}
                </span>
              </div>

              <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-900 border border-white/5">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-rose-600 via-rose-500 to-amber-400 transition-all duration-700"
                  style={{ width: `${percentualConcluido}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] text-zinc-500 font-mono">
                <span>{percentualConcluido}% concluído</span>
                <span className="inline-flex items-center gap-1 text-emerald-400/90">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Salvo no banco
                </span>
              </div>
            </div>
          </div>

          {/* Linha do Tempo Visual dos 5 Cadeados */}
          <div className="mt-8 pt-6 border-t border-white/10">
            <div className="grid grid-cols-5 gap-2 sm:gap-4">
              {enigmas.map((enigma, idx) => {
                const resolvido = Boolean(progresso[enigma.ordem]?.resolvido)
                const anteriorResolvido =
                  enigma.ordem === 1 ||
                  Boolean(progresso[enigma.ordem - 1]?.resolvido)
                const liberadoEfetivo = enigma.liberado || modoSimulacao
                const isAtual = !resolvido && anteriorResolvido

                return (
                  <button
                    key={enigma.ordem}
                    type="button"
                    onClick={() => handleClickEnigma(enigma)}
                    className={`group flex flex-col items-center gap-2 rounded-xl border p-3 transition-all ${
                      resolvido
                        ? 'border-emerald-500/30 bg-emerald-950/15 text-emerald-300'
                        : isAtual
                        ? 'border-rose-500/35 bg-rose-950/20 text-rose-200'
                        : 'border-white/5 bg-black/30 text-zinc-500 opacity-75'
                    }`}
                  >
                    <div className="flex items-center justify-center h-8 w-8 rounded-full border border-current/30 bg-black/40">
                      {resolvido ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                      ) : isAtual && liberadoEfetivo ? (
                        <KeyRound className="h-4 w-4 text-rose-300 animate-pulse" />
                      ) : isAtual && !liberadoEfetivo ? (
                        <Clock className="h-4 w-4 text-amber-300/90" />
                      ) : (
                        <Lock className="h-4 w-4 text-zinc-500" />
                      )}
                    </div>
                    <div className="text-center">
                      <span className="block font-mono text-[10px] uppercase tracking-widest">
                        Enigma {ALGARISMOS_ROMANOS[idx] || enigma.ordem}
                      </span>
                      <span className="hidden sm:block text-[10px] opacity-75 mt-0.5">
                        {resolvido
                          ? 'Resolvido'
                          : isAtual && liberadoEfetivo
                          ? 'Disponível'
                          : isAtual
                          ? 'Em breve'
                          : 'Trancado'}
                      </span>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        </section>

        {/* Aviso caso tente clicar em um cadeado bloqueado */}
        {avisoBloqueio && (
          <div className="rounded-xl border border-rose-500/30 bg-rose-950/25 px-4 py-3 text-xs sm:text-sm text-rose-200 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <Lock className="h-4 w-4 text-rose-400 shrink-0" />
              <span>{avisoBloqueio}</span>
            </div>
            <button
              type="button"
              onClick={() => setAvisoBloqueio(null)}
              className="text-xs font-mono text-rose-300 hover:underline"
            >
              Entendi
            </button>
          </div>
        )}

        {/* Destaque de Status Atual (Resolvidos vs Próximo a Resolver) */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-2xl border border-white/10 bg-[#121016]/80 p-5 flex items-center justify-between">
            <div className="space-y-1">
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-emerald-400/90">
                Enigmas Concluídos
              </span>
              <h2 className="font-serif text-xl font-semibold text-zinc-100">
                {totalResolvidos === 0
                  ? 'Nenhum enigma decifrado ainda'
                  : totalResolvidos === 1
                  ? '1 enigma já foi decifrado'
                  : `${totalResolvidos} enigmas já foram decifrados`}
              </h2>
              <p className="text-xs text-zinc-400">
                {totalResolvidos === 0
                  ? 'Assim que o primeiro mistério for liberado e resolvido, ele ficará registrado aqui.'
                  : 'Você pode clicar em qualquer arquivo resolvido para reler a mensagem secreta.'}
              </p>
            </div>
            <div className="h-11 w-11 rounded-xl border border-emerald-500/25 bg-emerald-500/10 flex items-center justify-center text-emerald-300 shrink-0">
              <Unlock className="h-5 w-5" />
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#121016]/80 p-5 flex items-center justify-between">
            <div className="space-y-1">
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-rose-300/90">
                Próximo a Ser Resolvido
              </span>
              <h2 className="font-serif text-xl font-semibold text-zinc-100">
                {proximoEnigma
                  ? proximoEnigma.titulo
                  : 'Todos os 5 Enigmas Concluídos!'}
              </h2>
              <p className="text-xs text-zinc-400">
                {!proximoEnigma
                  ? 'Você abriu todos os cadeados deste dossiê!'
                  : proximoEnigma.liberado || modoSimulacao
                  ? 'Cadeado disponível para tentativa — clique no arquivo abaixo para decifrar.'
                  : 'Este enigma ainda está a definir e será liberado em breve.'}
              </p>
            </div>
            <div className="h-11 w-11 rounded-xl border border-rose-500/25 bg-rose-500/10 flex items-center justify-center text-rose-300 shrink-0">
              <FileLock2 className="h-5 w-5" />
            </div>
          </div>
        </section>

        {/* Lista dos 5 Enigmas com Cadeados */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-serif text-2xl font-semibold text-zinc-100">
                Arquivos do Dossiê (1 a 5)
              </h2>
              <p className="text-xs text-zinc-400">
                Cada cadeado depende da resolução do enigma anterior
              </p>
            </div>
            <span className="font-mono text-[11px] text-zinc-500">
              Ordem Sequencial Obrigatória
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {enigmas.map((enigma, index) => {
              const prog = progresso[enigma.ordem]
              const resolvido = Boolean(prog?.resolvido)
              const anteriorResolvido =
                enigma.ordem === 1 ||
                Boolean(progresso[enigma.ordem - 1]?.resolvido)
              const liberadoEfetivo = enigma.liberado || modoSimulacao
              const trancadoPorSequencia = !resolvido && !anteriorResolvido
              const aguardandoLiberacao =
                !resolvido && anteriorResolvido && !liberadoEfetivo
              const disponivelAgora =
                !resolvido && anteriorResolvido && liberadoEfetivo

              return (
                <div
                  key={enigma.ordem}
                  onClick={() => handleClickEnigma(enigma)}
                  className={`group relative cursor-pointer rounded-2xl border p-6 transition-all duration-300 flex flex-col justify-between ${
                    cardShakeId === enigma.ordem ? 'animate-shake' : ''
                  } ${
                    resolvido
                      ? 'border-emerald-500/30 bg-gradient-to-b from-emerald-950/20 to-[#121016]/90 hover:border-emerald-400/50'
                      : disponivelAgora
                      ? 'border-rose-500/40 bg-gradient-to-b from-rose-950/25 to-[#121016]/95 hover:border-rose-400/70 shadow-lg shadow-rose-950/25'
                      : aguardandoLiberacao
                      ? 'border-amber-500/25 bg-gradient-to-b from-amber-950/15 to-[#121016]/90 hover:border-amber-400/40'
                      : 'border-white/10 bg-[#121016]/60 opacity-75 hover:opacity-95 hover:border-white/20'
                  }`}
                >
                  <div>
                    {/* Topo do Card: Número Romano + Cadeado */}
                    <div className="flex items-center justify-between gap-3 mb-4">
                      <div className="flex items-center gap-2.5">
                        <span
                          className={`flex h-8 w-8 items-center justify-center rounded-lg font-serif text-sm font-semibold border ${
                            resolvido
                              ? 'border-emerald-500/30 bg-emerald-500/15 text-emerald-300'
                              : disponivelAgora
                              ? 'border-rose-500/30 bg-rose-500/15 text-rose-200'
                              : aguardandoLiberacao
                              ? 'border-amber-500/30 bg-amber-500/10 text-amber-200'
                              : 'border-white/10 bg-black/50 text-zinc-500'
                          }`}
                        >
                          {ALGARISMOS_ROMANOS[index] || enigma.ordem}
                        </span>
                        <div>
                          <span className="block font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-400">
                            {enigma.codigo}
                          </span>
                          <span className="block font-mono text-[10px] text-zinc-500">
                            {enigma.subtitulo}
                          </span>
                        </div>
                      </div>

                      {/* Ícone de Status / Cadeado */}
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-xl border transition-transform group-hover:scale-105 ${
                          resolvido
                            ? 'border-emerald-500/30 bg-emerald-500/15 text-emerald-300'
                            : disponivelAgora
                            ? 'border-rose-500/35 bg-rose-500/15 text-rose-300'
                            : aguardandoLiberacao
                            ? 'border-amber-500/30 bg-amber-500/10 text-amber-300'
                            : 'border-white/10 bg-black/50 text-zinc-500'
                        }`}
                      >
                        {resolvido ? (
                          <Unlock className="h-4 w-4" />
                        ) : disponivelAgora ? (
                          <KeyRound className="h-4 w-4 animate-pulse" />
                        ) : aguardandoLiberacao ? (
                          <Clock className="h-4 w-4" />
                        ) : (
                          <Lock className="h-4 w-4" />
                        )}
                      </div>
                    </div>

                    {/* Título e Resumo */}
                    <h3 className="font-serif text-xl font-semibold text-zinc-100 mb-2">
                      {enigma.titulo}
                    </h3>

                    <p className="text-xs text-zinc-400 leading-relaxed line-clamp-3">
                      {trancadoPorSequencia
                        ? `Arquivo confidencial protegido por cadeado. Desvende o Enigma ${
                            ALGARISMOS_ROMANOS[index - 1] || enigma.ordem - 1
                          } para liberar o acesso a esta pista.`
                        : aguardandoLiberacao
                        ? 'Enigma a definir — este arquivo confidencial ainda não foi liberado para investigação.'
                        : enigma.descricao}
                    </p>
                  </div>

                  {/* Rodapé do Card */}
                  <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs">
                    {resolvido ? (
                      <>
                        <span className="inline-flex items-center gap-1.5 font-mono text-[11px] text-emerald-300">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Resolvido
                        </span>
                        <span className="inline-flex items-center gap-1 font-mono text-[11px] text-zinc-400 group-hover:text-zinc-200">
                          Ver segredo
                          <ChevronRight className="h-3.5 w-3.5" />
                        </span>
                      </>
                    ) : disponivelAgora ? (
                      <>
                        <span className="inline-flex items-center gap-1.5 font-mono text-[11px] text-rose-300">
                          <span className="h-1.5 w-1.5 rounded-full bg-rose-400 animate-ping" />
                          Pronto para resolver
                        </span>
                        <span className="inline-flex items-center gap-1 font-mono text-[11px] text-rose-200">
                          Abrir pista
                          <ChevronRight className="h-3.5 w-3.5" />
                        </span>
                      </>
                    ) : aguardandoLiberacao ? (
                      <>
                        <span className="inline-flex items-center gap-1.5 font-mono text-[11px] text-amber-300/90">
                          <Clock className="h-3.5 w-3.5" />
                          A Definir • Em Breve
                        </span>
                        <span className="font-mono text-[11px] text-zinc-500">
                          Aguardando
                        </span>
                      </>
                    ) : (
                      <>
                        <span className="inline-flex items-center gap-1.5 font-mono text-[11px] text-zinc-500">
                          <Lock className="h-3.5 w-3.5" />
                          Cadeado Fechado
                        </span>
                        <span className="font-mono text-[10px] text-zinc-600">
                          Requer #{enigma.ordem - 1}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        {/* Rodapé discreto com botão para o Criador / Banco Supabase */}
        <footer className="pt-10 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
          <div className="flex items-center gap-2">
            <Heart className="h-3.5 w-3.5 text-rose-500/60 fill-rose-500/20" />
            <span>Feito especialmente para Júlia • Dossiê Confidencial</span>
          </div>

          <button
            type="button"
            onClick={() => setModalBancoAberto(true)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-white/5 bg-white/[0.02] px-3 py-1.5 font-mono text-[11px] text-zinc-500 hover:border-white/15 hover:text-zinc-300 transition-colors"
          >
            <Settings className="h-3.5 w-3.5" />
            <span>Configurar Banco / Modo Criador</span>
          </button>
        </footer>
      </main>

      {/* Modal de Resolução / Detalhes do Enigma */}
      <EnigmaModal
        enigma={enigmaSelecionado}
        progresso={
          enigmaSelecionado ? progresso[enigmaSelecionado.ordem] : undefined
        }
        liberadoEfetivo={
          Boolean(enigmaSelecionado?.liberado) || modoSimulacao
        }
        onClose={() => setEnigmaSelecionado(null)}
        onSubmitAnswer={handleResponderEnigma}
      />

      {/* Modal de Configuração do Banco Supabase e Simulação */}
      <DatabaseSetupModal
        aberto={modalBancoAberto}
        onClose={() => setModalBancoAberto(false)}
        status={statusSync}
        modoSimulacao={modoSimulacao}
        onToggleModoSimulacao={handleToggleSimulacao}
        onResetarProgressoTeste={handleResetarProgressoTeste}
      />
    </div>
  )
}

