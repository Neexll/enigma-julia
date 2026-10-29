export interface EnigmaItem {
  id: number
  ordem: number
  codigo: string
  titulo: string
  subtitulo: string
  descricao: string
  dica: string
  resposta_correta: string
  recompensa: string
  liberado: boolean
}

export interface ProgressoItem {
  ordem: number
  resolvido: boolean
  resposta_enviada?: string | null
  tentativas: number
  resolvido_em?: string | null
}

/**
 * CONFIGURAÇÃO PRINCIPAL DE ACESSO E ENIGMAS
 * -----------------------------------------
 * Senha oficial do login: "euteamo" (aceita "euteamo" ou "eu te amo", sem diferenciar maiúsculas).
 * Os 5 enigmas estão configurados inicialmente com `liberado: false` (A Definir / Em Breve).
 * Quando quiser liberar um enigma, mude `liberado: true` aqui ou direto na tabela `public.enigmas` do Supabase!
 */
export const LOGIN_CONFIG = {
  emailInterno: 'julia@enigma.love',
  senhaCorreta: 'euteamo',
  dicaPrincipal:
    'Três palavras juntas, sete letras no total. É o que eu sinto por você todos os dias — e nunca me canso de dizer.',
  dicaExtra: 'Começa com "eu", termina com "amo", tudo junto e sem espaços.',
}

export const ENIGMAS_PADRAO: EnigmaItem[] = [
  {
    id: 1,
    ordem: 1,
    codigo: 'ARQUIVO #01',
    titulo: 'Enigma I — O Primeiro Vestígio',
    subtitulo: 'Capítulo I • A Definir',
    descricao:
      'Este arquivo confidencial ainda está sendo preparado nos mínimos detalhes. Quando o momento chegar, a primeira pista da nossa história será revelada aqui.',
    dica: 'Em breve uma dica especial estará disponível neste arquivo.',
    resposta_correta: 'definir1',
    recompensa:
      'Você abriu o primeiro selo! A próxima parte do nosso mistério acaba de ser destrancada.',
    liberado: false,
  },
  {
    id: 2,
    ordem: 2,
    codigo: 'ARQUIVO #02',
    titulo: 'Enigma II — Coordenadas Ocultas',
    subtitulo: 'Capítulo II • A Definir',
    descricao:
      'Um lugar guardado na memória e marcado no tempo. Desvende o Enigma I e aguarde a liberação para abrir este segundo cadeado.',
    dica: 'Pista em preparação.',
    resposta_correta: 'definir2',
    recompensa:
      'Coordenadas confirmadas. Você sempre soube exatamente onde me encontrar.',
    liberado: false,
  },
  {
    id: 3,
    ordem: 3,
    codigo: 'ARQUIVO #03',
    titulo: 'Enigma III — Entre Linhas e Silêncios',
    subtitulo: 'Capítulo III • A Definir',
    descricao:
      'Há detalhes que passam despercebidos para o mundo inteiro, menos para nós dois. Resolva o arquivo anterior para acessar esta investigação.',
    dica: 'Pista em preparação.',
    resposta_correta: 'definir3',
    recompensa:
      'Terceiro cadeado aberto. Cada resposta sua nos aproxima do segredo final.',
    liberado: false,
  },
  {
    id: 4,
    ordem: 4,
    codigo: 'ARQUIVO #04',
    titulo: 'Enigma IV — O Código do Tempo',
    subtitulo: 'Capítulo IV • A Definir',
    descricao:
      'Um instante que mudou tudo. Este envelope permanece lacrado até que o terceiro mistério seja solucionado.',
    dica: 'Pista em preparação.',
    resposta_correta: 'definir4',
    recompensa:
      'Penúltimo selo rompido. Falta apenas uma última chave.',
    liberado: false,
  },
  {
    id: 5,
    ordem: 5,
    codigo: 'ARQUIVO #05',
    titulo: 'Enigma V — A Revelação Final',
    subtitulo: 'Capítulo V • A Definir',
    descricao:
      'O último cadeado guarda a conclusão deste dossiê. Apenas quem desvendou os quatro mistérios anteriores poderá ler estas linhas.',
    dica: 'Pista em preparação.',
    resposta_correta: 'definir5',
    recompensa:
      'Todos os 5 enigmas foram decifrados! Agora olhe para mim...',
    liberado: false,
  },
]

export function normalizarTexto(valor: string): string {
  return valor
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .trim()
}

