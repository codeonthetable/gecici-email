# REST API ile entegrasyon

Temel URL: `https://gecici.email/api/v1` · [tam API referansı](https://gecici.email/api-dokuman)

```sh
# Rastgele test kutusu oluşturur; yanıtta address, token ve expiresAt bulunur.
curl -sS -X POST https://gecici.email/api/v1/inbox/generate

# Kendi test akışınıza gönderilen iletileri tokenla okur.
curl -sS -H 'Authorization: Bearer <token>' \
  'https://gecici.email/api/v1/inbox/<address>/messages'

# Kod ayıklanmışsa döner; henüz yoksa başarısız/boş sonucu doğru işleyin.
curl -sS -H 'Authorization: Bearer <token>' \
  'https://gecici.email/api/v1/inbox/<address>/otp'
```

`<address>` tam e-posta adresidir ve URL içinde kodlanmalıdır. `<token>` yalnızca kutu oluşturma yanıtından alınır; örnek değeri gerçek token değildir. Tokenı kod deposuna, herkese açık sohbetlere, istemci tarafı analitiğe veya üçüncü taraf test sitesine göndermeyin.

Elle ad seçmek isterseniz `POST /inbox/custom` gövdesi `{"prefix":"qa-ornek-1"}` olabilir. İsim 4–32 ASCII karakterden oluşmalı, rakam ve `-`, `_` veya `.` içermelidir; ayrılmış resmî adlar kullanılamaz. Genel kullanımda rastgele kutu daha kolaydır.

Mesajın ulaşması, göndericinin davranışına ve posta akışına bağlıdır. İleti/OTP bulunmaması başarı ya da teslim kanıtı değildir. Yetkili geliştirme ve QA amaçları dışında, hassas hesaplarda veya gerçek kişilerin verilerinde kullanmayın.
