import { useState } from 'react';
import { ArrowLeft, Upload, File } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface LibraryUploadPageProps {
  onNavigate: (page: string) => void;
}

export default function LibraryUploadPage({ onNavigate }: LibraryUploadPageProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { profile } = useAuth();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      const maxSize = 250 * 1024 * 1024;
      if (selectedFile.size > maxSize) {
        setError('Dosya boyutu 250MB\'dan küçük olmalıdır');
        return;
      }
      setFile(selectedFile);
      setError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || !['writer', 'moderator', 'admin', 'super_admin'].includes(profile.role)) {
      setError('Bu işlem için yetkiniz bulunmamaktadır');
      return;
    }

    setError('');
    setLoading(true);
    setUploadProgress(0);

    try {
      if (!title.trim() || !description.trim() || !file) {
        setError('Lütfen tüm alanları doldurun');
        setLoading(false);
        return;
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `${profile.id}/${fileName}`;

      setUploadProgress(30);

      const { error: uploadError } = await supabase.storage
        .from('library-files')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        throw new Error('Dosya yüklenirken bir hata oluştu: ' + uploadError.message);
      }

      setUploadProgress(60);

      const { data: { publicUrl } } = supabase.storage
        .from('library-files')
        .getPublicUrl(filePath);

      setUploadProgress(80);

      const { error: insertError } = await supabase
        .from('library')
        .insert({
          title: title.trim(),
          description: description.trim(),
          file_url: publicUrl,
          uploaded_by: profile.id,
          file_size: file.size,
          download_count: 0,
        });

      if (insertError) {
        await supabase.storage.from('library-files').remove([filePath]);
        throw new Error('Kaynak eklenirken bir hata oluştu');
      }

      setUploadProgress(100);
      onNavigate('admin');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bir hata oluştu');
      setLoading(false);
    }
  };

  if (!profile || !['writer', 'moderator', 'admin', 'super_admin'].includes(profile.role)) {
    return null;
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <button
          onClick={() => onNavigate('admin')}
          className="flex items-center space-x-2 text-zinc-400 hover:text-white transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Yönetime Dön</span>
        </button>

        <h1 className="text-4xl font-bold mb-8">Yeni Kaynak Yükle</h1>

        {error && (
          <div className="mb-6 bg-red-900/20 border border-red-900 rounded-lg p-4 text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-2">
              Başlık *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-white placeholder-zinc-600 focus:outline-none focus:border-red-500 transition-colors"
              placeholder="Kaynak başlığı"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-2">
              Açıklama *
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-white placeholder-zinc-600 focus:outline-none focus:border-red-500 transition-colors resize-none"
              placeholder="Kaynak açıklaması"
              rows={3}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-2">
              Dosya Yükle *
            </label>
            <div className="relative">
              <input
                type="file"
                accept=".pdf,.epub,.mobi,.txt"
                onChange={handleFileChange}
                className="hidden"
                id="file-upload"
                required
              />
              <label
                htmlFor="file-upload"
                className="flex items-center justify-center w-full px-4 py-3 bg-zinc-900 border-2 border-dashed border-zinc-700 rounded-lg text-zinc-400 hover:border-red-500 hover:text-red-400 transition-colors cursor-pointer"
              >
                <File className="w-5 h-5 mr-2" />
                {file ? file.name : 'Dosya seçmek için tıklayın'}
              </label>
            </div>
            {file && (
              <p className="mt-2 text-sm text-green-400">
                Seçildi: {file.name} ({(file.size / (1024 * 1024)).toFixed(2)} MB)
              </p>
            )}
            <p className="mt-2 text-sm text-zinc-500">
              PDF, EPUB, MOBI veya TXT formatında dosya yükleyebilirsiniz (Maks. 250MB)
            </p>
          </div>

          {loading && uploadProgress > 0 && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-zinc-400">
                <span>Yükleniyor...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full bg-zinc-800 rounded-full h-2">
                <div
                  className="bg-red-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="flex items-center justify-center space-x-2 w-full px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Upload className="w-5 h-5" />
            <span>{loading ? 'Yükleniyor...' : 'Yükle'}</span>
          </button>
        </form>
      </div>
    </div>
  );
}
