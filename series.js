'use strict';

const TMDB_IMG = 'https://image.tmdb.org/t/p/w500';

// Poster URL'leri artık /poster/:id endpoint'inden dinamik olarak üretiliyor.
// TMDB poster_path bilinen diziler için sabit URL, bilinmeyenler için
// /poster/:id endpoint'i SVG döndürüyor.

// Bilinen TMDB poster path'leri (API çağrısı olmadan)
const KNOWN_POSTERS = {
  'startv_boru':           TMDB_IMG + '/oMuQPHuGYmSSAa9NHQFQL6KTxFE.jpg',
  'startv_atesbocegi':     TMDB_IMG + '/bFb5nCPZqSBiqXnDoV0DtdM3oFX.jpg', // tmdb 72893
  'kanald_kizilciksirbeti': TMDB_IMG + '/nOQtLbsRzBqTQX8FbOBfzFpNDj6.jpg',
  'kanald_yali_capkini':   TMDB_IMG + '/7IaHCGhRMm2IODsVECmfPfMjugT.jpg',
  'atv_kurulusoseman':     TMDB_IMG + '/gzODahVODDGRRxCg0TpbBiMGSVL.jpg',
  'atv_icerde':            TMDB_IMG + '/h8tGnBxlzFJCmP71JFGJkNWoBME.jpg', // tmdb 68388
  'showtv_yargi':          TMDB_IMG + '/A7EByudX0eqqBucQQeRkFjnoaWz.jpg',
  'showtv_kardeslerim':    TMDB_IMG + '/rPAKOxn8p8sSKDDLDkzUXkbOQ43.jpg',
  'foxtv_mucizedoktor':    TMDB_IMG + '/A5JHKEMOVaobXJMvmMbFLTWJJTG.jpg',
  'foxtv_senanlatkaradeniz': TMDB_IMG + '/zUn7KFMpFQKHpWMiHJPpfcxDjkB.jpg',
  'trt1_dirilis':          TMDB_IMG + '/yHhvSrTc5QKWG8TQs9m2fVflnZ9.jpg', // tmdb 66017
  'trt1_alparslan':        TMDB_IMG + '/aRBJPBbFlUAjSnZoWqNuvnFT7LH.jpg',
};

function getPosterUrl(seriesId, host) {
  if (KNOWN_POSTERS[seriesId]) return KNOWN_POSTERS[seriesId];
  // Bilinmeyen poster → yerel SVG endpoint
  return host + '/poster/' + seriesId + '.jpg';
}

