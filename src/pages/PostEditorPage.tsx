import { useEffect, useState } from 'react';
import { ArrowLeft, Save, Tag as TagIcon, X } from 'lucide-react';
import { supabase, Post, Tag } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import RichTextEditor from '../components/RichTextEditor';
import SeoHelper from '../components/SeoHelper';

interface PostEditorPageProps {
  postId?: string;
  onNavigate: (page: string) => void;
}

export default function PostEditorPage({ postId, onNavigate }: PostEditorPageProps) {
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [status, setStatus] = useState<'draft' | 'published'>('draft');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [selectedTags, setSelectedTags] = useState<Tag[]>([]);
  const [newTagName, setNewTagName] = useState('');
  const { profile } = useAuth();

  useEffect(() => {
    if (!profile || !['super_admin', 'writer', 'moderator', 'admin'].includes(profile.role)) {
      onNavigate('home');
      return;
    }

    loadTags();
    if (postId) {
      loadPost();
    } else {
      setContent('<p>Yazınızı buraya yazın...</p>');
    }
  }, [postId, profile]);

  const loadTags = async () => {
    const { data } = await supabase
      .from('tags')
      .select('*')
      .order('name', { ascending: true });
    if (data) setAvailableTags(data);
  };

  const loadPost = async () => {
    if (!postId) return;

    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('id', postId)
      .maybeSingle();

    if (data && !error) {
      const post = data as Post;
      setTitle(post.title);
      setSlug(post.slug);
      setExcerpt(post.excerpt);
      setContent(post.content);
      setCoverImageUrl(post.cover_image_url || '');
      setStatus(post.status);

      const { data: postTagsData } = await supabase
        .from('post_tags')
        .select('tag_id, tags(*)')
        .eq('post_id', postId);

      if (postTagsData) {
        const tags = postTagsData
          .map((pt: any) => pt.tags)
          .filter((t: any) => t !== null) as Tag[];
        setSelectedTags(tags);
      }
    }
  };

  const generateSlug = (text: string) => {
    const trMap: Record<string, string> = {
      'ç': 'c', 'ğ': 'g', 'ı': 'i', 'ö': 'o', 'ş': 's', 'ü': 'u',
      'Ç': 'c', 'Ğ': 'g', 'İ': 'i', 'Ö': 'o', 'Ş': 's', 'Ü': 'u'
    };

    return text
      .split('')
      .map(char => trMap[char] || char)
      .join('')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
    if (!postId) {
      setSlug(generateSlug(newTitle));
    }
  };

  const handleAddTag = async () => {
    if (!newTagName.trim()) return;

    const tagSlug = generateSlug(newTagName);

    const existingTag = availableTags.find(t => t.slug === tagSlug);
    if (existingTag) {
      if (!selectedTags.find(t => t.id === existingTag.id)) {
        setSelectedTags([...selectedTags, existingTag]);
      }
      setNewTagName('');
      return;
    }

    const { data, error } = await supabase
      .from('tags')
      .insert({
        name: newTagName.trim(),
        slug: tagSlug,
      })
      .select()
      .maybeSingle();

    if (data && !error) {
      const newTag = data as Tag;
      setAvailableTags([...availableTags, newTag]);
      setSelectedTags([...selectedTags, newTag]);
      setNewTagName('');
    }
  };

  const handleRemoveTag = (tagId: string) => {
    setSelectedTags(selectedTags.filter(t => t.id !== tagId));
  };

  const handleSelectExistingTag = (tag: Tag) => {
    if (!selectedTags.find(t => t.id === tag.id)) {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    setError('');
    setLoading(true);

    if (!title.trim() || !slug.trim() || !excerpt.trim() || !content.trim()) {
      setError('Lütfen tüm zorunlu alanları doldurun');
      setLoading(false);
      return;
    }

    const isWriter = profile.role === 'writer';
    const canPublishDirectly = ['super_admin', 'admin', 'moderator'].includes(profile.role);

    const postData = {
      title: title.trim(),
      slug: slug.trim(),
      excerpt: excerpt.trim(),
      content: content.trim(),
      cover_image_url: coverImageUrl.trim() || null,
      status: isWriter ? 'draft' : status,
      approval_status: 'none',
      ...(status === 'published' && canPublishDirectly && !postId ? { published_at: new Date().toISOString() } : {}),
    };

    if (postId) {
      const { error: updateError } = await supabase
        .from('posts')
        .update(postData)
        .eq('id', postId);

      if (updateError) {
        setError('Yazı güncellenirken bir hata oluştu');
        setLoading(false);
        return;
      }

      await supabase.from('post_tags').delete().eq('post_id', postId);

      if (selectedTags.length > 0) {
        await supabase.from('post_tags').insert(
          selectedTags.map(tag => ({
            post_id: postId,
            tag_id: tag.id,
          }))
        );
      }

      onNavigate('admin');
    } else {
      const { data: newPost, error: insertError } = await supabase
        .from('posts')
        .insert({
          ...postData,
          author_id: profile.id,
        })
        .select()
        .maybeSingle();

      if (insertError) {
        if (insertError.message.includes('duplicate')) {
          setError('Bu URL zaten kullanımda, lütfen başka bir başlık deneyin');
        } else {
          setError('Yazı oluşturulurken bir hata oluştu');
        }
        setLoading(false);
        return;
      }

      if (newPost && selectedTags.length > 0) {
        await supabase.from('post_tags').insert(
          selectedTags.map(tag => ({
            post_id: newPost.id,
            tag_id: tag.id,
          }))
        );
      }

      onNavigate('admin');
    }

    setLoading(false);
  };

  const handleRequestApproval = async (actionType: 'publish' | 'delete') => {
    if (!postId || !profile || loading) return;

    setLoading(true);

    const { error } = await supabase.from('post_approvals').insert({
      post_id: postId,
      requested_by: profile.id,
      action_type: actionType,
      status: 'pending',
    });

    if (!error) {
      await supabase
        .from('posts')
        .update({ approval_status: 'pending' })
        .eq('id', postId);

      alert(`${actionType === 'publish' ? 'Yayımlama' : 'Silme'} talebiniz gönderildi. Yöneticiler tarafından incelenecektir.`);
      onNavigate('admin');
    } else {
      setError('Onay talebi gönderilemedi');
    }

    setLoading(false);
  };

  if (!profile || !['super_admin', 'writer', 'moderator', 'admin'].includes(profile.role)) {
    return null;
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <button
          onClick={() => onNavigate('admin')}
          className="flex items-center space-x-2 text-zinc-400 hover:text-white transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Yönetime Dön</span>
        </button>

        <h1 className="text-4xl font-bold mb-8">
          {postId ? 'Yazıyı Düzenle' : 'Yeni Yazı Oluştur'}
        </h1>

        {error && (
          <div className="mb-6 bg-red-900/20 border border-red-900 rounded-lg p-4 text-red-400">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">
                  Başlık *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  className="w-full px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-white placeholder-zinc-600 focus:outline-none focus:border-red-500 transition-colors"
                  placeholder="Yazı başlığı"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">
                  URL (Slug) *
                </label>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="w-full px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-white placeholder-zinc-600 focus:outline-none focus:border-red-500 transition-colors"
                  placeholder="yazi-url"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">
                  Özet *
                </label>
                <textarea
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  className="w-full px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-white placeholder-zinc-600 focus:outline-none focus:border-red-500 transition-colors resize-none"
                  placeholder="Kısa özet (liste görünümünde gösterilir)"
                  rows={3}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">
                  Kapak Görseli URL
                </label>
                <input
                  type="url"
                  value={coverImageUrl}
                  onChange={(e) => setCoverImageUrl(e.target.value)}
                  className="w-full px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-white placeholder-zinc-600 focus:outline-none focus:border-red-500 transition-colors"
                  placeholder="https://..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">
                  Etiketler
                </label>
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newTagName}
                      onChange={(e) => setNewTagName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddTag();
                        }
                      }}
                      className="flex-1 px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-white placeholder-zinc-600 focus:outline-none focus:border-red-500 transition-colors"
                      placeholder="Yeni etiket ekle"
                    />
                    <button
                      type="button"
                      onClick={handleAddTag}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      Ekle
                    </button>
                  </div>

                  {selectedTags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {selectedTags.map(tag => (
                        <span
                          key={tag.id}
                          className="inline-flex items-center gap-1 px-3 py-1 bg-red-900/30 border border-red-900 text-red-400 rounded-full text-sm"
                        >
                          <TagIcon className="w-3 h-3" />
                          {tag.name}
                          <button
                            type="button"
                            onClick={() => handleRemoveTag(tag.id)}
                            className="ml-1 hover:text-red-200"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}

                  {availableTags.length > 0 && (
                    <div className="border border-zinc-800 rounded-lg p-3 bg-zinc-950">
                      <p className="text-xs text-zinc-500 mb-2">Mevcut etiketler:</p>
                      <div className="flex flex-wrap gap-2">
                        {availableTags
                          .filter(tag => !selectedTags.find(st => st.id === tag.id))
                          .map(tag => (
                            <button
                              key={tag.id}
                              type="button"
                              onClick={() => handleSelectExistingTag(tag)}
                              className="inline-flex items-center gap-1 px-2 py-1 bg-zinc-900 border border-zinc-800 text-zinc-400 rounded text-xs hover:border-red-900 hover:text-red-400 transition-colors"
                            >
                              <TagIcon className="w-3 h-3" />
                              {tag.name}
                            </button>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">
                  İçerik *
                </label>
                <RichTextEditor content={content} onChange={setContent} />
              </div>

              {profile.role !== 'writer' && (
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-2">
                    Durum
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as 'draft' | 'published')}
                    className="w-full px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-white focus:outline-none focus:border-red-500 transition-colors"
                  >
                    <option value="draft">Taslak</option>
                    <option value="published">Yayınla</option>
                  </select>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 flex items-center justify-center space-x-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save className="w-5 h-5" />
                  <span>{loading ? 'Kaydediliyor...' : profile.role === 'writer' ? 'Taslak Olarak Kaydet' : 'Kaydet'}</span>
                </button>
              </div>

              {profile.role === 'writer' && postId && (
                <div className="border-t border-zinc-800 pt-6 space-y-3">
                  <p className="text-sm text-zinc-400">
                    Yazarlar doğrudan yayımlayamaz veya silemez. Yöneticilerden onay almanız gerekir.
                  </p>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => handleRequestApproval('publish')}
                      disabled={loading}
                      className="flex-1 flex items-center justify-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                    >
                      Yayımlama Onayı İste
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRequestApproval('delete')}
                      disabled={loading}
                      className="flex-1 flex items-center justify-center space-x-2 px-6 py-3 bg-red-900/50 text-red-300 rounded-lg hover:bg-red-900/70 transition-colors disabled:opacity-50"
                    >
                      Silme Onayı İste
                    </button>
                  </div>
                </div>
              )}
            </form>
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <SeoHelper
                title={title}
                excerpt={excerpt}
                content={content}
                slug={slug}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
