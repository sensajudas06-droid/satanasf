import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface EmailVerifyPageProps {
  onNavigate: (page: string) => void;
}

export default function EmailVerifyPage({ onNavigate }: EmailVerifyPageProps) {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    verifyEmail();
  }, []);

  const verifyEmail = async () => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get('token');
      const email = urlParams.get('email');

      if (!token || !email) {
        setStatus('error');
        setMessage('Geçersiz doğrulama linki');
        return;
      }

      const { data: verificationData, error: verifyError } = await supabase
        .from('email_verification_codes')
        .select('*')
        .eq('email', decodeURIComponent(email))
        .eq('code', token)
        .eq('used', false)
        .gt('expires_at', new Date().toISOString())
        .maybeSingle();

      if (verifyError) throw verifyError;

      if (!verificationData) {
        setStatus('error');
        setMessage('Doğrulama linki geçersiz veya süresi dolmuş');
        return;
      }

      const { error: updateCodeError } = await supabase
        .from('email_verification_codes')
        .update({ used: true })
        .eq('id', verificationData.id);

      if (updateCodeError) throw updateCodeError;

      const { error: updateProfileError } = await supabase
        .from('profiles')
        .update({ email_verified: true })
        .eq('email', decodeURIComponent(email));

      if (updateProfileError) throw updateProfileError;

      setStatus('success');
      setMessage('E-posta adresiniz başarıyla doğrulandı!');

      setTimeout(() => {
        onNavigate('home');
      }, 3000);
    } catch (error: any) {
      console.error('Doğrulama hatası:', error);
      setStatus('error');
      setMessage(error.message || 'E-posta doğrulanırken bir hata oluştu');
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-8 space-y-6 text-center">
          {status === 'loading' && (
            <>
              <div className="flex justify-center">
                <div className="w-16 h-16 bg-blue-600/20 rounded-full flex items-center justify-center">
                  <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
                </div>
              </div>
              <div className="space-y-2">
                <h1 className="text-3xl font-bold text-white">E-posta Doğrulanıyor</h1>
                <p className="text-zinc-400">Lütfen bekleyin...</p>
              </div>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="flex justify-center">
                <div className="w-16 h-16 bg-green-600/20 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-10 h-10 text-green-500" />
                </div>
              </div>
              <div className="space-y-2">
                <h1 className="text-3xl font-bold text-white">Başarılı!</h1>
                <p className="text-zinc-400">{message}</p>
                <p className="text-zinc-500 text-sm">Ana sayfaya yönlendiriliyorsunuz...</p>
              </div>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="flex justify-center">
                <div className="w-16 h-16 bg-red-600/20 rounded-full flex items-center justify-center">
                  <XCircle className="w-10 h-10 text-red-500" />
                </div>
              </div>
              <div className="space-y-4">
                <h1 className="text-3xl font-bold text-white">Doğrulama Başarısız</h1>
                <p className="text-zinc-400">{message}</p>
                <button
                  onClick={() => onNavigate('home')}
                  className="w-full px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Ana Sayfaya Dön
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
