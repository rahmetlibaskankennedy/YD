'use strict';

var https = require('https');

var TMDB_KEY = process.env.TMDB_API_KEY || '8265bd1679663a7ea12ac168da84d2e8';
var TMDB_IMG = 'https://image.tmdb.org/t/p/w500';

// poster_path cache: tmdbId (veya "q:name:year") → poster_path string | null
var posterCache = {};

// ── TMDB HTTPS yardımcısı ─────────────────────────────────────────────
function tmdbGet(path, cb) {
  var url = 'https://api.themoviedb.org' + path +
    (path.indexOf('?') >= 0 ? '&' : '?') + 'api_key=' + TMDB_KEY;

  var req = https.get(url, {
    headers: { 'Accept': 'application/json', 'User-Agent': 'TurkDiziAddon/1.3' }
  }, function(res) {
    var raw = '';
    res.on('data', function(c) { raw += c; });
    res.on('end', function() {
      try { cb(null, JSON.parse(raw)); }
      catch(e) { cb(e); }
    });
  });
  req.on('error', cb);
  req.setTimeout(6000, function() { req.destroy(); cb(new Error('timeout')); });
}

// ── 1. tmdbId ile direkt çek ──────────────────────────────────────────
function fetchPosterById(tmdbId, cb) {
  var key = String(tmdbId);
  if (posterCache[key] !== undefined) return cb(null, posterCache[key]);

  tmdbGet('/3/tv/' + tmdbId + '?language=tr-TR', function(err, data) {
    if (err || !data) { posterCache[key] = null; return cb(null, null); }
    var p = data.poster_path || null;
    posterCache[key] = p;
    cb(null, p);
  });
}

// ── 2. İsim + yıl ile ara, en iyi eşleşmenin posterini getir ─────────
function fetchPosterBySearch(name, year, cb) {
  var key = 'q:' + name + ':' + year;
  if (posterCache[key] !== undefined) return cb(null, posterCache[key]);

  var path = '/3/search/tv?query=' + encodeURIComponent(name) +
    '&language=tr-TR&first_air_date_year=' + year;

  tmdbGet(path, function(err, data) {
    if (err || !data || !data.results) { posterCache[key] = null; return cb(null, null); }

    var results = data.results;
    var poster = null;

    // Önce yıl eşleşen ve Türkçe orijinal dil olan sonucu tercih et
    for (var i = 0; i < results.length; i++) {
      var r = results[i];
      if (r.poster_path && r.original_language === 'tr') {
        poster = r.poster_path;
        break;
      }
    }
    // Bulamazsa ilk poster_path'li sonucu al
    if (!poster) {
      for (var j = 0; j < results.length; j++) {
        if (results[j].poster_path) { poster = results[j].poster_path; break; }
      }
    }

    posterCache[key] = poster;
    cb(null, poster);
  });
}

// ── Ana fonksiyon: dizi objesinden poster URL döner ───────────────────
// tmdbId varsa direkt çeker, yoksa name+year ile arar.
// Her iki durumda da tam TMDB görsel URL'si döner, hata varsa null.
function getPosterUrl(series, cb) {
  function toUrl(p) { return p ? TMDB_IMG + p : null; }

  // Direkt poster URL tanımlanmışsa TMDB'ye gitme
  if (series.posterUrl) return cb(series.posterUrl);

  if (series.tmdbId) {
    fetchPosterById(series.tmdbId, function(err, p) {
      cb(toUrl(p));
    });
  } else {
    fetchPosterBySearch(series.name, series.year, function(err, p) {
      cb(toUrl(p));
    });
  }
}

module.exports = { getPosterUrl };
