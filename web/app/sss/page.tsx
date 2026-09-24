import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { HelpCircle, CheckCircle2, ArrowLeft } from 'lucide-react';
import AdPlaceholder from '../../components/AdPlaceholder';

export const metadata: Metadata = {
  title: 'Sıkça Sorulan Sorular (SSS) - gecici.email',
  description: 'Geçici e-posta nedir, nasıl çalışır, güvenli midir ve AI modelleriyle nasıl entegre edilir? Merak edilen tüm soruların cevapları.',
};

export default function FaqPage() {
  const faqs = [
    {
      q: 'Geçici e-posta (Disposable Email) nedir?',
      a: 'Geçici e-posta, kayıt olmanıza gerek kalmadan belirli bir süre boyunca gelen e-postaları almanızı sağlayan tek kullanımlık bir e-posta adresidir. Süresi dolduğunda veya siz sildiğinizde tamamen yok olur.'
    },
    {
      q: 'Bu servis kişisel verilerimi veya IP adresimi kaydeder mi?',
      a: 'Hayır. gecici.email sıfır günlük (zero-log) prensibiyle çalışır. Gelen kutuları yalnızca sunucu RAM belleğinde tutulur ve belirlenen TTL (varsayılan 60 dakika) süresi dolduğunda kalıcı olarak bellekten silinir.'
    },
    {
      q: 'Geçici e-postamdan başka birine e-posta gönderebilir miyim?',
      a: 'Hayır. Platformumuz yalnızca gelen kutusu (Receive-Only) olarak çalışır. Giden e-posta portları (Outbound) tamamen kapalıdır. Bu güvenlik önlemi, domain adresimizin asla spam kara listelerine (blacklist) girmemesini sağlar.'
    },
    {
      q: 'Özel bir e-posta adresi seçebilir miyim?',
      a: 'Evet! Ana sayfadaki "+ ÖZEL" butonuna tıklayarak istediğiniz kullanıcı adını (örneğin: ahmet123@gecici.email) belirleyip kullanabilirsiniz.'
    },
    {
      q: 'Yapay zeka (AI) ajanları ve botlar bu servisi kullanabilir mi?',
      a: 'Evet, gecici.email özellikle AI ajanları için optimize edilmiştir. Model Context Protocol (MCP) sunucusu, Python ve TypeScript SDK’ları ile Claude, Cursor, OpenAI, browser-use ve LangChain ajanları e-postadaki OTP kodunu veya aktivasyon linkini tek satır kodla alabilir.'
    },
    {
      q: 'Gelen e-postanın süresini uzatabilir miyim?',
      a: 'Evet, arayüzdeki "+30 Dk" butonuna tıklayarak gelen kutunuzun süresini dilediğiniz kadar uzatabilirsiniz.'
    },
    {
      q: 'Servis ücretli mi?',
      a: 'Hayır, hem bireysel kullanıcılar hem de geliştiriciler için temel API ve web servisimiz %100 ücretsizdir.'
    }
  ];

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(f => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: f.a
      }
    }))
  };

  return (
    <div className="py-8 md:py-12 space-y-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 font-sans">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      {/* Top Navigation & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#242733]">
        <div className="flex items-center gap-2 text-xs font-mono text-[#94a3b8]">
          <Link href="/" className="hover:text-white hover:underline flex items-center gap-1.5">
            <ArrowLeft className="w-3.5 h-3.5 text-[#ff4e00]" />
            <span>KONSOL</span>
          </Link>
          <span className="text-[#475569]">/</span>
          <span className="text-[#ff9900] font-bold">MANUAL_FAQ</span>
        </div>

        <Link
          href="/"
          className="inline-flex items-center gap-2 self-start sm:self-auto px-3 py-1.5 rounded-xl bg-[#141720] hover:bg-[#1e2330] text-white text-xs font-mono font-bold border border-[#2e3342] hover:border-[#ff4e00] transition-colors"
        >
          <ArrowLeft className="w-4 h-4 text-[#ff4e00]" />
          <span>E-POSTA KONSOLUNA DÖN</span>
        </Link>
      </div>

      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-950/60 border border-amber-800/80 text-amber-300 text-xs font-mono font-semibold">
          <HelpCircle className="w-4 h-4 text-amber-400" />
          <span>Yardım & Soru Bankası</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Sıkça Sorulan Sorular
        </h1>
        <p className="text-sm sm:text-base text-[#cbd5e1] leading-relaxed">
          Geçici e-posta servisimiz, güvenliğimiz ve AI entegrasyonlarımız hakkında bilmeniz gereken her şey.
        </p>
      </div>

      <AdPlaceholder slotType="leaderboard" />

      {/* FAQ Cards */}
      <div className="space-y-4">
        {faqs.map((faq, idx) => (
          <div
            key={idx}
            className="bg-[#121419] rounded-2xl border-2 border-[#242733] p-6 space-y-3 shadow-sm hover:border-[#353b4d] transition-colors"
          >
            <h3 className="font-bold text-base text-white flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-[#ff9900] shrink-0" />
              <span>{faq.q}</span>
            </h3>
            <p className="text-sm text-[#cbd5e1] leading-relaxed pl-7 font-normal">
              {faq.a}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
