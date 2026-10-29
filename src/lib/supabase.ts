import { createClient } from '@supabase/supabase-js'
import {
  ENIGMAS_PADRAO,
  EnigmaItem,
  LOGIN_CONFIG,
  ProgressoItem,
  normalizarTexto,
} from '../data/enigmasConfig'

const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL ||
  'https://rnokypmklpzyrllwskvv.supabase.co'
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJub2t5cG1rbHB6eXJsbHdza3Z2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTMyOTQxMDEsImV4cCI6MjEwODg3MDEwMX0.usYhxn7sdaG1RPF-XRlRYL17KYH-Z8xh_29NcXcvhsk'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    storageKey: 'dossie_julia_supabase_auth',
  },
})

const LOCAL_AUTH_KEY = 'dossie_julia_auth_session_v1'
const LOCAL_PROGRESS_KEY = 'dossie_julia_progress_v1'
const LOCAL_PREVIEW_RELEASE_KEY = 'dossie_julia_preview_release_v1'

export interface SyncStatus {
  supabaseAuthAtivo: boolean
  tabelaBancoAtiva: boolean
  mensagem: string
}

/**
 * Carrega o progresso salvo localmente (backup / cache instantâneo)
 */
export function carregarProgressoLocal(): Record<number, ProgressoItem> {
  try {
    const raw = localStorage.getItem(LOCAL_PROGRESS_KEY)
    if (!raw) return {}
    return JSON.parse(raw)
  } catch {
    return {}
  }
}

export function salvarProgressoLocal(mapa: Record<number, ProgressoItem>) {
  try {
    localStorage.setItem(LOCAL_PROGRESS_KEY, JSON.stringify(mapa))
  } catch {
    // ignore storage errors
  }
}

export function lerModoSimulacaoLiberado(): boolean {
  try {
    return localStorage.getItem(LOCAL_PREVIEW_RELEASE_KEY) === 'true'
  } catch {
    return false
  }
}

export function alterarModoSimulacaoLiberado(ativo: boolean) {
  try {
    localStorage.setItem(LOCAL_PREVIEW_RELEASE_KEY, ativo ? 'true' : 'false')
  } catch {
    // ignore
  }
}

/**
 * Verifica se a Julia já está autenticada (via Supabase Auth ou sessão persistida)
 */
export async function verificarSessaoAtiva(): Promise<boolean> {
  try {
    const { data } = await supabase.auth.getSession()
    if (data.session) {
      localStorage.setItem(LOCAL_AUTH_KEY, 'authenticated')
      return true
    }
  } catch {
    // fallback to local session check
  }
  return localStorage.getItem(LOCAL_AUTH_KEY) === 'authenticated'
}

/**
 * Realiza o login validando a senha secreta ("euteamo") e autenticando no Supabase Auth.
 * Nunca reseta o progresso existente no banco ou localmente.
 */
export async function realizarLoginJulia(
  senhaDigitada: string
): Promise<{ sucesso: boolean; erro?: string; viaSupabaseAuth?: boolean }> {
  const senhaLimpa = normalizarTexto(senhaDigitada)
  const senhaEsperada = normalizarTexto(LOGIN_CONFIG.senhaCorreta)

  if (senhaLimpa !== senhaEsperada) {
    return {
      sucesso: false,
      erro: 'Acesso negado. Leia a pista com carinho e tente novamente.',
    }
  }

  // Tenta autenticar no Supabase Auth com o usuário julia@enigma.love
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: LOGIN_CONFIG.emailInterno,
      password: LOGIN_CONFIG.senhaCorreta,
    })

    if (!error && data.session) {
      localStorage.setItem(LOCAL_AUTH_KEY, 'authenticated')
      return { sucesso: true, viaSupabaseAuth: true }
    }
  } catch {
    // Se o SQL de criação do usuário ainda não foi executado no Supabase Dashboard,
    // liberamos a sessão autenticada mantendo toda a persistência!
  }

  localStorage.setItem(LOCAL_AUTH_KEY, 'authenticated')
  return { sucesso: true, viaSupabaseAuth: false }
}

/**
 * Encerra apenas a sessão de login sem apagar o progresso dos enigmas!
 */
export async function realizarLogoutJulia(): Promise<void> {
  localStorage.removeItem(LOCAL_AUTH_KEY)
  try {
    await supabase.auth.signOut()
  } catch {
    // ignore
  }
}

/**
 * Busca os 5 enigmas e o progresso da Julia direto do Supabase (com merge seguro com o cache local)
 */
