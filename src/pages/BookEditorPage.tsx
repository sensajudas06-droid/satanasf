import { useEffect, useState } from 'react';
import { ArrowLeft, Save } from 'lucide-react';
import { supabase, Book } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface BookEditorPageProps {
  bookId?: string;
  onNavigate: (page: string) => void;
}

export default function BookEditorPage({ bookId, onNavigate }: BookEditorPageProps) {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [description, setDescription] = useState('');
  const [content, setContent] = useState('');
  const [orderIndex, setOrderIndex] = useState(0);
  const [chapterTitle, setChapterTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { profile } = useAuth();

  useEffect(() => {
    if (!profile || !['super_admin', 'admin'].includes(profile.role)) {
      onNavigate('home');
      return;
    }

    if (bookId) {
      loadBook();
    }
  }, [bookId, profile]);

  const loadBook = async () => {
    if (!bookId) return;

    const { data: bookData, error: bookError } = await supabase
      .from('books')
      .select('*')
      .eq('id', bookId)
      .maybeSingle();

    if (bookData && !bookError) {
      const book = bookData as Book;
      setTitle(book.title);
      setAuthor(book.author);
      setDescription(book.description);
      setOrderIndex(book.order_index);
    }

    const { data: chapterData } = await supabase
      .from('book_chapters')
      .select('*')
      .eq('book_id', bookId)
      .eq('chapter_number', 1)
      .maybeSingle();

    if (chapterData) {
      setChapterTitle(chapterData.title);
      setContent(chapterData.content || '');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || !['super_admin', 'admin'].includes(profile.role)) return;

    setError('');
    setLoading(true);

    if (!title.trim() || !author.trim() || !description.trim()) {
      setError('Lütfen tüm zorunlu alanları doldurun');
      setLoading(false);
      return;
    }

    const bookData: any = {
      title: title.trim(),
      author: author.trim(),
      description: description.trim(),
      order_index: orderIndex,
    };

    if (bookId) {
      const { error: updateError } = await supabase
        .from('books')
        .update(bookData)
        .eq('id', bookId);

      if (updateError) {
        setError('Kitap güncellenirken bir hata oluştu: ' + updateError.message);
        setLoading(false);
        return;
      }

      if (content.trim()) {
        const { data: existingChapter } = await supabase
          .from('book_chapters')
          .select('id')
          .eq('book_id', bookId)
          .eq('chapter_number', 1)
          .maybeSingle();

        if (existingChapter) {
          const { error: chapterError } = await supabase
            .from('book_chapters')
            .update({
              title: chapterTitle.trim() || title.trim(),
              content: content.trim()
            })
            .eq('book_id', bookId)
            .eq('chapter_number', 1);

          if (chapterError) {
            setError('İçerik güncellenirken hata: ' + chapterError.message);
            setLoading(false);
            return;
          }
        } else {
          const { error: chapterError } = await supabase
            .from('book_chapters')
            .insert({
              book_id: bookId,
              chapter_number: 1,
              title: chapterTitle.trim() || title.trim(),
              content: content.trim()
            });

          if (chapterError) {
            setError('İçerik eklenirken hata: ' + chapterError.message);
            setLoading(false);
            return;
          }
        }
      }

      onNavigate('admin');
    } else {
      const { data: newBook, error: insertError } = await supabase
        .from('books')
        .insert(bookData)
        .select()
        .single();

      if (insertError || !newBook) {
        setError('Kitap eklenirken bir hata oluştu: ' + insertError?.message);
        setLoading(false);
        return;
      }

      if (content.trim()) {
        const { error: chapterError } = await supabase
          .from('book_chapters')
          .insert({
            book_id: newBook.id,
            chapter_number: 1,
            title: chapterTitle.trim() || title.trim(),
            content: content.trim()
          });

        if (chapterError) {
          setError('İçerik eklenirken hata: ' + chapterError.message);
          setLoading(false);
          return;
        }
      }

      onNavigate('admin');
    }

    setLoading(false);
  };

  if (!profile || !['super_admin', 'admin'].includes(profile.role)) {
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

        <h1 className="text-4xl font-bold mb-8">
          {bookId ? 'Kitabı Düzenle' : 'Yeni Kitap Ekle'}
        </h1>

        {error && (
          <div className="mb-6 bg-red-900/20 border border-red-900 rounded-lg p-4 text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-2">
              Kitap Başlığı *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-white placeholder-zinc-600 focus:outline-none focus:border-red-500 transition-colors"
              placeholder="Kitap başlığı"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-2">
              Yazar *
            </label>
            <input
              type="text"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              className="w-full px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-white placeholder-zinc-600 focus:outline-none focus:border-red-500 transition-colors"
              placeholder="Yazar adı"
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
              placeholder="Kitap açıklaması"
              rows={3}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-2">
              Sıralama
            </label>
            <input
              type="number"
              value={orderIndex}
              onChange={(e) => setOrderIndex(parseInt(e.target.value))}
              className="w-full px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-white placeholder-zinc-600 focus:outline-none focus:border-red-500 transition-colors"
              min={0}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-2">
              Bölüm Başlığı
            </label>
            <input
              type="text"
              value={chapterTitle}
              onChange={(e) => setChapterTitle(e.target.value)}
              className="w-full px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-white placeholder-zinc-600 focus:outline-none focus:border-red-500 transition-colors"
              placeholder="Varsayılan: Kitap başlığı"
            />
            <p className="text-xs text-zinc-500 mt-1">Boş bırakılırsa kitap başlığı kullanılır</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-2">
              İçerik
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-white placeholder-zinc-600 focus:outline-none focus:border-red-500 transition-colors resize-y font-mono text-sm"
              placeholder="Kitap içeriği (opsiyonel - içerik yükleyici ile de eklenebilir)"
              rows={20}
            />
            <p className="text-xs text-zinc-500 mt-1">
              İçerik burada düzenlenebilir veya "Kitap İçeriklerini Yükle" aracı ile toplu olarak yüklenebilir
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex items-center justify-center space-x-2 w-full px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-5 h-5" />
            <span>{loading ? 'Kaydediliyor...' : 'Kaydet'}</span>
          </button>
        </form>
      </div>
    </div>
  );
}
