import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Shield, Lock, EyeOff, Trash2, Server, ArrowLeft } from 'lucide-react';
import AdPlaceholder from '../../components/AdPlaceholder';

export const metadata: Metadata = {
  title: 'Gizlilik ve Güvenlik Politikası - gecici.email',
  description: 'gecici.email gizlilik prensipleri, KVKK / GDPR uyumluluğu, sıfır log politikası ve veri güvenliği önlemleri.',
};

export default function PrivacyPage() {
  return (
    <div className="py-8 md:py-12 space-y-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 font-sans">
      
      {/* Top Navigation & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#242733]">
        <div className="flex items-center gap-2 text-xs font-mono text-[#94a3b8]">
          <Link href="/" className="hover:text-white hover:underline flex items-center gap-1.5">
            <ArrowLeft className="w-3.5 h-3.5 text-[#ff4e00]" />
            <span>KONSOL</span>
          </Link>
          <span className="text-[#475569]">/</span>
          <span className="text-emerald-400 font-bold">GİZLİLİK_POLİTİKASI</span>
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
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-800/80 text-emerald-300 text-xs font-mono font-semibold">
          <Shield className="w-4 h-4 text-emerald-400" />
          <span>Gizlilik & Veri Güvenliği</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Gizlilik ve Güvenlik Politikası
        </h1>
        <p className="text-sm sm:text-base text-[#cbd5e1] leading-relaxed">
          Son Güncelleme: Eylül 2026 • KVKK ve GDPR Standartlarına %100 Uyumlu
        </p>
      </div>

      <AdPlaceholder slotType="leaderboard" />

      {/* Policy Sections */}
      <div className="bg-[#121419] rounded-3xl border-2 border-[#242733] p-6 sm:p-8 space-y-8 text-[#cbd5e1] text-sm leading-relaxed shadow-sm">
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white flex items-center gap-2.5">
            <EyeOff className="w-5 h-5 text-[#ff4e00]" />
            <span>1. Sıfır Günlük (Zero-Log) İlkesi</span>
          </h2>
          <p className="text-[#cbd5e1] leading-relaxed font-normal">
            gecici.email, kullanıcılarının gizliliğine mutlak saygı duyar. Servisimizi kullanırken kimliğinizi belirtebilecek hiçbir kişisel bilgi, IP adresi, konum veya tarayıcı parmak izi kaydedilmez veya üçüncü şahıslarla paylaşılmaz.
          </p>
        </section>

        <section className="space-y-3 border-t border-[#1f222b] pt-6">
          <h2 className="text-lg font-bold text-white flex items-center gap-2.5">
            <Trash2 className="w-5 h-5 text-red-400" />
            <span>2. Otomatik Bellek Temizliği (TTL Ömrü)</span>
          </h2>
          <p className="text-[#cbd5e1] leading-relaxed font-normal">
            Oluşturulan her gelen kutusu ve alınan e-postalar yalnızca geçici RAM bellekte tutulur. Varsayılan saklama süresi 60 dakikadır. Bu süre sona erdiğinde ya da kullanıcı arayüz üzerinden silme işlemini tetiklediğinde, tüm veriler kalıcı olarak yok edilir.
          </p>
        </section>

        <section className="space-y-3 border-t border-[#1f222b] pt-6">
          <h2 className="text-lg font-bold text-white flex items-center gap-2.5">
            <Lock className="w-5 h-5 text-[#00ff66]" />
            <span>3. İzole & Kum Havuzu (Sandbox) HTML Görüntüleme</span>
          </h2>
          <p className="text-[#cbd5e1] leading-relaxed font-normal">
            Gelen e-postaların içindeki potansiyel zararlı betikler (XSS, kötü amaçlı scriptler) tarayıcınızda çalıştırılmaz. E-posta içerikleri kum havuzlu (sandboxed iframe) ortamında güvenli bir şekilde render edilir.
          </p>
        </section>

        <section className="space-y-3 border-t border-[#1f222b] pt-6">
          <h2 className="text-lg font-bold text-white flex items-center gap-2.5">
            <Server className="w-5 h-5 text-[#00f0ff]" />
            <span>4. Yalnızca Gelen Kutusu (Receive-Only) Koruması</span>
          </h2>
          <p className="text-[#cbd5e1] leading-relaxed font-normal">
            Sunucumuz üzerinden spam veya yetkisiz e-posta gönderimi yapılmasını önlemek amacıyla giden e-posta (Outbound SMTP) iletişimi tamamen devre dışıdır. Bu sayede platformumuz spam ağları tarafından suistimal edilemez.
          </p>
        </section>
      </div>
    </div>
  );
}
