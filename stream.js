'use strict';

var fetch = require('node-fetch');

var MNCDN_BASE = 'https://startv-p2.mncdn.com/delivery/Dizi/';

// MNCDN üzerinde tokenSIZ playlist.m3u8 dene (bazı içerikler açık olabilir)
// Başarısız veya streamPath null ise → fallback döner
function fetchLiveUrl(streamPath) {
  var directUrl = MNCDN_BASE + streamPath + '/playlist.m3u8';

  return fetch(directUrl, {
    method: 'HEAD',
    headers: {
      'Origin':     'https://www.startv.com.tr',
      'Referer':    'https://www.startv.com.tr/',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124.0.0.0 Safari/537.36'
    },
    timeout: 5000
  })
  .then(function(res) {
    return res.ok ? directUrl : null;
  })
  .catch(function() {
    return null;
  });
}

// Stream URL çöz:
//   streamPath varsa → MNCDN canlı denenir, başarısızsa fallback
//   streamPath null ise → doğrudan fallback (Show TV mp4 vb.)
function resolveStreamUrl(episode) {
  if (!episode.streamPath) {
    return Promise.resolve(episode.fallback || null);
  }

  return fetchLiveUrl(episode.streamPath).then(function(liveUrl) {
    if (liveUrl) {
      console.log('[Stream] Live:', liveUrl);
      return liveUrl;
    }
    console.log('[Stream] Fallback:', episode.streamPath);
    return episode.fallback || null;
  });
}

module.exports = { resolveStreamUrl };
