import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import {
  FileText, Sparkles, Eye, Save, Trash2, Calendar,
  CheckCircle2, AlertCircle, RefreshCw, ChevronDown,
  Image, Tag, Clock, ArrowLeft
} from 'lucide-react';

import { GoogleGenerativeAI } from '@google/generative-ai';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

const CATEGORIES = ['Educação', 'Pedagogia', 'Família & Escola', 'Saúde Escolar', 'Eventos', 'Tecnologia na Educação', 'BNCC', 'Protagonismo'];

// ── Helpers ──────────────────────────────────────────────────────────────────

function calcSEOScore(post) {
  let score = 0;
  const kw = (post.target_keyword || '').toLowerCase();
  if (kw && post.title?.toLowerCase().includes(kw)) score += 20;
  if (kw && post.summary?.toLowerCase().includes(kw)) score += 15;
  if (post.meta_description && post.meta_description.length >= 120) score += 20;
  if ((post.content?.split(/\s+/).length || 0) >= 300) score += 20;
  if (post.image_alt && post.image_alt.length > 3) score += 15;
  if (post.slug && /^[a-z0-9-]+$/.test(post.slug)) score += 10;
  return score;
}

function toSlug(text) {
  return (text || '')
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim().replace(/\s+/g, '-');
}

function SEOBar({ score }) {
  const color = score >= 80 ? 'bg-green-500' : score >= 50 ? 'bg-orange-400' : 'bg-red-400';
  const label = score >= 80 ? 'Ótimo' : score >= 50 ? 'Regular' : 'Fraco';
  const textColor = score >= 80 ? 'text-green-600' : score >= 50 ? 'text-orange-500' : 'text-red-500';
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-2 bg-surface-container-high rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-700 ${color}`} style={{ width: `${score}%` }} />
      </div>
      <span className={`text-sm font-bold ${textColor}`}>{score}% · {label}</span>
    </div>
  );
}

const EMPTY_POST = {
  title: '', category: CATEGORIES[0], summary: '', content: '',
  date: new Date().toISOString().split('T')[0],
  image: '', image_alt: '', meta_description: '', target_keyword: '',
  slug: '', readtime: '5 min', has_footer: true,
};

// ── Main Component ────────────────────────────────────────────────────────────

export default function BlogGenerator() {
  const [view, setView] = useState('list'); // 'list' | 'editor' | 'preview'
  const [posts, setPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [form, setForm] = useState(EMPTY_POST);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [genPrompt, setGenPrompt] = useState('');
  const [genError, setGenError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const seoScore = calcSEOScore(form);
  const isScheduled = form.date && new Date(form.date) > new Date();

  const fetchPosts = useCallback(async () => {
    setLoadingPosts(true);
    const { data } = await supabase.from('blog_posts').select('*').order('created_at', { ascending: false });
    if (data) setPosts(data);
    setLoadingPosts(false);
  }, []);

  useEffect(() => { fetchPosts(); }, [fetchPosts]);

  const updateField = (field, val) => {
    setForm(prev => {
      const next = { ...prev, [field]: val };
      if (field === 'title') next.slug = toSlug(val);
      return next;
    });
  };

  // ── Gemini AI Generation ──────────────────────────────────────────────────
  const generateWithGemini = async () => {
    if (!GEMINI_API_KEY || GEMINI_API_KEY.includes('COLE_')) {
      setGenError('Configure VITE_GEMINI_API_KEY no arquivo .env para usar o gerador de IA.');
      return;
    }
    if (!GEMINI_API_KEY.startsWith('AIzaSy') && !GEMINI_API_KEY.startsWith('AQ')) {
      setGenError('A chave VITE_GEMINI_API_KEY no .env parece inválida. Obtenha uma chave válida em: https://aistudio.google.com/app/apikey');
      return;
    }
    if (!genPrompt.trim()) {
      setGenError('Descreva o tema do artigo antes de gerar.');
      return;
    }
    setGenerating(true);
    setGenError('');

    try {
      const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

      const prompt = `Você é um redator especialista em educação infantil e fundamental para o Colégio Passos, escola moderna e afetiva.

Escreva um artigo de blog completo com o seguinte tema: "${genPrompt}"
Categoria: ${form.category}

Retorne SOMENTE um JSON válido com esta estrutura exata, sem blocos de markdown adicionais como \`\`\`json:
{
  "title": "Título do artigo (com a keyword se possível)",
  "summary": "Resumo envolvente de 1-2 frases (com a keyword)",
  "content": "Conteúdo completo em markdown (mínimo 350 palavras, use ## para subtítulos, seja envolvente e educativo)",
  "meta_description": "Meta description de 140-160 caracteres (com a keyword no início)",
  "target_keyword": "palavra-chave principal",
  "readtime": "X min",
  "image": "Uma URL funcional do Unsplash (resolução 1200x800) relacionada ao tema e à educação infantil. Use fotos reais de alta qualidade do Unsplash.",
  "image_alt": "Descrição detalhada da imagem para acessibilidade SEO"
}`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      const cleanJsonText = text.replace(/```json/g, '').replace(/```/g, '').trim();
      const jsonMatch = cleanJsonText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('Resposta inválida da IA');
      
      const generated = JSON.parse(jsonMatch[0]);
      
      setForm(prev => ({
        ...prev,
        title:           generated.title || prev.title,
        summary:         generated.summary || prev.summary,
        content:         generated.content || prev.content,
        meta_description:generated.meta_description || prev.meta_description,
        target_keyword:  generated.target_keyword || prev.target_keyword,
        readtime:        generated.readtime || prev.readtime,
        image:           generated.image || 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=1200&q=80',
        image_alt:       generated.image_alt || 'Livros e educação infantil',
        slug:            toSlug(generated.title || prev.title),
      }));
    } catch (err) {
      setGenError('Erro ao gerar conteúdo. Tente novamente. ' + err.message);
    } finally {
      setGenerating(false);
    }
  };

  // ── Save ──────────────────────────────────────────────────────────────────
  const savePost = async () => {
    if (!form.title || !form.summary || !form.content) {
      setGenError('Preencha Título, Resumo e Conteúdo antes de salvar.');
      return;
    }
    setSaving(true);
    setGenError('');
    const payload = { ...form, seo_score: seoScore };

    const { error } = editingId
      ? await supabase.from('blog_posts').update(payload).eq('id', editingId)
      : await supabase.from('blog_posts').insert([payload]);

    if (error) {
      setGenError('Erro ao salvar: ' + error.message);
    } else {
      setSuccessMsg(isScheduled ? '✅ Post agendado com sucesso!' : '✅ Post publicado com sucesso!');
      setTimeout(() => setSuccessMsg(''), 3000);
      await fetchPosts();
      setView('list');
      setForm(EMPTY_POST);
      setEditingId(null);
    }
    setSaving(false);
  };

  const deletePost = async (id) => {
    if (!confirm('Excluir este post permanentemente?')) return;
    await supabase.from('blog_posts').delete().eq('id', id);
    fetchPosts();
  };

  const editPost = (post) => {
    setForm({ ...EMPTY_POST, ...post });
    setEditingId(post.id);
    setView('editor');
  };

  // ── VIEW: List ────────────────────────────────────────────────────────────
  if (view === 'list') return (
    <div className="p-8 min-h-screen">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-serif text-3xl font-bold text-on-surface">Gerador de Blog</h1>
          <p className="text-secondary text-sm mt-1">Crie e gerencie artigos com IA e SEO integrado</p>
        </div>
        <button
          onClick={() => { setForm(EMPTY_POST); setEditingId(null); setView('editor'); }}
          className="flex items-center gap-2 bg-primary text-on-primary px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-primary-dark transition-colors shadow-md shadow-orange-200"
        >
          <Sparkles size={16} /> Novo Post
        </button>
      </div>

      {successMsg && (
        <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
          <CheckCircle2 size={16} /> {successMsg}
        </div>
      )}

      {loadingPosts ? (
        <div className="flex items-center justify-center py-20 text-secondary">
          <RefreshCw size={20} className="animate-spin mr-2" /> Carregando posts…
        </div>
      ) : posts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-secondary">
          <FileText size={48} className="mb-4 opacity-20" />
          <p className="text-base font-medium mb-1">Nenhum post ainda</p>
          <p className="text-sm">Clique em "Novo Post" para criar o primeiro artigo</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {posts.map(post => {
            const scheduled = new Date(post.date) > new Date();
            const score = post.seo_score || 0;
            const scoreColor = score >= 80 ? 'text-green-600' : score >= 50 ? 'text-orange-500' : 'text-red-500';
            return (
              <div key={post.id} className="bg-surface-container-lowest rounded-2xl border border-outline-variant p-5 flex items-center gap-5 hover:shadow-md transition-shadow">
                {post.image ? (
                  <img src={post.image} alt={post.image_alt || post.title} className="w-16 h-16 rounded-xl object-cover shrink-0 border border-outline-variant" />
                ) : (
                  <div className="w-16 h-16 rounded-xl bg-secondary-container flex items-center justify-center shrink-0">
                    <Image size={24} className="text-primary opacity-50" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs text-secondary">{post.category}</span>
                    {scheduled && <span className="text-[10px] bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full font-medium">Agendado · {post.date}</span>}
                  </div>
                  <p className="font-medium text-on-surface line-clamp-1 mb-1">{post.title}</p>
                  <p className="text-xs text-secondary line-clamp-1">{post.summary}</p>
                </div>
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <span className={`text-sm font-bold ${scoreColor}`}>{score}% SEO</span>
                  <div className="flex gap-2">
                    <button onClick={() => editPost(post)} className="text-xs text-primary hover:underline font-medium">Editar</button>
                    <button onClick={() => deletePost(post.id)} className="text-secondary hover:text-red-500 p-1 rounded-lg hover:bg-red-50 transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  // ── VIEW: Editor ──────────────────────────────────────────────────────────
  return (
    <div className="p-8 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button onClick={() => { setView('list'); setForm(EMPTY_POST); setEditingId(null); }} className="text-secondary hover:text-primary p-2 rounded-xl hover:bg-secondary-container transition-colors">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="font-serif text-2xl font-bold text-on-surface">{editingId ? 'Editar Post' : 'Novo Post'}</h1>
            <p className="text-secondary text-sm mt-0.5">
              {isScheduled ? `📅 Agendado para ${new Date(form.date).toLocaleDateString('pt-BR')}` : '🌐 Publicação imediata'}
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={() => setView(view === 'preview' ? 'editor' : 'preview')} className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-outline-variant text-secondary hover:text-primary hover:border-primary text-sm font-medium transition-colors">
            <Eye size={16} /> {view === 'preview' ? 'Voltar ao Editor' : 'Preview'}
          </button>
          <button onClick={savePost} disabled={saving} className="flex items-center gap-2 bg-primary text-on-primary px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-primary-dark transition-colors shadow-md shadow-orange-200 disabled:opacity-50">
            {saving ? <RefreshCw size={16} className="animate-spin" /> : <Save size={16} />}
            {saving ? 'Salvando…' : isScheduled ? 'Agendar Post' : 'Publicar Post'}
          </button>
        </div>
      </div>

      {genError && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
          <AlertCircle size={16} /> {genError}
        </div>
      )}

      {view === 'preview' ? (
        /* ── Preview ── */
        <div className="max-w-3xl mx-auto bg-white rounded-3xl border border-outline-variant p-10 shadow-lg">
          {form.image && <img src={form.image} alt={form.image_alt} className="w-full h-60 object-cover rounded-2xl mb-8" />}
          <span className="text-xs font-semibold text-primary uppercase tracking-wider">{form.category}</span>
          <h1 className="font-serif text-3xl font-bold text-on-surface mt-2 mb-4">{form.title || 'Título do Post'}</h1>
          <p className="text-secondary text-lg mb-6 leading-relaxed">{form.summary}</p>
          <hr className="border-outline-variant mb-6" />
          <div className="prose prose-sm max-w-none text-on-surface leading-relaxed whitespace-pre-wrap">{form.content}</div>
        </div>
      ) : (
        /* ── Editor ── */
        <div className="grid grid-cols-5 gap-8">
          {/* Left: Form */}
          <div className="col-span-3 space-y-5">
            {/* AI Generator */}
            <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-2xl border border-orange-200 p-5">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles size={16} className="text-primary" />
                <h3 className="text-sm font-semibold text-on-surface">Gerar com Gemini IA</h3>
                <span className="text-[10px] bg-primary text-on-primary px-2 py-0.5 rounded-full font-bold">Flash 1.5</span>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={genPrompt}
                  onChange={e => setGenPrompt(e.target.value)}
                  placeholder="Ex: Como estimular a leitura em crianças de 6 a 8 anos"
                  className="flex-1 bg-white border border-orange-200 rounded-xl px-4 py-2.5 text-sm text-on-surface focus:outline-none focus:border-primary transition-colors placeholder:text-secondary/50"
                  onKeyDown={e => e.key === 'Enter' && generateWithGemini()}
                />
                <button
                  onClick={generateWithGemini}
                  disabled={generating}
                  className="bg-primary text-on-primary px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-primary-dark transition-colors disabled:opacity-50 flex items-center gap-2 shrink-0"
                >
                  {generating ? <RefreshCw size={14} className="animate-spin" /> : <Sparkles size={14} />}
                  {generating ? 'Gerando…' : 'Gerar'}
                </button>
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="block text-xs font-semibold text-secondary mb-1.5 uppercase tracking-wider">Título *</label>
              <input
                type="text"
                value={form.title}
                onChange={e => updateField('title', e.target.value)}
                placeholder="Título claro e com a keyword principal"
                className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl px-4 py-3 text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-orange-100 text-sm placeholder:text-secondary/50"
              />
            </div>

            {/* Category + Date + Readtime */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-secondary mb-1.5 uppercase tracking-wider">Categoria</label>
                <div className="relative">
                  <select
                    value={form.category}
                    onChange={e => updateField('category', e.target.value)}
                    className="w-full appearance-none bg-surface-container-lowest border border-outline-variant rounded-xl px-4 py-3 text-sm text-on-surface focus:outline-none focus:border-primary pr-8"
                  >
                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary pointer-events-none" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-secondary mb-1.5 uppercase tracking-wider">Data de Publicação</label>
                <input
                  type="date"
                  value={form.date}
                  onChange={e => updateField('date', e.target.value)}
                  className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl px-4 py-3 text-sm text-on-surface focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-secondary mb-1.5 uppercase tracking-wider">Tempo de Leitura</label>
                <input
                  type="text"
                  value={form.readtime}
                  onChange={e => updateField('readtime', e.target.value)}
                  placeholder="5 min"
                  className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl px-4 py-3 text-sm text-on-surface focus:outline-none focus:border-primary"
                />
              </div>
            </div>

            {/* Summary */}
            <div>
              <label className="block text-xs font-semibold text-secondary mb-1.5 uppercase tracking-wider">Resumo *</label>
              <textarea
                value={form.summary}
                onChange={e => updateField('summary', e.target.value)}
                placeholder="Resumo envolvente de 1-2 frases. Inclua a keyword principal."
                rows={2}
                className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl px-4 py-3 text-sm text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-orange-100 resize-none placeholder:text-secondary/50"
              />
            </div>

            {/* Content */}
            <div>
              <label className="block text-xs font-semibold text-secondary mb-1.5 uppercase tracking-wider">
                Conteúdo * · {form.content.split(/\s+/).filter(Boolean).length} palavras
              </label>
              <textarea
                value={form.content}
                onChange={e => updateField('content', e.target.value)}
                placeholder="Escreva o artigo aqui. Use ## para subtítulos. Mínimo 300 palavras para bom SEO."
                rows={16}
                className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl px-4 py-3 text-sm text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-orange-100 resize-none font-mono placeholder:text-secondary/50"
              />
            </div>
          </div>

          {/* Right: SEO + Meta */}
          <div className="col-span-2 space-y-5">
            {/* SEO Score */}
            <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant p-5">
              <h3 className="text-sm font-semibold text-on-surface mb-3">Score SEO</h3>
              <SEOBar score={seoScore} />
              <div className="mt-4 space-y-2">
                {[
                  { label: 'Keyword no título',       pass: form.target_keyword && form.title?.toLowerCase().includes(form.target_keyword.toLowerCase()) },
                  { label: 'Keyword no resumo',       pass: form.target_keyword && form.summary?.toLowerCase().includes(form.target_keyword.toLowerCase()) },
                  { label: 'Meta description (120c+)',pass: !!form.meta_description && form.meta_description.length >= 120 },
                  { label: 'Conteúdo > 300 palavras', pass: (form.content?.split(/\s+/).filter(Boolean).length || 0) >= 300 },
                  { label: 'Imagem com alt text',     pass: !!form.image_alt && form.image_alt.length > 3 },
                  { label: 'Slug amigável',           pass: !!form.slug && /^[a-z0-9-]+$/.test(form.slug) },
                ].map(c => (
                  <div key={c.label} className="flex items-center gap-2">
                    {c.pass
                      ? <CheckCircle2 size={14} className="text-green-500 shrink-0" />
                      : <AlertCircle  size={14} className="text-red-400 shrink-0" />
                    }
                    <span className={`text-xs ${c.pass ? 'text-on-surface' : 'text-secondary'}`}>{c.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Target Keyword */}
            <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant p-5">
              <label className="flex items-center gap-1.5 text-xs font-semibold text-secondary mb-2 uppercase tracking-wider">
                <Tag size={12} /> Keyword Principal
              </label>
              <input
                type="text"
                value={form.target_keyword}
                onChange={e => updateField('target_keyword', e.target.value)}
                placeholder="Ex: educação infantil joinville"
                className="w-full bg-surface-container-low border border-outline-variant rounded-xl px-3 py-2.5 text-sm text-on-surface focus:outline-none focus:border-primary"
              />
            </div>

            {/* Meta Description */}
            <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant p-5">
              <label className="block text-xs font-semibold text-secondary mb-2 uppercase tracking-wider">Meta Description</label>
              <textarea
                value={form.meta_description}
                onChange={e => updateField('meta_description', e.target.value)}
                placeholder="Mínimo 120 caracteres. Comece com a keyword."
                rows={3}
                className="w-full bg-surface-container-low border border-outline-variant rounded-xl px-3 py-2.5 text-sm text-on-surface focus:outline-none focus:border-primary resize-none placeholder:text-secondary/50"
              />
              <p className={`text-xs mt-1 ${form.meta_description.length < 120 ? 'text-orange-500' : 'text-green-600'}`}>
                {form.meta_description.length}/160 caracteres
              </p>
            </div>

            {/* Image */}
            <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant p-5">
              <label className="flex items-center gap-1.5 text-xs font-semibold text-secondary mb-2 uppercase tracking-wider">
                <Image size={12} /> Imagem (URL)
              </label>
              <input
                type="url"
                value={form.image}
                onChange={e => updateField('image', e.target.value)}
                placeholder="https://…"
                className="w-full bg-surface-container-low border border-outline-variant rounded-xl px-3 py-2.5 text-sm text-on-surface focus:outline-none focus:border-primary mb-2"
              />
              <input
                type="text"
                value={form.image_alt}
                onChange={e => updateField('image_alt', e.target.value)}
                placeholder="Descrição da imagem (alt text)"
                className="w-full bg-surface-container-low border border-outline-variant rounded-xl px-3 py-2.5 text-sm text-on-surface focus:outline-none focus:border-primary"
              />
              {form.image && (
                <img src={form.image} alt={form.image_alt} className="mt-3 w-full h-32 object-cover rounded-xl border border-outline-variant" onError={e => e.target.style.display = 'none'} />
              )}
            </div>

            {/* Slug */}
            <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant p-5">
              <label className="block text-xs font-semibold text-secondary mb-2 uppercase tracking-wider">Slug (URL)</label>
              <input
                type="text"
                value={form.slug}
                onChange={e => updateField('slug', e.target.value)}
                placeholder="meu-artigo-educacional"
                className="w-full bg-surface-container-low border border-outline-variant rounded-xl px-3 py-2.5 text-sm text-on-surface focus:outline-none focus:border-primary font-mono"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
