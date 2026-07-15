import React, { useState, useRef, useEffect } from 'react';
import { Search, Bell, Paperclip, Mic, ArrowUp, History, Sparkles } from 'lucide-react';

export default function AIHub({ isSidebarCollapsed }) {
  const [messages, setMessages] = useState([
    {
      sender: "Monolith AI",
      text: "Bem-vindo de volta. Seu ambiente Digital Zen está sincronizado. Como otimizaremos seu fluxo de trabalho hoje?"
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [currentAgent, setCurrentAgent] = useState('Monolith AI');
  const [typing, setTyping] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [messages, typing]);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userText = inputValue;
    const userMsg = { sender: "Você", text: userText };
    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setTyping(true);

    try {
      const response = await fetch('http://localhost:8000/api/chat/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userText,
          agent: currentAgent
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Falha ao obter resposta do assistente.');
      }

      const data = await response.json();
      setMessages(prev => [...prev, { sender: currentAgent, text: data.response }]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { sender: 'Sistema', text: `Erro: ${error.message}` }]);
    } finally {
      setTyping(false);
    }
  };

  const handleAgentToggle = (agent) => {
    setCurrentAgent(agent);
    setInputValue('');
  };

  return (
    <div className="min-h-screen bg-surface-container-lowest flex flex-col h-screen relative overflow-hidden">
      {/* Header */}
      <header className={`fixed top-0 right-0 z-40 bg-surface-container-lowest/80 backdrop-blur-md border-b border-outline-variant transition-all duration-300 ${isSidebarCollapsed ? 'w-[calc(100%-5rem)]' : 'w-[calc(100%-16rem)]'}`}>
        <div className="flex justify-between items-center h-16 px-6">
          <div className="flex items-center gap-6">
            <span className="text-sm font-bold tracking-wider text-primary uppercase">Hub de IA</span>
            <span className="text-xs text-secondary bg-surface-container-low px-2 py-1 rounded">Agente: {currentAgent}</span>
          </div>
          <div className="flex items-center gap-4">
            <Search className="text-secondary hover:text-primary cursor-pointer transition-colors" size={20} strokeWidth={1.5} />
            <Bell className="text-secondary hover:text-primary cursor-pointer transition-colors" size={20} strokeWidth={1.5} />
          </div>
        </div>
      </header>

      {/* Chat Messages */}
      <div ref={containerRef} className="flex-1 overflow-y-auto pt-24 pb-40 px-8 max-w-3xl mx-auto w-full space-y-8">
        {messages.map((msg, index) => (
          <div key={index} className="animate-in fade-in duration-300">
            <p className="text-sm font-bold text-primary mb-1">{msg.sender}</p>
            <div className="text-base text-secondary leading-relaxed">{msg.text}</div>
          </div>
        ))}
        {typing && (
          <div className="animate-pulse">
            <p className="text-sm font-bold text-primary mb-1">{currentAgent}</p>
            <div className="text-base text-zinc-400">Pensando...</div>
          </div>
        )}
      </div>

      {/* Input Bar */}
      <div className={`fixed bottom-0 right-0 p-8 pointer-events-none transition-all duration-300 ${isSidebarCollapsed ? 'w-[calc(100%-5rem)]' : 'w-[calc(100%-16rem)]'}`}>
        <div className="max-w-2xl mx-auto pointer-events-auto">
          <div className="bg-surface-container-lowest border border-zinc-200 shadow-md rounded-full px-5 py-2.5 flex items-center gap-4">
            <Paperclip className="text-secondary hover:text-primary cursor-pointer transition-colors" size={20} strokeWidth={1.5} />
            <input 
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder={currentAgent === "Dev Agent" 
                ? "Pergunte algo sobre código/banco para o Dev Agent..." 
                : currentAgent === "Auditor Científico" 
                ? "Pergunte algo sobre p-valores para o Auditor Científico..." 
                : currentAgent === "Social Creator"
                ? "Digite um tema para gerar posts (ex: microsserviços vs monólito)..."
                : "Digite sua instrução..."}
              className="flex-1 bg-transparent border-none focus:outline-none text-base text-on-surface placeholder:text-zinc-400 focus:ring-0"
            />
            <div className="flex items-center gap-2">
              <Mic className="text-secondary hover:text-primary cursor-pointer transition-colors p-1" size={24} strokeWidth={1.5} />
              <button 
                onClick={handleSendMessage}
                className="w-10 h-10 bg-primary text-on-primary rounded-full flex items-center justify-center transition-all hover:scale-105 active:scale-95 shadow-sm"
              >
                <ArrowUp size={18} />
              </button>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex justify-center gap-8 mt-4">
            <button 
              onClick={() => handleAgentToggle('Dev Agent')}
              className={`text-xs font-semibold transition-colors flex items-center gap-1 ${
                currentAgent === 'Dev Agent' ? 'text-primary' : 'text-zinc-400 hover:text-primary'
              }`}
            >
              <History size={14} />
              Dev Agent
            </button>
            <button 
              onClick={() => handleAgentToggle('Auditor Científico')}
              className={`text-xs font-semibold transition-colors flex items-center gap-1 ${
                currentAgent === 'Auditor Científico' ? 'text-primary' : 'text-zinc-400 hover:text-primary'
              }`}
            >
              <Sparkles size={14} />
              Auditor Científico
            </button>
            <button 
              onClick={() => handleAgentToggle('Social Creator')}
              className={`text-xs font-semibold transition-colors flex items-center gap-1 ${
                currentAgent === 'Social Creator' ? 'text-primary' : 'text-zinc-400 hover:text-primary'
              }`}
            >
              <Sparkles size={14} />
              Social Creator
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
