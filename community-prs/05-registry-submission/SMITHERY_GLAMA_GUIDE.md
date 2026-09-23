# Smithery.ai, Glama.ai, npm ve PyPI Yayınlama ve Listeleme Kılavuzu

Bu kılavuz, `gecici-email-mcp` paketini resmi MCP kayıt dizinlerine (Smithery ve Glama) ve genel paket yöneticilerine (npm, PyPI) eklemek için gereken tüm adımları ve tek satırlık komutları içerir.

---

## 1. 🐙 Ön Koşul: GitHub Deposu Oluşturma & Push

Smithery.ai ve Glama.ai, MCP sunucularını doğrudan GitHub reposu üzerinden doğrular ve periyodik olarak senkronize eder.

Terminalinizde hazır bulunan `codeonthetable` GitHub hesabınızla:

```bash
# 1. Proje ana dizininde:
cd "/Users/bahadirdavdav/Desktop/Gemini Proje/gecici-email"

# 2. GitHub üzerinde 'gecici-email' isimli public bir repo açın:
# https://github.com/new -> Repository name: gecici-email -> Create repository

# 3. Uzak depoyu bağlayın ve gönderin:
git remote add origin git@github.com:codeonthetable/gecici-email.git
git branch -M main
git push -u origin main
```

---

## 2. ⚡ Smithery.ai Kayıt ve Listeleme

Smithery.ai, Claude Desktop ve Cursor kullanıcılarının MCP araçlarını tek tıkla kurduğu en büyük dizindir.

Depomuzdaki `mcp/smithery.yaml` ve `mcp/Dockerfile` dosyaları Smithery v4 standardına %100 uyumludur.

### Yöntem A: Smithery Web Paneli (En Kolay)
1. **[smithery.ai](https://smithery.ai)** adresine gidin.
2. Sağ üstten **Sign in with GitHub** ile giriş yapın (`codeonthetable`).
3. **Submit Server** veya **Add Server** butonuna tıklayın.
4. Repo URL'si olarak: `https://github.com/codeonthetable/gecici-email` girin ve subdirectory olarak `mcp` seçin (veya repo doğrudan MCP ise kök dizin).
5. Smithery otomatik olarak `smithery.yaml` dosyasını okur, araçları (`gecici_create_inbox`, `gecici_wait_for_otp` vb.) listeler ve sunucu sayfanızı saniyeler içinde yayına alır!

### Yöntem B: Smithery CLI ile Doğrudan Yayınlama
```bash
# 1. Smithery CLI ile oturum açın:
npx -y @smithery/cli auth login

# 2. MCP dizininde paketi yayınlayın:
cd "/Users/bahadirdavdav/Desktop/Gemini Proje/gecici-email/mcp"
npx -y @smithery/cli mcp publish . -n codeonthetable/gecici-email
```

Yayınlandıktan sonra dünya genelindeki tüm kullanıcılar şu komutla tek satırda yükleyebilir:
```bash
npx -y @smithery/cli install gecici-email-mcp --client claude
```

---

## 3. 🛡️ Glama.ai Kayıt ve Listeleme

Glama.ai, MCP sunucularını izole Firecracker microVM'ler üzerinde otomatik derleyip test eden ve doğrulayan kurumsal MCP kataloğudur.

1. **[glama.ai/mcp/servers](https://glama.ai/mcp/servers)** adresine gidin.
2. **Add Server** butonuna tıklayın.
3. GitHub OAuth ile `codeonthetable` hesabınızı bağlayın.
4. `codeonthetable/gecici-email` reposunu seçin.
5. Glama, repomuzdaki `mcp/Dockerfile` dosyasını kullanarak otomatik derleme (build) ve stdio health-check testini çalıştıracaktır.
6. Test tamamlandığında `gecici.email` resmi Glama dizininde listelenir ve 1-Click Gateway URL'si atanır.

---

## 4. 📦 npm Paketlerini Yayınlama (`gecici-email-mcp` ve `gecici-email`)

Paketlerin `npx -y gecici-email-mcp` veya `npm i gecici-email` ile dünyaca kurulabilmesi için:

```bash
# 1. npm hesabınızla oturum açın (yoksa www.npmjs.com üzerinden ücretsiz açın):
npm login

# 2. MCP Sunucusunu yayınlayın:
cd "/Users/bahadirdavdav/Desktop/Gemini Proje/gecici-email/mcp"
npm publish --access public

# 3. TypeScript SDK'sını yayınlayın:
cd "/Users/bahadirdavdav/Desktop/Gemini Proje/gecici-email/sdk/typescript"
npm publish --access public
```

---

## 5. 🐍 PyPI Python Paketini Yayınlama (`gecici-email`)

Python geliştiricilerinin `pip install gecici-email` yazabilmesi için:

```bash
# 1. Twine aracını yükleyin:
pip3 install twine

# 2. Python SDK dizinine geçin:
cd "/Users/bahadirdavdav/Desktop/Gemini Proje/gecici-email/sdk/python"

# 3. Paketi PyPI'ye yükleyin:
twine upload dist/*
# (PyPI kullanıcı adınız veya API token'ınız istendiğinde girin: __token__ ve pypi-xxx)
```
