'use strict';

const fetch = require('node-fetch');

const TMDB_KEY  = process.env.TMDB_API_KEY || '4ef0d7355d9ffb5151e987764708ce96';
const TMDB_BASE = 'https://api.themoviedb.org/3';
const TMDB_IMG  = 'https://image.tmdb.org/t/p/w500';

// Bellekte poster cache — process restart'a kadar yaşar, Render'da yeterli
const posterCache = {};

// TMDB'den poster çek
function fetchPosterByTmdbId(tmdbId) {
  if (posterCache[tmdbId]) return Promise.resolve(posterCache[tmdbId]);

  return fetch(TMDB_BASE + '/tv/' + tmdbId + '?api_key=' + TMDB_KEY + '&language=tr-TR')
    .then(function(res) { return res.json(); })
    .then(function(data) {
      var poster = data.poster_path ? TMDB_IMG + data.poster_path : null;
      if (poster) posterCache[tmdbId] = poster;
      return poster;
    })
    .catch(function() { return null; });
}

// TMDB'de ara, ilk sonucun posterini getir
function fetchPosterByQuery(query) {
  var cacheKey = 'q:' + query;
  if (posterCache[cacheKey]) return Promise.resolve(posterCache[cacheKey]);

  var url = TMDB_BASE + '/search/tv?api_key=' + TMDB_KEY + '&query=' + encodeURIComponent(query) + '&language=tr-TR';
  return fetch(url)
    .then(function(res) { return res.json(); })
    .then(function(data) {
      var results = data.results || [];
      var poster = null;
      for (var i = 0; i < results.length; i++) {
        if (results[i].poster_path) {
          poster = TMDB_IMG + results[i].poster_path;
          break;
        }
      }
      if (poster) posterCache[cacheKey] = poster;
      return poster;
    })
    .catch(function() { return null; });
}

// Dizi için poster getir (tmdbId varsa direkt, yoksa query ile ara)
function getPoster(series) {
  if (series.tmdbId) {
    return fetchPosterByTmdbId(series.tmdbId);
  }
  return fetchPosterByQuery(series.tmdbQuery);
}

module.exports = { getPoster };
