# Chrome Web Store Submission Guide — gecici.email

> **Single Source of Truth** for the Chrome Web Store Developer Dashboard listing, permissions justifications, and privacy disclosures.

---

## 1. Store Listing Information

- **Item Name**: gecici.email — Tek Kullanımlık Geçici E-posta & OTP
- **Short Name**: gecici.email
- **Version**: 1.1.0
- **Summary / Short Description** (Max 132 chars):
  Tek tıkla izsiz geçici e-posta üretin, formlara sağ tıkla otomatik yapıştırın ve OTP doğrulama kodlarını anında yakalayın.
- **Category**: Productivity / Developer Tools
- **Default Language**: Turkish (tr) / Secondary: English (en)

### Detailed Description (Markdown for Store Listing):
```markdown
gecici.email, kişisel e-posta adresinizi spam bültenlerinden, şüpheli sitelerden ve veri sızıntılarından koruyan modern, hızlı ve izsiz bir geçici e-posta uzantısıdır.

Öne Çıkan Özellikler:
★ Sağ Tık ile Otomatik Doldurma: Herhangi bir web sitesinde kayıt olurken e-posta kutucuğuna sağ tıklayın; tek tıkla yeni adres oluşturup form alanına otomatik yapıştırın.
★ Akıllı OTP & Doğrulama Kodu Ayrıştırıcı: Gelen postadaki 4-8 haneli güvenlik kodunu (SMS/OTP) arka planda otomatik ayıklar, anında masaüstü bildirimiyle haber verir.
★ Canlı Gelen Kutusu Bildirimleri: Yeni e-posta ulaştığında uzantı simgesi üzerinde okunmamış sayısı görünür.
★ Retro Donanım Konsolu (Teenage Engineering): Geri sayım sayacı (60 dk TTL), özel kanal isimleri (+ ÖZEL) ve şık LCD gösterge.
★ Chrome Yan Panel (Side Panel) Desteği: Sekmeler arasında kaybolmadan gelen e-postaları ekranın sağ tarafında canlı izleyin.
★ Sıfır Günlük (Zero-Log) & Ephemeral Bellek: E-postalarınız yalnızca 60 dakika saklanır ve sürenin sonunda RAM bellekten kalıcı olarak silinir.
★ Bağımsız Port 25 SMTP Altyapısı: Üçüncü parti antispam filtrelerine takılmayan bağımsız Inbound SMTP sunucusu ile en zorlu doğrulama kodları dahi anında elinize ulaşır.

Kullanım Alanları:
- Web sitesi, forum ve topluluk üyelikleri
- Discord, Steam, Twitter (X), Instagram güvenlik kodları
- Deneme sürümleri ve indirim kuponu kazanımları
- Yazılım ve QA test süreçleri

Resmi Web Konsolu: https://gecici.email
Gizlilik Politikası: https://gecici.email/gizlilik-ve-guvenlik
Açık Kaynak Kod: https://github.com/codeonthetable/gecici-email
```

---

## 2. Permissions Justification (For Review Team)

| Permission | Technical Need | Plain-English Review Justification |
| :--- | :--- | :--- |
| `storage` | `chrome.storage.local` | Stores the user's currently active disposable email address and TTL timestamp locally so the inbox persists across browser sessions and popup reopens. |
| `alarms` | `chrome.alarms` | Schedules a lightweight 1-minute periodic background check to verify whether a new email or verification code has arrived for the active temporary inbox. |
| `notifications` | `chrome.notifications` | Sends an instant desktop notification alerting the user with the extracted OTP verification code when a new email arrives. |
| `contextMenus` | `chrome.contextMenus` | Provides a convenient right-click menu item on editable form inputs ("✉️ gecici.email: Adres Üret & Yapıştır") allowing users to autofill temporary addresses with zero friction. |
| `activeTab` | `chrome.tabs` (user gesture) | Grants temporary script execution rights to the active tab only when the user explicitly clicks the right-click autofill context menu item. |
| `scripting` | `chrome.scripting.executeScript` | Inserts the generated disposable email address into the currently focused input element when the user triggers the context menu action. |
| `sidePanel` | `chrome.sidePanel` | Allows users and QA testers to dock the disposable email console as a persistent side panel while browsing or testing multiple tabs. |
| `host_permissions: https://gecici.email/*` | Network requests | Connects securely to the official gecici.email REST and Server-Sent Events (SSE) API to generate disposable inboxes and fetch incoming message streams. |

---

## 3. Privacy & Data Use Disclosure

- **Does this extension collect user data?** No. Zero analytics, zero trackers.
- **Does it sell personal data to third parties?** No.
- **Does it transfer data for reasons unrelated to core functionality?** No.
- **Does it use data for creditworthiness or lending?** No.
- **Single Purpose Declaration**: The single purpose of gecici.email is to generate ephemeral disposable email addresses, autofill signup forms on user request, and display incoming OTP verification codes to protect user privacy.

---

## 4. Packaging for Chrome Web Store & Distribution

To create the production zip archive with `manifest.json` at the root of the archive:

```bash
cd "/Users/bahadirdavdav/Desktop/Gemini Proje/gecici-email/extension"
zip -r ../gecici-email-extension.zip . -x "*.DS_Store" "CHROMEWEBSTORE.md"
cp ../gecici-email-extension.zip ../web/public/gecici-email-extension.zip
```
