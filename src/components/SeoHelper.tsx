import { Info, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';

interface SeoHelperProps {
  title: string;
  excerpt: string;
  content: string;
  slug: string;
}

interface SeoCheck {
  label: string;
  status: 'success' | 'warning' | 'error' | 'info';
  message: string;
}

export default function SeoHelper({ title, excerpt, content, slug }: SeoHelperProps) {
  const getWordCount = (text: string) => {
    const cleanText = text.replace(/<[^>]*>/g, '').trim();
    return cleanText.split(/\s+/).filter(word => word.length > 0).length;
  };

  const contentWordCount = getWordCount(content);
  const titleLength = title.length;
  const excerptLength = excerpt.length;
  const slugLength = slug.length;

  const checks: SeoCheck[] = [
    {
      label: 'Başlık Uzunluğu',
      status:
        titleLength >= 30 && titleLength <= 60
          ? 'success'
          : titleLength < 30 || titleLength > 70
          ? 'error'
          : 'warning',
      message:
        titleLength >= 30 && titleLength <= 60
          ? `Mükemmel! (${titleLength} karakter)`
          : titleLength < 30
          ? `Çok kısa (${titleLength}/30-60 karakter)`
          : titleLength > 70
          ? `Çok uzun (${titleLength}/30-60 karakter)`
          : `İdeal aralıkta fakat optimize edilebilir (${titleLength}/30-60 karakter)`,
    },
    {
      label: 'Özet Uzunluğu',
      status:
        excerptLength >= 120 && excerptLength <= 160
          ? 'success'
          : excerptLength < 120 || excerptLength > 200
          ? 'error'
          : 'warning',
      message:
        excerptLength >= 120 && excerptLength <= 160
          ? `Mükemmel! (${excerptLength} karakter)`
          : excerptLength < 120
          ? `Çok kısa (${excerptLength}/120-160 karakter)`
          : excerptLength > 200
          ? `Çok uzun (${excerptLength}/120-160 karakter)`
          : `İdeal aralıkta fakat optimize edilebilir (${excerptLength}/120-160 karakter)`,
    },
    {
      label: 'URL Yapısı',
      status:
        slugLength > 3 && slugLength < 60 && /^[a-z0-9-]+$/.test(slug)
          ? 'success'
          : slugLength > 60
          ? 'warning'
          : 'error',
      message:
        slugLength > 3 && slugLength < 60 && /^[a-z0-9-]+$/.test(slug)
          ? `SEO dostu URL (${slugLength} karakter)`
          : slugLength > 60
          ? `URL çok uzun (${slugLength} karakter)`
          : slugLength === 0
          ? 'URL girilmedi'
          : 'Geçersiz karakterler içeriyor veya çok kısa',
    },
    {
      label: 'İçerik Uzunluğu',
      status:
        contentWordCount >= 300
          ? 'success'
          : contentWordCount >= 150
          ? 'warning'
          : 'error',
      message:
        contentWordCount >= 300
          ? `Yeterli içerik (${contentWordCount} kelime)`
          : contentWordCount >= 150
          ? `Daha fazla içerik eklenebilir (${contentWordCount}/300+ kelime)`
          : `İçerik çok kısa (${contentWordCount}/300+ kelime)`,
    },
    {
      label: 'Başlık Kullanımı',
      status: content.includes('<h1>') || content.includes('<h2>') || content.includes('<h3>')
        ? 'success'
        : 'warning',
      message: content.includes('<h1>') || content.includes('<h2>') || content.includes('<h3>')
        ? 'İçerikte başlık yapısı mevcut'
        : 'İçeriğe başlıklar ekleyerek yapılandırın (H1, H2, H3)',
    },
    {
      label: 'Liste Kullanımı',
      status: content.includes('<ul>') || content.includes('<ol>')
        ? 'success'
        : 'info',
      message: content.includes('<ul>') || content.includes('<ol>')
        ? 'İçerikte liste yapısı mevcut'
        : 'İçeriğe listeler eklemek okunabilirliği artırır',
    },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Info className="w-4 h-4 text-blue-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'border-green-900/50 bg-green-950/20';
      case 'warning':
        return 'border-yellow-900/50 bg-yellow-950/20';
      case 'error':
        return 'border-red-900/50 bg-red-950/20';
      default:
        return 'border-blue-900/50 bg-blue-950/20';
    }
  };

  const successCount = checks.filter(c => c.status === 'success').length;
  const totalChecks = checks.length;
  const score = Math.round((successCount / totalChecks) * 100);

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <Info className="w-5 h-5 text-red-500" />
          SEO Analizi ve Öneriler
        </h3>
        <div className="text-right">
          <div className="text-2xl font-bold text-white">{score}%</div>
          <div className="text-xs text-zinc-500">SEO Skoru</div>
        </div>
      </div>

      <div className="space-y-3">
        {checks.map((check, index) => (
          <div
            key={index}
            className={`border rounded-lg p-3 transition-all ${getStatusColor(check.status)}`}
          >
            <div className="flex items-start gap-3">
              <div className="mt-0.5">{getStatusIcon(check.status)}</div>
              <div className="flex-1">
                <div className="font-medium text-white text-sm">{check.label}</div>
                <div className="text-xs text-zinc-400 mt-1">{check.message}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 p-3 bg-zinc-950 border border-zinc-800 rounded-lg">
        <div className="text-xs text-zinc-400 space-y-1">
          <p className="font-semibold text-zinc-300 mb-2">SEO İpuçları:</p>
          <p>• Başlığınızda ana anahtar kelimeyi kullanın</p>
          <p>• Özette yazınızı net ve çekici şekilde özetleyin</p>
          <p>• İçeriğinizi H1, H2, H3 başlıklarıyla yapılandırın</p>
          <p>• Listeler ve alıntılar kullanarak okunabilirliği artırın</p>
          <p>• URL'yi kısa ve açıklayıcı tutun</p>
          <p>• Minimum 300 kelime içerik hedefleyin</p>
        </div>
      </div>
    </div>
  );
}
