'use strict';

var express = require('express');
var series_ = require('./series');
var stream_ = require('./stream');
var tmdb_   = require('./tmdb');

var SERIES             = series_.SERIES;
var CHANNELS           = series_.CHANNELS;
var getSeriesById      = series_.getSeriesById;
var getSeriesByChannel = series_.getSeriesByChannel;
var resolveStreamUrl   = stream_.resolveStreamUrl;
var getPosterUrl       = tmdb_.getPosterUrl;

var app  = express();
var PORT = process.env.PORT || 3000;

// ── CORS ─────────────────────────────────────────────────────────────
app.use(function(req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', '*');
  next();
});

// ── MANIFEST ─────────────────────────────────────────────────────────
var MANIFEST = {
  id: 'community.turkishdiziaddon',
  version: '2.0.0',
  name: '🇹🇷 Türk Dizileri',
  description: 'Star TV ve Show TV dizi arşivi — 200+ dizi, binlerce bölüm',
  logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b4/Flag_of_Turkey.svg/200px-Flag_of_Turkey.svg.png',
  resources: ['catalog', 'meta', 'stream'],
  types: ['series'],
  idPrefixes: ['startv_', 'kanald_', 'atv_', 'showtv_', 'foxtv_', 'trt1_'],
  catalogs: [
    { type: 'series', id: 'startv_catalog', name: 'Star TV Dizileri', extra: [{ name: 'skip', isRequired: false }] },
    { type: 'series', id: 'showtv_catalog', name: 'Show TV Dizileri', extra: [{ name: 'skip', isRequired: false }] },
    { type: 'series', id: 'kanald_catalog', name: 'Kanal D Dizileri', extra: [{ name: 'skip', isRequired: false }] },
    { type: 'series', id: 'atv_catalog',    name: 'ATV Dizileri',     extra: [{ name: 'skip', isRequired: false }] },
    { type: 'series', id: 'foxtv_catalog',  name: 'FOX TV Dizileri',  extra: [{ name: 'skip', isRequired: false }] },
    { type: 'series', id: 'trt1_catalog',   name: 'TRT 1 Dizileri',   extra: [{ name: 'skip', isRequired: false }] },
  ]
};

app.get('/manifest.json', function(req, res) {
  res.json(MANIFEST);
});

// ── POSTER SİSTEMİ ────────────────────────────────────────────────────
var CHANNEL_COLORS = {
  'Star TV':  { bg: '#c8000a', accent: '#ff2233' },
  'Kanal D':  { bg: '#0057a8', accent: '#1a7fd4' },
  'ATV':      { bg: '#e05500', accent: '#ff7722' },
  'Show TV':  { bg: '#7b1082', accent: '#b030bc' },
  'FOX TV':   { bg: '#002060', accent: '#003da5' },
  'TRT 1':    { bg: '#005227', accent: '#007a3d' },
};

function makeSvgPoster(name, channelName) {
  var c = CHANNEL_COLORS[channelName] || { bg: '#1a1a2e', accent: '#3a3a5e' };

  var words = name.split(' ');
  var lines = [];
  var cur = '';
  words.forEach(function(w) {
    var test = cur ? cur + ' ' + w : w;
    if (test.length > 13 && cur) { lines.push(cur); cur = w; }
    else { cur = test; }
  });
  if (cur) lines.push(cur);

  var lh = 38;
  var startY = 225 - (lines.length * lh) / 2 + lh * 0.75;

  var texts = lines.map(function(line, i) {
    return '<text x="150" y="' + Math.round(startY + i * lh) + '" ' +
      'text-anchor="middle" font-family="Arial Black,Arial,sans-serif" ' +
      'font-size="26" font-weight="900" fill="#ffffff" ' +
      'paint-order="stroke" stroke="#00000066" stroke-width="3">' +
      line.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;') +
      '</text>';
  }).join('\n');

  return [
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 450">',
    '<defs>',
    '  <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">',
    '    <stop offset="0%" stop-color="' + c.accent + '"/>',
    '    <stop offset="100%" stop-color="' + c.bg + '"/>',
    '  </linearGradient>',
    '  <linearGradient id="bar" x1="0" y1="0" x2="0" y2="1">',
    '    <stop offset="0%" stop-color="#00000066"/>',
    '    <stop offset="100%" stop-color="#000000cc"/>',
    '  </linearGradient>',
    '</defs>',
    '<rect width="300" height="450" fill="url(#bg)"/>',
    '<rect width="300" height="72" fill="url(#bar)"/>',
    '<text x="150" y="46" text-anchor="middle" font-family="Arial,sans-serif" ' +
      'font-size="18" font-weight="700" fill="#ffffffcc" letter-spacing="1">' +
      channelName + '</text>',
    '<rect y="378" width="300" height="72" fill="url(#bar)"/>',
    '<line x1="40" y1="390" x2="260" y2="390" stroke="#ffffff44" stroke-width="1"/>',
    texts,
    '</svg>'
  ].join('\n');
}

