'use strict';

const fetch = require('node-fetch');

const MNCDN_BASE = 'https://startv-p2.mncdn.com/delivery/Dizi/';

// Star TV sayfasından canlı playlist URL'si çekmeyi dene
// Başarısız olursa null döner, caller fallback kullanır
function fetchLiveUrl(streamPath) {
  // streamPath örn: "turkmali/turkmali4_ghfd"
  // Önce playlist.m3u8'i direkt deneyelim (token'sız) — bazı içerikler açık olabilir
  var directUrl = MNCDN_BASE + streamPath + '/playlist.m3u8';

  return fetch(directUrl, {
    method: 'HEAD',
    headers: {
      'Origin': 'https://www.startv.com.tr',
      'Referer': 'https://www.startv.com.tr/',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36'
    },
    timeout: 5000
  })
  .then(function(res) {
    if (res.ok) {
      return directUrl; // Token gerekmeden açılıyorsa direkt kullan
    }
    return null;
  })
  .catch(function() {
    return null;
  });
}

// Stream URL'sini çöz: önce canlı, yoksa fallback
function resolveStreamUrl(episode) {
  if (!episode.streamPath) {
    return Promise.resolve(episode.fallback);
  }

  return fetchLiveUrl(episode.streamPath)
    .then(function(liveUrl) {
      if (liveUrl) {
        console.log('[Stream] Live URL found:', liveUrl);
        return liveUrl;
      }
      console.log('[Stream] Using fallback for:', episode.streamPath);
      return episode.fallback;
    });
}

module.exports = { resolveStreamUrl };
