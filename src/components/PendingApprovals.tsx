import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, FileText, Trash2 } from 'lucide-react';
import { supabase, PostApproval } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface PendingApprovalsProps {
  onNavigate: (page: string, postId?: string) => void;
}

export default function PendingApprovals({ onNavigate }: PendingApprovalsProps) {
  const { profile } = useAuth();
  const [approvals, setApprovals] = useState<PostApproval[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (profile && ['admin', 'moderator', 'super_admin'].includes(profile.role)) {
      loadPendingApprovals();
      subscribeToApprovals();
    }
  }, [profile]);

  const loadPendingApprovals = async () => {
    const { data } = await supabase
      .from('post_approvals')
      .select(`
        *,
        post:posts(*),
        requester:profiles!post_approvals_requested_by_fkey(*)
      `)
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (data) {
      setApprovals(data as any);
    }
  };

  const subscribeToApprovals = () => {
    const channel = supabase
      .channel('post_approvals')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'post_approvals',
        },
        () => {
          loadPendingApprovals();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const handleApprove = async (approval: PostApproval) => {
    if (loading || !profile) return;

    setLoading(true);

    if (approval.action_type === 'publish') {
      await supabase
        .from('posts')
        .update({
          status: 'published',
          published_at: new Date().toISOString(),
          approval_status: 'approved',
        })
        .eq('id', approval.post_id);
    } else if (approval.action_type === 'delete') {
      await supabase.from('posts').delete().eq('id', approval.post_id);
    }

    await supabase
      .from('post_approvals')
      .update({
        status: 'approved',
        reviewed_by: profile.id,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', approval.id);

    await supabase.from('notifications').insert({
      user_id: approval.requested_by,
      type: 'approval_approved',
      title: 'Onay Talebi Onaylandı',
      message: `"${approval.post?.title}" başlıklı yazınız için ${
        approval.action_type === 'publish' ? 'yayımlama' : 'silme'
      } talebi onaylandı.`,
      link: approval.action_type === 'publish' ? `/post/${approval.post?.slug}` : undefined,
    });

    await loadPendingApprovals();
    setLoading(false);
  };

  const handleReject = async (approval: PostApproval, notes?: string) => {
    if (loading || !profile) return;

    setLoading(true);

    await supabase
      .from('post_approvals')
      .update({
        status: 'rejected',
        reviewed_by: profile.id,
        reviewed_at: new Date().toISOString(),
        notes: notes || 'Onaylanmadı',
      })
      .eq('id', approval.id);

    if (approval.action_type === 'publish') {
      await supabase
        .from('posts')
        .update({ approval_status: 'rejected' })
        .eq('id', approval.post_id);
    }

    await supabase.from('notifications').insert({
      user_id: approval.requested_by,
      type: 'approval_rejected',
      title: 'Onay Talebi Reddedildi',
      message: `"${approval.post?.title}" başlıklı yazınız için ${
        approval.action_type === 'publish' ? 'yayımlama' : 'silme'
      } talebi reddedildi. ${notes ? `Sebep: ${notes}` : ''}`,
    });

    await loadPendingApprovals();
    setLoading(false);
  };

  if (!profile || !['admin', 'moderator', 'super_admin'].includes(profile.role)) {
    return null;
  }

  if (approvals.length === 0) {
    return (
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-8 text-center">
        <FileText className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-white mb-2">
          Bekleyen Onay Yok
        </h3>
        <p className="text-zinc-400">
          Şu anda onay bekleyen bir yazı bulunmuyor.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Bekleyen Onaylar</h2>
        <span className="px-3 py-1 bg-red-900/30 border border-red-900 text-red-400 rounded-full text-sm font-medium">
          {approvals.length} Talep
        </span>
      </div>

      <div className="grid gap-4">
        {approvals.map((approval) => (
          <div
            key={approval.id}
            className="bg-zinc-900 border border-zinc-800 rounded-lg p-6"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-lg font-semibold text-white">
                    {approval.post?.title}
                  </h3>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium border ${
                      approval.action_type === 'publish'
                        ? 'text-green-400 bg-green-900/30 border-green-900'
                        : 'text-red-400 bg-red-900/30 border-red-900'
                    }`}
                  >
                    {approval.action_type === 'publish' ? (
                      <>
                        <FileText className="w-3 h-3 inline mr-1" />
                        Yayımlama
                      </>
                    ) : (
                      <>
                        <Trash2 className="w-3 h-3 inline mr-1" />
                        Silme
                      </>
                    )}
                  </span>
                </div>
                <p className="text-sm text-zinc-400 mb-1">
                  Yazar: {approval.requester?.display_name}
                </p>
                <p className="text-xs text-zinc-600">
                  {new Date(approval.created_at).toLocaleDateString('tr-TR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </div>

            {approval.post?.excerpt && (
              <p className="text-sm text-zinc-400 mb-4 line-clamp-2">
                {approval.post.excerpt}
              </p>
            )}

            <div className="flex gap-2">
              <button
                onClick={() => handleApprove(approval)}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                <CheckCircle className="w-4 h-4" />
                Onayla
              </button>
              <button
                onClick={() => handleReject(approval)}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                <XCircle className="w-4 h-4" />
                Reddet
              </button>
              {approval.action_type === 'publish' && (
                <button
                  onClick={() => {
                    if (approval.post?.id) {
                      onNavigate('post-editor', approval.post.id);
                    }
                  }}
                  className="px-4 py-2 bg-zinc-800 text-white rounded-lg hover:bg-zinc-700 transition-colors"
                >
                  Önizle/Düzenle
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
