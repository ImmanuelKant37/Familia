import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Mail, Lock, User, Eye, EyeOff, TreePine, ArrowRight, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';

interface AuthScreenProps {
  onSuccess?: () => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onSuccess }) => {
  const { loginWithEmail, registerWithEmail, loginAsGuest, sendPasswordReset } = useAuth();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [guestLoading, setGuestLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetLoading, setResetLoading] = useState(false);

  const getSpanishErrorMessage = (errorCode: string): string => {
    switch (errorCode) {
      case 'auth/email-already-in-use':
        return 'Este correo electrónico ya está registrado. Por favor inicia sesión o recupera tu contraseña.';
      case 'auth/invalid-email':
        return 'El formato de correo electrónico no es válido.';
      case 'auth/weak-password':
        return 'La contraseña debe tener al menos 6 caracteres.';
      case 'auth/wrong-password':
      case 'auth/invalid-credential':
      case 'auth/user-not-found':
        return 'Correo o contraseña incorrectos. Por favor verifica tus credenciales.';
      case 'auth/too-many-requests':
        return 'Demasiados intentos fallidos. Por seguridad, espera unos minutos antes de intentar de nuevo.';
      case 'auth/network-request-failed':
        return 'Error de conexión con el servidor. Verifica tu conexión a internet.';
      case 'auth/operation-not-allowed':
        return 'El servicio de autenticación requiere verificación. Puedes pulsar "Acceder como Invitado" abajo para ingresar de inmediato.';
      default:
        return 'Ocurrió un error al procesar tu solicitud. Intenta nuevamente.';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setErrorMsg('Por favor ingresa tu correo electrónico.');
      return;
    }

    if (!password) {
      setErrorMsg('Por favor ingresa tu contraseña.');
      return;
    }

    if (mode === 'register') {
      if (!displayName.trim()) {
        setErrorMsg('Por favor ingresa tu nombre completo.');
        return;
      }
      if (password.length < 6) {
        setErrorMsg('La contraseña debe tener al menos 6 caracteres.');
        return;
      }
      if (password !== confirmPassword) {
        setErrorMsg('Las contraseñas no coinciden. Por favor verifícalas.');
        return;
      }
    }

    setLoading(true);
    try {
      if (mode === 'login') {
        await loginWithEmail(trimmedEmail, password);
      } else {
        await registerWithEmail(trimmedEmail, password, displayName.trim());
      }
      if (onSuccess) onSuccess();
    } catch (err: any) {
      console.error('Auth error:', err);
      const code = err?.code || '';
      setErrorMsg(getSpanishErrorMessage(code));
    } finally {
      setLoading(false);
    }
  };

  const handleSendResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const trimmed = resetEmail.trim() || email.trim();
    if (!trimmed) {
      setErrorMsg('Ingresa tu correo electrónico para enviar el enlace de recuperación.');
      return;
    }

    setResetLoading(true);
    try {
      await sendPasswordReset(trimmed);
      setSuccessMsg(`Se ha enviado un correo a ${trimmed} con las instrucciones para restablecer tu contraseña.`);
      setShowForgotModal(false);
      setResetEmail('');
    } catch (err: any) {
      const code = err?.code || '';
      setErrorMsg(getSpanishErrorMessage(code));
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F2ED] flex flex-col justify-center items-center px-4 py-12 selection:bg-[#5A5A40] selection:text-white">
      <div className="max-w-md w-full">
        {/* Brand Logo & Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-[#5A5A40] text-[#F5F2ED] shadow-sm mb-4">
            <TreePine className="w-9 h-9" />
          </div>
          <h1 className="font-serif text-3xl font-bold text-[#434331] tracking-tight">
            Familia
          </h1>
          <p className="text-sm text-[#7C796F] font-serif italic mt-1.5">
            Árbol Genealógico & Archivo Familiar en la Nube
          </p>
        </div>

        {/* Auth Card */}
        <div className="bg-[#FDFBF7] rounded-3xl border border-[#D1CEC7] p-7 sm:p-9 shadow-sm">
          {/* Tab Switcher */}
          <div className="flex bg-[#F5F2ED] p-1 rounded-2xl border border-[#E5E2D9] mb-6">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setErrorMsg(null);
                setSuccessMsg(null);
              }}
              className={`flex-1 py-2.5 text-xs font-sans font-semibold rounded-xl transition-all cursor-pointer ${
                mode === 'login'
                  ? 'bg-white text-[#434331] shadow-2xs'
                  : 'text-[#7C796F] hover:text-[#434331]'
              }`}
            >
              Iniciar Sesión
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setErrorMsg(null);
                setSuccessMsg(null);
              }}
              className={`flex-1 py-2.5 text-xs font-sans font-semibold rounded-xl transition-all cursor-pointer ${
                mode === 'register'
                  ? 'bg-white text-[#434331] shadow-2xs'
                  : 'text-[#7C796F] hover:text-[#434331]'
              }`}
            >
              Crear Cuenta
            </button>
          </div>

          {/* Feedback Alerts */}
          {errorMsg && (
            <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-xs flex items-start space-x-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-5 p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs flex items-start space-x-2.5">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{successMsg}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div>
                <label className="block text-xs font-sans font-medium text-[#5A5A40] mb-1.5">
                  Nombre Completo
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#9A968A]">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Ej. Juan Pérez García"
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#D1CEC7] rounded-xl text-sm text-[#2C2C2C] focus:outline-none focus:border-[#5A5A40] focus:ring-1 focus:ring-[#5A5A40] transition-colors"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-sans font-medium text-[#5A5A40] mb-1.5">
                Correo Electrónico
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#9A968A]">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@correo.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#D1CEC7] rounded-xl text-sm text-[#2C2C2C] focus:outline-none focus:border-[#5A5A40] focus:ring-1 focus:ring-[#5A5A40] transition-colors"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-sans font-medium text-[#5A5A40]">
                  Contraseña
                </label>
                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={() => {
                      setResetEmail(email);
                      setShowForgotModal(true);
                    }}
                    className="text-[11px] text-[#5A5A40] hover:text-[#434331] underline font-sans cursor-pointer"
                  >
                    ¿Olvidaste tu contraseña?
                  </button>
                )}
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#9A968A]">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={mode === 'register' ? 'Mínimo 6 caracteres' : 'Tu contraseña'}
                  className="w-full pl-10 pr-10 py-2.5 bg-white border border-[#D1CEC7] rounded-xl text-sm text-[#2C2C2C] focus:outline-none focus:border-[#5A5A40] focus:ring-1 focus:ring-[#5A5A40] transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#9A968A] hover:text-[#5A5A40]"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {mode === 'register' && (
              <div>
                <label className="block text-xs font-sans font-medium text-[#5A5A40] mb-1.5">
                  Confirmar Contraseña
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#9A968A]">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repite tu contraseña"
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#D1CEC7] rounded-xl text-sm text-[#2C2C2C] focus:outline-none focus:border-[#5A5A40] focus:ring-1 focus:ring-[#5A5A40] transition-colors"
                  />
                </div>
              </div>
            )}

            <div className="pt-2 space-y-3">
              <button
                type="submit"
                disabled={loading || guestLoading}
                className="w-full py-3 bg-[#5A5A40] hover:bg-[#434331] disabled:opacity-50 text-white font-sans font-semibold rounded-2xl shadow-xs transition-all flex items-center justify-center space-x-2 text-sm cursor-pointer"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>{mode === 'login' ? 'Iniciando sesión...' : 'Creando cuenta...'}</span>
                  </>
                ) : (
                  <>
                    <span>{mode === 'login' ? 'Entrar a Mi Árbol' : 'Crear mi Cuenta'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-[#E5E2D9]"></div>
                <span className="flex-shrink mx-3 text-[11px] font-sans text-[#9A968A] uppercase tracking-wider">o también</span>
                <div className="flex-grow border-t border-[#E5E2D9]"></div>
              </div>

              <button
                type="button"
                disabled={loading || guestLoading}
                onClick={async () => {
                  setGuestLoading(true);
                  setErrorMsg(null);
                  try {
                    await loginAsGuest();
                    if (onSuccess) onSuccess();
                  } catch (err: any) {
                    console.error('Guest login error:', err);
                  } finally {
                    setGuestLoading(false);
                  }
                }}
                className="w-full py-2.5 bg-[#F5F2ED] hover:bg-[#E5E2D9] text-[#434331] font-sans font-medium text-xs rounded-xl border border-[#D1CEC7] transition-colors flex items-center justify-center space-x-2 cursor-pointer"
              >
                {guestLoading ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Entrando como invitado...</span>
                  </>
                ) : (
                  <span>Acceder como Invitado (Modo Exploración)</span>
                )}
              </button>
            </div>
          </form>

          {/* Privacy Note */}
          <p className="text-[11px] text-center text-[#9A968A] mt-6 leading-relaxed font-sans">
            Tus datos genealógicos se guardan de forma segura y sincronizada en la nube.
          </p>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-[#FDFBF7] rounded-3xl border border-[#D1CEC7] max-w-sm w-full p-6 shadow-xl space-y-4">
            <h3 className="font-serif text-lg font-bold text-[#434331]">
              Recuperar Contraseña
            </h3>
            <p className="text-xs text-[#7C796F] font-sans leading-relaxed">
              Ingresa el correo electrónico asociado a tu cuenta y te enviaremos un enlace para restablecer tu contraseña.
            </p>

            <form onSubmit={handleSendResetPassword} className="space-y-4">
              <div>
                <label className="block text-xs font-sans font-medium text-[#5A5A40] mb-1.5">
                  Correo Electrónico
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#9A968A]">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    placeholder="tu@correo.com"
                    className="w-full pl-10 pr-4 py-2 bg-white border border-[#D1CEC7] rounded-xl text-sm focus:outline-none focus:border-[#5A5A40]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowForgotModal(false)}
                  className="px-4 py-2 text-xs font-sans font-semibold text-[#7C796F] hover:bg-[#F5F2ED] rounded-xl transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={resetLoading}
                  className="px-4 py-2 text-xs font-sans font-semibold bg-[#5A5A40] hover:bg-[#434331] text-white rounded-xl transition-colors cursor-pointer disabled:opacity-50"
                >
                  {resetLoading ? 'Enviando...' : 'Enviar Enlace'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
