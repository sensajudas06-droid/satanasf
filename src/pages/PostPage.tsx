import { useEffect, useState } from 'react';
import { Calendar, User, ArrowLeft, MessageCircle, Clock, Eye } from 'lucide-react';
import { supabase, Post, Comment } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import PostReactions from '../components/PostReactions';
import ShareButtons from '../components/ShareButtons';
import CommentThread from '../components/CommentThread';
import RelatedPosts from '../components/RelatedPosts';
import { calculateReadingTime, formatReadingTime } from '../utils/readingTime';

interface PostPageProps {
  postId: string;
  onNavigate: (page: string, params?: string) => void;
}

export default function PostPage({ postId, onNavigate }: PostPageProps) {
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [viewCount, setViewCount] = useState(0);
  const { profile } = useAuth();

  useEffect(() => {
    loadPost();
    loadComments();
    trackView();
    loadViewCount();
  }, [postId]);

  const loadPost = async () => {
    const { data, error } = await supabase
      .from('posts')
      .select(`
        *,
        author:profiles(*)
      `)
      .eq('id', postId)
      .eq('status', 'published')
      .maybeSingle();

    if (data && !error) {
      setPost(data as Post);
    }
    setLoading(false);
  };

  const loadComments = async () => {
    const { data, error } = await supabase
      .from('comments')
      .select(`
        *,
        user:profiles(*)
      `)
      .eq('post_id', postId)
      .is('parent_id', null)
      .order('created_at', { ascending: false });

    if (data && !error) {
      setComments(data as Comment[]);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !profile) return;

    setSubmitting(true);
    const { error } = await supabase
      .from('comments')
      .insert({
        post_id: postId,
        user_id: profile.id,
        content: newComment.trim(),
      });

    if (error) {
      console.error('Yorum gönderme hatası:', error);
      alert('Yorum gönderilirken bir hata oluştu. Lütfen tekrar deneyin.');
    } else {
      setNewComment('');
      await loadComments();
    }
    setSubmitting(false);
  };

  const handleReply = async (parentId: string, content: string) => {
    if (!profile) return;

    const { error } = await supabase.from('comments').insert({
      post_id: postId,
      user_id: profile.id,
      content,
      parent_id: parentId,
    });

    if (error) {
      console.error('Yanıt gönderme hatası:', error);
      alert('Yanıt gönderilirken bir hata oluştu. Lütfen tekrar deneyin.');
      throw error;
    }

    await loadComments();
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!profile) return;

    const confirmed = window.confirm('Bu yorumu silmek istediğinizden emin misiniz?');
    if (!confirmed) return;

    await supabase.from('comments').delete().eq('id', commentId);
    await loadComments();
  };

  const trackView = async () => {
    await supabase.from('post_views').insert({
      post_id: postId,
      user_id: profile?.id || null,
    });
  };

  const loadViewCount = async () => {
    const { count } = await supabase
      .from('post_views')
      .select('*', { count: 'exact', head: true })
      .eq('post_id', postId);

    setViewCount(count || 0);
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

  if (!post) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-xl text-zinc-400">İçerik bulunamadı</p>
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

        {post.cover_image_url && (
          <img
            src={post.cover_image_url}
            alt={post.title}
            className="w-full h-96 object-cover rounded-lg mb-8"
          />
        )}

        <header className="mb-8 space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold text-white">{post.title}</h1>
          <div className="flex flex-wrap items-center gap-4 text-sm text-zinc-400">
            <button
              onClick={() => onNavigate('author', post.author_id)}
              className="flex items-center space-x-2 hover:text-red-500 transition-colors"
            >
              <User className="w-4 h-4" />
              <span>{post.author?.display_name}</span>
            </button>
            {post.published_at && (
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4" />
                <span>{formatDate(post.published_at)}</span>
              </div>
            )}
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4" />
              <span>{formatReadingTime(calculateReadingTime(post.content))}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Eye className="w-4 h-4" />
              <span>{viewCount} görüntülenme</span>
            </div>
          </div>
        </header>

        <article className="prose prose-invert prose-lg max-w-none mb-8">
          <div className="text-zinc-300 leading-relaxed whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: post.content }} />
        </article>

        <PostReactions postId={postId} />

        <div className="my-6">
          <ShareButtons title={post.title} url={`/post/${postId}`} />
        </div>

        <div className="border-t border-zinc-800 pt-8">
          <h2 className="text-2xl font-bold mb-6 flex items-center space-x-2">
            <MessageCircle className="w-6 h-6" />
            <span>Yorumlar ({comments.length})</span>
          </h2>

          {profile && profile.role !== 'banned' ? (
            <form onSubmit={handleSubmitComment} className="mb-8">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Yorumunuzu yazın..."
                className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-red-500 transition-colors resize-none"
                rows={4}
                disabled={submitting}
              />
              <button
                type="submit"
                disabled={submitting || !newComment.trim()}
                className="mt-3 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Gönderiliyor...' : 'Yorum Yap'}
              </button>
            </form>
          ) : profile?.role === 'banned' ? (
            <div className="mb-8 p-4 bg-red-900/20 border border-red-900 rounded-lg text-red-400">
              Yorum yapma yetkiniz bulunmamaktadır.
            </div>
          ) : (
            <div className="mb-8 p-4 bg-zinc-900 border border-zinc-800 rounded-lg">
              <p className="text-zinc-400">
                Yorum yapmak için{' '}
                <button
                  onClick={() => onNavigate('auth')}
                  className="text-red-500 hover:text-red-400 transition-colors"
                >
                  giriş yapın
                </button>
              </p>
            </div>
          )}

          <div className="space-y-6">
            {comments.map((comment) => (
              <CommentThread
                key={comment.id}
                comment={comment}
                onReply={handleReply}
                onDelete={handleDeleteComment}
                formatDate={formatDate}
              />
            ))}
          </div>
        </div>

        <RelatedPosts
          currentPostId={postId}
          authorId={post.author_id}
          onNavigate={onNavigate}
        />
      </div>
    </div>
  );
}
