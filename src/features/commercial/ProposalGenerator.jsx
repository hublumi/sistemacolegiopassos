import React, { useState } from 'react';
import { Search, Bell, FileText, Loader2, Sparkles, ShieldCheck } from 'lucide-react';

export default function ProposalGenerator({ isSidebarCollapsed }) {
  const [clientName, setClientName] = useState('');
  const [scope, setScope] = useState([]);
  const [setup, setSetup] = useState('');
  const [recurrence, setRecurrence] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [paymentTerms, setPaymentTerms] = useState('50% de entrada + 50% na entrega');
  const [validityDays, setValidityDays] = useState(15);
  const [customScope, setCustomScope] = useState('');
  const [customScopeOptions, setCustomScopeOptions] = useState([
    "Desenvolvimento UI/UX",
    "Implementação Backend",
    "Infraestrutura Cloud",
    "Manutenção e Suporte"
  ]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleScopeChange = (item) => {
    if (scope.includes(item)) {
      setScope(scope.filter(i => i !== item));
    } else {
      setScope([...scope, item]);
    }
  };

  const handleAddCustomScope = () => {
    if (customScope.trim() && !customScopeOptions.includes(customScope.trim())) {
      const val = customScope.trim();
      setCustomScopeOptions([...customScopeOptions, val]);
      setScope([...scope, val]);
      setCustomScope('');
    }
  };

  const handleGeneratePDF = async () => {
    if (!clientName.trim()) {
      alert("Por favor, preencha o Nome do Cliente.");
      return;
    }

    setLoading(true);
    setSuccess(false);

    try {
      const response = await fetch('/api/generate-proposal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          client_name: clientName,
          scope: scope,
          setup_value: parseFloat(setup) || 0.0,
          recurrence_value: parseFloat(recurrence) || 0.0,
          project_description: projectDescription,
          payment_terms: paymentTerms,
          validity_days: parseInt(validityDays) || 15
        })
      });

      if (!response.ok) {
        throw new Error("Erro ao gerar proposta.");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `proposta_${clientName.replace(/\s+/g, '_')}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      setSuccess(true);
    } catch (err) {
      console.error(err);
      alert("Erro ao conectar ao servidor de PDF.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className={`fixed top-0 right-0 z-40 bg-background/80 backdrop-blur-md border-b border-outline-variant transition-all duration-300 ${isSidebarCollapsed ? 'w-[calc(100%-5rem)]' : 'w-[calc(100%-16rem)]'}`}>
        <div className="flex justify-between items-center h-16 px-6">
          <h2 className="text-lg font-bold text-primary">Motor Comercial</h2>
          <div className="flex items-center gap-4">
            <Search className="text-secondary hover:text-primary cursor-pointer transition-colors" size={20} strokeWidth={1.5} />
            <Bell className="text-secondary hover:text-primary cursor-pointer transition-colors" size={20} strokeWidth={1.5} />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-24 p-8 max-w-5xl mx-auto w-full">
        <div className="mb-10">
          <h2 className="text-3xl font-light text-primary tracking-tight">Gerador de Propostas</h2>
          <p className="text-secondary mt-1">Configure os detalhes comerciais para gerar um documento PDF profissional e minimalista para seus clientes.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Client Details */}
            <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm border border-surface-container">
              <h3 className="text-xs font-semibold text-secondary uppercase tracking-widest mb-4">Detalhes do Cliente</h3>
              <div>
                <label className="block text-xs text-secondary mb-1">Nome do Cliente ou Empresa</label>
                <input 
                  id="client_name"
                  type="text" 
                  value={clientName} 
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="Ex: Hospital da Plástica" 
                  className="w-full bg-surface-container-low border-none rounded-lg p-3 text-sm focus:ring-1 focus:ring-primary/5 focus:outline-none transition-all"
                />
              </div>
            </div>

            {/* Project Details */}
            <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm border border-surface-container">
              <h3 className="text-xs font-semibold text-secondary uppercase tracking-widest mb-4">Sobre o Projeto</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs text-secondary mb-1">Descrição do Projeto (Será impressa na capa)</label>
                  <textarea 
                    value={projectDescription} 
                    onChange={(e) => setProjectDescription(e.target.value)}
                    placeholder="Ex: Plataforma corporativa web sob medida projetada para unificar captação, blog médico e IA..." 
                    className="w-full bg-surface-container-low border-none rounded-lg p-3 text-sm focus:ring-1 focus:ring-primary/5 focus:outline-none transition-all h-24 resize-none"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-secondary mb-1">Condições de Pagamento</label>
                    <input 
                      type="text" 
                      value={paymentTerms} 
                      onChange={(e) => setPaymentTerms(e.target.value)}
                      placeholder="Ex: 50% de entrada + 50% na entrega" 
                      className="w-full bg-surface-container-low border-none rounded-lg p-3 text-sm focus:ring-1 focus:ring-primary/5 focus:outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-secondary mb-1">Validade da Proposta (Dias)</label>
                    <input 
                      type="number" 
                      value={validityDays} 
                      onChange={(e) => setValidityDays(e.target.value)}
                      className="w-full bg-surface-container-low border-none rounded-lg p-3 text-sm focus:ring-1 focus:ring-primary/5 focus:outline-none transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Scope */}
            <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm border border-surface-container">
              <h3 className="text-xs font-semibold text-secondary uppercase tracking-widest mb-4">Escopo do Projeto</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                {customScopeOptions.map((item) => (
                  <label key={item} className="flex items-center gap-3 p-3 bg-surface-container-low rounded-lg cursor-pointer hover:bg-surface-container-high transition-colors group">
                    <input 
                      type="checkbox" 
                      name="scope"
                      value={item}
                      checked={scope.includes(item)}
                      onChange={() => handleScopeChange(item)}
                      className="w-4 h-4 rounded border-none bg-surface-container-high text-primary focus:ring-0"
                    />
                    <span className="text-sm text-secondary group-hover:text-primary transition-colors">{item}</span>
                  </label>
                ))}
              </div>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={customScope} 
                  onChange={(e) => setCustomScope(e.target.value)}
                  placeholder="Novo módulo de escopo personalizado..." 
                  className="flex-1 bg-surface-container-low border-none rounded-lg p-3 text-sm focus:ring-1 focus:ring-primary/5 focus:outline-none"
                />
                <button 
                  type="button"
                  onClick={handleAddCustomScope}
                  className="bg-secondary/10 hover:bg-secondary/20 text-primary px-4 py-2 rounded-lg font-semibold text-sm transition-all"
                >
                  + Adicionar
                </button>
              </div>
            </div>

            {/* Value */}
            <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm border border-surface-container">
              <h3 className="text-xs font-semibold text-secondary uppercase tracking-widest mb-4">Valores e Investimento</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs text-secondary mb-1">Taxa de Setup (One-time)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary text-xs">R$</span>
                    <input 
                      id="setup_value"
                      type="number" 
                      value={setup}
                      onChange={(e) => setSetup(e.target.value)}
                      placeholder="0,00" 
                      className="w-full bg-surface-container-low border-none rounded-lg py-3 pl-10 pr-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary/5"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-secondary mb-1">Mensalidade (Fee)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary text-xs">R$</span>
                    <input 
                      id="recurrence_value"
                      type="number" 
                      value={recurrence}
                      onChange={(e) => setRecurrence(e.target.value)}
                      placeholder="0,00" 
                      className="w-full bg-surface-container-low border-none rounded-lg py-3 pl-10 pr-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary/5"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Action */}
            <div className="flex justify-end pt-4">
              <button 
                onClick={handleGeneratePDF}
                disabled={loading}
                className="bg-primary text-white px-6 py-4 rounded-xl font-bold flex items-center gap-2 hover:opacity-90 active:scale-95 transition-all shadow-md disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="animate-spin" size={18} />
                ) : (
                  <FileText size={18} />
                )}
                {loading ? "Compilando..." : "Gerar PDF Comercial"}
              </button>
            </div>
          </div>

          {/* Sidebar Preview */}
          <div className="space-y-6">
            <div className="bg-surface-container-high p-6 rounded-2xl relative overflow-hidden h-64 border border-outline-variant/10">
              <div className="relative z-10 flex flex-col h-full justify-between">
                <span className="text-xs font-semibold text-primary bg-on-primary/10 backdrop-blur px-2.5 py-1 self-start rounded">Preview Live</span>
                <div>
                  <h4 className="text-lg font-bold text-primary">
                    {success ? "Sucesso!" : clientName ? "Rascunho de Proposta" : "Status da Proposta"}
                  </h4>
                  <p className="text-sm text-secondary mt-1">
                    {success 
                      ? `A proposta comercial em PDF para ${clientName} foi compilada e baixada com sucesso.`
                      : clientName 
                      ? `Proposta para ${clientName}. Setup: R$ ${setup || '0'} | Recorrência: R$ ${recurrence || '0'}/mês.`
                      : "Aguardando preenchimento dos campos obrigatórios para compilação do draft."
                    }
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm border border-surface-container space-y-4">
              <h3 className="text-xs font-semibold text-secondary uppercase tracking-widest">Dicas do Sistema</h3>
              <ul className="space-y-4">
                <li className="flex gap-3 items-start">
                  <Sparkles className="text-primary mt-0.5" size={16} strokeWidth={1.5} />
                  <p className="text-xs text-secondary leading-relaxed">Propostas com setup acima de R$ 5k ativam automaticamente o fluxo de aprovação financeira.</p>
                </li>
                <li className="flex gap-3 items-start">
                  <ShieldCheck className="text-primary mt-0.5" size={16} strokeWidth={1.5} />
                  <p className="text-xs text-secondary leading-relaxed">As propostas ficam registradas em histórico para conferência rápida de auditoria comercial.</p>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
