/* Little Us · Articles (the blog)
   Shows the Articles list (/articles), single articles (/articles/<name>) and the "From the blog"
   section on the homepage. Articles are written in the admin (admin.html → Articles) and stored in
   the Supabase "articles" table. Loaded on demand by index.html; admin.html also uses it for previews. */
(function () {
  'use strict';
  if (window.LUArticles) return;

  var CFG = window.LU_CONFIG || {};
  var BASE = String(CFG.SUPABASE_URL || '').trim().replace(/\/+$/, '');
  var KEY = String(CFG.SUPABASE_KEY || '').trim();

  /* ===================== words ===================== */
  var CATS = {
    tips: { bg: '#DCEBFA', dot: '#7FB0E3', en: 'Tips for home & class', id: 'Tips di rumah & kelas' },
    tools: { bg: '#DDF2E4', dot: '#5DBB86', en: 'Tool guides', id: 'Panduan alat' },
    resources: { bg: '#FFE9DA', dot: '#F0694F', en: 'New resources', id: 'Materi baru' },
    bts: { bg: '#E9E1F7', dot: '#A58BD6', en: 'Behind the scenes', id: 'Di balik layar' }
  };
  var CAT_ORDER = ['tips', 'tools', 'resources', 'bts'];
  var MON = { en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'], id: ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'] };
  var S = {
    en: {
      home: 'Home', articles: 'Articles', all: 'All articles', latest: 'Latest', featured: 'Featured', readArticle: 'Read article', readMore: 'Read more…',
      min: 'min read', enOnly: 'English only', updated: 'Updated', onPage: 'On this page', tip: 'Quick tip', freeTool: 'Free tool', open: 'Open',
      fromShop: 'From the shop', seeRes: 'See resource', share: 'Share', copy: 'Copy link', copied: 'Link copied',
      aboutWriter: 'About the writer', role: 'Special education practitioner',
      bio: 'I’m a special education practitioner in Jakarta. I make every tool and resource on Little Us, and I write these articles myself.',
      moreAbout: 'More about me', keepReading: 'Keep reading', seeAll: 'See all articles →', loadMore: 'Show more articles',
      emptyH: 'No articles here yet', emptyP: 'Try another category, or browse all articles.', showAll: 'Show all articles',
      noneYetH: 'Articles are coming soon', noneYetP: 'We’re writing the first ones now. In the meantime, try the free tools or browse the shop.',
      tryTools: 'Try the free tools', nfH: 'This article isn’t here', nfP: 'It may have been renamed or taken down. Have a look at the other articles.',
      errH: 'Hmm, the articles didn’t load', errP: 'Check your connection and try again.', retry: 'Try again',
      fromBlog: 'From the blog', blogH: 'Tips, tool guides and new things', blogP: 'Practical ideas for home and the classroom, written by Haikal.',
      enOnlyNote: '', free: 'Free', pages: function (n) { return n + ' pages'; }
    },
    id: {
      home: 'Beranda', articles: 'Artikel', all: 'Semua artikel', latest: 'Terbaru', featured: 'Pilihan', readArticle: 'Baca artikel', readMore: 'Baca selengkapnya…',
      min: 'menit baca', enOnly: 'Hanya bahasa Inggris', updated: 'Diperbarui', onPage: 'Di halaman ini', tip: 'Tips singkat', freeTool: 'Alat gratis', open: 'Buka',
      fromShop: 'Dari toko', seeRes: 'Lihat materi', share: 'Bagikan', copy: 'Salin link', copied: 'Link disalin',
      aboutWriter: 'Tentang penulis', role: 'Praktisi pendidikan khusus',
      bio: 'Saya praktisi pendidikan khusus di Jakarta. Saya membuat semua alat dan materi di Little Us, dan menulis sendiri artikel-artikel ini.',
      moreAbout: 'Kenali saya lebih jauh', keepReading: 'Baca juga', seeAll: 'Lihat semua artikel →', loadMore: 'Tampilkan artikel lainnya',
      emptyH: 'Belum ada artikel di sini', emptyP: 'Coba kategori lain, atau lihat semua artikel.', showAll: 'Lihat semua artikel',
      noneYetH: 'Artikel segera hadir', noneYetP: 'Kami sedang menulis artikel pertama. Sementara itu, coba alat gratis atau lihat toko.',
      tryTools: 'Coba alat gratis', nfH: 'Artikel ini tidak ditemukan', nfP: 'Mungkin judulnya sudah diganti atau artikelnya sudah dihapus. Coba lihat artikel lainnya.',
      errH: 'Hmm, artikelnya gagal dimuat', errP: 'Cek koneksi internetmu, lalu coba lagi.', retry: 'Coba lagi',
      fromBlog: 'Dari blog', blogH: 'Tips, panduan alat, dan kabar terbaru', blogP: 'Ide praktis untuk di rumah dan di kelas, ditulis oleh Haikal.',
      enOnlyNote: 'Maaf, artikel ini baru tersedia dalam bahasa Inggris. Versi bahasa Indonesianya sedang saya tulis.',
      free: 'Gratis', pages: function (n) { return n + ' halaman'; }
    }
  };
  var TOOLS = {
    timer: { bg: '#DCEBFA', path: '/tools/timer', en: ['Visual Timer', 'A countdown your child can see, not just hear. Works on any phone, tablet or laptop.'], id: ['Visual Timer', 'Hitungan mundur yang bisa dilihat anak. Bisa dipakai di HP, tablet, atau laptop.'],
      ico: '<svg width="34" height="34" viewBox="0 0 20 20" aria-hidden="true"><circle cx="10" cy="10" r="8" fill="#fff" stroke="#2B2A35" stroke-width="1.6"/><path d="M10 10V2a8 8 0 0 1 7.6 10.5z" fill="#FFC94A" stroke="#2B2A35" stroke-width="1.6" stroke-linejoin="round"/></svg>' },
    tokens: { bg: '#FFF1C7', path: '/tools/tokens', en: ['Token Board', 'Your child earns stars towards a reward they chose.'], id: ['Token Board', 'Anak mengumpulkan bintang untuk hadiah pilihannya.'],
      ico: '<svg width="34" height="34" viewBox="0 0 20 20" aria-hidden="true"><path d="M10 2l2.4 5 5.4.6-4 3.7 1.1 5.4L10 14l-4.9 2.7 1.1-5.4-4-3.7 5.4-.6z" fill="#FFC94A" stroke="#2B2A35" stroke-width="1.4" stroke-linejoin="round"/></svg>' },
    ft: { bg: '#DDF2E4', path: '/tools/first-then', en: ['First–Then Board', 'Two pictures: what happens first, and what comes next.'], id: ['First–Then Board', 'Dua gambar: apa yang dilakukan dulu, dan apa yang dilakukan sesudahnya.'],
      ico: '<svg width="36" height="30" viewBox="0 0 22 18" aria-hidden="true"><rect x="1" y="3" width="8.5" height="12" rx="2" fill="#fff" stroke="#2B2A35" stroke-width="1.5"/><rect x="12.5" y="3" width="8.5" height="12" rx="2" fill="#FFC94A" stroke="#2B2A35" stroke-width="1.5"/></svg>' },
    sched: { bg: '#E9E1F7', path: '/tools/schedule', en: ['Visual Schedule', 'The steps of a routine in pictures, one at a time.'], id: ['Visual Schedule', 'Langkah rutinitas dalam gambar, satu per satu.'],
      ico: '<svg width="32" height="32" viewBox="0 0 20 20" aria-hidden="true"><rect x="3" y="2.5" width="14" height="4" rx="1.5" fill="#fff" stroke="#2B2A35" stroke-width="1.4"/><rect x="3" y="8" width="14" height="4" rx="1.5" fill="#FFC94A" stroke="#2B2A35" stroke-width="1.4"/><rect x="3" y="13.5" width="14" height="4" rx="1.5" fill="#fff" stroke="#2B2A35" stroke-width="1.4"/></svg>' },
    breathe: { bg: '#DCEBFA', path: '/tools/breathe', en: ['Breathing Buddy', 'A friendly buddy that breathes slowly, so your child can breathe along.'], id: ['Breathing Buddy', 'Karakter yang bernapas pelan, supaya anak bisa ikut bernapas bareng.'],
      ico: '<svg width="34" height="34" viewBox="0 0 20 20" aria-hidden="true"><path d="M10 2.5c3.3 0 5.3 2.4 5.3 5.4 0 3.4-2.6 6.4-5.3 6.7-2.7-.3-5.3-3.3-5.3-6.7 0-3 2-5.4 5.3-5.4Z" fill="#F6B3C2" stroke="#2B2A35" stroke-width="1.4"/><path d="M10 14.6c-.8 1.4.8 2 0 3" fill="none" stroke="#2B2A35" stroke-width="1.3" stroke-linecap="round"/></svg>' },
    feelings: { bg: '#E9E1F7', path: '/tools/feelings', en: ['Feelings Check-In', 'Your child shows how they feel, how big it is, and what helps.'], id: ['Feelings Check-In', 'Anak menunjukkan apa yang dirasakan, seberapa besar, dan apa yang membantu.'],
      ico: '<svg width="34" height="34" viewBox="0 0 20 20" aria-hidden="true"><circle cx="10" cy="10" r="7.6" fill="#FFE29A" stroke="#2B2A35" stroke-width="1.4"/><circle cx="7.4" cy="8.6" r="1" fill="#2B2A35"/><circle cx="12.6" cy="8.6" r="1" fill="#2B2A35"/><path d="M7 12q3 3 6 0" fill="none" stroke="#2B2A35" stroke-width="1.3" stroke-linecap="round"/></svg>' },
    worry: { bg: '#FBE0E6', path: '/tools/worry', en: ['Worry Jar', 'Drop a worry in, keep it safe, and talk about it later.'], id: ['Worry Jar', 'Masukkan rasa khawatir, simpan dengan aman, lalu bicarakan nanti.'],
      ico: '<svg width="34" height="34" viewBox="0 0 20 20" aria-hidden="true"><rect x="6" y="2.5" width="8" height="3" rx="1" fill="#F7A08C" stroke="#2B2A35" stroke-width="1.3"/><path d="M6.6 5.5h6.8c0 1 2.6 2 2.6 5v4.5c0 1.5-1 2.5-2.5 2.5h-7c-1.5 0-2.5-1-2.5-2.5V10.5c0-3 2.6-4 2.6-5Z" fill="#EEF6FD" stroke="#2B2A35" stroke-width="1.3"/><rect x="7.4" y="11.4" width="5" height="3.4" rx=".6" fill="#FFE29A" stroke="#2B2A35" stroke-width="1"/></svg>' }
  };
  var HEART = '<svg viewBox="0 0 64 60" aria-hidden="true"><path d="M31 54C24 49 6 37 6 21 6 12 12 6 20 6 26 6 30 10 32 15 34 10 38 6 44 6 52 6 58 12 58 21 58 34 46 44 38 50" fill="#fff" stroke="#2B2A35" stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round"/><path d="M38 50 46 57" stroke="#2B2A35" stroke-width="3.6" stroke-linecap="round"/><path d="M28 22V28M36 22V28" stroke="#2B2A35" stroke-width="3.4" stroke-linecap="round"/><path d="M24 34C28 39 36 39 40 34" fill="none" stroke="#2B2A35" stroke-width="3.2" stroke-linecap="round"/></svg>';

  function L() { return window.LU && LU.lang === 'id' ? 'id' : 'en'; }
  function s(k) { var v = S[L()][k]; return typeof v === 'function' ? v.apply(null, Array.prototype.slice.call(arguments, 1)) : v; }
  function esc(x) { return String(x == null ? '' : x).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function catName(c) { var k = CATS[c] || CATS.tips; return k[L()]; }

  /* ===================== data ===================== */
  var FIELDS = 'id,slug,category,status,featured,published_at,updated_at,cover_url,cover_alt_en,cover_alt_id,title_en,excerpt_en,body_en,meta_en,title_id,excerpt_id,body_id,meta_id';
  var CACHE = null, AT = 0, LOADING = null;
  function load(force) {
    if (CACHE && !force && Date.now() - AT < 5 * 60 * 1000) return Promise.resolve(CACHE);
    if (LOADING) return LOADING;
    if (!BASE || !KEY) return Promise.resolve([]);
    LOADING = fetch(BASE + '/rest/v1/articles?select=' + FIELDS + '&status=eq.published&order=published_at.desc', { headers: { apikey: KEY, Authorization: 'Bearer ' + KEY } })
      .then(function (r) {
        if (r.status === 404) return []; // the table hasn't been created yet
        return r.json().then(function (j) { if (!r.ok) { var e = new Error(j && j.message || 'HTTP ' + r.status); e.status = r.status; throw e; } return j; });
      })
      .then(function (rows) {
        var now = Date.now();
        CACHE = (rows || []).filter(function (a) { return new Date(a.published_at).getTime() <= now; });
        AT = Date.now();
        return CACHE;
      })
      .finally(function () { LOADING = null; });
    return LOADING;
  }

  /* ===================== helpers ===================== */
  function hasId(a) { return !!(a.title_id && String(a.title_id).trim() && Array.isArray(a.body_id) && a.body_id.length); }
  // the version to show: Indonesian if the site is in Indonesian and Kal has written it, otherwise English
  function ver(a) {
    var useId = L() === 'id' && hasId(a);
    var v = useId ? { title: a.title_id, ex: a.excerpt_id, body: a.body_id, meta: a.meta_id, alt: a.cover_alt_id || a.cover_alt_en, l: 'id' }
      : { title: a.title_en, ex: a.excerpt_en, body: a.body_en || [], meta: a.meta_en, alt: a.cover_alt_en, l: 'en' };
    v.enOnly = L() === 'id' && !useId;
    if (!v.ex) v.ex = firstText(v.body, 190);
    return v;
  }
  function plain(t) { return String(t || '').replace(/\*\*([^*]+)\*\*/g, '$1').replace(/\*([^*]+)\*/g, '$1').replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1'); }
  function firstText(body, max) {
    var p = (body || []).filter(function (b) { return b && b.t === 'p' && b.x; })[0];
    var t = p ? plain(p.x) : '';
    return t.length > max ? t.slice(0, max).replace(/\s+\S*$/, '') + '…' : t;
  }
  function words(body) {
    var n = 0;
    (body || []).forEach(function (b) {
      var t = b.x || b.cap || (b.items || []).join(' ');
      n += plain(t).split(/\s+/).filter(Boolean).length;
    });
    return n;
  }
  function mins(a) { var v = ver(a); return Math.max(1, Math.round((words(v.body) + plain(v.title).split(/\s+/).length) / 200)); }
  function coverOf(a) {
    if (a.cover_url) return a.cover_url;
    var v = ver(a), img = (v.body || []).filter(function (b) { return b && b.t === 'img' && b.url; })[0];
    return img ? img.url : '';
  }
  function fmtDate(iso) { var d = new Date(iso); return d.getDate() + ' ' + MON[L()][d.getMonth()] + ' ' + d.getFullYear(); }
  function link(a) { return '/articles/' + encodeURIComponent(a.slug); }
  function absUrl(a) { return location.origin + link(a); }
  // **bold**, *italic* and [words](https://link) inside a paragraph
  function inline(t) {
    var h = esc(t);
    h = h.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, function (m, txt, url) {
      var u = url.replace(/&amp;/g, '&');
      if (!/^(https?:\/\/|\/|#|mailto:)/i.test(u)) return txt;
      var ext = /^https?:\/\//i.test(u) && u.indexOf(location.host) < 0;
      return '<a href="' + esc(u) + '"' + (ext ? ' target="_blank" rel="noopener"' : '') + '>' + txt + '</a>';
    });
    h = h.replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>').replace(/(^|[^*])\*([^*\n]+)\*/g, '$1<em>$2</em>');
    return h.replace(/\n/g, '<br>');
  }

  /* ===================== rendering ===================== */
  function coverHTML(a, cls) {
    var c = coverOf(a), k = CATS[a.category] || CATS.tips, v = ver(a);
    return '<div class="ar-cover ' + (cls || '') + '" style="background:' + k.bg + '">' +
      (c ? '<img src="' + esc(c) + '" alt="' + esc(v.alt || v.title) + '" loading="lazy" decoding="async">' : '<span class="ar-cover-art">' + HEART + '</span>') +
      (v.enOnly ? '<span class="ar-en">EN</span>' : '') + '</div>';
  }
  function chip(c, extra) { var k = CATS[c] || CATS.tips; return '<span class="ar-cat" style="background:' + k.bg + '">' + esc(catName(c)) + '</span>' + (extra || ''); }
  function metaLine(a) { var v = ver(a); return esc(fmtDate(a.published_at) + ' · ' + mins(a) + ' ' + s('min') + (v.enOnly ? ' · ' + s('enOnly') : '')); }
  function cardHTML(a) {
    var v = ver(a);
    return '<a class="ar-card" href="' + link(a) + '">' + coverHTML(a) +
      '<div class="ar-cardtx">' + chip(a.category) + '<h3>' + esc(v.title) + '</h3><p>' + esc(v.ex) + '</p><span class="ar-meta">' + metaLine(a) + '</span>' +
      '<span class="ar-more">' + esc(s('readMore')) + '</span></div></a>';
  }
  function featuredHTML(a) {
    var v = ver(a);
    return '<a class="ar-feat" href="' + link(a) + '">' + coverHTML(a, 'big') +
      '<div class="ar-feattx"><div class="ar-chips"><span class="ar-cat" style="background:#FFC94A">' + esc(s(a.featured ? 'featured' : 'latest')) + '</span>' + chip(a.category) + '</div>' +
      '<h2>' + esc(v.title) + '</h2><p>' + esc(v.ex) + '</p><span class="ar-meta">' + metaLine(a) + '</span><span class="btn btn-primary">' + esc(s('readArticle')) + '</span></div></a>';
  }
  function toolCard(key, lang) {
    var T = TOOLS[key]; if (!T) return '';
    var t = T[lang || L()] || T.en;
    return '<div class="ar-tool" style="background:' + T.bg + '"><span class="ar-toolico">' + T.ico + '</span><div><span class="ar-free">' + esc(s('freeTool')) + '</span><b>' + esc(t[0]) + '</b><span>' + esc(t[1]) + '</span></div>' +
      '<a class="btn btn-primary" href="' + T.path + '">' + esc(s('open') + ' ' + t[0]) + '</a></div>';
  }
  function productShell(id) { return '<div class="ar-prod" data-pid="' + esc(id) + '"><div class="ar-prodcov"></div><div><small>' + esc(s('fromShop')) + '</small><b class="sk" style="display:block;width:180px;height:16px"></b></div></div>'; }
  function fillProducts(root) {
    var els = root.querySelectorAll('.ar-prod[data-pid]');
    if (!els.length || !window.LU || !LU.api || !LU.api.byIds) return;
    var ids = Array.prototype.map.call(els, function (e) { return e.dataset.pid; });
    LU.api.byIds(ids).then(function (list) {
      Array.prototype.forEach.call(els, function (el) {
        var p = (list || []).filter(function (x) { return x.id === el.dataset.pid; })[0];
        if (!p) { el.remove(); return; }
        var title = (LU.title ? LU.title(p) : p.title_en) || p.title_en, price = '';
        try { price = LU.isFree && LU.isFree(p) ? s('free') : (LU.priceText ? LU.priceText(p) : ''); } catch (e) { price = ''; }
        var cov = p.thumb_url || p.cover_url;
        el.innerHTML = '<div class="ar-prodcov">' + (cov ? '<img src="' + esc(cov) + '" alt="" loading="lazy">' : '') + '</div><div class="ar-prodtx"><small>' + esc(s('fromShop')) + '</small><b>' + esc(title) + '</b><small>' +
          esc([p.page_count ? s('pages', p.page_count) : '', String(price || '').replace(/<[^>]+>/g, '')].filter(Boolean).join(' · ')) + '</small></div><a class="btn btn-outline" href="/product/' + encodeURIComponent(p.id) + '">' + esc(s('seeRes')) + '</a>';
      });
    }).catch(function () {});
  }
  // the article body: an ordered list of blocks
  function bodyHTML(body, lang) {
    var h = '', n = 0;
    (body || []).forEach(function (b) {
      if (!b || !b.t) return;
      switch (b.t) {
        case 'p': if (b.x) h += '<p>' + inline(b.x) + '</p>'; break;
        case 'h2': if (b.x) h += '<h2 id="sec-' + (++n) + '">' + esc(b.x) + '</h2>'; break;
        case 'h3': if (b.x) h += '<h3>' + esc(b.x) + '</h3>'; break;
        case 'ul': h += '<ul class="ar-ul">' + (b.items || []).filter(Boolean).map(function (i) { return '<li><span></span><div>' + inline(i) + '</div></li>'; }).join('') + '</ul>'; break;
        case 'ol': h += '<ol class="ar-ol">' + (b.items || []).filter(Boolean).map(function (i, k) { return '<li><span>' + (k + 1) + '</span><div>' + inline(i) + '</div></li>'; }).join('') + '</ol>'; break;
        case 'tip': if (b.x) h += '<div class="ar-tip"><b>' + esc(s('tip')) + '</b><span>' + inline(b.x) + '</span></div>'; break;
        case 'quote': if (b.x) h += '<blockquote class="ar-quote">' + inline(b.x) + '</blockquote>'; break;
        case 'img': if (b.url) h += '<figure class="ar-fig' + (b.size === 'small' ? ' small' : '') + '"><img src="' + esc(b.url) + '" alt="' + esc(b.alt || '') + '" loading="lazy" decoding="async">' + (b.cap ? '<figcaption>' + esc(b.cap) + '</figcaption>' : '') + '</figure>'; break;
        case 'tool': h += toolCard(b.k, lang); break;
        case 'product': if (b.id) h += productShell(b.id); break;
      }
    });
    return h;
  }
  function tocOf(body) { var n = 0; return (body || []).filter(function (b) { return b && b.t === 'h2' && b.x; }).map(function (b) { return { id: 'sec-' + (++n), x: b.x }; }); }

  /* ===================== SEO: title, description, share preview, structured data ===================== */
  var DEF = null;
  function metaTag(sel, attr, name) {
    var m = document.querySelector(sel);
    if (!m) { m = document.createElement('meta'); m.setAttribute(attr, name); document.head.appendChild(m); }
    return m;
  }
  function setSeo(o) {
    if (!DEF) DEF = { desc: (document.querySelector('meta[name="description"]') || {}).content || '', ogT: (document.querySelector('meta[property="og:title"]') || {}).content || 'Little Us', ogD: (document.querySelector('meta[property="og:description"]') || {}).content || '', ogI: (document.querySelector('meta[property="og:image"]') || {}).content || '' };
    metaTag('meta[name="description"]', 'name', 'description').setAttribute('content', o.desc || DEF.desc);
    metaTag('meta[property="og:title"]', 'property', 'og:title').setAttribute('content', o.title || DEF.ogT);
    metaTag('meta[property="og:description"]', 'property', 'og:description').setAttribute('content', o.desc || DEF.ogD);
    metaTag('meta[property="og:image"]', 'property', 'og:image').setAttribute('content', o.image || DEF.ogI);
    metaTag('meta[property="og:type"]', 'property', 'og:type').setAttribute('content', o.ld ? 'article' : 'website');
    var ld = document.getElementById('arLd');
    if (o.ld) { if (!ld) { ld = document.createElement('script'); ld.type = 'application/ld+json'; ld.id = 'arLd'; document.head.appendChild(ld); } ld.textContent = JSON.stringify(o.ld); }
    else if (ld) ld.remove();
  }
  function resetSeo() { if (DEF) setSeo({}); }

  /* ===================== pages ===================== */
  var ROOT = null, KIND = null, ST = { cat: 'all', shown: 12, slug: '' }, CUR = null, STATE = 'loading';
  function crumbs(items) { return '<nav class="crumbs" aria-label="Breadcrumb">' + items.map(function (x, i) { return i < items.length - 1 ? '<a href="' + x[1] + '">' + esc(x[0]) + '</a><span>/</span>' : '<b>' + esc(x[0]) + '</b>'; }).join('') + '</nav>'; }
  function errorBox() { return '<div class="load-error"><b>' + esc(s('errH')) + '</b><p>' + esc(s('errP')) + '</p><button type="button" class="btn btn-dark btn-sm" data-ar-retry>' + esc(s('retry')) + '</button></div>'; }

  function renderIndex() {
    var h = crumbs([[s('home'), '/'], [s('articles')]]) + '<h1 class="ar-h1">' + esc(s('articles')) + '</h1>';
    if (STATE === 'loading') { ROOT.innerHTML = h + '<div class="ar-grid">' + [1, 2, 3].map(function () { return '<div class="sk" style="height:360px;border-radius:24px"></div>'; }).join('') + '</div>'; return; }
    if (STATE === 'error') { ROOT.innerHTML = h + errorBox(); return; }
    var all = CACHE || [];
    if (!all.length) {
      ROOT.innerHTML = h + '<div class="ar-empty"><span class="ar-emptyart">' + HEART + '</span><b>' + esc(s('noneYetH')) + '</b><p>' + esc(s('noneYetP')) + '</p><a class="btn btn-primary" href="/tools">' + esc(s('tryTools')) + '</a></div>';
      return;
    }
    var cats = CAT_ORDER.filter(function (c) { return all.some(function (a) { return a.category === c; }); });
    h += '<nav class="ar-chiprow" aria-label="Categories">' + [['all', s('all'), '#FFC94A']].concat(cats.map(function (c) { return [c, catName(c), CATS[c].dot]; })).map(function (c) {
      return '<button type="button" class="ar-filter' + (ST.cat === c[0] ? ' on' : '') + '" data-ar-cat="' + c[0] + '" aria-pressed="' + (ST.cat === c[0]) + '"><span style="background:' + c[2] + '"></span>' + esc(c[1]) + '</button>';
    }).join('') + '</nav>';
    var list = all.filter(function (a) { return ST.cat === 'all' || a.category === ST.cat; });
    if (!list.length) { ROOT.innerHTML = h + '<div class="ar-empty"><b>' + esc(s('emptyH')) + '</b><p>' + esc(s('emptyP')) + '</p><button type="button" class="btn btn-outline" data-ar-cat="all">' + esc(s('showAll')) + '</button></div>'; return; }
    var feat = list.filter(function (a) { return a.featured; })[0] || list[0];
    var rest = list.filter(function (a) { return a !== feat; });
    h += featuredHTML(feat) + '<div class="ar-grid">' + rest.slice(0, ST.shown - 1).map(cardHTML).join('') + '</div>';
    if (rest.length > ST.shown - 1) h += '<div class="ar-moreline"><button type="button" class="btn btn-outline" data-ar-more>' + esc(s('loadMore')) + '</button></div>';
    ROOT.innerHTML = h;
  }
  function renderArticle() {
    var a = CUR;
    if (STATE === 'loading') { ROOT.innerHTML = crumbs([[s('home'), '/'], [s('articles'), '/articles'], ['…']]) + '<div class="ar-head"><div class="sk" style="height:22px;width:120px"></div><div class="sk" style="height:46px;width:90%"></div><div class="sk" style="height:20px;width:70%"></div></div>'; return; }
    if (STATE === 'error') { ROOT.innerHTML = crumbs([[s('home'), '/'], [s('articles'), '/articles']]) + errorBox(); return; }
    if (!a) {
      ROOT.innerHTML = crumbs([[s('home'), '/'], [s('articles'), '/articles']]) + '<div class="ar-empty"><span class="ar-emptyart">' + HEART + '</span><b>' + esc(s('nfH')) + '</b><p>' + esc(s('nfP')) + '</p><a class="btn btn-primary" href="/articles">' + esc(s('all')) + '</a></div>';
      return;
    }
    ROOT.innerHTML = articleHTML(a, { related: true });
    wireArticle(ROOT, a);
    var v = ver(a);
    setSeo({
      title: v.title, desc: v.meta || v.ex, image: coverOf(a),
      ld: { '@context': 'https://schema.org', '@type': 'Article', headline: v.title, description: v.meta || v.ex, image: coverOf(a) ? [coverOf(a)] : undefined, datePublished: a.published_at, dateModified: a.updated_at || a.published_at,
        inLanguage: v.l === 'id' ? 'id-ID' : 'en', mainEntityOfPage: absUrl(a), author: { '@type': 'Person', name: 'Haikal Ilham Adlan', url: location.origin + '/about' }, publisher: { '@type': 'Organization', name: 'Little Us', logo: { '@type': 'ImageObject', url: location.origin + '/logo.png' } } }
    });
  }
  // shared by the site and by the admin preview
  function articleHTML(a, o) {
    o = o || {};
    var v = ver(a), toc = tocOf(v.body), showToc = toc.length > 1;
    var upd = a.updated_at && (new Date(a.updated_at) - new Date(a.published_at)) > 36 * 3600 * 1000 ? ' · ' + s('updated') + ' ' + fmtDate(a.updated_at) : '';
    // phones hide the breadcrumbs, so they get a back button to the list instead
    var h = (o.related ? '<a class="ar-back" href="/articles"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg>' + esc(s('articles')) + '</a>' : '') +
      crumbs([[s('home'), '/'], [s('articles'), '/articles'], [catName(a.category), '/articles?cat=' + a.category]]) +
      '<header class="ar-head' + (showToc ? ' wide' : '') + '">' + chip(a.category) + '<h1>' + esc(v.title) + '</h1>' + (v.ex ? '<p class="ar-dek">' + esc(v.ex) + '</p>' : '') +
      '<span class="ar-meta">' + esc(fmtDate(a.published_at) + ' · ' + mins(a) + ' ' + s('min')) + esc(upd) + '</span>' +
      (v.enOnly ? '<div class="ar-note" role="note"><span>EN</span><p>' + esc(s('enOnlyNote')) + '</p></div>' : '') + '</header>' +
      '<div class="ar-layout' + (showToc ? ' toc' : '') + '">' +
      (showToc ? '<aside class="ar-toc"><span>' + esc(s('onPage')) + '</span>' + toc.map(function (t) { return '<a href="#' + t.id + '" data-ar-toc="' + t.id + '">' + esc(t.x) + '</a>'; }).join('') + '</aside>' : '') +
      '<div class="ar-body">' + (a.cover_url ? '<figure class="ar-hero"><img src="' + esc(a.cover_url) + '" alt="' + esc(v.alt || v.title) + '"></figure>' : '') + bodyHTML(v.body, v.l) +
      '<div class="ar-share"><b>' + esc(s('share')) + '</b><a class="ar-pill" href="https://wa.me/?text=' + encodeURIComponent(v.title + ' ' + absUrl(a)) + '" target="_blank" rel="noopener">WhatsApp</a>' +
      '<a class="ar-pill" href="https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(absUrl(a)) + '" target="_blank" rel="noopener">Facebook</a>' +
      '<button type="button" class="ar-pill" data-ar-copy>' + esc(s('copy')) + '</button></div>' +
      '</div></div>';
    if (o.related) {
      var others = (CACHE || []).filter(function (x) { return x.id !== a.id; });
      var rel = others.filter(function (x) { return x.category === a.category; }).concat(others.filter(function (x) { return x.category !== a.category; })).slice(0, 3);
      if (rel.length) h += '<section class="ar-related"><div class="ar-sechead"><h2>' + esc(s('keepReading')) + '</h2><a href="/articles">' + esc(s('seeAll')) + '</a></div><div class="ar-grid">' + rel.map(cardHTML).join('') + '</div></section>';
    }
    return h;
  }
  function wireArticle(root, a) {
    fillProducts(root);
    var cp = root.querySelector('[data-ar-copy]');
    if (cp) cp.onclick = function () { var u = absUrl(a); if (window.LU && LU.copyText) LU.copyText(u); else try { navigator.clipboard.writeText(u); } catch (e) {} cp.textContent = s('copied'); };
    Array.prototype.forEach.call(root.querySelectorAll('[data-ar-toc]'), function (t) {
      t.onclick = function (e) { e.preventDefault(); e.stopPropagation(); var el = document.getElementById(t.dataset.arToc); if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 90, behavior: 'smooth' }); };
    });
  }
  function onClick(e) {
    var b = e.target.closest('[data-ar-cat],[data-ar-more],[data-ar-retry]');
    if (!b || !ROOT || !ROOT.contains(b)) return;
    if (b.dataset.arCat) {
      ST.cat = b.dataset.arCat; ST.shown = 12;
      try { history.replaceState(null, '', '/articles' + (ST.cat === 'all' ? '' : '?cat=' + ST.cat)); } catch (er) {}
      return render();
    }
    if (b.hasAttribute('data-ar-more')) { ST.shown += 12; return render(); }
    if (b.hasAttribute('data-ar-retry')) return start(true);
  }
  function start(force) {
    STATE = 'loading'; render();
    load(force).then(function () {
      STATE = 'ready';
      if (KIND === 'article') CUR = (CACHE || []).filter(function (a) { return a.slug === ST.slug; })[0] || null;
      render();
      if (window.LU && LU.page && KIND === 'article' && CUR) { try { document.title = ver(CUR).title + ' · Little Us'; } catch (e) {} }
    }).catch(function (err) { console.error('[Little Us] articles failed', err); STATE = 'error'; render(); });
  }
  function render() { if (!ROOT || !document.body.contains(ROOT)) return; if (KIND === 'index') renderIndex(); else renderArticle(); }

  /* ===================== homepage "From the blog" ===================== */
  var HOME = null;
  function homeRender() {
    if (!HOME || !document.body.contains(HOME)) return;
    var list = (CACHE || []).slice(0, 3);
    HOME.hidden = !list.length;
    if (!list.length) return;
    HOME.innerHTML = '<div class="h2-head"><div class="h2-headtx"><span class="eyebrow">' + esc(s('fromBlog')) + '</span><h2>' + esc(s('blogH')) + '</h2><p>' + esc(s('blogP')) + '</p></div><a class="link-strong" href="/articles">' + esc(s('seeAll')) + '</a></div><div class="ar-grid">' + list.map(cardHTML).join('') + '</div>';
  }

  /* ===================== styles ===================== */
  var CSS = [
    '.ar-page{display:flex;flex-direction:column;gap:22px}',
    '.crumbs{display:flex;flex-wrap:wrap;gap:6px;align-items:center}.crumbs span{color:#B5AEA3}',
    '.ar-back{align-self:flex-start;display:inline-flex;align-items:center;gap:4px;min-height:40px;padding:0 16px 0 10px;border-radius:999px;background:#fff;border:1px solid var(--line);color:var(--ink);font-weight:700;font-size:14.5px;text-decoration:none;margin-bottom:4px}',
    '.ar-h1{font:600 clamp(28px,3.2vw,40px)/1.1 Fredoka,sans-serif;margin:0}',
    '.ar-chiprow{display:flex;gap:8px;flex-wrap:wrap}',
    '.ar-filter{display:inline-flex;align-items:center;gap:8px;min-height:40px;padding:6px 14px;border-radius:999px;background:#fff;border:1px solid var(--line);font:600 13.5px Figtree,sans-serif;color:var(--ink);cursor:pointer}',
    '.ar-filter span{width:10px;height:10px;border-radius:50%}',
    '.ar-filter.on{background:var(--ink);border-color:var(--ink);color:#fff}',
    '.ar-cat{display:inline-flex;align-self:flex-start;font-size:11.5px;font-weight:700;padding:3px 10px;border-radius:99px;color:var(--ink)}',
    '.ar-chips{display:flex;gap:8px;flex-wrap:wrap}',
    '.ar-meta{font-size:13px;color:var(--muted)}',
    '.ar-cover{position:relative;aspect-ratio:16/10;border-radius:18px;overflow:hidden;display:flex;align-items:center;justify-content:center}',
    '.ar-cover img{width:100%;height:100%;object-fit:cover}',
    '.ar-cover-art{width:30%;max-width:110px;opacity:.95}.ar-cover-art svg{width:100%;height:auto}',
    '.ar-cover.big .ar-cover-art{max-width:150px}',
    '.ar-en{position:absolute;top:10px;right:10px;padding:3px 8px;border-radius:8px;background:rgba(255,255,255,.92);font-size:11px;font-weight:800;letter-spacing:.04em}',
    '.ar-feat{display:grid;grid-template-columns:1fr;gap:18px;padding:12px;border-radius:28px;background:#fff;border:1px solid var(--line);text-decoration:none;color:var(--ink);transition:box-shadow .2s}',
    '.ar-feat:hover{color:var(--ink);box-shadow:0 12px 30px rgba(120,70,40,.10)}',
    '.ar-feattx{display:flex;flex-direction:column;gap:12px;align-items:flex-start;padding:4px 8px 10px}',
    '.ar-feattx h2{font:600 clamp(24px,2.6vw,32px)/1.15 Fredoka,sans-serif}',
    '.ar-feattx p{font-size:15.5px;color:var(--body)}',
    '.ar-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(min(100%,280px),1fr));gap:24px 20px}',
    '.ar-card{display:flex;flex-direction:column;gap:12px;padding:10px 10px 18px;border-radius:24px;background:#fff;border:1px solid var(--line);text-decoration:none;color:var(--ink);transition:transform .15s,box-shadow .2s}',
    '.ar-card:hover{color:var(--ink);transform:translateY(-2px);box-shadow:0 10px 26px rgba(120,70,40,.08)}',
    '.ar-cardtx{display:flex;flex-direction:column;gap:8px;padding:0 8px}',
    '.ar-cardtx h3{font:600 19px/1.25 Fredoka,sans-serif;text-wrap:balance}',
    '.ar-cardtx p{font-size:14.5px;color:var(--body);display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}',
    '.ar-more{font-weight:700;font-size:14px;text-decoration:underline;text-underline-offset:4px;margin-top:2px}',
    '.ar-moreline{display:flex;justify-content:center}',
    '.ar-empty{display:flex;flex-direction:column;align-items:center;gap:10px;text-align:center;padding:40px 16px;border-radius:24px;background:var(--sand)}',
    '.ar-empty b{font:600 21px Fredoka,sans-serif}.ar-empty p{color:var(--body);max-width:460px}',
    '.ar-emptyart{width:64px}.ar-emptyart svg{width:100%;height:auto}',
    '.ar-head{max-width:720px;width:100%;margin:12px auto 0;display:flex;flex-direction:column;gap:14px;align-items:flex-start}',
    '.ar-head h1{font:600 clamp(30px,4vw,46px)/1.1 Fredoka,sans-serif}',
    '.ar-dek{font-size:clamp(16px,1.5vw,18.5px);line-height:1.5;color:var(--body)}',
    '.ar-note{width:100%;display:flex;gap:12px;align-items:flex-start;padding:12px 14px;border-radius:16px;background:var(--sky);font-size:14px;line-height:1.45}',
    '.ar-note>span{flex:none;height:24px;padding:0 7px;border-radius:7px;background:#fff;display:inline-flex;align-items:center;font-size:11px;font-weight:800;letter-spacing:.04em}',
    '.ar-layout{display:grid;grid-template-columns:minmax(0,720px);justify-content:center;gap:56px;margin-top:20px}',
    '.ar-toc{display:none}',
    '.ar-body{min-width:0;display:flex;flex-direction:column;gap:20px;font-size:17px;line-height:1.7;color:var(--body)}',
    '.ar-body h2{font:600 clamp(23px,2.2vw,27px)/1.2 Fredoka,sans-serif;color:var(--ink);margin-top:14px;scroll-margin-top:90px}',
    '.ar-body h3{font:600 20px/1.25 Fredoka,sans-serif;color:var(--ink);margin-top:6px}',
    '.ar-body a{color:var(--ink);font-weight:600}',
    '.ar-body b{color:var(--ink)}',
    '.ar-hero{margin:0;border-radius:20px;overflow:hidden;background:var(--sand)}.ar-hero img{width:100%;height:auto;max-height:480px;object-fit:cover}',
    '.ar-ul,.ar-ol{margin:0;padding:0;list-style:none;display:flex;flex-direction:column;gap:10px}',
    '.ar-ul li,.ar-ol li{display:flex;gap:12px;align-items:flex-start}',
    '.ar-ul li>span{flex:none;width:9px;height:9px;border-radius:50%;background:var(--heart);margin-top:11px}',
    '.ar-ol li>span{flex:none;width:28px;height:28px;border-radius:50%;background:var(--butter);color:var(--ink);font:600 15px/28px Fredoka,sans-serif;text-align:center;margin-top:1px}',
    '.ar-tip{display:flex;flex-direction:column;gap:4px;padding:16px 20px;border-radius:20px;background:var(--butter);color:var(--ink);font-size:16px;line-height:1.6}',
    '.ar-tip b{font:600 16px Fredoka,sans-serif}',
    '.ar-quote{margin:0;padding:6px 0 6px 20px;border-left:4px solid var(--sunny);font:500 20px/1.5 Fredoka,sans-serif;color:var(--ink)}',
    '.ar-fig{margin:4px 0}.ar-fig img{width:100%;height:auto;border-radius:18px;background:var(--sand)}.ar-fig.small{max-width:420px;align-self:center}',
    '.ar-fig figcaption{font-size:13.5px;color:var(--muted);margin-top:8px;text-align:center}',
    '.ar-tool{display:flex;flex-wrap:wrap;align-items:center;gap:16px 20px;padding:18px 20px;border-radius:24px;margin:6px 0}',
    '.ar-toolico{flex:none;width:64px;height:64px;border-radius:18px;background:#fff;display:flex;align-items:center;justify-content:center}',
    '.ar-tool>div{flex:1 1 220px;display:flex;flex-direction:column;gap:3px;color:var(--ink)}',
    '.ar-tool b{font:600 20px/1.25 Fredoka,sans-serif}.ar-tool>div>span:last-child{font-size:14.5px;line-height:1.45;color:var(--body)}',
    '.ar-free{align-self:flex-start;font-size:11px;font-weight:700;background:#fff;color:var(--success);padding:2px 8px;border-radius:99px;line-height:1.4}',
    '.ar-body .ar-tool .btn,.ar-body .ar-prod .btn{text-decoration:none;font-weight:700}',
    '.ar-prod{display:flex;flex-wrap:wrap;align-items:center;gap:14px 18px;padding:14px;border-radius:22px;background:#fff;border:1px solid var(--line);margin:6px 0}',
    '.ar-prodcov{flex:none;width:76px;aspect-ratio:4/5;border-radius:12px;background:var(--peach);overflow:hidden}.ar-prodcov img{width:100%;height:100%;object-fit:cover}',
    '.ar-prodtx{flex:1 1 200px;display:flex;flex-direction:column;gap:2px;color:var(--ink);line-height:1.35}',
    '.ar-prodtx small{font-size:12.5px;color:var(--muted);font-weight:600}.ar-prodtx b{font-size:16px}',
    '.ar-share{display:flex;flex-wrap:wrap;align-items:center;gap:10px;padding-top:20px;margin-top:8px;border-top:1px solid var(--line)}',
    '.ar-share b{font-size:14px;margin-right:4px}',
    '.ar-pill{display:inline-flex;align-items:center;min-height:42px;padding:4px 16px;border-radius:999px;background:#fff;border:1px solid var(--line);font:700 14px Figtree,sans-serif;text-decoration:none;color:var(--ink);cursor:pointer}',
    '.ar-pill:hover{color:var(--ink);border-color:var(--ink)}',
    '.ar-writer{display:flex;flex-wrap:wrap;gap:16px 20px;align-items:center;padding:20px;border-radius:24px;background:var(--sand);margin-top:8px}',
    '.ar-writer img{width:72px;height:72px;border-radius:50%;object-fit:cover;object-position:center top;background:var(--sky);flex:none}',
    '.ar-writer>div{flex:1 1 240px;display:flex;flex-direction:column;gap:3px;font-size:14.5px;line-height:1.5}',
    '.ar-writer b{font:600 19px Fredoka,sans-serif;color:var(--ink)}.ar-writer small{color:var(--muted);font-size:13px}',
    '.ar-writer a{font-weight:700;font-size:14px;margin-top:2px;align-self:flex-start}',
    '.ar-related{display:flex;flex-direction:column;gap:20px;margin-top:40px}',
    '.ar-sechead{display:flex;align-items:flex-end;justify-content:space-between;gap:16px;flex-wrap:wrap}',
    '.ar-sechead h2{font:600 clamp(22px,2.4vw,27px)/1.2 Fredoka,sans-serif}.ar-sechead a{font-size:14px;font-weight:700}',
    '#secBlog .ar-grid{grid-template-columns:repeat(auto-fit,minmax(min(100%,260px),1fr))}',
    '@media (min-width:960px){',
    '.ar-back{display:none}',
    '.ar-feat{grid-template-columns:minmax(0,1.1fr) minmax(0,1fr);align-items:center;gap:40px;padding:14px}',
    '.ar-feattx{padding:16px 24px 16px 0}',
    '.ar-head.wide{max-width:976px}',
    '.ar-layout.toc{grid-template-columns:200px minmax(0,720px)}',
    '.ar-toc{display:flex;flex-direction:column;gap:4px;position:sticky;top:90px;align-self:start}',
    '.ar-toc>span{font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--muted);padding-bottom:8px}',
    '.ar-toc a{display:block;padding:7px 0 7px 12px;border-left:2px solid var(--line);font-size:13.5px;line-height:1.35;font-weight:600;text-decoration:none;color:var(--body)}',
    '.ar-toc a:hover{border-left-color:var(--sunny);color:var(--ink)}',
    '}'
  ].join('');
  function css() { if (document.getElementById('arCss')) return; var st = document.createElement('style'); st.id = 'arCss'; st.textContent = CSS; document.head.appendChild(st); }
  css();
  document.addEventListener('click', onClick);

  window.LUArticles = {
    version: '1',
    CATS: CATS, CAT_ORDER: CAT_ORDER, TOOLS: TOOLS,
    // the site pages
    mount: function (kind, root) {
      KIND = kind; ROOT = root; CUR = null;
      var q = window.LU && LU.qs;
      if (kind === 'index') { ST.cat = (q && q.get('cat')) || 'all'; if (!CATS[ST.cat]) ST.cat = 'all'; ST.shown = 12; }
      else ST.slug = (q && q.get('slug')) || '';
      resetSeo();
      start(false);
    },
    render: render,
    unmount: function () { resetSeo(); ROOT = null; },
    title: function (kind) { if (kind === 'article' && CUR) return ver(CUR).title; return s('articles'); },
    // homepage section
    home: function (el) { HOME = el; homeRender(); load(false).then(homeRender).catch(function () {}); },
    homeRender: homeRender,
    // used by the admin preview
    articleHTML: function (a) { return articleHTML(a, {}); },
    wire: wireArticle, cardHTML: cardHTML, ver: ver, css: css, mins: mins
  };
})();
