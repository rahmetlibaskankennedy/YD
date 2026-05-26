'use strict';

var express  = require('express');
var series_  = require('./series');
var stream_  = require('./stream');
var tmdb_    = require('./tmdb'); // TMDB modülü entegre edildi

var SERIES           = series_.SERIES;
var CHANNELS         = series_.CHANNELS;
var getSeriesById    = series_.getSeriesById;
var getSeriesByChannel = series_.getSeriesByChannel;
var resolveStreamUrl = stream_.resolveStreamUrl;

// TMDB poster çözücü fonksiyonları tanımlandı
var fetchPosterByTmdbId = tmdb_.fetchPosterByTmdbId;
var fetchPosterByQuery = tmdb_.fetchPosterByQuery;

var app  = express();
var PORT = process.env.PORT || 3000;

// ── CORS ──────────────────────────────────────────────────────────────
app.use(function(req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', '*');
  next();
});

// ── MANIFEST ─────────────────────────────────────────────────────────
var MANIFEST = {
  id: 'community.turkishdiziaddon',
  version: '1.1.0',
  name: '🇹🇷 Türk Dizileri',
  description: 'Star TV, Kanal D, ATV, Show TV, FOX TV ve TRT 1 dizileri',
  logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b4/Flag_of_Turkey.svg/200px-Flag_of_Turkey.svg.png',
  resources: ['catalog', 'meta', 'stream'],
  types: ['series'],
  idPrefixes: ['startv_', 'kanald_', 'atv_', 'showtv_', 'foxtv_', 'trt1_'],
  catalogs: [
    { type: 'series', id: 'startv_catalog', name: 'Star TV Dizileri' },
    { type: 'series', id: 'kanald_catalog', name: 'Kanal D Dizileri' },
    { type: 'series', id: 'atv_catalog',    name: 'ATV Dizileri' },
    { type: 'series', id: 'showtv_catalog', name: 'Show TV Dizileri' },
    { type: 'series', id: 'foxtv_catalog',  name: 'FOX TV Dizileri' },
    { type: 'series', id: 'trt1_catalog',   name: 'TRT 1 Dizileri' }
  ]
};

var CATALOG_MAP = {
  'startv_catalog': 'startv',
  'kanald_catalog': 'kanald',
  'atv_catalog':    'atv',
  'showtv_catalog': 'showtv',
  'foxtv_catalog':  'foxtv',
  'trt1_catalog':   'trt1'
};

app.get('/manifest.json', function(req, res) {
  res.json(MANIFEST);
});

// ── CATALOG (Poster Sorunu İçin Tamamen Asenkron Yapıldı) ──────────────
app.get('/catalog/:type/:id.json', function(req, res) {
  var channelId = CATALOG_MAP[req.params.id];
  if (!channelId) return res.json({ metas: [] });

  var seriesList = getSeriesByChannel(channelId);

  // Her bir dizi için TMDB'den poster çekecek Promise dizisi oluşturuluyor
  var promises = seriesList.map(function(s) {
    // Eğer seride zaten geçerli bir TMDB görsel linki elle girilmişse istek atma
    if (s.poster && s.poster.includes('image.tmdb.org')) {
      return Promise.resolve({ s: s, poster: s.poster });
    }

    // Öncelik tmdbId'de, yoksa tmdbQuery veya dizi adıyla arama yapılıyor
    var posterPromise;
    if (s.tmdbId) {
      posterPromise = fetchPosterByTmdbId(s.tmdbId);
    } else {
      var queryStr = s.tmdbQuery || (s.name + " Turkish");
      posterPromise = fetchPosterByQuery(queryStr);
    }

    return posterPromise.then(function(fetchedPoster) {
      // TMDB'den poster geldiyse onu kullan, gelmediyse placeholder/mevcut posteri koru
      return { s: s, poster: fetchedPoster || s.poster };
    });
  });

  // Tüm poster istekleri bittiğinde Stremio'ya tek seferde yanıt dönülüyor
  Promise.all(promises).then(function(results) {
    var metas = results.map(function(item) {
      return {
        id: item.s.id,
        type: 'series',
        name: item.s.name,
        year: item.s.year,
        poster: item.poster,
        description: item.s.description,
        genres: [item.s.channelName]
      };
    });
    res.json({ metas: metas });
  }).catch(function() {
    // Hata durumunda sistemin çökmemesi için fallback olarak ham veriyi bas
    var fallbackMetas = seriesList.map(function(s) {
      return {
        id: s.id,
        type: 'series',
        name: s.name,
        year: s.year,
        poster: s.poster,
        description: s.description,
        genres: [s.channelName]
      };
    });
    res.json({ metas: fallbackMetas });
  });
});

