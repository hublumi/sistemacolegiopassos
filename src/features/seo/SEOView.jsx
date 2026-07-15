import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Search, TrendingUp, AlertCircle, CheckCircle2, ChevronUp, ChevronDown, RefreshCw, ExternalLink } from 'lucide-react';

function SEOBar({ score }) {
  const color = score >= 80 ? 'bg-green-500' : score >= 50 ? 'bg-orange-400' : 'bg-red-400';
  const label = score >= 80 ? 'Ótimo' : score >= 50 ? 'Regular' : 'Fraco';
  const textColor = score >= 80 ? 'text-green-600' : score >= 50 ? 'text-orange-500' : 'text-red-500';
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-2 bg-surface-container-high rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-500 ${color}`} style={{ width: `${score}%` }} />
      </div>
      <span className={`text-xs font-bold w-14 text-right ${textColor}`}>{score}% · {label}</span>
    </div>
  );
}

function SEOChecklist({ post }) {
  const checks = [
    { label: 'Keyword no título',       pass: post.target_keyword && post.title?.toLowerCase().includes(post.target_keyword.toLowerCase()) },
    { label: 'Keyword no resumo',       pass: post.target_keyword && post.summary?.toLowerCase().includes(post.target_keyword.toLowerCase()) },
    { label: 'Meta description',        pass: !!post.meta_description && post.meta_description.length >= 120 },
    { label: 'Conteúdo > 300 palavras', pass: (post.content?.split(/\s+/).length || 0) >= 300 },
    { label: 'Imagem com alt text',     pass: !!post.image_alt && post.image_alt.length > 3 },
    { label: 'Slug amigável',           pass: !!post.slug && /^[a-z0-9-]+$/.test(post.slug) },
  ];
  return (
    <div className="space-y-1.5">
      {checks.map(c => (
        <div key={c.label} className="flex items-center gap-2">
          {c.pass
            ? <CheckCircle2 size={13} className="text-green-500 shrink-0" />
            : <AlertCircle  size={13} className="text-red-400 shrink-0" />
          }
          <span className={`text-xs ${c.pass ? 'text-on-surface' : 'text-secondary line-through'}`}>{c.label}</span>
        </div>
      ))}
    </div>
  );
}

export default function SEOView() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('seo_score');
  const [sortDir, setSortDir] = useState('asc');
  const [selectedPost, setSelectedPost] = useState(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      const { data } = await supabase.from('blog_posts').select('*').order('created_at', { ascending: false });
      if (data) setPosts(data);
      setLoading(false);
    };
    fetch();
  }, []);

  const handleSort = (col) => {
    if (sortBy === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortBy(col); setSortDir('asc'); }
  };

  const filtered = posts
    .filter(p => !search || p.title?.toLowerCase().includes(search.toLowerCase()) || p.target_keyword?.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      const va = a[sortBy] ?? 0;
      const vb = b[sortBy] ?? 0;
      return sortDir === 'asc' ? (va > vb ? 1 : -1) : (va < vb ? 1 : -1);
    });

  const avgScore = posts.length ? Math.round(posts.reduce((s, p) => s + (p.seo_score || 0), 0) / posts.length) : 0;
  const highScore = posts.filter(p => (p.seo_score || 0) >= 80).length;
  const lowScore  = posts.filter(p => (p.seo_score || 0) < 50).length;

  const SortIcon = ({ col }) => {
    if (sortBy !== col) return <ChevronDown size={12} className="opacity-30" />;
    return sortDir === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />;
  };

  return (
    <div className="p-8 min-h-screen">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-serif text-3xl font-bold text-on-surface">SEO & Publicações</h1>
          <p className="text-secondary text-sm mt-1">Monitore a performance SEO de todos os artigos</p>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-surface-container-lowest rounded-2xl p-5 border border-outline-variant">
          <p className="text-xs text-secondary font-medium uppercase tracking-wider mb-1">Score Médio</p>
          <p className="font-serif text-3xl font-bold text-on-surface">{avgScore}<span className="text-lg text-secondary">%</span></p>
          <SEOBar score={avgScore} />
        </div>
        <div className="bg-green-50 rounded-2xl p-5 border border-green-100">
          <p className="text-xs text-secondary font-medium uppercase tracking-wider mb-1">Ótimos (≥80%)</p>
          <p className="font-serif text-3xl font-bold text-green-600">{highScore}</p>
          <p className="text-xs text-secondary mt-1">posts bem otimizados</p>
        </div>
        <div className="bg-red-50 rounded-2xl p-5 border border-red-100">
          <p className="text-xs text-secondary font-medium uppercase tracking-wider mb-1">Precisam Atenção (&lt;50%)</p>
          <p className="font-serif text-3xl font-bold text-red-500">{lowScore}</p>
          <p className="text-xs text-secondary mt-1">posts com SEO fraco</p>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Table */}
        <div className="flex-1 min-w-0">
          <div className="flex gap-3 mb-4">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary" />
              <input
                type="text"
                placeholder="Buscar por título ou keyword…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-outline-variant bg-surface-container-lowest text-sm text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-orange-100 transition-all placeholder:text-secondary/50"
              />
            </div>
          </div>

          <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center py-20 text-secondary">
                <RefreshCw size={20} className="animate-spin mr-2" /> Carregando posts…
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-secondary">
                <TrendingUp size={40} className="mb-3 opacity-30" />
                <p className="text-sm">Nenhum post encontrado</p>
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-outline-variant bg-surface-container-low">
                    {[
                      { label: 'Título',    col: 'title' },
                      { label: 'Keyword',   col: 'target_keyword' },
                      { label: 'Categoria', col: 'category' },
                      { label: 'Score SEO', col: 'seo_score' },
                      { label: 'Data',      col: 'date' },
                    ].map(h => (
                      <th
                        key={h.col}
                        onClick={() => handleSort(h.col)}
                        className="text-left px-4 py-3 text-xs font-semibold text-secondary uppercase tracking-wider cursor-pointer hover:text-primary select-none"
                      >
                        <span className="flex items-center gap-1">{h.label} <SortIcon col={h.col} /></span>
                      </th>
                    ))}
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant">
                  {filtered.map(post => (
                    <tr
                      key={post.id}
                      onClick={() => setSelectedPost(selectedPost?.id === post.id ? null : post)}
                      className={`hover:bg-surface-container-low transition-colors cursor-pointer ${selectedPost?.id === post.id ? 'bg-secondary-container' : ''}`}
                    >
                      <td className="px-4 py-3 text-sm font-medium text-on-surface max-w-xs">
                        <span className="line-clamp-1">{post.title}</span>
                      </td>
                      <td className="px-4 py-3">
                        {post.target_keyword ? (
                          <span className="px-2 py-0.5 bg-secondary-container text-primary text-xs rounded-full font-medium">{post.target_keyword}</span>
                        ) : <span className="text-secondary text-xs">—</span>}
                      </td>
                      <td className="px-4 py-3 text-xs text-secondary">{post.category}</td>
                      <td className="px-4 py-3 w-48">
                        <SEOBar score={post.seo_score || 0} />
                      </td>
                      <td className="px-4 py-3 text-xs text-secondary">{post.date}</td>
                      <td className="px-4 py-3">
                        <a
                          href={`https://colegiopassos.com.br/blog`}
                          target="_blank"
                          rel="noreferrer"
                          onClick={e => e.stopPropagation()}
                          className="text-secondary hover:text-primary p-1.5 rounded-lg transition-colors inline-flex"
                        >
                          <ExternalLink size={14} />
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Checklist Panel */}
        {selectedPost && (
          <div className="w-72 shrink-0">
            <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant p-5 sticky top-8">
              <h3 className="font-serif text-base font-bold text-on-surface mb-1">Diagnóstico SEO</h3>
              <p className="text-xs text-secondary mb-4 line-clamp-1">{selectedPost.title}</p>
              <div className="mb-4">
                <p className="text-xs font-medium text-secondary uppercase tracking-wider mb-2">Score</p>
                <SEOBar score={selectedPost.seo_score || 0} />
              </div>
              <div>
                <p className="text-xs font-medium text-secondary uppercase tracking-wider mb-3">Critérios</p>
                <SEOChecklist post={selectedPost} />
              </div>
              <div className="mt-4 pt-4 border-t border-outline-variant">
                <p className="text-xs text-secondary">
                  💡 Melhore os itens marcados no{' '}
                  <a href="/blog-generator" className="text-primary hover:underline font-medium">Gerador de Blog</a>
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
