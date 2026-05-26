'use strict';

var http    = require('http');
var https   = require('https');
var express = require('express');
var series_ = require('./series');
var stream_ = require('./stream');

var SERIES           = series_.SERIES;
var CHANNELS         = series_.CHANNELS;
var KNOWN_POSTERS    = series_.KNOWN_POSTERS;
var getPosterUrl     = series_.getPosterUrl;
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

// ── POSTER PROXY ──────────────────────────────────────────────────────
// TMDB ID'si olan dizilerde TMDB'den poster çekip proxy'ler,
// olmayanlar için SVG poster üretir.
// Stremio ve Nuvio bu endpointi doğrudan görsel olarak gösterir.

// TMDB poster_path önbelleği (runtime'da dolar)
var posterCache = {};

function fetchTmdbPosterPath(tmdbId, callback) {
  if (posterCache[tmdbId]) return callback(null, posterCache[tmdbId]);
  // TMDB public API (read-only key gerekmez, anonimdir — rate limit yüksek)
  var apiKey = '8265bd1679663a7ea12ac168da84d2e8'; // public demo key
  var options = {
    hostname: 'api.themoviedb.org',
    path: '/3/tv/' + tmdbId + '?api_key=' + apiKey + '&language=tr-TR',
    method: 'GET',
    headers: { 'Accept': 'application/json' }
  };
  var req = https.request(options, function(res2) {
    var data = '';
    res2.on('data', function(chunk) { data += chunk; });
    res2.on('end', function() {
      try {
        var json = JSON.parse(data);
        var path = json.poster_path || null;
        if (path) posterCache[tmdbId] = path;
        callback(null, path);
      } catch(e) { callback(e); }
    });
  });
  req.on('error', callback);
  req.end();
}

function makeSvgPoster(name, channelName) {
  // Kanalın rengini belirle
  var colors = {
    'Star TV':  { bg: '#e8000d', text: '#ffffff' },
    'Kanal D':  { bg: '#0057a8', text: '#ffffff' },
    'ATV':      { bg: '#ff6600', text: '#ffffff' },
    'Show TV':  { bg: '#9b1c8a', text: '#ffffff' },
    'FOX TV':   { bg: '#003087', text: '#ffffff' },
    'TRT 1':    { bg: '#006633', text: '#ffffff' },
  };
  var c = colors[channelName] || { bg: '#1a1a2e', text: '#ffffff' };

  // İsmi satırlara böl (max 15 karakter/satır)
  var words = name.split(' ');
  var lines = [];
  var current = '';
  words.forEach(function(w) {
    if ((current + ' ' + w).trim().length > 14) {
      if (current) lines.push(current.trim());
      current = w;
    } else {
      current = (current + ' ' + w).trim();
    }
  });
  if (current) lines.push(current.trim());

  var lineHeight = 36;
  var startY = 200 - (lines.length * lineHeight) / 2;
  var textElements = lines.map(function(line, i) {
    return '<text x="150" y="' + (startY + i * lineHeight) + '" text-anchor="middle" font-family="Arial,sans-serif" font-size="28" font-weight="bold" fill="' + c.text + '">' + line + '</text>';
  }).join('');

  return [
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 450" width="300" height="450">',
    '<rect width="300" height="450" fill="' + c.bg + '"/>',
    '<rect x="0" y="0" width="300" height="80" fill="rgba(0,0,0,0.3)"/>',
    '<text x="150" y="52" text-anchor="middle" font-family="Arial,sans-serif" font-size="20" font-weight="bold" fill="' + c.text + '" opacity="0.9">' + channelName + '</text>',
    textElements,
    '<rect x="0" y="400" width="300" height="50" fill="rgba(0,0,0,0.3)"/>',
    '</svg>'
  ].join('');
}

// /poster/:seriesId.jpg  → TMDB proxy veya SVG poster
app.get('/poster/:seriesId.jpg', function(req, res) {
  var s = getSeriesById(req.params.seriesId);
  if (!s) return res.status(404).end();

  // Bilinen sabit poster varsa redirect et
  if (KNOWN_POSTERS[s.id]) {
    return res.redirect(302, KNOWN_POSTERS[s.id]);
  }

  // TMDB ID'si varsa API'den çek
  if (s.tmdbId) {
    fetchTmdbPosterPath(s.tmdbId, function(err, path) {
      if (!err && path) {
        return res.redirect(302, 'https://image.tmdb.org/t/p/w500' + path);
      }
      // Hata durumunda SVG
      var svg = makeSvgPoster(s.name, s.channelName);
      res.setHeader('Content-Type', 'image/svg+xml');
      res.setHeader('Cache-Control', 'public, max-age=86400');
      res.send(svg);
    });
  } else {
    // TMDB ID'si yok → SVG poster
    var svg = makeSvgPoster(s.name, s.channelName);
    res.setHeader('Content-Type', 'image/svg+xml');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.send(svg);
  }
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
  var host = req.protocol + '://' + req.get('host');

  var metas = getSeriesByChannel(channelId).map(function(s) {
    return {
      id: s.id,
      type: 'series',
      name: s.name,
      year: s.year,
      poster: getPosterUrl(s.id, host),
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
  var host = req.protocol + '://' + req.get('host');

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
      poster: getPosterUrl(s.id, host),
      description: s.description,
      genres: [s.channelName],
      videos: videos,
    }
  });
});

// ── STREAM ───────────────────────────────────────────────────────────
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
