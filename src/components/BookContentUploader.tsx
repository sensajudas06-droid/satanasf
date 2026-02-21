import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Upload, Check, X, Loader } from 'lucide-react';

interface UploadStatus {
  title: string;
  status: 'pending' | 'uploading' | 'success' | 'error';
  message?: string;
}

export default function BookContentUploader() {
  const [uploading, setUploading] = useState(false);
  const [statuses, setStatuses] = useState<UploadStatus[]>([]);

  async function uploadBookContents() {
    setUploading(true);
    setStatuses([]);

    const books = [
      { id: 'c7919e26-1eea-467e-9a78-e1053898c145', title: 'Ayetler Kitabı', file: 'Ayetler_Kitabi_extracted.txt' },
      { id: '54158352-f2c5-4fa7-b009-f647064628ba', title: 'Gerçekler Kitabı', file: 'Gercekler_Kitabi_extracted.txt' },
      { id: 'fc73e71d-ae71-4975-ad32-f20ab0f9bc0d', title: 'İsa Kitabı', file: 'Isa_Kitabi_extracted.txt' }
    ];

    for (const book of books) {
      setStatuses(prev => [...prev, { title: book.title, status: 'uploading' }]);

      const { data: existing } = await supabase
        .from('book_chapters')
        .select('id')
        .eq('book_id', book.id)
        .eq('chapter_number', 1)
        .maybeSingle();

      if (existing) {
        setStatuses(prev => prev.map(s =>
          s.title === book.title
            ? { ...s, status: 'success', message: 'Zaten yüklü' }
            : s
        ));
        continue;
      }

      try {
        const response = await fetch(`/${book.file}`);
        const content = await response.text();

        const { error } = await supabase
          .from('book_chapters')
          .insert({
            book_id: book.id,
            chapter_number: 1,
            title: book.title,
            content: content
          });

        if (error) {
          setStatuses(prev => prev.map(s =>
            s.title === book.title
              ? { ...s, status: 'error', message: error.message }
              : s
          ));
        } else {
          setStatuses(prev => prev.map(s =>
            s.title === book.title
              ? { ...s, status: 'success', message: 'Başarıyla yüklendi' }
              : s
          ));
        }
      } catch (err) {
        setStatuses(prev => prev.map(s =>
          s.title === book.title
            ? { ...s, status: 'error', message: (err as Error).message }
            : s
        ));
      }
    }

    setUploading(false);
  }

  return (
    <div className="bg-gray-900 border border-red-900/30 rounded-lg p-6">
      <h3 className="text-xl font-bold text-red-500 mb-4">Kitap İçeriklerini Yükle</h3>

      <p className="text-gray-400 mb-6">
        Bu araç, kitapların tam metinlerini veritabanına yükler. Her kitap için sadece bir kez çalıştırmanız yeterlidir.
      </p>

      <button
        onClick={uploadBookContents}
        disabled={uploading}
        className="flex items-center gap-2 bg-red-900 hover:bg-red-800 disabled:bg-gray-700 text-white px-6 py-3 rounded-lg transition-colors"
      >
        {uploading ? (
          <>
            <Loader className="w-5 h-5 animate-spin" />
            <span>Yükleniyor...</span>
          </>
        ) : (
          <>
            <Upload className="w-5 h-5" />
            <span>Yüklemeyi Başlat</span>
          </>
        )}
      </button>

      {statuses.length > 0 && (
        <div className="mt-6 space-y-2">
          {statuses.map((status, index) => (
            <div
              key={index}
              className={`flex items-center gap-3 p-3 rounded-lg ${
                status.status === 'success' ? 'bg-green-900/20 border border-green-700/30' :
                status.status === 'error' ? 'bg-red-900/20 border border-red-700/30' :
                'bg-gray-800 border border-gray-700'
              }`}
            >
              {status.status === 'uploading' && <Loader className="w-5 h-5 text-blue-400 animate-spin" />}
              {status.status === 'success' && <Check className="w-5 h-5 text-green-400" />}
              {status.status === 'error' && <X className="w-5 h-5 text-red-400" />}

              <div className="flex-1">
                <div className="font-medium text-white">{status.title}</div>
                {status.message && (
                  <div className="text-sm text-gray-400">{status.message}</div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
