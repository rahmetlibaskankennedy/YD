'use strict';

var https = require('https');

var TMDB_KEY = process.env.TMDB_API_KEY || '8265bd1679663a7ea12ac168da84d2e8';
var TMDB_IMG = 'https://image.tmdb.org/t/p/w500';

var posterCache = {};

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

// ÇÖZÜM 1: ID ile çekerken language=tr-TR'yi kaldırdık. TMDB ana veriyi getirecek.
function fetchPosterById(tmdbId, cb) {
  var key = String(tmdbId);
  if (posterCache[key] !== undefined) return cb(null, posterCache[key]);

  tmdbGet('/3/tv/' + tmdbId, function(err, data) {
    if (err || !data) { posterCache[key] = null; return cb(null, null); }
    var p = data.poster_path || null;
    posterCache[key] = p;
    cb(null, p);
  });
}

// ÇÖZÜM 2: Aramadan first_air_date_year ve language=tr-TR şartını esnettik
function fetchPosterBySearch(name, year, cb) {
  var key = 'q:' + name + ':' + year;
  if (posterCache[key] !== undefined) return cb(null, posterCache[key]);

  // Yıl filtresini URL'den kaldırdık, gelen sonuçlar içinden akıllıca seçeceğiz
  var path = '/3/search/tv?query=' + encodeURIComponent(name);

  tmdbGet(path, function(err, data) {
    if (err || !data || !data.results || data.results.length === 0) { 
      posterCache[key] = null; 
      return cb(null, null); 
    }

    var results = data.results;
    var poster = null;

    // 1. Öncelik: Hem ismi (veya orijinal ismi) eşleşen hem de posteri olan ilk sonucu al
    for (var i = 0; i < results.length; i++) {
      if (results[i].poster_path) {
        poster = results[i].poster_path;
        break;
      }
    }

    posterCache[key] = poster;
    cb(null, poster);
  });
}

function getPosterUrl(series, cb) {
  function toUrl(p) { return p ? TMDB_IMG + p : null; }

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

// ── ÇÖZÜM 3: TÜM DİZİLERİ CHECK EDEN YENİ FONKSİYON ───────────────────
// Bu fonksiyonu eklentiyi başlatırken dizi listenizi vererek çağırabilirsiniz.
function checkAllSeries(seriesList) {
  console.log(`[POSTER CHECK] Toplam ${seriesList.length} dizi kontrol ediliyor...`);
  
  var index = 0;
  
  function next() {
    if (index >= seriesList.length) {
      console.log('[POSTER CHECK] Tüm dizilerin kontrolü tamamlandı!');
      return;
    }
    
    var series = seriesList[index];
    getPosterUrl(series, function(url) {
      if (url) {
        console.log(`✅ [BAŞARILI] ${series.name} -> ${url}`);
      } else {
        console.warn(`❌ [BAŞARISIZ] ${series.name} (ID: ${series.tmdbId || 'Yok'}, Yıl: ${series.year || 'Yok'}) için poster bulunamadı!`);
      }
      index++;
      // TMDB API Rate Limit'e (istek sınırı) takılmamak için 200ms gecikmeyle sıradakine geçer
      setTimeout(next, 200);
    });
  }
  
  next();
}

module.exports = { getPosterUrl, checkAllSeries };
