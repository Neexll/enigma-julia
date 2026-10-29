-- =============================================================================
-- DOSSIÊ JULIA — SCHEMA SUPABASE & POSTGRES BEST PRACTICES
-- Projeto: rnokypmklpzyrllwskvv
-- =============================================================================
-- Como usar:
-- 1. Acesse: https://supabase.com/dashboard/project/rnokypmklpzyrllwskvv/sql/new
-- 2. Cole todo este conteúdo e clique em "Run"
-- =============================================================================

create extension if not exists pgcrypto;

-- -----------------------------------------------------------------------------
-- 1. TABELA DE ENIGMAS (public.enigmas)
-- -----------------------------------------------------------------------------
-- Boas práticas aplicadas (supabase-postgres-best-practices):
-- - PK sequencial SQL-standard: bigint generated always as identity
-- - Tipos otimizados: smallint, text, boolean, timestamptz
-- - Identificadores em snake_case minúsculo e constraints explícitas
create table if not exists public.enigmas (
  id bigint generated always as identity primary key,
  ordem smallint not null unique check (ordem between 1 and 5),
  codigo text not null unique,
  titulo text not null,
  subtitulo text not null,
  descricao text not null,
  dica text not null,
  resposta_correta text not null,
  recompensa text not null,
  liberado boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Índice composto para ordenação e filtragem rápida no dashboard
create index if not exists enigmas_ordem_liberado_idx
  on public.enigmas (ordem asc, liberado);

-- -----------------------------------------------------------------------------
-- 2. TABELA DE PROGRESSO (public.progresso_julia)
-- -----------------------------------------------------------------------------
create table if not exists public.progresso_julia (
  id bigint generated always as identity primary key,
  perfil_chave text not null default 'julia' check (perfil_chave = 'julia'),
  user_id uuid references auth.users(id) on delete set null default auth.uid(),
  enigma_id bigint not null references public.enigmas(id) on delete cascade,
  ordem smallint not null check (ordem between 1 and 5),
  resolvido boolean not null default false,
  resposta_enviada text,
  tentativas integer not null default 0 check (tentativas >= 0),
  resolvido_em timestamptz,
  updated_at timestamptz not null default now(),
  constraint progresso_julia_perfil_ordem_unique unique (perfil_chave, ordem)
);

-- Índices em chaves estrangeiras e colunas usadas em políticas RLS
create index if not exists progresso_julia_user_id_idx
  on public.progresso_julia (user_id);

create index if not exists progresso_julia_enigma_id_idx
  on public.progresso_julia (enigma_id);

-- Índice parcial para busca instantânea dos enigmas já concluídos
create index if not exists progresso_julia_resolvidos_idx
  on public.progresso_julia (perfil_chave, ordem)
  where resolvido = true;

-- -----------------------------------------------------------------------------
-- 3. ROW LEVEL SECURITY (RLS) E PERMISSÕES DA DATA API
-- -----------------------------------------------------------------------------
alter table public.enigmas enable row level security;
alter table public.progresso_julia enable row level security;

-- Garantir acesso explícito via Data API (PostgREST)
grant usage on schema public to anon, authenticated;
grant select on public.enigmas to anon, authenticated;
grant select, insert, update on public.progresso_julia to anon, authenticated;

-- Políticas de RLS para public.enigmas
drop policy if exists "enigmas_select_policy" on public.enigmas;
create policy "enigmas_select_policy"
  on public.enigmas
  for select
  to anon, authenticated
  using (true);

-- Políticas de RLS para public.progresso_julia
-- Usa (select auth.uid()) para avaliar uma única vez por query (InitPlan)
drop policy if exists "progresso_select_julia" on public.progresso_julia;
create policy "progresso_select_julia"
  on public.progresso_julia
  for select
  to anon, authenticated
  using (
    perfil_chave = 'julia'
    and (user_id is null or (select auth.uid()) is null or (select auth.uid()) = user_id)
  );

drop policy if exists "progresso_insert_julia" on public.progresso_julia;
create policy "progresso_insert_julia"
  on public.progresso_julia
  for insert
  to anon, authenticated
  with check (
    perfil_chave = 'julia'
    and (user_id is null or (select auth.uid()) = user_id)
  );

drop policy if exists "progresso_update_julia" on public.progresso_julia;
create policy "progresso_update_julia"
  on public.progresso_julia
  for update
  to anon, authenticated
  using (
    perfil_chave = 'julia'
    and (user_id is null or (select auth.uid()) is null or (select auth.uid()) = user_id)
  )
  with check (
    perfil_chave = 'julia'
  );

-- -----------------------------------------------------------------------------
-- 4. CRIAR CONTA DE ACESSO DA JULIA NO SUPABASE AUTH (SENHA: euteamo)
-- -----------------------------------------------------------------------------
do $$
declare
  v_user_id uuid := '00000000-0000-0000-0000-000000000001';
begin
  if not exists (select 1 from auth.users where email = 'julia@enigma.love') then
    insert into auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      confirmation_token,
      email_change,
      email_change_token_new,
      recovery_token
    ) values (
      '00000000-0000-0000-0000-000000000000',
      v_user_id,
      'authenticated',
      'authenticated',
      'julia@enigma.love',
      crypt('euteamo', gen_salt('bf')),
      now(),
      '{"provider":"email","providers":["email"],"role":"player"}'::jsonb,
      '{"nome":"Júlia"}'::jsonb,
      now(),
      now(),
      '',
      '',
      '',
      ''
    );

    insert into auth.identities (
      id,
      user_id,
      provider_id,
      identity_data,
      provider,
      last_sign_in_at,
      created_at,
      updated_at
    ) values (
      gen_random_uuid(),
      v_user_id,
      v_user_id::text,
      format('{"sub":"%s","email":"julia@enigma.love"}', v_user_id::text)::jsonb,
      'email',
      now(),
      now(),
      now()
    );
  end if;
