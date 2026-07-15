import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Users, FileText, TrendingUp, Clock, ArrowUpRight, RefreshCw } from 'lucide-react';

function KPICard({ title, value, sub, icon: Icon, color, trend }) {
  return (
    <div className="bg-surface-container-lowest rounded-2xl p-5 border border-outline-variant hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
          <Icon size={20} />
        </div>
        {trend !== undefined && (
          <span className={`text-xs font-semibold flex items-center gap-0.5 ${trend >= 0 ? 'text-green-600' : 'text-red-500'}`}>
            <ArrowUpRight size={12} className={trend < 0 ? 'rotate-90' : ''} />
            {Math.abs(trend)}%
          </span>
        )}
      </div>
      <p className="font-serif text-3xl font-bold text-on-surface mb-1">{value}</p>
      <p className="text-sm font-medium text-on-surface">{title}</p>
      {sub && <p className="text-xs text-secondary mt-0.5">{sub}</p>}
    </div>
  );
}

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalLeads: 0, novosLeads: 0, totalPosts: 0,
    postsMes: 0, avgSEO: 0, matriculados: 0,
  });
  const [recentLeads, setRecentLeads] = useState([]);
  const [recentPosts, setRecentPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const [
        { data: leads },
        { data: posts },
      ] = await Promise.all([
        supabase.from('leads').select('*').order('created_at', { ascending: false }),
        supabase.from('blog_posts').select('*').order('created_at', { ascending: false }),
      ]);

      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      const leadsData = leads || [];
      const postsData = posts || [];

      setStats({
        totalLeads:   leadsData.length,
        novosLeads:   leadsData.filter(l => l.status === 'novo').length,
        matriculados: leadsData.filter(l => l.status === 'matriculado').length,
        totalPosts:   postsData.length,
        postsMes:     postsData.filter(p => new Date(p.created_at) >= startOfMonth).length,
        avgSEO:       postsData.length
          ? Math.round(postsData.reduce((s, p) => s + (p.seo_score || 0), 0) / postsData.length)
          : 0,
      });

      setRecentLeads(leadsData.slice(0, 5));
      setRecentPosts(postsData.slice(0, 4));
      setLoading(false);
    };
    load();
  }, []);

  const STATUS_COLORS = {
    novo:        'bg-blue-100 text-blue-700',
    em_contato:  'bg-orange-100 text-orange-700',
    matriculado: 'bg-green-100 text-green-700',
    perdido:     'bg-red-100 text-red-700',
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <RefreshCw size={24} className="animate-spin text-primary" />
    </div>
  );

  return (
    <div className="p-8 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-bold text-on-surface">Dashboard</h1>
        <p className="text-secondary text-sm mt-1">
          Visão geral do Colégio Passos · {new Date().toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        <KPICard
          title="Leads no CRM"
          value={stats.totalLeads}
          sub={`${stats.novosLeads} novos aguardando`}
          icon={Users}
          color="bg-orange-100 text-primary"
        />
        <KPICard
          title="Matriculados"
          value={stats.matriculados}
          sub="leads convertidos"
          icon={TrendingUp}
          color="bg-green-100 text-green-600"
        />
        <KPICard
          title="Posts Publicados"
          value={stats.totalPosts}
          sub={`${stats.postsMes} este mês`}
          icon={FileText}
          color="bg-blue-100 text-blue-600"
        />
        <KPICard
          title="Score SEO Médio"
          value={`${stats.avgSEO}%`}
          sub={stats.avgSEO >= 70 ? 'Boa performance' : 'Pode melhorar'}
          icon={Clock}
          color={stats.avgSEO >= 70 ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'}
        />
      </div>

      <div className="grid grid-cols-5 gap-6">
        {/* Leads Recentes */}
        <div className="col-span-3 bg-surface-container-lowest rounded-2xl border border-outline-variant overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-outline-variant">
            <h2 className="font-serif text-base font-bold text-on-surface">Leads Recentes</h2>
            <a href="/crm" className="text-xs text-primary font-semibold hover:underline flex items-center gap-1">
              Ver todos <ArrowUpRight size={12} />
            </a>
          </div>
          {recentLeads.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-secondary">
              <Users size={32} className="mb-2 opacity-30" />
              <p className="text-sm">Nenhum lead ainda</p>
            </div>
          ) : (
            <div className="divide-y divide-outline-variant">
              {recentLeads.map(lead => (
                <div key={lead.id} className="flex items-center gap-4 px-6 py-3 hover:bg-surface-container-low transition-colors">
                  <div className="w-8 h-8 rounded-full bg-secondary-container flex items-center justify-center text-xs font-bold text-primary shrink-0">
                    {lead.name?.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-on-surface truncate">{lead.name}</p>
                    <p className="text-xs text-secondary truncate">{lead.email}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[lead.status] || 'bg-gray-100 text-gray-600'}`}>
                      {lead.status?.replace('_', ' ')}
                    </span>
                    <span className="text-[10px] text-secondary">
                      {new Date(lead.created_at).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Últimos Posts */}
        <div className="col-span-2 bg-surface-container-lowest rounded-2xl border border-outline-variant overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-outline-variant">
            <h2 className="font-serif text-base font-bold text-on-surface">Últimos Posts</h2>
            <a href="/blog-generator" className="text-xs text-primary font-semibold hover:underline flex items-center gap-1">
              Criar post <ArrowUpRight size={12} />
            </a>
          </div>
          {recentPosts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-secondary">
              <FileText size={32} className="mb-2 opacity-30" />
              <p className="text-sm">Nenhum post ainda</p>
            </div>
          ) : (
            <div className="divide-y divide-outline-variant">
              {recentPosts.map(post => {
                const isScheduled = new Date(post.date) > new Date();
                return (
                  <div key={post.id} className="px-5 py-3 hover:bg-surface-container-low transition-colors">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs text-secondary">{post.category}</span>
                      {isScheduled && (
                        <span className="text-[10px] bg-orange-100 text-orange-600 px-1.5 py-0.5 rounded-full font-medium">Agendado</span>
                      )}
                    </div>
                    <p className="text-sm font-medium text-on-surface line-clamp-1">{post.title}</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <div className="flex-1 h-1.5 bg-surface-container-high rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${(post.seo_score || 0) >= 80 ? 'bg-green-500' : (post.seo_score || 0) >= 50 ? 'bg-orange-400' : 'bg-red-400'}`}
                          style={{ width: `${post.seo_score || 0}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-secondary">{post.seo_score || 0}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
