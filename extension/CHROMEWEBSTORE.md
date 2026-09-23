# Chrome Web Store Submission Guide — gecici.email

> **Single Source of Truth** for the Chrome Web Store Developer Dashboard listing, permissions justifications, and privacy disclosures.

---

## 1. Store Listing Information

- **Item Name**: gecici.email — Tek Kullanımlık Geçici E-posta
- **Short Name**: gecici.email
- **Summary / Short Description** (Max 132 chars):
  Tek tıkla izsiz geçici e-posta üretin, gelen kutunuzu izleyin ve doğrulama kodlarını (OTP) anında kopyalayın.
- **Category**: Productivity / Tools
- **Default Language**: Turkish (tr) / Secondary: English (en)

### Detailed Description (Markdown for Store Listing):
```markdown
gecici.email, kişisel e-posta adresinizi spam bültenlerinden, şüpheli sitelerden ve veri sızıntılarından koruyan modern, hızlı ve izsiz bir geçici e-posta uzantısıdır.

Özellikler:
★ Tek Tıkla Yeni Adres: Kayıt olmadan, şifre belirlemeden hemen @gecici.email uzantılı adresinizi alın.
★ Akıllı OTP & Doğrulama Kodu Ayrıştırıcı: Gelen postadaki 4-8 haneli güvenlik kodunu (SMS/OTP) otomatik ayıklar, tek tıkla kopyalamanızı sağlar.
★ Canlı Gelen Kutusu Bildirimleri: Yeni e-posta ulaştığında uzantı simgesi üzerinde okunmamış posta sayısı görünür ve masaüstü bildirimi iletilir.
★ Özel Kanal İsimleri: "+ ÖZEL" butonunu kullanarak dilediğiniz kullanıcı adıyla geçici kutu oluşturabilirsiniz.
★ Sıfır Günlük (Zero-Log) & Ephemeral Bellek: E-postalarınız yalnızca 60 dakika saklanır ve sürenin sonunda RAM bellekten kalıcı olarak silinir.
★ Güvenli ve Bağımsız Altyapı: Üçüncü parti antispam filtrelerine takılmayan bağımsız Inbound SMTP sunucusu ile en zorlu doğrulama kodları dahi anında elinize ulaşır.

Kullanım Alanları:
- Forum ve web sitesi üyelikleri
- Discord, Steam, Twitter (X), Instagram güvenlik kodları
- Deneme sürümleri ve indirim kuponu kazanımları
- Yazılım ve QA test süreçleri

Resmi Web Konsolu: https://gecici.email
Gizlilik Politikası: https://gecici.email/gizlilik-ve-guvenlik
```

---

## 2. Permissions Justification (For Review Team)

| Permission | Technical Need | Plain-English Review Justification |
| :--- | :--- | :--- |
| `storage` | `chrome.storage.local` | Stores the user's currently active disposable email address and timestamp locally so the inbox persists between browser sessions and popup closures. |
| `alarms` | `chrome.alarms` | Schedules a lightweight 1-minute periodic background check to verify whether a new email or verification code has arrived for the active temporary inbox. |
| `notifications` | `chrome.notifications` | Sends an instant desktop notification alerting the user with the extracted OTP verification code when a new email arrives. |
| `host_permissions: https://gecici.email/*` | Network requests | Connects securely to the official gecici.email REST and Server-Sent Events (SSE) API to generate disposable inboxes and fetch incoming message streams. |

---

## 3. Privacy & Data Use Disclosure

- **Does this extension collect user data?** No.
- **Does it sell personal data to third parties?** No.
- **Does it transfer data for reasons unrelated to core functionality?** No.
- **Does it use data for creditworthiness or lending?** No.
- **Single Purpose Declaration**: The single purpose of gecici.email is to generate ephemeral disposable email addresses and display incoming messages/OTPs to protect user privacy.

---

## 4. Packaging for Chrome Web Store

To create the production zip file ready for developer dashboard upload:

```bash
cd "/Users/bahadirdavdav/Desktop/Gemini Proje/gecici-email"
zip -r gecici-email-extension.zip extension -x "*.DS_Store" "extension/CHROMEWEBSTORE.md"
```
