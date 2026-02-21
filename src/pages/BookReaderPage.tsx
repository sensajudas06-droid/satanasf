import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { ArrowLeft, BookOpen } from 'lucide-react';
import InvertedPentagram from '../components/InvertedPentagram';

interface Book {
  id: string;
  title: string;
  author: string;
}

interface Chapter {
  id: string;
  content: string;
}

interface BookReaderPageProps {
  bookId: string;
  onNavigate: (page: string, params?: string) => void;
}

export default function BookReaderPage({ bookId, onNavigate }: BookReaderPageProps) {
  const [book, setBook] = useState<Book | null>(null);
  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBookAndChapter();
  }, [bookId]);

  async function loadBookAndChapter() {
    if (!bookId) return;

    const { data: bookData } = await supabase
      .from('books')
      .select('id, title, author')
      .eq('id', bookId)
      .maybeSingle();

    if (bookData) {
      setBook(bookData);

      const { data: chapterData } = await supabase
        .from('book_chapters')
        .select('id, content')
        .eq('book_id', bookId)
        .eq('chapter_number', 1)
        .maybeSingle();

      setChapter(chapterData);
    }

    setLoading(false);
  }

  const formatContent = (content: string) => {
    const lines = content.split('\n');
    return lines.map((line, index) => {
      const trimmedLine = line.trim();

      if (/^[IVX]+\.?\s+/.test(trimmedLine)) {
        const match = trimmedLine.match(/^([IVX]+\.?)\s+(.+)$/);
        if (match) {
          return (
            <div key={index} className="my-8 flex items-center gap-4">
              <div className="flex items-center gap-3">
                <InvertedPentagram className="w-6 h-6 text-blue-600" />
                <span className="text-2xl font-bold text-blue-500 tracking-wider">
                  {match[1]}
                </span>
              </div>
              <span className="text-xl text-blue-400 font-semibold italic">
                {match[2]}
              </span>
            </div>
          );
        }
      }

      if (/^\d+\./.test(trimmedLine)) {
        const match = trimmedLine.match(/^(\d+)\.\s*(.+)$/);
        if (match) {
          return (
            <p key={index} className="mb-4 leading-relaxed">
              <span className="inline-flex items-center gap-2 mr-2">
                <span className="text-red-500 font-bold text-lg min-w-[2rem]">
                  {match[1]}.
                </span>
              </span>
              <span className="text-gray-200">
                {match[2]}
              </span>
            </p>
          );
        }
      }

      if (trimmedLine === '') {
        return <div key={index} className="h-4" />;
      }

      return (
        <p key={index} className="mb-4 text-gray-200 leading-relaxed">
          {line}
        </p>
      );
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-red-500">Yükleniyor...</div>
      </div>
    );
  }

  if (!book || !chapter) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-red-500">Kitap bulunamadı</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-zinc-950 to-black text-gray-100">
      <div className="absolute inset-0 opacity-5 pointer-events-none overflow-hidden">
        <div className="absolute top-20 left-10 animate-rotate-slow">
          <InvertedPentagram className="w-32 h-32 text-red-900" />
        </div>
        <div className="absolute bottom-20 right-10 animate-rotate-slow" style={{ animationDirection: 'reverse' }}>
          <InvertedPentagram className="w-32 h-32 text-red-900" />
        </div>
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => onNavigate('books')}
          className="group flex items-center gap-2 text-red-500 hover:text-red-400 mb-8 transition-all duration-300 hover:translate-x-[-4px]"
        >
          <ArrowLeft className="w-5 h-5 group-hover:translate-x-[-2px] transition-transform" />
          <span className="font-semibold">Kitaplara Dön</span>
        </button>

        <div className="mb-10 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-red-950/30 via-red-900/20 to-red-950/30 blur-2xl -z-10"></div>
          <div className="flex items-center gap-4 mb-3 border-b border-red-900/30 pb-4">
            <BookOpen className="w-10 h-10 text-red-500" />
            <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-red-400 to-red-500 tracking-wide gothic-title">
              {book.title}
            </h1>
          </div>
          <p className="text-gray-400 ml-14 text-lg">
            <span className="text-red-700 font-semibold">Yazar:</span> {book.author}
          </p>
        </div>

        <div className="bg-gradient-to-br from-zinc-950 via-black to-zinc-950 rounded-xl border-2 border-red-900/40 shadow-2xl shadow-red-900/30 p-6 sm:p-10 md:p-14 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-red-900/5 rounded-full blur-3xl -z-0"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-red-900/5 rounded-full blur-3xl -z-0"></div>

          <div className="relative z-10">
            <div className="prose prose-invert prose-red max-w-none">
              <div className="font-serif text-base md:text-lg text-gray-100 selection:bg-red-900 selection:text-white">
                {formatContent(chapter.content)}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 flex justify-center gap-4">
          <button
            onClick={() => onNavigate('books')}
            className="group inline-flex items-center gap-2 bg-gradient-to-r from-red-900 via-red-800 to-red-900 hover:from-red-800 hover:via-red-700 hover:to-red-800 text-white px-8 py-4 rounded-lg transition-all duration-300 border border-red-700 hover:shadow-xl hover:shadow-red-900/50 font-semibold"
          >
            <ArrowLeft className="w-5 h-5 group-hover:translate-x-[-2px] transition-transform" />
            <span>Kitaplara Dön</span>
          </button>
        </div>
      </div>
    </div>
  );
}
