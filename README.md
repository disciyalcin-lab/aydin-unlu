# ShopFlow Studio

Yalnızca dükkan sahibi ve çalışanı için tasarlanmış, mobil uyumlu oto tamirhane operasyon uygulaması.

## Teknoloji Yığını

- Next.js 14
- TailwindCSS
- Supabase
- Vercel
- PWA

## Ana Klasörler

- `app/` - sayfa, layout ve PWA meta dosyaları
- `components/` - reusable UI bileşenleri
- `lib/` - tipler, SQL şeması ve yardımcılar
- `public/` - ikon ve statik dosyalar

## Veritabanı

Supabase üzerinde aşağıdaki tablo yapısı kurulmalıdır:

1. customers
2. vehicles
3. repair_orders
4. expenses
5. reminders
6. payment_ledger

Detaylar için `lib/database-schema.sql` dosyasına bakın.

## Çalıştırma

```bash
npm install
npm run dev
```

## Vercel ve PWA

- GitHub üzerinden repo açılır.
- Vercel'e bağlanır.
- `NEXT_PUBLIC_SUPABASE_URL` ve `NEXT_PUBLIC_SUPABASE_ANON_KEY` çevre değişkenleri eklenir.
- Uygulama PWA olarak mobil cihazlarda yüklenir.

## Supabase

- Yeni bir proje oluştur.
- SQL editor içerisine `lib/database-schema.sql` uygulanır.
- Row Level Security (RLS) isteğe bağlı olarak açılır.