exception
  when others then
    raise notice 'Aviso: Conta auth.users será criada automaticamente ou via painel (%).', sqlerrm;
end $$;

-- -----------------------------------------------------------------------------
-- 5. SEED DOS 5 ENIGMAS (INICIALMENTE BLOQUEADOS / A DEFINIR)
-- -----------------------------------------------------------------------------
-- Quando quiser liberar um enigma para a Julia, basta mudar `liberado` para `true`
-- e preencher `descricao`, `dica`, `resposta_correta` e `recompensa`!
insert into public.enigmas (ordem, codigo, titulo, subtitulo, descricao, dica, resposta_correta, recompensa, liberado)
values
  (
    1,
    'ARQUIVO #01',
    'Enigma I — O Primeiro Vestígio',
    'Capítulo I • A Definir',
    'Este arquivo confidencial ainda está sendo preparado nos mínimos detalhes. Quando o momento chegar, a primeira pista da nossa história será revelada aqui.',
    'Em breve uma dica especial estará disponível neste arquivo.',
    'definir1',
    'Você abriu o primeiro selo! A próxima parte do nosso mistério acaba de ser destrancada.',
    false
  ),
  (
    2,
    'ARQUIVO #02',
    'Enigma II — Coordenadas Ocultas',
    'Capítulo II • A Definir',
    'Um lugar guardado na memória e marcado no tempo. Desvende o Enigma I e aguarde a liberação para abrir este segundo cadeado.',
    'Pista em preparação.',
    'definir2',
    'Coordenadas confirmadas. Você sempre soube exatamente onde me encontrar.',
    false
  ),
  (
    3,
    'ARQUIVO #03',
    'Enigma III — Entre Linhas e Silêncios',
    'Capítulo III • A Definir',
    'Há detalhes que passam despercebidos para o mundo inteiro, menos para nós dois. Resolva o arquivo anterior para acessar esta investigação.',
    'Pista em preparação.',
    'definir3',
    'Terceiro cadeado aberto. Cada resposta sua nos aproxima do segredo final.',
    false
  ),
  (
    4,
    'ARQUIVO #04',
    'Enigma IV — O Código do Tempo',
    'Capítulo IV • A Definir',
    'Um instante que mudou tudo. Este envelope permanece lacrado até que o terceiro mistério seja solucionado.',
    'Pista em preparação.',
    'definir4',
    'Penúltimo selo rompido. Falta apenas uma última chave.',
    false
  ),
  (
    5,
    'ARQUIVO #05',
    'Enigma V — A Revelação Final',
    'Capítulo V • A Definir',
    'O último cadeado guarda a conclusão deste dossiê. Apenas quem desvendou os quatro mistérios anteriores poderá ler estas linhas.',
    'Pista em preparação.',
    'definir5',
    'Todos os 5 enigmas foram decifrados! Agora olhe para mim...',
    false
  )
