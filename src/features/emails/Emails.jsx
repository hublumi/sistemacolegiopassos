import React, { useState, useEffect } from 'react';
import { Search, Bell, Mail, Sparkles, AlertCircle, CheckCircle2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export default function Emails({ isSidebarCollapsed }) {
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchingEmails, setFetchingEmails] = useState(true);
  const [summary, setSummary] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  const loadEmails = async () => {
    setFetchingEmails(true);
    setErrorMessage('');
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setErrorMessage('Usuário não autenticado.');
        setFetchingEmails(false);
        return;
      }
      
      const res = await fetch('http://localhost:8000/api/google/emails', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Falha ao sincronizar e-mails do Google.');
      }
      
      const data = await res.json();
      setEmails(data);
    } catch (err) {
      console.error(err);
      setErrorMessage(err.message);
    } finally {
      setFetchingEmails(false);
    }
  };

  useEffect(() => {
    loadEmails();
  }, []);

  const handleSummarize = async () => {
    if (emails.length === 0) return;
    setLoading(true);
    setSummary(null);
    setErrorMessage('');
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setErrorMessage('Usuário não autenticado.');
        setLoading(false);
        return;
      }
      
      const res = await fetch('http://localhost:8000/api/google/emails/summarize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ emails })
      });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Falha ao gerar resumo dos e-mails.');
      }
      
      const data = await res.json();
      setSummary(data);
      // Mark local emails as read for UI effect
      setEmails(emails.map(e => ({ ...e, read: true })));
    } catch (err) {
      console.error(err);
      setErrorMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className={`fixed top-0 right-0 z-40 bg-background/80 backdrop-blur-md border-b border-outline-variant transition-all duration-300 ${isSidebarCollapsed ? 'w-[calc(100%-5rem)]' : 'w-[calc(100%-16rem)]'}`}>
        <div className="flex justify-between items-center h-16 px-6">
          <h2 className="text-lg font-bold text-primary">Resumidor de E-mails</h2>
          <div className="flex items-center gap-4">
            <Search className="text-secondary hover:text-primary cursor-pointer transition-colors" size={20} strokeWidth={1.5} />
            <Bell className="text-secondary hover:text-primary cursor-pointer transition-colors" size={20} strokeWidth={1.5} />
          </div>
        </div>
      </header>

      <main className="pt-24 p-8 max-w-5xl mx-auto w-full">
        <div className="flex justify-between items-start mb-10">
          <div>
            <h2 className="text-3xl font-light text-primary tracking-tight font-sans">Inbox & E-mails</h2>
            <p className="text-secondary mt-1">Inbox Summarizer filtra e condensa seus e-mails não lidos de infraestrutura e extrai ações pendentes.</p>
          </div>
          <button 
            onClick={handleSummarize}
            disabled={loading || emails.length === 0}
            className="bg-primary text-on-primary px-5 py-3 rounded-xl text-sm font-semibold flex items-center gap-2 hover:opacity-90 active:scale-95 transition-all shadow-md disabled:opacity-50"
          >
            <Sparkles size={16} />
            {loading ? "Processando..." : "Resumir Inbox"}
          </button>
        </div>

        {errorMessage && (
          <div className="mb-6 p-4 bg-zinc-50 border border-zinc-200 text-secondary text-xs rounded-xl flex items-center gap-2">
            <AlertCircle size={16} className="text-primary flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Email list */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-surface-container-lowest p-6 rounded-2xl border border-surface-container shadow-sm">
              <h3 className="text-xs font-semibold text-secondary uppercase tracking-widest mb-6">Mensagens Recentes</h3>
              <div className="space-y-4">
                {fetchingEmails ? (
                  <div className="text-center py-10 text-xs text-secondary animate-pulse">
                    Buscando e-mails não lidos no Gmail...
                  </div>
                ) : emails.length === 0 ? (
                  <div className="text-center py-10 text-xs text-secondary">
                    Nenhum e-mail não lido encontrado.
                  </div>
                ) : (
                  emails.map((email) => (
                    <div key={email.id} className={`flex gap-4 p-4 rounded-xl transition-all duration-200 ${email.read ? 'bg-surface-container-low/50 opacity-70' : 'bg-surface-container-low border border-zinc-100'}`}>
                      <div className="mt-1">
                        <Mail size={18} className={email.read ? 'text-zinc-400' : 'text-primary'} />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <span className="text-sm font-bold text-primary">{email.from}</span>
                          {!email.read && <span className="h-2 w-2 rounded-full bg-primary mt-1.5"></span>}
                        </div>
                        <span className="block text-sm font-semibold text-zinc-950 mt-1">{email.subject}</span>
                        <p className="text-xs text-secondary mt-1 leading-relaxed">{email.snippet}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* AI summaries column */}
          <div className="space-y-6">
            <div className="bg-surface-container-lowest p-6 rounded-2xl border border-surface-container shadow-sm h-full min-h-[350px] flex flex-col justify-between">
              <div>
                <h3 className="text-xs font-semibold text-secondary uppercase tracking-widest mb-4">Resumo da IA</h3>
                {summary ? (
                  <div className="space-y-6">
                    <div>
                      <span className="block text-xs font-semibold text-primary uppercase tracking-wider mb-2">Visão Geral</span>
                      <p className="text-xs text-secondary leading-relaxed bg-surface-container-low p-3 rounded-lg">{summary.brief}</p>
                    </div>
                    <div>
                      <span className="block text-xs font-semibold text-primary uppercase tracking-wider mb-2">Ações Pendentes (To-dos)</span>
                      <ul className="space-y-3">
                        {summary.actions.map((act, idx) => (
                          <li key={idx} className="flex gap-2 items-start text-xs text-secondary leading-relaxed">
                            <AlertCircle size={14} className="text-primary mt-0.5 flex-shrink-0" />
                            <span>{act}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ) : (
                  <div className="text-xs text-zinc-400 leading-relaxed py-20 text-center">
                    {loading ? "A IA está processando e condensando seus e-mails do dia..." : "Clique em 'Resumir Inbox' para ativar o processamento de linguagem natural."}
                  </div>
                )}
              </div>

              {summary && (
                <div className="pt-4 border-t border-surface-container-low flex items-center gap-2 text-xs text-primary font-bold">
                  <CheckCircle2 size={16} />
                  Inbox analisada com sucesso.
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
