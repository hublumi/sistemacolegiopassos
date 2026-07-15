import React, { useState } from 'react';
import { Search, Bell, Mail, Sparkles, AlertCircle, Inbox, Send, Archive, Loader2, Info } from 'lucide-react';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Mock de e-mails para a demonstração
const mockEmails = [
  {
    id: 1,
    sender: 'Mãe do João Silva',
    email: 'joao.silva.mom@gmail.com',
    subject: 'Dúvida sobre matrícula e horários do contraturno',
    date: 'Hoje, 09:30',
    unread: true,
    body: 'Olá equipe do Colégio Passos,\n\nGostaria de saber mais detalhes sobre a matrícula do João. Ele está indo para o 6º ano no ano que vem. Vi no site que vocês possuem o método Super Cérebro e opções de contraturno. Minhas dúvidas são:\n\n1. O contraturno funciona todos os dias da semana?\n2. O almoço está incluso na mensalidade integral?\n3. Qual o limite de vagas para o Taekwondo?\n\nAlém disso, gostaria de agendar uma visita para conhecer as quadras esportivas na próxima sexta-feira, se possível na parte da manhã, por volta das 10h.\n\nAguardo retorno, obrigada!'
  },
  {
    id: 2,
    sender: 'Fornecedor Editora Abril',
    email: 'contato@abril.com.br',
    subject: 'Atraso na entrega dos livros didáticos (Lote B)',
    date: 'Ontem, 16:45',
    unread: false,
    body: 'Prezados,\n\nInformamos que houve um imprevisto na transportadora responsável pela carga do Lote B de livros do Ensino Fundamental. A nova previsão de chegada é para o dia 25. Pedimos desculpas pelo transtorno e estamos monitorando a carga. Caso necessitem de material em PDF emergencial, podemos disponibilizar na plataforma do professor.'
  },
  {
    id: 3,
    sender: 'Carlos Professor (Ciências)',
    email: 'carlos.ciencias@passos.com',
    subject: 'Planejamento Feira de Ciências - Solicitação de Materiais',
    date: 'Ontem, 11:20',
    unread: false,
    body: 'Bom dia Direção,\n\nSegue a lista de materiais necessários para a primeira etapa da feira de ciências das turmas de 8º e 9º ano:\n- 15 cartolinas brancas\n- 5 kits de LEDs\n- Baterias 9V (10 unidades)\n- Fitas isolantes\n\nPreciso que esses itens sejam comprados até a semana que vem para iniciarmos os laboratórios. Podemos aprovar esse orçamento?'
  }
];

