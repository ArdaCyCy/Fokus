# Olay müdahalesi — kısa runbook

## 1. Kullanıcı etkisini sınırla

- Anormalliği doğrula (hata oranı, ödeme başarısı, 429).
- Gerekirse bakım sayfası veya feature flag ile riskli endpoint’i kapat.

## 2. Tanı

- Loglarda `X-Request-Id` ile request izini sürdürün.
- `captureAppError` / Sentry (varsa) ile stack toplayın.
- Veritabanı: bağlantı limiti, yavaş sorgu.

## 3. Düzeltme

- Hotfix branch → CI → staging doğrulaması → prod deploy.
- Şema değişikliği gerekiyorsa migration sırasını ve geri dönüşü netleştirin.

## 4. Sonrası

- Kısa postmortem: kök neden, önleyici önlem, takip maddeleri.