on conflict (ordem) do nothing;

-- -----------------------------------------------------------------------------
-- 6. FUNÇÃO RPC PARA VERIFICAÇÃO SEGURA E DESBLOQUEIO SEQUENCIAL
-- -----------------------------------------------------------------------------
create or replace function public.verificar_resposta_enigma(
  p_ordem smallint,
  p_tentativa text
)
returns jsonb
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_user_id uuid := (select auth.uid());
  v_enigma record;
  v_anterior_resolvido boolean;
  v_tentativa_norm text;
  v_correta_norm text;
  v_acertou boolean;
begin
  select id, ordem, liberado, resposta_correta, recompensa
    into v_enigma
    from public.enigmas
   where ordem = p_ordem;

  if not found then
    return jsonb_build_object('sucesso', false, 'erro', 'Enigma não encontrado.');
  end if;

  if not v_enigma.liberado then
    return jsonb_build_object('sucesso', false, 'erro', 'Este enigma ainda não foi liberado.');
  end if;

  -- Garante que o enigma anterior já foi resolvido (cadeado sequencial)
  if p_ordem > 1 then
    select coalesce(bool_or(resolvido), false)
      into v_anterior_resolvido
      from public.progresso_julia
     where perfil_chave = 'julia'
       and ordem = (p_ordem - 1);

    if not v_anterior_resolvido then
      return jsonb_build_object('sucesso', false, 'erro', 'Resolva o enigma anterior para abrir este cadeado.');
    end if;
  end if;

  v_tentativa_norm := lower(regexp_replace(trim(coalesce(p_tentativa, '')), '[^a-zA-Z0-9]', '', 'g'));
  v_correta_norm   := lower(regexp_replace(trim(coalesce(v_enigma.resposta_correta, '')), '[^a-zA-Z0-9]', '', 'g'));
  v_acertou        := (v_tentativa_norm <> '' and v_tentativa_norm = v_correta_norm);

  insert into public.progresso_julia (
    perfil_chave,
    user_id,
    enigma_id,
    ordem,
    resolvido,
    resposta_enviada,
    tentativas,
    resolvido_em,
    updated_at
  )
  values (
    'julia',
    v_user_id,
    v_enigma.id,
    p_ordem,
    v_acertou,
    case when v_acertou then p_tentativa else null end,
    1,
    case when v_acertou then now() else null end,
    now()
  )
  on conflict (perfil_chave, ordem) do update
    set tentativas = public.progresso_julia.tentativas + 1,
        user_id = coalesce(public.progresso_julia.user_id, excluded.user_id),
        resolvido = public.progresso_julia.resolvido or excluded.resolvido,
        resposta_enviada = case
          when public.progresso_julia.resolvido then public.progresso_julia.resposta_enviada
          when excluded.resolvido then excluded.resposta_enviada
          else public.progresso_julia.resposta_enviada
        end,
        resolvido_em = coalesce(public.progresso_julia.resolvido_em, excluded.resolvido_em),
        updated_at = now();

  return jsonb_build_object(
    'sucesso', v_acertou,
    'recompensa', case when v_acertou then v_enigma.recompensa else null end
  );
end;
$$;

grant execute on function public.verificar_resposta_enigma(smallint, text) to anon, authenticated;
