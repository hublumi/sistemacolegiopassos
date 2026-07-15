import React, { useState } from 'react';
import { Search, Bell, Plus, Sparkles, Send, Check } from 'lucide-react';

export default function Brainstorm({ isSidebarCollapsed }) {
  const [ideas, setIdeas] = useState([
    { id: 1, text: "Criar automação de webhooks do Supabase para notificar faturamento de novos clientes no WhatsApp." },
    { id: 2, text: "Fazer MVP do app Amora como Progressive Web App (PWA) para facilitar o acesso de nutricionistas." }
  ]);

  const [papers, setPapers] = useState([
    { id: 1, title: "Atraso no feedback loop de IA causa Decision Debt na arquitetura de microsserviços", source: "Medium Engineering" },
    { id: 2, title: "Análise qualitativa de p-valores em ensaios clínicos com nutrição funcional", source: "PubMed Central" }
  ]);

  const [newIdea, setNewIdea] = useState('');
  const [newPaperTitle, setNewPaperTitle] = useState('');
  const [newPaperSource, setNewPaperSource] = useState('');
  const [loadingId, setLoadingId] = useState(null);
  const [linkedinPost, setLinkedinPost] = useState('');

  const handleAddIdea = (e) => {
    e.preventDefault();
    if (!newIdea.trim()) return;
    setIdeas([...ideas, { id: Date.now(), text: newIdea }]);
    setNewIdea('');
  };

  const handleAddPaper = (e) => {
    e.preventDefault();
    if (!newPaperTitle.trim()) return;
    setPapers([...papers, { id: Date.now(), title: newPaperTitle, source: newPaperSource || "Web" }]);
    setNewPaperTitle('');
    setNewPaperSource('');
  };

  const handleRefineToLinkedIn = (paperId, title) => {
    setLoadingId(paperId);
    setLinkedinPost('');
    setTimeout(() => {
      setLoadingId(null);
      const generatedPost = `💡 INSIGHT TÉCNICO DO DIA:

Acabo de ler sobre "${title}" e este conceito se aplica perfeitamente ao desenvolvimento ágil moderno. 

Muitas vezes ignoramos os custos ocultos de más decisões arquiteturais prematuras (Decision Debt). Evitar complexidade desnecessária e manter ciclos rápidos de feedback loop é essencial.

O que você pensa sobre isso? Deixe nos comentários! 👇

#VibeCoding #SoftwareArchitecture #Productivity #TechLeadership`;
      setLinkedinPost(generatedPost);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className={`fixed top-0 right-0 z-40 bg-background/80 backdrop-blur-md border-b border-outline-variant transition-all duration-300 ${isSidebarCollapsed ? 'w-[calc(100%-5rem)]' : 'w-[calc(100%-16rem)]'}`}>
        <div className="flex justify-between items-center h-16 px-6">
          <h2 className="text-lg font-bold text-primary">Brainstorm & Ideação</h2>
          <div className="flex items-center gap-4">
            <Search className="text-secondary hover:text-primary cursor-pointer transition-colors" size={20} strokeWidth={1.5} />
            <Bell className="text-secondary hover:text-primary cursor-pointer transition-colors" size={20} strokeWidth={1.5} />
          </div>
        </div>
      </header>

      <main className="pt-24 p-8 max-w-5xl mx-auto w-full">
        <div className="mb-10">
          <h2 className="text-3xl font-light text-primary tracking-tight font-sans">Brainstorm & Ideação</h2>
          <p className="text-secondary mt-1">Conecte ideias soltas de engenharia e converta leituras acadêmicas em posts de marca pessoal para o LinkedIn.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Ideas column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick ideas block */}
            <div className="bg-surface-container-lowest p-6 rounded-2xl border border-surface-container shadow-sm">
              <h3 className="text-xs font-semibold text-secondary uppercase tracking-widest mb-4">Notas & Ideias de Produto</h3>
              <form onSubmit={handleAddIdea} className="flex gap-2 mb-6">
                <input 
                  type="text" 
                  value={newIdea}
                  onChange={(e) => setNewIdea(e.target.value)}
                  placeholder="Nova ideia de arquitetura ou produto..."
                  className="flex-1 bg-surface-container-low border-none rounded-lg p-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary/5"
                />
                <button type="submit" className="bg-primary text-white px-4 rounded-lg flex items-center justify-center hover:opacity-90 active:scale-95 transition-all">
                  <Plus size={18} />
                </button>
              </form>

              <div className="space-y-4">
                {ideas.map((idea) => (
                  <div key={idea.id} className="p-4 bg-surface-container-low rounded-xl text-sm text-secondary">
                    {idea.text}
                  </div>
                ))}
              </div>
            </div>

            {/* Read-it-later articles */}
            <div className="bg-surface-container-lowest p-6 rounded-2xl border border-surface-container shadow-sm">
              <h3 className="text-xs font-semibold text-secondary uppercase tracking-widest mb-4">Read-it-Later & Branding</h3>
              <form onSubmit={handleAddPaper} className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-6">
                <input 
                  type="text" 
                  value={newPaperTitle}
                  onChange={(e) => setNewPaperTitle(e.target.value)}
                  placeholder="Título do Artigo / Link"
                  className="md:col-span-2 bg-surface-container-low border-none rounded-lg p-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary/5"
                />
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={newPaperSource}
                    onChange={(e) => setNewPaperSource(e.target.value)}
                    placeholder="Fonte (ex: PubMed)"
                    className="flex-1 bg-surface-container-low border-none rounded-lg p-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary/5"
                  />
                  <button type="submit" className="bg-primary text-white px-4 rounded-lg flex items-center justify-center hover:opacity-90 active:scale-95 transition-all">
                    <Plus size={18} />
                  </button>
                </div>
              </form>

              <div className="space-y-4">
                {papers.map((paper) => (
                  <div key={paper.id} className="flex justify-between items-start p-4 bg-surface-container-low rounded-xl">
                    <div className="flex-1 pr-4">
                      <span className="block text-sm font-semibold text-primary">{paper.title}</span>
                      <span className="text-xs text-secondary mt-1 block">{paper.source}</span>
                    </div>
                    <button 
                      onClick={() => handleRefineToLinkedIn(paper.id, paper.title)}
                      disabled={loadingId !== null}
                      className="bg-primary text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 hover:opacity-90 active:scale-95 transition-all"
                    >
                      <Sparkles size={12} />
                      {loadingId === paper.id ? "Refinando..." : "Gerar Post"}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* AI Refiner Workspace */}
          <div className="space-y-6">
            <div className="bg-surface-container-lowest p-6 rounded-2xl border border-surface-container shadow-sm h-full min-h-[400px] flex flex-col justify-between">
              <div>
                <h3 className="text-xs font-semibold text-secondary uppercase tracking-widest mb-4">Fila do LinkedIn</h3>
                {linkedinPost ? (
                  <textarea 
                    value={linkedinPost} 
                    onChange={(e) => setLinkedinPost(e.target.value)}
                    className="w-full h-80 bg-surface-container-low border-none rounded-lg p-3 text-xs focus:outline-none focus:ring-1 focus:ring-primary/5 font-sans leading-relaxed text-secondary"
                  />
                ) : (
                  <div className="text-xs text-zinc-400 leading-relaxed py-20 text-center">
                    Clique em "Gerar Post" em algum artigo para a IA redigir um rascunho de alto valor para o seu perfil.
                  </div>
                )}
              </div>
              {linkedinPost && (
                <button 
                  onClick={() => {
                    alert("Post adicionado à fila do LinkedIn!");
                    setLinkedinPost('');
                  }}
                  className="w-full bg-primary text-white py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 hover:opacity-90 active:scale-95 transition-all mt-6"
                >
                  <Send size={14} />
                  Agendar Publicação
                </button>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