app.get('/poster/:seriesId.jpg', function(req, res) {
  var s = getSeriesById(req.params.seriesId);
  if (!s) return res.status(404).end();

  function sendSvg() {
    res.setHeader('Content-Type', 'image/svg+xml');
    res.setHeader('Cache-Control', 'public, max-age=604800');
    return res.send(makeSvgPoster(s.name, s.channelName));
  }

  getPosterUrl(s, function(url) {
    if (!url) return sendSvg();
    res.setHeader('Cache-Control', 'public, max-age=604800');
    return res.redirect(302, url);
  });
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

function posterUrl(s, host) {
  return host + '/poster/' + s.id + '.jpg';
}

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
      poster: posterUrl(s, host),
      description: s.description || '',
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
      season: ep.season || 1,
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
      poster: posterUrl(s, host),
      description: s.description || '',
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

  if (!s || isNaN(epIndex) || epIndex < 0 || epIndex >= s.episodes.length) {
    return res.json({ streams: [] });
  }

  var ep = s.episodes[epIndex];

  resolveStreamUrl(ep).then(function(url) {
    if (!url) return res.json({ streams: [] });

    var stream = {
      url: url,
      name: s.channelName,
      title: ep.title,
    };

    // MNCDN linkler için Origin/Referer header gerekebilir
    if (url.indexOf('mncdn.com') >= 0) {
      stream.behaviorHints = {
        notWebReady: false,
        proxyHeaders: {
          request: {
            'Origin':  'https://www.startv.com.tr',
            'Referer': 'https://www.startv.com.tr/'
          }
        }
      };
    }

    res.json({ streams: [stream] });
  }).catch(function() {
    res.json({ streams: [] });
  });
});

// ── ANASAYFA ─────────────────────────────────────────────────────────
app.get('/', function(req, res) {
  var host = req.protocol + '://' + req.get('host');
  var channelRows = Object.keys(CHANNELS).map(function(k) {
    var count = getSeriesByChannel(k).length;
    var epCount = getSeriesByChannel(k).reduce(function(acc, s) { return acc + s.episodes.length; }, 0);
    return '<li><strong>' + CHANNELS[k].name + '</strong> — ' + count + ' dizi, ' + epCount + ' bölüm</li>';
  }).join('');

  res.send([
    '<!DOCTYPE html><html><head><meta charset="utf-8">',
    '<title>🇹🇷 Türk Dizileri Addon</title>',
    '<style>',
    'body{font-family:sans-serif;max-width:700px;margin:40px auto;padding:0 20px;background:#111;color:#eee}',
    'h1{color:#e50}a{color:#4af}',
    '.btn{display:inline-block;margin:4px;padding:12px 24px;background:#e50;color:#fff;border-radius:8px;font-size:15px;text-decoration:none}',
    'ul{line-height:2.2}',
    '</style></head><body>',
    '<h1>🇹🇷 Türk Dizileri Addon</h1>',
    '<a class="btn" href="stremio://' + req.get('host') + '/manifest.json">Stremio\'ya Ekle</a>',
    '<a class="btn" href="nuvio://' + req.get('host') + '/manifest.json">Nuvio\'ya Ekle</a>',
    '<h2>Kataloglar</h2><ul>' + channelRows + '</ul>',
    '<p style="color:#888;font-size:13px">Manifest: <a href="/manifest.json">' + host + '/manifest.json</a></p>',
    '</body></html>'
  ].join(''));
});

app.listen(PORT, function() {
  console.log('🇹🇷 Türk Dizileri Addon v2.0 — http://localhost:' + PORT);
  var total = SERIES.reduce(function(a, s) { return a + s.episodes.length; }, 0);
  console.log('Toplam: ' + SERIES.length + ' dizi, ' + total + ' bölüm');
});
