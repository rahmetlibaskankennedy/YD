# 🇹🇷 Türk Dizileri - Nuvio/Stremio Addon

Star TV, Kanal D, ATV, Show TV, FOX TV ve TRT 1 dizilerini Nuvio ve Stremio'da sunan addon.

## Kanallar & Diziler

| Kanal | Diziler |
|-------|---------|
| Star TV | Boru, Ateşböceği, Türk Malı |
| Kanal D | Kızılcık Şerbeti, Yalı Çapkını, Gülümse Kaderine |
| ATV | Kuruluş: Osman, İçerde, Gelin Evi |
| Show TV | Yargı, Kardeşlerim, Kaderimin Oyunu |
| FOX TV | Mucize Doktor, Sen Anlat Karadeniz, Hayat Bilgisi |
| TRT 1 | Diriliş: Ertuğrul, Alparslan, Gönül Dağı |

## GitHub'a Yükleme

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/tcl-iffalcon/turkish-dizi-addon.git
git push -u origin main
```

## Render'a Deploy

1. [render.com](https://render.com) → **New Web Service**
2. GitHub reposunu seç
3. Ayarlar:
   - **Runtime:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
4. (Opsiyonel) Environment Variables:
   - `TMDB_API_KEY` → TMDB API anahtarın

## Nuvio/Stremio'ya Ekleme

Deploy sonrası URL'yi kopyala:
```
https://turkish-dizi-addon.onrender.com/manifest.json
```

Nuvio → Addons → URL ile ekle → yapıştır.

## Yeni Bölüm / Dizi Ekleme

### Mevcut diziye bölüm eklemek (`series.js`):
```js
{ title: 'Bölüm 9', streamPath: 'turkmali/turkmali9_xyz', fallback: 'https://startv-p2.mncdn.com/...' }
```

### Yeni dizi eklemek (`series.js`):
```js
{
  id: 'startv_yenidizi',
  channel: 'startv',
  channelName: 'Star TV',
  name: 'Yeni Dizi',
  year: 2024,
  description: 'Açıklama...',
  tmdbId: 123456,  // ya da null
  tmdbQuery: 'Yeni Dizi Turkish TV series',
  episodes: [
    { title: 'Bölüm 1', streamPath: 'yenidizi/yenidizi1', fallback: 'https://...' }
  ]
}
```

## Stream Mantığı

1. MNCDN'de token'sız playlist.m3u8 denenır (açık içerik kontrolü)
2. Çalışmazsa `series.js`'deki statik fallback URL kullanılır
3. MNCDN linkleri `Cache-Control: max-age=7776000` (90 gün) geçerlidir
4. Linkler patladığında `series.js`'deki `fallback` URL'leri güncelleyip deploy et

## Poster Sistemi

- TMDB API'den otomatik Türkçe poster çekilir
- `tmdbId` varsa direkt çekilir, yoksa `tmdbQuery` ile arama yapılır
- Posterler RAM'de cache'lenir (process başına)
