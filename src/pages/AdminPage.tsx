import { useEffect, useState } from 'react';
import { Users, FileEdit, BookOpen, Library, Bell, BarChart, Link } from 'lucide-react';
import { supabase, Post, Book, LibraryItem } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import AdminStats from '../components/AdminStats';
import UserManagement from '../components/UserManagement';
import PendingApprovals from '../components/PendingApprovals';
import BookContentUploader from '../components/BookContentUploader';
import SocialMediaSettings from '../components/SocialMediaSettings';

interface AdminPageProps {
  onNavigate: (page: string, postId?: string) => void;
}

type AdminTab = 'stats' | 'approvals' | 'users' | 'posts' | 'books' | 'library' | 'social';

export default function AdminPage({ onNavigate }: AdminPageProps) {
  const [activeTab, setActiveTab] = useState<AdminTab>('approvals');
  const [posts, setPosts] = useState<Post[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [libraryItems, setLibraryItems] = useState<LibraryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [pendingCount, setPendingCount] = useState(0);
  const { profile } = useAuth();

  useEffect(() => {
    if (!profile || !['super_admin', 'admin', 'moderator', 'writer'].includes(profile.role)) {
      onNavigate('home');
      return;
    }
    loadData();
    loadPendingCount();
  }, [activeTab, profile]);

  const loadData = async () => {
    setLoading(true);

    if (activeTab === 'posts') {
      const query = supabase
        .from('posts')
        .select(`
          *,
          author:profiles(*)
        `)
        .order('created_at', { ascending: false });

      if (profile?.role === 'writer') {
        query.eq('author_id', profile.id);
      }

      const { data } = await query;
      if (data) setPosts(data as Post[]);
    } else if (activeTab === 'books' && ['super_admin', 'admin'].includes(profile?.role || '')) {
      const { data } = await supabase
        .from('books')
        .select('*')
        .order('order_index', { ascending: true });
      if (data) setBooks(data);
    } else if (activeTab === 'library') {
      const query = supabase
        .from('library')
        .select(`
          *,
          uploader:profiles(*)
        `)
        .order('created_at', { ascending: false });

      if (profile?.role === 'writer') {
        query.eq('uploaded_by', profile.id);
      }

      const { data } = await query;
      if (data) setLibraryItems(data as LibraryItem[]);
    }

    setLoading(false);
  };

  const loadPendingCount = async () => {
    if (!profile || !['admin', 'moderator', 'super_admin'].includes(profile.role)) return;

    const { data } = await supabase
      .from('post_approvals')
      .select('id')
      .eq('status', 'pending');

    if (data) setPendingCount(data.length);
  };

  const handleDeletePost = async (postId: string) => {
    if (!confirm('Bu yazıyı silmek istediğinizden emin misiniz?')) return;

    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', postId);

    if (!error) {
      await loadData();
    }
  };

  const handleDeleteLibraryItem = async (itemId: string) => {
    if (!confirm('Bu kaynağı silmek istediğinizden emin misiniz?')) return;

    const { error } = await supabase
      .from('library')
      .delete()
      .eq('id', itemId);

    if (!error) {
      await loadData();
    }
  };

  const canAccessTab = (tab: AdminTab): boolean => {
    if (!profile) return false;

    if (profile.role === 'super_admin') return true;

    if (profile.role === 'admin') {
      return !['books', 'social'].includes(tab);
    }

    if (profile.role === 'moderator') {
      return ['stats', 'approvals', 'users', 'posts', 'library'].includes(tab);
    }

    if (profile.role === 'writer') {
      return ['posts', 'library'].includes(tab);
    }

    return false;
  };

  if (!profile || !['super_admin', 'admin', 'moderator', 'writer'].includes(profile.role)) {
    return null;
  }

  const tabs = [
    { id: 'stats' as AdminTab, label: 'İstatistikler', icon: BarChart },
    { id: 'approvals' as AdminTab, label: 'Bekleyen Onaylar', icon: Bell },
    { id: 'users' as AdminTab, label: 'Kullanıcılar', icon: Users },
    { id: 'posts' as AdminTab, label: 'Yazılar', icon: FileEdit },
    { id: 'books' as AdminTab, label: 'Kitaplar', icon: BookOpen },
    { id: 'library' as AdminTab, label: 'Kütüphane', icon: Library },
    { id: 'social' as AdminTab, label: 'Sosyal Medya', icon: Link },
  ].filter((tab) => canAccessTab(tab.id));

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold mb-8">Yönetim Paneli</h1>

        <div className="flex flex-wrap gap-2 mb-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative flex items-center space-x-2 px-6 py-3 rounded-lg transition-all ${
                activeTab === tab.id
                  ? 'bg-red-600 text-white'
                  : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800 hover:text-white'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              <span>{tab.label}</span>
              {tab.id === 'approvals' && pendingCount > 0 && (
                <span className="absolute -top-2 -right-2 w-6 h-6 bg-red-600 text-white text-xs rounded-full flex items-center justify-center">
                  {pendingCount > 9 ? '9+' : pendingCount}
                </span>
              )}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full mx-auto" />
          </div>
        ) : (
          <>
            {activeTab === 'stats' && <AdminStats />}

            {activeTab === 'approvals' && canAccessTab('approvals') && (
              <PendingApprovals onNavigate={onNavigate} />
            )}

            {activeTab === 'users' && canAccessTab('users') && <UserManagement />}

            {activeTab === 'posts' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold">Yazılar</h2>
                  <button
                    onClick={() => onNavigate('post-editor')}
                    className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Yeni Yazı Ekle
                  </button>
                </div>

                {posts.map((post) => (
                  <div
                    key={post.id}
                    className="bg-zinc-900 border border-zinc-800 rounded-lg p-6"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-white mb-2">
                          {post.title}
                        </h3>
                        <div className="flex items-center gap-3 mb-2">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium border ${
                              post.status === 'published'
                                ? 'text-green-400 bg-green-900/30 border-green-900'
                                : 'text-zinc-400 bg-zinc-900/30 border-zinc-800'
                            }`}
                          >
                            {post.status === 'published' ? 'Yayında' : 'Taslak'}
                          </span>
                          {post.approval_status !== 'none' && (
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-medium border ${
                                post.approval_status === 'pending'
                                  ? 'text-yellow-400 bg-yellow-900/30 border-yellow-900'
                                  : post.approval_status === 'approved'
                                  ? 'text-green-400 bg-green-900/30 border-green-900'
                                  : 'text-red-400 bg-red-900/30 border-red-900'
                              }`}
                            >
                              {post.approval_status === 'pending'
                                ? 'Onay Bekliyor'
                                : post.approval_status === 'approved'
                                ? 'Onaylandı'
                                : 'Reddedildi'}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-zinc-400">
                          Yazar: {post.author?.display_name}
                        </p>
                        <p className="text-xs text-zinc-600">
                          {new Date(post.created_at).toLocaleDateString('tr-TR')}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => onNavigate('post-editor', post.id)}
                          className="px-4 py-2 bg-zinc-800 text-white rounded hover:bg-zinc-700 transition-colors"
                        >
                          Düzenle
                        </button>
                        {(['admin', 'moderator', 'super_admin'].includes(profile.role) ||
                          post.author_id === profile.id) && (
                          <button
                            onClick={() => handleDeletePost(post.id)}
                            className="px-4 py-2 bg-red-900/30 text-red-400 rounded hover:bg-red-900/50 transition-colors"
                          >
                            Sil
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {posts.length === 0 && (
                  <div className="text-center py-12 text-zinc-500">
                    Henüz yazı bulunmuyor
                  </div>
                )}
              </div>
            )}

            {activeTab === 'books' && canAccessTab('books') && (
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold">Kitaplar</h2>
                  <button
                    onClick={() => onNavigate('book-editor')}
                    className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Yeni Kitap Ekle
                  </button>
                </div>

                <BookContentUploader />

                <div className="space-y-4">
                  {books.map((book) => (
                  <div
                    key={book.id}
                    className="bg-zinc-900 border border-zinc-800 rounded-lg p-6"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-white mb-2">
                          {book.title}
                        </h3>
                        <p className="text-sm text-zinc-400 mb-1">
                          Yazar: {book.author}
                        </p>
                        <p className="text-xs text-zinc-600">
                          Sıra: {book.order_index}
                        </p>
                      </div>
                      <button
                        onClick={() => onNavigate('book-editor', book.id)}
                        className="px-4 py-2 bg-zinc-800 text-white rounded hover:bg-zinc-700 transition-colors"
                      >
                        Düzenle
                      </button>
                    </div>
                  </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'library' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold">Kütüphane</h2>
                  <button
                    onClick={() => onNavigate('library-upload')}
                    className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Yeni Kaynak Ekle
                  </button>
                </div>

                {libraryItems.map((item) => (
                  <div
                    key={item.id}
                    className="bg-zinc-900 border border-zinc-800 rounded-lg p-6"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-white mb-2">
                          {item.title}
                        </h3>
                        <p className="text-xs text-zinc-600">
                          Yükleyen: {item.uploader?.display_name}
                        </p>
                      </div>
                      {(['admin', 'super_admin'].includes(profile.role) ||
                        item.uploaded_by === profile.id) && (
                        <button
                          onClick={() => handleDeleteLibraryItem(item.id)}
                          className="px-4 py-2 bg-red-900/30 text-red-400 rounded hover:bg-red-900/50 transition-colors"
                        >
                          Sil
                        </button>
                      )}
                    </div>
                  </div>
                ))}

                {libraryItems.length === 0 && (
                  <div className="text-center py-12 text-zinc-500">
                    Henüz kütüphane kaynağı bulunmuyor
                  </div>
                )}
              </div>
            )}

            {activeTab === 'social' && canAccessTab('social') && (
              <SocialMediaSettings />
            )}
          </>
        )}
      </div>
    </div>
  );
}
