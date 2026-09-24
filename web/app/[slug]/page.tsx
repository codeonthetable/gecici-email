import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import IndustrialConsole from '../../components/IndustrialConsole';
import { USE_CASES } from '../../lib/use-cases';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return Object.keys(USE_CASES).map((slug) => ({ slug }));
}


export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const data = USE_CASES[slug];

  if (!data) {
    return {
      title: 'Sayfa Bulunamadı - gecici.email',
    };
  }

  return {
    title: data.metaTitle,
    description: data.metaDescription,
    alternates: {
      canonical: `https://gecici.email/${data.slug}`,
    },
    openGraph: {
      title: data.metaTitle,
      description: data.metaDescription,
      url: `https://gecici.email/${data.slug}`,
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

      <div className="py-6 md:py-10 max-w-5xl mx-auto px-4 sm:px-6 space-y-10 font-sans">
        
        {/* Navigation Breadcrumb & Back to Console Button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#242733]">
          <div className="flex items-center gap-2 text-xs font-mono text-[#94a3b8]">
            <Link href="/" className="hover:text-white hover:underline flex items-center gap-1.5">
              <ArrowLeft className="w-3.5 h-3.5 text-[#ff4e00]" />
              <span>KONSOL</span>
            </Link>
            <span className="text-[#475569]">/</span>
            <span className="text-[#ff9900] font-bold">{data.serviceName.toUpperCase()}</span>
          </div>

          <Link
            href="/"
            className="inline-flex items-center gap-2 self-start sm:self-auto px-3.5 py-2 rounded-xl bg-[#ff4e00] hover:bg-[#ff621a] text-white text-xs font-mono font-bold shadow-[0_0_15px_rgba(255,78,0,0.35)] transition-all hover:scale-105"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>KONSOL / ANA SAYFAYA DÖN</span>
          </Link>
        </div>

        {/* Hero Context Banner */}
        <section className="bg-[#121419] border-2 border-[#242733] rounded-3xl p-6 font-mono space-y-3">
          <div className="flex items-center justify-between border-b border-[#1f222b] pb-3 text-[11px]">
            <span className="text-[#ff4e00] font-bold tracking-wider">{data.badge}</span>
            <span className="text-[#00ff66] flex items-center gap-1.5 font-bold">
              <span className="w-2 h-2 rounded-full bg-[#00ff66] animate-pulse" />
              CANLI HAT AKTİF
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-white tracking-tight leading-snug">
            {data.h1}
          </h1>
          <p className="text-xs sm:text-sm text-[#cbd5e1] leading-relaxed font-normal">
            {data.heroSubtitle}
          </p>
        </section>

        {/* Live Functional Hardware Console */}
        <main>
          <IndustrialConsole />
        </main>

        {/* Quick Steps (3-Column Hardware Modules) */}
        <section className="space-y-4">
          <div className="flex items-center justify-between text-xs font-mono text-[#94a3b8] border-b border-[#1f222b] pb-2">
            <span className="font-bold text-white uppercase tracking-wider">
              {data.serviceName} DOĞRULAMA TALİMATI // 3 ADIM
            </span>
            <span className="text-[#00f0ff] font-bold">KILAVUZ-01</span>
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
                <p className="text-xs text-[#cbd5e1] leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Detailed Guide & Architectural Content (E-E-A-T) */}
        <section className="bg-[#121419] border-2 border-[#242733] rounded-3xl p-6 sm:p-8 font-mono space-y-6">
          <div className="border-b border-[#1f222b] pb-3 flex items-center justify-between text-[11px] text-[#94a3b8]">
            <span className="font-bold text-white uppercase tracking-wider">
              TEKNİK DOKÜMANTASYON & GÜVENLİK
            </span>
            <span className="text-[#00f0ff] font-bold">E-E-A-T SPEC</span>
          </div>

          <div className="space-y-4 text-xs sm:text-sm text-[#cbd5e1] leading-relaxed font-normal">
            <h2 className="text-base sm:text-lg font-bold text-white">{data.guideTitle}</h2>
            {data.guideParagraphs.map((para, idx) => (
              <p key={idx}>{para}</p>
            ))}
          </div>

          {/* Key Features */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            {data.features.map((feat, idx) => (
              <div key={idx} className="p-3 bg-[#08090b] rounded-xl border border-[#242733] space-y-1">
                <div className="text-[10px] text-[#00ff66] font-bold uppercase">{feat.title}</div>
                <div className="text-xs text-[#cbd5e1]">{feat.desc}</div>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ Accordion */}
        <section className="bg-[#121419] border-2 border-[#242733] rounded-3xl p-6 font-mono space-y-5">
          <div className="border-b border-[#1f222b] pb-3 text-[11px] text-[#94a3b8] flex items-center justify-between">
            <span className="font-bold text-white uppercase tracking-wider">
              SIKÇA SORULAN SORULAR // {data.serviceName.toUpperCase()}
            </span>
            <span className="text-[#ff9900] font-bold">FAQ_MATRIX</span>
          </div>

          <div className="space-y-3 text-xs">
            {data.faqs.map((faq, idx) => (
              <div key={idx} className="p-4 bg-[#0a0c0f] rounded-2xl border border-[#242733] space-y-2">
                <div className="font-bold text-white flex items-center gap-2">
                  <span className="text-[#ff4e00]">Q{idx + 1}:</span>
                  <span>{faq.q}</span>
                </div>
                <p className="text-[#cbd5e1] pl-6 leading-relaxed font-normal">{faq.a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Cross-linking to Other Use-Cases (Internal SEO Linking) */}
        <section className="bg-[#121419] border-2 border-[#242733] rounded-3xl p-6 font-mono space-y-4">
          <div className="border-b border-[#1f222b] pb-3 text-[11px] text-[#94a3b8]">
            <span className="font-bold text-white uppercase tracking-wider">
              DİĞER POPÜLER SERVİS İSTASYONLARI
            </span>
          </div>

          <div className="flex flex-wrap gap-2 text-xs">
            {otherUseCases.map((u) => (
              <Link
                key={u.slug}
                href={`/${u.slug}`}
                className="px-3 py-1.5 rounded-xl bg-[#090a0d] border border-[#242733] hover:border-[#ff4e00] hover:text-[#ff4e00] text-[#cbd5e1] transition-colors font-medium"
              >
                {u.serviceName} İçin Geçici Posta →
              </Link>
            ))}
          </div>
        </section>

      </div>
    </>
  );
}
