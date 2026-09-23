export interface UseCaseData {
  slug: string;
  serviceName: string;
  badge: string;
  iconBg: string;
  title: string;
  h1: string;
  metaTitle: string;
  metaDescription: string;
  heroSubtitle: string;
  targetDomainExample: string;
  quickSteps: { step: string; title: string; desc: string }[];
  guideTitle: string;
  guideParagraphs: string[];
  features: { title: string; desc: string }[];
  faqs: { q: string; a: string }[];
}

export const USE_CASES: Record<string, UseCaseData> = {
  'discord-gecici-eposta': {
    slug: 'discord-gecici-eposta',
    serviceName: 'Discord',
    badge: 'DISCORD_GATEWAY // AUTO-EXTRACT',
    iconBg: '#5865F2',
    title: 'Discord İçin Geçici E-posta ve Anında Onay Kodu',
    h1: 'Discord İçin Tek Kullanımlık Geçici E-posta & Doğrulama İstasyonu',
    metaTitle: 'Discord İçin Geçici E-posta — Anında Doğrulama Kodu Al | gecici.email',
    metaDescription: 'Discord hesap kaydı ve sunucu onayları için izsiz, 6 haneli doğrulama kodunu milisaniyede yakalayan bağımsız geçici e-posta konsolu.',
    heroSubtitle: 'Discord kayıt ve sunucu güvenlik doğrulamalarında gerçek gelen kutunuzu spamdan koruyun. 6 haneli Discord onay kodu geldiği anda ekranda parlar.',
    targetDomainExample: 'notifications@discord.com',
    quickSteps: [
      { step: '01', title: 'Adresinizi Kopyalayın', desc: 'Yukarıdaki konsolda üretilen @gecici.email adresini tek tıkla kopyalayın.' },
      { step: '02', title: 'Discord Kaydına Yapıştırın', desc: 'Discord web veya uygulamasındaki e-posta alanına yapıştırıp devam edin.' },
      { step: '03', title: 'OTP Kodunu Anında Alın', desc: 'Gelen 6 haneli kod teleprinter şeridinde otomatik ayrıştırılarak karşınıza çıkar.' }
    ],
    guideTitle: 'Neden Discord Kayıtlarında Geçici E-posta Kullanmalısınız?',
    guideParagraphs: [
      'Discord, sunucu katılımlarında ve hesap güvenlik adımlarında e-posta doğrulaması talep eder. Ancak ana kişisel e-posta adresinizi kullanmak, ilerleyen süreçte sunucu bildirimleri, promosyon bültenleri ve veri sızıntısı riskleriyle karşılaşmanıza neden olabilir.',
      'gecici.email, Discord\'un bildirim sunucularından gelen e-postaları doğrudan Frankfurt merkezli Port 25 Inbound SMTP ağ geçidinde karşılar. Özel SmartExtractor motoru sayesinde postanın içindeki 6 haneli güvenlik kodunu otomatik tespit eder ve sayfanızı yenilemenize gerek kalmadan canlı akışla size sunar.'
    ],
    features: [
      { title: 'Otomatik Kod Yakalama', desc: 'Discord doğrulama kodları tek tıkla kopyalanabilir buton olarak sunulur.' },
      { title: 'Sıfır Günlük Politikası', desc: 'Doğrulama işlemi bittikten 60 dakika sonra tüm izler RAM bellekten kalıcı olarak silinir.' },
      { title: 'Anti-Spam Filtre Engeli Yok', desc: 'Bağımsız sunucu omurgası sayesinde hiçbir Discord e-postası kaybolmaz veya spam klasörüne düşmez.' }
    ],
    faqs: [
      { q: 'Discord bu geçici e-posta adresini kabul eder mi?', a: 'Evet. gecici.email bağımsız özel bir alan adına sahip olduğu için genel kara listelere takılmaz ve Discord kayıtlarında sorunsuz kabul edilir.' },
      { q: 'Doğrulama kodunun gelmesi ne kadar sürer?', a: 'Discord e-postayı yolladığı andan itibaren ortalama 1-3 saniye içinde konsolunuza sesli uyarıyla düşer.' },
      { q: 'Hesabımı daha sonra tekrar doğrulamam gerekirse ne yapmalıyım?', a: 'Konsoldan "+30 DK" butonuna basarak süreyi uzatabilir veya "+ ÖZEL İSİM" ile Discord için belirlediğiniz sabit kullanıcı adını daha sonra tekrar açabilirsiniz.' }
    ]
  },

  'steam-onay-kodu-epostasi': {
    slug: 'steam-onay-kodu-epostasi',
    serviceName: 'Steam',
    badge: 'STEAM_GUARD // INSTANT_AUTH',
    iconBg: '#1b2838',
    title: 'Steam Kayıt ve Guard Doğrulama İçin Geçici E-posta',
    h1: 'Steam İçin Geçici E-posta — Kayıt ve Hesap Aktivasyon Konsolu',
    metaTitle: 'Steam İçin Geçici E-posta — Steam Guard & Kayıt Onay Kodu | gecici.email',
    metaDescription: 'Steam hesap açılışı ve aktivasyon linkleri için hızlı, güvenli, izsiz geçici e-posta servisi. Onay linkini tek tıkla açın.',
    heroSubtitle: 'Steam yedek hesapları veya deneme oyunları için kişisel gelen kutunuzu temiz tutun. Aktivasyon bağlantısı anında filtrelenip ekranda açılır.',
    targetDomainExample: 'support@steampowered.com',
    quickSteps: [
      { step: '01', title: 'Adres Alın', desc: 'Konsoldan tek tıkla Steam için geçici bir adres üretin.' },
      { step: '02', title: 'Steam Formuna Girin', desc: 'Steam hesap oluşturma sayfasında adresi ilgili alana yapıştırın.' },
      { step: '03', title: 'Hesabınızı Doğrulayın', desc: 'Gelen Steam postasındaki "Hesabımı Doğrula" butonuna doğrudan konsoldan tıklayın.' }
    ],
    guideTitle: 'Steam Hesap Açılışlarında Geçici E-posta Avantajları',
    guideParagraphs: [
      'Steam oyuncuları sık sık yan hesaplar (smurf, takas veya test hesapları) oluşturma ihtiyacı duyar. Her yeni hesap için yeni bir kalıcı Gmail veya Outlook açmak hem zahmetli hem de telefon numarası onayı gibi engellere tabidir.',
      'gecici.email ile hiçbir şifre veya kayıt gerekmeden saniyeler içinde Steam onay e-postasını alabilir, aktivasyon butonuna tıklayarak hesabınızı derhal aktif hale getirebilirsiniz.'
    ],
    features: [
      { title: 'Aktivasyon Linki Ayıklayıcı', desc: 'Steam aktivasyon e-postasındaki onay butonu doğrudan öne çıkarılır.' },
      { title: 'Steam Guard Desteği', desc: 'Girişlerde gelen 5 haneli Steam Guard kodları anında görünür.' },
      { title: 'Hızlı ve Reklamsız Deneyim', desc: 'Sıfır sayfa kayması ile en yüksek hızda oyununuza odaklanın.' }
    ],
    faqs: [
      { q: 'Steam aktivasyon linkine konsoldan tıklayabilir miyim?', a: 'Evet, gelen kutusundaki onay butonuna doğrudan tıklayarak Steam web doğrulamasını tamamlayabilirsiniz.' },
      { q: 'Steam Guard kodları da geliyor mu?', a: 'Kesinlikle. Hem standart hesap aktivasyonu hem de Steam Guard güvenlik kodları anında konsola basılır.' }
    ]
  },

  'twitter-icin-gecici-mail': {
    slug: 'twitter-icin-gecici-mail',
    serviceName: 'Twitter / X',
    badge: 'X_CORP // SIGNUP_FLOW',
    iconBg: '#000000',
    title: 'Twitter / X Kayıt İçin Geçici E-posta ve Kod Yakalama',
    h1: 'Twitter (X) İçin Tek Kullanımlık E-posta — Onay Kodu Konsolu',
    metaTitle: 'Twitter / X İçin Geçici E-posta — Hesap Onay Kodu Al | gecici.email',
    metaDescription: 'Twitter (X) hesabı açmak için izsiz ve bağımsız tek kullanımlık e-posta istasyonu. Doğrulama kodunuz anında hazır.',
    heroSubtitle: 'Twitter (X) sosyal medya hesaplarınız için ana e-postanızı gizli tutun, spam bildirimlerden kurtulun.',
    targetDomainExample: 'verify@x.com',
    quickSteps: [
      { step: '01', title: 'Adresinizi Oluşturun', desc: 'Konsoldan @gecici.email uzantılı adresinizi kopyalayın.' },
      { step: '02', title: 'X Kayıt Ekranına Yazın', desc: 'Twitter / X kayıt formuna adresi yapıştırın.' },
      { step: '03', title: 'Onay Kodunu Yapıştırın', desc: 'Gelen kutusuna düşen 6-8 haneli doğrulama kodunu kopyalayın.' }
    ],
    guideTitle: 'Twitter (X) Doğrulamalarında Neden gecici.email?',
    guideParagraphs: [
      'X platformunda yeni bir profil oluştururken e-posta güvenliği kritik önem taşır. Sosyal medya platformları genellikle haftalık özetler, ilgi alanı önerileri ve pazarlama mesajlarıyla gelen kutunuzu doldurur.',
      'gecici.email platformu sayesinde X tarafından gönderilen tek seferlik şifre (OTP) saniyeler içinde ayrıştırılarak tek tıkla kopyalanabilir hale getirilir.'
    ],
    features: [
      { title: 'Tireli ve Standart Kod Desteği', desc: 'X\'in gönderdiği her türlü formatta güvenlik kodunu sıfır hata ile yakalar.' },
      { title: 'Anında Bildirim Sesi', desc: 'Posta ulaştığında retro mekanik ses tonuyla anında haber verir.' },
      { title: 'Tamamen Anonim', desc: 'Hiçbir IP veya kimlik kaydı tutulmaz, gizliliğiniz %100 korunur.' }
    ],
    faqs: [
      { q: 'Twitter doğrulama kodunu göndermezse ne yapmalıyım?', a: 'X bazen ilk gönderimde gecikebilir, "Kodu Tekrar Gönder" dediğinizde yeni kod 2 saniye içinde konsolunuza ulaşır.' },
      { q: 'Bu e-posta adresi kaç dakika aktif kalır?', a: 'Varsayılan olarak 60 dakika aktiftir, tek tıkla süreyi uzatabilirsiniz.' }
    ]
  },

  'yazilim-test-epostasi': {
    slug: 'yazilim-test-epostasi',
    serviceName: 'Yazılım & QA Test',
    badge: 'QA_AUTOMATION // REST_SSE',
    iconBg: '#ff4e00',
    title: 'Yazılım Testleri ve QA Otomasyonu İçin Disposable Mail API',
    h1: 'Yazılım ve QA Testleri İçin Geçici E-posta — REST, SSE & MCP',
    metaTitle: 'Yazılım Testleri İçin Geçici E-posta API — Cypress, Selenium, Playwright | gecici.email',
    metaDescription: 'Cypress, Playwright, Selenium ve AI test ajanları için yüksek hızlı, sıfır kimlik doğrulamalı geçici e-posta API servisi.',
    heroSubtitle: 'Otomasyon testlerinizde e-posta doğrulama adımlarını mocking yerine gerçek Inbound SMTP ile uçtan uca (E2E) test edin.',
    targetDomainExample: 'qa@yourdomain.com',
    quickSteps: [
      { step: '01', title: 'API veya Webden Üretin', desc: 'POST /api/v1/inbox/generate ile test için dinamik posta kutusu açın.' },
      { step: '02', title: 'E2E Testinizde Gönderin', desc: 'Kayıt formunu test otomasyonunuzla doldurup submit edin.' },
      { step: '03', title: 'OTP Uç Noktası ile Okuyun', desc: 'GET /api/v1/inbox/:addr/otp ile 1 satırda onay kodunu çekip formu tamamlayın.' }
    ],
    guideTitle: 'Modern QA ve CI/CD Süreçlerinde Gerçek E-posta Doğrulaması',
    guideParagraphs: [
      'Geliştiriciler ve QA mühendisleri, e-posta onay adımlarını test ederken ya sahte mock servisler kullanır ya da yavaş kurumsal sunuculara bağımlı kalır. Mocking yapmak gerçek dünya SMTP sorunlarını yakalayamaz.',
      'gecici.email, saniyede yüzlerce e-posta işleyebilen RFC 5322 Inbound SMTP mimarisi ve `GET /api/v1/inbox/:address/otp` uç noktasıyla Playwright, Cypress ve Python test scriptlerinizin 1 saniyede doğrulamayı tamamlamasını sağlar.'
    ],
    features: [
      { title: 'Python & TS SDK Desteği', desc: 'pip install gecici-email ve npm install gecici-email ile sıfır konfigürasyon.' },
      { title: 'Model Context Protocol (MCP)', desc: 'Cursor ve Claude Desktop test ajanları için yerel araçlar.' },
      { title: 'Server-Sent Events (SSE)', desc: 'Polling yapmadan milisaniyelik olay tabanlı test akışı.' }
    ],
    faqs: [
      { q: 'Cypress veya Playwright ile nasıl entegre edebilirim?', a: 'Test scriptinizde cy.request() veya request.get(\'https://gecici.email/api/v1/inbox/.../otp\') çağrısı yaparak kodu doğrudan inputa yazdırabilirsiniz.' },
      { q: 'Kullanım için API anahtarı gerekiyor mu?', a: 'Hayır, API tamamen zero-auth (anahtarsız) ve herkese açık olarak çalışır.' }
    ]
  },

  'instagram-dogrulama-kodu-alma': {
    slug: 'instagram-dogrulama-kodu-alma',
    serviceName: 'Instagram',
    badge: 'META_GATEWAY // SECURITY_CODE',
    iconBg: '#E1306C',
    title: 'Instagram Kayıt ve Güvenlik Kodu İçin Geçici E-posta',
    h1: 'Instagram İçin Geçici E-posta — Güvenlik Kodu & Kayıt Konsolu',
    metaTitle: 'Instagram İçin Geçici E-posta — Doğrulama Kodu Al | gecici.email',
    metaDescription: 'Instagram yeni hesap açılışı ve güvenlik kodu alımı için hızlı, reklamsız tek kullanımlık geçici e-posta istasyonu.',
    heroSubtitle: 'Instagram yedek hesaplarınız için ana e-posta adresinizi riske atmayın. Meta güvenlik kodunu anında yakalayın.',
    targetDomainExample: 'security@mail.instagram.com',
    quickSteps: [
      { step: '01', title: 'Geçici Adres Alın', desc: 'Konsoldan @gecici.email uzantılı adresinizi kopyalayın.' },
      { step: '02', title: 'Instagram\'a Girin', desc: 'Instagram mobil veya web kayıt formuna yapıştırın.' },
      { step: '03', title: '6 Haneli Kodu Görün', desc: 'Gelen kutunuza düşen güvenlik kodunu kopyalayıp hesabınızı açın.' }
    ],
    guideTitle: 'Instagram Hesaplarında Geçici E-posta Kullanımı',
    guideParagraphs: [
      'Instagram, yeni hesap oluştururken mutlaka çalışan bir e-posta adresi ve güvenlik kodu teyidi ister. Birden fazla profil yöneten içerik üreticileri veya gizliliğine önem verenler için geçici e-posta en pratik çözümdür.',
      'gecici.email sistemi, Meta sunucularından gelen "Instagram Güvenlik Kodunuz: XXXXXX" formatındaki e-postaları yüksek öncelikle ayrıştırır.'
    ],
    features: [
      { title: 'Meta Uyumluluğu', desc: 'Instagram güvenlik e-postaları doğrudan gelen kutusuna yansır.' },
      { title: 'Hızlı Kopyalama', desc: 'Güvenlik kodu tek tuşla panoya kopyalanır.' },
      { title: 'İz Bırakmaz', desc: 'Kullanım sonrası mesajlar 60 dakikada kendiliğinden yok olur.' }
    ],
    faqs: [
      { q: 'Instagram geçici postayı kabul ediyor mu?', a: 'Evet, gecici.email özel alan adı mimarisi sayesinde kabul edilmektedir.' },
      { q: 'Kod gelmezse ne yapmalıyım?', a: 'Instagram uygulamasında "Kodu yeniden gönder" butonuna basmanız yeterlidir.' }
    ]
  },

  'telegram-gecici-mail': {
    slug: 'telegram-gecici-mail',
    serviceName: 'Telegram',
    badge: 'TELEGRAM_LOGIN // 2FA_SPEC',
    iconBg: '#229ED9',
    title: 'Telegram İki Adımlı Doğrulama ve E-posta Kurtarma',
    h1: 'Telegram İçin Geçici E-posta — 2FA Kurtarma ve Giriş Konsolu',
    metaTitle: 'Telegram İçin Geçici E-posta — Giriş ve 2FA Onay Kodu | gecici.email',
    metaDescription: 'Telegram e-posta onayları ve hesap güvenlik ayarları için güvenilir, hızlı tek kullanımlık geçici e-posta servisi.',
    heroSubtitle: 'Telegram 2FA kurtarma e-postası ve giriş onay kodları için temiz, güvenli ve izsiz gelen kutusu.',
    targetDomainExample: 'login@telegram.org',
    quickSteps: [
      { step: '01', title: 'Adresinizi Belirleyin', desc: 'Konsoldan e-posta adresinizi tek tıkla kopyalayın.' },
      { step: '02', title: 'Telegram\'da Tanımlayın', desc: 'Telegram İki Adımlı Doğrulama (2FA) e-posta alanına girin.' },
      { step: '03', title: 'Onay Kodunu Girin', desc: 'Ekrana düşen 6 haneli Telegram kodunu girerek işlemi tamamlayın.' }
    ],
    guideTitle: 'Telegram ve E-posta Güvenliği',
    guideParagraphs: [
      'Telegram, özellikle yeni cihaz girişlerinde veya 2FA şifre sıfırlamalarında e-posta doğrulaması kullanır. Kişisel posta kutunuzu Telegram bildirimlerinden izole tutmak için geçici e-posta harika bir yöntemdir.',
      'Konsolumuz gelen Telegram kodunu anında yakalar ve yüksek kontrastlı ekranda sunar.'
    ],
    features: [
      { title: 'Anında 6 Haneli OTP', desc: 'Telegram güvenlik kodları milisaniyesinde ayrıştırılır.' },
      { title: 'QR Kod ile Mobilde Açma', desc: 'Masaüstünde aldığınız adresi telefon kameranızla okutup mobilde kullanın.' },
      { title: 'Tamamen Şifresiz', desc: 'Kayıt yok, telefon numarası yok, gizlilik tam.' }
    ],
    faqs: [
      { q: 'Telegram şifre sıfırlama kodu gelir mi?', a: 'Evet, Telegram tarafından gönderilen tüm kurtarma kodları anında görünür.' }
    ]
  },

  'netflix-deneme-epostasi': {
    slug: 'netflix-deneme-epostasi',
    serviceName: 'Netflix & Spotify',
    badge: 'STREAMING // TRIAL_ACCOUNT',
    iconBg: '#E50914',
    title: 'Netflix & Streaming Deneme Hesapları İçin Geçici E-posta',
    h1: 'Streaming & Deneme Sürümleri İçin Geçici E-posta Konsolu',
    metaTitle: 'Netflix & Streaming İçin Geçici E-posta — Deneme Hesapları | gecici.email',
    metaDescription: 'Streaming platformları ve yazılım deneme sürümleri için gelen kutunuzu spamdan koruyan izsiz geçici e-posta.',
    heroSubtitle: 'Deneme sürümleri ve promosyon üyeliklerinde ana e-postanızı paylaşmayın, gereksiz reklam maillerini engelleyin.',
    targetDomainExample: 'info@netflix.com',
    quickSteps: [
      { step: '01', title: 'Adres Alın', desc: 'Konsoldan tek kullanımlık adresinizi alın.' },
      { step: '02', title: 'Deneme Formuna Yazın', desc: 'Platformun deneme sürümü veya kayıt formuna girin.' },
      { step: '03', title: 'Onaylayın ve İz Bırakmayın', desc: 'Gelen onay linkine tıklayın, süre bitince tüm veriler yok olsun.' }
    ],
    guideTitle: 'Deneme Üyeliklerinde Kişisel Veri Güvenliği',
    guideParagraphs: [
      'Birçok dijital servis 7-30 günlük deneme sürümleri sunar. Ancak bu servisler üyeliğiniz bitse bile yıllarca bülten ve pazarlama e-postası yollamaya devam eder.',
      'gecici.email kullanarak bu platformlara kaydolabilir, onayınızı tamamlayabilir ve süre bitiminde arkanızda sıfır dijital ayak izi bırakabilirsiniz.'
    ],
    features: [
      { title: 'Pazarlama Spamı Sıfır', desc: 'Ana gelen kutunuz asla spam e-postalarla dolmaz.' },
      { title: 'Güvenli HTML Görüntüleyici', desc: 'Zararlı scriptleri engelleyen sandbox iframe mimarisi.' },
      { title: '60 Dakika Otomatik Temizlik', desc: 'Sürenin sonunda e-postalar tamamen buharlaşır.' }
    ],
    faqs: [
      { q: 'Deneme süresi bittikten sonra posta kutum silinir mi?', a: 'Evet, 60 dakika içinde tüm e-postalar ve adres sunucu belleğinden kalıcı olarak temizlenir.' }
    ]
  },

  'trendyol-indirim-gecici-posta': {
    slug: 'trendyol-indirim-gecici-posta',
    serviceName: 'Trendyol & E-Ticaret',
    badge: 'ECOMMERCE // COUPON_FLOW',
    iconBg: '#F27A1A',
    title: 'Trendyol ve E-Ticaret İndirim Kuponları İçin Geçici E-posta',
    h1: 'E-Ticaret ve İndirim Kuponları İçin Geçici E-posta İstasyonu',
    metaTitle: 'Trendyol İndirim Kuponu & E-Ticaret İçin Geçici E-posta | gecici.email',
    metaDescription: 'İlk sipariş indirimleri, kupon kodları ve bülten kampanyaları için ana e-postanızı koruyan güvenli geçici e-posta.',
    heroSubtitle: 'İlk üyelik indirim kuponlarını yakalayın, yüzlerce kampanya e-postasıyla ana gelen kutunuzun kirlenmesini önleyin.',
    targetDomainExample: 'kampanya@trendyol.com',
    quickSteps: [
      { step: '01', title: 'Adres Üretin', desc: 'Konsoldan hemen tek tıkla e-posta oluşturun.' },
      { step: '02', title: 'Kupon İçin Kaydolun', desc: 'E-ticaret sitesine kaydolup hoş geldin kuponunu talep edin.' },
      { step: '03', title: 'İndirim Kodunu Alın', desc: 'Gelen kupon kodunu ekrandan kopyalayıp alışverişinizi indirimli tamamlayın.' }
    ],
    guideTitle: 'E-Ticaret Sitelerinde Kupon ve Gizlilik Dengesi',
    guideParagraphs: [
      'Alışveriş siteleri "İlk siparişe özel %20 indirim" gibi tekliflerle e-posta adresinizi toplar. Ancak sonrasında günde onlarca reklam e-postası almaya başlarsınız.',
      'gecici.email ile anında bir adres alarak indirim kodunu yakalayabilir, alışverişinizi yapabilir ve ana e-postanızı tertemiz tutabilirsiniz.'
    ],
    features: [
      { title: 'Kupon Kodlarını Öne Çıkarma', desc: 'SmartExtractor motoru indirim kodlarını otomatik vurgular.' },
      { title: 'Sıfır Spam Garantisi', desc: 'Kampanya mailleri kişisel kutunuza asla ulaşamaz.' },
      { title: 'Hızlı ve Kolay', desc: 'Telefon numarası veya form doldurma zorunluluğu yok.' }
    ],
    faqs: [
      { q: 'İndirim kuponu bu adrese ulaşır mı?', a: 'Evet, e-ticaret sitesi e-postayı yolladığı anda birkaç saniyede gelen kutunuza düşer.' }
    ]
  }
};
