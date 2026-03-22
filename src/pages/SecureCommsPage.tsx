import { Shield, Lock, KeyRound, ServerCrash, EyeOff, AlertTriangle, CheckCircle2 } from 'lucide-react';

const securityPrinciples = [
  {
    title: 'Uçtan Uca Şifreleme (E2EE)',
    description: 'Mesajlar ve konferans oturum anahtarları istemcide şifrelenir; sunucu yalnızca şifreli paketleri iletir.',
    icon: Lock,
  },
  {
    title: 'Sıfır Güven Erişim Kontrolü',
    description: 'Her oturumda cihaz doğrulama, MFA ve rol tabanlı izin kontrolü uygulanır.',
    icon: Shield,
  },
  {
    title: 'Ephemeral Anahtar Yönetimi',
    description: 'Oturum anahtarları kısa ömürlüdür, düzenli anahtar döndürme ve ileri gizlilik (PFS) zorunludur.',
    icon: KeyRound,
  },
  {
    title: 'Güvenli Kayıt ve Denetim',
    description: 'Kritik olaylar gizlilik dostu şekilde denetlenir; şirket güvenlik ekipleri için izlenebilirlik korunur.',
    icon: EyeOff,
  },
];

const guardrails = [
  '"Kesinlikle takip edilemez" bir sistem teknik ve hukuki olarak gerçekçi değildir.',
  'Bu tasarım, mahremiyeti en üst düzeye çıkarırken kurumsal güvenlik ve yasal uyumluluğu birlikte ele alır.',
  'Veri sızıntısını azaltmak için cihaz bağlama, donanım tabanlı anahtar depolama ve DLP kuralları önerilir.',
];

export default function SecureCommsPage() {
  return (
    <div className="min-h-screen bg-black text-zinc-100 py-16 px-4">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="border border-red-900/40 bg-zinc-950/80 rounded-xl p-6 md:p-10">
          <p className="text-sm uppercase tracking-[0.2em] text-red-500 mb-3">Secure Collaboration Blueprint</p>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">Kurumsal Gizli Konferans ve Mesajlaşma</h1>
          <p className="text-zinc-300 leading-relaxed max-w-3xl">
            Discord benzeri bir deneyimi, güçlü şifreleme ve kurumsal güvenlik kontrolleri ile tasarladık.
            Hedef, gizliliği yükseltmek ve yetkisiz erişimi önlemek; ancak mutlak anonimlik/iz bırakmama vaadi yerine
            doğrulanabilir güvenlik mimarisi sunmaktır.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {securityPrinciples.map((item) => (
            <article key={item.title} className="border border-zinc-800 bg-zinc-950 rounded-xl p-5">
              <item.icon className="w-6 h-6 text-red-500 mb-3" />
              <h2 className="text-lg font-semibold text-white mb-2">{item.title}</h2>
              <p className="text-zinc-400 text-sm leading-relaxed">{item.description}</p>
            </article>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-4">
          <div className="border border-amber-800/60 bg-amber-950/20 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
              <h3 className="text-white font-semibold">Güvenlik Sınırları</h3>
            </div>
            <ul className="space-y-2 text-sm text-zinc-300">
              {guardrails.map((item) => (
                <li key={item} className="flex gap-2">
                  <ServerCrash className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="border border-emerald-800/60 bg-emerald-950/20 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <h3 className="text-white font-semibold">Önerilen Sonraki Adımlar</h3>
            </div>
            <ol className="list-decimal list-inside space-y-2 text-sm text-zinc-300">
              <li>Mesajlaşma için MLS/Double Ratchet tabanlı protokol seçimi yapın.</li>
              <li>Konferans için SFU + E2EE katmanı ve donanım güven modülü entegrasyonu planlayın.</li>
              <li>Red-team testleri, bağımsız kriptografi denetimi ve olay müdahale playbook'u oluşturun.</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
