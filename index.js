'use strict';

var express  = require('express');
var series_  = require('./series');
var stream_  = require('./stream');

var SERIES           = series_.SERIES;
var CHANNELS         = series_.CHANNELS;
var getSeriesById    = series_.getSeriesById;
var getSeriesByChannel = series_.getSeriesByChannel;
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
  version: '1.1.0',
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
var CATALOG_MAP = {
  'startv_catalog': 'startv',
  'kanald_catalog': 'kanald',
  'atv_catalog':    'atv',
  'showtv_catalog': 'showtv',
  'foxtv_catalog':  'foxtv',
  'trt1_catalog':   'trt1',
};

app.get('/catalog/:type/:id.json', function(req, res) {
  var channelId = CATALOG_MAP[req.params.id];
  if (!channelId) return res.json({ metas: [] });

  var metas = getSeriesByChannel(channelId).map(function(s) {
    return {
      id: s.id,
      type: 'series',
      name: s.name,
      year: s.year,
      poster: s.poster,
      description: s.description,
      genres: [s.channelName],
    };
  });

  res.json({ metas: metas });
});

// ── META ─────────────────────────────────────────────────────────────
app.get('/meta/:type/:id.json', function(req, res) {
  var s = getSeriesById(req.params.id);
  if (!s) return res.json({ meta: null });

  var videos = s.episodes.map(function(ep, idx) {
    return {
      id: s.id + ':' + idx,
      title: ep.title,
      season: 1,
      episode: idx + 1,
      released: new Date(s.year, 0, 1 + idx).toISOString(),
    };
  });

  res.json({
    meta: {
      id: s.id,
      type: 'series',
      name: s.name,
      year: s.year,
      poster: s.poster,
      description: s.description,
      genres: [s.channelName],
      videos: videos,
    }
  });
});

// ── STREAM ───────────────────────────────────────────────────────────
// id formatı: "startv_turkmali:3"
app.get('/stream/:type/:id.json', function(req, res) {
  var parts    = req.params.id.split(':');
  var seriesId = parts[0];
  var epIndex  = parseInt(parts[1], 10);
  var s        = getSeriesById(seriesId);

  if (!s || isNaN(epIndex) || epIndex >= s.episodes.length) {
    return res.json({ streams: [] });
  }

  resolveStreamUrl(s.episodes[epIndex]).then(function(url) {
    if (!url) return res.json({ streams: [] });
    res.json({
      streams: [{
        url: url,
        name: s.channelName,
        title: s.episodes[epIndex].title,
        behaviorHints: {
          notWebReady: false,
          proxyHeaders: {
            request: {
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
    '<a class="btn" href="stremio://' + req.get('host') + '/manifest.json">Stremio\'ya Ekle</a>',
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

app.listen(PORT, function() {
  console.log('🇹🇷 Türk Dizileri Addon çalışıyor: http://localhost:' + PORT);
});