export default function EmailView({ isSidebarCollapsed }) {
  const [activeFolder, setActiveFolder] = useState('inbox');
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [aiSummary, setAiSummary] = useState(null);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [error, setError] = useState('');

  // Simulação de verificação da variável de ambiente para liberar o painel
  const hasGoogleEnv = import.meta.env.VITE_GOOGLE_CLIENT_ID && !import.meta.env.VITE_GOOGLE_CLIENT_ID.includes('COLE_');
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

  const handleSummarize = async () => {
    if (!selectedEmail) return;
    if (!apiKey || apiKey.includes('SUA_CHAVE')) {
      setError('A chave do Gemini (VITE_GEMINI_API_KEY) não está configurada no .env.');
      return;
    }

    setIsSummarizing(true);
    setError('');
    
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      
      const prompt = `
        Aja como um assistente escolar extremamente eficiente.
        Leia o e-mail abaixo e extraia um resumo direto e em tópicos.
        Se houverem perguntas do remente, liste-as. Se houverem tarefas para o diretor, liste-as.
        Seja breve, profissional e destaque a urgência (Alta, Média ou Baixa).

        Remetente: ${selectedEmail.sender}
        Assunto: ${selectedEmail.subject}
        Mensagem:
        ${selectedEmail.body}
      `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      setAiSummary(response.text());
    } catch (err) {
      console.error(err);
      setError('Falha ao gerar resumo. Verifique a chave da API.');
    } finally {
      setIsSummarizing(false);
    }
  };

  const closeEmail = () => {
    setSelectedEmail(null);
    setAiSummary(null);
    setError('');
  };

  if (!hasGoogleEnv) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <header className={`fixed top-0 right-0 z-40 bg-background/80 backdrop-blur-md border-b border-outline-variant transition-all duration-300 ${isSidebarCollapsed ? 'w-[calc(100%-5rem)]' : 'w-[calc(100%-16rem)]'}`}>
          <div className="flex justify-between items-center h-16 px-6">
            <h2 className="text-lg font-bold text-primary">Caixa de Entrada (Workspace)</h2>
            <div className="flex items-center gap-4">
              <Search className="text-secondary hover:text-primary cursor-pointer transition-colors" size={20} strokeWidth={1.5} />
              <Bell className="text-secondary hover:text-primary cursor-pointer transition-colors" size={20} strokeWidth={1.5} />
            </div>
          </div>
        </header>

        <main className="pt-24 p-8 w-full flex-1 max-w-5xl mx-auto">
          <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-10 text-center max-w-lg mx-auto mt-10 shadow-sm">
            <Mail className="mx-auto h-12 w-12 text-zinc-400 mb-4" />
            <h3 className="text-xl font-bold text-primary mb-2">Conecte o Google Workspace</h3>
            <p className="text-sm text-secondary mb-6">
              Para visualizar os e-mails e utilizar o Resumidor de Inteligência Artificial, é necessário configurar as credenciais do Google Cloud.
            </p>
            <div className="bg-surface-container-low p-4 rounded-xl text-left mb-6 border border-outline-variant/30">
              <p className="text-xs font-mono text-zinc-600 mb-2 font-bold">Adicione ao seu arquivo .env</p>
              <code className="text-xs text-primary bg-zinc-100 px-2 py-1 rounded block mb-2">VITE_GOOGLE_CLIENT_ID=seu_client_id</code>
              <code className="text-xs text-primary bg-zinc-100 px-2 py-1 rounded block">VITE_GOOGLE_API_KEY=sua_api_key</code>
            </div>
            <p className="text-xs text-secondary italic">Acesse Configurações para gerenciar conexões e APIs.</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col overflow-hidden">
      <header className={`fixed top-0 right-0 z-40 bg-background/80 backdrop-blur-md border-b border-outline-variant transition-all duration-300 ${isSidebarCollapsed ? 'w-[calc(100%-5rem)]' : 'w-[calc(100%-16rem)]'}`}>
        <div className="flex justify-between items-center h-16 px-6">
          <h2 className="text-lg font-bold text-primary">Caixa de Entrada (Workspace)</h2>
          <div className="flex items-center gap-4">
            <Search className="text-secondary hover:text-primary cursor-pointer transition-colors" size={20} strokeWidth={1.5} />
            <Bell className="text-secondary hover:text-primary cursor-pointer transition-colors" size={20} strokeWidth={1.5} />
          </div>
        </div>
      </header>

      <main className="pt-16 flex-1 flex w-full overflow-hidden">
        {/* Sidebar E-mails */}
        <div className="w-64 border-r border-outline-variant bg-surface-container-lowest p-4 flex flex-col h-[calc(100vh-4rem)]">
          <button className="bg-primary text-white font-bold rounded-xl py-3 px-4 mb-6 flex items-center justify-center gap-2 hover:opacity-90 active:scale-95 shadow-sm">
            <Mail size={18} /> Novo E-mail
          </button>
          
          <nav className="space-y-1">
            <button 
              onClick={() => setActiveFolder('inbox')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeFolder === 'inbox' ? 'bg-primary/10 text-primary' : 'text-secondary hover:bg-surface-container-low hover:text-primary'}`}
            >
              <Inbox size={18} /> Caixa de Entrada
              <span className="ml-auto bg-primary text-white text-[10px] px-2 py-0.5 rounded-full font-bold">1</span>
            </button>
            <button 
              onClick={() => setActiveFolder('sent')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeFolder === 'sent' ? 'bg-primary/10 text-primary' : 'text-secondary hover:bg-surface-container-low hover:text-primary'}`}
            >
              <Send size={18} /> Enviados
            </button>
            <button 
              onClick={() => setActiveFolder('archive')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeFolder === 'archive' ? 'bg-primary/10 text-primary' : 'text-secondary hover:bg-surface-container-low hover:text-primary'}`}
            >
              <Archive size={18} /> Arquivo
            </button>
          </nav>
        </div>

        {/* E-mails List */}
        {!selectedEmail ? (
          <div className="flex-1 bg-background h-[calc(100vh-4rem)] overflow-y-auto">
            <div className="p-6 border-b border-outline-variant flex justify-between items-end bg-surface-container-lowest">
              <div>
                <h1 className="text-2xl font-light text-primary tracking-tight font-sans">Todos os E-mails</h1>
                <p className="text-sm text-secondary mt-1">Conectado como contato@colegiopassos.com.br</p>
              </div>
            </div>
            
            <div className="divide-y divide-outline-variant/50">
              {mockEmails.map((email) => (
                <div 
                  key={email.id} 
                  onClick={() => setSelectedEmail(email)}
                  className={`p-4 flex gap-4 cursor-pointer hover:bg-surface-container-low transition-colors ${email.unread ? 'bg-white' : 'bg-zinc-50'}`}
                >
                  <div className="flex-shrink-0 mt-1">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                      {email.sender.charAt(0)}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-1">
                      <h4 className={`text-sm ${email.unread ? 'font-bold text-zinc-900' : 'font-semibold text-zinc-700'}`}>{email.sender}</h4>
                      <span className="text-xs text-secondary whitespace-nowrap ml-4">{email.date}</span>
                    </div>
                    <p className={`text-sm mb-1 ${email.unread ? 'font-bold text-zinc-800' : 'text-zinc-700'}`}>{email.subject}</p>
                    <p className="text-xs text-secondary truncate">{email.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* Email Detail View */
          <div className="flex-1 bg-background flex flex-col h-[calc(100vh-4rem)]">
            <div className="p-4 border-b border-outline-variant flex items-center justify-between bg-surface-container-lowest shadow-sm z-10">
              <button 
                onClick={closeEmail}
                className="text-sm text-secondary hover:text-primary font-medium flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-surface-container-low transition-colors"
              >
                &larr; Voltar para Caixa de Entrada
              </button>
              
              <button 
                onClick={handleSummarize}
                disabled={isSummarizing || aiSummary !== null}
                className="bg-zinc-900 text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 hover:opacity-90 active:scale-95 transition-all disabled:opacity-50"
              >
                {isSummarizing ? (
                  <Loader2 className="animate-spin" size={14} />
                ) : (
                  <Sparkles size={14} className="text-orange-400" />
                )}
                {isSummarizing ? 'Lendo Mensagem...' : aiSummary ? 'Resumo Gerado' : 'Resumir com IA'}
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto flex relative">
              <div className={`p-8 transition-all duration-300 ${aiSummary ? 'w-1/2 border-r border-outline-variant' : 'w-full max-w-4xl mx-auto'}`}>
                <h2 className="text-2xl font-bold text-primary mb-6">{selectedEmail.subject}</h2>
                <div className="flex items-center gap-3 mb-8 pb-6 border-b border-outline-variant/50">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
                    {selectedEmail.sender.charAt(0)}
                  </div>
                  <div>
                    <p className="font-bold text-sm text-zinc-900">{selectedEmail.sender}</p>
                    <p className="text-xs text-secondary">de: {selectedEmail.email} • {selectedEmail.date}</p>
                  </div>
                </div>
                <div className="prose prose-sm prose-zinc max-w-none whitespace-pre-wrap text-zinc-800 leading-relaxed">
                  {selectedEmail.body}
                </div>
              </div>
              
              {/* Painel do Resumidor (Slide-in) */}
              {aiSummary && (
                <div className="w-1/2 p-8 bg-[#FFF8F3] animate-in slide-in-from-right-8 duration-300 overflow-y-auto border-l border-orange-100">
                  <div className="flex items-center gap-2 mb-6 text-primary">
                    <Sparkles size={20} />
                    <h3 className="font-bold text-lg">Resumo Inteligente</h3>
                  </div>
                  
                  {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 text-xs rounded-xl flex items-center gap-2">
                      <AlertCircle size={16} />
                      <span>{error}</span>
                    </div>
                  )}

                  <div className="prose prose-sm max-w-none">
                    <div 
                      className="text-zinc-800"
                      dangerouslySetInnerHTML={{ __html: aiSummary.replace(/\n/g, '<br/>').replace(/\*\*(.*?)\*\*/g, '<strong class="text-zinc-900 font-bold">$1</strong>') }} 
                    />
                  </div>
                  
                  <div className="mt-8 pt-6 border-t border-orange-200/50 flex items-start gap-3 bg-white p-4 rounded-xl shadow-sm">
                    <Info size={16} className="text-secondary flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-secondary leading-relaxed">
                      Resumo gerado pelo Gemini 1.5 Flash. Resumos de IA podem não captar todas as nuances emocionais, sempre valide informações críticas diretamente no texto original.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
