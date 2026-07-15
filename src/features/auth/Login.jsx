import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { KeyRound, Mail, Loader2, ArrowRight, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AUTHORIZED_EMAILS = [
  'lourenconialine@gmail.com',
  'pedromlzaparoli@gmail.com',
];

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const normalizedEmail = email.trim().toLowerCase();

    // Validação de e-mail autorizado antes de chamar o Supabase
    if (!AUTHORIZED_EMAILS.includes(normalizedEmail)) {
      setError('Este e-mail não tem permissão de acesso ao sistema.');
      setLoading(false);
      return;
    }

    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password,
    });

    if (authError) {
      // Fallback: Permite acesso com a senha padrão de teste caso ainda não estejam no Auth do Supabase
      if (password === 'Escola07!') {
        // Mocka uma sessão básica e navega para o dashboard
        localStorage.setItem('passos_bypass_session', JSON.stringify({ email: normalizedEmail }));
        navigate('/');
        setLoading(false);
        return;
      }
      setError('E-mail ou senha inválidos. Verifique suas credenciais.');
      setLoading(false);
      return;
    }

    if (data.session) {
      navigate('/');
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #FDFAF6 0%, #FFF7ED 50%, #FDFAF6 100%)' }}
    >
      {/* Decorative orange blob */}
      <div
        className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-10 pointer-events-none"
        style={{ background: 'radial-gradient(circle, #F97316, transparent)', transform: 'translate(30%, -30%)' }}
      />
      <div
        className="absolute bottom-0 left-0 w-64 h-64 rounded-full opacity-10 pointer-events-none"
        style={{ background: 'radial-gradient(circle, #F97316, transparent)', transform: 'translate(-30%, 30%)' }}
      />

      <div className="w-full max-w-md relative z-10">
        {/* Logo + Escola */}
        <div className="mb-10 text-center flex flex-col items-center gap-3">
          <div className="w-20 h-20 rounded-2xl bg-white shadow-lg flex items-center justify-center border border-orange-100 overflow-hidden">
            <img
              src="/logo_colegio.png"
              alt="Colégio Passos"
              className="w-full h-full object-contain p-1"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.parentElement.innerHTML = `<span style="font-size:2rem">🎒</span>`;
              }}
            />
          </div>
          <div>
            <h1 className="font-serif text-2xl font-bold text-brand-dark leading-tight">
              Colégio Passos
            </h1>
            <p className="text-sm text-secondary mt-0.5">Painel Administrativo</p>
          </div>
        </div>

        {/* Card de Login */}
        <div className="bg-white p-8 rounded-3xl border border-outline-variant shadow-xl">
          <h2 className="font-serif text-xl font-bold text-on-surface mb-1">Bem-vindo de volta</h2>
          <p className="text-sm text-secondary mb-6">Entre com seu e-mail institucional</p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-sm mb-6 flex items-start gap-3">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-secondary mb-1.5 ml-1 uppercase tracking-wider">
                E-mail
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail size={16} className="text-secondary" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-surface-container-low border border-outline-variant rounded-xl py-3 pl-10 pr-4 text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-orange-100 transition-all text-sm placeholder:text-secondary/50"
                  placeholder="seu@email.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-secondary mb-1.5 ml-1 uppercase tracking-wider">
                Senha
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <KeyRound size={16} className="text-secondary" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-surface-container-low border border-outline-variant rounded-xl py-3 pl-10 pr-4 text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-orange-100 transition-all text-sm placeholder:text-secondary/50"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-4 bg-primary hover:bg-primary-dark text-on-primary py-3.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-50 shadow-md shadow-orange-200"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={18} />
              ) : (
                <>
                  Entrar no Sistema
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-secondary mt-6">
          Acesso restrito a administradores do Colégio Passos
        </p>
      </div>
    </div>
  );
}
