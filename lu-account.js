/* little us · accounts and Little Us Plus
   Free accounts (email + password), the child setup that follows a parent to every device,
   Little Us Plus passes bought on Gumroad or Midtrans (3 or 12 months, never renews), locked tool styles,
   Plus downloads and the account pages.
   Needs: window.LU_CONFIG (SUPABASE_URL, SUPABASE_KEY) and the shop script in index.html.
   Everything that decides access lives in Supabase (profiles.plus_until, plus_features). */
(function () {
  'use strict';
  if (window.LUAcc) return;

  var CFG = window.LU_CONFIG || {};
  var SB = String(CFG.SUPABASE_URL || '').replace(/\/+$/, '');
  var KEY = CFG.SUPABASE_KEY || '';
  var ON = !!(SB && KEY);
  var ORIGIN = location.origin;

  /* ===================== small helpers ===================== */
  var store = {
    get: function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { localStorage.setItem(k, v); } catch (e) {} },
    del: function (k) { try { localStorage.removeItem(k); } catch (e) {} },
    json: function (k, d) { try { var v = JSON.parse(localStorage.getItem(k)); return v == null ? d : v; } catch (e) { return d; } },
    setJson: function (k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  };
  var ss = {
    json: function (k, d) { try { var v = JSON.parse(sessionStorage.getItem(k)); return v == null ? d : v; } catch (e) { return d; } },
    setJson: function (k, v) { try { sessionStorage.setItem(k, JSON.stringify(v)); } catch (e) {} },
    del: function (k) { try { sessionStorage.removeItem(k); } catch (e) {} }
  };
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function L() { return (window.LU && LU.lang) || store.get('lu_lang') || 'en'; }
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function go(h, rep) { if (window.LU && LU.go) LU.go(h, rep); else location.href = h.replace(/^#/, ''); }
  function validEmail(e) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(e || '').trim()); }
  var MONTHS = {
    en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    id: ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']
  };
  function fmtDate(d, noYear) { d = new Date(d); if (isNaN(d)) return ''; return d.getDate() + ' ' + MONTHS[L() === 'id' ? 'id' : 'en'][d.getMonth()] + (noYear ? '' : ' ' + d.getFullYear()); }
  function addMonths(d, m) { d = new Date(d); var day = d.getDate(); d.setMonth(d.getMonth() + m); if (d.getDate() < day) d.setDate(0); return d; }
  function initials(n) { return String(n || '?').trim().split(/\s+/).map(function (w) { return w[0] || ''; }).join('').slice(0, 1).toUpperCase() || '?'; }
  function firstName(n) { return String(n || '').trim().split(/\s+/)[0] || ''; }
  function toast(msg, kind) { if (window.LU && LU.toast) LU.toast(msg, { kind: kind || 'info' }); }

  /* ===================== words ===================== */
  var W = {
    // shared
    back: ['Back', 'Kembali'], close: ['Close', 'Tutup'], backToLU: ['Back to Little Us', 'Kembali ke Little Us'],
    name: ['Your name', 'Nama kamu'], email: ['Email', 'Email'], password: ['Password', 'Kata sandi'], confirmPw: ['Confirm password', 'Ulangi kata sandi'],
    min8: ['At least 8 characters', 'Minimal 8 karakter'], pwMatch: ['Passwords match', 'Kata sandi cocok'], pwNoMatch: ["Passwords don't match yet", 'Kata sandi belum cocok'],
    show: ['Show password', 'Tampilkan kata sandi'], hide: ['Hide password', 'Sembunyikan kata sandi'],
    netErr: ["We couldn't reach Little Us. Check your internet and try again.", 'Tidak bisa terhubung ke Little Us. Cek internetmu lalu coba lagi.'],
    notReady: ['Accounts are not switched on yet.', 'Akun belum diaktifkan.'],
    terms: ['By continuing you agree to our <a href="#/terms">Terms</a> and <a href="#/privacy">Privacy Policy</a>.', 'Dengan melanjutkan, kamu setuju dengan <a href="#/terms">Syarat</a> dan <a href="#/privacy">Kebijakan Privasi</a> kami.'],
    plus: ['PLUS', 'PLUS'], free: ['FREE', 'GRATIS'], recommended: ['RECOMMENDED', 'DISARANKAN'],
    // A01/A02
    createH: ['Create your free account', 'Buat akun gratis'],
    createIntro: [function (c) { return 'Optional and free. Set up ' + c + ' once and find everything on your phone, tablet and computer.'; }, function (c) { return 'Opsional dan gratis. Atur ' + c + ' sekali, lalu semuanya ada di HP, tablet, dan komputermu.'; }],
    yourChild: ['your child', 'anakmu'],
    contEmail: ['Continue with email', 'Lanjut dengan email'],
    includes: ['A free account includes', 'Akun gratis berisi'],
    inc1: ['Your child’s setup on every phone, tablet and computer', 'Pengaturan anakmu di setiap HP, tablet, dan komputer'],
    inc2: ['Boards, rewards and characters kept if you change devices', 'Papan, hadiah, dan karakter tetap ada saat ganti perangkat'],
    inc3: ['Upgrade to Little Us Plus whenever you want', 'Upgrade ke Little Us Plus kapan saja'],
    sideH: ['One free account, every device', 'Satu akun gratis, semua perangkat'],
    sideNote: ['Every tool works without an account.', 'Semua alat tetap bisa dipakai tanpa akun.'],
    haveAcc: ['Already have an account?', 'Sudah punya akun?'], logIn: ['Log in', 'Masuk'],
    createBtn: ['Create account', 'Buat akun'], weEmail: ["We'll email you a link to confirm.", 'Kami akan mengirim link konfirmasi ke emailmu.'],
    eName: ['Please add your name.', 'Isi namamu dulu ya.'], eEmail: ['Please check the email address.', 'Cek lagi alamat emailnya ya.'],
    ePw: ['Use at least 8 characters.', 'Gunakan minimal 8 karakter.'], ePw2: ['The two passwords are different.', 'Kedua kata sandi belum sama.'],
    // A03
    hasAccH: ['Good news, you already have an account', 'Kabar baik, kamu sudah punya akun'],
    hasAccP: [function (e) { return e + ' is already with Little Us. Log in and pick up where you left off.'; }, function (e) { return e + ' sudah terdaftar di Little Us. Masuk dan lanjutkan dari terakhir kali.'; }],
    logInWith: ['Log in with this email', 'Masuk dengan email ini'], forgot: ['Forgot password?', 'Lupa kata sandi?'],
    // A04
    checkH: ['Check your email to confirm your account', 'Cek emailmu untuk konfirmasi akun'],
    checkP: [function (e) { return 'We sent a link to <b>' + e + '</b>. Tap it and you’ll go straight to your dashboard.'; }, function (e) { return 'Kami mengirim link ke <b>' + e + '</b>. Ketuk link itu dan kamu langsung masuk.'; }],
    cantFind: ['Can’t find it? Look in Spam or Promotions. The link works for 24 hours.', 'Tidak ketemu? Cek folder Spam atau Promosi. Link berlaku 24 jam.'],
    openMail: ['Open email app', 'Buka aplikasi email'], resend: ['Resend email', 'Kirim ulang email'], sentAgain: ['Sent again', 'Sudah dikirim ulang'],
    wrongEmail: ['Wrong email? Change it', 'Email salah? Ganti'],
    confirmedToast: ['Email confirmed. Welcome to Little Us!', 'Email terkonfirmasi. Selamat datang di Little Us!'],
    // A05
    welcomeBack: ['Welcome back', 'Selamat datang kembali'], loginP: ['Log in to use your Plus pass and your child’s setup on this device.', 'Masuk untuk memakai pass Plus dan pengaturan anakmu di perangkat ini.'],
    newHere: ['New here?', 'Baru di sini?'], createFree: ['Create a free account', 'Buat akun gratis'],
    badLogin: ['That password doesn’t match. Try again or reset it.', 'Kata sandi tidak cocok. Coba lagi atau atur ulang.'],
    notConfirmed: ['Please confirm your email first. We can send the link again.', 'Konfirmasi emailmu dulu ya. Kami bisa kirim ulang link-nya.'],
    sendAgain: ['Send the link again', 'Kirim ulang link'], lastUsed: ['Last used', 'Terakhir dipakai'],
    // A06/A07
    resetH: ['Reset your password', 'Atur ulang kata sandi'], resetP: ['Enter the email you use for Little Us. We’ll send a link to set a new password.', 'Masukkan email yang kamu pakai di Little Us. Kami akan kirim link untuk membuat kata sandi baru.'],
    sendReset: ['Send reset link', 'Kirim link'], backLogin: ['Back to log in', 'Kembali ke halaman masuk'],
    inboxH: ['Check your inbox', 'Cek kotak masukmu'],
    inboxP: [function (e) { return 'If <b>' + e + '</b> has a Little Us account, a reset link is on its way. It works for 1 hour.'; }, function (e) { return 'Jika <b>' + e + '</b> punya akun Little Us, link untuk atur ulang sedang dikirim. Berlaku 1 jam.'; }],
    resendLink: ['Resend link', 'Kirim ulang link'],
    // A08/A09
    newPwH: ['Set a new password', 'Buat kata sandi baru'], forE: [function (e) { return 'For ' + e; }, function (e) { return 'Untuk ' + e; }],
    newPw: ['New password', 'Kata sandi baru'], typeAgain: ['Type it again', 'Ketik ulang'], saveNewPw: ['Save new password', 'Simpan kata sandi baru'],
    expiredLink: ['This link has expired', 'Link ini sudah kedaluwarsa'], expiredP: ['Reset links work for 1 hour. Send a new one and use it straight away.', 'Link berlaku 1 jam. Kirim link baru dan langsung pakai.'],
    sendNew: ['Send a new link', 'Kirim link baru'],
    pwUpdated: ['Password updated', 'Kata sandi diperbarui'],
    pwUpdatedP: [function (e) { return 'You’re logged in. Next time, use your new password with ' + e + '.'; }, function (e) { return 'Kamu sudah masuk. Lain kali, pakai kata sandi baru dengan ' + e + '.'; }],
    goDash: ['Go to my dashboard', 'Ke beranda saya'],
    // plans
    upgradeH: ['Upgrade to Little Us Plus', 'Upgrade ke Little Us Plus'],
    moreForH: [function (c) { return 'More for ' + c + ', every download for you'; }, function (c) { return 'Lebih banyak untuk ' + c + ', semua unduhan untukmu'; }],
    choosePass: ['Choose a pass. You pay once and it simply ends; nothing renews.', 'Pilih pass. Bayar sekali lalu selesai; tidak ada perpanjangan otomatis.'],
    choosePlan: ['Choose a plan', 'Pilih paket'], m3: ['3 Months', '3 Bulan'], m12: ['12 Months', '12 Bulan'], bestValue: ['BEST VALUE', 'PALING HEMAT'],
    plusUntil: [function (d) { return 'Plus until ' + d; }, function (d) { return 'Plus sampai ' + d; }],
    plusFromToday: ['Plus from today until', 'Plus mulai hari ini sampai'], plusAddedUntil: ['Plus now runs until', 'Plus sekarang berlaku sampai'],
    contPay: [function (p) { return 'Continue to payment · ' + p; }, function (p) { return 'Lanjut ke pembayaran · ' + p; }],
    contCheckout: [function (p) { return 'Continue to checkout · ' + p; }, function (p) { return 'Lanjut ke pembayaran · ' + p; }],
    addedTo: [function (e) { return 'Plus is added to <b>' + e + '</b>.'; }, function (e) { return 'Plus ditambahkan ke <b>' + e + '</b>.'; }],
    opensTab: ['You choose how to pay on the next step', 'Kamu memilih cara membayar di langkah berikutnya'],
    oneTime: ['One-time payment, no automatic renewal', 'Sekali bayar, tanpa perpanjangan otomatis'],
    oneTimeP: ['Payment is handled securely by Gumroad or Midtrans. You don’t need an account with either.', 'Pembayaran diproses dengan aman oleh Gumroad atau Midtrans. Kamu tidak perlu akun di keduanya.'],
    payH: ['How would you like to pay?', 'Mau bayar dengan apa?'], payHP: ['You pay once. Plus ends by itself and never renews.', 'Kamu membayar sekali. Plus berakhir sendiri dan tidak diperpanjang otomatis.'],
    payGum: ['Card or PayPal', 'Kartu atau PayPal'], payGumP: ['Visa, Mastercard, American Express and PayPal. Paid in US dollars through Gumroad.', 'Visa, Mastercard, American Express, dan PayPal. Dibayar dalam dolar AS lewat Gumroad.'],
    payMid: ['GoPay, QRIS and bank transfer', 'GoPay, QRIS, dan transfer bank'], payMidP: ['Mandiri, BRI, BNI, PermataBank and more. Paid in rupiah through Midtrans.', 'Mandiri, BRI, BNI, PermataBank, dan lainnya. Dibayar dalam rupiah lewat Midtrans.'],
    payMidAmt: [function (n) { return 'About ' + n + ' today'; }, function (n) { return 'Sekitar ' + n + ' hari ini'; }],
    payOpening: ['Opening payment…', 'Membuka pembayaran…'], payFail: ['We couldn’t start the payment. Please try again, or choose the other way to pay.', 'Pembayaran belum bisa dimulai. Coba lagi, atau pilih cara bayar yang lain.'],
    pendingH: ['Waiting for your payment', 'Menunggu pembayaranmu'], pendingP: ['Finish paying in your banking or e-wallet app. Plus switches on by itself as soon as the payment arrives, so you can close this page.', 'Selesaikan pembayaran di aplikasi bank atau dompet digitalmu. Plus aktif sendiri begitu pembayaran masuk, jadi halaman ini boleh ditutup.'],
    pendingNote: ['Bank transfers can take a little while. The payment code stays valid for 24 hours.', 'Transfer bank bisa butuh waktu. Kode pembayaran berlaku selama 24 jam.'],
    b1: ['About 60% more styles in every tool', 'Sekitar 60% gaya lebih banyak di setiap alat'],
    b2: ['Every worksheet, social story and bundle in the Shop', 'Semua lembar kerja, cerita sosial, dan paket di Toko'],
    b3: ['A profile for each child, not just one', 'Profil untuk setiap anak, tidak hanya satu'],
    b4: ['Works on every phone, tablet and computer you sign in on', 'Berlaku di setiap HP, tablet, dan komputer tempat kamu masuk'],
    freeAndPlus: ['Free and Plus', 'Gratis dan Plus'], freeAcc: ['Free account', 'Akun gratis'],
    cmp: [
      [['Visual tools: timers, token boards, schedules', 'Alat visual: timer, papan token, jadwal'], ['All tools', 'Semua alat'], ['All tools', 'Semua alat']],
      [['Tool styles', 'Gaya alat'], ['Starter set', 'Set dasar'], ['About 60% more', 'Sekitar 60% lebih banyak']],
      [['Child profiles', 'Profil anak'], ['1 child', '1 anak'], ['More than one child', 'Lebih dari satu anak']],
      [['Free printables', 'Materi cetak gratis'], ['Included', 'Termasuk'], ['Included', 'Termasuk']],
      [['Paid worksheets, stories and bundles', 'Lembar kerja, cerita, dan paket berbayar'], ['Buy one at a time', 'Beli satu per satu'], ['All included', 'Semua termasuk']],
      [['Setup on every device', 'Pengaturan di setiap perangkat'], ['Included', 'Termasuk'], ['Included', 'Termasuk']]
    ],
    faq: [
      [['Does it renew?', 'Apakah diperpanjang otomatis?'], ['No. You pay once, and Plus simply ends on the date shown. Nothing is charged again.', 'Tidak. Kamu bayar sekali, dan Plus berakhir di tanggal yang tertera. Tidak ada tagihan lagi.']],
      [['What happens when it ends?', 'Apa yang terjadi saat berakhir?'], ['You go back to a free account with one child profile. The free tools stay, and so does anything you bought on its own earlier. Nothing is deleted.', 'Kamu kembali ke akun gratis dengan satu profil anak. Alat gratis tetap ada, begitu juga produk yang dulu kamu beli satuan. Tidak ada yang dihapus.']],
      [['Can I add more time?', 'Bisa menambah waktu?'], ['Yes. Buying again before it ends adds the time to your current end date.', 'Bisa. Membeli lagi sebelum berakhir akan menambah waktu dari tanggal berakhir saat ini.']],
      [['Which payment methods can I use?', 'Metode pembayaran apa yang bisa dipakai?'], ['Card or PayPal through Gumroad (US dollars), or GoPay, QRIS and bank transfer through Midtrans (rupiah). You don’t need an account with either. Log in with the same Little Us account on any device to use Plus.', 'Kartu atau PayPal lewat Gumroad (dolar AS), atau GoPay, QRIS, dan transfer bank lewat Midtrans (rupiah). Kamu tidak perlu akun di keduanya. Masuk dengan akun Little Us yang sama di perangkat mana pun untuk memakai Plus.']],
      [['Can I get a refund?', 'Bisa minta pengembalian dana?'], ['Passes are final, so we don’t refund a change of mind or an unused pass. If Plus doesn’t work and we can’t fix it, we refund you. See our Refund Policy.', 'Pass bersifat final, jadi kami tidak mengembalikan dana karena berubah pikiran atau pass yang tidak dipakai. Jika Plus tidak berfungsi dan tidak bisa kami perbaiki, dana kamu dikembalikan. Lihat Kebijakan Pengembalian Dana kami.']]
    ],
    questions: ['Questions', 'Pertanyaan'], refundLink: ['Refund Policy', 'Kebijakan Pengembalian Dana'],
    notSet: ['Little Us Plus isn’t open for sale yet. Please check back soon.', 'Little Us Plus belum dibuka. Coba lagi nanti ya.'],
    // C03
    quickStep: ['One quick step first', 'Satu langkah dulu'],
    quickStepP: ['Create a free account or log in, so your pass is saved to you and works on every device.', 'Buat akun gratis atau masuk, agar pass tersimpan di akunmu dan berlaku di semua perangkat.'],
    thenCheckout: ['Then we’ll take you straight to checkout.', 'Setelah itu kamu langsung diarahkan ke pembayaran.'],
    // C04-C08
    openingH: ['Opening secure checkout in a new tab', 'Membuka pembayaran aman di tab baru'],
    openingP: ['Gumroad handles the payment. Come back here when you’re done; we’ll take it from there.', 'Gumroad memproses pembayaran. Kembali ke sini setelah selesai; sisanya kami urus.'],
    nothingOpened: ['Nothing opened?', 'Tidak ada yang terbuka?'], openCheckout: ['Open checkout', 'Buka pembayaran'],
    checkoutOpen: ['Checkout is open in another tab', 'Pembayaran terbuka di tab lain'], finishH: ['Finish paying on Gumroad', 'Selesaikan pembayaran di Gumroad'],
    oneTimeUntil: [function (d) { return 'One-time payment · Plus until ' + d; }, function (d) { return 'Sekali bayar · Plus sampai ' + d; }],
    st1: ['Pay on the Gumroad page', 'Bayar di halaman Gumroad'], st2: ['Come back to this page', 'Kembali ke halaman ini'], st3: ['Plus switches on by itself', 'Plus aktif dengan sendirinya'],
    ivePaid: ['I’ve paid', 'Saya sudah bayar'], reopen: ['Reopen checkout', 'Buka lagi pembayaran'], diffPlan: ['Choose a different plan', 'Pilih paket lain'],
    activatingH: ['We’re activating your pass', 'Kami sedang mengaktifkan pass-mu'],
    activatingP: ['This usually takes a few seconds. Stay here, we’re checking automatically.', 'Biasanya hanya beberapa detik. Tetap di sini, kami cek otomatis.'],
    lastChecked: ['Last checked just now', 'Terakhir dicek barusan'],
    thanksH: ['Thank you for joining Little Us Plus', 'Terima kasih sudah bergabung dengan Little Us Plus'],
    plan: ['Plan', 'Paket'], paid: ['Paid', 'Dibayar'], oneTimeSfx: [', one-time', ', sekali bayar'],
    addedTime: [function (p, d) { return 'Added ' + p + ' · Plus now until ' + d; }, function (p, d) { return 'Ditambah ' + p + ' · Plus sekarang sampai ' + d; }],
    receipt: [function (e) { return 'Plus is added to your account (' + e + ').'; }, function (e) { return 'Plus ditambahkan ke akunmu (' + e + ').'; }],
    goTools: ['Go to tools', 'Ke alat'], goDownloads: ['Go to downloads', 'Ke unduhan'],
    delayedH: ['Payment received. Plus is on its way.', 'Pembayaran diterima. Plus sedang diproses.'],
    delayedP: [function (e) { return 'Sometimes it takes a little longer. You don’t need to pay again. We’ll keep checking and email ' + e + ' the moment it’s ready.'; }, function (e) { return 'Kadang butuh waktu sedikit lebih lama. Kamu tidak perlu bayar lagi. Kami terus mengecek dan akan email ke ' + e + ' begitu siap.'; }],
    still30: ['Still not active after 30 minutes?', 'Masih belum aktif setelah 30 menit?'],
    still30P: [function (s) { return 'Email <b>' + s + '</b> and we’ll switch it on by hand.'; }, function (s) { return 'Email <b>' + s + '</b> dan kami aktifkan secara manual.'; }],
    orderRef: ['Order ref', 'Kode pesanan'], checkAgain: ['Check again', 'Cek lagi'], emailSupport: ['Email support', 'Email bantuan'], backHome: ['Back to Home', 'Kembali ke Beranda'],
    // locks
    comesWith: [function (n) { return n + ' comes with Little Us Plus'; }, function (n) { return n + ' termasuk Little Us Plus'; }],
    lockP: ['Plus adds more styles to every tool, and every worksheet in the Shop as a download.', 'Plus menambah gaya di setiap alat, dan semua lembar kerja di Toko bisa diunduh.'],
    l1: ['About 60% more tool styles', 'Sekitar 60% gaya alat lebih banyak'], l2: ['Every worksheet and resource to download', 'Semua lembar kerja dan materi bisa diunduh'],
    getPlus: ['Get Little Us Plus', 'Dapatkan Little Us Plus'], keepUsing: [function (n) { return 'Keep using ' + n; }, function (n) { return 'Tetap pakai ' + n; }],
    notNow: ['Not now', 'Nanti saja'],
    fromNote: [function (p) { return 'From ' + p + ' · one-time payment, no automatic renewal'; }, function (p) { return 'Mulai ' + p + ' · sekali bayar, tanpa perpanjangan otomatis'; }],
    accLockH: [function (n) { return n + ' comes with a free account'; }, function (n) { return n + ' tersedia dengan akun gratis'; }],
    accLockP: ['Create a free account (it takes a minute) and this style is yours on every device.', 'Buat akun gratis (cukup semenit) dan gaya ini bisa kamu pakai di semua perangkat.'],
    childLockH: ['More than one child comes with Little Us Plus', 'Lebih dari satu anak termasuk Little Us Plus'],
    childLockP: ['A free account has one child profile. Plus gives every child their own profile, cards and rewards.', 'Akun gratis punya satu profil anak. Dengan Plus, setiap anak punya profil, kartu, dan hadiahnya sendiri.'],
    twoWays: ['Two ways to get this', 'Dua cara mendapatkannya'], inclPlus: ['Included with Little Us Plus', 'Termasuk Little Us Plus'],
    inclPlusP: [function (p) { return 'This and every other worksheet, plus more tool styles. From ' + p + '.'; }, function (p) { return 'Ini dan semua lembar kerja lainnya, plus lebih banyak gaya alat. Mulai ' + p + '.'; }],
    justThis: ['Buy just this one', 'Beli yang ini saja'], yoursKeep: ['yours to keep', 'jadi milikmu'], buyNow: ['Buy now', 'Beli sekarang'],
    download: ['Download', 'Unduh'], inPlus: ['IN PLUS', 'DI PLUS'], inclWithPlus: ['Included with your Plus', 'Termasuk Plus-mu'], youOwn: ['You bought this', 'Kamu sudah membeli ini'],
    notOnSale: ['Not on sale yet. Ask us by email.', 'Belum dijual. Tanya kami lewat email.'],
    preparing: ['Preparing your download…', 'Menyiapkan unduhan…'], dlFail: ['The download couldn’t start. Please try again.', 'Unduhan gagal dimulai. Coba lagi ya.'],
    // account
    account: ['Account', 'Akun'], signedInEmail: ['Signed in with email', 'Masuk dengan email'],
    pass12: ['12 Months pass', 'Pass 12 Bulan'], pass3: ['3 Months pass', 'Pass 3 Bulan'], passPlus: ['Little Us Plus', 'Little Us Plus'],
    activeUntil: ['Active until', 'Aktif sampai'], buyAgainAdd: ['Buy again to add time', 'Beli lagi untuk menambah waktu'],
    until: [function (d) { return 'Until ' + d; }, function (d) { return 'Sampai ' + d; }],
    endsIn: [function (n, d) { return 'Ends in ' + n + (n === 1 ? ' day' : ' days') + ', on ' + d; }, function (n, d) { return 'Berakhir dalam ' + n + ' hari, pada ' + d; }],
    addTimeNote: ['Add time below and nothing changes.', 'Tambah waktu di bawah dan tidak ada yang berubah.'],
    freeAccP: ['Your setup is saved to your account and works on every device. Plus adds about 60% more tool styles and every download.', 'Pengaturanmu tersimpan di akun dan berlaku di semua perangkat. Plus menambah sekitar 60% gaya alat dan semua unduhan.'],
    fromRenew: [function (p) { return 'From ' + p + ' · one payment, no renewal'; }, function (p) { return 'Mulai ' + p + ' · sekali bayar, tanpa perpanjangan'; }],
    endedOn: [function (d) { return 'Your Plus pass ended on ' + d; }, function (d) { return 'Pass Plus-mu berakhir pada ' + d; }], buyAgain: ['Buy again', 'Beli lagi'],
    changePw: ['Change password', 'Ganti kata sandi'], currentPw: ['Current password', 'Kata sandi saat ini'], logOut: ['Log out', 'Keluar'],
    logOutQ: ['Log out of Little Us?', 'Keluar dari Little Us?'], logOutP: ['Your child’s setup stays on this device.', 'Pengaturan anakmu tetap ada di perangkat ini.'],
    cancel: ['Cancel', 'Batal'], save: ['Save', 'Simpan'], saved: ['Saved', 'Tersimpan'], pwChanged: ['Password changed', 'Kata sandi diganti'],
    wrongCurrent: ['Your current password isn’t right.', 'Kata sandi saat ini tidak tepat.'],
    purchases: ['Purchases', 'Pembelian'], yourLibrary: ['Your library', 'Koleksimu'],
    editName: ['Edit name', 'Ubah nama'],
    // settings card
    notSigned: ['Not signed in. Your setup is saved on this device only.', 'Belum masuk. Pengaturanmu hanya tersimpan di perangkat ini.'],
    createFreeAcc: ['Create free account', 'Buat akun gratis'], fromP: [function (p) { return 'From ' + p; }, function (p) { return 'Mulai ' + p; }],
    moreStyles: ['More styles, every download', 'Lebih banyak gaya, semua unduhan'], getPlusShort: ['Get Plus', 'Dapatkan Plus'],
    synced: ['synced just now', 'baru disinkronkan'], syncing: ['syncing…', 'menyinkronkan…'], syncOff: ['not synced yet', 'belum disinkronkan'],
    plusEndsAdd: [function (d) { return 'Plus ends ' + d + ' · Add time'; }, function (d) { return 'Plus berakhir ' + d + ' · Tambah waktu'; }],
    // home
    freeAccCardH: ['3 · Free account', '3 · Akun gratis'], freeAccCardP: ['Save your setup on every phone, tablet and computer', 'Simpan pengaturanmu di setiap HP, tablet, dan komputer'], create: ['Create', 'Buat'],
    upCardH: ['More styles, every download', 'Lebih banyak gaya, semua unduhan'], upCardP: ['One payment, never renews', 'Sekali bayar, tidak diperpanjang otomatis'], upgrade: ['Upgrade', 'Upgrade'],
    unlockedH: ['Everything is unlocked', 'Semuanya sudah terbuka'],
    expiringH: [function (n) { return 'Plus ends in ' + n + (n === 1 ? ' day' : ' days'); }, function (n) { return 'Plus berakhir dalam ' + n + ' hari'; }],
    expiringP: [function (d) { return 'On ' + d + '. Add time and nothing changes.'; }, function (d) { return 'Pada ' + d + '. Tambah waktu dan tidak ada yang berubah.'; }], addTime: ['Add time', 'Tambah waktu'],
    endedH: [function (d) { return 'Plus ended on ' + d; }, function (d) { return 'Plus berakhir pada ' + d; }],
    endedP: [function (c) { return c + '’s boards are all still here'; }, function (c) { return 'Semua papan ' + c + ' masih ada'; }],
    hiReady: [function (n, c) { return 'Hi ' + n + '! Ready for ' + c + '’s day?'; }, function (n, c) { return 'Hai ' + n + '! Siap untuk hari ' + c + '?'; }],
    hiReady0: [function (n) { return 'Hi ' + n + '! Ready for today?'; }, function (n) { return 'Hai ' + n + '! Siap untuk hari ini?'; }],
    syncedEvery: ['Their tools and downloads are synced on every device.', 'Alat dan unduhan tersimpan di semua perangkat.'],
    pickUp: ['Pick up where you left off', 'Lanjutkan dari terakhir kali'], usedLast: [function (n) { return n + ' used last'; }, function (n) { return 'Terakhir dipakai ' + n; }],
    daysLeftN: [function (n) { return n + (n === 1 ? ' day left' : ' days left'); }, function (n) { return 'Sisa ' + n + ' hari'; }], planEnds: [function (p, d) { return p + ' plan · ends ' + d; }, function (p, d) { return 'Paket ' + p + ' · berakhir ' + d; }],
    m12: ['12 Months', '12 Bulan'], m3: ['3 Months', '3 Bulan'], managePlan: ['Manage plan', 'Kelola paket'], activeP: ['Active', 'Aktif'], allTools: ['All tools', 'Semua alat'], open: ['Open', 'Buka'],
    emptyLibH: ['Nothing here yet', 'Belum ada apa-apa'], emptyLibP: ['Anything you buy is kept here, on every device.', 'Semua yang kamu beli tersimpan di sini, di semua perangkat.'],
    browseFree: ['Browse free printables', 'Lihat materi gratis'], plusLibH: ['Every worksheet is yours to download', 'Semua lembar kerja bisa kamu unduh'],
    plusLibP: ['Little Us Plus includes every worksheet, social story and bundle in the Shop.', 'Little Us Plus mencakup semua lembar kerja, cerita sosial, dan paket di Toko.'], browseShop: ['Browse the shop', 'Lihat toko'],
    upBarH: ['Upgrade to Little Us Plus', 'Upgrade ke Little Us Plus'], upBarP: ['Get more tool styles and all our resources', 'Dapatkan lebih banyak gaya alat dan semua materi kami'],
    seePlans: [function (p) { return 'See plans · from ' + p; }, function (p) { return 'Lihat paket · mulai ' + p; }],
    childProfile: ['Child profile', 'Profil anak'], switchC: ['Switch', 'Ganti'],
    myAccount: ['My account', 'Akun saya'], settings: ['Settings', 'Pengaturan'], articles: ['Articles', 'Artikel']
  };
  function t(k) { var v = W[k]; if (!v) return k; var s = v[L() === 'id' ? 1 : 0]; if (typeof s === 'function') return s.apply(null, Array.prototype.slice.call(arguments, 1)); return s; }

  /* ===================== session (Supabase Auth) ===================== */
  var SKEY = 'lu_session';
  var session = store.json(SKEY, null);
  function setSession(s) {
    if (s && s.access_token) {
      session = { access_token: s.access_token, refresh_token: s.refresh_token, expires_at: s.expires_at || (Math.floor(Date.now() / 1000) + (s.expires_in || 3600)), user: s.user || (session && session.user) || null };
      store.setJson(SKEY, session);
    } else { session = null; store.del(SKEY); }
  }
  var refreshing = null;
  function refreshSession() {
    if (!session || !session.refresh_token) return Promise.resolve(null);
    if (refreshing) return refreshing;
    refreshing = fetch(SB + '/auth/v1/token?grant_type=refresh_token', { method: 'POST', headers: { apikey: KEY, 'Content-Type': 'application/json' }, body: JSON.stringify({ refresh_token: session.refresh_token }) })
      .then(function (r) { return r.json().then(function (j) { return { ok: r.ok, status: r.status, j: j }; }); })
      .then(function (x) {
        if (x.ok && x.j.access_token) { setSession(x.j); return session; }
        if (x.status === 400 || x.status === 401) { setSession(null); clearAccount(); }
        return null;
      })
      .catch(function () { return session; })
      .then(function (r) { refreshing = null; return r; });
    return refreshing;
  }
  function token() {
    if (!session) return Promise.resolve(null);
    if (session.expires_at - 60 > Date.now() / 1000) return Promise.resolve(session.access_token);
    return refreshSession().then(function (s) { return s ? s.access_token : null; });
  }
  function http(path, opts) {
    opts = opts || {};
    var auth = opts.auth === false ? Promise.resolve(null) : token();
    return auth.then(function (tk) {
      var h = { apikey: KEY, Authorization: 'Bearer ' + (tk || KEY) };
      if (opts.body !== undefined) h['Content-Type'] = 'application/json';
      if (opts.headers) Object.keys(opts.headers).forEach(function (k) { h[k] = opts.headers[k]; });
      return fetch(SB + path, { method: opts.method || 'GET', headers: h, body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined })
        .catch(function () { var e = new Error('network'); e.network = true; throw e; })
        .then(function (r) {
          return r.text().then(function (txt) {
            var j = null; try { j = txt ? JSON.parse(txt) : null; } catch (e) {}
            if (!r.ok) { var er = new Error((j && (j.msg || j.message || j.error_description || j.error)) || ('HTTP ' + r.status)); er.status = r.status; er.data = j; er.code = j && (j.error_code || j.code); throw er; }
            return j;
          });
        });
    });
  }
  var auth = {
    signUp: function (name, email, pw) {
      return http('/auth/v1/signup?redirect_to=' + encodeURIComponent(ORIGIN + '/welcome'), { method: 'POST', auth: false, body: { email: email, password: pw, data: { name: name, lang: L() } } });
    },
    resend: function (email) { return http('/auth/v1/resend', { method: 'POST', auth: false, body: { type: 'signup', email: email, options: { emailRedirectTo: ORIGIN + '/welcome' } } }); },
    logIn: function (email, pw) {
      return http('/auth/v1/token?grant_type=password', { method: 'POST', auth: false, body: { email: email, password: pw } }).then(function (j) { setSession(j); return j; });
    },
    recover: function (email) { return http('/auth/v1/recover?redirect_to=' + encodeURIComponent(ORIGIN + '/reset-password'), { method: 'POST', auth: false, body: { email: email } }); },
    setPassword: function (pw) { return http('/auth/v1/user', { method: 'PUT', body: { password: pw } }); },
    logOut: function (scope) {
      var p = session ? http('/auth/v1/logout' + (scope ? '?scope=' + scope : ''), { method: 'POST' }).catch(function () {}) : Promise.resolve();
      return p.then(function () { if (scope !== 'others') { setSession(null); clearAccount(); } });
    },
    user: function () { return http('/auth/v1/user'); }
  };

  /* ===================== account data ===================== */
  var CKEY = 'lu_acc_cache';
  var A = store.json(CKEY, null) || {};      // { profile, purchases, at }
  var FEAT = store.json('lu_plus_feat', null) || { list: [], settings: null, at: 0 };
  var listeners = [];
  function emit() { listeners.forEach(function (f) { try { f(); } catch (e) {} }); }
  function clearAccount() { A = {}; store.del(CKEY); store.del('lu_sync_at'); emit(); }
  function signedIn() { return !!(session && session.access_token); }
  function me() { return signedIn() ? (A.profile || { name: (session.user && session.user.user_metadata && session.user.user_metadata.name) || '', email: session.user && session.user.email }) : null; }
  function plusUntil() { var p = A.profile; return p && p.plus_until ? new Date(p.plus_until) : null; }
  function isPlus() { var u = plusUntil(); return !!(signedIn() && u && u > new Date()); }
  function daysLeft() { var u = plusUntil(); return u ? Math.max(0, Math.ceil((u - new Date()) / 86400000)) : 0; }
  function status() {
    if (!signedIn()) return 'none';
    var u = plusUntil();
    if (u && u > new Date()) return daysLeft() <= 14 ? 'expiring' : 'plus';
    if (u) return 'expired';
    return 'free';
  }
  function perMonth(x) { return L() === 'id' ? String(x).replace(/\s*a month$/i, ' per bulan') : x; }
  function settings() {
    var s = FEAT.settings || {};
    return {
      childLimit: s.free_child_limit || 1,
      url3: s.gumroad_3m_url || '', url12: s.gumroad_12m_url || '', midtrans: !!s.midtrans_enabled,
      p3: s.price_3m_label || '$9', p12: s.price_12m_label || '$29',
      pm3: perMonth(s.per_month_3m || '$3 a month'), pm12: perMonth(s.per_month_12m || '$2.42 a month'),
      support: s.support_email || (CFG.CONTACT && CFG.CONTACT.email) || 'littleus.business@gmail.com',
      popTitle: L() === 'id' ? s.popup_title_id : s.popup_title_en,
      popBody: L() === 'id' ? s.popup_body_id : s.popup_body_en,
      note: L() === 'id' ? s.plus_page_note_id : s.plus_page_note_en
    };
  }
  function loadFeatures(force) {
    if (!ON) return Promise.resolve();
    if (!force && FEAT.at && Date.now() - FEAT.at < 5 * 60 * 1000) return Promise.resolve();
    return Promise.all([
      http('/rest/v1/plus_features?select=id,tool,name_en,name_id,access,sort&order=sort', { auth: false }),
      http('/rest/v1/plus_settings?select=*&id=eq.1', { auth: false })
    ]).then(function (r) {
      FEAT = { list: r[0] || [], settings: (r[1] || [])[0] || null, at: Date.now() };
      store.setJson('lu_plus_feat', FEAT); emit();
    }).catch(function () {});
  }
  function loadAccount() {
    if (!ON || !signedIn()) return Promise.resolve();
    var uid = session.user && session.user.id;
    var userP = uid ? Promise.resolve(session.user) : auth.user().then(function (u) { session.user = u; store.setJson(SKEY, session); return u; });
    return userP.then(function (u) {
      return Promise.all([
        http('/rest/v1/profiles?select=id,email,name,lang,plus_until,plus_plan,created_at&id=eq.' + u.id),
        http('/rest/v1/purchases?select=id,kind,plan,product_id,price_label,status,plus_to,created_at&order=created_at.desc&limit=50').catch(function () { return []; })
      ]);
    }).then(function (r) {
      var before = JSON.stringify([A.profile && A.profile.plus_until, A.profile && A.profile.name]);
      A = { profile: (r[0] || [])[0] || A.profile || null, purchases: r[1] || [], at: Date.now() };
      store.setJson(CKEY, A);
      if (before !== JSON.stringify([A.profile && A.profile.plus_until, A.profile && A.profile.name])) emit();
      fixToolsState();
      return A;
    }).catch(function (e) { if (e && e.status === 401) { setSession(null); clearAccount(); } });
  }
  function featureById(id) { for (var i = 0; i < FEAT.list.length; i++) if (FEAT.list[i].id === id) return FEAT.list[i]; return null; }
  function access(id) { var f = featureById(id); return f ? f.access : 'everyone'; }
  function allowed(id) {
    var a = access(id);
    if (a === 'everyone') return true;
    if (a === 'account') return signedIn();
    if (a === 'plus') return isPlus();
    return false; // hidden
  }
  function featName(id) { var f = featureById(id); return f ? (L() === 'id' ? f.name_id : f.name_en) : id; }

  /* ===================== child setup sync ===================== */
  var TKEY = 'lu_tools_v1';
  var syncTimer = null, syncState = 'idle';
  function deviceName() { var u = navigator.userAgent || ''; return /iPad|Tablet/i.test(u) ? 'tablet' : /Mobi|Android|iPhone/i.test(u) ? 'phone' : 'computer'; }
  function stateChanged() {
    if (!signedIn() || !ON) return;
    clearTimeout(syncTimer);
    syncState = 'pending';
    syncTimer = setTimeout(pushState, 2000);
  }
  function pushState() {
    var raw = store.get(TKEY); if (!raw || !signedIn()) return Promise.resolve();
    var data; try { data = JSON.parse(raw); } catch (e) { return Promise.resolve(); }
    syncState = 'syncing';
    return http('/rest/v1/user_state?on_conflict=user_id', { method: 'POST', headers: { Prefer: 'resolution=merge-duplicates,return=representation' }, body: [{ user_id: session.user.id, data: data, device: deviceName() }] })
      .then(function (r) { syncState = 'done'; if (r && r[0]) store.set('lu_sync_at', r[0].updated_at); })
      .catch(function (e) {
        syncState = 'error';
        if (e && e.data && /child_limit/.test(e.data.message || '')) toast(t('childLockH'), 'error');
      });
  }
  // Pull the account's setup when it is newer than what this device last synced.
  function pullState(mode) {
    if (!signedIn() || !ON) return Promise.resolve();
    return http('/rest/v1/user_state?select=data,updated_at&user_id=eq.' + session.user.id).then(function (rows) {
      var row = rows && rows[0];
      var local = store.json(TKEY, null);
      var localHas = !!(local && local.profiles && local.profiles.length);
      if (!row) { if (local) return pushState(); return; }
      var last = store.get('lu_sync_at');
      if (mode !== 'login' && last && new Date(row.updated_at) <= new Date(last)) return;
      if (mode === 'login' && localHas && JSON.stringify(local) !== JSON.stringify(row.data)) store.set('lu_tools_v1_before_login', JSON.stringify(local));
      store.set(TKEY, JSON.stringify(row.data));
      store.set('lu_sync_at', row.updated_at);
      if (window.LUTools && LUTools.reloadState) LUTools.reloadState();
    }).catch(function () {});
  }
  function childCount() { var s = store.json(TKEY, null); return (s && s.profiles && s.profiles.length) || 0; }
  function canAddChild() { return isPlus() || childCount() < settings().childLimit; }

  // Styles that a parent can no longer use go back to a free one (e.g. Dino → Bunny).
  var FALLBACK = { timer: ['bunny', 'circle', 'sand', 'bar'], tokens: ['star', 'flower'], breathe: ['balloon', 'star'] };
  function firstAllowed(tool, cur) {
    var list = FALLBACK[tool] || [];
    for (var i = 0; i < list.length; i++) if (allowed(tool + '.' + list[i])) return list[i];
    return cur;
  }
  function fixState(S) {
    if (!S || !S.data || !FEAT.list.length) return false;
    var changed = false;
    Object.keys(S.data).forEach(function (k) {
      var d = S.data[k]; if (!d) return;
      if (d.timer && d.timer.style && !allowed('timer.' + d.timer.style)) { d.timer.style = firstAllowed('timer', d.timer.style); changed = true; }
      if (d.tokens && d.tokens.shape && !allowed('tokens.' + d.tokens.shape)) { d.tokens.shape = firstAllowed('tokens', d.tokens.shape); changed = true; }
      if (d.calm && d.calm.bb && d.calm.bb.style && !allowed('breathe.' + d.calm.bb.style)) { d.calm.bb.style = firstAllowed('breathe', d.calm.bb.style); changed = true; }
    });
    return changed;
  }
  function fixToolsState() {
    if (window.LUTools && LUTools.fixLocked) { try { LUTools.fixLocked(); } catch (e) {} return; }
    var s = store.json(TKEY, null);
    if (s && fixState(s)) store.setJson(TKEY, s);
  }

  /* ===================== styles ===================== */
  var CSS = [
    '.la-page{max-width:1120px;margin:0 auto;padding:24px 16px 72px}',
    '.la-narrow{max-width:460px;margin:0 auto}',
    '.la-top{height:72px;padding:0 16px;display:flex;align-items:center;gap:14px;border-bottom:1px solid var(--line);background:var(--paper)}',
    '.la-top img{height:30px;mix-blend-mode:multiply}.la-top .sp{flex:1}',
    '.la-top .desk-inline{display:none}@media(min-width:960px){.la-top .desk-inline{display:inline}}',
    '.la-top .lang-tog{flex:none}.la-top .la-xlink{flex:none;margin-left:4px}',
    '.la-xlink{display:inline-flex;align-items:center;gap:6px;font-weight:700;font-size:15px;text-decoration:none;color:var(--ink);min-height:44px}',
    '.la-iconbtn{width:44px;height:44px;border-radius:999px;border:1px solid var(--line);background:#fff;display:inline-flex;align-items:center;justify-content:center;cursor:pointer;flex:none;color:var(--ink)}',
    '.la-auth{display:grid;grid-template-columns:1fr;gap:40px;max-width:1312px;margin:0 auto;padding:24px 16px 64px;min-height:calc(100vh - 72px)}',
    '.la-side{display:none}',
    '@media(min-width:960px){.la-auth{grid-template-columns:minmax(0,640px) minmax(0,1fr);padding:32px 64px 64px;gap:64px}.la-side{display:flex;position:relative;overflow:hidden;background:var(--peach);border-radius:28px;padding:56px;flex-direction:column;justify-content:center;gap:18px;min-height:640px}.la-side h2{font:600 44px/1.1 Fredoka,sans-serif;margin:0;max-width:420px}.la-formcol{display:flex;flex-direction:column;justify-content:center}.la-mobonly{display:none!important}.la-top{padding:0 64px;height:84px}}',
    '.la-side .sun{position:absolute;right:-50px;top:-50px;width:200px;height:200px;border-radius:50%;background:var(--sunny)}',
    '.la-side .ring{position:absolute;left:-60px;bottom:-60px;width:180px;height:180px;border-radius:50%;border:16px solid var(--sky)}',
    '.la-checks{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:12px}',
    '.la-checks li{display:flex;gap:12px;align-items:flex-start;font-weight:700;font-size:15px;line-height:1.4}',
    '.la-checks.big li{font-size:17px}',
    '.la-chk{width:24px;height:24px;border-radius:999px;background:var(--mint);flex:none;display:inline-flex;align-items:center;justify-content:center;margin-top:-1px}',
    '.la-side .la-chk{background:#fff;width:32px;height:32px}',
    '.la-form{display:flex;flex-direction:column;gap:14px;max-width:440px;width:100%}',
    '.la-h1{font:600 30px/1.15 Fredoka,sans-serif;margin:0}',
    '@media(min-width:960px){.la-h1{font-size:38px}}',
    '.la-p{color:var(--body);font-size:15px;line-height:1.5;margin:0}',
    '.la-small{font-size:13px;color:var(--muted);line-height:1.5}',
    '.la-small a,.la-p a{color:var(--ink);font-weight:700}',
    '.la-field{display:flex;flex-direction:column;gap:6px}',
    '.la-field label{font-weight:700;font-size:14px}',
    '.la-input{position:relative}',
    '.la-input input{width:100%;height:52px;border-radius:14px;border:1.5px solid var(--input);background:#fff;padding:0 48px 0 16px;font:500 16px Figtree,sans-serif;color:var(--ink);outline:none}',
    '.la-input input:focus{border-color:var(--ink);box-shadow:0 0 0 4px #FFC94A55}',
    '.la-input input.err{border-color:var(--error-border)}',
    '.la-eye{position:absolute;right:6px;top:50%;transform:translateY(-50%);width:40px;height:40px;border:0;background:none;cursor:pointer;color:var(--muted);display:flex;align-items:center;justify-content:center}',
    '.la-hint{font-size:12.5px;font-weight:700;color:var(--muted);display:flex;gap:5px;align-items:center;min-height:16px}',
    '.la-hint.ok{color:var(--success)}.la-hint.bad{color:var(--error)}',
    '.la-err{background:#FDECEA;color:var(--error);border-radius:12px;padding:10px 12px;font-size:14px;font-weight:600}',
    '.la-btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;min-height:56px;padding:0 22px;border-radius:16px;border:0;font:700 16px Figtree,sans-serif;cursor:pointer;text-decoration:none;color:var(--ink);background:#fff;transition:transform .08s}',
    '.la-btn:active{transform:translateY(1px)}',
    '.la-btn.block{width:100%}',
    '.la-btn.primary{background:var(--sunny);box-shadow:0 3px 0 var(--sunny-shadow)}',
    '.la-btn.primary:hover{background:var(--sunny-press)}',
    '.la-btn.dark{background:var(--ink);color:#fff}',
    '.la-btn.outline{border:1.5px solid var(--ink);background:#fff}',
    '.la-btn.soft{background:var(--sand)}',
    '.la-btn.line{border:1px solid var(--line);background:#fff;font-weight:600}',
    '.la-btn.sm{min-height:44px;padding:0 16px;font-size:14.5px;border-radius:14px}',
    '.la-btn[disabled]{opacity:.45;cursor:default;box-shadow:none}',
    '.la-link{background:none;border:0;padding:0;font:700 15px Figtree,sans-serif;color:var(--ink);text-decoration:underline;text-underline-offset:3px;cursor:pointer}',
    '.la-center{display:flex;flex-direction:column;align-items:center;text-align:center;gap:14px}',
    '.la-circle{width:108px;height:108px;border-radius:999px;background:var(--butter);display:flex;align-items:center;justify-content:center}',
    '.la-circle.mint{background:var(--mint)}',
    '.la-note{background:var(--sand);border-radius:14px;padding:12px 16px;font-size:13.5px;color:var(--body);line-height:1.5}',
    '.la-has{background:var(--butter);border-radius:18px;padding:16px;display:flex;flex-direction:column;gap:10px}',
    '.la-has b{font-size:15px}',
    '.la-stack{display:flex;flex-direction:column;gap:10px}',
    '.la-pill{display:inline-flex;align-items:center;height:22px;padding:0 9px;border-radius:999px;font:800 11px Figtree,sans-serif;letter-spacing:.06em;background:var(--ink);color:var(--sunny);white-space:nowrap}',
    '.la-pill.free{background:var(--mint);color:var(--success)}',
    '.la-pill.rec{background:var(--mint);color:var(--success);font-size:10px}',
    '.la-pill.best{background:var(--sunny);color:var(--ink)}',
    '.la-pill.plain{background:var(--sand);color:var(--body)}',
    /* plans */
    '.la-plans{display:grid;grid-template-columns:1fr;gap:28px;align-items:start}',
    '@media(min-width:960px){.la-plans{grid-template-columns:1fr 1fr;gap:56px}}',
    '.la-plans h1{font:600 36px/1.08 Fredoka,sans-serif;margin:10px 0 12px}',
    '@media(min-width:960px){.la-plans h1{font-size:52px}}',
    '.la-choose{background:var(--peach);border-radius:28px;padding:24px;display:flex;flex-direction:column;gap:14px}',
    '.la-choose h2{font:600 22px Fredoka,sans-serif;margin:0}',
    '.la-plan{display:flex;align-items:center;gap:14px;background:#fff;border-radius:22px;padding:18px 20px;border:2px solid transparent;cursor:pointer;text-align:left;font:inherit;color:inherit;width:100%}',
    '.la-plan.on{border-color:var(--ink)}',
    '.la-radio{width:26px;height:26px;border-radius:999px;border:2px solid var(--ink);flex:none;display:flex;align-items:center;justify-content:center}',
    '.la-plan.on .la-radio:after{content:"";width:14px;height:14px;border-radius:999px;background:var(--ink)}',
    '.la-plan .nm{flex:1;display:flex;flex-direction:column;gap:2px}.la-plan .nm b{font:600 21px Fredoka,sans-serif;display:flex;gap:8px;align-items:center;flex-wrap:wrap}',
    '.la-plan .nm small{color:var(--muted);font-size:12.5px;font-weight:600}',
    '.la-plan .pr{text-align:right}.la-plan .pr b{font:600 30px Fredoka,sans-serif;display:block;line-height:1}.la-plan .pr small{font-size:12.5px;font-weight:700;color:var(--muted)}',
    '.la-until{background:#fff;border-radius:16px;padding:14px 18px;font-size:14.5px;color:var(--body)}.la-until b{color:var(--ink);margin-left:6px}',
    '.la-safe{background:var(--mint);border-radius:16px;padding:14px 16px;display:flex;gap:10px;font-size:13.5px;color:var(--body)}.la-safe b{color:var(--ink);display:block;font-size:14px}',
    '.la-table{border:1px solid var(--line);border-radius:22px;overflow:hidden;background:#fff}',
    '.la-table .r{display:grid;grid-template-columns:1.3fr 1fr 1fr;gap:12px;padding:16px 22px;border-top:1px solid var(--line);font-size:14.5px;align-items:center}',
    '.la-table .r:first-child{border-top:0;background:var(--sand);font-weight:800;font-size:13.5px}',
    '.la-table .r>span:first-child{font-weight:700}.la-table .r>span:last-child{font-weight:700}',
    '@media(max-width:600px){.la-table .r{grid-template-columns:1.2fr .9fr .9fr;padding:12px 14px;font-size:13px}}',
    '.la-faqs{display:grid;grid-template-columns:1fr;gap:14px}',
    '@media(min-width:900px){.la-faqs{grid-template-columns:repeat(3,1fr)}}',
    '.la-faq{background:#fff;border:1px solid var(--line);border-radius:22px;padding:20px}.la-faq h3{font:600 18px Fredoka,sans-serif;margin:0 0 8px}.la-faq p{margin:0;font-size:14px;color:var(--body);line-height:1.5}',
    '.la-h2{font:600 28px Fredoka,sans-serif;margin:44px 0 16px}',
    /* sheets */
    '.la-scrim{position:fixed;inset:0;background:#2B2A3566;z-index:900;display:flex;align-items:flex-end;justify-content:center;animation:laFade .15s}',
    '@media(min-width:700px){.la-scrim{align-items:center}}',
    '.la-sheet{background:var(--paper);width:100%;max-width:440px;border-radius:28px 28px 0 0;padding:12px 22px calc(22px + env(safe-area-inset-bottom));display:flex;flex-direction:column;gap:14px;max-height:92vh;overflow:auto;animation:laUp .2s ease-out;position:relative}',
    '@media(min-width:700px){.la-sheet{border-radius:28px;padding:22px 26px 26px}}',
    '.la-handle{width:40px;height:5px;border-radius:9px;background:var(--line);align-self:center}',
    '@media(min-width:700px){.la-handle{display:none}}',
    '.la-sheet h2{font:600 24px/1.15 Fredoka,sans-serif;margin:0}',
    '.la-sheet .la-close{position:absolute;right:14px;top:14px}',
    '.la-lockvis{width:112px;height:66px;border-radius:12px;border:1.5px solid var(--ink);background:#fff;display:flex;align-items:center;justify-content:center;overflow:hidden}',
    '.la-lockvis svg{max-width:100%;max-height:100%}',
    '.la-own{border:1.5px solid var(--ink);border-radius:18px;padding:14px;display:flex;flex-direction:column;gap:10px;background:#fff;box-shadow:0 3px 0 var(--sunny)}',
    '.la-own2{border:1px solid var(--line);border-radius:18px;padding:12px 14px;display:flex;align-items:center;gap:10px;background:#fff}',
    '@keyframes laFade{from{opacity:0}}@keyframes laUp{from{transform:translateY(30px);opacity:.5}}',
    /* locks on tool options */
    '.lu-locked{position:relative}',
    '.lu-locked .tl-optvis,.lu-locked>svg,.lu-locked .tl-tok{opacity:.55}',
    '.lu-lockpill{position:absolute;top:6px;right:6px;z-index:2;pointer-events:none}',
    '.lu-hiddenopt{display:none!important}',
    /* account page */
    '.la-acc{max-width:520px;margin:0 auto;display:flex;flex-direction:column;gap:14px}',
    '.la-card{background:#fff;border:1px solid var(--line);border-radius:22px;padding:16px 18px}',
    '.la-me{display:flex;gap:14px;align-items:center}',
    '.la-ava{width:52px;height:52px;border-radius:16px;background:var(--lilac);display:flex;align-items:center;justify-content:center;font:600 24px Fredoka,sans-serif;flex:none}',
    '.la-ava.sm{width:44px;height:44px;border-radius:999px;font-size:19px}',
    '.la-me b{font:600 20px Fredoka,sans-serif;display:flex;gap:8px;align-items:center}.la-me small{display:block;color:var(--body);font-size:13.5px}',
    '.la-passcard{background:var(--ink);color:#fff;border-radius:22px;padding:18px;display:flex;flex-direction:column;gap:12px}',
    '.la-passcard h3{font:600 20px Fredoka,sans-serif;margin:0;display:flex;gap:10px;align-items:center}',
    '.la-passcard .lab{font:800 12px Figtree,sans-serif;letter-spacing:.08em;text-transform:uppercase;color:#E9E6EF}',
    '.la-tiles{display:grid;grid-template-columns:1fr 1fr;gap:10px}',
    '.la-tile{background:#fff;color:var(--ink);border-radius:14px;padding:10px 12px;border:0;text-align:left;cursor:pointer;font:inherit;display:flex;flex-direction:column;gap:2px}',
    '.la-tile .t1{display:flex;justify-content:space-between;font-weight:800;font-size:14.5px}.la-tile small{color:var(--body);font-size:12px;font-weight:600}',
    '.la-warn{background:var(--sunny);color:var(--ink);border-radius:14px;padding:12px 14px}.la-warn b{display:block}.la-warn small{font-size:13px}',
    '.la-rows{background:#fff;border:1px solid var(--line);border-radius:18px;overflow:hidden}',
    '.la-row{display:flex;align-items:center;gap:12px;padding:16px 18px;border-top:1px solid var(--line);font-weight:700;width:100%;background:none;border-left:0;border-right:0;border-bottom:0;font:700 15.5px Figtree,sans-serif;color:var(--ink);text-align:left;cursor:pointer;text-decoration:none}',
    '.la-row:first-child{border-top:0}.la-row .sp{flex:1}.la-row.red{color:var(--error)}',
    '.la-freecard{border:1.5px solid var(--ink);border-radius:22px;padding:18px;background:#fff;display:flex;flex-direction:column;gap:12px}',
    '.la-freecard h3{font:600 20px Fredoka,sans-serif;margin:0;display:flex;gap:10px;align-items:center}',
    /* settings card + home cards */
    '.la-setcard{display:flex;flex-direction:column;gap:10px;margin-bottom:6px}',
    '.la-accbox{border:1.5px solid var(--ink);border-radius:20px;background:#fff;padding:14px 16px;display:flex;flex-direction:column;gap:10px;box-shadow:0 3px 0 var(--sunny);text-decoration:none;color:var(--ink)}',
    '.la-accbox .two{display:grid;grid-template-columns:1.2fr 1fr;gap:10px}',
    '.la-accrow{display:flex;align-items:center;gap:12px;text-decoration:none;color:var(--ink)}',
    '.la-accrow .tx{flex:1;min-width:0}.la-accrow .tx b{display:flex;gap:8px;align-items:center;font-size:16px}.la-accrow .tx small{display:block;color:var(--body);font-size:12.5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
    '.la-plusrow{display:flex;align-items:center;gap:10px;background:#fff;border:1px solid var(--line);border-radius:18px;padding:10px 12px 10px 14px;text-decoration:none;color:var(--ink)}',
    '.la-plusrow .tx{flex:1;min-width:0}.la-plusrow .tx b{font-size:15px;display:block}.la-plusrow .tx small{font-size:12.5px;color:var(--body)}',
    '.la-home{max-width:1312px;margin:0 auto;padding:0 16px}',
    '.la-hcard{display:flex;align-items:center;gap:12px;border-radius:20px;padding:12px 12px 12px 16px;margin:14px 0 0;position:relative}',
    '.la-hcard .tx{flex:1;min-width:0}.la-hcard .tx b{display:flex;gap:8px;align-items:center;flex-wrap:wrap;font-size:15px}.la-hcard .tx small{display:block;font-size:12.5px;color:var(--body)}',
    '.la-hcard.up{background:#fff;border:1.5px solid var(--ink);box-shadow:0 3px 0 var(--sunny)}',
    '.la-hcard.ok{background:var(--mint)}.la-hcard.ok .tick{width:34px;height:34px;border-radius:999px;background:#fff;display:flex;align-items:center;justify-content:center;flex:none}',
    '.la-hcard.warn{background:var(--sunny)}.la-hcard.warn .tx small{color:var(--ink)}',
    '.la-hcard.ended{background:#fff;border:1.5px solid var(--ink)}',
    '.la-hcard.acc{background:#fff;border:1.5px solid var(--ink)}',
    '.la-hx{position:absolute;top:2px;right:2px;width:32px;height:32px;border-radius:999px;border:0;background:none;color:var(--muted);cursor:pointer;font-size:13px}',
    '.la-hcard:has(.la-hx){padding-right:30px}',
    '@media(min-width:960px){.la-home{padding:0 64px}.la-hcard{max-width:1312px;padding:14px 16px 14px 22px}}',
    /* desktop dashboard hero */
    '.la-dash{background:var(--peach);border-radius:28px;padding:28px;position:relative;overflow:hidden;margin-top:24px;display:flex;flex-direction:column;gap:18px}',
    '.la-dash .head{display:flex;align-items:flex-start;gap:20px;flex-wrap:wrap}',
    '.la-dash h1{font:600 38px/1.1 Fredoka,sans-serif;margin:0}.la-dash .head p{margin:6px 0 0;color:var(--body)}',
    '.la-kid{margin-left:auto;display:flex;align-items:center;gap:12px;background:#fff;border:1.5px solid var(--ink);border-radius:999px;padding:6px 8px 6px 8px;text-decoration:none;color:var(--ink)}',
    '.la-kid .av{width:40px;height:40px;border-radius:999px;display:flex;align-items:center;justify-content:center;font:600 18px Fredoka,sans-serif}',
    '.la-kid small{display:block;font-size:11.5px;color:var(--muted);font-weight:700}.la-kid b{font-size:15px}',
    '.la-kid .sw{border-left:1px solid var(--line);padding:0 10px 0 12px;font-weight:800;font-size:14px}',
    '.la-dgrid{display:grid;grid-template-columns:1fr 1fr;gap:16px}',
    '.la-panel{background:#fff;border-radius:22px;padding:18px 20px;display:flex;flex-direction:column;gap:10px}',
    '.la-panel .la-ph{display:flex;justify-content:space-between;align-items:center;background:none}.la-panel h2{font:600 22px Fredoka,sans-serif;margin:0;color:var(--ink);background:none}',
    '.la-panel .la-lk{font:800 14px Figtree,sans-serif;color:var(--ink)}',
    '.la-used{display:flex;align-items:center;gap:12px;background:var(--paper);border-radius:14px;padding:10px 14px;text-decoration:none;color:var(--ink)}',
    '.la-used .ic{width:40px;height:40px;border-radius:10px;display:flex;align-items:center;justify-content:center;flex:none}',
    '.la-used b{display:block;font-size:15px}.la-used small{color:var(--muted);font-size:12.5px}.la-used .op{margin-left:auto;font-weight:800;font-size:14px}',
    '.la-empty{border:2px dashed var(--line);border-radius:18px;padding:22px;display:flex;flex-direction:column;gap:10px;align-items:flex-start;flex:1}',
    '.la-empty h3{font:600 20px Fredoka,sans-serif;margin:0}.la-empty p{margin:0;color:var(--body);font-size:14.5px}',
    '.la-libitem{display:flex;align-items:center;gap:12px;padding:8px;border-radius:14px;background:var(--paper);text-decoration:none;color:var(--ink)}',
    '.la-upbar{background:#fff;border-radius:18px;padding:12px 14px 12px 18px;display:flex;align-items:center;gap:14px;flex-wrap:wrap}',
    '.la-upbar b{font:600 20px Fredoka,sans-serif}.la-upbar span.d{color:var(--body);font-size:14px;flex:1}',
    '@media(max-width:959px){.la-dash{display:none}}',
    '@media(min-width:960px){.la-hcard.mob{display:none}}',
    /* header bits */
    '.la-hdr-login{font-weight:800;font-size:15px;text-decoration:none;color:var(--ink);padding:0 10px;min-height:44px;display:inline-flex;align-items:center;white-space:nowrap}',
    '.la-hdr-me{position:relative}',
    '.la-hdr-btn{display:inline-flex;align-items:center;gap:8px;height:44px;padding:0 12px 0 4px;border-radius:999px;border:1px solid var(--line);background:#fff;font:800 15px Figtree,sans-serif;color:var(--ink);cursor:pointer;white-space:nowrap}',
    '.la-hdr-btn .av{width:36px;height:36px;border-radius:999px;background:var(--ink);color:#fff;display:flex;align-items:center;justify-content:center;font:600 17px Fredoka,sans-serif}',
    '.la-menu{position:absolute;right:0;top:52px;background:#fff;border:1px solid var(--line);border-radius:18px;box-shadow:0 16px 40px #2B2A3522;min-width:240px;padding:8px;z-index:60;display:flex;flex-direction:column}',
    '.la-menu a,.la-menu button{display:flex;align-items:center;gap:8px;padding:12px 12px;border-radius:12px;text-decoration:none;color:var(--ink);font:700 15px Figtree,sans-serif;background:none;border:0;cursor:pointer;text-align:left}',
    '.la-menu a:hover,.la-menu button:hover{background:var(--sand)}',
    '.la-menu .who{display:flex;flex-direction:column;gap:2px;padding:10px 12px 12px;border-bottom:1px solid var(--line);margin-bottom:6px}.la-menu .who b{display:block}.la-menu .who small{color:var(--muted);font-size:12.5px}',
    '.la-logo-plus{margin-left:8px;vertical-align:4px}',
    '.tabbar .la-tabplus{position:absolute;top:-4px;right:-14px;font-size:8.5px;height:15px;padding:0 5px}',
    '.tabbar .tb-ico{position:relative}',
    '.la-focus .tabbar{display:none}',
    '.la-hide-desk{}',
    '@media(min-width:960px){.la-hide-desk{display:none!important}}',
    '.la-prog{width:190px;height:12px;border-radius:99px;border:2px solid var(--ink);background:var(--butter);overflow:hidden}',
    '.la-prog i{display:block;height:100%;background:var(--ink);border-radius:99px;animation:luFill 2.2s ease-in-out infinite}',
    '@keyframes luFill{0%{width:5%}85%,100%{width:100%}}',
    '@media (prefers-reduced-motion:reduce){.la-prog i{animation:none;width:40%}}',
    '.la-steps{display:flex;flex-direction:column;gap:14px}.la-steps div{display:flex;align-items:center;gap:12px;font-weight:700}',
    '.la-steps span{width:30px;height:30px;border-radius:999px;border:1.5px solid var(--ink);display:flex;align-items:center;justify-content:center;font-weight:800;font-size:14px;flex:none}',
    '.la-steps .on span{background:var(--ink);color:#fff}',
    '.la-thanks{background:var(--sunny);border-radius:28px;padding:28px 22px;display:flex;flex-direction:column;align-items:center;gap:16px;text-align:center}',
    '.la-thanks h1{font:600 30px/1.15 Fredoka,sans-serif;margin:0}',
    '.la-sum{background:#fff;border-radius:18px;padding:4px 16px;width:100%;max-width:380px}',
    '.la-sum div{display:flex;justify-content:space-between;padding:12px 0;border-top:1px solid var(--line);font-size:14.5px}.la-sum div:first-child{border-top:0}.la-sum b{font-weight:800}',
    '.la-flow{max-width:460px;margin:0 auto;padding:28px 16px 48px;display:flex;flex-direction:column;gap:16px;min-height:calc(100vh - 72px)}',
    '.la-flow .grow{flex:1}',
    '.la-buy{display:flex;flex-direction:column;gap:10px;width:100%}',
    '.buybar .la-buy{flex-direction:row}',
    '.la-buybar-wrap{display:flex;gap:10px;width:100%}',
    '.la-cardtag{margin-left:6px;vertical-align:1px;font-size:10px;height:19px}'
  ].join('\n');
  function injectCSS() { if (document.getElementById('la-css')) return; var s = document.createElement('style'); s.id = 'la-css'; s.textContent = CSS; document.head.appendChild(s); }

  /* ===================== icons and art ===================== */
  var IC = {
    check: '<svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="#1E6B45" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 8.5l3 3 7-7"/></svg>',
    checkS: '<svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 8.5l3 3 7-7"/></svg>',
    x: '<svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M5 5l10 10M15 5L5 15"/></svg>',
    back: '<svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12.5 4l-6 6 6 6"/></svg>',
    chev: '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 3.5l4.5 4.5L6 12.5"/></svg>',
    mail: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="3"/><path d="M4 7l8 6 8-6"/></svg>',
    mailBig: '<svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="#2B2A35" stroke-width="1.8" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="3"/><path d="M4 7l8 6 8-6"/></svg>',
    eye: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>',
    clock: '<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#2B2A35" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
    bigCheck: '<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#1E6B45" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>',
    shield: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1E6B45" stroke-width="2" stroke-linejoin="round" aria-hidden="true"><path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6z"/><path d="M9 12l2 2 4-4" stroke-linecap="round"/></svg>',
    ext: '<svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 2.5h4.5V7M13.5 2.5L7 9M11 9.5v3a1 1 0 0 1-1 1H3.5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h3"/></svg>',
    dl: '<svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10 3v10M5.5 9l4.5 4.5L14.5 9M4 16.5h12"/></svg>'
  };
  function heartFace(size, stroke) {
    return '<svg width="' + size + '" height="' + Math.round(size * 0.94) + '" viewBox="0 0 64 60" fill="none" stroke="' + (stroke || '#2B2A35') + '" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M32 54C24 49 6 37 6 21 6 12 12 6 20 6c6 0 10 4 12 9 2-5 6-9 12-9 8 0 14 6 14 15 0 9-6 17-13 23"/><path d="M45 44l-2 9"/><circle cx="24" cy="24" r="1.2" fill="' + (stroke || '#2B2A35') + '"/><circle cx="40" cy="24" r="1.2" fill="' + (stroke || '#2B2A35') + '"/><path d="M24 33c4 4 12 4 16 0"/></svg>';
  }
  function pill(kind) { return kind === 'free' ? '<span class="la-pill free">' + esc(t('free')) + '</span>' : '<span class="la-pill">' + esc(t('plus')) + '</span>'; }
  function eyeBtn() { return '<button type="button" class="la-eye" data-eye aria-label="' + esc(t('show')) + '">' + IC.eye + '</button>'; }
  function field(id, label, type, val, extra) {
    return '<div class="la-field"><label for="' + id + '">' + esc(label) + '</label><div class="la-input"><input id="' + id + '" type="' + type + '" value="' + esc(val || '') + '"' + (extra || '') + '>' + (type === 'password' ? eyeBtn() : '') + '</div></div>';
  }
  function topBar(opts) {
    opts = opts || {};
    return '<div class="la-top"><a href="#/" aria-label="little us home"><img src="/logo.png" alt="little us"></a><span class="sp"></span>' +
      (window.LU ? '<div class="lang-tog" role="group"><button type="button" data-set-lang="en"' + (L() === 'en' ? ' class="on"' : '') + '>EN</button><button type="button" data-set-lang="id"' + (L() === 'id' ? ' class="on"' : '') + '>ID</button></div>' : '') +
      '<a class="la-xlink" href="' + esc(opts.back || '#/') + '">' + IC.x + '<span class="desk-inline">' + esc(t('backToLU')) + '</span></a></div>';
  }
  function childName() {
    try { var s = store.json(TKEY, null), p = s && (s.profiles || []).filter(function (x) { return x.id === s.current; })[0]; return p ? p.name : ''; } catch (e) { return ''; }
  }
  function currentChild() {
    try { var s = store.json(TKEY, null); return s && (s.profiles || []).filter(function (x) { return x.id === s.current; })[0]; } catch (e) { return null; }
  }

  /* ===================== sheets ===================== */
  var openSheets = [];
  function sheet(html, opts) {
    opts = opts || {};
    var sc = document.createElement('div');
    sc.className = 'la-scrim';
    sc.innerHTML = '<div class="la-sheet" role="dialog" aria-modal="true"><span class="la-handle"></span>' + (opts.close !== false ? '<button type="button" class="la-iconbtn la-close" data-close aria-label="' + esc(t('close')) + '">' + IC.x + '</button>' : '') + html + '</div>';
    document.body.appendChild(sc);
    var api = { el: sc.firstChild, close: function () { if (sc.parentNode) sc.parentNode.removeChild(sc); openSheets = openSheets.filter(function (x) { return x !== api; }); if (opts.onClose) opts.onClose(); } };
    sc.addEventListener('click', function (e) { if (e.target === sc || e.target.closest('[data-close]')) api.close(); });
    openSheets.push(api);
    var f = sc.querySelector('button:not(.la-close),a,input'); if (f && f.focus) setTimeout(function () { try { f.focus({ preventScroll: true }); } catch (e) {} }, 30);
    return api;
  }
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && openSheets.length) openSheets[openSheets.length - 1].close(); });

  // B01: a locked tool style
  function lockSheet(id, visHTML, currentName) {
    var a = access(id), nm = featName(id), st = settings();
    if (a === 'account') {
      var s1 = sheet('<div style="display:flex;align-items:center;gap:12px">' + (visHTML ? '<span class="la-lockvis">' + visHTML + '</span>' : '') + '<span class="la-pill free">' + esc(t('free')) + '</span></div>' +
        '<h2>' + esc(t('accLockH', nm)) + '</h2><p class="la-p">' + esc(t('accLockP')) + '</p>' +
        '<a class="la-btn primary block" href="#/signup" data-close>' + esc(t('createFreeAcc')) + '</a>' +
        '<a class="la-btn soft block" href="#/login" data-close>' + esc(t('logIn')) + '</a>');
      return s1;
    }
    var title = st.popTitle ? st.popTitle.replace('{name}', nm) : t('comesWith', nm);
    return sheet('<div style="display:flex;align-items:center;gap:12px">' + (visHTML ? '<span class="la-lockvis">' + visHTML + '</span>' : '') + pill('plus') + '</div>' +
      '<h2>' + esc(title) + '</h2><p class="la-p">' + esc(st.popBody || t('lockP')) + '</p>' +
      '<ul class="la-checks"><li><span class="la-chk">' + IC.check + '</span>' + esc(t('l1')) + '</li><li><span class="la-chk">' + IC.check + '</span>' + esc(t('l2')) + '</li></ul>' +
      '<a class="la-btn primary block" href="#/plus" data-close>' + esc(t('getPlus')) + '</a>' +
      '<button type="button" class="la-btn soft block" data-close>' + esc(currentName ? t('keepUsing', currentName) : t('notNow')) + '</button>' +
      '<p class="la-small" style="text-align:center;margin:0">' + esc(t('fromNote', st.p3)) + '</p>');
  }
  function childLockSheet() {
    var st = settings();
    return sheet('<div>' + pill('plus') + '</div><h2>' + esc(t('childLockH')) + '</h2><p class="la-p">' + esc(t('childLockP')) + '</p>' +
      '<a class="la-btn primary block" href="#/plus" data-close>' + esc(t('getPlus')) + '</a><button type="button" class="la-btn soft block" data-close>' + esc(t('notNow')) + '</button>' +
      '<p class="la-small" style="text-align:center;margin:0">' + esc(t('fromNote', st.p3)) + '</p>');
  }

  /* ===================== tools: locks on style options ===================== */
  var OPT_SEL = [
    { sel: '[data-tstyle]', tool: 'timer', v: function (el) { return el.getAttribute('data-tstyle'); } },
    { sel: '.tl-shape[data-shape]', tool: 'tokens', v: function (el) { return el.getAttribute('data-shape'); } },
    { sel: '[data-lc="bstyle"][data-v]', tool: 'breathe', v: function (el) { return el.getAttribute('data-v'); } }
  ];
  function optFeature(el) {
    for (var i = 0; i < OPT_SEL.length; i++) if (el.matches(OPT_SEL[i].sel)) return OPT_SEL[i].tool + '.' + OPT_SEL[i].v(el);
    return null;
  }
  function decorateTools(root) {
    if (!root || !FEAT.list.length) return;
    OPT_SEL.forEach(function (o) {
      $$(o.sel, root).forEach(function (el) {
        if (el.closest('.tl-child,.tl-cwrap')) return; // child mode never shows locks
        var id = o.tool + '.' + o.v(el), a = access(id), ok = allowed(id);
        el.classList.toggle('lu-hiddenopt', a === 'hidden');
        el.classList.toggle('lu-locked', !ok && a !== 'hidden');
        var p = el.querySelector('.lu-lockpill');
        if (!ok && a !== 'hidden') { if (!p) { var s = document.createElement('span'); s.className = 'lu-lockpill la-pill' + (a === 'account' ? ' free' : ''); s.textContent = a === 'account' ? t('free') : t('plus'); el.appendChild(s); } }
        else if (p) p.remove();
      });
    });
  }
  function currentOptName(el) {
    var on = el.parentNode && el.parentNode.querySelector('.on');
    if (!on || on === el) return '';
    var b = on.querySelector('b,small'); return b ? b.textContent.trim() : '';
  }
  document.addEventListener('click', function (e) {
    var el = e.target.closest && e.target.closest('.lu-locked');
    if (el && el.closest('#tools-root')) {
      var id = optFeature(el); if (!id) return;
      e.preventDefault(); e.stopPropagation();
      var vis = el.querySelector('.tl-optvis,svg'); vis = vis ? (vis.tagName === 'svg' ? vis.outerHTML : vis.innerHTML) : '';
      lockSheet(id, vis, currentOptName(el));
      return;
    }
    var add = e.target.closest && e.target.closest('a[href*="tools/setup?new=1"]');
    if (add && childCount() >= 1 && !canAddChild()) { e.preventDefault(); e.stopPropagation(); childLockSheet(); }
  }, true);
  var mo = null;
  function watchTools() {
    var root = document.getElementById('tools-root');
    if (!root || root._laWatched) return;
    root._laWatched = true;
    decorateTools(root);
    if (window.MutationObserver) { mo = new MutationObserver(function () { decorateTools(root); }); mo.observe(root, { childList: true, subtree: true }); }
  }

  /* ===================== pages ===================== */
  function pageShell(opts) {
    return function () {
      document.documentElement.classList.toggle('la-focus', !!opts.focus);
      LU.page({
        header: opts.header || 'full', footer: opts.footer || 'full', ordersBanner: false,
        title: function () { return typeof opts.title === 'function' ? opts.title() : t(opts.title); },
        init: function () { injectCSS(); if (opts.init) return opts.init(); },
        render: function () { var m = document.getElementById('la-root'); if (m) { m.innerHTML = opts.render(); wireCommon(m); if (opts.wire) opts.wire(m); } }
      });
      LU.listen && LU.listen({ addEventListener: function () {}, removeEventListener: function () { document.documentElement.classList.remove('la-focus'); if (opts.leave) opts.leave(); } }, 'x', function () {});
    };
  }
  function wireCommon(root) {
    $$('[data-eye]', root).forEach(function (b) {
      b.onclick = function () { var i = b.parentNode.querySelector('input'); var show = i.type === 'password'; i.type = show ? 'text' : 'password'; b.setAttribute('aria-label', t(show ? 'hide' : 'show')); };
    });
  }
  function busy(btn, on) { if (!btn) return; if (on) { btn.dataset.label = btn.innerHTML; btn.disabled = true; btn.innerHTML = '<span class="spinner"></span>'; } else { btn.disabled = false; if (btn.dataset.label) btn.innerHTML = btn.dataset.label; } }
  function showErr(root, msg) { var b = $('[data-err]', root); if (b) { b.hidden = !msg; b.innerHTML = msg ? esc(msg) : ''; } }
  function errText(e) { return e && e.network ? t('netErr') : (e && e.message) || t('netErr'); }
  function cooldown(btn, label, secs) {
    var end = Date.now() + secs * 1000; btn.disabled = true;
    (function tick() {
      var left = Math.ceil((end - Date.now()) / 1000);
      if (!document.body.contains(btn)) return;
      if (left <= 0) { btn.disabled = false; btn.textContent = label; return; }
      btn.textContent = label + ' · 0:' + String(left).padStart(2, '0');
      setTimeout(tick, 500);
    })();
  }
  function afterLogin() {
    var pend = store.json('lu_pending_plan', null);
    return Promise.all([loadAccount(), pullState('login'), loadFeatures(true)]).then(function () {
      if (pend && Date.now() - pend.at < 24 * 3600 * 1000) { store.del('lu_pending_plan'); go('#/plus?plan=' + pend.plan + '&go=1', true); return; }
      var next = ss.json('lu_after_login', null); ss.del('lu_after_login');
      go(next || '#/', true);
    });
  }

  // ----- A01 / A02 / A03: sign up
  var SU = { step: 'intro', name: '', email: '', pw: '', pw2: '', exists: false };
  function sideHTML() {
    return '<aside class="la-side"><span class="sun"></span><span class="ring"></span><h2>' + esc(t('sideH')) + '</h2><ul class="la-checks big"><li><span class="la-chk">' + IC.check + '</span>' + esc(t('inc1')) + '</li><li><span class="la-chk">' + IC.check + '</span>' + esc(t('inc2')) + '</li><li><span class="la-chk">' + IC.check + '</span>' + esc(t('inc3')) + '</li></ul><p class="la-p">' + esc(t('sideNote')) + '</p></aside>';
  }
  function pwHints() {
    var ok8 = SU.pw.length >= 8, m = SU.pw2 && SU.pw === SU.pw2;
    return { a: SU.pw ? '<span class="la-hint ' + (ok8 ? 'ok' : '') + '">' + (ok8 ? IC.checkS : '') + esc(t('min8')) + '</span>' : '<span class="la-hint">' + esc(t('min8')) + '</span>',
      b: SU.pw2 ? '<span class="la-hint ' + (m ? 'ok' : 'bad') + '">' + (m ? IC.checkS : '') + esc(t(m ? 'pwMatch' : 'pwNoMatch')) + '</span>' : '<span class="la-hint"></span>' };
  }
  function renderSignup() {
    if (signedIn()) return '<div class="la-flow"><p class="la-p">' + esc((me() || {}).email || '') + '</p><a class="la-btn primary block" href="#/account">' + esc(t('myAccount')) + '</a></div>';
    var kid = childName() || t('yourChild');
    var intro = '<div class="la-form la-mobonly" data-step="intro"' + (SU.step === 'intro' ? '' : ' hidden') + '>' +
      heartFace(44) + '<h1 class="la-h1">' + esc(t('createH')) + '</h1><p class="la-p">' + esc(t('createIntro', kid)) + '</p>' +
      '<button type="button" class="la-btn outline block" data-act="toform">' + IC.mail + esc(t('contEmail')) + '</button>' +
      '<div class="la-card"><div class="la-small" style="font-weight:800;letter-spacing:.06em;text-transform:uppercase;margin-bottom:10px">' + esc(t('includes')) + '</div><ul class="la-checks"><li><span class="la-chk">' + IC.check + '</span><span style="font-weight:500">' + esc(t('inc1')) + '</span></li><li><span class="la-chk">' + IC.check + '</span><span style="font-weight:500">' + esc(t('inc2')) + '</span></li><li><span class="la-chk">' + IC.check + '</span><span style="font-weight:500">' + esc(t('inc3')) + '</span></li></ul></div>' +
      '<p class="la-p" style="text-align:center">' + esc(t('haveAcc')) + ' <a href="#/login">' + esc(t('logIn')) + '</a></p><p class="la-small" style="text-align:center;margin:0">' + t('terms') + '</p></div>';
    var h = pwHints();
    var form = '<form class="la-form" data-step="form" novalidate' + (SU.step === 'intro' ? ' data-mobhide' : '') + '>' +
      '<h1 class="la-h1">' + esc(t('createH')) + '</h1>' +
      field('suName', t('name'), 'text', SU.name, ' autocomplete="name"') +
      field('suEmail', t('email'), 'email', SU.email, ' autocomplete="email" inputmode="email"') +
      '<div data-exists' + (SU.exists ? '' : ' hidden') + '><div class="la-has"><b>' + esc(t('hasAccH')) + '</b><span class="la-p" style="font-size:14px">' + esc(t('hasAccP', SU.email)) + '</span><button type="button" class="la-btn dark block sm" data-act="loginwith">' + esc(t('logInWith')) + '</button><a href="#/forgot-password" class="la-link" style="align-self:center;font-size:14px" data-act="forgotwith">' + esc(t('forgot')) + '</a></div></div>' +
      '<div data-pwpart' + (SU.exists ? ' hidden' : '') + ' class="la-stack" style="gap:14px">' +
      '<div>' + field('suPw', t('password'), 'password', SU.pw, ' autocomplete="new-password"') + '<div data-h1 style="margin-top:6px">' + h.a + '</div></div>' +
      '<div>' + field('suPw2', t('confirmPw'), 'password', SU.pw2, ' autocomplete="new-password"') + '<div data-h2 style="margin-top:6px">' + h.b + '</div></div></div>' +
      '<div class="la-err" data-err hidden></div>' +
      '<button type="submit" class="la-btn primary block" data-act="create"' + (SU.exists ? ' disabled' : '') + '>' + esc(t('createBtn')) + '</button>' +
      '<p class="la-p" style="font-size:14.5px">' + esc(t('haveAcc')) + ' <a href="#/login">' + esc(t('logIn')) + '</a></p>' +
      '<p class="la-small" style="margin:0">' + t('terms') + '</p></form>';
    return topBar() + '<div class="la-auth">' + sideHTML() + '<div class="la-formcol">' + intro + form + '</div></div>';
  }
  function wireSignup(root) {
    var form = $('form[data-step=form]', root), intro = $('[data-step=intro]', root);
    function mobile() { return !window.matchMedia('(min-width:960px)').matches; }
    if (form && intro && SU.step === 'intro' && mobile()) form.hidden = true;
    var toForm = $('[data-act=toform]', root);
    if (toForm) toForm.onclick = function () { SU.step = 'form'; intro.hidden = true; form.hidden = false; var n = $('#suName', root); n && n.focus(); };
    if (!form) return;
    var n = $('#suName', root), em = $('#suEmail', root), p1 = $('#suPw', root), p2 = $('#suPw2', root);
    function hints() { var h = pwHints(); $('[data-h1]', root).innerHTML = h.a; $('[data-h2]', root).innerHTML = h.b; }
    n.oninput = function () { SU.name = n.value; };
    p1.oninput = function () { SU.pw = p1.value; hints(); };
    p2.oninput = function () { SU.pw2 = p2.value; hints(); };
    function setExists(v) {
      SU.exists = v;
      $('[data-exists]', root).hidden = !v; $('[data-pwpart]', root).hidden = v;
      $('[data-act=create]', root).disabled = v;
      if (v) $('[data-exists] .la-p', root).textContent = t('hasAccP', SU.email);
    }
    em.oninput = function () { SU.email = em.value.trim(); if (SU.exists) setExists(false); };
    em.onblur = function () {
      var v = em.value.trim().toLowerCase(); if (!validEmail(v) || !ON) return;
      http('/rest/v1/rpc/lu_email_has_account', { method: 'POST', auth: false, body: { p_email: v } }).then(function (r) { if (r === true && em.value.trim().toLowerCase() === v) setExists(true); }).catch(function () {});
    };
    $('[data-act=loginwith]', root).onclick = function () { ss.setJson('lu_login_email', SU.email); go('#/login'); };
    $('[data-act=forgotwith]', root).onclick = function () { ss.setJson('lu_login_email', SU.email); };
    form.onsubmit = function (e) {
      e.preventDefault();
      if (!ON) return showErr(root, t('notReady'));
      SU.name = n.value.trim(); SU.email = em.value.trim().toLowerCase(); SU.pw = p1.value; SU.pw2 = p2.value;
      var err = !SU.name ? 'eName' : !validEmail(SU.email) ? 'eEmail' : SU.pw.length < 8 ? 'ePw' : SU.pw !== SU.pw2 ? 'ePw2' : '';
      [[n, 'eName'], [em, 'eEmail'], [p1, 'ePw'], [p2, 'ePw2']].forEach(function (x) { x[0].classList.toggle('err', err === x[1]); });
      if (err) return showErr(root, t(err));
      showErr(root, '');
      var btn = $('[data-act=create]', root); busy(btn, true);
      auth.signUp(SU.name, SU.email, SU.pw).then(function (r) {
        // Supabase hides existing emails behind a user with no identities
        if (r && r.user && Array.isArray(r.user.identities) && !r.user.identities.length) { busy(btn, false); setExists(true); return; }
        if (r && r.access_token) { setSession(r); return afterSignup(); }
        ss.setJson('lu_check_email', { email: SU.email, at: Date.now() });
        SU.pw = SU.pw2 = '';
        go('#/check-email');
      }).catch(function (e2) {
        busy(btn, false);
        if (e2 && (e2.code === 'user_already_exists' || /already registered/i.test(e2.message))) return setExists(true);
        if (e2 && e2.code === 'weak_password') return showErr(root, t('ePw'));
        showErr(root, errText(e2));
      });
    };
  }
  function afterSignup() { return Promise.all([loadAccount(), pushState()]).then(function () { afterLogin(); }); }

  // ----- A04: check your email
  function renderCheck() {
    var c = ss.json('lu_check_email', null) || {};
    return topBar() + '<div class="la-flow"><div class="grow"></div><div class="la-center"><span class="la-circle">' + IC.mailBig + '</span><h1 class="la-h1" style="font-size:28px">' + esc(t('checkH')) + '</h1><p class="la-p">' + t('checkP', esc(c.email || '')) + '</p><div class="la-note">' + esc(t('cantFind')) + '</div></div><div class="grow"></div>' +
      '<a class="la-btn primary block" href="mailto:">' + esc(t('openMail')) + '</a><button type="button" class="la-btn line block" data-act="resend">' + esc(t('resend')) + '</button>' +
      '<a class="la-link" style="align-self:center" href="#/signup" data-act="change">' + esc(t('wrongEmail')) + '</a></div>';
  }
  function wireCheck(root) {
    var c = ss.json('lu_check_email', null) || {}, b = $('[data-act=resend]', root);
    var since = Math.max(0, 60 - Math.floor((Date.now() - (c.at || 0)) / 1000));
    if (since > 0) cooldown(b, t('resend'), since);
    b.onclick = function () {
      if (!c.email) return go('#/signup');
      auth.resend(c.email).then(function () { c.at = Date.now(); ss.setJson('lu_check_email', c); toast(t('sentAgain')); cooldown(b, t('resend'), 60); }).catch(function (e) { toast(errText(e), 'error'); });
    };
    $('[data-act=change]', root).onclick = function () { SU.step = 'form'; SU.email = c.email || ''; };
  }

  // ----- A05: log in
  var LI = { email: '', pw: '' };
  function renderLogin() {
    var pre = ss.json('lu_login_email', null); if (pre) { LI.email = pre; ss.del('lu_login_email'); }
    var last = store.get('lu_last_email');
    if (!LI.email && last) LI.email = last;
    return topBar() + '<div class="la-auth">' + sideHTML() + '<div class="la-formcol"><form class="la-form" novalidate>' +
      '<h1 class="la-h1">' + esc(t('welcomeBack')) + '</h1><p class="la-p">' + esc(t('loginP')) + '</p>' +
      field('liEmail', t('email'), 'email', LI.email, ' autocomplete="email" inputmode="email"') +
      field('liPw', t('password'), 'password', '', ' autocomplete="current-password"') +
      '<a href="#/forgot-password" class="la-link" style="align-self:flex-end;font-size:14px" data-act="forgot">' + esc(t('forgot')) + '</a>' +
      '<div class="la-err" data-err hidden></div><div data-unconf hidden><button type="button" class="la-link" data-act="resendc">' + esc(t('sendAgain')) + '</button></div>' +
      '<button type="submit" class="la-btn primary block">' + esc(t('logIn')) + '</button>' +
      '<p class="la-p" style="text-align:center">' + esc(t('newHere')) + ' <a href="#/signup">' + esc(t('createFree')) + '</a></p></form></div></div>';
  }
  function wireLogin(root) {
    var f = $('form', root), em = $('#liEmail', root), pw = $('#liPw', root);
    if (em.value) setTimeout(function () { pw.focus(); }, 50);
    $('[data-act=forgot]', root).onclick = function () { ss.setJson('lu_login_email', em.value.trim()); };
    $('[data-act=resendc]', root).onclick = function () {
      auth.resend(em.value.trim().toLowerCase()).then(function () { ss.setJson('lu_check_email', { email: em.value.trim().toLowerCase(), at: Date.now() }); go('#/check-email'); }).catch(function (e) { toast(errText(e), 'error'); });
    };
    f.onsubmit = function (e) {
      e.preventDefault();
      if (!ON) return showErr(root, t('notReady'));
      var email = em.value.trim().toLowerCase(); LI.email = email;
      if (!validEmail(email)) { em.classList.add('err'); return showErr(root, t('eEmail')); }
      var btn = $('button[type=submit]', root); busy(btn, true); showErr(root, ''); $('[data-unconf]', root).hidden = true;
      auth.logIn(email, pw.value).then(function () { store.set('lu_last_email', email); return afterLogin(); }).catch(function (er) {
        busy(btn, false);
        if (er && (er.code === 'email_not_confirmed' || /not confirmed/i.test(er.message))) { showErr(root, t('notConfirmed')); $('[data-unconf]', root).hidden = false; return; }
        if (er && (er.status === 400 || er.code === 'invalid_credentials')) { pw.classList.add('err'); return showErr(root, t('badLogin')); }
        showErr(root, errText(er));
      });
    };
  }

  // ----- A06 / A07: forgot password
  var FP = { sent: false, email: '' };
  function renderForgot() {
    var pre = ss.json('lu_login_email', null); if (pre) { FP.email = pre; ss.del('lu_login_email'); }
    if (FP.sent) {
      return topBar({ back: '#/login' }) + '<div class="la-flow"><div class="grow"></div><div class="la-center"><span class="la-circle">' + IC.mailBig + '</span><h1 class="la-h1" style="font-size:28px">' + esc(t('inboxH')) + '</h1><p class="la-p">' + t('inboxP', esc(FP.email)) + '</p></div><div class="grow"></div>' +
        '<a class="la-btn primary block" href="mailto:">' + esc(t('openMail')) + '</a><button type="button" class="la-btn line block" data-act="resend">' + esc(t('resendLink')) + '</button><a class="la-link" style="align-self:center" href="#/login">' + esc(t('backLogin')) + '</a></div>';
    }
    return topBar({ back: '#/login' }) + '<div class="la-flow"><form class="la-form" novalidate style="flex:1"><h1 class="la-h1">' + esc(t('resetH')) + '</h1><p class="la-p">' + esc(t('resetP')) + '</p>' +
      field('fpEmail', t('email'), 'email', FP.email, ' autocomplete="email" inputmode="email"') + '<div class="la-err" data-err hidden></div><div class="grow"></div>' +
      '<button type="submit" class="la-btn primary block">' + esc(t('sendReset')) + '</button><a class="la-link" style="align-self:center" href="#/login">' + esc(t('backLogin')) + '</a></form></div>';
  }
  function wireForgot(root) {
    var f = $('form', root);
    function send(email, btn) {
      return auth.recover(email).catch(function (e) { if (e && e.network) throw e; }) // same answer whether or not the account exists
        .then(function () { FP.sent = true; FP.email = email; FP.at = Date.now(); rerender(); })
        .catch(function (e) { busy(btn, false); showErr(root, errText(e)); });
    }
    if (f) f.onsubmit = function (e) {
      e.preventDefault(); if (!ON) return showErr(root, t('notReady'));
      var em = $('#fpEmail', root), v = em.value.trim().toLowerCase();
      if (!validEmail(v)) { em.classList.add('err'); return showErr(root, t('eEmail')); }
      var btn = $('button[type=submit]', root); busy(btn, true); send(v, btn);
    };
    var r = $('[data-act=resend]', root);
    if (r) { var left = Math.max(0, 60 - Math.floor((Date.now() - (FP.at || 0)) / 1000)); if (left) cooldown(r, t('resendLink'), left); r.onclick = function () { auth.recover(FP.email).catch(function () {}); FP.at = Date.now(); cooldown(r, t('resendLink'), 60); }; }
  }

  // ----- A08 / A09: set a new password (from the email link)
  var RP = { done: false, expired: false };
  function renderReset() {
    var em = (session && session.user && session.user.email) || '';
    if (RP.done) return topBar() + '<div class="la-flow"><div class="grow"></div><div class="la-center"><span class="la-circle mint">' + IC.bigCheck + '</span><h1 class="la-h1">' + esc(t('pwUpdated')) + '</h1><p class="la-p">' + esc(t('pwUpdatedP', em)) + '</p></div><div class="grow"></div><a class="la-btn primary block" href="#/">' + esc(t('goDash')) + '</a></div>';
    if (RP.expired || !session) return topBar() + '<div class="la-flow"><div class="grow"></div><div class="la-center"><span class="la-circle">' + IC.clock + '</span><h1 class="la-h1">' + esc(t('expiredLink')) + '</h1><p class="la-p">' + esc(t('expiredP')) + '</p></div><div class="grow"></div><a class="la-btn primary block" href="#/forgot-password">' + esc(t('sendNew')) + '</a></div>';
    SU.pw = SU.pw2 = '';
    var h = pwHints();
    return topBar() + '<div class="la-flow"><form class="la-form" novalidate style="flex:1"><h1 class="la-h1">' + esc(t('newPwH')) + '</h1><p class="la-p">' + esc(t('forE', em)) + '</p>' +
      '<div>' + field('rpPw', t('newPw'), 'password', '', ' autocomplete="new-password"') + '<div data-h1 style="margin-top:6px">' + h.a + '</div></div>' +
      '<div>' + field('rpPw2', t('typeAgain'), 'password', '', ' autocomplete="new-password"') + '<div data-h2 style="margin-top:6px">' + h.b + '</div></div>' +
      '<div class="la-err" data-err hidden></div><div class="grow"></div><button type="submit" class="la-btn primary block">' + esc(t('saveNewPw')) + '</button></form></div>';
  }
  function wireReset(root) {
    var f = $('form', root); if (!f) return;
    var p1 = $('#rpPw', root), p2 = $('#rpPw2', root);
    function hints() { SU.pw = p1.value; SU.pw2 = p2.value; var h = pwHints(); $('[data-h1]', root).innerHTML = h.a; $('[data-h2]', root).innerHTML = h.b; }
    p1.oninput = p2.oninput = hints;
    f.onsubmit = function (e) {
      e.preventDefault();
      if (p1.value.length < 8) return showErr(root, t('ePw'));
      if (p1.value !== p2.value) return showErr(root, t('ePw2'));
      var btn = $('button[type=submit]', root); busy(btn, true);
      auth.setPassword(p1.value).then(function () { return auth.logOut('others'); }).then(function () { RP.done = true; loadAccount(); pullState('login'); rerender(); })
        .catch(function (er) { busy(btn, false); if (er && er.status === 401) { RP.expired = true; return rerender(); } showErr(root, er && er.code === 'same_password' ? errText(er) : errText(er)); });
    };
  }

  // ----- C01 / C02 / C03: plans
  var PL = { plan: '12m' };
  function newEnd(plan) { var base = isPlus() ? plusUntil() : new Date(); return addMonths(base, plan === '12m' ? 12 : 3); }
  function planCard(plan, st, compact) {
    var on = PL.plan === plan, end = newEnd(plan);
    return '<button type="button" class="la-plan' + (on ? ' on' : '') + '" data-plan="' + plan + '" aria-pressed="' + on + '"><span class="la-radio"></span><span class="nm"><b>' + esc(t(plan === '12m' ? 'm12' : 'm3')) + (plan === '12m' ? ' <span class="la-pill best">' + esc(t('bestValue')) + '</span>' : '') + '</b>' +
      (compact ? '<small>' + esc(t('plusUntil', fmtDate(end))) + '</small>' : '') + '</span><span class="pr"><b>' + esc(plan === '12m' ? st.p12 : st.p3) + '</b><small>' + esc(plan === '12m' ? st.pm12 : st.pm3) + '</small></span></button>';
  }
  function renderPlans() {
    var st = settings(), u = me(), kid = childName() || t('yourChild'), price = PL.plan === '12m' ? st.p12 : st.p3, end = newEnd(PL.plan);
    var left = '<div><span class="la-pill">' + esc(t('plus')) + '</span><h1>' + esc(t('upgradeH')) + '</h1><p class="la-p" style="font-size:17px">' + esc(st.note || t('choosePass')) + '</p>' +
      '<ul class="la-checks" style="margin-top:22px">' + ['b1', 'b2', 'b3', 'b4'].map(function (k) { return '<li><span class="la-chk">' + IC.check + '</span>' + esc(t(k)) + '</li>'; }).join('') + '</ul></div>';
    var ready = !!(PL.plan === '12m' ? st.url12 : st.url3) || st.midtrans;
    var right = '<div class="la-choose"><h2>' + esc(t('choosePlan')) + '</h2>' + planCard('3m', st, true) + planCard('12m', st, true) +
      '<div class="la-until">' + esc(t(isPlus() ? 'plusAddedUntil' : 'plusFromToday')) + '<b>' + esc(fmtDate(end)) + '</b></div>' +
      '<div class="la-safe">' + IC.shield + '<span><b>' + esc(t('oneTime')) + '</b>' + esc(t('oneTimeP')) + '</span></div>' +
      (ready ? '<button type="button" class="la-btn primary block" data-act="continue">' + esc(t('contPay', price)) + '</button>' : '<div class="la-note">' + esc(t('notSet')) + '</div>') +
      '<p class="la-small" style="text-align:center;margin:0"><a href="#/refund">' + esc(t('refundLink')) + '</a></p>' +
      (u ? '<p class="la-small" style="text-align:center;margin:0">' + t('addedTo', esc(u.email || '')) + '</p>' : '<p class="la-small" style="text-align:center;margin:0">' + IC.ext + ' ' + esc(t('opensTab')) + '</p>') + '</div>';
    var cmp = '<h2 class="la-h2">' + esc(t('freeAndPlus')) + '</h2><div class="la-table"><div class="r"><span></span><span>' + esc(t('freeAcc')) + '</span><span>Little Us ' + pill('plus') + '</span></div>' +
      W.cmp.map(function (r) { var i = L() === 'id' ? 1 : 0; return '<div class="r"><span>' + esc(r[0][i]) + '</span><span style="font-weight:500">' + esc(r[1][i]) + '</span><span>' + esc(r[2][i]) + '</span></div>'; }).join('') + '</div>';
    var faq = '<h2 class="la-h2">' + esc(t('questions')) + '</h2><div class="la-faqs">' + W.faq.map(function (q) { var i = L() === 'id' ? 1 : 0; return '<div class="la-faq"><h3>' + esc(q[0][i]) + '</h3><p>' + esc(q[1][i]) + '</p></div>'; }).join('') + '</div>';
    return '<div class="la-page"><a href="#/" class="la-xlink" style="font-size:14.5px">← ' + esc(t('backHome')) + '</a><div class="la-plans" style="margin-top:12px">' + left + right + '</div>' + cmp + faq + '</div>';
  }
  function wirePlans(root) {
    $$('[data-plan]', root).forEach(function (b) { b.onclick = function () { PL.plan = b.dataset.plan; rerender(); }; });
    var c = $('[data-act=continue]', root); if (c) c.onclick = function () { startCheckout(PL.plan); };
    if (window.LU && LU.qs && LU.qs.get('go') === '1' && signedIn()) { // came back after sign-up with a plan chosen
      var url = new URL(location.href); url.searchParams.delete('go'); history.replaceState(null, '', url.pathname + url.search);
      setTimeout(function () { startCheckout(PL.plan, true); }, 300);
    }
  }
  function checkoutUrl(plan) {
    var st = settings(), base = plan === '12m' ? st.url12 : st.url3; if (!base) return '';
    var u = me() || {};
    return base + (base.indexOf('?') < 0 ? '?' : '&') + 'wanted=true&uid=' + encodeURIComponent(session.user.id) + (u.email ? '&email=' + encodeURIComponent(u.email) : '');
  }
  function startCheckout(plan, auto) {
    if (!signedIn()) {
      store.setJson('lu_pending_plan', { plan: plan, at: Date.now() });
      var st = settings(), price = plan === '12m' ? st.p12 : st.p3;
      var sh = sheet('<div><span class="la-own2" style="display:inline-flex;padding:6px 12px;border-radius:999px">' + pill('plus') + ' <b style="font-size:14px">' + esc(t(plan === '12m' ? 'm12' : 'm3')) + ' · ' + esc(price) + '</b></span></div>' +
        '<h2>' + esc(t('quickStep')) + '</h2><p class="la-p">' + esc(t('quickStepP')) + '</p>' +
        '<a class="la-btn outline block" href="#/signup" data-close>' + IC.mail + esc(t('contEmail')) + '</a>' +
        '<p class="la-p" style="text-align:center">' + esc(t('haveAcc')) + ' <a href="#/login" data-close>' + esc(t('logIn')) + '</a></p><p class="la-small" style="text-align:center;margin:0">' + esc(t('thenCheckout')) + '</p>');
      SU.step = 'form';
      return sh;
    }
    var st2 = settings(), gOk = !!checkoutUrl(plan);
    if (st2.midtrans && gOk) return payChooser(plan);
    if (st2.midtrans) return startMidtrans(plan);
    return startGumroad(plan, auto);
  }
  function startGumroad(plan, auto) {
    var url = checkoutUrl(plan); if (!url) return toast(t('notSet'));
    ss.setJson('lu_checkout', { plan: plan, base: (A.profile && A.profile.plus_until) || null, at: Date.now(), opened: !auto });
    if (!auto) window.open(url, '_blank', 'noopener');
    go('#/plus/checkout?plan=' + plan);
  }
  // The popup that lets the parent pick Gumroad (card, PayPal) or Midtrans (GoPay, QRIS, bank transfer).
  function payChooser(plan) {
    var st = settings(), price = plan === '12m' ? st.p12 : st.p3;
    var sh = sheet('<div><span class="la-own2" style="display:inline-flex;padding:6px 12px;border-radius:999px">' + pill('plus') + ' <b style="font-size:14px">' + esc(t(plan === '12m' ? 'm12' : 'm3')) + ' · ' + esc(price) + '</b></span></div>' +
      '<h2>' + esc(t('payH')) + '</h2><p class="la-p">' + esc(t('payHP')) + '</p>' +
      '<button type="button" class="la-btn outline block" data-pay="gumroad" style="flex-direction:column;align-items:flex-start;gap:2px;text-align:left;padding:14px 16px;height:auto"><b>' + esc(t('payGum')) + '</b><small style="font-weight:500;font-size:13.5px;line-height:1.4;color:var(--body)">' + esc(t('payGumP')) + '</small></button>' +
      '<button type="button" class="la-btn outline block" data-pay="midtrans" style="flex-direction:column;align-items:flex-start;gap:2px;text-align:left;padding:14px 16px;height:auto"><b>' + esc(t('payMid')) + '</b><small style="font-weight:500;font-size:13.5px;line-height:1.4;color:var(--body)">' + esc(t('payMidP')) + ' <span data-mt-amt></span></small></button>' +
      '<button type="button" class="la-btn soft block" data-close>' + esc(t('cancel')) + '</button>');
    // show roughly what it will be in rupiah today
    http('/functions/v1/plus', { method: 'POST', auth: false, body: { action: 'midtrans_quote', plan: plan } }).then(function (q) {
      var el = sh.el.querySelector('[data-mt-amt]'); if (el && q && q.idr) el.innerHTML = '<b style="color:var(--ink)">' + esc(t('payMidAmt', 'Rp ' + Number(q.idr).toLocaleString('id-ID'))) + '</b>';
    }).catch(function () {});
    sh.el.querySelector('[data-pay=gumroad]').onclick = function () { sh.close(); startGumroad(plan, false); };
    sh.el.querySelector('[data-pay=midtrans]').onclick = function () { startMidtrans(plan, this, sh); };
    return sh;
  }
  function loadSnap(r) {
    if (window.snap) return Promise.resolve();
    return new Promise(function (ok, bad) {
      var el = document.createElement('script'); el.src = r.snap_js; el.setAttribute('data-client-key', r.client_key);
      el.onload = function () { window.snap ? ok() : bad(new Error('snap')); }; el.onerror = function () { bad(new Error('snap')); };
      document.head.appendChild(el);
    });
  }
  function mtGo(plan, state) {
    var c = ss.json('lu_checkout', null) || {}; c.mt_state = state; ss.setJson('lu_checkout', c);
    go('#/plus/checkout?plan=' + plan);
  }
  // Midtrans Snap: ask our server for a token, open Snap, then wait for the payment to be confirmed by Midtrans.
  function startMidtrans(plan, btn, sheetRef) {
    if (btn) busy(btn, true);
    http('/functions/v1/plus', { method: 'POST', body: { action: 'midtrans_create', plan: plan, lang: L() } }).then(function (r) {
      if (!r || !r.token) throw new Error('midtrans');
      ss.setJson('lu_checkout', { plan: plan, base: (A.profile && A.profile.plus_until) || null, at: Date.now(), provider: 'midtrans', order: r.order_id });
      return loadSnap(r).then(function () {
        if (sheetRef) sheetRef.close();
        window.snap.pay(r.token, {
          onSuccess: function () { mtGo(plan, 'activating'); },
          onPending: function () { mtGo(plan, 'pending'); },
          onError: function () { toast(t('payFail'), 'error'); },
          onClose: function () {}
        });
      });
    }).catch(function () { if (btn) busy(btn, false); toast(t('payFail'), 'error'); });
  }

  // ----- C04 → C05 → C06 → C07 / C08: checkout handoff
  var CO = { state: 'opening', timer: null, startedActivating: 0, result: null };
  function renderCheckout() {
    var c = ss.json('lu_checkout', null) || {}, st = settings(), plan = c.plan || (LU.qs && LU.qs.get('plan')) || '12m';
    var price = plan === '12m' ? st.p12 : st.p3, u = me() || {};
    if (CO.state === 'opening') {
      return topBar({ back: '#/plus' }) + '<div class="la-flow"><div class="grow"></div><div class="la-center">' + heartFace(64) + '<div class="la-prog"><i></i></div><h1 class="la-h1" style="font-size:28px">' + esc(t('openingH')) + '</h1><p class="la-p">' + esc(t('openingP')) + '</p></div><div class="grow"></div><p class="la-p" style="text-align:center">' + esc(t('nothingOpened')) + ' <button type="button" class="la-link" data-act="reopen">' + esc(t('openCheckout')) + '</button></p></div>';
    }
    if (CO.state === 'waiting') {
      return topBar({ back: '#/plus' }) + '<div class="la-flow"><div class="la-small" style="font-weight:800;letter-spacing:.06em;text-transform:uppercase">' + esc(t('checkoutOpen')) + '</div><h1 class="la-h1">' + esc(t('finishH')) + '</h1>' +
        '<div class="la-card" style="display:flex;flex-direction:column;gap:4px"><div style="display:flex;align-items:center;gap:8px">' + pill('plus') + '<b style="font:600 20px Fredoka,sans-serif;flex:1">' + esc(t(plan === '12m' ? 'm12' : 'm3')) + '</b><b style="font:600 22px Fredoka,sans-serif">' + esc(price) + '</b></div><small class="la-small">' + esc(t('oneTimeUntil', fmtDate(newEndFrom(c.base, plan)))) + '</small></div>' +
        '<div class="la-steps"><div class="on"><span>1</span>' + esc(t('st1')) + '</div><div><span>2</span>' + esc(t('st2')) + '</div><div><span>3</span>' + esc(t('st3')) + '</div></div><div class="grow"></div>' +
        '<button type="button" class="la-btn primary block" data-act="paid">' + esc(t('ivePaid')) + '</button><button type="button" class="la-btn line block" data-act="reopen">' + IC.ext + ' ' + esc(t('reopen')) + '</button><a class="la-link" style="align-self:center" href="#/plus">' + esc(t('diffPlan')) + '</a></div>';
    }
    if (CO.state === 'pending') {
      return topBar() + '<div class="la-flow"><div class="grow"></div><div class="la-center">' + heartFace(72) + '<h1 class="la-h1" style="font-size:28px">' + esc(t('pendingH')) + '</h1><p class="la-p">' + esc(t('pendingP')) + '</p><p class="la-small">' + esc(t('pendingNote')) + '</p></div><div class="grow"></div><a class="la-btn line block" href="#/">' + esc(t('backHome')) + '</a></div>';
    }
    if (CO.state === 'activating') {
      return topBar() + '<div class="la-flow"><div class="grow"></div><div class="la-center">' + heartFace(72) + '<div class="la-prog"><i></i></div><h1 class="la-h1" style="font-size:28px">' + esc(t('activatingH')) + '</h1><p class="la-p">' + esc(t('activatingP')) + '</p><p class="la-small">' + esc(t('lastChecked')) + '</p></div><div class="grow"></div></div>';
    }
    if (CO.state === 'thanks') {
      var r = CO.result || {}, added = !!c.base && new Date(c.base) > new Date(c.at || 0);
      return topBar() + '<div class="la-flow"><div class="la-thanks">' + heartFace(84) + '<h1>' + esc(t('thanksH')) + '</h1>' +
        '<div class="la-sum"><div><span>' + esc(t('plan')) + '</span><b>' + esc(t(plan === '12m' ? 'm12' : 'm3')) + '</b></div><div><span>' + esc(t('paid')) + '</span><b>' + esc((r.price_label || price) + t('oneTimeSfx')) + '</b></div><div><span>' + esc(t('plusUntil', '').replace(/\s+$/, '')) + '</span><b>' + esc(fmtDate(plusUntil())) + '</b></div></div>' +
        (added ? '<p class="la-p" style="font-weight:700">' + esc(t('addedTime', t(plan === '12m' ? 'm12' : 'm3'), fmtDate(plusUntil()))) + '</p>' : '') +
        '<p class="la-small" style="color:var(--ink);margin:0">' + esc(t('receipt', u.email || '')) + '</p>' +
        '<a class="la-btn dark block" href="#/tools">' + esc(t('goTools')) + '</a><a class="la-btn block" href="#/catalogue">' + esc(t('goDownloads')) + '</a></div></div>';
    }
    // delayed (C08)
    var ref = 'LU-' + String((session && session.user && session.user.id) || '').replace(/-/g, '').slice(0, 5).toUpperCase();
    var mail = 'mailto:' + st.support + '?subject=' + encodeURIComponent('Little Us Plus not active · ' + ref) + '&body=' + encodeURIComponent('Hi Kal,\n\nI paid for Little Us Plus (' + t(plan === '12m' ? 'm12' : 'm3') + ') but it is not active yet.\n\nAccount email: ' + (u.email || '') + '\nOrder ref: ' + ref + '\n');
    return topBar() + '<div class="la-flow"><span class="la-circle" style="width:88px;height:88px">' + IC.clock + '</span><h1 class="la-h1">' + esc(t('delayedH')) + '</h1><p class="la-p">' + esc(t('delayedP', u.email || '')) + '</p>' +
      '<div class="la-card"><b>' + esc(t('still30')) + '</b><p class="la-p" style="font-size:14px;margin-top:4px">' + t('still30P', esc(st.support)) + '</p><p class="la-small" style="margin:6px 0 0">' + esc(t('orderRef')) + ' ' + esc(ref) + '</p></div><div class="grow"></div>' +
      '<button type="button" class="la-btn primary block" data-act="again">' + esc(t('checkAgain')) + '</button><a class="la-btn line block" href="' + esc(mail) + '">' + esc(t('emailSupport')) + '</a><a class="la-link" style="align-self:center" href="#/">' + esc(t('backHome')) + '</a></div>';
  }
  function newEndFrom(base, plan) { var b = base && new Date(base) > new Date() ? new Date(base) : new Date(); return addMonths(b, plan === '12m' ? 12 : 3); }
  function paidYet() {
    var c = ss.json('lu_checkout', null) || {};
    return loadAccount().then(function () {
      var u = plusUntil(); if (!u) return false;
      var base = c.base ? new Date(c.base) : null;
      if (base ? u > new Date(base.getTime() + 60000) : u > new Date()) {
        CO.result = (A.purchases || []).filter(function (p) { return p.kind === 'plus' && p.status === 'paid'; })[0] || null;
        return true;
      }
      return false;
    });
  }
  function pollLoop() {
    clearTimeout(CO.timer);
    if (!document.getElementById('la-root') || CO.state === 'thanks') return;
    paidYet().then(function (ok) {
      if (ok) { CO.state = 'thanks'; ss.del('lu_checkout'); emit(); rerender(); return; }
      if (CO.state === 'activating' && Date.now() - CO.startedActivating > 120000) { CO.state = 'delayed'; rerender(); }
      CO.timer = setTimeout(pollLoop, CO.state === 'delayed' ? 15000 : CO.state === 'pending' ? 6000 : 3000);
    });
  }
  function wireCheckout(root) {
    var c = ss.json('lu_checkout', null) || {};
    var re = $$('[data-act=reopen]', root); re.forEach(function (b) { b.onclick = function () { var u = checkoutUrl(c.plan || '12m'); if (u) window.open(u, '_blank', 'noopener'); if (CO.state === 'opening') { CO.state = 'waiting'; rerender(); } }; });
    var p = $('[data-act=paid]', root); if (p) p.onclick = function () { CO.state = 'activating'; CO.startedActivating = Date.now(); rerender(); pollLoop(); };
    var ag = $('[data-act=again]', root); if (ag) ag.onclick = function () { CO.state = 'activating'; CO.startedActivating = Date.now(); rerender(); pollLoop(); };
    if (CO.state === 'opening') { clearTimeout(CO.open); CO.open = setTimeout(function () { if (CO.state === 'opening') { CO.state = 'waiting'; rerender(); } }, 1400); }
  }
  function checkoutVisible() {
    if (document.visibilityState === 'visible' && CO.state === 'waiting' && document.getElementById('la-root') && window.LU && LU.route === 'plus/checkout') {
      CO.state = 'activating'; CO.startedActivating = Date.now(); rerender(); pollLoop();
    }
  }
  document.addEventListener('visibilitychange', checkoutVisible);

  // ----- D01 / D02 / D03: account
  function passTiles() {
    var st = settings();
    return '<div class="la-tiles">' + ['3m', '12m'].map(function (p) {
      return '<button type="button" class="la-tile" data-buy="' + p + '"><span class="t1"><span>+' + esc(t(p === '12m' ? 'm12' : 'm3')) + '</span><span>' + esc(p === '12m' ? st.p12 : st.p3) + '</span></span><small>' + esc(t('until', fmtDate(newEnd(p)))) + '</small></button>';
    }).join('') + '</div>';
  }
  function renderAccount() {
    if (!signedIn()) return '<div class="la-page"><div class="la-acc"><h1 class="la-h1">' + esc(t('account')) + '</h1><div class="la-accbox"><b>' + esc(t('account')) + '</b><span class="la-small">' + esc(t('notSigned')) + '</span><div class="two"><a class="la-btn dark sm" href="#/signup">' + esc(t('createFreeAcc')) + '</a><a class="la-btn soft sm" href="#/login">' + esc(t('logIn')) + '</a></div></div></div></div>';
    var u = me() || {}, s = status(), st = settings(), plan = (A.profile && A.profile.plus_plan) === '3m' ? 'pass3' : (A.profile && A.profile.plus_plan) === '12m' ? 'pass12' : 'passPlus';
    var card;
    if (s === 'plus' || s === 'expiring') {
      card = '<div class="la-passcard"><h3>' + pill('plus') + esc(t(plan)) + '</h3>' +
        (s === 'expiring' ? '<div class="la-warn"><b>' + esc(t('endsIn', daysLeft(), fmtDate(plusUntil()))) + '</b><small>' + esc(t('addTimeNote')) + '</small></div>' : '<div>' + esc(t('activeUntil')) + ' <b>' + esc(fmtDate(plusUntil())) + '</b></div>') +
        '<div class="lab">' + esc(t('buyAgainAdd')) + '</div>' + passTiles() + '</div>';
    } else {
      card = '<div class="la-freecard"><h3>' + pill('free') + esc(t('freeAcc')) + '</h3>' + (s === 'expired' ? '<b>' + esc(t('endedOn', fmtDate(plusUntil()))) + '</b>' : '') +
        '<p class="la-p" style="font-size:14px">' + esc(t('freeAccP')) + '</p><a class="la-btn primary block" href="#/plus">' + esc(s === 'expired' ? t('buyAgain') : t('getPlus')) + '</a><p class="la-small" style="text-align:center;margin:0">' + esc(t('fromRenew', st.p3)) + '</p></div>';
    }
    var buys = (A.purchases || []).filter(function (p) { return p.status === 'paid'; });
    var list = buys.length ? '<div class="la-lab" style="font-weight:800;margin-top:6px">' + esc(t('purchases')) + '</div><div class="la-rows">' + buys.slice(0, 10).map(function (p) {
      return '<div class="la-row" style="cursor:default"><span>' + (p.kind === 'plus' ? pill('plus') + ' ' + esc(t(p.plan === '12m' ? 'm12' : 'm3')) : esc(p.product_id || '')) + '</span><span class="sp"></span><small class="la-small">' + esc(fmtDate(p.created_at)) + ' · ' + esc(p.price_label || '') + '</small></div>';
    }).join('') + '</div>' : '';
    return '<div class="la-page"><div class="la-acc"><div style="display:flex;align-items:center;gap:12px"><a class="la-iconbtn" href="#/tools/settings" aria-label="' + esc(t('back')) + '">' + IC.back + '</a><h1 class="la-h1" style="font-size:26px">' + esc(t('account')) + '</h1></div>' +
      '<div class="la-card la-me"><span class="la-ava">' + esc(initials(u.name || u.email)) + '</span><div style="flex:1;min-width:0"><b>' + esc(u.name || '') + '</b><small>' + esc(u.email || '') + '</small><small style="display:flex;gap:6px;align-items:center">' + IC.mail.replace('20', '13').replace('20', '13') + esc(t('signedInEmail')) + '</small></div><button type="button" class="la-link" style="font-size:13.5px" data-act="editname">' + esc(t('editName')) + '</button></div>' +
      card + '<div class="la-rows"><button type="button" class="la-row" data-act="pw">' + esc(t('changePw')) + '<span class="sp"></span>' + IC.chev + '</button><button type="button" class="la-row red" data-act="logout">' + esc(t('logOut')) + '</button></div>' + list + '</div></div>';
  }
  function wireAccount(root) {
    $$('[data-buy]', root).forEach(function (b) { b.onclick = function () { startCheckout(b.dataset.buy); }; });
    var lo = $('[data-act=logout]', root);
    if (lo) lo.onclick = function () {
      var sh = sheet('<h2>' + esc(t('logOutQ')) + '</h2><p class="la-p">' + esc(t('logOutP')) + '</p><button type="button" class="la-btn dark block" data-yes>' + esc(t('logOut')) + '</button><button type="button" class="la-btn soft block" data-close>' + esc(t('cancel')) + '</button>');
      sh.el.querySelector('[data-yes]').onclick = function () { sh.close(); auth.logOut().then(function () { go('#/', true); }); };
    };
    var pw = $('[data-act=pw]', root);
    if (pw) pw.onclick = function () {
      var sh = sheet('<h2>' + esc(t('changePw')) + '</h2>' + field('cpOld', t('currentPw'), 'password', '', ' autocomplete="current-password"') + field('cpNew', t('newPw'), 'password', '', ' autocomplete="new-password"') + '<span class="la-hint">' + esc(t('min8')) + '</span>' + field('cpNew2', t('typeAgain'), 'password', '', ' autocomplete="new-password"') + '<div class="la-err" data-err hidden></div><button type="button" class="la-btn primary block" data-yes>' + esc(t('save')) + '</button>');
      wireCommon(sh.el);
      sh.el.querySelector('[data-yes]').onclick = function () {
        var o = $('#cpOld', sh.el).value, n1 = $('#cpNew', sh.el).value, n2 = $('#cpNew2', sh.el).value, b = this;
        if (n1.length < 8) return showErr(sh.el, t('ePw')); if (n1 !== n2) return showErr(sh.el, t('ePw2'));
        busy(b, true);
        auth.logIn((me() || {}).email, o).catch(function (e) { var er = new Error(t('wrongCurrent')); er.network = e && e.network; throw er; })
          .then(function () { return auth.setPassword(n1); }).then(function () { sh.close(); toast(t('pwChanged'), 'success'); })
          .catch(function (e) { busy(b, false); showErr(sh.el, e.network ? t('netErr') : e.message); });
      };
    };
    var en = $('[data-act=editname]', root);
    if (en) en.onclick = function () {
      var sh = sheet('<h2>' + esc(t('editName')) + '</h2>' + field('enName', t('name'), 'text', (me() || {}).name || '', ' autocomplete="name"') + '<div class="la-err" data-err hidden></div><button type="button" class="la-btn primary block" data-yes>' + esc(t('save')) + '</button>');
      sh.el.querySelector('[data-yes]').onclick = function () {
        var v = $('#enName', sh.el).value.trim(); if (!v) return showErr(sh.el, t('eName'));
        http('/rest/v1/profiles?id=eq.' + session.user.id, { method: 'PATCH', body: { name: v } }).then(function () { if (A.profile) A.profile.name = v; store.setJson(CKEY, A); sh.close(); emit(); rerender(); toast(t('saved'), 'success'); }).catch(function (e) { showErr(sh.el, errText(e)); });
      };
    };
  }

  // ----- /welcome: lands here from the confirmation email
  function renderWelcome() {
    return topBar() + '<div class="la-flow"><div class="grow"></div><div class="la-center"><span class="la-circle mint">' + IC.bigCheck + '</span><h1 class="la-h1">' + esc(t('confirmedToast')) + '</h1></div><div class="grow"></div><a class="la-btn primary block" href="#/">' + esc(t('goDash')) + '</a></div>';
  }

  var PAGES = {
    signup: { title: 'createH', header: 'none', footer: 'none', render: renderSignup, wire: wireSignup, init: function () { if (!SU.email) { var e = ss.json('lu_login_email', null); if (e) SU.email = e; } } },
    'check-email': { title: 'checkH', header: 'none', footer: 'none', render: renderCheck, wire: wireCheck },
    login: { title: 'logIn', header: 'none', footer: 'none', render: renderLogin, wire: wireLogin },
    'forgot-password': { title: 'resetH', header: 'none', footer: 'none', render: renderForgot, wire: wireForgot, init: function () { FP.sent = false; } },
    'reset-password': { title: 'newPwH', header: 'none', footer: 'none', render: renderReset, wire: wireReset, init: function () { RP.done = false; } },
    welcome: { title: 'confirmedToast', header: 'none', footer: 'none', render: renderWelcome, init: function () { if (!signedIn()) { go('#/login', true); } } },
    plus: { title: 'upgradeH', focus: true, render: renderPlans, wire: wirePlans, init: function () { var q = LU.qs && LU.qs.get('plan'); if (q === '3m' || q === '12m') PL.plan = q; return loadFeatures(true); } },
    'plus/checkout': {
      title: 'finishH', header: 'none', footer: 'none', render: renderCheckout, wire: wireCheckout,
      init: function () {
        if (!signedIn()) { go('#/plus', true); return; }
        var c = ss.json('lu_checkout', null);
        CO.state = c && c.opened ? 'opening' : 'waiting'; if (c) { c.opened = false; ss.setJson('lu_checkout', c); }
        if (c && c.provider === 'midtrans') { CO.state = c.mt_state === 'pending' ? 'pending' : 'activating'; CO.startedActivating = Date.now(); }
        CO.result = null; setTimeout(pollLoop, c && c.provider === 'midtrans' ? 1500 : 3000);
      },
      leave: function () { clearTimeout(CO.timer); }
    },
    account: { title: 'account', render: renderAccount, wire: wireAccount, init: function () { return loadAccount(); } }
  };
  function rerender() { var m = document.getElementById('la-root'); var key = window.LU && LU.route; var p = PAGES[key]; if (m && p) { m.innerHTML = p.render(); wireCommon(m); if (p.wire) p.wire(m); } }
  var REG = window.LU_PAGES = window.LU_PAGES || {};
  Object.keys(PAGES).forEach(function (k) { REG[k] = { html: '<main id="la-root"></main>', run: pageShell(PAGES[k]) }; });
  REG['reset'] = REG['reset-password'];
  // The Shop now sells through Gumroad, one product at a time: no cart or checkout pages.
  ['cart', 'checkout'].forEach(function (k) { REG[k] = { html: '<main class="wrap page"></main>', run: function () { go('#/catalogue', true); } }; });

  /* ===================== hooks used by index.html and tools.js ===================== */
  function headerHTML() {
    if (!signedIn()) return '<a class="la-hdr-login" href="#/login">' + esc(t('logIn')) + '</a>';
    var u = me() || {};
    return '<div class="la-hdr-me"><button type="button" class="la-hdr-btn" data-la-menu aria-expanded="false"><span class="av">' + esc(initials(u.name || u.email)) + '</span>' + esc(firstName(u.name) || '') + ' <span aria-hidden="true" style="font-size:11px">▾</span></button></div>';
  }
  document.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('[data-la-menu]');
    var open = document.querySelector('.la-menu');
    if (open && (!b || open.parentNode !== b.parentNode) && !(e.target.closest && e.target.closest('.la-menu'))) { open.remove(); }
    if (!b) return;
    if (open && open.parentNode === b.parentNode) { open.remove(); return; }
    var u = me() || {}, s = status();
    var m = document.createElement('div'); m.className = 'la-menu';
    m.innerHTML = '<div class="who"><b>' + esc(u.name || '') + ' ' + (s === 'plus' || s === 'expiring' ? pill('plus') : pill('free')) + '</b><small>' + esc(u.email || '') + '</small></div>' +
      '<a href="#/account">' + esc(t('myAccount')) + '</a>' + (s === 'plus' || s === 'expiring' ? '' : '<a href="#/plus">' + esc(t('getPlus')) + '</a>') + '<a href="#/tools/settings">' + esc(t('settings')) + '</a><button type="button" data-la-out>' + esc(t('logOut')) + '</button>';
    b.parentNode.appendChild(m);
    m.querySelector('[data-la-out]').onclick = function () { m.remove(); auth.logOut().then(function () { go('#/', true); }); };
    m.addEventListener('click', function (ev) { if (ev.target.closest('a')) m.remove(); });
  });
  function logoBadge() { var s = status(); return s === 'plus' || s === 'expiring' ? '<span class="la-pill la-logo-plus">' + esc(t('plus')) + '</span>' : ''; }
  function tabPlus() { var s = status(); return s === 'plus' || s === 'expiring' ? '<span class="la-pill la-tabplus">' + esc(t('plus')) + '</span>' : ''; }

  // Settings tab: Account card at the top (P17 / P41 / P42)
  function settingsCard() {
    injectCSS();
    var st = settings(), s = status(), u = me();
    if (!u) {
      return '<div class="la-setcard"><div class="la-accbox"><b style="font-size:16px">' + esc(t('account')) + '</b><span class="la-small" style="margin-top:-6px">' + esc(t('notSigned')) + '</span><div class="two"><a class="la-btn dark sm" href="#/signup">' + esc(t('createFreeAcc')) + '</a><a class="la-btn soft sm" href="#/login">' + esc(t('logIn')) + '</a></div></div>' +
        '<a class="la-plusrow" href="#/plus">' + pill('plus') + '<span class="tx"><b>Little Us Plus</b></span><span class="la-small" style="font-weight:700">' + esc(t('fromP', st.p3)) + '</span>' + IC.chev + '</a></div>';
    }
    var sync = syncState === 'syncing' || syncState === 'pending' ? t('syncing') : store.get('lu_sync_at') ? t('synced') : '';
    var sub = s === 'plus' ? t('plusUntil', fmtDate(plusUntil())) + (sync ? ' · ' + sync : '') : s === 'expiring' ? t('plusEndsAdd', fmtDate(plusUntil(), true)) : (u.email || '') + (sync ? ' · ' + sync : '');
    return '<div class="la-setcard"><a class="la-accbox" href="#/account"><span class="la-accrow"><span class="la-ava sm" style="background:var(--lilac);border-radius:14px">' + esc(initials(u.name || u.email)) + '</span><span class="tx"><b>' + esc(u.name || '') + ' ' + (s === 'plus' || s === 'expiring' ? pill('plus') : pill('free')) + '</b><small>' + esc(sub) + '</small></span>' + IC.chev + '</span></a>' +
      (s === 'plus' || s === 'expiring' ? '' : '<a class="la-plusrow" href="#/plus">' + pill('plus') + '<span class="tx"><b>Little Us Plus</b><small>' + esc(t('moreStyles')) + '</small></span><span class="la-btn primary sm" style="min-height:40px">' + esc(t('getPlusShort')) + '</span></a>') + '</div>';
  }

  // Home: account cards (phone) and the signed-in dashboard (desktop)
  var TOOLS_META = {
    timer: ['Visual Timer', 'Timer Visual', 'var(--sky)', '#/tools/timer'], tokens: ['Token Board', 'Papan Token', 'var(--butter)', '#/tools/tokens'],
    ft: ['First–Then Board', 'Papan Pertama–Lalu', 'var(--mint)', '#/tools/first-then'], sched: ['Visual Schedule', 'Jadwal Visual', 'var(--lilac)', '#/tools/schedule'],
    breathe: ['Breathing Buddy', 'Teman Bernapas', 'var(--sky)', '#/tools/breathe'], feelings: ['Feelings Check-In', 'Cek Perasaan', 'var(--lilac)', '#/tools/feelings'], worry: ['Worry jar', 'Toples Khawatir', 'var(--rose)', '#/tools/worry']
  };
  function toolKey(x) { x = String(x || '').replace(/^tools\//, ''); return x === 'first-then' ? 'ft' : x === 'schedule' ? 'sched' : x; }
  function homeCardHTML() {
    var s = status(), st = settings(), kid = childName();
    if (s === 'none') {
      if (store.get('lu_hide_acccard')) return '';
      return '<div class="la-hcard acc"><span class="tx"><b>' + esc(t('freeAccCardH')) + ' <span class="la-pill rec">' + esc(t('recommended')) + '</span></b><small>' + esc(t('freeAccCardP')) + '</small></span><a class="la-btn dark sm" href="#/signup">' + esc(t('create')) + '</a><button type="button" class="la-hx" data-la-hide="lu_hide_acccard" aria-label="' + esc(t('close')) + '">✕</button></div>';
    }
    if (s === 'free') {
      var hid = Number(store.get('lu_hide_upcard') || 0); if (hid && Date.now() - hid < 30 * 86400000) return '';
      return '<div class="la-hcard up mob">' + pill('plus') + '<span class="tx"><b>' + esc(t('upCardH')) + '</b><small>' + esc(t('upCardP')) + '</small></span><a class="la-btn primary sm" href="#/plus">' + esc(t('upgrade')) + '</a><button type="button" class="la-hx" data-la-hide="lu_hide_upcard" aria-label="' + esc(t('close')) + '">✕</button></div>';
    }
    if (s === 'plus') {
      var first = (A.purchases || []).filter(function (p) { return p.kind === 'plus' && p.status === 'paid'; })[0];
      if (!first || Date.now() - new Date(first.created_at) > 7 * 86400000) return '';
      return '<div class="la-hcard ok mob"><span class="tick">' + IC.check + '</span><span class="tx"><b>' + esc(t('unlockedH')) + '</b><small>' + esc('Little Us Plus · ' + t('until', fmtDate(plusUntil()))) + '</small></span></div>';
    }
    if (s === 'expiring') {
      var hx = Number(store.get('lu_hide_expcard') || 0); if (hx && daysLeft() > 3 && Date.now() - hx < 7 * 86400000) return '';
      return '<div class="la-hcard warn"><span class="tx"><b>' + esc(t('expiringH', daysLeft())) + '</b><small>' + esc(t('expiringP', fmtDate(plusUntil(), true))) + '</small></span><a class="la-btn dark sm" href="#/plus">' + esc(t('addTime')) + '</a>' + (daysLeft() > 3 ? '<button type="button" class="la-hx" style="color:var(--ink)" data-la-hide="lu_hide_expcard" aria-label="' + esc(t('close')) + '">✕</button>' : '') + '</div>';
    }
    return '<div class="la-hcard ended"><span class="tx"><b>' + esc(t('endedH', fmtDate(plusUntil(), true))) + '</b><small>' + esc(t('endedP', kid || t('yourChild'))) + '</small></span><a class="la-btn primary sm" href="#/plus">' + esc(t('buyAgain')) + '</a></div>';
  }
  function dashHTML() {
    var u = me() || {}, s = status(), st = settings(), kid = currentChild();
    var tools = []; try { var S = store.json(TKEY, null); if (S && S.last && S.last.tool) tools.push(toolKey(S.last.tool)); } catch (e) {}
    ['timer', 'tokens', 'sched', 'ft'].forEach(function (k) { if (tools.indexOf(k) < 0) tools.push(k); });
    tools = tools.filter(function (k) { return TOOLS_META[k]; }).slice(0, 3);
    var used = tools.map(function (k, i) {
      var m = TOOLS_META[k];
      var art = ''; try { var AR = window.LUArt, tk = { timer: 'timer', tokens: 'tokens', ft: 'ft', sched: 'sched' }[k]; if (AR && AR.toolArt && tk) art = AR.toolArt(tk).replace('<svg ', '<svg style="width:100%;height:100%;display:block" '); } catch (e) {}
      return '<a class="la-used" href="' + m[3] + '"><span class="ic" style="background:' + m[2] + '">' + (art || heartFace(22)) + '</span><span><b>' + esc(L() === 'id' ? m[1] : m[0]) + '</b>' + (i === 0 && store.json(TKEY, {}) && (store.json(TKEY, {}).last || {}).at ? '<small>' + esc(fmtDate(store.json(TKEY, {}).last.at)) + '</small>' : '') + '</span><span class="op">' + esc(t('open')) + ' →</span></a>';
    }).join('');
    var owned = (A.purchases || []).filter(function (p) { return p.kind === 'product' && p.status === 'paid'; });
    var lib;
    if (s === 'plus' || s === 'expiring') lib = '<div class="la-empty" style="border-style:solid;border-color:var(--mint);background:var(--mint)"><h3>' + esc(t('plusLibH')) + '</h3><p>' + esc(t('plusLibP')) + '</p><a class="la-btn primary sm" href="#/catalogue">' + esc(t('browseShop')) + '</a></div>';
    else if (owned.length) lib = '<div class="la-stack" data-la-lib>' + owned.slice(0, 4).map(function (p) { return '<a class="la-libitem" href="#/product/' + encodeURIComponent(p.product_id) + '"><span class="la-pill plain">PDF</span><b data-pid="' + esc(p.product_id) + '">' + esc(p.product_id) + '</b></a>'; }).join('') + '</div>';
    else lib = '<div class="la-empty"><h3>' + esc(t('emptyLibH')) + '</h3><p>' + esc(t('emptyLibP')) + '</p><a class="la-btn primary sm" href="#/catalogue?free=1">' + esc(t('browseFree')) + '</a></div>';
    var up = s === 'free' || s === 'expired' ? '<div class="la-upbar">' + pill('plus') + '<b>' + esc(t('upBarH')) + '</b><span class="d">' + esc(t('upBarP')) + '</span><a class="la-btn primary sm" href="#/plus">' + esc(t('seePlans', st.p3)) + '</a></div>'
      : '<div class="la-upbar">' + pill('plus') + '<span class="la-pill free">' + esc(t('activeP')) + '</span><b>' + esc(t('daysLeftN', daysLeft())) + '</b><span class="d">' + esc(t('planEnds', (A.profile && A.profile.plus_plan === '3m') ? t('m3') : t('m12'), fmtDate(plusUntil()))) + '</span><a class="la-btn outline sm" href="#/account">' + esc(t('managePlan')) + '</a></div>';
    var kids = []; try { kids = (store.json(TKEY, {}).profiles || []).filter(function (p) { return p.id !== kid.id; }).slice(0, 2); } catch (e) {}
    var kidChip = kid ? '<button type="button" class="la-kid" data-la-prof aria-haspopup="dialog"><span class="avs"><span class="av" style="background:' + esc(kid.color || '#DDF2E4') + '">' + esc(initials(kid.name)) + '</span>' + kids.map(function (o) { return '<span class="av sm" style="background:' + esc(o.color || '#F3EEE6') + '">' + esc(initials(o.name)) + '</span>'; }).join('') + '</span><span><small>' + esc(t('childProfile')) + '</small><b>' + esc(kid.name) + '</b></span><span class="sw">' + esc(t('switchC')) + ' ▾</span></button>' : '';
    return '<div class="la-dash" aria-label="' + esc(t('account')) + '"><div class="head"><div><h1>' + esc(kid ? t('hiReady', firstName(u.name), kid.name) : t('hiReady0', firstName(u.name))) + '</h1><p>' + esc(t('syncedEvery')) + '</p></div>' + kidChip + '</div>' +
      '<div class="la-dgrid"><div class="la-panel"><div class="la-ph"><h2>' + esc(kid ? t('usedLast', kid.name) : t('pickUp')) + '</h2><a class="la-lk" href="#/tools">' + esc(t('allTools')) + ' →</a></div>' + used + '</div><div class="la-panel"><div class="la-ph"><h2>' + esc(t('yourLibrary')) + '</h2></div>' + lib + '</div></div>' + up + '</div>';
  }
  /* the same "Who is this for?" popup as in the tools settings, opened right on the home page */
  function openProfilePopup() {
    function show() {
      var T = window.LUTools && LUTools.api;
      if (!T || !T.openProfiles) return go('#/tools/settings#profiles');
      T.openProfiles();
      // when the popup closes, refresh the banner so it shows the child that was picked
      var seen = false, mo = new MutationObserver(function () {
        var open = !!document.querySelector('.tl-scrim');
        if (open) seen = true;
        else if (seen) { mo.disconnect(); homeRender(); }
      });
      mo.observe(document.body, { childList: true, subtree: true });
      setTimeout(function () { mo.disconnect(); }, 600000);
    }
    if (window.LUTools && LUTools.api && LUTools.api.openProfiles) return show();
    if (!window.luLoad) return show();
    luLoad('/tools.css?v=15').then(function () { return luLoad('/tools-art.js?v=16'); }).then(function () { return luLoad('/tools.js?v=16'); })
      .then(function () { var a = window.LUTools && LUTools.api; return a && a.photosLoad ? a.photosLoad() : null; }).then(show, show);
  }
  function homeRender() {
    injectCSS();
    var hero = document.querySelector('.h2-hero-wrap');
    var box = document.getElementById('laHome');
    if (!box && hero) { box = document.createElement('div'); box.id = 'laHome'; hero.parentNode.insertBefore(box, hero.nextSibling); }
    if (!box) return;
    var desk = window.matchMedia('(min-width:960px)').matches;
    if (hero) hero.style.display = signedIn() && desk ? 'none' : '';
    box.className = 'la-home';
    box.innerHTML = (signedIn() ? dashHTML() : '') + homeCardHTML();
    $$('[data-la-prof]', box).forEach(function (b) { b.onclick = openProfilePopup; });
    $$('[data-la-hide]', box).forEach(function (b) { b.onclick = function () { store.set(b.dataset.laHide, b.dataset.laHide === 'lu_hide_acccard' ? '1' : String(Date.now())); homeRender(); }; });
    var libEl = box.querySelector('[data-la-lib]');
    if (libEl && window.LU && LU.api && LU.api.byIds) {
      var ids = $$('[data-pid]', libEl).map(function (b) { return b.dataset.pid; });
      LU.api.byIds(ids).then(function (rows) { (rows || []).forEach(function (p) { var b = libEl.querySelector('[data-pid="' + p.id + '"]'); if (b) b.textContent = LU.title ? LU.title(p) : p.title_en; }); }).catch(function () {});
    }
  }
  window.addEventListener('resize', function () { if (document.getElementById('laHome')) { var hero = document.querySelector('.h2-hero-wrap'); if (hero) hero.style.display = signedIn() && window.matchMedia('(min-width:960px)').matches ? 'none' : ''; } });

  // Shop: Gumroad links per product
  var PROD = store.json('lu_prod_gum', null) || { map: {}, at: 0 };
  function loadProductLinks() {
    if (!ON) return Promise.resolve();
    if (PROD.at && Date.now() - PROD.at < 5 * 60 * 1000) return Promise.resolve();
    return http('/rest/v1/products?select=id,gumroad_url,in_plus', { auth: false }).then(function (rows) {
      var m = {}; (rows || []).forEach(function (r) { m[r.id] = { url: r.gumroad_url || '', plus: r.in_plus !== false }; });
      PROD = { map: m, at: Date.now() }; store.setJson('lu_prod_gum', PROD);
    }).catch(function () {});
  }
  function prodInfo(id) { return PROD.map[id] || { url: '', plus: true }; }
  function owns(id) { return (A.purchases || []).some(function (p) { return p.kind === 'product' && p.status === 'paid' && p.product_id === id; }); }
  function productBuyUrl(p) {
    var g = prodInfo(p.id).url; if (!g) return '';
    var q = 'wanted=true' + (signedIn() ? '&uid=' + encodeURIComponent(session.user.id) + ((me() || {}).email ? '&email=' + encodeURIComponent(me().email) : '') : '');
    return g + (g.indexOf('?') < 0 ? '?' : '&') + q;
  }
  function priceText(p) { try { return window.LU && LU.priceText ? LU.priceText(p) : ''; } catch (e) { return ''; } }
  function downloadProduct(p, btn) {
    if (!signedIn()) { ss.setJson('lu_after_login', '#/product/' + encodeURIComponent(p.id)); return go('#/login'); }
    busy(btn, true); toast(t('preparing'));
    http('/functions/v1/plus', { method: 'POST', body: { action: 'download', product_id: p.id } }).then(function (r) {
      busy(btn, false);
      (r.files || []).forEach(function (f, i) { setTimeout(function () { var a = document.createElement('a'); a.href = f.url; a.download = f.name || ''; a.rel = 'noopener'; document.body.appendChild(a); a.click(); a.remove(); }, i * 600); });
    }).catch(function (e) { busy(btn, false); toast(e && e.status === 403 ? t('getPlus') : t('dlFail'), 'error'); });
  }
  // B02 on the product page: "Included with Plus" + "Buy just this one"
  function productBuy(p) {
    injectCSS();
    var desk = document.getElementById('buyDesk'), bar = document.getElementById('lu-buybar');
    if (!bar) { bar = document.createElement('div'); bar.id = 'lu-buybar'; bar.className = 'buybar'; document.body.appendChild(bar); }
    function draw() {
      var st = settings(), plusOk = isPlus(), mine = owns(p.id);
      var full, short;
      if (plusOk || mine) {
        full = '<div class="la-buy"><span class="la-small" style="display:flex;gap:6px;align-items:center;font-weight:700">' + (plusOk ? pill('plus') + esc(t('inclWithPlus')) : esc(t('youOwn'))) + '</span><button type="button" class="la-btn primary block" data-la-dl>' + IC.dl + esc(t('download')) + '</button></div>';
        short = '<button type="button" class="btn btn-primary" data-la-dl style="flex:1">' + esc(t('download')) + '</button>';
      } else {
        // every Shop resource is part of Little Us Plus; there are no single-resource prices any more
        full = '<div class="la-buy"><div class="la-own"><b style="display:flex;gap:8px;align-items:center">' + pill('plus') + esc(t('inclPlus')) + '</b><span class="la-p" style="font-size:14px">' + esc(t('inclPlusP', st.p3)) + '</span><a class="la-btn primary block sm" href="#/plus">' + esc(t('getPlus')) + '</a></div></div>';
        short = '<a class="btn btn-primary" href="#/plus" style="flex:1">' + esc(t('getPlus')) + '</a>';
      }
      if (desk) desk.innerHTML = full;
      bar.innerHTML = '<div class="la-buybar-wrap">' + short + '</div>';
      $$('[data-la-dl]').forEach(function (b) { b.onclick = function () { downloadProduct(p, b); }; });
    }
    draw();
    Promise.all([loadProductLinks(), loadFeatures()]).then(draw);
  }
  function cardTag(p) {
    try { if (window.LU && LU.isFree && LU.isFree(p)) return ''; } catch (e) {}
    return '';
  }

  /* ===================== boot ===================== */
  // Links from Supabase emails come back with tokens in the address (#access_token=…&type=…).
  (function readHashTokens() {
    var h = location.hash || '';
    if (h.indexOf('access_token=') < 0 && h.indexOf('error=') < 0) return;
    var q = new URLSearchParams(h.replace(/^#/, ''));
    var type = q.get('type');
    if (q.get('error')) { if (/reset/.test(location.pathname)) RP.expired = true; history.replaceState(null, '', location.pathname + location.search); return; }
    setSession({ access_token: q.get('access_token'), refresh_token: q.get('refresh_token'), expires_in: Number(q.get('expires_in')) || 3600, expires_at: Number(q.get('expires_at')) || 0 });
    history.replaceState(null, '', location.pathname + location.search);
    auth.user().then(function (u) {
      session.user = u; store.setJson(SKEY, session);
      if (u.email) store.set('lu_last_email', u.email);
      if (type === 'recovery') { if (window.LU && LU.route !== 'reset-password') go('#/reset-password', true); else rerender(); return; }
      var hadLocal = childCount() > 0;
      return Promise.all([loadAccount(), loadFeatures(true)]).then(function () {
        return http('/rest/v1/user_state?select=updated_at&user_id=eq.' + u.id).then(function (rows) { return rows && rows.length ? pullState('login') : (hadLocal ? pushState() : null); });
      }).then(function () {
        toast(t('confirmedToast'), 'success');
        var pend = store.json('lu_pending_plan', null);
        if (pend && Date.now() - pend.at < 24 * 3600 * 1000) { store.del('lu_pending_plan'); go('#/plus?plan=' + pend.plan + '&go=1', true); return; }
        if (window.LU && LU.route === 'welcome') go('#/', true);
        emit();
      });
    }).catch(function () { setSession(null); if (/reset/.test(location.pathname)) { RP.expired = true; rerender(); } });
  })();

  var lastStatus = status();
  listeners.push(function () {
    var s = status();
    if (s !== lastStatus) {
      lastStatus = s;
      if (window.LU && LU.setLang && !/^(signup|login|forgot-password|reset-password|check-email|plus\/checkout)$/.test(LU.route || '')) LU.setLang(LU.lang);
    } else {
      if (document.getElementById('laHome')) homeRender();
    }
    if (window.LUTools && LUTools.render) { try { LUTools.render(); } catch (e) {} }
  });

  function boot() {
    if (!ON) return;
    loadFeatures();
    loadProductLinks();
    if (signedIn()) {
      loadAccount().then(function () { return pullState(); });
    }
    setInterval(function () { if (signedIn() && document.visibilityState === 'visible') loadAccount(); }, 5 * 60 * 1000);
    var obs = new MutationObserver(function () { if (document.getElementById('tools-root')) watchTools(); });
    obs.observe(document.documentElement, { childList: true, subtree: true });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
  injectCSS();

  window.LUAcc = {
    get ready() { return !!FEAT.list.length; },
    signedIn: signedIn, me: me, status: status, isPlus: isPlus, plusUntil: plusUntil, allowed: allowed, access: access,
    canAddChild: canAddChild, childLimit: function () { return settings().childLimit; }, childLockSheet: childLockSheet, lockSheet: lockSheet,
    stateChanged: stateChanged, pullState: pullState, fixState: fixState,
    headerHTML: headerHTML, logoBadge: logoBadge, tabPlus: tabPlus, settingsCard: settingsCard, homeRender: homeRender,
    productBuy: productBuy, cardTag: cardTag, onChange: function (f) { listeners.push(f); },
    t: t, _auth: auth, _http: http, _session: function () { return session; }
  };
})();
