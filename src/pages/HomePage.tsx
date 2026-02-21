import { useEffect, useState } from 'react';
import { Calendar, User, ArrowRight } from 'lucide-react';
import { supabase, Post } from '../lib/supabase';
import InvertedPentagram from '../components/InvertedPentagram';
import PentagramIcon from '../components/PentagramIcon';
import OccultDivider from '../components/OccultDivider';
import SearchBar from '../components/SearchBar';

interface HomePageProps {
  onNavigate: (page: string, postId?: string) => void;
}

export default function HomePage({ onNavigate }: HomePageProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [socialLinks, setSocialLinks] = useState({
    discord: '',
    instagram: '',
    tiktok: '',
  });

  useEffect(() => {
    loadPosts();
    loadSocialLinks();
  }, []);

  useEffect(() => {
    filterPosts();
  }, [posts, searchQuery]);

  const loadPosts = async () => {
    const { data, error } = await supabase
      .from('posts')
      .select(`
        *,
        author:profiles(*)
      `)
      .eq('status', 'published')
      .order('published_at', { ascending: false });

    if (data && !error) {
      setPosts(data as Post[]);
      setFilteredPosts(data as Post[]);
    }
    setLoading(false);
  };

  const loadSocialLinks = async () => {
    const { data } = await supabase
      .from('social_settings')
      .select('discord_url, instagram_url, tiktok_url')
      .maybeSingle();

    if (data) {
      setSocialLinks({
        discord: data.discord_url || '',
        instagram: data.instagram_url || '',
        tiktok: data.tiktok_url || '',
      });
    }
  };

  const filterPosts = () => {
    if (!searchQuery.trim()) {
      setFilteredPosts(posts);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = posts.filter(
      (post) =>
        post.title.toLowerCase().includes(query) ||
        post.excerpt.toLowerCase().includes(query) ||
        post.content.toLowerCase().includes(query) ||
        post.author?.display_name.toLowerCase().includes(query)
    );
    setFilteredPosts(filtered);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
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

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="relative h-screen bg-gradient-to-b from-red-950/30 via-black to-black flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-10 left-10 animate-rotate-slow">
            <InvertedPentagram className="w-32 h-32 text-red-900" />
          </div>
          <div className="absolute bottom-10 right-10 animate-rotate-slow" style={{ animationDirection: 'reverse' }}>
            <InvertedPentagram className="w-32 h-32 text-red-900" />
          </div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-pulse-red">
            <InvertedPentagram className="w-[600px] h-[600px] text-red-950" />
          </div>
        </div>

        <div className="relative z-10 text-center space-y-8 px-4">
          <div className="animate-float">
            <img
              src="/Satanas_Fidelis_Logo.png"
              alt="Satanas Fidelis"
              className="w-32 h-32 md:w-40 md:h-40 mx-auto mb-8 object-contain drop-shadow-2xl"
            />
          </div>
          <h1 className="text-6xl md:text-8xl font-bold text-white occult-glow gothic-title">
            SATANAS FIDELIS
          </h1>
          <div className="flex items-center justify-center space-x-4 my-6">
            <div className="h-px bg-red-900 w-20"></div>
            <svg className="w-6 h-6 text-red-600" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 22L15.09 15.74L22 14.73L17 9.86L18.18 2.98L12 6.23L5.82 2.98L7 9.86L2 14.73L8.91 15.74L12 22Z" />
            </svg>
            <div className="h-px bg-red-900 w-20"></div>
          </div>
          <p className="text-2xl md:text-3xl text-red-500 font-light tracking-wide max-w-3xl mx-auto">
            Gerçek Sorgulanmaktan Korkmaz
          </p>
          <p className="text-lg text-zinc-500 italic max-w-2xl mx-auto mt-4 gothic-subtitle">
            "Ave Satanus Amen"
          </p>
        </div>

        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black pointer-events-none" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <OccultDivider />

        <div className="mb-12">
          <h2 className="text-4xl font-bold text-center mb-8 text-red-500 tracking-wide gothic-title">
            Son Yazılar
          </h2>
          <div className="flex justify-center">
            <SearchBar
              onSearch={handleSearch}
              placeholder="Yazı, yazar veya içerik ara..."
            />
          </div>
          {searchQuery && (
            <p className="text-center text-zinc-400 mt-4">
              {filteredPosts.length} sonuç bulundu
            </p>
          )}
        </div>

        {filteredPosts.length === 0 && searchQuery ? (
          <div className="text-center py-20">
            <PentagramIcon className="w-16 h-16 text-red-900 mx-auto mb-4 opacity-50" />
            <p className="text-xl text-zinc-500">Arama kriterlerine uygun yazı bulunamadı</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-20">
            <PentagramIcon className="w-16 h-16 text-red-900 mx-auto mb-4 opacity-50" />
            <p className="text-zinc-400 text-lg">Henüz yayınlanmış içerik bulunmamaktadır.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPosts.map((post, index) => (
              <article
                key={post.id}
                className="group relative bg-zinc-950 rounded-lg overflow-hidden border-2 border-red-900/30 hover:border-red-600 transition-all duration-500 cursor-pointer hover:shadow-2xl hover:shadow-red-900/50"
                onClick={() => onNavigate('post', post.id)}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="absolute top-2 right-2 z-10">
                  <svg className="w-6 h-6 text-red-600 opacity-50 group-hover:opacity-100 transition-opacity" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 22L15.09 15.74L22 14.73L17 9.86L18.18 2.98L12 6.23L5.82 2.98L7 9.86L2 14.73L8.91 15.74L12 22Z" />
                  </svg>
                </div>

                {post.cover_image_url && (
                  <div className="aspect-video overflow-hidden relative">
                    <img
                      src={post.cover_image_url}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent opacity-60" />
                  </div>
                )}

                <div className="p-6 space-y-4 relative">
                  <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-red-900 to-transparent" />

                  <h2 className="text-2xl font-bold text-white group-hover:text-red-500 transition-colors line-clamp-2 tracking-wide">
                    {post.title}
                  </h2>
                  <p className="text-zinc-400 line-clamp-3 leading-relaxed">{post.excerpt}</p>

                  <div className="flex items-center justify-between text-sm text-zinc-500 pt-4 border-t border-zinc-800">
                    <div className="flex items-center space-x-2">
                      <User className="w-4 h-4 text-red-700" />
                      <span>{post.author?.display_name}</span>
                    </div>
                    {post.published_at && (
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-red-700" />
                        <span>{formatDate(post.published_at)}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center space-x-2 text-red-600 group-hover:text-red-400 transition-colors pt-2">
                    <span className="text-sm font-semibold tracking-wider uppercase">Devamını Oku</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        <div className="max-w-4xl mx-auto mb-16">
          <OccultDivider />

          <div className="bg-gradient-to-b from-red-950/20 to-black border-2 border-red-900/30 rounded-lg p-8 relative overflow-hidden">
            <div className="absolute inset-0 opacity-5">
              <InvertedPentagram className="w-64 h-64 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-red-900" />
            </div>

            <div className="relative z-10 text-center space-y-6">
              <h2 className="text-3xl md:text-4xl font-bold text-white occult-glow">
                Topluluğumuza Katılın
              </h2>
              <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
                Discord sunucumuzda binlerce üye ile tartışmalar yapın, içeriklerimizden ilk siz haberdar olun ve özel etkinliklere katılın.
              </p>

              <div className="flex flex-col md:flex-row items-center justify-center gap-4 pt-4">
                {socialLinks.discord && (
                  <a
                    href={socialLinks.discord}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center space-x-3 px-8 py-4 bg-[#5865F2] hover:bg-[#4752C4] rounded-lg transition-all duration-300 shadow-lg hover:shadow-[#5865F2]/50 transform hover:scale-105 w-full md:w-auto justify-center"
                  >
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z"/>
                    </svg>
                    <span className="text-white font-bold text-lg">Discord'a Katıl</span>
                    <ArrowRight className="w-5 h-5 text-white group-hover:translate-x-2 transition-transform" />
                  </a>
                )}
              </div>

              {(socialLinks.instagram || socialLinks.tiktok) && (
                <div className="flex items-center justify-center gap-6 pt-6 border-t border-red-900/30 mt-8">
                  {socialLinks.instagram && (
                    <a
                      href={socialLinks.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 hover:from-purple-700 hover:via-pink-700 hover:to-orange-700 rounded-lg transition-all duration-300 shadow-lg hover:shadow-pink-500/50 transform hover:scale-105"
                    >
                      <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                      </svg>
                      <span className="text-white font-semibold">Instagram</span>
                    </a>
                  )}

                  {socialLinks.tiktok && (
                    <a
                      href={socialLinks.tiktok}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center space-x-2 px-6 py-3 bg-black hover:bg-zinc-900 border-2 border-white rounded-lg transition-all duration-300 shadow-lg hover:shadow-white/50 transform hover:scale-105"
                    >
                      <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                      </svg>
                      <span className="text-white font-semibold">TikTok</span>
                    </a>
                  )}
                </div>
              )}

              <p className="text-zinc-600 text-sm pt-4">
                Sosyal medya hesaplarımızdan bizi takip edin ve hiçbir içeriği kaçırmayın
              </p>
            </div>
          </div>

          <OccultDivider />
        </div>
      </div>
    </div>
  );
}
