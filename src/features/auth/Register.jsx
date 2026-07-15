import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { KeyRound, Mail, Loader2, ArrowRight, User } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="mb-12 text-center flex flex-col items-center">
          {/* Logo replacement area */}
          <img src="/logo.png" alt="Logo" className="h-16 mb-2 object-contain drop-shadow-md" onError={(e) => {
            // Fallback se a imagem não for encontrada
            e.target.style.display = 'none';
            document.getElementById('logo-fallback').style.display = 'block';
          }} />
          <div id="logo-fallback" style={{display: 'none'}}>
            <h1 className="text-5xl font-black text-primary tracking-tighter drop-shadow-md">PMZ</h1>
          </div>
        </div>

        <div className="bg-surface-container-lowest p-8 rounded-3xl border border-surface-container shadow-2xl">
          <h2 className="text-xl font-bold text-primary mb-6">Criar nova conta</h2>
          
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-sm mb-6">
              {error}
            </div>
          )}

          {success ? (
            <div className="text-center">
              <div className="bg-green-500/10 border border-green-500/20 text-green-400 p-4 rounded-xl text-sm mb-6">
                Conta criada com sucesso! Verifique seu email para confirmar o cadastro (se o Supabase estiver exigindo confirmação), ou faça login diretamente.
              </div>
              <Link to="/login" className="text-sm font-bold text-primary hover:underline">
                Ir para o Login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-secondary mb-1.5 ml-1 uppercase tracking-wider">Email</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail size={18} className="text-secondary" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-surface-container-low border border-outline-variant rounded-xl py-3 pl-11 pr-4 text-primary focus:outline-none focus:border-primary transition-colors text-sm"
                    placeholder="Seu email de acesso"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-secondary mb-1.5 ml-1 uppercase tracking-wider">Senha</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <KeyRound size={18} className="text-secondary" />
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-surface-container-low border border-outline-variant rounded-xl py-3 pl-11 pr-4 text-primary focus:outline-none focus:border-primary transition-colors text-sm"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-6 bg-primary text-on-primary py-3.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:opacity-90 active:scale-95 transition-all disabled:opacity-50"
              >
                {loading ? <Loader2 className="animate-spin" size={18} /> : (
                  <>
                    Cadastrar
                    <User size={18} />
                  </>
                )}
              </button>

              <div className="mt-6 text-center">
                <p className="text-xs text-secondary">
                  Já tem uma conta? <Link to="/login" className="text-primary font-bold hover:underline">Faça login</Link>
                </p>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
