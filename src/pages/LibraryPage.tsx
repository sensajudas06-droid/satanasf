import { useEffect, useState } from 'react';
import { Library, Download, FileText, Calendar } from 'lucide-react';
import { supabase, LibraryItem } from '../lib/supabase';
import PentagramIcon from '../components/PentagramIcon';
import OccultDivider from '../components/OccultDivider';

interface LibraryPageProps {
  onNavigate: (page: string) => void;
}

export default function LibraryPage({ onNavigate }: LibraryPageProps) {
  const [items, setItems] = useState<LibraryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLibrary();
  }, []);

  const loadLibrary = async () => {
    const { data, error } = await supabase
      .from('library')
      .select(`
        *,
        uploader:profiles(*)
      `)
      .order('created_at', { ascending: false });

    if (data && !error) {
      setItems(data as LibraryItem[]);
    }
    setLoading(false);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleDownload = async (item: LibraryItem) => {
    await supabase
      .from('library')
      .update({ download_count: item.download_count + 1 })
      .eq('id', item.id);

    window.open(item.file_url, '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="animate-pulse text-xl">Yükleniyor...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white pentagram-bg">
      <div className="relative h-96 bg-gradient-to-b from-red-950/30 to-black flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <PentagramIcon className="absolute top-10 left-10 w-32 h-32 text-red-900 animate-rotate-slow" />
          <PentagramIcon className="absolute bottom-10 right-10 w-32 h-32 text-red-900 animate-rotate-slow" style={{ animationDirection: 'reverse' }} />
        </div>

        <div className="relative z-10 text-center space-y-6 px-4">
          <div className="animate-float">
            <Library className="w-20 h-20 mx-auto text-red-600 mb-4" />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-white occult-glow gothic-title">KÜTÜPHANE</h1>
          <div className="flex items-center justify-center space-x-4 my-4">
            <div className="h-px bg-red-900 w-16"></div>
            <PentagramIcon className="w-6 h-6 text-red-600" />
            <div className="h-px bg-red-900 w-16"></div>
          </div>
          <p className="text-xl text-red-500 font-light max-w-2xl mx-auto">
            Satanizm'i Daha İyi Öğrenmek Ve Satanik Kültürü Tanımak İçin Önerdiğimiz Güvenilir Kaynaklar
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <OccultDivider />

        {items.length === 0 ? (
          <div className="text-center py-20">
            <PentagramIcon className="w-16 h-16 text-red-900 mx-auto mb-4 opacity-50" />
            <p className="text-zinc-400 text-lg">
              Henüz kaynak eklenmemiştir.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item, index) => (
              <div
                key={item.id}
                className="group relative bg-zinc-950 rounded-lg border-2 border-red-900/30 hover:border-red-600 transition-all duration-500 p-6 space-y-4 hover:shadow-2xl hover:shadow-red-900/50"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-red-900 to-transparent" />

                <div className="flex items-start justify-between">
                  <FileText className="w-10 h-10 text-red-600 group-hover:scale-110 transition-transform" />
                </div>

                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-white group-hover:text-red-500 transition-colors line-clamp-2 tracking-wide">{item.title}</h3>
                  <p className="text-zinc-400 text-sm line-clamp-3 leading-relaxed">{item.description}</p>
                </div>

                <div className="flex items-center justify-between text-xs text-zinc-500 pt-2 border-t border-zinc-800">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-3 h-3 text-red-700" />
                    <span>{formatDate(item.created_at)}</span>
                  </div>
                  <span className="text-red-700">{formatFileSize(item.file_size)}</span>
                </div>

                <button
                  onClick={() => handleDownload(item)}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-red-700 border border-red-600 text-white rounded-lg hover:bg-red-800 hover:shadow-lg hover:shadow-red-900/50 transition-all duration-300"
                >
                  <Download className="w-4 h-4" />
                  <span className="tracking-wide">İndir ({item.download_count})</span>
                </button>

                <div className="flex items-center justify-center pt-2">
                  <svg className="w-4 h-4 text-red-900 group-hover:text-red-600 transition-colors" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 22L15.09 15.74L22 14.73L17 9.86L18.18 2.98L12 6.23L5.82 2.98L7 9.86L2 14.73L8.91 15.74L12 22Z" />
                  </svg>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
