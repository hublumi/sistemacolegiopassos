import React, { useState, useEffect } from 'react';
import { Search, Bell, Calendar as CalendarIcon, Sparkles, Check, AlertCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export default function CalendarView({ isSidebarCollapsed }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchingCalendar, setFetchingCalendar] = useState(true);

  // Verifica as credenciais de ambiente para liberar o painel
  const hasGoogleEnv = import.meta.env.VITE_GOOGLE_CLIENT_ID && !import.meta.env.VITE_GOOGLE_CLIENT_ID.includes('COLE_');

  const loadCalendar = () => {
    setFetchingCalendar(true);
    
    // Mocking initial events for demonstration of connected state
    setTimeout(() => {
      const mockEvents = [
        { id: 1, title: 'Reunião Coordenação Pedagógica', day: 'Segunda', time: '10:00 - 11:30', type: 'Work' },
        { id: 2, title: 'Aula Educação Física (Quadra 1)', day: 'Terça', time: '08:00 - 09:30', type: 'Physical' },
        { id: 3, title: 'Treinamento Professores', day: 'Quarta', time: '14:00 - 16:00', type: 'Academic' },
        { id: 4, title: 'Entrevista Pais (Novo Aluno)', day: 'Quinta', time: '09:00 - 10:00', type: 'Work' }
      ];
      setEvents(mockEvents);
      setFetchingCalendar(false);
    }, 1200);
  };

  useEffect(() => {
    if (hasGoogleEnv) {
      loadCalendar();
    }
  }, [hasGoogleEnv]);

  const handleSmartTimeblocking = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      // Auto block open spaces
      const deepWorkEvents = [
        { id: Date.now() + 1, title: 'Deep Work: Revisão Curricular', day: 'Segunda', time: '14:00 - 16:30', type: 'DeepWork' },
        { id: Date.now() + 2, title: 'Deep Work: Planejamento Financeiro', day: 'Quarta', time: '09:00 - 11:30', type: 'DeepWork' },
        { id: Date.now() + 3, title: 'Deep Work: Reunião Diretoria', day: 'Sexta', time: '15:00 - 17:30', type: 'DeepWork' }
      ];
      setEvents(prev => [...prev, ...deepWorkEvents]);
      alert("Smart Timeblocking concluído! Espaços vazios preenchidos de forma inteligente para a diretoria.");
    }, 1500);
  };

  const daysOfWeek = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta'];

  if (!hasGoogleEnv) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <header className={`fixed top-0 right-0 z-40 bg-background/80 backdrop-blur-md border-b border-outline-variant transition-all duration-300 ${isSidebarCollapsed ? 'w-[calc(100%-5rem)]' : 'w-[calc(100%-16rem)]'}`}>
          <div className="flex justify-between items-center h-16 px-6">
            <h2 className="text-lg font-bold text-primary">Calendário & Timeblocking</h2>
            <div className="flex items-center gap-4">
              <Search className="text-secondary hover:text-primary cursor-pointer transition-colors" size={20} strokeWidth={1.5} />
              <Bell className="text-secondary hover:text-primary cursor-pointer transition-colors" size={20} strokeWidth={1.5} />
            </div>
          </div>
        </header>

        <main className="pt-24 p-8 w-full flex-1 max-w-5xl mx-auto">
          <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-10 text-center max-w-lg mx-auto mt-10 shadow-sm">
            <CalendarIcon className="mx-auto h-12 w-12 text-zinc-400 mb-4" />
            <h3 className="text-xl font-bold text-primary mb-2">Conecte o Google Workspace</h3>
            <p className="text-sm text-secondary mb-6">
              Para visualizar a agenda sincronizada e usar o Timeblocking Inteligente, é necessário configurar as credenciais do Google Cloud.
            </p>
            <div className="bg-surface-container-low p-4 rounded-xl text-left mb-6 border border-outline-variant/30">
              <p className="text-xs font-mono text-zinc-600 mb-2 font-bold">Adicione ao seu arquivo .env</p>
              <code className="text-xs text-primary bg-zinc-100 px-2 py-1 rounded block mb-2">VITE_GOOGLE_CLIENT_ID=seu_client_id</code>
              <code className="text-xs text-primary bg-zinc-100 px-2 py-1 rounded block">VITE_GOOGLE_API_KEY=sua_api_key</code>
            </div>
            <p className="text-xs text-secondary italic">Acesse Configurações para mais detalhes.</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className={`fixed top-0 right-0 z-40 bg-background/80 backdrop-blur-md border-b border-outline-variant transition-all duration-300 ${isSidebarCollapsed ? 'w-[calc(100%-5rem)]' : 'w-[calc(100%-16rem)]'}`}>
        <div className="flex justify-between items-center h-16 px-6">
          <h2 className="text-lg font-bold text-primary">Timeblocking Inteligente</h2>
          <div className="flex items-center gap-4">
            <Search className="text-secondary hover:text-primary cursor-pointer transition-colors" size={20} strokeWidth={1.5} />
            <Bell className="text-secondary hover:text-primary cursor-pointer transition-colors" size={20} strokeWidth={1.5} />
          </div>
        </div>
      </header>

      <main className="pt-24 p-8 w-full flex-1 max-w-5xl mx-auto">
        <div className="flex justify-between items-start mb-10">
          <div>
            <h2 className="text-3xl font-light text-primary tracking-tight font-sans">Calendário & Timeblocking</h2>
            <p className="text-secondary mt-1">Sincronização bidirecional com Google Calendar para alocação inteligente de Deep Work escolar.</p>
          </div>
          <button 
            onClick={handleSmartTimeblocking}
            disabled={loading}
            className="bg-primary text-on-primary px-5 py-3 rounded-xl text-sm font-semibold flex items-center gap-2 hover:opacity-90 active:scale-95 transition-all shadow-md disabled:opacity-50"
          >
            <Sparkles size={16} />
            {loading ? "Calculando..." : "Smart Timeblocking"}
          </button>
        </div>

        {/* Weekly View Grid */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          {daysOfWeek.map((day) => {
            const dayEvents = events.filter(e => e.day === day);
            return (
              <div key={day} className="bg-surface-container-lowest p-5 rounded-2xl border border-surface-container shadow-sm flex flex-col h-[400px]">
                <h3 className="text-xs font-semibold text-secondary uppercase tracking-widest border-b border-surface-container-low pb-2 mb-4">
                  {day}
                </h3>
                <div className="flex-1 space-y-3 overflow-y-auto pr-1">
                  {fetchingCalendar ? (
                    <div className="text-center py-20 text-[10px] text-zinc-400 animate-pulse">
                      Sincronizando...
                    </div>
                  ) : (
                    <>
                      {/* Event items list */}
                  {dayEvents.length > 0 ? (
                    dayEvents.map(event => (
                      <div 
                        key={event.id} 
                        className={`p-3 rounded-xl border text-xs leading-relaxed ${
                          event.type === 'DeepWork' 
                            ? 'bg-primary text-white border-primary' 
                            : event.type === 'Academic'
                            ? 'bg-orange-50 text-orange-900 border-orange-200'
                            : event.type === 'Physical'
                            ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
                            : 'bg-surface-container-low text-secondary border-outline-variant/10'
                        }`}
                      >
                        <span className="block font-semibold">{event.title}</span>
                        <span className="block mt-1 opacity-70 font-mono">{event.time}</span>
                      </div>
                    ))
                  ) : (
                    <div className="text-[10px] text-zinc-400 text-center py-20">
                      Sem eventos
                    </div>
                  )}
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
