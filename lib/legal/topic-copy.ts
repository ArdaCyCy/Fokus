/** Bilgilendirme metinleri — yürürlükteki mevzuata uyum için hukuk danışmanlığı önerilir. */

export const LEGAL_TOPIC_COPY: Record<
  string,
  { title: string; paragraphs: string[] }
> = {
  privacy: {
    title: "Gizlilik politikası",
    paragraphs: [
      "Fokus, kişisel verilerinizi KVKK ve ilgili uluslararası düzenlemelere uygun şekilde işler. Hesap bilgileri (ör. Clerk ile oturum), ödeme sağlayıcısından gelen işlem özetleri ve mağaza etkileşimleri güvenli kanallar üzerinden saklanır.",
      "Haklarınız: veriye erişim, düzeltme, silme, işlemenin kısıtlanması ve itiraz. Talepler için Destek üzerinden veya kayıtlı iletişim adresinden bize ulaşabilirsiniz.",
      "Çerezler ve analitik: deneyimi iyileştirmek için sınırlı çerez ve anonim kullanım verisi kullanılabilir. Tarayıcı ayarlarından çerezleri yönetebilirsiniz.",
    ],
  },
  legal: {
    title: "Yasal bilgi",
    paragraphs: [
      "Fokus, dijital oyun ve ilgili içeriklerin dağıtımına yönelik bir platformdur. Yayınlanan içeriklerin fikri mülkiyeti ilgili geliştiricilere veya lisans verenlere aittir.",
      "Kullanıcılar hesap güvenliğinden sorumludur. Hizmetin kötüye kullanımı, dolandırıcılık veya sözleşme ihlali halinde hesap kısıtlaması uygulanabilir.",
      "Uyuşmazlıklarda Türkiye Cumhuriyeti kanunları geçerli sayılır; yetkili mahkemeler İstanbul mahkemeleri ve icra daireleridir (işletme adresi güncellendiğinde bu bölüm güncellenmelidir).",
    ],
  },
  accessibility: {
    title: "Erişilebilirlik",
    paragraphs: [
      "Fokus; klavye gezinmesi, kontrast ve ekran okuyucu uyumluluğunu iyileştirmeyi hedefler. Mağaza ve kütüphane akışlarında WCAG 2.1 AA ilkesine yaklaşan düzenlemeler yapılmaktadır.",
      "Erişilemeyen bir bileşen veya engel bulduğunuzda lütfen Destek’e bildirin; önceliklendirilen hata kayıtları düzenli olarak işlenir.",
    ],
  },
  subscription: {
    title: "Abonelik ve hizmet şartları",
    paragraphs: [
      "Dijital içerik satın alımlarında teslimat, hesabınıza lisansın tanımlanması ve indirme/oynama haklarının açılması ile yerine getirilir.",
      "Tekrarlayan bir abonelik ürünü sunulduğunda; ücretlendirme döngüsü, iptal ve yenileme koşulları ödeme sayfasında ve onay öncesi açıkça gösterilir.",
      "Hizmet kesintileri: planlı bakım mümkün olduğunca önceden duyurulur; olağanüstü durumlarda makul çaba ile hizmet sürekliliği sağlanır.",
    ],
  },
  refunds: {
    title: "İade politikası",
    paragraphs: [
      "Dijital oyun ve indirilebilir içerik için cayma hakkı, içeriğin ifasına başlandıktan sonra (ör. kütüphaneye eklenip indirilebilir hale geldikten sonra) sınırlanabilir. Koşullar tüketici mevzuatına ve ürün tipine göre değişir.",
      "Fokus; teknik kusur, yanlış faturalama veya platform kaynaklı hatalarda düzeltme veya iade süreçleri sunar. Kart ile İyzico üzerinden yapılan ödemelerde iade, ödeme sağlayıcısı ve banka kurallarına tabidir; cüzdan bakiyesi ile yapılan ödemelerde koşullar sağlandığında bakiyeye iade yapılabilir.",
      "İade talepleri hesabınızdan veya Destek kanalından iletilir; işlem süresi ödeme yöntemine göre değişebilir.",
    ],
  },
  cookies: {
    title: "Çerez politikası",
    paragraphs: [
      "Zorunlu çerezler: oturum, güvenlik ve temel mağaza işlevleri için gereklidir.",
      "Tercih ve performans çerezleri: dil, vitrin deneyimi ve hata ayıklama gibi amaçlarla kullanılabilir; kapatabilirsiniz.",
      "Üçüncü taraf çerezleri: ödeme (ör. İyzico ödeme sayfası), kimlik doğrulama (ör. Clerk) ve analitik sağlayıcıları kendi politikalarına tabidir.",
    ],
  },
};
