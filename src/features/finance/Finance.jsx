import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import {
  Wallet, TrendingUp, TrendingDown, Link2, Plus,
  RefreshCw, Settings2, AlertCircle, CheckCircle2,
  ChevronDown, Trash2, ArrowUpRight, ArrowDownRight
} from 'lucide-react';

const CATEGORIAS_RECEITA = ['Mensalidade', 'Matrícula', 'Material Didático', 'Atividades Extracurriculares', 'Outros'];
const CATEGORIAS_DESPESA  = ['Salários', 'Manutenção', 'Marketing', 'Material de Consumo', 'Energia/Água', 'Tecnologia', 'Outros'];

function formatBRL(value) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);
}

// ── Pluggy Connection Banner ────────────────────────────────────────────────

function PluggyBanner({ onConfigured }) {
  const [clientId, setClientId] = useState(import.meta.env.VITE_PLUGGY_CLIENT_ID || '');
  const [clientSecret, setClientSecret] = useState(import.meta.env.VITE_PLUGGY_CLIENT_SECRET || '');
  const [show, setShow] = useState(false);

  const isConfigured = clientId && clientId !== 'COLE_SEU_CLIENT_ID' && clientSecret && clientSecret !== 'COLE_SEU_CLIENT_SECRET';

  if (isConfigured) return null;

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 mb-6">
      <div className="flex items-start gap-3">
        <AlertCircle size={20} className="text-amber-500 shrink-0 mt-0.5" />
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-amber-800 mb-1">Conecte sua conta bancária via Pluggy</h3>
          <p className="text-xs text-amber-700 mb-3">
            Para visualizar o fluxo bancário real, configure as credenciais Pluggy Open Finance no arquivo{' '}
            <code className="bg-amber-100 px-1 rounded font-mono">.env</code>. Obtenha em{' '}
            <a href="https://pluggy.ai" target="_blank" rel="noreferrer" className="underline font-medium">pluggy.ai</a>
          </p>
          <button onClick={() => setShow(!show)} className="text-xs text-amber-800 font-semibold hover:underline flex items-center gap-1">
            <Settings2 size={12} /> {show ? 'Fechar' : 'Configurar credenciais'}
          </button>
          {show && (
            <div className="mt-3 space-y-2">
              <input
                type="text"
                placeholder="VITE_PLUGGY_CLIENT_ID"
                value={clientId}
                onChange={e => setClientId(e.target.value)}
                className="w-full bg-white border border-amber-200 rounded-xl px-3 py-2 text-xs font-mono focus:outline-none focus:border-amber-400"
              />
              <input
                type="password"
                placeholder="VITE_PLUGGY_CLIENT_SECRET"
                value={clientSecret}
                onChange={e => setClientSecret(e.target.value)}
                className="w-full bg-white border border-amber-200 rounded-xl px-3 py-2 text-xs font-mono focus:outline-none focus:border-amber-400"
              />
              <p className="text-xs text-amber-600">⚠️ Para segurança, salve as credenciais no arquivo <code className="font-mono">.env</code> e nunca as compartilhe.</p>
            </div>
          )}
          <p className="text-xs text-amber-600 mt-3">
            🔒 Enquanto isso, você pode registrar lançamentos manualmente abaixo.
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function Finance() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [filterMonth, setFilterMonth] = useState(new Date().toISOString().slice(0, 7));
  const [form, setForm] = useState({
    tipo: 'receita', categoria: CATEGORIAS_RECEITA[0],
    descricao: '', valor: '', data: new Date().toISOString().split('T')[0], fonte: 'manual',
  });
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const fetchRecords = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from('financeiro_registros')
      .select('*')
      .order('data', { ascending: false });
    if (data) setRecords(data);
    setLoading(false);
  }, []);

  useEffect(() => { fetchRecords(); }, [fetchRecords]);

  const filteredRecords = records.filter(r => r.data?.startsWith(filterMonth));

  const totalReceitas = filteredRecords.filter(r => r.tipo === 'receita').reduce((s, r) => s + Number(r.valor), 0);
  const totalDespesas = filteredRecords.filter(r => r.tipo === 'despesa').reduce((s, r) => s + Number(r.valor), 0);
  const saldo = totalReceitas - totalDespesas;

  // Group by month for all records
  const months = [...new Set(records.map(r => r.data?.slice(0, 7)))].filter(Boolean).sort().reverse().slice(0, 6);

  const updateFormField = (field, val) => {
    setForm(prev => {
      const next = { ...prev, [field]: val };
      if (field === 'tipo') next.categoria = val === 'receita' ? CATEGORIAS_RECEITA[0] : CATEGORIAS_DESPESA[0];
      return next;
    });
  };

  const saveRecord = async () => {
    if (!form.descricao || !form.valor || !form.data) return;
    setSaving(true);
    const { error } = await supabase.from('financeiro_registros').insert([{
      ...form, valor: parseFloat(String(form.valor).replace(',', '.')),
    }]);
    if (!error) {
      setSuccessMsg('Lançamento salvo!');
      setTimeout(() => setSuccessMsg(''), 2500);
      setShowForm(false);
      setForm({ tipo: 'receita', categoria: CATEGORIAS_RECEITA[0], descricao: '', valor: '', data: new Date().toISOString().split('T')[0], fonte: 'manual' });
      fetchRecords();
    }
    setSaving(false);
  };

  const deleteRecord = async (id) => {
    if (!confirm('Excluir este lançamento?')) return;
    await supabase.from('financeiro_registros').delete().eq('id', id);
    fetchRecords();
  };

  return (
    <div className="p-8 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-serif text-3xl font-bold text-on-surface">Financeiro</h1>
          <p className="text-secondary text-sm mt-1">Fluxo de caixa e gestão financeira do colégio</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-primary text-on-primary px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-primary-dark transition-colors shadow-md shadow-orange-200"
        >
          <Plus size={16} /> Novo Lançamento
        </button>
      </div>

      {/* Pluggy Banner */}
      <PluggyBanner />

      {/* Success msg */}
      {successMsg && (
        <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
          <CheckCircle2 size={16} /> {successMsg}
        </div>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-surface-container-lowest rounded-2xl p-5 border border-outline-variant">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center"><TrendingUp size={16} className="text-green-600" /></div>
            <p className="text-xs text-secondary font-medium uppercase tracking-wider">Receitas</p>
          </div>
          <p className="font-serif text-2xl font-bold text-green-600">{formatBRL(totalReceitas)}</p>
          <p className="text-xs text-secondary mt-1">{filterMonth.replace('-', '/')}</p>
        </div>
        <div className="bg-surface-container-lowest rounded-2xl p-5 border border-outline-variant">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center"><TrendingDown size={16} className="text-red-500" /></div>
            <p className="text-xs text-secondary font-medium uppercase tracking-wider">Despesas</p>
          </div>
          <p className="font-serif text-2xl font-bold text-red-500">{formatBRL(totalDespesas)}</p>
          <p className="text-xs text-secondary mt-1">{filterMonth.replace('-', '/')}</p>
        </div>
        <div className={`rounded-2xl p-5 border ${saldo >= 0 ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'}`}>
          <div className="flex items-center gap-2 mb-3">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${saldo >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
              <Wallet size={16} className={saldo >= 0 ? 'text-green-600' : 'text-red-500'} />
            </div>
            <p className="text-xs text-secondary font-medium uppercase tracking-wider">Saldo Líquido</p>
          </div>
          <p className={`font-serif text-2xl font-bold ${saldo >= 0 ? 'text-green-600' : 'text-red-500'}`}>{formatBRL(saldo)}</p>
          <p className="text-xs text-secondary mt-1">{saldo >= 0 ? 'Positivo ✓' : 'Atenção: negativo'}</p>
        </div>
      </div>

      {/* New Record Form */}
      {showForm && (
        <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant p-6 mb-6">
          <h3 className="font-serif text-base font-bold text-on-surface mb-4">Novo Lançamento</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {/* Tipo */}
            <div>
              <label className="block text-xs font-semibold text-secondary mb-1.5 uppercase tracking-wider">Tipo</label>
              <div className="flex gap-2">
                {['receita', 'despesa'].map(t => (
                  <button
                    key={t}
                    onClick={() => updateFormField('tipo', t)}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border transition-all ${
                      form.tipo === t
                        ? t === 'receita' ? 'bg-green-500 text-white border-green-500' : 'bg-red-500 text-white border-red-500'
                        : 'border-outline-variant text-secondary hover:border-primary/30'
                    }`}
                  >
                    {t === 'receita' ? '↑ Receita' : '↓ Despesa'}
                  </button>
                ))}
              </div>
            </div>
            {/* Categoria */}
            <div>
              <label className="block text-xs font-semibold text-secondary mb-1.5 uppercase tracking-wider">Categoria</label>
              <div className="relative">
                <select
                  value={form.categoria}
                  onChange={e => updateFormField('categoria', e.target.value)}
                  className="w-full appearance-none bg-surface-container-low border border-outline-variant rounded-xl px-3 py-2.5 text-sm text-on-surface focus:outline-none focus:border-primary pr-8"
                >
                  {(form.tipo === 'receita' ? CATEGORIAS_RECEITA : CATEGORIAS_DESPESA).map(c => <option key={c}>{c}</option>)}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary pointer-events-none" />
              </div>
            </div>
            {/* Data */}
            <div>
              <label className="block text-xs font-semibold text-secondary mb-1.5 uppercase tracking-wider">Data</label>
              <input type="date" value={form.data} onChange={e => updateFormField('data', e.target.value)}
                className="w-full bg-surface-container-low border border-outline-variant rounded-xl px-3 py-2.5 text-sm text-on-surface focus:outline-none focus:border-primary" />
            </div>
            {/* Valor */}
            <div>
              <label className="block text-xs font-semibold text-secondary mb-1.5 uppercase tracking-wider">Valor (R$)</label>
              <input type="number" min="0" step="0.01" value={form.valor} onChange={e => updateFormField('valor', e.target.value)}
                placeholder="0,00"
                className="w-full bg-surface-container-low border border-outline-variant rounded-xl px-3 py-2.5 text-sm text-on-surface focus:outline-none focus:border-primary" />
            </div>
            {/* Descrição */}
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-secondary mb-1.5 uppercase tracking-wider">Descrição</label>
              <input type="text" value={form.descricao} onChange={e => updateFormField('descricao', e.target.value)}
                placeholder="Ex: Mensalidade turma Jardim II — Julho"
                className="w-full bg-surface-container-low border border-outline-variant rounded-xl px-3 py-2.5 text-sm text-on-surface focus:outline-none focus:border-primary placeholder:text-secondary/50" />
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-4">
            <button onClick={() => setShowForm(false)} className="px-4 py-2 rounded-xl border border-outline-variant text-secondary text-sm hover:text-primary transition-colors">Cancelar</button>
            <button onClick={saveRecord} disabled={saving} className="bg-primary text-on-primary px-5 py-2 rounded-xl text-sm font-semibold hover:bg-primary-dark transition-colors disabled:opacity-50 flex items-center gap-2">
              {saving ? <RefreshCw size={14} className="animate-spin" /> : null}
              Salvar Lançamento
            </button>
          </div>
        </div>
      )}

      {/* Filter + Table */}
      <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-outline-variant">
          <h2 className="font-serif text-base font-bold text-on-surface">Extrato de Lançamentos</h2>
          <div className="flex items-center gap-3">
            <div className="relative">
              <select
                value={filterMonth}
                onChange={e => setFilterMonth(e.target.value)}
                className="appearance-none bg-surface-container-low border border-outline-variant rounded-xl pl-3 pr-8 py-2 text-sm text-on-surface focus:outline-none focus:border-primary cursor-pointer"
              >
                {months.map(m => (
                  <option key={m} value={m}>{new Date(m + '-01').toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}</option>
                ))}
              </select>
              <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-secondary pointer-events-none" />
            </div>
            <button onClick={fetchRecords} className="p-2 rounded-xl border border-outline-variant text-secondary hover:text-primary hover:border-primary transition-colors">
              <RefreshCw size={16} />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16 text-secondary">
            <RefreshCw size={20} className="animate-spin mr-2" /> Carregando registros…
          </div>
        ) : filteredRecords.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-secondary">
            <Wallet size={40} className="mb-3 opacity-20" />
            <p className="text-sm">Nenhum lançamento em {filterMonth.replace('-', '/')}</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-outline-variant bg-surface-container-low">
                {['Tipo', 'Descrição', 'Categoria', 'Data', 'Valor', ''].map(h => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-secondary uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {filteredRecords.map(r => (
                <tr key={r.id} className="hover:bg-surface-container-low transition-colors">
                  <td className="px-5 py-3">
                    <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${r.tipo === 'receita' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                      {r.tipo === 'receita' ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
                      {r.tipo === 'receita' ? 'Receita' : 'Despesa'}
                    </div>
                  </td>
                  <td className="px-5 py-3 text-sm text-on-surface font-medium">{r.descricao}</td>
                  <td className="px-5 py-3 text-xs text-secondary">{r.categoria}</td>
                  <td className="px-5 py-3 text-xs text-secondary">{new Date(r.data + 'T12:00:00').toLocaleDateString('pt-BR')}</td>
                  <td className={`px-5 py-3 text-sm font-bold ${r.tipo === 'receita' ? 'text-green-600' : 'text-red-500'}`}>
                    {r.tipo === 'receita' ? '+' : '-'}{formatBRL(r.valor)}
                  </td>
                  <td className="px-5 py-3">
                    <button onClick={() => deleteRecord(r.id)} className="text-secondary hover:text-red-500 p-1.5 rounded-lg hover:bg-red-50 transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
