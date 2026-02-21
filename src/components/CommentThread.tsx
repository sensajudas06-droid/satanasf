import { useState } from 'react';
import { User, Reply, Trash2 } from 'lucide-react';
import { supabase, Comment } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface CommentThreadProps {
  comment: Comment;
  onReply: (parentId: string, content: string) => Promise<void>;
  onDelete: (commentId: string) => Promise<void>;
  formatDate: (dateString: string) => string;
}

export default function CommentThread({
  comment,
  onReply,
  onDelete,
  formatDate,
}: CommentThreadProps) {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [replies, setReplies] = useState<Comment[]>([]);
  const [repliesLoaded, setRepliesLoaded] = useState(false);
  const { profile } = useAuth();

  const loadReplies = async () => {
    if (repliesLoaded) return;

    const { data } = await supabase
      .from('comments')
      .select(`
        *,
        user:profiles(*)
      `)
      .eq('parent_id', comment.id)
      .order('created_at', { ascending: true });

    if (data) {
      setReplies(data as Comment[]);
      setRepliesLoaded(true);
    }
  };

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyContent.trim()) return;

    setSubmitting(true);
    await onReply(comment.id, replyContent.trim());
    setReplyContent('');
    setShowReplyForm(false);
    setRepliesLoaded(false);
    await loadReplies();
    setSubmitting(false);
  };

  const canDelete = profile && (profile.id === comment.user_id || ['admin', 'super_admin', 'moderator'].includes(profile.role));

  return (
    <div className="space-y-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-2">
            {comment.user?.avatar_url ? (
              <img
                src={comment.user.avatar_url}
                alt={comment.user.display_name}
                className="w-8 h-8 rounded-full"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-red-900 flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
            )}
            <div>
              <span className="font-semibold text-white">{comment.user?.display_name}</span>
              <span className="text-sm text-zinc-500 ml-2">
                {formatDate(comment.created_at)}
              </span>
            </div>
          </div>
          {canDelete && (
            <button
              onClick={() => onDelete(comment.id)}
              className="text-zinc-500 hover:text-red-500 transition-colors"
              title="Yorumu sil"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>

        <p className="text-zinc-300 whitespace-pre-wrap mb-3">{comment.content}</p>

        {profile && profile.role !== 'banned' && (
          <button
            onClick={() => {
              setShowReplyForm(!showReplyForm);
              if (!repliesLoaded) loadReplies();
            }}
            className="flex items-center gap-2 text-sm text-red-500 hover:text-red-400 transition-colors"
          >
            <Reply className="w-4 h-4" />
            Yanıtla
          </button>
        )}

        {showReplyForm && (
          <form onSubmit={handleReply} className="mt-4">
            <textarea
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              placeholder="Yanıtınızı yazın..."
              className="w-full px-4 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-red-500 transition-colors resize-none"
              rows={3}
              disabled={submitting}
            />
            <div className="flex gap-2 mt-2">
              <button
                type="submit"
                disabled={submitting || !replyContent.trim()}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                {submitting ? 'Gönderiliyor...' : 'Yanıtla'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowReplyForm(false);
                  setReplyContent('');
                }}
                className="px-4 py-2 bg-zinc-800 text-white rounded-lg hover:bg-zinc-700 transition-colors text-sm"
              >
                İptal
              </button>
            </div>
          </form>
        )}
      </div>

      {replies.length > 0 && (
        <div className="ml-8 space-y-4">
          {replies.map((reply) => (
            <div key={reply.id} className="bg-zinc-950 border border-zinc-800 rounded-lg p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-2">
                  {reply.user?.avatar_url ? (
                    <img
                      src={reply.user.avatar_url}
                      alt={reply.user.display_name}
                      className="w-6 h-6 rounded-full"
                    />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-red-900 flex items-center justify-center">
                      <User className="w-3 h-3 text-white" />
                    </div>
                  )}
                  <div>
                    <span className="font-semibold text-white text-sm">
                      {reply.user?.display_name}
                    </span>
                    <span className="text-xs text-zinc-500 ml-2">
                      {formatDate(reply.created_at)}
                    </span>
                  </div>
                </div>
                {profile &&
                  (profile.id === reply.user_id ||
                    ['admin', 'super_admin', 'moderator'].includes(profile.role)) && (
                    <button
                      onClick={() => onDelete(reply.id)}
                      className="text-zinc-500 hover:text-red-500 transition-colors"
                      title="Yorumu sil"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
              </div>
              <p className="text-zinc-300 whitespace-pre-wrap text-sm">{reply.content}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
