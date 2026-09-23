import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import IndustrialConsole from '../../components/IndustrialConsole';
import { USE_CASES } from '../../lib/use-cases';

export const dynamic = 'force-static';

export async function generateStaticParams() {
  return Object.keys(USE_CASES).map((slug) => ({
    slug,
  }));
}

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const data = USE_CASES[slug];

  if (!data) {
    return { title: 'Sayfa Bulunamadı | gecici.email' };
  }

  const url = `https://gecici.email/${data.slug}`;

  return {
    title: data.metaTitle,
    description: data.metaDescription,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: data.metaTitle,
      description: data.metaDescription,
      url,
      siteName: 'gecici.email',
      type: 'website',
      locale: 'tr_TR',
    },
    twitter: {
      card: 'summary_large_image',
      title: data.metaTitle,
      description: data.metaDescription,
    },
  };
}

export default async function UseCasePage({ params }: Props) {
  const { slug } = await params;
  const data = USE_CASES[slug];

  if (!data) {
    notFound();
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'SoftwareApplication',
        name: `gecici.email — ${data.serviceName} Doğrulama İstasyonu`,
        applicationCategory: 'UtilitiesApplication',
        operatingSystem: 'All',
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'USD',
        },
        description: data.metaDescription,
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Ana Sayfa',
            item: 'https://gecici.email',
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: data.serviceName,
            item: `https://gecici.email/${data.slug}`,
          },
        ],
      },
      {
        '@type': 'FAQPage',
        mainEntity: data.faqs.map((faq) => ({
          '@type': 'Question',
          name: faq.q,
          acceptedAnswer: {
            '@type': 'Answer',
            text: faq.a,
          },
        })),
      },
    ],
  };

  const otherUseCases = Object.values(USE_CASES).filter((u) => u.slug !== data.slug);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="py-6 md:py-10 max-w-5xl mx-auto px-4 sm:px-6 space-y-10">
        {/* Navigation Bar */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#242733] pb-4">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="w-8 h-8 rounded-xl bg-[#ff4e00] flex items-center justify-center text-white font-mono font-black text-sm shadow-[0_0_15px_rgba(255,78,0,0.4)] hover:scale-105 transition-transform"
            >
              @
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <Link href="/" className="text-base font-bold font-mono tracking-tight text-white hover:text-[#ff4e00] transition-colors">
                  gecici.email
                </Link>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#1e222c] text-[#ff9900] border border-[#2e3342] font-mono">
                  {data.serviceName.toUpperCase()}
                </span>
              </div>
              <p className="text-[11px] font-mono text-[#6c7284]">
                BAĞIMSIZ DİJİTAL SİNYAL & GEÇİCİ E-POSTA İSTASYONU
              </p>
            </div>
          </div>

          <nav className="flex items-center gap-3 text-xs font-mono text-[#8a92a6]">
            <Link href="/" className="hover:text-white hover:underline">
              KONSOL
            </Link>
            <span>/</span>
            <Link href="/api-dokuman" className="hover:text-white hover:underline">
              API_TERMINAL
            </Link>
            <span>/</span>
            <Link href="/sss" className="hover:text-white hover:underline">
              MANUAL_FAQ
            </Link>
          </nav>
        </header>

        {/* Hero Context Banner */}
        <section className="bg-[#121419] border-2 border-[#242733] rounded-3xl p-6 font-mono space-y-3">
          <div className="flex items-center justify-between border-b border-[#1f222b] pb-3 text-[11px]">
            <span className="text-[#ff4e00] font-bold tracking-wider">{data.badge}</span>
            <span className="text-[#00ff66] flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00ff66] animate-pulse" />
              CANLI HAT AKTİF
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white tracking-tight leading-snug">
            {data.h1}
          </h1>
          <p className="text-xs sm:text-sm text-[#9ca3b8] leading-relaxed">
            {data.heroSubtitle}
          </p>
        </section>

        {/* Live Functional Hardware Console */}
        <main>
          <IndustrialConsole />
        </main>

        {/* Quick Steps (3-Column Hardware Modules) */}
        <section className="space-y-4">
          <div className="flex items-center justify-between text-xs font-mono text-[#6c7284] border-b border-[#1f222b] pb-2">
            <span className="font-bold text-[#e4e5e8] uppercase tracking-wider">
              {data.serviceName} DOĞRULAMA TALİMATI // 3 ADIM
            </span>
            <span>KILAVUZ-01</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono">
            {data.quickSteps.map((s) => (
              <div
                key={s.step}
                className="bg-[#121419] border-2 border-[#242733] rounded-2xl p-5 space-y-2 relative overflow-hidden"
              >
                <div className="text-[10px] text-[#ff4e00] font-black tracking-widest">
                  STEP_{s.step}
                </div>
                <h3 className="text-sm font-bold text-white">{s.title}</h3>
                <p className="text-xs text-[#8a92a6] leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Detailed Guide & Architectural Content (E-E-A-T) */}
        <section className="bg-[#121419] border-2 border-[#242733] rounded-3xl p-6 sm:p-8 font-mono space-y-6">
          <div className="border-b border-[#1f222b] pb-3 flex items-center justify-between text-[11px] text-[#6c7284]">
            <span className="font-bold text-[#e4e5e8] uppercase tracking-wider">
              TEKNİK DOKÜMANTASYON & GÜVENLİK
            </span>
            <span className="text-[#00f0ff]">E-E-A-T SPEC</span>
          </div>

          <div className="space-y-4 text-xs sm:text-sm text-[#9ca3b8] leading-relaxed">
            <h2 className="text-base sm:text-lg font-bold text-white">{data.guideTitle}</h2>
            {data.guideParagraphs.map((para, idx) => (
              <p key={idx}>{para}</p>
            ))}
          </div>

          {/* Key Features */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            {data.features.map((feat, idx) => (
              <div key={idx} className="p-3 bg-[#08090b] rounded-xl border border-[#1f222b] space-y-1">
                <div className="text-[10px] text-[#00ff66] font-bold uppercase">{feat.title}</div>
                <div className="text-xs text-[#8a92a6]">{feat.desc}</div>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ Accordion */}
        <section className="bg-[#121419] border-2 border-[#242733] rounded-3xl p-6 font-mono space-y-5">
          <div className="border-b border-[#1f222b] pb-3 text-[11px] text-[#6c7284] flex items-center justify-between">
            <span className="font-bold text-[#e4e5e8] uppercase tracking-wider">
              SIKÇA SORULAN SORULAR // {data.serviceName.toUpperCase()}
            </span>
            <span className="text-[#ff9900]">FAQ_MATRIX</span>
          </div>

          <div className="space-y-3 text-xs">
            {data.faqs.map((faq, idx) => (
              <div key={idx} className="p-4 bg-[#0a0c0f] rounded-2xl border border-[#1f222b] space-y-2">
                <div className="font-bold text-white flex items-center gap-2">
                  <span className="text-[#ff4e00]">Q{idx + 1}:</span>
                  <span>{faq.q}</span>
                </div>
                <p className="text-[#8a92a6] pl-6 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Cross-linking to Other Use-Cases (Internal SEO Linking) */}
        <section className="bg-[#121419] border-2 border-[#242733] rounded-3xl p-6 font-mono space-y-4">
          <div className="border-b border-[#1f222b] pb-3 text-[11px] text-[#6c7284]">
            <span className="font-bold text-[#e4e5e8] uppercase tracking-wider">
              DİĞER POPÜLER SERVİS İSTASYONLARI
            </span>
          </div>

          <div className="flex flex-wrap gap-2 text-xs">
            {otherUseCases.map((u) => (
              <Link
                key={u.slug}
                href={`/${u.slug}`}
                className="px-3 py-1.5 rounded-xl bg-[#090a0d] border border-[#242733] hover:border-[#ff4e00] hover:text-[#ff4e00] text-[#8a92a6] transition-colors"
              >
                {u.serviceName} İçin Geçici Posta →
              </Link>
            ))}
          </div>
        </section>

        {/* Global Footer */}
        <footer className="pt-4 border-t border-[#1f222b] flex flex-col sm:flex-row items-center justify-between text-[11px] font-mono text-[#525768] gap-2">
          <div>© {new Date().getFullYear()} GECICI.EMAIL // 0-LOG // RAM MEMORY DISKLESS CACHE</div>
          <div className="text-[#6c7284]">PORT 25 SMTP RELAY // SSL STRICT // CORS OPEN</div>
        </footer>
      </div>
    </>
  );
}
