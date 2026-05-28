'use strict';

var https = require('https');

var TMDB_KEY = process.env.TMDB_API_KEY || '8265bd1679663a7ea12ac168da84d2e8';
var TMDB_IMG = 'https://image.tmdb.org/t/p/w500';

// poster_path cache: tmdbId (veya "q:name:year") → poster_path string | null
var posterCache = {};

// ── TMDB HTTPS Yardımcısı ─────────────────────────────────────────────
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

// ── 1. tmdbId ile Direkt Çek (Türkçe Metin + Global Afiş) ──────────────
function fetchPosterById(tmdbId, cb) {
  var key = String(tmdbId);
  if (posterCache[key] !== undefined) return cb(null, posterCache[key]);

  // append_to_response=images sayesinde Türkçe afiş olmasa bile dilsiz/global afişleri de tek istekte çekeriz
  tmdbGet('/3/tv/' + tmdbId + '?language=tr-TR&append_to_response=images', function(err, data) {
    if (err || !data) { posterCache[key] = null; return cb(null, null); }
    
    // Öncelik 1: Türkçe lokalizasyondaki poster_path
    var p = data.poster_path;
    
    // Öncelik 2: Eğer Türkçe veri boşsa, ek istek paketinden (images) gelen ilk global afişi al
    if (!p && data.images && data.images.posters && data.images.posters.length > 0) {
      p = data.images.posters[0].file_path;
    }
    
    posterCache[key] = p;
    cb(null, p);
  });
}

// ── 2. İsim ile Ara, En İyi Eşleşmenin Posterini Getir ────────────────
function fetchPosterBySearch(name, year, cb) {
  var key = 'q:' + name + ':' + year;
  if (posterCache[key] !== undefined) return cb(null, posterCache[key]);

  // Arama dilini tr-TR yapıyoruz ki Çukur, Babil gibi dizilerin isimleri Türkçe gelsin
  var path = '/3/search/tv?query=' + encodeURIComponent(name) + '&language=tr-TR';

  tmdbGet(path, function(err, data) {
    if (err || !data || !data.results || data.results.length === 0) { 
      posterCache[key] = null; 
      return cb(null, null); 
    }

    var results = data.results;
    var poster = null;

    // Öncelik 1: Hem posteri olan hem de orijinal dili Türkçe ('tr') olan ilk sonucu ara
    for (var i = 0; i < results.length; i++) {
      if (results[i].poster_path && results[i].original_language === 'tr') {
        poster = results[i].poster_path;
        break;
      }
    }

    // Öncelik 2: Yukarıdaki katı filtreye takıldıysa, dil fark etmeksizin poster barındıran ilk sonucu kap
    if (!poster) {
      for (var j = 0; j < results.length; j++) {
        if (results[j].poster_path) { 
          poster = results[j].poster_path; 
          break; 
        }
      }
    }

    posterCache[key] = poster;
    cb(null, poster);
  });
}

// ── Ana Fonksiyon: Dizi objesinden poster URL döner ───────────────────
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

// ── Toplu Check Fonksiyonu (Terminalden İzlemek İçin) ─────────────────
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
      setTimeout(next, 200); // 200ms gecikme (Rate Limit koruması)
    });
  }
  
  next();
}

module.exports = { getPosterUrl, checkAllSeries };
