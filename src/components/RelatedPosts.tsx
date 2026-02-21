import { useEffect, useState } from 'react';
import { Calendar, User, ArrowRight } from 'lucide-react';
import { supabase, Post } from '../lib/supabase';

interface RelatedPostsProps {
  currentPostId: string;
  authorId: string;
  onNavigate: (page: string, postId?: string) => void;
}

export default function RelatedPosts({ currentPostId, authorId, onNavigate }: RelatedPostsProps) {
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    loadRelatedPosts();
  }, [currentPostId, authorId]);

  const loadRelatedPosts = async () => {
    const { data } = await supabase
      .from('posts')
      .select(`
        *,
        author:profiles(*)
      `)
      .eq('status', 'published')
      .eq('author_id', authorId)
      .neq('id', currentPostId)
      .order('published_at', { ascending: false })
      .limit(3);

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

  if (posts.length === 0) {
    return null;
  }

  return (
    <div className="mt-12 border-t border-zinc-800 pt-8">
      <h2 className="text-2xl font-bold mb-6">Yazarın Diğer Yazıları</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {posts.map((post) => (
          <article
            key={post.id}
            className="group bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden hover:border-red-600 transition-all cursor-pointer"
            onClick={() => onNavigate('post', post.id)}
          >
            {post.cover_image_url && (
              <img
                src={post.cover_image_url}
                alt={post.title}
                className="w-full h-40 object-cover"
              />
            )}
            <div className="p-4">
              <h3 className="text-lg font-bold mb-2 text-white group-hover:text-red-500 transition-colors line-clamp-2">
                {post.title}
              </h3>
              <p className="text-sm text-zinc-400 mb-3 line-clamp-2">{post.excerpt}</p>
              <div className="flex items-center justify-between text-xs text-zinc-500">
                {post.published_at && (
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <span>{formatDate(post.published_at)}</span>
                  </div>
                )}
                <div className="flex items-center gap-1 text-red-500 group-hover:text-red-400">
                  <span>Oku</span>
                  <ArrowRight className="w-3 h-3" />
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
