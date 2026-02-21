import { useState, useEffect } from 'react';
import { Save, Link as LinkIcon } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export default function SocialMediaSettings() {
  const [discordUrl, setDiscordUrl] = useState('');
  const [instagramUrl, setInstagramUrl] = useState('');
  const [tiktokUrl, setTiktokUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [settingsId, setSettingsId] = useState<string | null>(null);
  const { profile } = useAuth();

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('social_settings')
        .select('*')
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setSettingsId(data.id);
        setDiscordUrl(data.discord_url || '');
        setInstagramUrl(data.instagram_url || '');
        setTiktokUrl(data.tiktok_url || '');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ayarlar yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || profile.role !== 'super_admin') {
      setError('Bu işlem için yetkiniz bulunmamaktadır');
      return;
    }

    setError('');
    setSuccess('');
    setSaving(true);

    try {
      if (!settingsId) {
        throw new Error('Ayarlar ID\'si bulunamadı');
      }

      const { error: updateError } = await supabase
        .from('social_settings')
        .update({
          discord_url: discordUrl.trim(),
          instagram_url: instagramUrl.trim(),
          tiktok_url: tiktokUrl.trim(),
          updated_at: new Date().toISOString(),
          updated_by: profile.id
        })
        .eq('id', settingsId);

      if (updateError) throw updateError;

      setSuccess('Sosyal medya bağlantıları başarıyla güncellendi');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Güncellenirken bir hata oluştu');
    } finally {
      setSaving(false);
    }
  };

  if (profile?.role !== 'super_admin') {
    return null;
  }

  if (loading) {
    return (
      <div className="bg-zinc-900 rounded-lg border border-zinc-800 p-6">
        <p className="text-zinc-400">Yükleniyor...</p>
      </div>
    );
  }

  return (
    <div className="bg-zinc-900 rounded-lg border border-zinc-800 p-6">
      <div className="flex items-center space-x-3 mb-6">
        <LinkIcon className="w-6 h-6 text-red-500" />
        <h2 className="text-2xl font-bold">Sosyal Medya Bağlantıları</h2>
      </div>

      {error && (
        <div className="mb-6 bg-red-900/20 border border-red-900 rounded-lg p-4 text-red-400">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-6 bg-green-900/20 border border-green-900 rounded-lg p-4 text-green-400">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-zinc-400 mb-2">
            Discord Davet Linki
          </label>
          <input
            type="url"
            value={discordUrl}
            onChange={(e) => setDiscordUrl(e.target.value)}
            className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-red-500 transition-colors"
            placeholder="https://discord.gg/..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-400 mb-2">
            Instagram Profil Linki
          </label>
          <input
            type="url"
            value={instagramUrl}
            onChange={(e) => setInstagramUrl(e.target.value)}
            className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-red-500 transition-colors"
            placeholder="https://instagram.com/..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-400 mb-2">
            TikTok Profil Linki
          </label>
          <input
            type="url"
            value={tiktokUrl}
            onChange={(e) => setTiktokUrl(e.target.value)}
            className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-red-500 transition-colors"
            placeholder="https://tiktok.com/@..."
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="flex items-center justify-center space-x-2 w-full px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save className="w-5 h-5" />
          <span>{saving ? 'Kaydediliyor...' : 'Kaydet'}</span>
        </button>
      </form>
    </div>
  );
}
