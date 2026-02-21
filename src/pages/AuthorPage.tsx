import { useEffect, useState } from 'react';
import { User, Calendar, BookOpen, ArrowLeft } from 'lucide-react';
import { supabase, Profile, Post } from '../lib/supabase';

interface AuthorPageProps {
  authorId: string;
  onNavigate: (page: string, postId?: string) => void;
}

export default function AuthorPage({ authorId, onNavigate }: AuthorPageProps) {
  const [author, setAuthor] = useState<Profile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAuthor();
    loadAuthorPosts();
  }, [authorId]);

  const loadAuthor = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authorId)
      .maybeSingle();

    if (data) {
      setAuthor(data as Profile);
    }
    setLoading(false);
  };

  const loadAuthorPosts = async () => {
    const { data } = await supabase
      .from('posts')
      .select('*')
      .eq('author_id', authorId)
      .eq('status', 'published')
      .order('published_at', { ascending: false });

    if (data) {
      setPosts(data as Post[]);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="animate-pulse text-xl">Yükleniyor...</div>
      </div>
    );
  }

  if (!author) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-xl text-zinc-400">Yazar bulunamadı</p>
          <button
            onClick={() => onNavigate('home')}
            className="text-red-500 hover:text-red-400 transition-colors"
          >
            Ana sayfaya dön
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <button
          onClick={() => onNavigate('home')}
          className="flex items-center space-x-2 text-zinc-400 hover:text-white transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Ana Sayfaya Dön</span>
        </button>

        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-8 mb-12">
          <div className="flex items-start gap-6">
            {author.avatar_url ? (
              <img
                src={author.avatar_url}
                alt={author.display_name}
                className="w-24 h-24 rounded-full border-2 border-red-600"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-red-900 flex items-center justify-center border-2 border-red-600">
                <User className="w-12 h-12 text-white" />
              </div>
            )}

            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-2">{author.display_name}</h1>
              <div className="flex items-center gap-4 text-sm text-zinc-400 mb-4">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>Katılım: {formatDate(author.created_at)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  <span>{posts.length} yazı</span>
                </div>
              </div>
              {author.bio && (
                <p className="text-zinc-300 whitespace-pre-wrap">{author.bio}</p>
              )}
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-bold mb-6">Yazıları</h2>

          {posts.length === 0 ? (
            <div className="text-center py-12 bg-zinc-900 border border-zinc-800 rounded-lg">
              <p className="text-zinc-400">Henüz yayınlanmış yazı bulunmamaktadır</p>
            </div>
          ) : (
            <div className="space-y-6">
              {posts.map((post) => (
                <article
                  key={post.id}
                  className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 hover:border-red-600 transition-all cursor-pointer"
                  onClick={() => onNavigate('post', post.id)}
                >
                  {post.cover_image_url && (
                    <img
                      src={post.cover_image_url}
                      alt={post.title}
                      className="w-full h-48 object-cover rounded-lg mb-4"
                    />
                  )}
                  <h3 className="text-2xl font-bold mb-2 text-white hover:text-red-500 transition-colors">
                    {post.title}
                  </h3>
                  <p className="text-zinc-400 mb-3">{post.excerpt}</p>
                  {post.published_at && (
                    <div className="flex items-center gap-2 text-sm text-zinc-500">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(post.published_at)}</span>
                    </div>
                  )}
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
