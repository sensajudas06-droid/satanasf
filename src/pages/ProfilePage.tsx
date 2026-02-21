import { useState, useEffect } from 'react';
import { ArrowLeft, User, Mail, Lock, Image, Save, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import OccultDivider from '../components/OccultDivider';
import InvertedPentagram from '../components/InvertedPentagram';
import EmailVerification from '../components/EmailVerification';

interface ProfilePageProps {
  onNavigate: (page: string) => void;
}

export default function ProfilePage({ onNavigate }: ProfilePageProps) {
  const { profile, user, refreshProfile } = useAuth();
  const [displayName, setDisplayName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [bio, setBio] = useState('');
  const [email, setEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [canChangeName, setCanChangeName] = useState(true);
  const [nextNameChangeDate, setNextNameChangeDate] = useState<Date | null>(null);

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name);
      setAvatarUrl(profile.avatar_url || '');
      setBio(profile.bio || '');
      checkNameChangeAvailability();
    }
    if (user) {
      setEmail(user.email || '');
    }
  }, [profile, user]);

  const checkNameChangeAvailability = async () => {
    if (!profile) return;

    const { data } = await supabase
      .from('profiles')
      .select('display_name_changed_at')
      .eq('id', profile.id)
      .maybeSingle();

    if (data?.display_name_changed_at) {
      const lastChanged = new Date(data.display_name_changed_at);
      const nextChange = new Date(lastChanged);
      nextChange.setDate(nextChange.getDate() + 13);

      const now = new Date();
      if (now < nextChange) {
        setCanChangeName(false);
        setNextNameChangeDate(nextChange);
      } else {
        setCanChangeName(true);
        setNextNameChangeDate(null);
      }
    }
  };

  const getDaysUntilNameChange = () => {
    if (!nextNameChangeDate) return 0;
    const now = new Date();
    const diff = nextNameChangeDate.getTime() - now.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const updates: any = {
        avatar_url: avatarUrl.trim() || null,
        bio: bio.trim() || null,
      };

      if (displayName.trim() !== profile.display_name) {
        if (!canChangeName) {
          setError(`Görünür adınızı ${getDaysUntilNameChange()} gün sonra değiştirebilirsiniz`);
          setLoading(false);
          return;
        }
        updates.display_name = displayName.trim();
        updates.display_name_changed_at = new Date().toISOString();
      }

      const { error: updateError } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', profile.id);

      if (updateError) throw updateError;

      await refreshProfile();
      await checkNameChangeAvailability();
      setSuccess('Profil başarıyla güncellendi');
    } catch (err: any) {
      setError(err.message || 'Profil güncellenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        email: email.trim(),
      });

      if (updateError) throw updateError;

      setSuccess('E-posta güncelleme linki gönderildi. Lütfen yeni e-posta adresinizi kontrol edin.');
    } catch (err: any) {
      setError(err.message || 'E-posta güncellenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    setError('');
    setSuccess('');

    if (newPassword.length < 6) {
      setError('Yeni şifre en az 6 karakter olmalıdır');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Şifreler eşleşmiyor');
      return;
    }

    setLoading(true);

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) throw updateError;

      setNewPassword('');
      setConfirmPassword('');
      setCurrentPassword('');
      setSuccess('Şifre başarıyla güncellendi');
    } catch (err: any) {
      setError(err.message || 'Şifre güncellenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  if (!profile) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <p>Profil yükleniyor...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white pentagram-bg">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <button
          onClick={() => onNavigate('home')}
          className="flex items-center space-x-2 text-zinc-400 hover:text-red-500 transition-colors mb-8 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Ana Sayfaya Dön</span>
        </button>

        <div className="flex items-center space-x-4 mb-8">
          <InvertedPentagram className="w-12 h-12 text-red-600" />
          <h1 className="text-4xl font-bold gothic-title">Profil Ayarları</h1>
        </div>

        <OccultDivider />

        {error && (
          <div className="mb-6 bg-red-900/20 border border-red-900 rounded-lg p-4 flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-6 bg-green-900/20 border border-green-900 rounded-lg p-4 text-green-400">
            {success}
          </div>
        )}

        <div className="mb-8">
          <EmailVerification
            userId={profile.id}
            email={user?.email || ''}
            isVerified={profile.email_verified}
            onVerified={refreshProfile}
          />
        </div>

        <div className="space-y-8">
          <form onSubmit={handleUpdateProfile} className="bg-zinc-950 border-2 border-red-900/30 rounded-lg p-6 space-y-6">
            <div className="flex items-center space-x-3 mb-4">
              <User className="w-6 h-6 text-red-600" />
              <h2 className="text-2xl font-bold gothic-title">Profil Bilgileri</h2>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">
                Görünür Ad
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-white placeholder-zinc-600 focus:outline-none focus:border-red-500 transition-colors"
                required
                disabled={loading}
              />
              {!canChangeName && nextNameChangeDate && (
                <p className="mt-2 text-sm text-yellow-500 flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4" />
                  <span>Görünür adınızı {getDaysUntilNameChange()} gün sonra değiştirebilirsiniz</span>
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">
                Profil Fotoğrafı URL
              </label>
              <div className="space-y-3">
                <input
                  type="url"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  className="w-full px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-white placeholder-zinc-600 focus:outline-none focus:border-red-500 transition-colors"
                  placeholder="https://..."
                  disabled={loading}
                />
                {avatarUrl && (
                  <div className="flex items-center space-x-4">
                    <img
                      src={avatarUrl}
                      alt="Profil önizlemesi"
                      className="w-20 h-20 rounded-full object-cover border-2 border-red-900"
                      onError={(e) => {
                        e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23333" width="100" height="100"/%3E%3C/svg%3E';
                      }}
                    />
                    <span className="text-sm text-zinc-500">Önizleme</span>
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">
                Biyografi
              </label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-white placeholder-zinc-600 focus:outline-none focus:border-red-500 transition-colors resize-none"
                rows={4}
                placeholder="Kendinizden bahsedin..."
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex items-center justify-center space-x-2 w-full px-6 py-3 bg-red-700 border border-red-600 text-white rounded-lg hover:bg-red-800 hover:shadow-lg hover:shadow-red-900/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-5 h-5" />
              <span>{loading ? 'Kaydediliyor...' : 'Profili Güncelle'}</span>
            </button>
          </form>

          <form onSubmit={handleUpdateEmail} className="bg-zinc-950 border-2 border-red-900/30 rounded-lg p-6 space-y-6">
            <div className="flex items-center space-x-3 mb-4">
              <Mail className="w-6 h-6 text-red-600" />
              <h2 className="text-2xl font-bold gothic-title">E-posta Değiştir</h2>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">
                Yeni E-posta Adresi
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-white placeholder-zinc-600 focus:outline-none focus:border-red-500 transition-colors"
                required
                disabled={loading}
              />
              <p className="mt-2 text-sm text-zinc-500">
                Yeni e-posta adresinize onay linki gönderilecektir
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex items-center justify-center space-x-2 w-full px-6 py-3 bg-red-700 border border-red-600 text-white rounded-lg hover:bg-red-800 hover:shadow-lg hover:shadow-red-900/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Mail className="w-5 h-5" />
              <span>{loading ? 'Gönderiliyor...' : 'E-posta Değiştir'}</span>
            </button>
          </form>

          <form onSubmit={handleUpdatePassword} className="bg-zinc-950 border-2 border-red-900/30 rounded-lg p-6 space-y-6">
            <div className="flex items-center space-x-3 mb-4">
              <Lock className="w-6 h-6 text-red-600" />
              <h2 className="text-2xl font-bold gothic-title">Şifre Değiştir</h2>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">
                Yeni Şifre
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-white placeholder-zinc-600 focus:outline-none focus:border-red-500 transition-colors"
                placeholder="En az 6 karakter"
                minLength={6}
                required
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">
                Yeni Şifre (Tekrar)
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-white placeholder-zinc-600 focus:outline-none focus:border-red-500 transition-colors"
                placeholder="Şifrenizi tekrar girin"
                minLength={6}
                required
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex items-center justify-center space-x-2 w-full px-6 py-3 bg-red-700 border border-red-600 text-white rounded-lg hover:bg-red-800 hover:shadow-lg hover:shadow-red-900/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Lock className="w-5 h-5" />
              <span>{loading ? 'Güncelleniyor...' : 'Şifre Değiştir'}</span>
            </button>
          </form>

          <div className="bg-zinc-950 border-2 border-red-900/30 rounded-lg p-6">
            <div className="flex items-center space-x-3 mb-4">
              <InvertedPentagram className="w-6 h-6 text-red-600" />
              <h2 className="text-2xl font-bold gothic-title">Hesap Bilgileri</h2>
            </div>
            <div className="space-y-3 text-zinc-400">
              <p><span className="text-zinc-500">Rol:</span> <span className="text-red-500 font-semibold">{profile.role}</span></p>
              <p><span className="text-zinc-500">Üyelik Tarihi:</span> {new Date(profile.created_at).toLocaleDateString('tr-TR', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
