import React, { useState, useEffect } from 'react';
import { Search, Bell, Globe, Key, CreditCard, Sparkles, CheckCircle2, ShieldCheck, Loader2 } from 'lucide-react';
import { PluggyConnect } from 'react-pluggy-connect';
import { supabase } from '../../lib/supabase';
import { useLocation } from 'react-router-dom';

export default function Settings({ isSidebarCollapsed }) {
  const [googleConnected, setGoogleConnected] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  // APIs
  const [openaiKey, setOpenaiKey] = useState('');
  const [apisSaved, setApisSaved] = useState(false);
  const [apisSaving, setApisSaving] = useState(false);
  
  // Environment Keys Status
  const hasGoogleEnv = import.meta.env.VITE_GOOGLE_CLIENT_ID && !import.meta.env.VITE_GOOGLE_CLIENT_ID.includes('COLE_');
  const hasPluggyEnv = import.meta.env.VITE_PLUGGY_CLIENT_ID && !import.meta.env.VITE_PLUGGY_CLIENT_ID.includes('COLE_');

  useEffect(() => {
    // Check local configurations instead of backend
    const localOpenAi = localStorage.getItem('passos_openai_key');
    if (localOpenAi) setOpenaiKey(localOpenAi);
    
    // Set google status based on .env
    setGoogleConnected(hasGoogleEnv);
  }, [hasGoogleEnv]);

  // Pluggy (Open Finance)
  const [pluggyConnected, setPluggyConnected] = useState(false);
  const [pluggyLoading, setPluggyLoading] = useState(false);
  const [showPluggyWidget, setShowPluggyWidget] = useState(false);
  const [selectedBank, setSelectedBank] = useState('');

  const handleConnectGoogle = async () => {
    setGoogleLoading(true);
    // Simula a conexão OAuth caso o usuário tente clicar, mostrando um alerta de que precisa por na .env
    setTimeout(() => {
      setGoogleLoading(false);
      alert("Para conectar ao Google, adicione seu VITE_GOOGLE_CLIENT_ID no arquivo .env");
    }, 1000);
  };

  const handleOpenPluggyConnect = () => {
    if (!hasPluggyEnv) {
       alert("Para conectar ao Pluggy, adicione as credenciais no arquivo .env");
       return;
    }
    // Como não há backend para gerar token de acesso de verdade, apenas simulamos a ui pra fins de demonstração
    setShowPluggyWidget(true);
  };

  const handleSaveAPIs = (e) => {
    e.preventDefault();
    setApisSaving(true);
    setTimeout(() => {
      localStorage.setItem('passos_openai_key', openaiKey);
      setApisSaved(true);
      setApisSaving(false);
      setTimeout(() => setApisSaved(false), 3000);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className={`fixed top-0 right-0 z-40 bg-background/80 backdrop-blur-md border-b border-outline-variant transition-all duration-300 ${isSidebarCollapsed ? 'w-[calc(100%-5rem)]' : 'w-[calc(100%-16rem)]'}`}>
        <div className="flex justify-between items-center h-16 px-6">
          <h2 className="text-lg font-bold text-primary">Configurações do Sistema</h2>
          <div className="flex items-center gap-4">
            <Search className="text-secondary hover:text-primary cursor-pointer transition-colors" size={20} strokeWidth={1.5} />
            <Bell className="text-secondary hover:text-primary cursor-pointer transition-colors" size={20} strokeWidth={1.5} />
          </div>
        </div>
      </header>

      <main className="pt-24 p-8 max-w-4xl mx-auto w-full">
        <div className="mb-10">
          <h2 className="text-3xl font-light text-primary tracking-tight font-sans">Configurações & Conexões</h2>
          <p className="text-secondary mt-1">Conecte seus provedores externos, configure chaves de API com segurança e gerencie integrações financeiras.</p>
        </div>

        <div className="space-y-8">
          {/* Section 1: Google Integration */}
          <section className="bg-surface-container-lowest p-6 rounded-2xl border border-surface-container shadow-sm">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-sm font-bold text-primary flex items-center gap-2">
                  <Globe size={18} className="text-zinc-600" />
                  Google Workspace
                </h3>
                <p className="text-xs text-secondary mt-1">Sincronize o Google Calendar para Smart Timeblocking e conecte o Gmail para usar o Inbox Summarizer.</p>
              </div>
              <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${googleConnected ? 'bg-zinc-100 text-zinc-800' : 'bg-surface-container-low text-secondary'}`}>
                {googleConnected ? 'Conectado' : 'Desconectado'}
              </span>
            </div>

            <div className="flex justify-between items-center bg-surface-container-low p-4 rounded-xl">
              <span className="text-xs text-secondary">
                {googleConnected ? 'Conta vinculada: pedromlzaparoli@gmail.com' : 'Nenhuma conta do Google vinculada ao Personal OS.'}
              </span>
              <button 
                onClick={handleConnectGoogle}
                disabled={googleLoading || googleConnected}
                className="bg-primary text-on-primary px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 hover:opacity-90 active:scale-95 transition-all disabled:opacity-50"
              >
                {googleLoading ? (
                  <Loader2 className="animate-spin" size={14} />
                ) : (
                  <Globe size={14} />
                )}
                {googleLoading ? 'Autenticando...' : googleConnected ? 'Conectado com Sucesso' : 'Conectar Conta Google'}
              </button>
            </div>
          </section>

          {/* Section 2: API Keys Management */}
          <section className="bg-surface-container-lowest p-6 rounded-2xl border border-surface-container shadow-sm">
            <div className="mb-6">
              <h3 className="text-sm font-bold text-primary flex items-center gap-2">
                <Key size={18} className="text-zinc-600" />
                Credenciais de APIs
              </h3>
              <p className="text-xs text-secondary mt-1">Insira suas chaves de API para alimentar as tarefas de desenvolvimento e resumidores de IA.</p>
            </div>

            <form onSubmit={handleSaveAPIs} className="space-y-4">
              <div>
                <label className="block text-xs text-secondary mb-1">Google Gemini API Key</label>
                <input 
                  type="password" 
                  value={openaiKey}
                  onChange={(e) => setOpenaiKey(e.target.value)}
                  placeholder="AIzaSy..."
                  className="w-full bg-surface-container-low border-none rounded-lg p-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary/5 font-mono"
                />
              </div>

              <div className="flex justify-between items-center pt-2">
                <span className="text-xs text-secondary flex items-center gap-1">
                  <ShieldCheck size={14} className="text-zinc-500" />
                  As credenciais adicionais são geridas automaticamente pelo arquivo .env.
                </span>
                <button 
                  type="submit" 
                  className="bg-primary text-on-primary px-5 py-2.5 rounded-xl text-xs font-bold hover:opacity-90 active:scale-95 transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {apisSaving && <Loader2 className="animate-spin" size={14} />}
                  {apisSaved ? "Salvo com Sucesso!" : apisSaving ? "Salvando..." : "Salvar Credencial"}
                </button>
              </div>
            </form>
          </section>

          {/* Section 3: Pluggy (Open Finance) */}
          <section className="bg-surface-container-lowest p-6 rounded-2xl border border-surface-container shadow-sm">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-sm font-bold text-primary flex items-center gap-2">
                  <CreditCard size={18} className="text-zinc-600" />
                  Sincronização Bancária (Pluggy API)
                </h3>
                <p className="text-xs text-secondary mt-1">Conecte a conta bancária do Colégio Passos via Open Finance pelo Pluggy para rastrear fluxo de caixa automaticamente.</p>
              </div>
              <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${pluggyConnected ? 'bg-zinc-100 text-zinc-800' : 'bg-surface-container-low text-secondary'}`}>
                {pluggyConnected ? `Nubank Ativo` : 'Desconectado'}
              </span>
            </div>

            {pluggyConnected ? (
              <div className="bg-surface-container-low p-4 rounded-xl flex justify-between items-center">
                <span className="text-xs text-secondary">
                  Conta vinculada com sucesso no {selectedBank}. Última sincronização há 5 minutos.
                </span>
                <button 
                  onClick={() => setPluggyConnected(false)}
                  className="text-xs text-secondary underline hover:text-primary transition-colors"
                >
                  Desconectar banco
                </button>
              </div>
            ) : (
              <div>
                {showPluggyWidget ? (
                  <div className="bg-surface-container-low p-6 rounded-xl border border-dashed border-outline-variant/40 animate-in fade-in duration-300">
                    {fetchingToken ? (
                      <div className="flex flex-col items-center justify-center py-10 gap-2">
                        <Loader2 className="animate-spin text-primary" size={24} />
                        <span className="text-xs text-secondary">Obtendo Token de Acesso da Pluggy...</span>
                      </div>
                    ) : fetchError ? (
                      <div className="text-center py-6">
                        <p className="text-xs text-zinc-600 font-bold mb-2">Erro de Conexão</p>
                        <p className="text-xs text-secondary mb-4">{fetchError}</p>
                        <button 
                          onClick={() => setShowPluggyWidget(false)}
                          className="bg-primary text-white px-4 py-2 rounded-lg text-xs font-bold"
                        >
                          Fechar
                        </button>
                      </div>
                    ) : connectToken ? (
                      <div className="w-full">
                        <PluggyConnect
                          connectToken={connectToken}
                          includeSandbox={true}
                          onSuccess={(itemData) => {
                            console.log('Connected!', itemData);
                            setPluggyConnected(true);
                            setSelectedBank(itemData.item?.connector?.name || 'Banco Vinculado');
                            setShowPluggyWidget(false);
                          }}
                          onError={(error) => {
                            console.error('Connection failed', error);
                            alert('A conexão falhou ou foi cancelada.');
                            setShowPluggyWidget(false);
                          }}
                        />
                      </div>
                    ) : (
                      <div className="text-xs text-secondary text-center py-4">Iniciando...</div>
                    )}
                  </div>
                ) : (
                  <div className="flex justify-between items-center bg-surface-container-low p-4 rounded-xl">
                    <span className="text-xs text-secondary">
                      Conecte sua instituição para automatizar a consolidação do caixa comercial do Amora.
                    </span>
                    <button 
                      onClick={handleOpenPluggyConnect}
                      className="bg-primary text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 hover:opacity-90 active:scale-95 transition-all"
                    >
                      <Sparkles size={14} />
                      Conectar via Pluggy
                    </button>
                  </div>
                )}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