const SERIES = [
  // ──────────── STAR TV ────────────
  {
    id: 'startv_boru',
    channel: 'startv',
    channelName: 'Star TV',
    name: 'Börü',
    year: 2018,
    description: 'Türkiye\'nin en büyük tehditleriyle karşı karşıya kalan polis özel harekat biriminin destanı.',
    tmdbId: 75365,
    episodes: [
      { title: 'Bölüm 1 - Bazen Canavarlar Kazanır', streamPath: 'boru/boru-bolum1-1080', fallback: 'https://startv-p2.mncdn.com/delivery/Dizi/boru/boru-bolum1-1080/chunklist.m3u8?st=jFVfh6jFlJRt2BiY32T--Q&e=1779828406' },
      { title: 'Bölüm 2 - Kar Gibi Beyaz',           streamPath: 'boru/boru2_tek',          fallback: 'https://startv-p2.mncdn.com/delivery/Dizi/boru/boru2_tek/chunklist.m3u8?st=b3pTukWVBhU5lxjq0hWz8Q&e=1779828411' },
      { title: 'Bölüm 3 - Çirkin Olsan Bile',        streamPath: 'boru/boru_xyz_3',         fallback: 'https://startv-p2.mncdn.com/delivery/Dizi/boru/boru_xyz_3/chunklist.m3u8?st=LKaMLF7_cOhFqHdeaG9-1w&e=1779828420' },
      { title: 'Bölüm 4 - Mahalle',                  streamPath: 'boru/boru4_kmd',          fallback: 'https://startv-p2.mncdn.com/delivery/Dizi/boru/boru4_kmd/chunklist.m3u8?st=gzW8eKf82LXIVTwAQdPB2w&e=1779828436' },
      { title: 'Bölüm 5 - Mahşerin Ayak Sesleri',   streamPath: 'boru/boru_bolum5_940yeni', fallback: 'https://startv-p2.mncdn.com/delivery/Dizi/boru/boru_bolum5_940yeni/chunklist.m3u8?st=Oq81PK3cC6Eku2vMQ_ly3g&e=1779828445' },
      { title: 'Özel Bölüm',                         streamPath: 'boru/boru_ozelbolum_2803', fallback: 'https://startv-p2.mncdn.com/delivery/Dizi/boru/boru_ozelbolum_2803/chunklist.m3u8?st=JEaUUVlQNwg3G2BtfhT7Eg&e=1779828454' },
      { title: 'Bölüm 6 - Her Güzel Şeyin Sonu',    streamPath: 'boru/boru6',              fallback: 'https://startv-p2.mncdn.com/delivery/Dizi/boru/boru6/chunklist.m3u8?st=0Te71FnUdhmhSUbyGKcihw&e=1779828458' },
    ]
  },
  {
    id: 'startv_atesbocegi',
    channel: 'startv',
    channelName: 'Star TV',
    name: 'Ateşböceği',
    year: 2017,
    description: 'İki zıt karakterin aşk hikayesini anlatan romantik drama dizisi.',
    tmdbId: 72893,
    episodes: [
      { title: 'Bölüm 1',      streamPath: 'atesbocegi/atesbocegi1_asds',   fallback: 'https://startv-p2.mncdn.com/delivery/Dizi/atesbocegi/atesbocegi1_asds/chunklist.m3u8?st=dHItWBUZ9izB5OmTmMGcFQ&e=1779828474&r=16' },
      { title: 'Bölüm 2',      streamPath: 'atesbocegi/atesbocegi2',         fallback: 'https://startv-p2.mncdn.com/delivery/Dizi/atesbocegi/atesbocegi2/chunklist.m3u8?st=0ZaPdNVY7YHhUNPEQTuJBQ&e=1779828493&r=16' },
      { title: 'Bölüm 3',      streamPath: 'atesbocegi/atesbocegi3',         fallback: 'https://startv-p2.mncdn.com/delivery/Dizi/atesbocegi/atesbocegi3/chunklist.m3u8?st=J5dQu6weAdRuhUo4axaJFQ&e=1779828505&r=16' },
      { title: 'Bölüm 4',      streamPath: 'atesbocegi/atesbocegi4_klmnd',  fallback: 'https://startv-p2.mncdn.com/delivery/Dizi/atesbocegi/atesbocegi4_klmnd/chunklist.m3u8?st=I9lMkDakwafLU-Gd_11vdA&e=1779828513&r=16' },
      { title: 'Bölüm 5',      streamPath: 'atesbocegi/atesbocegi5_lkmns',  fallback: 'https://startv-p2.mncdn.com/delivery/Dizi/atesbocegi/atesbocegi5_lkmns/chunklist.m3u8?st=VeuOXlk65j75KvWrUpcKsw&e=1779828524&r=1' },
      { title: 'Bölüm 6',      streamPath: 'atesbocegi/atesbocegi6',         fallback: 'https://startv-p2.mncdn.com/delivery/Dizi/atesbocegi/atesbocegi6/chunklist.m3u8?st=w3YLNKT43fhybibh1Ki3Lg&e=1779828533&r=1' },
      { title: 'Bölüm 7',      streamPath: 'atesbocegi/atesbocegi7_fgds',   fallback: 'https://startv-p2.mncdn.com/delivery/Dizi/atesbocegi/atesbocegi7_fgds/chunklist.m3u8?st=jotq_EQVaGkRb0RppXXEAg&e=1779828548&r=2' },
      { title: 'Bölüm 8',      streamPath: 'atesbocegi/atesbocegi8',         fallback: 'https://startv-p2.mncdn.com/delivery/Dizi/atesbocegi/atesbocegi8/chunklist.m3u8?st=YJBo7eNDurZc5LFyZaJXYw&e=1779828557&r=2' },
      { title: 'Bölüm 9',      streamPath: 'atesbocegi/atesbocegi9_klmnds', fallback: 'https://startv-p2.mncdn.com/delivery/Dizi/atesbocegi/atesbocegi9_klmnds/chunklist.m3u8?st=evfI8AvHnZrg57WRy7Dk2A&e=1779828567&r=2' },
      { title: 'Bölüm 10',     streamPath: 'atesbocegi/atesbocegi10',        fallback: 'https://startv-p2.mncdn.com/delivery/Dizi/atesbocegi/atesbocegi10/chunklist.m3u8?st=9DVxdPdrRmIdvMWom52yCA&e=1779828572&r=2' },
      { title: 'Bölüm 11',     streamPath: 'atesbocegi/atesbocegi11',        fallback: 'https://startv-p2.mncdn.com/delivery/Dizi/atesbocegi/atesbocegi11/chunklist.m3u8?st=Ynh9WLwF8ujrir2u4ruthw&e=1779828577&r=2' },
      { title: 'Bölüm 12',     streamPath: 'atesbocegi/atesbocegi12',        fallback: 'https://startv-p2.mncdn.com/delivery/Dizi/atesbocegi/atesbocegi12/chunklist.m3u8?st=87pW6BgvT2CBq9FgFAdj5w&e=1779828581&r=2' },
      { title: 'Bölüm 13',     streamPath: 'atesbocegi/atesbocegi13_lkmhn', fallback: 'https://startv-p2.mncdn.com/delivery/Dizi/atesbocegi/atesbocegi13_lkmhn/chunklist.m3u8?st=eqXLvxEUhui_VXs6pYE7Pw&e=1779828589&r=2' },
      { title: 'Bölüm 14',     streamPath: 'atesbocegi/atesbocegi14',        fallback: 'https://startv-p2.mncdn.com/delivery/Dizi/atesbocegi/atesbocegi14/chunklist.m3u8?st=e0tIySif_e1qdiLIiS-0bQ&e=1779828607&r=1' },
      { title: 'Bölüm 15',     streamPath: 'atesbocegi/atesbocegi15',        fallback: 'https://startv-p2.mncdn.com/delivery/Dizi/atesbocegi/atesbocegi15/chunklist.m3u8?st=I4-DdPhO7pWVROH_Anhw4Q&e=1779828622&r=1' },
      { title: 'Bölüm 16',     streamPath: 'atesbocegi/atesbocegi16_lkmgd', fallback: 'https://startv-p2.mncdn.com/delivery/Dizi/atesbocegi/atesbocegi16_lkmgd/chunklist.m3u8?st=-6uvCfTLSfEbqcJbAZ-K-w&e=1779828634&r=1' },
      { title: 'Final Bölümü', streamPath: 'atesbocegi/atesbocegi17',        fallback: 'https://startv-p2.mncdn.com/delivery/Dizi/atesbocegi/atesbocegi17/chunklist.m3u8?st=jvtkeuIcThxw_Xj2sLeWuw&e=1779828652&r=1' },
    ]
  },
  {
    id: 'startv_turkmali',
    channel: 'startv',
    channelName: 'Star TV',
    name: 'Türk Malı',
    year: 2021,
    description: 'Geleneksel bir ailenin modern dünyayla çatışmasını anlatan aile komedisi.',
    tmdbId: null,
    episodes: [
      { title: 'Bölüm 1', streamPath: 'turkmali/turkmali1bipsiz', fallback: 'https://startv-p2.mncdn.com/delivery/Dizi/turkmali/turkmali1bipsiz/chunklist.m3u8?st=0spFxuPpbR-T8Pf3IEcsxg&e=1779828665&r=1' },
      { title: 'Bölüm 2', streamPath: 'turkmali/turkmali2_hgdf',  fallback: 'https://startv-p2.mncdn.com/delivery/Dizi/turkmali/turkmali2_hgdf/chunklist.m3u8?st=nUb3vnKpz-r9e44lRldg_g&e=1779828678&r=1' },
      { title: 'Bölüm 3', streamPath: 'turkmali/turkmali3',        fallback: 'https://startv-p2.mncdn.com/delivery/Dizi/turkmali/turkmali3/chunklist.m3u8?st=x4gjQflZKsvKcqvICW5n6g&e=1779828692&r=1' },
      { title: 'Bölüm 4', streamPath: 'turkmali/turkmali4_ghfd',  fallback: 'https://startv-p2.mncdn.com/delivery/Dizi/turkmali/turkmali4_ghfd/chunklist.m3u8?st=Gwai1ED2568_Hjcl79xdFg&e=1779830227&r=1' },
      { title: 'Bölüm 5', streamPath: 'turkmali/tm5',              fallback: 'https://startv-p2.mncdn.com/delivery/Dizi/turkmali/tm5/chunklist.m3u8?st=-jMVulGGjx6Irbs9BYTGKg&e=1779828719&r=1' },
      { title: 'Bölüm 6', streamPath: 'turkmali/turkmali6sfinali', fallback: 'https://startv-p2.mncdn.com/delivery/Dizi/turkmali/turkmali6sfinali/chunklist.m3u8?st=AmYaWjhd6nilP7zCfwTQTA&e=1779828729&r=1' },
      { title: 'Bölüm 7', streamPath: 'turkmali/tm7',              fallback: 'https://startv-p2.mncdn.com/delivery/Dizi/turkmali/tm7/chunklist.m3u8?st=oKap78dvN2hruEaYL_bWXA&e=1779828738&r=3' },
      { title: 'Bölüm 8', streamPath: 'turkmali/turkmali8',        fallback: 'https://startv-p2.mncdn.com/delivery/Dizi/turkmali/turkmali8/chunklist.m3u8?st=ufEhS6HegpeBnv-M0jojSA&e=1779828755&r=1' },
    ]
  },

  // ──────────── KANAL D ────────────
  {
    id: 'kanald_kizilciksirbeti',
    channel: 'kanald',
    channelName: 'Kanal D',
    name: 'Kızılcık Şerbeti',
    year: 2022,
    description: 'İki farklı dünyadan ailenin çocuklarının evliliğiyle başlayan toplumsal çatışmaları konu alan dizi.',
    tmdbId: 232659,
    episodes: []
  },
  {
    id: 'kanald_yali_capkini',
    channel: 'kanald',
    channelName: 'Kanal D',
    name: 'Yalı Çapkını',
    year: 2022,
    description: 'İstanbul Boğazı\'nda geçen, köklü bir ailenin sırlarla dolu hikayesi.',
    tmdbId: 220427,
    episodes: []
  },
  {
    id: 'kanald_gulumse_kaderine',
    channel: 'kanald',
    channelName: 'Kanal D',
    name: 'Gülümse Kaderine',
    year: 2023,
    description: 'Kaderlerinin kesiştiği iki insanın beklenmedik aşk hikayesi.',
    tmdbId: null,
    episodes: []
  },

  // ──────────── ATV ────────────
  {
    id: 'atv_kurulusoseman',
    channel: 'atv',
    channelName: 'ATV',
    name: 'Kuruluş: Osman',
    year: 2019,
    description: 'Osmanlı İmparatorluğu\'nun kurucusu Osman Bey\'in destansı mücadelesini anlatan tarihi dizi.',
    tmdbId: 93411,
    episodes: []
  },
  {
    id: 'atv_icerde',
    channel: 'atv',
    channelName: 'ATV',
    name: 'İçerde',
    year: 2016,
    description: 'Suç örgütüne sızan genç bir polisin çift kimlikli yaşamını anlatan gerilim dizisi.',
    tmdbId: 68388,
    episodes: []
  },
  {
    id: 'atv_gelin_evi',
    channel: 'atv',
    channelName: 'ATV',
    name: 'Gelin Evi',
    year: 2014,
    description: 'Türk aile geleneklerini ve gelin-kaynana ilişkilerini işleyen eğlenceli program.',
    tmdbId: null,
    episodes: []
  },

  // ──────────── SHOW TV ────────────
  {
    id: 'showtv_yargi',
    channel: 'showtv',
    channelName: 'Show TV',
    name: 'Yargı',
    year: 2021,
    description: 'Bir cinayetin peşine düşen savcı ve avukatın arasındaki gerilimi anlatan hukuk draması.',
    tmdbId: 196075,
    episodes: []
  },
  {
    id: 'showtv_kardeslerim',
    channel: 'showtv',
    channelName: 'Show TV',
    name: 'Kardeşlerim',
    year: 2021,
    description: 'Ailelerini kaybeden dört kardeşin hayatta kalma mücadelesini anlatan dram.',
    tmdbId: 193764,
    episodes: []
  },
  {
    id: 'showtv_kaderimin_oyunu',
    channel: 'showtv',
    channelName: 'Show TV',
    name: 'Kaderimin Oyunu',
    year: 2020,
    description: 'Trajik bir kazanın hayatlarını değiştirdiği iki ailenin dramatik hikayesi.',
    tmdbId: null,
    episodes: []
  },

  // ──────────── FOX TV ────────────
  {
    id: 'foxtv_mucizedoktor',
    channel: 'foxtv',
    channelName: 'FOX TV',
    name: 'Mucize Doktor',
    year: 2019,
    description: 'Savant sendromlu genç doktorun hastane ortamında kendini ispat etme hikayesi.',
    tmdbId: 93812,
    episodes: []
  },
  {
    id: 'foxtv_senanlatkaradeniz',
    channel: 'foxtv',
    channelName: 'FOX TV',
    name: 'Sen Anlat Karadeniz',
    year: 2018,
    description: 'Karadeniz\'in doğasında, aile içi şiddetten kaçan güçlü bir kadının yeniden hayata tutunma hikayesi.',
    tmdbId: 80340,
    episodes: []
  },
  {
    id: 'foxtv_hayatbilgisi',
    channel: 'foxtv',
    channelName: 'FOX TV',
    name: 'Hayat Bilgisi',
    year: 2020,
    description: 'İş ve aşk hayatında dengeyi arayan bir kadının günlük maceralarını anlatan komedi.',
    tmdbId: null,
    episodes: []
  },

  // ──────────── TRT 1 ────────────
  {
    id: 'trt1_dirilis',
    channel: 'trt1',
    channelName: 'TRT 1',
    name: 'Diriliş: Ertuğrul',
    year: 2014,
    description: 'Osmanlı öncesi dönemde Ertuğrul Gazi\'nin Moğol ve Haçlı tehditlerine karşı verdiği mücadeleyi anlatan tarihi dizi.',
    tmdbId: 61766,
    episodes: []
  },
  {
    id: 'trt1_alparslan',
    channel: 'trt1',
    channelName: 'TRT 1',
    name: 'Alparslan: Büyük Selçuklu',
    year: 2021,
    description: 'Sultan Alparslan\'ın Bizans\'a karşı Malazgirt Zaferi\'ne giden yolda verdiği mücadeleyi anlatan tarihi dizi.',
    tmdbId: 195090,
    episodes: []
  },
  {
    id: 'trt1_gonuldagi',
    channel: 'trt1',
    channelName: 'TRT 1',
    name: 'Gönül Dağı',
    year: 2020,
    description: 'Anadolu\'nun küçük bir kasabasında, farklı insanların yaşam hikayelerini sıcak bir dille anlatan dizi.',
    tmdbId: null,
    episodes: []
  },
];

const CHANNELS = {
  startv:  { name: 'Star TV',  logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5d/Star_TV_logo.svg/200px-Star_TV_logo.svg.png' },
  kanald:  { name: 'Kanal D',  logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/Kanal_D_logo.svg/200px-Kanal_D_logo.svg.png' },
  atv:     { name: 'ATV',      logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7c/ATV_logo.svg/200px-ATV_logo.svg.png' },
  showtv:  { name: 'Show TV',  logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/Show_TV_logo.svg/200px-Show_TV_logo.svg.png' },
  foxtv:   { name: 'FOX TV',   logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/43/FOX_TV_Turkey_logo.svg/200px-FOX_TV_Turkey_logo.svg.png' },
  trt1:    { name: 'TRT 1',    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/94/TRT_1_logo_2021.svg/200px-TRT_1_logo_2021.svg.png' },
};

function getSeriesById(id) {
  return SERIES.find(function(s) { return s.id === id; }) || null;
}

function getSeriesByChannel(channelId) {
  return SERIES.filter(function(s) { return s.channel === channelId; });
}

module.exports = { SERIES, CHANNELS, KNOWN_POSTERS, getPosterUrl, getSeriesById, getSeriesByChannel };
