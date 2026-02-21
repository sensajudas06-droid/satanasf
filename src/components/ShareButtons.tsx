import { Share2, Twitter, Facebook, Linkedin, Link as LinkIcon } from 'lucide-react';
import { useState } from 'react';

interface ShareButtonsProps {
  title: string;
  url: string;
}

export default function ShareButtons({ title, url }: ShareButtonsProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}${url}` : url;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setShowTooltip(true);
      setTimeout(() => setShowTooltip(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const shareOnTwitter = () => {
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(twitterUrl, '_blank', 'noopener,noreferrer');
  };

  const shareOnFacebook = () => {
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
    window.open(facebookUrl, '_blank', 'noopener,noreferrer');
  };

  const shareOnLinkedIn = () => {
    const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
    window.open(linkedinUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1 text-sm text-zinc-400 mr-2">
        <Share2 className="w-4 h-4" />
        <span>Paylaş:</span>
      </div>

      <button
        onClick={shareOnTwitter}
        className="p-2 rounded-lg bg-zinc-900 text-zinc-400 hover:bg-blue-600 hover:text-white transition-all"
        title="Twitter'da Paylaş"
      >
        <Twitter className="w-4 h-4" />
      </button>

      <button
        onClick={shareOnFacebook}
        className="p-2 rounded-lg bg-zinc-900 text-zinc-400 hover:bg-blue-700 hover:text-white transition-all"
        title="Facebook'ta Paylaş"
      >
        <Facebook className="w-4 h-4" />
      </button>

      <button
        onClick={shareOnLinkedIn}
        className="p-2 rounded-lg bg-zinc-900 text-zinc-400 hover:bg-blue-800 hover:text-white transition-all"
        title="LinkedIn'de Paylaş"
      >
        <Linkedin className="w-4 h-4" />
      </button>

      <div className="relative">
        <button
          onClick={handleCopyLink}
          className="p-2 rounded-lg bg-zinc-900 text-zinc-400 hover:bg-red-600 hover:text-white transition-all"
          title="Bağlantıyı Kopyala"
        >
          <LinkIcon className="w-4 h-4" />
        </button>
        {showTooltip && (
          <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 px-3 py-1 bg-green-600 text-white text-xs rounded whitespace-nowrap">
            Kopyalandı!
          </div>
        )}
      </div>
    </div>
  );
}
