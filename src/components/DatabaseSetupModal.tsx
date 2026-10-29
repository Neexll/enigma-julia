import React, { useState } from 'react'
import {
  X,
  Database,
  Copy,
  Check,
  ExternalLink,
  FlaskConical,
  RotateCcw,
  Shield,
} from 'lucide-react'
import { SyncStatus } from '../lib/supabase'
import sqlSchemaRaw from '../../supabase/schema.sql?raw'

interface DatabaseSetupModalProps {
  aberto: boolean
  onClose: () => void
  status: SyncStatus
  modoSimulacao: boolean
  onToggleModoSimulacao: (ativo: boolean) => void
  onResetarProgressoTeste: () => void
}

export const DatabaseSetupModal: React.FC<DatabaseSetupModalProps> = ({
  aberto,
  onClose,
  status,
  modoSimulacao,
  onToggleModoSimulacao,
  onResetarProgressoTeste,
}) => {
  const [copiado, setCopiado] = useState(false)

  if (!aberto) return null

  const copiarSql = async () => {
    try {
      await navigator.clipboard.writeText(sqlSchemaRaw)
      setCopiado(true)
      setTimeout(() => setCopiado(false), 2500)
    } catch {
      // ignore
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-white/15 bg-[#121016] p-6 sm:p-8 shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-rose-500/15 border border-rose-500/30 p-2.5 text-rose-300">
              <Database className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-serif text-2xl font-semibold text-zinc-100">
                Painel do Criador & Banco Supabase
              </h3>
              <p className="text-xs text-zinc-400">
                Projeto conectado:{' '}
                <span className="font-mono text-rose-300">
                  rnokypmklpzyrllwskvv
                </span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-zinc-400 hover:bg-white/5 hover:text-zinc-200 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-5 space-y-5">
          {/* Status da Conexão */}
          <div className="rounded-xl border border-white/10 bg-black/40 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span
                className={`h-2.5 w-2.5 rounded-full shrink-0 ${
                  status.tabelaBancoAtiva ? 'bg-emerald-400' : 'bg-amber-400'
                }`}
              />
              <div>
                <p className="text-xs font-medium text-zinc-200">
                  {status.tabelaBancoAtiva
                    ? 'Tabelas public.enigmas e public.progresso_julia ativas no Supabase!'
                    : 'Tabelas aguardando criação no SQL Editor do Supabase'}
                </p>
                <p className="text-[11px] text-zinc-400 mt-0.5">
                  {status.mensagem}
                </p>
              </div>
            </div>
            <a
              href="https://supabase.com/dashboard/project/rnokypmklpzyrllwskvv/sql/new"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs font-medium text-rose-200 hover:bg-rose-500/20 transition-colors shrink-0"
            >
              <span>Abrir SQL Editor</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>

          {/* Modo Simulação para o Criador testar os cadeados */}
          <div className="rounded-xl border border-rose-500/20 bg-rose-950/10 p-4 space-y-3">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2.5">
                <FlaskConical className="h-4 w-4 text-rose-300" />
                <div>
                  <h4 className="text-sm font-medium text-zinc-100">
                    Modo Teste: Simular os 5 Enigmas Liberados
                  </h4>
                  <p className="text-xs text-zinc-400">
                    Por padrão, os 5 enigmas estão como{' '}
                    <span className="text-rose-300 font-mono">
                      A Definir (Bloqueados)
                    </span>
                    . Ative abaixo se quiser testar a abertura dos cadeados agora
                    (respostas de teste:{' '}
                    <span className="font-mono text-zinc-200">
                      definir1 .. definir5
                    </span>
                    ).
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => onToggleModoSimulacao(!modoSimulacao)}
                className={`px-3.5 py-2 rounded-lg text-xs font-mono uppercase tracking-wider transition-all shrink-0 ${
                  modoSimulacao
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : 'bg-white/5 text-zinc-300 border border-white/10 hover:bg-white/10'
                }`}
              >
                {modoSimulacao ? 'Simulação Ativa' : 'Ativar Simulação'}
              </button>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-white/5 text-xs text-zinc-400">
              <span>
                Deseja zerar o progresso de teste antes de entregar para a Júlia?
              </span>
              <button
                type="button"
                onClick={onResetarProgressoTeste}
                className="inline-flex items-center gap-1.5 text-rose-300 hover:text-rose-200 font-mono text-[11px]"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Resetar Progresso de Teste
              </button>
            </div>
          </div>

          {/* Script SQL com Boas Práticas Postgres / Supabase */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-zinc-300 font-medium">
                <Shield className="h-4 w-4 text-rose-400" />
                <span>
                  Script SQL Otimizado (RLS + Índices + Auth + 5 Enigmas)
                </span>
              </div>
              <button
                type="button"
                onClick={copiarSql}
                className="inline-flex items-center gap-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 px-3 py-1.5 text-xs font-medium text-white transition-colors"
              >
                {copiado ? (
                  <>
                    <Check className="h-3.5 w-3.5" />
                    <span>SQL Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    <span>Copiar SQL Completo</span>
                  </>
                )}
              </button>
            </div>

            <pre className="max-h-56 overflow-y-auto rounded-xl border border-white/10 bg-black/70 p-3.5 font-mono text-[11px] text-zinc-300 leading-relaxed">
              {sqlSchemaRaw}
            </pre>
          </div>
        </div>
      </div>
    </div>
  )
}

