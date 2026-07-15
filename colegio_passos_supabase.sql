-- ==============================================================================
-- COLÉGIO PASSOS — Script SQL Completo para Supabase
-- Execute este script no SQL Editor do Supabase
-- Projeto: guywipfzjoplmugfggjr.supabase.co
-- ==============================================================================

-- ==============================================================================
-- 1. ADMINISTRADORES AUTORIZADOS
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.authorized_admins (
    email TEXT PRIMARY KEY,
    name  TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.authorized_admins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permitir leitura de admins para autenticados"
ON public.authorized_admins FOR SELECT TO authenticated USING (true);

-- Administradores do Colégio Passos
INSERT INTO public.authorized_admins (email, name) VALUES
    ('lourenconialine@gmail.com',  'Nialine Lourenco'),
    ('pedromlzaparoli@gmail.com',  'Pedro Zaparoli')
ON CONFLICT (email) DO NOTHING;


-- ==============================================================================
-- 2. LEADS / CRM — Captação de alunos potenciais
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.leads (
    id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name        TEXT NOT NULL,
    phone       TEXT NOT NULL,
    email       TEXT NOT NULL,
    message     TEXT,
    segment     TEXT DEFAULT 'Não informado', -- 'Infantil' | 'Fundamental I' | 'Fundamental II'
    status      TEXT DEFAULT 'novo',           -- 'novo' | 'em_contato' | 'matriculado' | 'perdido'
    notes       TEXT,
    contacted   BOOLEAN DEFAULT false NOT NULL,
    created_at  TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Visitantes do site podem submeter leads (formulário de contato)
CREATE POLICY "Permitir inserções públicas de leads"
ON public.leads FOR INSERT WITH CHECK (true);

-- Apenas admins autorizados podem visualizar leads
CREATE POLICY "Permitir leitura apenas para admins"
ON public.leads FOR SELECT TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.authorized_admins
        WHERE public.authorized_admins.email = auth.jwt() ->> 'email'
    )
);

-- Apenas admins podem atualizar leads
CREATE POLICY "Permitir atualização apenas para admins"
ON public.leads FOR UPDATE TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.authorized_admins
        WHERE public.authorized_admins.email = auth.jwt() ->> 'email'
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.authorized_admins
        WHERE public.authorized_admins.email = auth.jwt() ->> 'email'
    )
);

-- Apenas admins podem deletar leads
CREATE POLICY "Permitir exclusão apenas para admins"
ON public.leads FOR DELETE TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.authorized_admins
        WHERE public.authorized_admins.email = auth.jwt() ->> 'email'
    )
);


-- ==============================================================================
-- 3. BLOG POSTS — Artigos com SEO integrado
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.blog_posts (
    id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title           TEXT NOT NULL,
    category        TEXT NOT NULL,
    readtime        TEXT,
    image           TEXT,
    image_alt       TEXT,
    summary         TEXT NOT NULL,
    content         TEXT NOT NULL,
    date            TEXT NOT NULL,              -- Formato YYYY-MM-DD
    has_footer      BOOLEAN DEFAULT true NOT NULL,
    meta_description TEXT,
    target_keyword  TEXT,
    seo_score       INTEGER DEFAULT 0,
    slug            TEXT,
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

-- Leitura pública para o site
CREATE POLICY "Permitir leitura pública de posts"
ON public.blog_posts FOR SELECT USING (true);

-- Inserção restrita a admins
CREATE POLICY "Permitir inserção de posts para admins"
ON public.blog_posts FOR INSERT TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.authorized_admins
        WHERE public.authorized_admins.email = auth.jwt() ->> 'email'
    )
);

-- Atualização restrita a admins
CREATE POLICY "Permitir atualização de posts para admins"
ON public.blog_posts FOR UPDATE TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.authorized_admins
        WHERE public.authorized_admins.email = auth.jwt() ->> 'email'
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.authorized_admins
        WHERE public.authorized_admins.email = auth.jwt() ->> 'email'
    )
);

-- Exclusão restrita a admins
CREATE POLICY "Permitir exclusão de posts para admins"
ON public.blog_posts FOR DELETE TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.authorized_admins
        WHERE public.authorized_admins.email = auth.jwt() ->> 'email'
    )
);


-- ==============================================================================
-- 4. CONFIGURAÇÕES DINÂMICAS DO SITE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.site_settings (
    key        TEXT PRIMARY KEY,
    value      JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permitir leitura pública de configurações"
ON public.site_settings FOR SELECT USING (true);

CREATE POLICY "Permitir inserção de config para admins"
ON public.site_settings FOR INSERT TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.authorized_admins
        WHERE public.authorized_admins.email = auth.jwt() ->> 'email'
    )
);

CREATE POLICY "Permitir atualização de config para admins"
ON public.site_settings FOR UPDATE TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.authorized_admins
        WHERE public.authorized_admins.email = auth.jwt() ->> 'email'
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.authorized_admins
        WHERE public.authorized_admins.email = auth.jwt() ->> 'email'
    )
);


-- ==============================================================================
-- 5. REGISTROS FINANCEIROS (manual + Pluggy sync)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.financeiro_registros (
    id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tipo        TEXT NOT NULL,        -- 'receita' | 'despesa'
    categoria   TEXT NOT NULL,        -- 'Mensalidade' | 'Matrícula' | 'Salário' | etc.
    descricao   TEXT NOT NULL,
    valor       NUMERIC(12, 2) NOT NULL,
    data        DATE NOT NULL,
    fonte       TEXT DEFAULT 'manual', -- 'manual' | 'pluggy'
    pluggy_id   TEXT,                  -- ID da transação no Pluggy (se sincronizado)
    created_at  TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.financeiro_registros ENABLE ROW LEVEL SECURITY;

-- Apenas admins podem ver e manipular registros financeiros
CREATE POLICY "Financeiro somente para admins — SELECT"
ON public.financeiro_registros FOR SELECT TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.authorized_admins
        WHERE public.authorized_admins.email = auth.jwt() ->> 'email'
    )
);

CREATE POLICY "Financeiro somente para admins — INSERT"
ON public.financeiro_registros FOR INSERT TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.authorized_admins
        WHERE public.authorized_admins.email = auth.jwt() ->> 'email'
    )
);

CREATE POLICY "Financeiro somente para admins — UPDATE"
ON public.financeiro_registros FOR UPDATE TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.authorized_admins
        WHERE public.authorized_admins.email = auth.jwt() ->> 'email'
    )
);

CREATE POLICY "Financeiro somente para admins — DELETE"
ON public.financeiro_registros FOR DELETE TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.authorized_admins
        WHERE public.authorized_admins.email = auth.jwt() ->> 'email'
    )
);
