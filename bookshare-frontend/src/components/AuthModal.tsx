import React, { useState, useEffect } from 'react';
import { apiLogin, apiRegister } from '../utils/auth';
import { useToast } from './Toast';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (token: string) => void;
}

type ModalMode = 'login' | 'register' | 'recover' | 'recover-success';

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onAuthSuccess,
}) => {
  const { showToast } = useToast();
  const [mode, setMode] = useState<ModalMode>('login');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form states
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [nome, setNome] = useState('');

  // Validation states
  const [emailTouched, setEmailTouched] = useState(false);
  const [nomeTouched, setNomeTouched] = useState(false);

  // Validation helpers
  const validateEmail = (emailStr: string): boolean => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(emailStr);
  };

  const validateNome = (nomeStr: string): { isValid: boolean; message?: string } => {
    const trimmed = nomeStr.trim();
    if (trimmed.length === 0) {
      return { isValid: false, message: 'O nome é obrigatório.' };
    }
    const hasLettersOnly = /^[A-Za-zÀ-ÖØ-öø-ÿ\s]+$/.test(trimmed);
    if (!hasLettersOnly) {
      return { isValid: false, message: 'O nome deve conter apenas letras.' };
    }
    const words = trimmed.split(/\s+/);
    if (words.length < 2) {
      return { isValid: false, message: 'Digite seu nome completo (nome e sobrenome).' };
    }
    if (!words.every(word => word.length >= 2)) {
      return { isValid: false, message: 'Cada nome/sobrenome deve ter pelo menos 2 letras.' };
    }
    return { isValid: true };
  };

  const isEmailValid = validateEmail(email);
  const nomeValidationResult = validateNome(nome);
  const isNomeValid = nomeValidationResult.isValid;

  const showEmailError = emailTouched && !isEmailValid;
  const showNomeError = nomeTouched && !isNomeValid;

  const getInputClass = (isValid: boolean, touched: boolean) => {
    const base = "w-full bg-slate-950 border rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-1 transition-all";
    if (!touched) {
      return `${base} border-slate-800/80 focus:border-violet-500/60 focus:ring-violet-500/40`;
    }
    if (isValid) {
      return `${base} border-emerald-500/40 focus:border-emerald-500/60 focus:ring-emerald-500/30`;
    } else {
      return `${base} border-rose-500/40 focus:border-rose-500/60 focus:ring-rose-500/30`;
    }
  };

  // Password validation & strength
  const hasMinLength = senha.length >= 8;
  const hasUppercase = /[A-Z]/.test(senha);
  const hasNumber = /[0-9]/.test(senha);
  const hasSpecialChar = /[^A-Za-z0-9]/.test(senha);

  let strengthScore = 0;
  if (senha.length > 0) {
    if (hasMinLength) strengthScore++;
    if (hasUppercase) strengthScore++;
    if (hasNumber) strengthScore++;
    if (hasSpecialChar) strengthScore++;
  }

  let strengthLabel = '';
  let strengthColorClass = 'bg-slate-800/40';
  let strengthTextClass = 'text-slate-500';
  if (senha.length > 0) {
    if (strengthScore <= 1) {
      strengthLabel = 'Fraca';
      strengthColorClass = 'bg-rose-500';
      strengthTextClass = 'text-rose-400';
    } else if (strengthScore === 2 || strengthScore === 3) {
      strengthLabel = 'Média';
      strengthColorClass = 'bg-amber-500';
      strengthTextClass = 'text-amber-400';
    } else if (strengthScore === 4) {
      strengthLabel = 'Forte';
      strengthColorClass = 'bg-emerald-500';
      strengthTextClass = 'text-emerald-400';
    }
  }

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);


  if (!isOpen) return null;

  const resetForms = () => {
    setEmail('');
    setSenha('');
    setNome('');
    setEmailTouched(false);
    setNomeTouched(false);
    setErrorMsg(null);
  };

  const handleSwitchMode = (newMode: ModalMode) => {
    setMode(newMode);
    setEmailTouched(false);
    setNomeTouched(false);
    setErrorMsg(null);
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailTouched(true);

    if (!email || !senha) {
      setErrorMsg('Por favor, preencha todos os campos.');
      return;
    }

    if (!validateEmail(email)) {
      setErrorMsg('Por favor, insira um e-mail válido.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      const token = await apiLogin(email, senha);
      showToast('Login realizado com sucesso! Bem-vindo(a) de volta.', 'success');
      onAuthSuccess(token);
      resetForms();
      onClose();
    } catch (err: any) {
      const msg = err.message || 'Falha ao realizar login. Verifique suas credenciais.';
      setErrorMsg(msg);
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailTouched(true);
    setNomeTouched(true);

    if (!nome || !email || !senha) {
      setErrorMsg('Por favor, preencha todos os campos.');
      return;
    }

    if (!validateEmail(email)) {
      setErrorMsg('Por favor, insira um e-mail válido.');
      return;
    }

    const nomeVal = validateNome(nome);
    if (!nomeVal.isValid) {
      setErrorMsg(nomeVal.message || 'Por favor, insira um nome completo válido.');
      return;
    }

    if (senha.length < 8) {
      setErrorMsg('A senha deve conter no mínimo 8 caracteres.');
      return;
    }

    if (strengthScore < 2) {
      setErrorMsg('A senha é muito fraca. Ela precisa de mais complexidade (use letras maiúsculas, números ou caracteres especiais).');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      // 1. Cadastra o usuário no backend
      await apiRegister(nome, email, senha);
      
      // 2. Realiza o login automático com as credenciais cadastradas
      const token = await apiLogin(email, senha);
      
      showToast('Conta criada com sucesso! Bem-vindo(a) ao BookShare.', 'success');
      onAuthSuccess(token);
      resetForms();
      onClose();
    } catch (err: any) {
      const msg = err.message || 'Falha ao registrar usuário.';
      setErrorMsg(msg);
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRecoverSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailTouched(true);

    if (!email) {
      setErrorMsg('Por favor, digite seu e-mail.');
      return;
    }

    if (!validateEmail(email)) {
      setErrorMsg('Por favor, insira um e-mail válido.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    // Simulação do envio de e-mail de recuperação
    setTimeout(() => {
      setLoading(false);
      showToast('E-mail de recuperação enviado com sucesso!', 'success');
      setMode('recover-success');
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      {/* Decorative glows inside modal container */}
      <div className="bg-slate-900 border border-slate-800/80 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
        <div className="absolute top-[-30%] left-[-20%] w-[60%] h-[60%] rounded-full bg-violet-600/10 blur-[80px] pointer-events-none" />
        <div className="absolute bottom-[-30%] right-[-20%] w-[60%] h-[60%] rounded-full bg-cyan-500/10 blur-[80px] pointer-events-none" />

        <div className="px-6 py-4 border-b border-slate-800/60 flex justify-between items-center relative z-10">
          <h3 className="text-lg font-bold text-white m-0">
            {mode === 'login' && 'Acesse sua conta'}
            {mode === 'register' && 'Crie sua conta'}
            {mode === 'recover' && 'Recuperar senha'}
            {mode === 'recover-success' && 'Instruções enviadas!'}
          </h3>
          <button
            onClick={() => {
              resetForms();
              onClose();
            }}
            className="text-slate-400 hover:text-white transition-colors text-lg cursor-pointer bg-transparent border-0"
          >
            ✕
          </button>
        </div>

        {errorMsg && (
          <div className="mx-6 mt-4 p-3.5 bg-rose-500/10 border border-rose-500/25 rounded-xl text-rose-400 text-xs font-semibold flex items-center gap-2 relative z-10">
            <span>⚠️</span>
            <span>{errorMsg}</span>
          </div>
        )}

        {mode === 'login' && (
          <form onSubmit={handleLoginSubmit} className="p-6 flex flex-col gap-4 relative z-10">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Endereço de E-mail
              </label>
              <input
                type="email"
                required
                placeholder="exemplo@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={() => setEmailTouched(true)}
                disabled={loading}
                className={getInputClass(isEmailValid, emailTouched)}
              />
              {showEmailError && (
                <p className="mt-1.5 text-[11px] text-rose-400 font-semibold flex items-center gap-1.5 animate-in fade-in slide-in-from-top-1 duration-150">
                  <span>⚠️</span> {email.trim() === '' ? 'O e-mail é obrigatório.' : 'Por favor, insira um e-mail válido.'}
                </p>
              )}
              {emailTouched && isEmailValid && (
                <p className="mt-1.5 text-[11px] text-emerald-400 font-semibold flex items-center gap-1.5 animate-in fade-in slide-in-from-top-1 duration-150">
                  <span>✓</span> E-mail válido.
                </p>
              )}
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Senha
                </label>
                <button
                  type="button"
                  onClick={() => handleSwitchMode('recover')}
                  className="text-xs text-violet-400 hover:text-violet-300 font-medium transition-colors bg-transparent border-0 cursor-pointer"
                >
                  Esqueceu a senha?
                </button>
              </div>
              <input
                type="password"
                required
                placeholder="Digite sua senha"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                disabled={loading}
                className="w-full bg-slate-950 border border-slate-800/80 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-violet-500/60 focus:ring-1 focus:ring-violet-500/40 transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-650 hover:from-violet-700 hover:to-indigo-750 text-white font-bold text-sm shadow-lg shadow-violet-600/10 hover:shadow-violet-600/20 transition-all hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  Entrando...
                </>
              ) : (
                'Entrar na Plataforma'
              )}
            </button>

            <div className="text-center mt-3 text-xs text-slate-400">
              Novo no BookShare?{' '}
              <button
                type="button"
                onClick={() => handleSwitchMode('register')}
                className="text-violet-400 hover:text-violet-300 font-bold transition-colors bg-transparent border-0 cursor-pointer"
              >
                Crie uma conta
              </button>
            </div>
          </form>
        )}

        {mode === 'register' && (
          <form onSubmit={handleRegisterSubmit} className="p-6 flex flex-col gap-4 relative z-10">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Nome Completo
              </label>
              <input
                type="text"
                required
                placeholder="ex: João Silva"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                onBlur={() => setNomeTouched(true)}
                disabled={loading}
                className={getInputClass(isNomeValid, nomeTouched)}
              />
              {showNomeError && (
                <p className="mt-1.5 text-[11px] text-rose-400 font-semibold flex items-center gap-1.5 animate-in fade-in slide-in-from-top-1 duration-150">
                  <span>⚠️</span> {nomeValidationResult.message}
                </p>
              )}
              {nomeTouched && isNomeValid && (
                <p className="mt-1.5 text-[11px] text-emerald-400 font-semibold flex items-center gap-1.5 animate-in fade-in slide-in-from-top-1 duration-150">
                  <span>✓</span> Nome válido.
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Endereço de E-mail
              </label>
              <input
                type="email"
                required
                placeholder="exemplo@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={() => setEmailTouched(true)}
                disabled={loading}
                className={getInputClass(isEmailValid, emailTouched)}
              />
              {showEmailError && (
                <p className="mt-1.5 text-[11px] text-rose-400 font-semibold flex items-center gap-1.5 animate-in fade-in slide-in-from-top-1 duration-150">
                  <span>⚠️</span> {email.trim() === '' ? 'O e-mail é obrigatório.' : 'Por favor, insira um e-mail válido.'}
                </p>
              )}
              {emailTouched && isEmailValid && (
                <p className="mt-1.5 text-[11px] text-emerald-400 font-semibold flex items-center gap-1.5 animate-in fade-in slide-in-from-top-1 duration-150">
                  <span>✓</span> E-mail válido.
                </p>
              )}
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Senha de Acesso
                </label>
                {senha.length > 0 && (
                  <span className={`text-[11px] font-bold ${strengthTextClass} transition-colors duration-350`}>
                    Força: {strengthLabel}
                  </span>
                )}
              </div>
              <input
                type="password"
                required
                placeholder="Crie uma senha segura"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                disabled={loading}
                className="w-full bg-slate-950 border border-slate-800/80 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-violet-500/60 focus:ring-1 focus:ring-violet-500/40 transition-all"
              />

              {/* Segments indicating strength */}
              <div className="flex gap-1.5 mt-2 h-1 w-full bg-slate-950 rounded-full overflow-hidden">
                <div className={`h-full flex-1 transition-all duration-300 ${senha.length > 0 ? strengthColorClass : 'bg-slate-850'}`} />
                <div className={`h-full flex-1 transition-all duration-300 ${senha.length > 0 && strengthScore >= 2 ? strengthColorClass : 'bg-slate-850'}`} />
                <div className={`h-full flex-1 transition-all duration-300 ${senha.length > 0 && strengthScore >= 4 ? strengthColorClass : 'bg-slate-850'}`} />
              </div>

              {/* Checklist showing requirements */}
              {senha.length > 0 && (
                <div className="mt-3 grid grid-cols-2 gap-y-1.5 gap-x-2 text-[11px] text-slate-400 font-semibold bg-slate-950/20 p-2.5 rounded-xl border border-slate-800/40">
                  <div className="flex items-center gap-1.5">
                    <span className={`text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold transition-all ${hasMinLength ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-slate-900 text-slate-600 border border-slate-800/50'}`}>
                      {hasMinLength ? '✓' : '•'}
                    </span>
                    <span className={hasMinLength ? 'text-slate-200' : 'text-slate-500'}>Mín. 8 caracteres</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className={`text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold transition-all ${hasUppercase ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-slate-900 text-slate-600 border border-slate-800/50'}`}>
                      {hasUppercase ? '✓' : '•'}
                    </span>
                    <span className={hasUppercase ? 'text-slate-200' : 'text-slate-500'}>Letra maiúscula</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className={`text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold transition-all ${hasNumber ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-slate-900 text-slate-600 border border-slate-800/50'}`}>
                      {hasNumber ? '✓' : '•'}
                    </span>
                    <span className={hasNumber ? 'text-slate-200' : 'text-slate-500'}>Um número</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className={`text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold transition-all ${hasSpecialChar ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-slate-900 text-slate-600 border border-slate-800/50'}`}>
                      {hasSpecialChar ? '✓' : '•'}
                    </span>
                    <span className={hasSpecialChar ? 'text-slate-200' : 'text-slate-500'}>Caractere especial</span>
                  </div>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-650 hover:from-violet-700 hover:to-indigo-750 text-white font-bold text-sm shadow-lg shadow-violet-600/10 hover:shadow-violet-600/20 transition-all hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  Cadastrando...
                </>
              ) : (
                'Cadastrar e Entrar'
              )}
            </button>

            <div className="text-center mt-3 text-xs text-slate-400">
              Já possui conta?{' '}
              <button
                type="button"
                onClick={() => handleSwitchMode('login')}
                className="text-violet-400 hover:text-violet-300 font-bold transition-colors bg-transparent border-0 cursor-pointer"
              >
                Faça login
              </button>
            </div>
          </form>
        )}

        {mode === 'recover' && (
          <form onSubmit={handleRecoverSubmit} className="p-6 flex flex-col gap-4 relative z-10">
            <p className="text-xs text-slate-400 leading-relaxed m-0">
              Insira o e-mail cadastrado na plataforma. Nós enviaremos um link exclusivo para redefinir a sua senha com segurança.
            </p>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                E-mail Cadastrado
              </label>
              <input
                type="email"
                required
                placeholder="exemplo@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={() => setEmailTouched(true)}
                disabled={loading}
                className={getInputClass(isEmailValid, emailTouched)}
              />
              {showEmailError && (
                <p className="mt-1.5 text-[11px] text-rose-400 font-semibold flex items-center gap-1.5 animate-in fade-in slide-in-from-top-1 duration-150">
                  <span>⚠️</span> {email.trim() === '' ? 'O e-mail é obrigatório.' : 'Por favor, insira um e-mail válido.'}
                </p>
              )}
              {emailTouched && isEmailValid && (
                <p className="mt-1.5 text-[11px] text-emerald-400 font-semibold flex items-center gap-1.5 animate-in fade-in slide-in-from-top-1 duration-150">
                  <span>✓</span> E-mail válido.
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-650 hover:from-violet-700 hover:to-indigo-750 text-white font-bold text-sm shadow-lg shadow-violet-600/10 hover:shadow-violet-600/20 transition-all hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  Enviando...
                </>
              ) : (
                'Enviar Instruções'
              )}
            </button>

            <button
              type="button"
              onClick={() => handleSwitchMode('login')}
              className="mt-1 w-full py-2 rounded-xl border border-slate-800 hover:bg-slate-850 hover:border-slate-700 text-slate-300 text-xs font-semibold transition-all cursor-pointer bg-transparent"
            >
              Voltar para o Login
            </button>
          </form>
        )}

        {mode === 'recover-success' && (
          <div className="p-6 flex flex-col items-center text-center gap-4 relative z-10">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 text-2xl shadow-lg shadow-emerald-950/20">
              ✓
            </div>

            <div>
              <p className="text-sm text-slate-300 leading-relaxed mb-4">
                Instruções de recuperação de senha enviadas com sucesso para o e-mail:<br />
                <span className="font-bold text-white break-all">{email}</span>
              </p>
              <p className="text-xs text-slate-500 leading-relaxed m-0">
                Por favor, verifique a sua caixa de entrada e spam para prosseguir.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                resetForms();
                handleSwitchMode('login');
              }}
              className="mt-2 w-full py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-650 hover:from-violet-700 hover:to-indigo-750 text-white font-bold text-sm shadow-lg transition-all hover:scale-[1.01] cursor-pointer"
            >
              Voltar para o Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
