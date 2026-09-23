import React from 'react';
import type { Metadata } from 'next';
import { Shield, Lock, EyeOff, Trash2, Server } from 'lucide-react';
import AdPlaceholder from '../../components/AdPlaceholder';

export const metadata: Metadata = {
  title: 'Gizlilik ve Güvenlik Politikası - gecici.email',
  description: 'gecici.email gizlilik prensipleri, KVKK / GDPR uyumluluğu, sıfır log politikası ve veri güvenliği önlemleri.',
};

export default function PrivacyPage() {
  return (
    <div className="py-12 space-y-12 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-xs font-semibold">
          <Shield className="w-4 h-4 text-blue-500" />
          <span>Gizlilik & Veri Güvenliği</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Gizlilik ve Güvenlik Politikası
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Son Güncelleme: Eylül 2026 • KVKK ve GDPR Standartlarına %100 Uyumlu
        </p>
      </div>

      <AdPlaceholder slotType="leaderboard" />

      <div className="bg-white dark:bg-[#0f1422] rounded-3xl border border-slate-200/80 dark:border-slate-800 p-8 space-y-8 text-slate-700 dark:text-slate-300 text-sm leading-relaxed shadow-sm">
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <EyeOff className="w-5 h-5 text-brand-500" />
            1. Sıfır Günlük (Zero-Log) İlkesi
          </h2>
          <p>
            gecici.email, kullanıcılarının gizliliğine mutlak saygı duyar. Servisimizi kullanırken kimliğinizi belirtebilecek hiçbir kişisel bilgi, IP adresi, konum veya tarayıcı parmak izi kaydedilmez veya üçüncü şahıslarla paylaşılmaz.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Trash2 className="w-5 h-5 text-red-500" />
            2. Otomatik Bellek Temizliği (TTL Ömrü)
          </h2>
          <p>
            Oluşturulan her gelen kutusu ve alınan e-postalar yalnızca geçici RAM bellekte tutulur. Varsayılan saklama süresi 60 dakikadır. Bu süre sona erdiğinde ya da kullanıcı arayüz üzerinden silme işlemini tetiklediğinde, tüm veriler kalıcı olarak yok edilir.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Lock className="w-5 h-5 text-emerald-500" />
            3. İzole & Kum Havuzu (Sandbox) HTML Görüntüleme
          </h2>
          <p>
            Gelen e-postaların içindeki potansiyel zararlı betikler (XSS, kötü amaçlı scriptler) tarayıcınızda çalıştırılmaz. E-posta içerikleri kum havuzlu (sandboxed iframe) ortamında güvenli bir şekilde render edilir.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Server className="w-5 h-5 text-indigo-500" />
            4. Yalnızca Gelen Kutusu (Receive-Only) Koruması
          </h2>
          <p>
            Sunucumuz üzerinden spam veya yetkisiz e-posta gönderimi yapılmasını önlemek amacıyla giden e-posta (Outbound SMTP) iletişimi tamamen devre dışıdır. Bu sayede platformumuz spam ağları tarafından suistimal edilemez.
          </p>
        </section>
      </div>
    </div>
  );
}
