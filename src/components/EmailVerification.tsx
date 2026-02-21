import { useState } from 'react';
import { Mail, Check, AlertCircle, RefreshCw } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface EmailVerificationProps {
  userId: string;
  email: string;
  isVerified: boolean;
  onVerified: () => void;
}

export default function EmailVerification({ userId, email, isVerified, onVerified }: EmailVerificationProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const sendVerificationEmail = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const verificationUrl = `${window.location.origin}/verify-email`;

      const { error: functionError } = await supabase.functions.invoke(
        'send-verification-email',
        {
          body: { email, verificationUrl }
        }
      );

      if (functionError) throw functionError;

      setSuccess('Doğrulama e-postası gönderildi! E-postanızı kontrol edin.');
    } catch (err: any) {
      console.error('E-posta gönderme hatası:', err);
      setError(err.message || 'E-posta gönderilemedi');
    } finally {
      setLoading(false);
    }
  };

  const checkVerificationStatus = async () => {
    setLoading(true);
    setError('');

    try {
      const { data, error: fetchError } = await supabase
        .from('profiles')
        .select('email_verified')
        .eq('id', userId)
        .maybeSingle();

      if (fetchError) throw fetchError;

      if (data?.email_verified) {
        setSuccess('E-posta adresiniz doğrulandı!');
        setTimeout(() => onVerified(), 1500);
      } else {
        setError('E-posta henüz doğrulanmadı. Lütfen e-postanızdaki linke tıklayın.');
      }
    } catch (err: any) {
      console.error('Doğrulama kontrol hatası:', err);
      setError(err.message || 'Doğrulama kontrolü başarısız');
    } finally {
      setLoading(false);
    }
  };

  if (isVerified) {
    return (
      <div className="bg-green-900/20 border border-green-900/30 rounded-lg p-4">
        <div className="flex items-center gap-3">
          <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
          <div>
            <p className="text-green-600 font-semibold">E-posta Doğrulandı</p>
            <p className="text-green-600/80 text-sm">E-posta adresiniz başarıyla doğrulandı.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-yellow-900/20 border border-yellow-900/30 rounded-lg p-6 space-y-4">
      <div className="flex items-start gap-3">
        <AlertCircle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h3 className="text-yellow-600 font-semibold mb-1">E-posta Doğrulanmadı</h3>
          <p className="text-yellow-600/80 text-sm mb-4">
            E-posta adresiniz <span className="font-semibold">{email}</span> henüz doğrulanmadı.
          </p>

          {success && (
            <div className="bg-green-900/20 border border-green-900/30 rounded-lg p-3 mb-4">
              <p className="text-green-600 text-sm">{success}</p>
            </div>
          )}

          {error && (
            <div className="bg-red-900/20 border border-red-900/30 rounded-lg p-3 mb-4">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={sendVerificationEmail}
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 bg-yellow-900 hover:bg-yellow-800 text-white font-semibold py-2.5 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              <Mail className="w-4 h-4" />
              {loading ? 'Gönderiliyor...' : 'Doğrulama E-postası Gönder'}
            </button>

            <button
              onClick={checkVerificationStatus}
              disabled={loading}
              className="flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 text-white font-semibold py-2.5 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              <RefreshCw className="w-4 h-4" />
              Kontrol Et
            </button>
          </div>

          <p className="text-yellow-600/60 text-xs mt-3">
            Spam klasörünüzü de kontrol etmeyi unutmayın.
          </p>
        </div>
      </div>
    </div>
  );
}
