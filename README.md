# gecici.email — indirip çalıştırılabilir geçici e-posta uygulaması

[Web’de kullan](https://gecici.email) · [AI ajanı/MCP rehberi](https://gecici.email/ai-ajanlar) · [REST API](https://gecici.email/api-dokuman) · [Gizlilik](https://gecici.email/gizlilik-ve-guvenlik)

gecici.email, insanlara ve AI ajanlarına yetkili geliştirme ve test işlerinde kullanabilecekleri kısa ömürlü, yalnızca alıcı e-posta kutuları sunar. Hizmet ücretsizdir.

## GitHub’dan indirip çalıştır

Python 3.9 veya üzeri gerekir. Masaüstü penceresi Python’un Tkinter modülünü kullanır; macOS/Windows Python kurulumlarında genellikle bulunur, bazı Linux dağıtımlarında `python3-tk` ayrıca gerekir. Terminal sürümü yalnızca Python standart kütüphanesini kullanır. İnternet bağlantısı ve canlı gecici.email hizmeti gerekir.

```sh
git clone https://github.com/codeonthetable/gecici-email.git
cd gecici-email
python3 desktop.py
```

Windows’ta son komut `py desktop.py` olabilir. Git kurulu değilse GitHub’daki **Code → Download ZIP** ile indirin, arşivi açın ve klasörde aynı komutu çalıştırın. Pencere açılmayan sunucu/terminal ortamında `python3 app.py` kullanın. İki uygulama da kutu açar, gelen iletileri ve OTP/linkleri gösterir, süreyi uzatır ve kutuyu siler.

Yeni kutunun erişim tokenı yalnızca oluşturulurken gösterilir. Uygulama tokenı diske yazmaz; daha sonra aynı kutuya dönmek için tokenı güvenli bir yerde saklayın. E-posta içindeki bağlantılar otomatik açılmaz. Uygulama yalnızca **canlı hizmete bağlanan istemcidir**; GitHub’dan indirip çevrimdışı posta sunucusu kurmazsınız.

Katkı veya yerel kontrol için testler: `python3 -m unittest discover -s tests -v`. Uygulama başka servislerin CAPTCHA veya doğrulama süreçlerini aşmaz; yalnızca kendi kutunuza ulaşmış postayı gösterir.

Bu depoda açık olan kaynak, yalnızca `app.py` istemcisi ve entegrasyon belgeleridir. Ürünün sunucu, web, posta altyapısı ve diğer özel kaynak kodları burada bulunmaz. Depodaki MIT lisansı sadece bu açık istemci ve belgelere uygulanır; barındırılan hizmete veya özel ürün koduna uygulanmaz.

## Claude’a ekle

Claude’da **Customize → Connectors → + → Add custom connector** yolunu açıp uzak MCP adresi olarak şunu girin:

```text
https://gecici.email/mcp
```

Bağlayıcıyı ilgili konuşmada etkinleştirin. Claude’un güncel menüleri ve plan erişimi için [resmî özel bağlayıcı kılavuzuna](https://support.claude.com/en/articles/11175166-get-started-with-custom-connectors-using-remote-mcp) bakın. Bu işlem GitHub kaynak kodunu Claude’a yüklemez.

## Diğer AI ajanları ve geliştiriciler

Uzak *Streamable HTTP MCP* destekleyen istemciye aynı `https://gecici.email/mcp` URL’sini ekleyin. REST isteyen istemciler `https://gecici.email/api/v1` adresini ve [REST örneklerini](docs/REST.md) kullanabilir. Çalışma akışı:

1. `gecici_create_inbox` ile kutu oluşturun; adres, erişim tokenı ve süreyi alın.
2. Yalnızca adresi, kullanmaya yetkili olduğunuz test akışına verin.
3. İletileri, OTP’yi veya doğrulama bağlantısını adres **ve token** ile okuyun. Boş kutu veya bulunamayan kod başarı sayılmaz.

Tokenı üçüncü taraf sitelere, herkese açık istemlere veya loglara koymayın. Araç bağlantıyı çıkarır; bağlantıyı otomatik açmaz. Hizmet CAPTCHA/kimlik doğrulama atlatmaz ve dış göndericilerden e-posta teslimini garanti etmez. Hassas hesaplar veya gerçek kullanıcı verileri için kullanmayın.

Manuel seçilen adresler 4–32 ASCII karakter, en az bir rakam ve içeride `-`, `_` veya `.` gerektirir; resmî/korumalı adlar ayrı tutulur. Rastgele adres oluşturma bu koşula bağlı değildir. Varsayılan kutu ömrü 60 dakikadır. Saklama ve silme sınırları [gizlilik sayfasında](https://gecici.email/gizlilik-ve-guvenlik) açıklanır.

## In English

gecici.email is a free, receive-only temporary inbox service for people and AI agents in authorized development and QA workflows. Add `https://gecici.email/mcp` as a remote MCP connector, or use the [REST API](https://gecici.email/api-dokuman). Inbox creation returns an address and access token; all reads require that token. No account, source download, or unpublished npm/PyPI package is required. Do not use it for sensitive accounts or real user data. External email delivery is not guaranteed.

Download and run the desktop app with `python3 desktop.py` (Python 3.9+ and Tkinter), or the terminal client with `python3 app.py`. Both connect to the hosted service. This repository does not include the mail server or product implementation. The repository license applies only to these public clients and documentation, not to the hosted service or private source code.
