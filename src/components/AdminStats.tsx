import { useEffect, useState } from 'react';
import { Users, FileText, Eye, Heart, MessageCircle, BookMarked } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function AdminStats() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalPosts: 0,
    totalViews: 0,
    totalReactions: 0,
    totalComments: 0,
    totalBookmarks: 0,
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    const [usersCount, postsCount, viewsCount, reactionsCount, commentsCount, bookmarksCount] =
      await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase
          .from('posts')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'published'),
        supabase.from('post_views').select('*', { count: 'exact', head: true }),
        supabase.from('post_reactions').select('*', { count: 'exact', head: true }),
        supabase.from('comments').select('*', { count: 'exact', head: true }),
        supabase.from('post_bookmarks').select('*', { count: 'exact', head: true }),
      ]);

    setStats({
      totalUsers: usersCount.count || 0,
      totalPosts: postsCount.count || 0,
      totalViews: viewsCount.count || 0,
      totalReactions: reactionsCount.count || 0,
      totalComments: commentsCount.count || 0,
      totalBookmarks: bookmarksCount.count || 0,
    });
  };

  const StatCard = ({
    icon: Icon,
    label,
    value,
    color,
  }: {
    icon: any;
    label: string;
    value: number;
    color: string;
  }) => (
    <div className={`bg-zinc-900 border-2 ${color} rounded-lg p-6`}>
      <div className="flex items-center justify-between mb-2">
        <Icon className="w-8 h-8 text-zinc-400" />
        <div className="text-3xl font-bold text-white">{value.toLocaleString('tr-TR')}</div>
      </div>
      <div className="text-sm text-zinc-500">{label}</div>
    </div>
  );

  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold mb-6">Genel İstatistikler</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          icon={Users}
          label="Toplam Kullanıcı"
          value={stats.totalUsers}
          color="border-blue-900/50"
        />
        <StatCard
          icon={FileText}
          label="Yayınlanmış Yazı"
          value={stats.totalPosts}
          color="border-green-900/50"
        />
        <StatCard
          icon={Eye}
          label="Toplam Görüntülenme"
          value={stats.totalViews}
          color="border-yellow-900/50"
        />
        <StatCard
          icon={Heart}
          label="Toplam Reaksiyon"
          value={stats.totalReactions}
          color="border-red-900/50"
        />
        <StatCard
          icon={MessageCircle}
          label="Toplam Yorum"
          value={stats.totalComments}
          color="border-purple-900/50"
        />
        <StatCard
          icon={BookMarked}
          label="Toplam Kayıt"
          value={stats.totalBookmarks}
          color="border-pink-900/50"
        />
      </div>
    </div>
  );
}
