import { useState, useEffect } from 'react';
import { Heart, Bookmark } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface PostReactionsProps {
  postId: string;
}

export default function PostReactions({ postId }: PostReactionsProps) {
  const { profile } = useAuth();
  const [likeCount, setLikeCount] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadReactions();
    if (profile) {
      loadUserReaction();
      loadBookmarkStatus();
    }
  }, [postId, profile]);

  const loadReactions = async () => {
    const { data } = await supabase
      .from('post_reactions')
      .select('id')
      .eq('post_id', postId)
      .eq('reaction_type', 'like');

    if (data) {
      setLikeCount(data.length);
    }
  };

  const loadUserReaction = async () => {
    if (!profile) return;

    const { data } = await supabase
      .from('post_reactions')
      .select('id')
      .eq('post_id', postId)
      .eq('user_id', profile.id)
      .eq('reaction_type', 'like')
      .maybeSingle();

    setIsLiked(!!data);
  };

  const loadBookmarkStatus = async () => {
    if (!profile) return;

    const { data } = await supabase
      .from('post_bookmarks')
      .select('id')
      .eq('post_id', postId)
      .eq('user_id', profile.id)
      .maybeSingle();

    setIsBookmarked(!!data);
  };

  const toggleLike = async () => {
    if (!profile || loading) return;

    setLoading(true);

    if (isLiked) {
      await supabase
        .from('post_reactions')
        .delete()
        .eq('post_id', postId)
        .eq('user_id', profile.id)
        .eq('reaction_type', 'like');

      setIsLiked(false);
      setLikeCount(prev => Math.max(0, prev - 1));
    } else {
      await supabase
        .from('post_reactions')
        .insert({
          post_id: postId,
          user_id: profile.id,
          reaction_type: 'like',
        });

      setIsLiked(true);
      setLikeCount(prev => prev + 1);
    }

    setLoading(false);
  };

  const toggleBookmark = async () => {
    if (!profile || loading) return;

    setLoading(true);

    if (isBookmarked) {
      await supabase
        .from('post_bookmarks')
        .delete()
        .eq('post_id', postId)
        .eq('user_id', profile.id);

      setIsBookmarked(false);
    } else {
      await supabase
        .from('post_bookmarks')
        .insert({
          post_id: postId,
          user_id: profile.id,
        });

      setIsBookmarked(true);
    }

    setLoading(false);
  };

  if (!profile) {
    return null;
  }

  return (
    <div className="flex items-center gap-3 py-4 border-t border-b border-zinc-800">
      <button
        onClick={toggleLike}
        disabled={loading}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
          isLiked
            ? 'bg-red-600 text-white'
            : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800 hover:text-white'
        } disabled:opacity-50`}
      >
        <Heart
          className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`}
        />
        <span className="text-sm font-medium">{likeCount}</span>
      </button>

      <div className="flex-1" />

      <button
        onClick={toggleBookmark}
        disabled={loading}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
          isBookmarked
            ? 'bg-red-600 text-white'
            : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800 hover:text-white'
        } disabled:opacity-50`}
      >
        <Bookmark
          className={`w-5 h-5 ${isBookmarked ? 'fill-current' : ''}`}
        />
        <span className="text-sm font-medium">
          {isBookmarked ? 'Kaydedildi' : 'Kaydet'}
        </span>
      </button>
    </div>
  );
}
