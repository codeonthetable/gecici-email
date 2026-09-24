# Anthropic Claude Marketplace & Connectors Directory Başvuru Kiti

Bu belge, **Anthropic**'in 23 Eylül 2026 tarihinde duyurduğu resmi **Claude Marketplace** (`claude.com/marketplace`) ve Claude Connectors Directory için `gecici.email` başvuru ve yayınlama kılavuzudur.

---

## 🎯 1. Claude Marketplace Nedir & Nerede Konumlanıyoruz?

Anthropic, Claude Marketplace'i 3 ana dikeyde konumlandırmıştır:
1. **Connectors & Plugins (MCP - Model Context Protocol):** Claude'un harici araçlara ve API'lere bağlanmasını sağlayan ekosistem katmanı. (Slack, Notion, GitHub vb.)
2. **Agents & Products:** Claude tabanlı kurumsal ürün ve SaaS çözümleri (Cursor, Snowflake, Replit, Lovable).
3. **Service Partners:** Kurumsal entegrasyon danışmanları (Accenture, Deloitte, BCG).

👉 **`gecici.email` doğrudan 1. Kategoriye ("Connectors & Plugins") tam uyumludur!**  
Claude'un web sitelerinde veya otomatik test süreçlerinde en çok tıkandığı nokta **"E-posta Onayı & SMS/OTP Doğrulama Kodu"** adımıdır. `gecici-email` MCP eklentisi sayesinde Claude, hiçbir insan müdahalesine gerek kalmadan anlık geçici kutu açıp OTP kodunu alarak işlemlerini tamamlayabilir.

---

## 📝 2. Claude Marketplace Partner Başvuru Formu & Hazır Yanıtları

Doğrudan Başvuru Sayfası: **[https://claude.com/marketplace-partners](https://claude.com/marketplace-partners)**  
*(Not: Form HubSpot altyapısıyla yüklendiği için tarayıcınızdaki AdBlock / Reklam Engelleyici kapalı olmalıdır.)*

### Form Alanları ve Doldurulacak Bilgiler:

| Form Alanı | Soru / Etiket | Bizim Yanıtımız |
| :--- | :--- | :--- |
| **First name** | Adınız | *(Kendi adınız)* |
| **Last name** | Soyadınız | *(Kendi soyadınız)* |
| **Business email** | Kurumsal E-posta | `support@gecici.email` (veya kendi e-postanız) |
| **Job title** | Unvanınız | `Founder / Software Engineer` |
| **Company name** | Şirket / Proje Adı | `gecici.email` |
| **Country** | Ülke | `Turkey` |
| **Is your product built on Claude today?** | Ürününüz Claude üzerinde mi kurulu? | **Yes** *(MCP connector ve Claude entegrasyonumuz aktif)* |
| **Target customer / use case** | Hedef Müşteri & Kullanım Senaryosu | *Aşağıdaki hazır metin* |
| **Industry** | Sektör | `Software` |
| **Anthropic Organization UUID** | Anthropic Hesap Kimliği | *(Opsiyonel - platform.claude.com ayarlarınızdan kopyalayabilirsiniz)* |

### "Target customer / use case" İçin Hazır Metin (Kopyala & Yapıştır):
> "Autonomous disposable email inbox and smart OTP/verification code extraction MCP server for Claude and AI Agents. Target customers are AI developers, QA automation teams, and Claude users who build autonomous web agents (browser-use, Claude Code, SaaS onboarding). Enables Claude to bypass email verification roadblocks automatically without human intervention. Live at https://gecici.email and https://gecici.email/mcp"


### Kısa Açıklama (One-line summary - Max 120 chars)
> Autonomous disposable email inbox and smart OTP code extraction connector for Claude and AI Agents.

### Detaylı Açıklama (Detailed Pitch - 250 words)
> **Problem:** Autonomous AI agents running on Claude often get blocked during web navigation, SaaS onboarding, account creation, or QA testing when a workflow requires email verification or a one-time password (OTP). Human intervention is typically required, breaking the agent's autonomy.
> 
> **Solution:** `gecici.email` provides an enterprise-ready, zero-log, transient email infrastructure accessible directly by Claude via the Model Context Protocol (MCP). Claude can invoke `create_inbox`, paste the generated address into any signup form, and run `wait_for_otp` to immediately receive the 4–8 digit verification code or activation link parsed by our real-time smart regex engine.
> 
> **Key Capabilities:**
> - Zero credentials / zero friction setup for end-users.
> - High-performance receive-only inbound SMTP (RFC 5322) with milisecond SSE streaming.
> - Multilingual OTP & activation link extractor (EN, TR, DE, FR).
> - Strict 60-minute in-memory TTL; zero persistent logs, ensuring GDPR & privacy compliance.
> - Already integrated with Smithery.ai, Glama.ai, and official browser-use PR (#5890).

---

## ⚡ 3. Claude Kullanıcıları İçin Anında Kurulum (Self-Serve)

Marketplace resmi onayı beklenirken, Claude kullanıcıları ve geliştiricileri sunucuyu anında aşağıdaki şekillerde kullanabilir:

### A) Claude Desktop Konfigürasyonu (`claude_desktop_config.json`)

**macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`  
**Windows:** `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "gecici-email": {
      "command": "npx",
      "args": ["-y", "gecici-email-mcp"]
    }
  }
}
```

*Veya uzaktan canlı Streamable HTTP / SSE protokolü ile:*
```json
{
  "mcpServers": {
    "gecici-email": {
      "url": "https://gecici.email/mcp"
    }
  }
}
```

### B) Claude Code (CLI) Konfigürasyonu
```bash
claude mcp add gecici-email -- npx -y gecici-email-mcp
```

---

## 🌐 4. Resmi MCP Registry Kaydı (`registry.modelcontextprotocol.io`)

Anthropic ve açık kaynak MCP topluluğunun ortak merkezi kayıt defterine `mcp/server.json` manifestomuz eklenmiştir:

1. Paket `npm` üzerinde: `gecici-email-mcp`
2. Kayıt dosyası: `mcp/server.json`
3. Yayınlama komutu:
   ```bash
   npx @modelcontextprotocol/publisher publish
   ```
Bu sayede sadece Claude değil, Cursor, Windsurf ve MCP destekleyen tüm istemciler `gecici.email`'i doğrudan arayıp tek tıkla yükleyebilir.