export async function carregarDadosDashboard(): Promise<{
  enigmas: EnigmaItem[]
  progresso: Record<number, ProgressoItem>
  status: SyncStatus
}> {
  const progressoLocal = carregarProgressoLocal()
  let enigmas = [...ENIGMAS_PADRAO]
  let tabelaBancoAtiva = false
  let supabaseAuthAtivo = false

  try {
    const { data: sessionData } = await supabase.auth.getSession()
    supabaseAuthAtivo = Boolean(sessionData.session)

    // 1. Busca os enigmas cadastrados no banco public.enigmas
    const { data: enigmasDb, error: errEnigmas } = await supabase
      .from('enigmas')
      .select(
        'id, ordem, codigo, titulo, subtitulo, descricao, dica, resposta_correta, recompensa, liberado'
      )
      .order('ordem', { ascending: true })

    if (!errEnigmas && enigmasDb && enigmasDb.length > 0) {
      tabelaBancoAtiva = true
      enigmas = enigmasDb.map((row) => ({
        id: Number(row.id),
        ordem: Number(row.ordem),
        codigo: row.codigo,
        titulo: row.titulo,
        subtitulo: row.subtitulo,
        descricao: row.descricao,
        dica: row.dica,
        resposta_correta: row.resposta_correta,
        recompensa: row.recompensa,
        liberado: Boolean(row.liberado),
      }))
    }

    // 2. Busca o progresso salvo no banco public.progresso_julia
    const { data: progDb, error: errProg } = await supabase
      .from('progresso_julia')
      .select('ordem, resolvido, resposta_enviada, tentativas, resolvido_em')
      .order('ordem', { ascending: true })

    if (!errProg && progDb) {
      tabelaBancoAtiva = true
      for (const row of progDb) {
        const ordem = Number(row.ordem)
        const existente = progressoLocal[ordem]
        progressoLocal[ordem] = {
          ordem,
          resolvido: Boolean(row.resolvido) || Boolean(existente?.resolvido),
          resposta_enviada:
            row.resposta_enviada || existente?.resposta_enviada || null,
          tentativas: Math.max(
            Number(row.tentativas || 0),
            Number(existente?.tentativas || 0)
          ),
          resolvido_em: row.resolvido_em || existente?.resolvido_em || null,
        }
      }
      salvarProgressoLocal(progressoLocal)
    }
  } catch {
    // Usa fallback local de forma transparente
  }

  return {
    enigmas,
    progresso: progressoLocal,
    status: {
      supabaseAuthAtivo,
      tabelaBancoAtiva,
      mensagem: tabelaBancoAtiva
        ? 'Sincronizado com Supabase (rnokypmklpzyrllwskvv)'
        : 'Aguardando execução do SQL no Supabase (progresso salvo no dispositivo)',
    },
  }
}

/**
 * Verifica a resposta de um enigma e salva o desbloqueio no Supabase + LocalStorage
 */
export async function submeterRespostaEnigma(
  enigma: EnigmaItem,
  tentativa: string,
  progressoAtual: Record<number, ProgressoItem>
): Promise<{
  acertou: boolean
  mensagem: string
  progressoAtualizado: Record<number, ProgressoItem>
}> {
  // Garante que o enigma anterior foi resolvido
  if (enigma.ordem > 1 && !progressoAtual[enigma.ordem - 1]?.resolvido) {
    return {
      acertou: false,
      mensagem: `O cadeado anterior (Enigma ${enigma.ordem - 1}) ainda precisa ser resolvido primeiro.`,
      progressoAtualizado: progressoAtual,
    }
  }

  const tentativaNorm = normalizarTexto(tentativa)
  const respostaNorm = normalizarTexto(enigma.resposta_correta)

  if (!tentativaNorm) {
    return {
      acertou: false,
      mensagem: 'Digite uma resposta antes de tentar abrir o cadeado.',
      progressoAtualizado: progressoAtual,
    }
  }

  let acertou = tentativaNorm === respostaNorm
  let recompensaTexto = enigma.recompensa

  // Tenta validar e persistir via RPC no Supabase
  try {
    const { data: rpcData, error: rpcError } = await supabase.rpc(
      'verificar_resposta_enigma',
      {
        p_ordem: enigma.ordem,
        p_tentativa: tentativa.trim(),
      }
    )

    if (!rpcError && rpcData) {
      acertou = Boolean(rpcData.sucesso)
      if (rpcData.recompensa) {
        recompensaTexto = rpcData.recompensa
      }
    } else {
      // Fallback: tenta upsert direto na tabela progresso_julia
      const { data: sessionData } = await supabase.auth.getSession()
      const itemAnterior = progressoAtual[enigma.ordem]
      await supabase.from('progresso_julia').upsert(
        {
          perfil_chave: 'julia',
          user_id: sessionData.session?.user?.id || null,
          enigma_id: enigma.id,
          ordem: enigma.ordem,
          resolvido: acertou || Boolean(itemAnterior?.resolvido),
          resposta_enviada: acertou
            ? tentativa.trim()
            : itemAnterior?.resposta_enviada || null,
          tentativas: (itemAnterior?.tentativas || 0) + 1,
          resolvido_em: acertou
            ? new Date().toISOString()
            : itemAnterior?.resolvido_em || null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'perfil_chave,ordem' }
      )
    }
  } catch {
    // Segue salvando localmente se offline ou antes de rodar o SQL
  }

  const itemAtual = progressoAtual[enigma.ordem]
  const novoItem: ProgressoItem = {
    ordem: enigma.ordem,
    resolvido: acertou || Boolean(itemAtual?.resolvido),
    resposta_enviada: acertou
      ? tentativa.trim()
      : itemAtual?.resposta_enviada || null,
    tentativas: (itemAtual?.tentativas || 0) + 1,
    resolvido_em:
      acertou && !itemAtual?.resolvido_em
        ? new Date().toISOString()
        : itemAtual?.resolvido_em || null,
  }

  const novoMapa: Record<number, ProgressoItem> = {
    ...progressoAtual,
    [enigma.ordem]: novoItem,
  }

  salvarProgressoLocal(novoMapa)

  return {
    acertou,
    mensagem: acertou
      ? recompensaTexto
      : 'Resposta incorreta. O cadeado permanece fechado... observe cada detalhe da pista.',
    progressoAtualizado: novoMapa,
  }
}
