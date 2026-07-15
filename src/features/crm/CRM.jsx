import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import {
  Users, Search, Filter, Phone, Mail, MessageCircle,
  CheckCircle2, Clock, XCircle, GraduationCap,
  Download, RefreshCw, Trash2, ChevronDown, Eye
} from 'lucide-react';

const STATUS_CONFIG = {
  novo:        { label: 'Novo',        color: 'bg-blue-100 text-blue-700 border-blue-200',   icon: Clock },
  em_contato:  { label: 'Em Contato',  color: 'bg-orange-100 text-orange-700 border-orange-200', icon: MessageCircle },
  matriculado: { label: 'Matriculado', color: 'bg-green-100 text-green-700 border-green-200', icon: CheckCircle2 },
  perdido:     { label: 'Perdido',     color: 'bg-red-100 text-red-700 border-red-200',     icon: XCircle },
};

const SEGMENT_OPTIONS = ['Todos', 'Infantil', 'Fundamental I', 'Fundamental II', 'Não informado'];
const STATUS_OPTIONS  = ['Todos', 'novo', 'em_contato', 'matriculado', 'perdido'];

export default function CRM() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('Todos');
  const [filterSegment, setFilterSegment] = useState('Todos');
  const [selectedLead, setSelectedLead] = useState(null);
  const [noteText, setNoteText] = useState('');

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) setLeads(data);
    setLoading(false);
  }, []);

  useEffect(() => { fetchLeads(); }, [fetchLeads]);

  const updateStatus = async (id, status) => {
    await supabase.from('leads').update({ status, contacted: status !== 'novo' }).eq('id', id);
    setLeads(prev => prev.map(l => l.id === id ? { ...l, status, contacted: status !== 'novo' } : l));
    if (selectedLead?.id === id) setSelectedLead(prev => ({ ...prev, status }));
  };

  const saveNote = async () => {
    if (!selectedLead) return;
    await supabase.from('leads').update({ notes: noteText }).eq('id', selectedLead.id);
    setLeads(prev => prev.map(l => l.id === selectedLead.id ? { ...l, notes: noteText } : l));
  };

  const deleteLead = async (id) => {
    if (!confirm('Excluir este lead permanentemente?')) return;
    await supabase.from('leads').delete().eq('id', id);
    setLeads(prev => prev.filter(l => l.id !== id));
    if (selectedLead?.id === id) setSelectedLead(null);
  };

  const exportCSV = () => {
    const headers = ['Nome', 'Telefone', 'Email', 'Segmento', 'Status', 'Mensagem', 'Data'];
    const rows = filtered.map(l => [
      l.name, l.phone, l.email, l.segment, l.status,
      (l.message || '').replace(/,/g, ';'),
      new Date(l.created_at).toLocaleDateString('pt-BR'),
    ]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'leads_colegio_passos.csv'; a.click();
  };

  const filtered = leads.filter(l => {
    const q = search.toLowerCase();
    const matchSearch = !q || l.name?.toLowerCase().includes(q) || l.email?.toLowerCase().includes(q) || l.phone?.includes(q);
    const matchStatus = filterStatus === 'Todos' || l.status === filterStatus;
    const matchSeg = filterSegment === 'Todos' || l.segment === filterSegment;
    return matchSearch && matchStatus && matchSeg;
  });

  const kpis = {
    total:       leads.length,
    novos:       leads.filter(l => l.status === 'novo').length,
    emContato:   leads.filter(l => l.status === 'em_contato').length,
    matriculados:leads.filter(l => l.status === 'matriculado').length,
  };

  return (
    <div className="p-8 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-serif text-3xl font-bold text-on-surface">CRM · Leads</h1>
          <p className="text-secondary text-sm mt-1">Gerencie os contatos captados pelo site</p>
        </div>
        <div className="flex gap-3">
          <button onClick={fetchLeads} className="p-2.5 rounded-xl border border-outline-variant text-secondary hover:text-primary hover:border-primary transition-colors">
            <RefreshCw size={18} />
          </button>
          <button onClick={exportCSV} className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-outline-variant text-secondary hover:text-primary hover:border-primary transition-colors text-sm font-medium">
            <Download size={16} /> Exportar CSV
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total de Leads', value: kpis.total, color: 'text-on-surface', bg: 'bg-surface-container-lowest' },
          { label: 'Novos',          value: kpis.novos, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Em Contato',     value: kpis.emContato, color: 'text-primary', bg: 'bg-secondary-container' },
          { label: 'Matriculados',   value: kpis.matriculados, color: 'text-green-600', bg: 'bg-green-50' },
        ].map((kpi) => (
          <div key={kpi.label} className={`${kpi.bg} rounded-2xl p-5 border border-outline-variant`}>
            <p className="text-xs text-secondary font-medium uppercase tracking-wider mb-1">{kpi.label}</p>
            <p className={`font-serif text-3xl font-bold ${kpi.color}`}>{kpi.value}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-6">
        {/* Left: Table */}
        <div className="flex-1 min-w-0">
          {/* Filters */}
          <div className="flex gap-3 mb-4">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary" />
              <input
                type="text"
                placeholder="Buscar por nome, e-mail ou telefone…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-outline-variant bg-surface-container-lowest text-sm text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-orange-100 transition-all placeholder:text-secondary/50"
              />
            </div>
            <div className="relative">
              <select
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value)}
                className="appearance-none pl-3 pr-8 py-2.5 rounded-xl border border-outline-variant bg-surface-container-lowest text-sm text-on-surface focus:outline-none focus:border-primary cursor-pointer"
              >
                {STATUS_OPTIONS.map(s => <option key={s} value={s}>{STATUS_CONFIG[s]?.label || s}</option>)}
              </select>
              <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-secondary pointer-events-none" />
            </div>
            <div className="relative">
              <select
                value={filterSegment}
                onChange={e => setFilterSegment(e.target.value)}
                className="appearance-none pl-3 pr-8 py-2.5 rounded-xl border border-outline-variant bg-surface-container-lowest text-sm text-on-surface focus:outline-none focus:border-primary cursor-pointer"
              >
                {SEGMENT_OPTIONS.map(s => <option key={s}>{s}</option>)}
              </select>
              <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-secondary pointer-events-none" />
            </div>
          </div>

          {/* Table */}
          <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center py-20 text-secondary">
                <RefreshCw size={20} className="animate-spin mr-2" /> Carregando…
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-secondary">
                <Users size={40} className="mb-3 opacity-30" />
                <p className="text-sm">Nenhum lead encontrado</p>
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-outline-variant bg-surface-container-low">
                    {['Nome', 'Contato', 'Segmento', 'Status', 'Data', ''].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-secondary uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant">
                  {filtered.map((lead) => {
                    const st = STATUS_CONFIG[lead.status] || STATUS_CONFIG.novo;
                    const Icon = st.icon;
                    return (
                      <tr
                        key={lead.id}
                        className={`hover:bg-surface-container-low transition-colors cursor-pointer ${selectedLead?.id === lead.id ? 'bg-secondary-container' : ''}`}
                        onClick={() => { setSelectedLead(lead); setNoteText(lead.notes || ''); }}
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-secondary-container flex items-center justify-center text-xs font-bold text-primary shrink-0">
                              {lead.name?.charAt(0).toUpperCase()}
                            </div>
                            <span className="text-sm font-medium text-on-surface">{lead.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-col gap-0.5">
                            <span className="text-xs text-on-surface">{lead.email}</span>
                            <span className="text-xs text-secondary">{lead.phone}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-xs text-secondary flex items-center gap-1">
                            <GraduationCap size={12} /> {lead.segment || '—'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${st.color}`}>
                            <Icon size={10} /> {st.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs text-secondary">
                          {new Date(lead.created_at).toLocaleDateString('pt-BR')}
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={e => { e.stopPropagation(); deleteLead(lead.id); }}
                            className="text-secondary hover:text-red-500 p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Right: Lead Detail */}
        {selectedLead && (
          <div className="w-80 shrink-0">
            <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant p-5 sticky top-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-serif text-base font-bold text-on-surface">Detalhes</h3>
                <button onClick={() => setSelectedLead(null)} className="text-secondary hover:text-on-surface p-1 rounded-lg">
                  <XCircle size={16} />
                </button>
              </div>

              <div className="flex items-center gap-3 mb-5">
                <div className="w-12 h-12 rounded-full bg-secondary-container flex items-center justify-center text-lg font-bold text-primary">
                  {selectedLead.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-on-surface text-sm">{selectedLead.name}</p>
                  <p className="text-xs text-secondary">{selectedLead.segment || 'Segmento não informado'}</p>
                </div>
              </div>

              <div className="space-y-2 mb-5">
                <a href={`tel:${selectedLead.phone}`} className="flex items-center gap-2 text-sm text-secondary hover:text-primary transition-colors">
                  <Phone size={14} /> {selectedLead.phone}
                </a>
                <a href={`mailto:${selectedLead.email}`} className="flex items-center gap-2 text-sm text-secondary hover:text-primary transition-colors">
                  <Mail size={14} /> {selectedLead.email}
                </a>
              </div>

              {selectedLead.message && (
                <div className="bg-surface-container-low rounded-xl p-3 mb-5">
                  <p className="text-xs text-secondary font-medium mb-1">Mensagem</p>
                  <p className="text-sm text-on-surface">{selectedLead.message}</p>
                </div>
              )}

              {/* Status change */}
              <div className="mb-5">
                <p className="text-xs text-secondary font-medium mb-2 uppercase tracking-wider">Status</p>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(STATUS_CONFIG).map(([key, cfg]) => {
                    const Icon = cfg.icon;
                    return (
                      <button
                        key={key}
                        onClick={() => updateStatus(selectedLead.id, key)}
                        className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border transition-all ${
                          selectedLead.status === key
                            ? cfg.color + ' shadow-sm'
                            : 'border-outline-variant text-secondary hover:border-primary/30'
                        }`}
                      >
                        <Icon size={12} /> {cfg.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Notes */}
              <div>
                <p className="text-xs text-secondary font-medium mb-2 uppercase tracking-wider">Anotações</p>
                <textarea
                  value={noteText}
                  onChange={e => setNoteText(e.target.value)}
                  placeholder="Adicione observações sobre este lead…"
                  rows={3}
                  className="w-full text-sm bg-surface-container-low border border-outline-variant rounded-xl p-3 text-on-surface resize-none focus:outline-none focus:border-primary focus:ring-2 focus:ring-orange-100 placeholder:text-secondary/50"
                />
                <button
                  onClick={saveNote}
                  className="mt-2 w-full bg-primary text-on-primary text-xs font-semibold py-2 rounded-xl hover:bg-primary-dark transition-colors"
                >
                  Salvar Anotação
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
