# SLO / SLI hedefleri (taslak)

| SLI | Hedef | Not |
|-----|--------|-----|
| API kullanılabilirliği | 99.5% ayda | Kritik path: auth, checkout, katalog okuma |
| Ödeme başarı oranı (demo hariç) | > %99 | Webhook + idempotency doğrulaması |
| p95 sayfa TTFB (SSR) | < 800 ms | CDN + cache ile iyileştirilir |

Ölçüm: üretimde APM / log tabanlı dashboard ile gerçek değerler izlenmelidir.
