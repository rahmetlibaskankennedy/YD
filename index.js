'use strict';

var express  = require('express');
var fetch    = require('node-fetch');
var series_  = require('./series');
var tmdb_    = require('./tmdb');
var stream_  = require('./stream');

var SERIES         = series_.SERIES;
var CHANNELS       = series_.CHANNELS;
var getSeriesById  = series_.getSeriesById;
var getSeriesByChannel = series_.getSeriesByChannel;
var getPoster      = tmdb_.getPoster;
var resolveStreamUrl = stream_.resolveStreamUrl;

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
  version: '1.0.0',
  name: '🇹🇷 Türk Dizileri',
  description: 'Star TV, Kanal D, ATV, Show TV, FOX TV ve TRT 1 dizileri',
  logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b4/Flag_of_Turkey.svg/200px-Flag_of_Turkey.svg.png',
  resources: ['catalog', 'meta', 'stream'],
  types: ['series'],
  idPrefixes: ['startv_', 'kanald_', 'atv_', 'showtv_', 'foxtv_', 'trt1_'],
  catalogs: [
    { type: 'series', id: 'startv_catalog', name: 'Star TV Dizileri',  extra: [{ name: 'skip', isRequired: false }] },
    { type: 'series', id: 'kanald_catalog', name: 'Kanal D Dizileri',  extra: [{ name: 'skip', isRequired: false }] },
    { type: 'series', id: 'atv_catalog',    name: 'ATV Dizileri',      extra: [{ name: 'skip', isRequired: false }] },
    { type: 'series', id: 'showtv_catalog', name: 'Show TV Dizileri',  extra: [{ name: 'skip', isRequired: false }] },
    { type: 'series', id: 'foxtv_catalog',  name: 'FOX TV Dizileri',   extra: [{ name: 'skip', isRequired: false }] },
    { type: 'series', id: 'trt1_catalog',   name: 'TRT 1 Dizileri',    extra: [{ name: 'skip', isRequired: false }] },
  ]
};

app.get('/manifest.json', function(req, res) {
  res.json(MANIFEST);
});

// ── CATALOG ──────────────────────────────────────────────────────────
// catalogId → channelId eşleşmesi
var CATALOG_MAP = {
  'startv_catalog': 'startv',
  'kanald_catalog': 'kanald',
  'atv_catalog':    'atv',
  'showtv_catalog': 'showtv',
  'foxtv_catalog':  'foxtv',
  'trt1_catalog':   'trt1',
};

app.get('/catalog/:type/:id.json', function(req, res) {
  var catalogId = req.params.id;
  var channelId = CATALOG_MAP[catalogId];

  if (!channelId) {
    return res.json({ metas: [] });
  }

  var channelSeries = getSeriesByChannel(channelId);

  // Poster'ları paralel çek
  var posterPromises = channelSeries.map(function(s) {
    return getPoster(s).catch(function() { return null; });
  });

  Promise.all(posterPromises).then(function(posters) {
    var metas = channelSeries.map(function(s, i) {
      return {
        id: s.id,
        type: 'series',
        name: s.name,
        year: s.year,
        poster: posters[i] || 'https://via.placeholder.com/300x450?text=' + encodeURIComponent(s.name),
        description: s.description,
        genres: [s.channelName],
      };
    });
    res.json({ metas: metas });
  }).catch(function(err) {
    console.error('Catalog error:', err);
    res.json({ metas: [] });
  });
});

// ── META ─────────────────────────────────────────────────────────────
app.get('/meta/:type/:id.json', function(req, res) {
  var id = req.params.id;
  var s  = getSeriesById(id);

  if (!s) {
    return res.json({ meta: null });
  }

  getPoster(s).then(function(poster) {
    // Bölümleri video nesnelerine dönüştür
    var videos = s.episodes.map(function(ep, idx) {
      return {
        id: s.id + ':' + idx,
        title: ep.title,
        season: 1,
        episode: idx + 1,
        released: new Date(s.year, 0, 1 + idx).toISOString(),
      };
    });

    var meta = {
      id: s.id,
      type: 'series',
      name: s.name,
      year: s.year,
      poster: poster || 'https://via.placeholder.com/300x450?text=' + encodeURIComponent(s.name),
      description: s.description,
      genres: [s.channelName],
      videos: videos,
    };

    res.json({ meta: meta });
  }).catch(function(err) {
    console.error('Meta error:', err);
    res.json({ meta: null });
  });
});

// ── STREAM ───────────────────────────────────────────────────────────
// id formatı: "startv_turkmali:3"  →  seriesId:episodeIndex
app.get('/stream/:type/:id.json', function(req, res) {
  var parts     = req.params.id.split(':');
  var seriesId  = parts[0];
  var epIndex   = parseInt(parts[1], 10);

  var s = getSeriesById(seriesId);

  if (!s || isNaN(epIndex) || epIndex >= s.episodes.length) {
    return res.json({ streams: [] });
  }

  var episode = s.episodes[epIndex];

  resolveStreamUrl(episode).then(function(url) {
    if (!url) {
      return res.json({ streams: [] });
    }

    res.json({
      streams: [
        {
          url: url,
          name: s.channelName,
          title: episode.title,
          behaviorHints: {
            notWebReady: false,
            proxyHeaders: {
              request: {
                'Origin': 'https://www.startv.com.tr',
                'Referer': 'https://www.startv.com.tr/'
              }
            }
          }
        }
      ]
    });
  }).catch(function(err) {
    console.error('Stream error:', err);
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
    'h1{color:#e50}a{color:#4af;text-decoration:none}a:hover{text-decoration:underline}',
    '.btn{display:inline-block;margin-top:16px;padding:12px 24px;background:#e50;color:#fff;border-radius:8px;font-size:16px}',
    'ul{line-height:2}</style></head><body>',
    '<h1>🇹🇷 Türk Dizileri Addon</h1>',
    '<p>Nuvio veya Stremio\'ya eklemek için aşağıdaki butona tıkla:</p>',
    '<a class="btn" href="stremio://' + req.get('host') + '/manifest.json">Stremio\'ya Ekle</a>',
    '&nbsp;&nbsp;',
    '<a class="btn" href="nuvio://' + req.get('host') + '/manifest.json">Nuvio\'ya Ekle</a>',
    '<h2>Kataloglar</h2><ul>',
    Object.keys(CHANNELS).map(function(k) {
      return '<li><strong>' + CHANNELS[k].name + '</strong> — ' + getSeriesByChannel(k).length + ' dizi</li>';
    }).join(''),
    '</ul>',
    '<p style="color:#888;font-size:13px">Manifest: <a href="/manifest.json">' + host + '/manifest.json</a></p>',
    '</body></html>'
  ].join(''));
});

// ── START ─────────────────────────────────────────────────────────────
app.listen(PORT, function() {
  console.log('🇹🇷 Türk Dizileri Addon çalışıyor: http://localhost:' + PORT);
});
