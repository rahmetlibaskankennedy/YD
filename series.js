'use strict';

const TMDB_IMG = 'https://image.tmdb.org/t/p/w500';

const SERIES = [
  // ──────────── STAR TV ────────────
  {
    id: 'startv_boru',
    channel: 'startv',
    channelName: 'Star TV',
    name: 'Börü',
    year: 2018,
    description: 'Türkiye\'nin en büyük tehditleriyle karşı karşıya kalan polis özel harekat biriminin destanı.',
    poster: TMDB_IMG + '/oMuQPHuGYmSSAa9NHQFQL6KTxFE.jpg',
    tmdbId: 75365,
    episodes: [
      { title: 'Bölüm 1 - Bazen Canavarlar Kazanır', streamPath: 'boru/boru-bolum1-1080', fallback: 'https://startv-p2.mncdn.com/delivery/Dizi/boru/boru-bolum1-1080/chunklist.m3u8?st=jFVfh6jFlJRt2BiY32T--Q&e=1779828406' },
      { title: 'Bölüm 2 - Kar Gibi Beyaz',           streamPath: 'boru/boru2_tek',          fallback: 'https://startv-p2.mncdn.com/delivery/Dizi/boru/boru2_tek/chunklist.m3u8?st=8uI850r2F1yE8A6hWzLPrg&e=1779828406' },
      { title: 'Bölüm 3 - Çirkin Olsan Bile',        streamPath: 'boru/boru3_tek_yeni',     fallback: 'https://startv-p2.mncdn.com/delivery/Dizi/boru/boru3_tek_yeni/chunklist.m3u8?st=W2Yf66-3Qc79iFm9rBfX2Q&e=1779828406' },
      { title: 'Bölüm 4 - Mahalle Esnafı',           streamPath: 'boru/boru4_tek_yeni',     fallback: 'https://startv-p2.mncdn.com/delivery/Dizi/boru/boru4_tek_yeni/chunklist.m3u8?st=lE8Zp9zQpYg6eT6hWzLPrg&e=1779828406' },
      { title: 'Bölüm 5 - Mahşer Günü',              streamPath: 'boru/boru5_tek_yeni',     fallback: 'https://startv-p2.mncdn.com/delivery/Dizi/boru/boru5_tek_yeni/chunklist.m3u8?st=mE8Zp9zQpYg6eT6hWzLPrg&e=1779828406' },
      { title: 'Bölüm 6 - En Son Katılanlar (Final)', streamPath: 'boru/boru6_final_tek',    fallback: 'https://startv-p2.mncdn.com/delivery/Dizi/boru/boru6_final_tek/chunklist.m3u8?st=oE8Zp9zQpYg6eT6hWzLPrg&e=1779828406' }
    ]
  },
  {
    id: 'startv_atesbocegi',
    channel: 'startv',
    channelName: 'Star TV',
    name: 'Ateşböceği',
    year: 2017,
    description: 'Başarılı bir avukat olan Barış ile hayat dolu taksi şoförü Aslı\'nın yollarının kesişme hikayesi.',
    poster: 'https://placehold.co/300x450/1a1a2e/ffffff?text=Atesbocegi',
    tmdbId: 72635, // TMDB ID düzeltildi, dinamik poster doğrudan çekilecek
    episodes: [
      { title: 'Bölüm 1', streamPath: 'atesbocegi/atesbocegi1_tek', fallback: 'https://startv-p2.mncdn.com/delivery/Dizi/atesbocegi/atesbocegi1_tek/chunklist.m3u8?st=gFVfh6jFlJRt2BiY32T--Q&e=1779828406' },
      { title: 'Bölüm 2', streamPath: 'atesbocegi/atesbocegi2_tek', fallback: 'https://startv-p2.mncdn.com/delivery/Dizi/atesbocegi/atesbocegi2_tek/chunklist.m3u8?st=hFVfh6jFlJRt2BiY32T--Q&e=1779828406' }
    ]
  },
  {
    id: 'startv_turkmali',
    channel: 'startv',
    channelName: 'Star TV',
    name: 'Türk Malı',
    year: 2017,
    description: 'Kuzu ailesinin modern hayata ayak uydurma çabaları ve komik maceraları.',
    poster: 'https://placehold.co/300x450/1a1a2e/ffffff?text=Turk+Mali',
    tmdbId: null,
    tmdbQuery: 'Türk Malı', // TMDB araması için Türkçe karakter desteği eklendi
    episodes: [
      { title: 'Bölüm 1', streamPath: 'turkmali/turkmali1_tek', fallback: 'https://startv-p2.mncdn.com/delivery/Dizi/turkmali/turkmali1_tek/chunklist.m3u8?st=iFVfh6jFlJRt2BiY32T--Q&e=1779828406' }
    ]
  },

  // ──────────── KANAL D ────────────
  {
    id: 'kanald_kizilcik',
    channel: 'kanald',
    channelName: 'Kanal D',
    name: 'Kızılcık Şerbeti',
    year: 2022,
    description: 'Farklı kültürlere sahip iki ailenin çocuklarının evlenmesiyle başlayan olaylar.',
    poster: 'https://placehold.co/300x450/1a1a2e/ffffff?text=Kizilcik+Serbeti',
    tmdbId: 213715, // TMDB ID eklendi
    episodes: []
  },
  {
    id: 'kanald_yalicapkini',
    channel: 'kanald',
    channelName: 'Kanal D',
    name: 'Yalı Çapkını',
    year: 2022,
    description: 'Gaziantepli koruyucu bir ailenin sorumsuz oğullarını evlendirmesiyle gelişen olaylar.',
    poster: 'https://placehold.co/300x450/1a1a2e/ffffff?text=Yali+Capkini',
    tmdbId: 211244, // TMDB ID eklendi
    episodes: []
  },

  // ──────────── ATV ────────────
  {
    id: 'atv_kurulusosman',
    channel: 'atv',
    channelName: 'ATV',
    name: 'Kuruluş: Osman',
    year: 2019,
    description: 'Osman Bey\'in Osmanlı İmparatorluğu\'nu kurma mücadelesi.',
    poster: 'https://placehold.co/300x450/1a1a2e/ffffff?text=Kurulus+Osman',
    tmdbId: 96102, // TMDB ID eklendi
    episodes: []
  },

  // ──────────── SHOW TV ────────────
  {
    id: 'showtv_yargi',
    channel: 'showtv',
    channelName: 'Show TV',
    name: 'Yargı',
    year: 2021,
    description: 'Bir cinayet vakasıyla yolları kesişen bir savcı ve bir avukatın hikayesi.',
    poster: 'https://placehold.co/300x450/1a1a2e/ffffff?text=Yargi',
    tmdbId: 133709, // TMDB ID eklendi
    episodes: []
  },

  // ──────────── FOX TV ────────────
  {
    id: 'foxtv_mucizedoktor',
    channel: 'foxtv',
    channelName: 'FOX TV',
    name: 'Mucize Doktor',
    year: 2019,
    description: 'Savant sendromu olan otizmli bir cerrahi asistanın taşrada başlayan ve özel bir hastanede devam eden hikayesi.',
    poster: 'https://placehold.co/300x450/1a1a2e/ffffff?text=Mucize+Doktor',
    tmdbId: 93259, // TMDB ID eklendi
    episodes: []
  },

  // ──────────── TRT 1 ────────────
  {
    id: 'trt1_dirilis',
    channel: 'trt1',
    channelName: 'TRT 1',
    name: 'Diriliş: Ertuğrul',
    year: 2014,
    description: '13. yüzyılda Ertuğrul Gazi\'nin tapınak şövalyeleri ve Moğollara karşı verdiği mücadele.',
    poster: 'https://placehold.co/300x450/1a1a2e/ffffff?text=Dirilis+Ertugrul',
    tmdbId: 62002, // TMDB ID eklendi
    episodes: []
  },
  {
    id: 'trt1_gonuldagi',
    channel: 'trt1',
    channelName: 'TRT 1',
    name: 'Gönül Dağı',
    year: 2020,
    description: 'Anadolu\'nun küçük bir kasabasında, farklı insanların yaşam hikayelerini sıcak bir dille anlatan dizi.',
    poster: 'https://placehold.co/300x450/1a1a2e/ffffff?text=Gonul+Dagi',
    tmdbId: 112093, // TMDB ID eklendi
    episodes: []
  },
];

const CHANNELS = {
  startv:  { name: 'Star TV',  logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5d/Star_TV_logo.svg/200px-Star_TV_logo.svg.png' },
  kanald:  { name: 'Kanal D',  logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/Kanal_D_logo.svg/200px-Kanal_D_logo.svg.png' },
  atv:     { name: 'ATV',      logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7c/ATV_logo.svg/200px-ATV_logo.svg.png' },
  showtv:  { name: 'Show TV',  logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/Show_TV_logo.svg/200px-Show_TV_logo.svg.png' },
  foxtv:   { name: 'FOX TV',   logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Fox_Televizyonu_logo.svg/200px-Fox_Televizyonu_logo.svg.png' },
  trt1:    { name: 'TRT 1',    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b2/TRT_1_logo_%282021%29.svg/200px-TRT_1_logo_%282021%29.svg.png' }
};

function getSeriesById(id) {
  return SERIES.find(s => s.id === id);
}

function getSeriesByChannel(channel) {
  return SERIES.filter(s => s.channel === channel);
}

module.exports = {
  SERIES: SERIES,
  CHANNELS: CHANNELS,
  getSeriesById: getSeriesById,
  getSeriesByChannel: getSeriesByChannel
};
