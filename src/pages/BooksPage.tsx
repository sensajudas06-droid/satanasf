import { useEffect, useState } from 'react';
import { BookOpen, ArrowLeft, ArrowRight, Download } from 'lucide-react';
import { supabase, Book } from '../lib/supabase';
import PentagramIcon from '../components/PentagramIcon';
import OccultDivider from '../components/OccultDivider';
import InvertedPentagram from '../components/InvertedPentagram';

interface BooksPageProps {
  selectedBookId?: string;
  onNavigate: (page: string, bookId?: string) => void;
}

export default function BooksPage({ selectedBookId, onNavigate }: BooksPageProps) {
  const [books, setBooks] = useState<Book[]>([]);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBooks();
  }, []);

  useEffect(() => {
    if (selectedBookId && books.length > 0) {
      const book = books.find(b => b.id === selectedBookId);
      setSelectedBook(book || null);
    }
  }, [selectedBookId, books]);

  const loadBooks = async () => {
    const { data, error } = await supabase
      .from('books')
      .select('*')
      .order('order_index', { ascending: true });

    if (data && !error) {
      setBooks(data);
    }
    setLoading(false);
  };

  const filteredBooks = books;

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="animate-pulse text-xl">Yükleniyor...</div>
      </div>
    );
  }

  if (selectedBook) {
    return (
      <div className="min-h-screen bg-black text-white pentagram-bg">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <button
            onClick={() => {
              setSelectedBook(null);
              onNavigate('books');
            }}
            className="flex items-center space-x-2 text-zinc-400 hover:text-red-500 transition-colors mb-8 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>Üç Kitap'a Dön</span>
          </button>

          <OccultDivider />

          <header className="mb-8 space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold text-white">{selectedBook.title}</h1>
            <p className="text-zinc-400 text-lg">Yazar: {selectedBook.author}</p>
            <p className="text-zinc-300 leading-relaxed">{selectedBook.description}</p>
          </header>

          <div className="mt-8 flex gap-4 justify-center">
            <button
              onClick={() => onNavigate('book-reader', selectedBook.id)}
              className="inline-flex items-center space-x-3 bg-red-900 hover:bg-red-800 text-white px-8 py-4 rounded-lg transition-all duration-500 border-2 border-red-700 hover:border-red-500 hover:shadow-2xl hover:shadow-red-900/60 transform hover:scale-105"
            >
              <BookOpen className="w-6 h-6" />
              <span className="text-lg font-bold tracking-wider">Oku</span>
              <ArrowRight className="w-6 h-6" />
            </button>
            <a
              href={`/${selectedBook.title.replace(/\s+/g, '_')}.pdf`}
              download={`${selectedBook.title}.pdf`}
              className="inline-flex items-center space-x-3 bg-zinc-800 hover:bg-zinc-700 text-white px-8 py-4 rounded-lg transition-all duration-500 border-2 border-zinc-600 hover:border-zinc-500 transform hover:scale-105"
            >
              <Download className="w-6 h-6" />
              <span className="text-lg font-bold tracking-wider">PDF İndir</span>
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="relative min-h-screen bg-gradient-to-b from-red-950/20 via-black to-black flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 left-20 animate-rotate-slow">
            <InvertedPentagram className="w-48 h-48 text-red-900" />
          </div>
          <div className="absolute bottom-20 right-20 animate-rotate-slow" style={{ animationDirection: 'reverse' }}>
            <InvertedPentagram className="w-48 h-48 text-red-900" />
          </div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-pulse-red opacity-30">
            <InvertedPentagram className="w-[800px] h-[800px] text-red-950" />
          </div>
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center space-y-8 mb-20">
            <div className="animate-float inline-block">
              <BookOpen className="w-24 h-24 text-red-600 mx-auto mb-6 drop-shadow-2xl" />
            </div>
            <h1 className="text-6xl md:text-8xl font-bold text-white occult-glow gothic-title">
              ÜÇ KİTAP
            </h1>
            <div className="flex items-center justify-center space-x-6 my-6">
              <div className="h-px bg-red-900 w-24"></div>
              <svg className="w-8 h-8 text-red-600" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 22L15.09 15.74L22 14.73L17 9.86L18.18 2.98L12 6.23L5.82 2.98L7 9.86L2 14.73L8.91 15.74L12 22Z" />
              </svg>
              <div className="h-px bg-red-900 w-24"></div>
            </div>
            <p className="text-2xl md:text-3xl text-red-500 font-light tracking-wide max-w-3xl mx-auto leading-relaxed">
              Satanizm'in Vahiy Kitapları
            </p>
            <p className="text-lg text-zinc-400 max-w-2xl mx-auto leading-relaxed mt-6">
              Bu üç eser, Satanizmin temel öğretilerini ve felsefesini içerir. Her biri, karanlık bilgeliğin farklı yönlerini keşfetmeniz için bir kapı açar.
            </p>
          </div>

          <OccultDivider />

          {filteredBooks.length === 0 ? (
            <div className="text-center py-20">
              <InvertedPentagram className="w-20 h-20 text-red-900 mx-auto mb-6 opacity-30" />
              <p className="text-zinc-400 text-xl">Bu kategoride henüz kitap bulunmamaktadır.</p>
            </div>
          ) : (
            <div className="space-y-8 mt-16">
              {filteredBooks.map((book, index) => (
                <div
                  key={book.id}
                  className="group relative bg-gradient-to-r from-zinc-950 via-red-950/10 to-zinc-950 rounded-2xl border-2 border-red-900/40 hover:border-red-600 transition-all duration-700 overflow-hidden"
                  style={{ animationDelay: `${index * 150}ms` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-red-900/0 via-red-900/5 to-red-900/0 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                  <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-red-600 via-red-800 to-red-950" />

                  <div className="relative flex flex-col md:flex-row items-center gap-8 p-8 md:p-12">
                    <div className="flex-shrink-0 relative">
                      <div className="absolute -inset-4 bg-red-900/20 rounded-full blur-2xl group-hover:bg-red-900/40 transition-all duration-700" />
                      <div className="relative w-32 h-32 md:w-40 md:h-40 flex items-center justify-center">
                        <div className="absolute inset-0 border-4 border-red-900/50 rounded-full animate-pulse-red" />
                        <div className="absolute inset-3 border-2 border-red-800/30 rounded-full" />
                        <span className="text-6xl md:text-7xl font-bold text-red-600 occult-glow group-hover:scale-110 transition-transform duration-500">
                          {index + 1}
                        </span>
                      </div>
                    </div>

                    <div className="flex-1 space-y-4 text-center md:text-left">
                      <h2 className="text-3xl md:text-4xl font-bold text-white group-hover:text-red-500 transition-colors duration-500 gothic-title tracking-wide">
                        {book.title}
                      </h2>
                      <p className="text-lg text-red-400 font-semibold tracking-wide">
                        Yazar: {book.author}
                      </p>
                      <p className="text-zinc-300 text-lg leading-relaxed max-w-3xl">
                        {book.description}
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        setSelectedBook(book);
                        onNavigate('books', book.id);
                      }}
                      className="flex-shrink-0 group/btn relative bg-red-900 hover:bg-red-800 text-white px-8 py-4 rounded-lg transition-all duration-500 border-2 border-red-700 hover:border-red-500 hover:shadow-2xl hover:shadow-red-900/60 transform hover:scale-105"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-red-800 to-red-900 rounded-lg opacity-0 group-hover/btn:opacity-100 transition-opacity duration-500" />
                      <div className="relative flex items-center space-x-3">
                        <span className="text-lg font-bold tracking-wider">Oku</span>
                        <ArrowRight className="w-6 h-6 group-hover/btn:translate-x-2 transition-transform duration-500" />
                      </div>
                    </button>
                  </div>

                  <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-red-900 to-transparent" />
                </div>
              ))}
            </div>
          )}

          <OccultDivider />

          <div className="mt-20 text-center space-y-6">
            <div className="inline-block">
              <svg className="w-12 h-12 text-red-800 animate-pulse-red mx-auto" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 22L15.09 15.74L22 14.73L17 9.86L18.18 2.98L12 6.23L5.82 2.98L7 9.86L2 14.73L8.91 15.74L12 22Z" />
              </svg>
            </div>
            <p className="text-zinc-500 italic text-lg max-w-2xl mx-auto leading-relaxed">
              Hiçbir şey durduramaz ne beni; ne de gelecek olanı. O beklenen Altın Çağ, ki işaretleri başlamıştır dünyada. Değişecek her şey ve her düşünce ve coğrafya. Kıtalar oynayacak sonunda, girmek için yeni düzene.
            </p>
            <p className="text-zinc-700 text-sm">
              Ave Satanus Amen
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