// ── META ─────────────────────────────────────────────────────────────
app.get('/meta/:type/:id.json', function(req, res) {
  var s = getSeriesById(req.params.id);
  if (!s) return res.json({ meta: null });

  // Detay sayfası açıldığında da güncel posteri basabilmek adına asenkron kontrol
  var posterPromise;
  if (s.poster && s.poster.includes('image.tmdb.org')) {
    posterPromise = Promise.resolve(s.poster);
  } else if (s.tmdbId) {
    posterPromise = fetchPosterByTmdbId(s.tmdbId);
  } else {
    posterPromise = fetchPosterByQuery(s.tmdbQuery || (s.name + " Turkish"));
  }

  posterPromise.then(function(resolvedPoster) {
    var meta = {
      id: s.id,
      type: 'series',
      name: s.name,
      year: s.year,
      genres: [s.channelName],
      poster: resolvedPoster || s.poster,
      description: s.description,
      videos: s.episodes.map(function(ep, index) {
        return {
          id: s.id + ':' + (index + 1),
          title: ep.title,
          season: 1,
          episode: index + 1,
          released: new Date(2024, 0, index + 1).toISOString()
        };
      })
    };
    res.json({ meta: meta });
  }).catch(function() {
    res.json({
      meta: {
        id: s.id,
        type: 'series',
        name: s.name,
        year: s.year,
        genres: [s.channelName],
        poster: s.poster,
        description: s.description,
        videos: s.episodes.map(function(ep, index) {
          return { id: s.id + ':' + (index + 1), title: ep.title, season: 1, episode: index + 1 };
        })
      }
    });
  });
});

// ── STREAM ───────────────────────────────────────────────────────────
app.get('/stream/:type/:id.json', function(req, res) {
  var parts = req.params.id.split(':');
  var seriesId = parts[0];
  var epIndex = parseInt(parts[1], 10) - 1;

  var s = getSeriesById(seriesId);
  if (!s || !s.episodes[epIndex]) return res.json({ streams: [] });

  var episode = s.episodes[epIndex];

  resolveStreamUrl(episode).then(function(finalUrl) {
    res.json({
      streams: [{
        title: s.name + ' - ' + episode.title,
        url: finalUrl,
        behaviorHints: {
          notDraft: true,
          requestWhitelist: ['Origin', 'Referer'],
          proxyHeaders: {
            'request': {
              'Origin': 'https://www.startv.com.tr',
              'Referer': 'https://www.startv.com.tr/'
            }
          }
        }
      }]
    });
  }).catch(function() {
    res.json({ streams: [] });
  });
});

// ── ANASAYFA ─────────────────────────────────────────────────────────
app.get('/', function(req, res) {
  var host = req.protocol + '://' + req.get('host');
  res.send([
    '<!DOCTYPE html><html><head><meta charset="utf-8">',
    '<title>🇹🇷 Türk Dizileri Addon</title>',
    '<style>body{font-family:sans-serif;max-width:700px;margin:40px auto;padding:0 20px;background:#111;color:#eee}',
    'h1{color:#e50}a{color:#4af}.btn{display:inline-block;margin:4px;padding:12px 24px;background:#e50;color:#fff;border-radius:8px;font-size:15px;text-decoration:none}',
    'ul{line-height:2}</style></head><body>',
    '<h1>🇹🇷 Türk Dizileri Addon</h1>',
    '<a class=\"btn\" href=\"stremio://' + req.get('host') + '/manifest.json\">Stremio\'ya Ekle</a>',
    '<a class=\"btn\" href=\"nuvio://' + req.get('host') + '/manifest.json\">Nuvio\'ya Ekle</a>',
    '<h2>Kataloglar</h2><ul>',
    Object.keys(CATALOG_MAP).map(function(k) {
      return '<li><a href="/catalog/series/' + k + '.json">' + MANIFEST.catalogs.find(c => c.id === k).name + '</a></li>';
    }).join(''),
    '</ul></body></html>'
  ].join(''));
});

app.listen(PORT, function() {
  console.log('Addon server running on port ' + PORT);
});
