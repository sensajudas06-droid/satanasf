import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Mail, CheckCircle, XCircle, Loader } from 'lucide-react';

export default function TestEmailPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleTestEmail = async () => {
    if (!email) {
      setResult({ success: false, message: 'Lütfen bir e-posta adresi girin' });
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const { data, error } = await supabase.functions.invoke('send-verification-email', {
        body: {
          email,
          verificationUrl: 'https://satanasfidelis.com/verify-test'
        }
      });

      if (error) throw error;

      setResult({
        success: true,
        message: `E-posta başarıyla gönderildi! ${email} adresini kontrol edin.`
      });
    } catch (error: any) {
      console.error('Email test error:', error);
      setResult({
        success: false,
        message: error.message || 'E-posta gönderilemedi'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-gray-100">
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="bg-gray-900 border border-red-900/30 rounded-lg p-8">
          <div className="flex items-center gap-3 mb-6">
            <Mail className="w-8 h-8 text-red-600" />
            <h1 className="text-3xl font-bold text-red-600">E-posta Test Sistemi</h1>
          </div>

          <p className="text-gray-400 mb-6">
            E-posta doğrulama sistemini test etmek için e-posta adresinizi girin.
          </p>

          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                E-posta Adresi
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ornek@email.com"
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:border-red-600 focus:ring-1 focus:ring-red-600 text-white"
                disabled={loading}
              />
            </div>

            <button
              onClick={handleTestEmail}
              disabled={loading || !email}
              className="w-full px-6 py-3 bg-red-600 hover:bg-red-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  Gönderiliyor...
                </>
              ) : (
                <>
                  <Mail className="w-5 h-5" />
                  Test E-postası Gönder
                </>
              )}
            </button>
          </div>

          {result && (
            <div
              className={`mt-6 p-4 rounded-lg flex items-start gap-3 ${
                result.success
                  ? 'bg-green-900/20 border border-green-600/30'
                  : 'bg-red-900/20 border border-red-600/30'
              }`}
            >
              {result.success ? (
                <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" />
              ) : (
                <XCircle className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />
              )}
              <div>
                <p className={result.success ? 'text-green-400' : 'text-red-400'}>
                  {result.message}
                </p>
                {result.success && (
                  <p className="text-gray-400 text-sm mt-2">
                    Not: Spam klasörünüzü de kontrol etmeyi unutmayın.
                  </p>
                )}
              </div>
            </div>
          )}

          <div className="mt-8 p-4 bg-gray-800/50 border border-gray-700 rounded-lg">
            <h3 className="text-sm font-semibold text-gray-300 mb-2">Test Bilgileri:</h3>
            <ul className="text-sm text-gray-400 space-y-1">
              <li>• E-posta resend.com üzerinden gönderilecek</li>
              <li>• Gönderen: noreply@satanasfidelis.com</li>
              <li>• Doğrulama linki test amaçlıdır</li>
              <li>• API yanıtını konsol loglarında görebilirsiniz</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
