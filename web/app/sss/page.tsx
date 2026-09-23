import React from 'react';
import type { Metadata } from 'next';
import { HelpCircle, CheckCircle2 } from 'lucide-react';
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
      a: 'Evet! Ana sayfadaki "Özel İsim" butonuna tıklayarak istediğiniz kullanıcı adını (örneğin: ahmet123@gecici.email) belirleyip kullanabilirsiniz.'
    },
    {
      q: 'Yapay zeka (AI) ajanları ve botlar bu servisi kullanabilir mi?',
      a: 'Evet, gecici.email özellikle AI ajanları için optimize edilmiştir. Model Context Protocol (MCP) sunucusu, Python ve TypeScript SDK’ları ile Claude, Cursor, OpenAI ve LangChain ajanları e-postadaki OTP kodunu veya aktivasyon linkini tek satır kodla alabilir.'
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
    <div className="py-12 space-y-12 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300 text-xs font-semibold">
          <HelpCircle className="w-4 h-4 text-amber-500" />
          <span>Yardım & Soru Bankası</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Sıkça Sorulan Sorular
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Geçici e-posta servisimiz, güvenliğimiz ve AI entegrasyonlarımız hakkında bilmeniz gereken her şey.
        </p>
      </div>

      <AdPlaceholder slotType="leaderboard" />

      <div className="space-y-4">
        {faqs.map((faq, idx) => (
          <div
            key={idx}
            className="bg-white dark:bg-[#0f1422] rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm space-y-2"
          >
            <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-brand-500 shrink-0" />
              <span>{faq.q}</span>
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed pl-6">
              {faq.a}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
