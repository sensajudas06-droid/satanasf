import { useState } from 'react';
import { UserPlus, LogIn, Mail, CheckCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

interface AuthPageProps {
  onNavigate: (page: string) => void;
}

export default function AuthPage({ onNavigate }: AuthPageProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const { signIn, signUp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (isSignUp && !displayName.trim()) {
      setError('Lütfen bir kullanıcı adı girin');
      setLoading(false);
      return;
    }

    if (isSignUp) {
      const { error } = await signUp(email, password, displayName);
      if (error) {
        setError(error.message);
        setLoading(false);
      } else {
        const verificationUrl = `${window.location.origin}/verify-email`;

        try {
          await supabase.functions.invoke('send-verification-email', {
            body: { email, verificationUrl }
          });
          setEmailSent(true);
        } catch (emailError) {
          console.error('Email send error:', emailError);
          setError('Hesap oluşturuldu ancak doğrulama e-postası gönderilemedi. Lütfen profil sayfasından tekrar deneyin.');
        }
        setLoading(false);
      }
    } else {
      const { error } = await signIn(email, password);
      if (error) {
        setError('E-posta veya şifre hatalı');
        setLoading(false);
      } else {
        onNavigate('home');
      }
    }
  };

  if (emailSent) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-8 space-y-6 text-center">
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-green-600/20 rounded-full flex items-center justify-center">
                <CheckCircle className="w-10 h-10 text-green-500" />
              </div>
            </div>

            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-white">E-postanızı Kontrol Edin</h1>
              <p className="text-zinc-400">
                <span className="text-white font-semibold">{email}</span> adresine bir doğrulama e-postası gönderdik.
              </p>
            </div>

            <div className="bg-blue-900/20 border border-blue-900 rounded-lg p-4 text-blue-400 text-left">
              <div className="flex gap-3">
                <Mail className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <div className="space-y-2 text-sm">
                  <p className="font-semibold">E-postanızı kontrol edin ve:</p>
                  <ul className="space-y-1 list-disc list-inside">
                    <li>Doğrulama linkine tıklayın</li>
                    <li>Spam klasörünü kontrol edin</li>
                    <li>E-posta gelmezse profil sayfasından tekrar gönderin</li>
                  </ul>
                </div>
              </div>
            </div>

            <button
              onClick={() => onNavigate('home')}
              className="w-full px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Ana Sayfaya Dön
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-8 space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold text-white">
              {isSignUp ? 'Kayıt Ol' : 'Giriş Yap'}
            </h1>
            <p className="text-zinc-400">
              Satanas Fidelis topluluğuna hoş geldiniz
            </p>
          </div>

          {error && (
            <div className="bg-red-900/20 border border-red-900 rounded-lg p-4 text-red-400">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">
                  Kullanıcı Adı
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full px-4 py-2 bg-black border border-zinc-800 rounded-lg text-white placeholder-zinc-600 focus:outline-none focus:border-red-500 transition-colors"
                  placeholder="Kullanıcı adınız"
                  required={isSignUp}
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">
                E-posta
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 bg-black border border-zinc-800 rounded-lg text-white placeholder-zinc-600 focus:outline-none focus:border-red-500 transition-colors"
                placeholder="ornek@email.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">
                Şifre
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 bg-black border border-zinc-800 rounded-lg text-white placeholder-zinc-600 focus:outline-none focus:border-red-500 transition-colors"
                placeholder="••••••••"
                required
                minLength={6}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSignUp ? (
                <>
                  <UserPlus className="w-5 h-5" />
                  <span>{loading ? 'Kayıt yapılıyor...' : 'Kayıt Ol'}</span>
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  <span>{loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}</span>
                </>
              )}
            </button>
          </form>

          <div className="text-center">
            <button
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError('');
              }}
              className="text-red-500 hover:text-red-400 transition-colors"
            >
              {isSignUp
                ? 'Zaten hesabınız var mı? Giriş yapın'
                : 'Hesabınız yok mu? Kayıt olun'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
