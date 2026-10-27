const ADMINS = ["jRami", "lkimbora"];

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const rupiah = (n) => "Rp " + Math.round(n).toLocaleString("id-ID");

const toastEl = $("#toast");
let toastTimer;
function toast(msg) {
  toastEl.textContent = msg;
  toastEl.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.remove("show"), 2800);
}

async function salin(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (e) {

    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    let ok = false;
    try { ok = document.execCommand("copy"); } catch (err) {}
    ta.remove();
    return ok;
  }
}

const nav = $("#nav");
const burger = $("#burger");
const navLinks = $("#navLinks");

window.addEventListener("scroll", () => {
  nav.classList.toggle("scrolled", window.scrollY > 20);
}, { passive: true });

burger.addEventListener("click", () => {
  const open = navLinks.classList.toggle("open");
  burger.setAttribute("aria-expanded", open);
  burger.setAttribute("aria-label", open ? "Tutup menu" : "Buka menu");
});
$$("a", navLinks).forEach((a) =>
  a.addEventListener("click", () => {
    navLinks.classList.remove("open");
    burger.setAttribute("aria-expanded", "false");
  })
);

const spy = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    if (!e.isIntersecting) return;
    $$(".nav-links a:not(.nav-cta)").forEach((a) =>
      a.classList.toggle("current", a.getAttribute("href") === "#" + e.target.id)
    );
  });
}, { rootMargin: "-45% 0px -50% 0px" });
["dashboard", "regulasi", "hasil", "menu", "tentang", "admin", "rnk", "testimoni", "daftar"].forEach((id) => {
  const el = document.getElementById(id);
  if (el) spy.observe(el);
});

const canvas = $("#snow");
const ctx = canvas.getContext("2d");
const snowBtn = $("#snowBtn");
let flakes = [];
let snowing = !reduceMotion;
let snowRAF;

try {
  const saved = localStorage.getItem("wr-snow");
  if (saved !== null) snowing = saved === "1";
} catch (e) {}

function resizeCanvas() {
  const dpr = window.devicePixelRatio || 1;
  canvas.width = innerWidth * dpr;
  canvas.height = innerHeight * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  const count = Math.min(120, Math.floor(innerWidth / 12));
  flakes = Array.from({ length: count }, () => newFlake(true));
}
function newFlake(anywhere) {
  return {
    x: Math.random() * innerWidth,
    y: anywhere ? Math.random() * innerHeight : -10,
    r: Math.random() * 2.6 + 1,
    vy: Math.random() * 0.8 + 0.4,
    sway: Math.random() * Math.PI * 2,
    o: Math.random() * 0.5 + 0.45,
  };
}
function drawSnow() {
  ctx.clearRect(0, 0, innerWidth, innerHeight);
  for (const f of flakes) {
    f.y += f.vy;
    f.sway += 0.01;
    f.x += Math.sin(f.sway) * 0.4;
    if (f.y > innerHeight + 10) Object.assign(f, newFlake(false));
    ctx.beginPath();
    ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255,253,248,${f.o})`;
    ctx.fill();
    ctx.strokeStyle = "rgba(215,38,30,.18)";
    ctx.lineWidth = 0.6;
    ctx.stroke();
  }
  snowRAF = requestAnimationFrame(drawSnow);
}
function setSnow(on) {
  snowing = on;
  snowBtn.setAttribute("aria-pressed", on);
  cancelAnimationFrame(snowRAF);
  if (on) drawSnow();
  else ctx.clearRect(0, 0, innerWidth, innerHeight);
  try { localStorage.setItem("wr-snow", on ? "1" : "0"); } catch (e) {}
}
snowBtn.addEventListener("click", () => {
  setSnow(!snowing);
  toast(snowing ? "Salju turun lagi" : "Salju dihentikan");
});
window.addEventListener("resize", resizeCanvas);
resizeCanvas();
setSnow(snowing);

const lights = $("#lights");
const colors = ["#D7261E", "#FFC23D", "#FF7A1A", "#2E7D4F"];
function buildLights() {
  lights.innerHTML = "";
  const n = innerWidth < 600 ? 9 : 16;
  for (let i = 0; i < n; i++) {
    const t = (i + 0.5) / n;
    const sag = -30 + 60 * Math.sqrt(Math.max(0, 1 - Math.pow(2 * t - 1, 2)));
    const li = document.createElement("li");
    li.style.setProperty("--c", colors[i % colors.length]);
    li.style.setProperty("--drop", Math.max(4, sag + 6) + "px");
    li.style.setProperty("--delay", (Math.random() * 2).toFixed(2) + "s");
    li.addEventListener("click", () => {
      li.classList.toggle("off");
      const allOff = $$("li", lights).every((x) => x.classList.contains("off"));
      if (allOff) {
        toast("Wah, gelap. Lampunya kami nyalakan lagi ya");
        setTimeout(() => $$("li", lights).forEach((x) => x.classList.remove("off")), 900);
      }
    });
    lights.appendChild(li);
  }
}
buildLights();
let lastW = innerWidth;
window.addEventListener("resize", () => {
  if ((lastW < 600) !== (innerWidth < 600)) buildLights();
  lastW = innerWidth;
});

const heroBowl = $("#heroBowl");
const bubble = $("#bowlBubble");
const bubbleLines = [
  "Slurrp!",
  "Mau edit apa hari ini?",
  "MVL atau poster dulu?",
  "Topi Santa ini pinjaman",
  "Satu mangkuk lagi?",
];
let bubbleIdx = 0;
heroBowl.addEventListener("click", () => {
  heroBowl.classList.remove("stir");
  void heroBowl.offsetWidth;
  heroBowl.classList.add("stir");
  bubble.textContent = bubbleLines[bubbleIdx++ % bubbleLines.length];
});

const FOTO_SEBELUM = "";
const FOTO_SESUDAH = "";

const stage = $(".compare-stage");
if (FOTO_SEBELUM && FOTO_SESUDAH) {
  $(".compare-layer.before svg").outerHTML = `<img class="work-img" src="${FOTO_SEBELUM}" alt="Sebelum diedit">`;
  $(".compare-layer.after svg").outerHTML = `<img class="work-img" src="${FOTO_SESUDAH}" alt="Sesudah diedit">`;
}
const range = $("#compareRange");
const setPos = (v) => stage.style.setProperty("--pos", v + "%");
range.addEventListener("input", () => setPos(range.value));

if (!reduceMotion) {
  const hintObs = new IntersectionObserver((entries, obs) => {
    if (!entries[0].isIntersecting) return;
    obs.disconnect();
    const frames = [50, 28, 72, 50];
    let i = 0;
    const step = () => {
      if (i >= frames.length - 1 || range.dataset.touched) return;
      const from = frames[i], to = frames[i + 1], start = performance.now();
      const anim = (now) => {
        if (range.dataset.touched) return;
        const p = Math.min(1, (now - start) / 600);
        const v = from + (to - from) * (0.5 - Math.cos(p * Math.PI) / 2);
        setPos(v); range.value = v;
        if (p < 1) requestAnimationFrame(anim);
        else { i++; step(); }
      };
      requestAnimationFrame(anim);
    };
    setTimeout(step, 400);
  }, { threshold: 0.6 });
  hintObs.observe(stage);
}
range.addEventListener("pointerdown", () => (range.dataset.touched = "1"));
range.addEventListener("keydown", () => (range.dataset.touched = "1"));

const categories = [
  { id: "semua", label: "SEMUA" },
  { id: "mvl", label: "MVL" },
  { id: "ccl", label: "CCL" },
  { id: "teaser", label: "TEASER" },
  { id: "poster", label: "POSTER" },
  { id: "rapch", label: "RAPCH" },
  { id: "wording", label: "WORDING" },
  { id: "thumbnail", label: "THUMBNAIL" },
  { id: "linedist", label: "LINE DISTRIBUTION" },
  { id: "kca", label: "LAYOUT KCA" },
  { id: "idcard", label: "ID CARD" },
];

const eqBars = Array.from({ length: 14 }, (_, i) =>
  `<i style="--h:${20 + ((i * 37) % 26)}px;--d:-${(i * 0.13).toFixed(2)}s"></i>`
).join("");

const esc = (v) => String(v ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const PALET = [
  ["#D7261E", "#2B1208"], ["#17402F", "#2E7D4F"], ["#FF7A1A", "#D7261E"],
  ["#2B1208", "#9E1711"], ["#1F5A40", "#17402F"], ["#E8501C", "#9E1711"],
];
const KATA = [
  "welcome to our little home", "open recruitment is here", "thank you for staying",
  "a new chapter begins", "rules before we start", "meet the members", "see you on the next page",
];
const ANGGOTA = ["Hana", "Jiwoo", "Yuna", "Seol", "Rara", "Mina"];

function artFor(w, i) {
  const m = w.meta || {};
  const [a, b] = PALET[i % PALET.length];
  const bg = `background:linear-gradient(150deg, ${a}, ${b})`;
  const judul = esc(m["Judul lagu"] || w.title);
  const penyanyi = esc(m.Penyanyi || "");
  switch (w.type) {
    case "mvl":
      return `<div class="work-art art-lyric" style="${bg}"><div class="lyr"><p>MVL ${esc(m.Tipe || "")}</p><p class="on">${judul}</p><p>${penyanyi}</p></div><span class="play"></span></div>`;
    case "ccl":
      return `<div class="work-art art-ccl" style="${bg}"><div class="ccl"><span class="disc"></span><div><b>${judul}</b><small>${penyanyi || "cover lirik"}</small><p>lirik mengikuti lagu</p></div></div><span class="play"></span></div>`;
    case "teaser": {
      const kata = w.title.replace(/^TEASER\s*/i, "").split(" ");
      return `<div class="work-art art-teaser"><div class="tz"><small>teaser</small><b>${esc(kata[0])}</b><small>${esc(kata.slice(1).join(" "))}</small></div><span class="play"></span></div>`;
    }
    case "poster":
      return `<div class="work-art art-poster"><div class="pst" style="background:${a}"><span class="pst-star"></span><b>${esc((m.Jenis || w.title).toUpperCase()).split(" ").join("<br>")}</b><small>open recruitment</small></div></div>`;
    case "rapch":
      return `<div class="work-art art-rap" style="${bg}"><small class="rap-tag">CH ${esc((m.Jenis || "").toUpperCase())}</small><b class="rap-t">${esc(m.Tema && m.Tema !== "-" ? m.Tema : "RAPCH")}<br><em>${esc(m.Muse && m.Muse !== "-" ? m.Muse : "")}</em></b><div class="eq">${eqBars}</div></div>`;
    case "wording":
      return `<div class="work-art art-wording"><p>${KATA[i % KATA.length]}<br><small>${esc(w.title)}</small></p></div>`;
    case "thumbnail":
      return `<div class="work-art" style="${bg}"><p class="art-thumb">${esc(w.title)}<br><em>${esc(m.Jenis || "")}</em></p></div>`;
    case "linedist": {
      let sisa = 100;
      const baris = ANGGOTA.slice(0, 4).map((nama, k) => {
        const persen = k === 3 ? sisa : 18 + ((i * 7 + k * 11) % 15);
        sisa -= persen;
        const warna = ["#D7261E", "#FF7A1A", "#FFC23D", "#2E7D4F"][k];
        return `<div class="ld-row"><span>${ANGGOTA[(i + k) % ANGGOTA.length]}</span><i style="--w:${persen}%;--c:${warna}"></i><b>${persen}%</b></div>`;
      }).join("");
      return `<div class="work-art art-ld"><div class="ld">${baris}</div><span class="play"></span></div>`;
    }
    case "idcard":
      return `<div class="work-art art-id" style="${bg}"><div class="idc"><div class="idc-top">${esc((m.Tipe && m.Tipe !== "-" ? "ID CARD " + m.Tipe : "ID CARD").toUpperCase())}</div><div class="idc-body"><span class="idc-photo"></span><div><b>${esc(w.title.replace(/^ID CARD\s*/i, ""))}</b><small>No. ${2500 + i}</small><i class="idc-line"></i><i class="idc-line short"></i></div></div><div class="idc-bar"></div></div></div>`;
    case "kca":
      return `<div class="work-art art-kca" style="${bg}"><div class="kca"><div class="kca-head"><span class="kca-av"></span><b>${esc(w.title)}</b></div><i></i><i class="s"></i><div class="kca-grid"><span></span><span></span><span></span><span></span></div><i></i><i class="s"></i></div></div>`;
    default:
      return `<div class="work-art" style="${bg}"><p class="art-thumb">${esc(w.title)}</p></div>`;
  }
}

function mediaHTML(w, inModal) {
  if (!w.media) return w.art || artFor(w, w._i || 0);
  const isVideo = /\.(mp4|webm|mov|m4v)$/i.test(w.media);
  if (isVideo) {
    const poster = w.poster ? ` poster="${w.poster}"` : "";
    return inModal
      ? `<div class="work-art"><video class="work-img" src="${w.media}"${poster} controls autoplay playsinline onerror="this.parentNode.classList.add('missing')"></video></div>`
      : `<div class="work-art"><video class="work-img" src="${w.media}"${poster} muted loop playsinline preload="metadata" onerror="this.parentNode.classList.add('missing')"></video><span class="play"></span></div>`;
  }
  return `<div class="work-art"><img class="work-img" src="${w.media}" alt="${w.title}" loading="lazy" onerror="this.parentNode.classList.add('missing')"></div>`;
}

const works = [
  {
    type: "mvl", size: "yt",
    title: "MVL DESIGN #SP001",
    meta: { "Judul lagu": "GODS", Penyanyi: "NEWJEANS", Tipe: "Simple" },
    admin: "@jRami",
  },
  {
    type: "mvl", size: "yt",
    title: "MVL DESIGN #FL001",
    meta: { "Judul lagu": "NO ONE ELSE", Penyanyi: "MIDNIGHT BLUE", Tipe: "Full" },
    admin: "@jRami",
  },
  {
    type: "mvl", size: "yt",
    title: "MVL DESIGN #FL002",
    meta: { "Judul lagu": "JELLYOUS", Penyanyi: "ILLIT", Tipe: "Full" },
    admin: "@jRami",
  },
  {
    type: "mvl", size: "yt",
    title: "MVL DESIGN #FL003",
    meta: { "Judul lagu": "SELFISH", Penyanyi: "MOONBYUL FT. SEULGI", Tipe: "Full" },
    admin: "@jRami",
  },
  {
    type: "mvl", size: "yt",
    title: "MVL DESIGN #SP002",
    meta: { "Judul lagu": "EITHER WAY", Penyanyi: "IVE", Tipe: "Simple" },
    admin: "@jRami",
  },
  {
    type: "mvl", size: "yt",
    title: "MVL DESIGN #MD001",
    meta: { "Judul lagu": "DIRTY WORK", Penyanyi: "AESPA", Tipe: "Medium" },
    admin: "@jRami",
  },

  {
    type: "poster", size: "tall",
    title: "POSTER HIRING COVER TEAM",
    meta: { Jenis: "Hiring cover team", Format: "Portrait, desain/cyber" },
    admin: "@jRami",
  },
  {
    type: "poster", size: "tall",
    title: "POSTER HIRING TEAM & TRAINEE",
    meta: { Jenis: "Hiring team & trainee", Format: "Portrait, desain/cyber" },
    admin: "@jRami",
  },
  {
    type: "poster", size: "tall",
    title: "POSTER OPEN TEAM",
    meta: { Jenis: "Open team", Format: "Portrait, desain/cyber" },
    admin: "@jRami",
  },
  {
    type: "poster", size: "yt",
    title: "POSTER STORE",
    meta: { Jenis: "Poster store", Format: "Landscape, desain/cyber" },
    admin: "@jRami",
  },
  {
    type: "ccl", size: "yt",
    title: "CCL (ITS ME - ILLIT)",
    meta: { "Judul lagu": "ITS ME", Penyanyi: "ILLIT", Tipe: "" },
    admin: "@jRami",
  },
  {
    type: "ccl", size: "yt",
    title: "CCL (SHUTDOWN - BLACKPINK)",
    meta: { "Judul lagu": "SHUTDOWN", Penyanyi: "BLACKPINK", Tipe: "" },
    admin: "@jRami",
  },
  {
    type: "ccl", size: "yt",
    title: "CCL (TAKE ME UP - RAINE)",
    meta: { "Judul lagu": "TAKE ME UP", Penyanyi: "RAINE", Tipe: "" },
    admin: "@jRami",
  },
  {
    type: "ccl", size: "yt",
    title: "CCL (LOVE - YYJ)",
    meta: { "Judul lagu": "LOVE", Penyanyi: "YYJ", Tipe: "" },
    admin: "@jRami",
  },
  {
    type: "wording",
    title: "WORDING #WD001",
    meta: { Jenis: "", Jumlah: "" },
    admin: "@jRami",
  },
  {
    type: "wording",
    title: "WORDING #WD002",
    meta: { Jenis: "", Jumlah: "" },
    admin: "@jRami",
  },
  {
    type: "wording",
    title: "WORDING #WD003",
    meta: { Jenis: "", Jumlah: "" },
    admin: "@jRami",
  },
  {
    type: "wording",
    title: "WORDING #WD004",
    meta: { Jenis: "", Jumlah: "" },
    admin: "@jRami",
  },
  {
    type: "wording",
    title: "WORDING #WD005",
    meta: { Jenis: "", Jumlah: "" },
    admin: "@jRami",
  },
  {
    type: "wording",
    title: "WORDING #WD006",
    meta: { Jenis: "", Jumlah: "" },
    admin: "@jRami",
  },
  {
    type: "wording",
    title: "WORDING #WD007",
    meta: { Jenis: "", Jumlah: "" },
    admin: "@jRami",
  },
   {
    type: "idcard", size: "square",
    title: "ID CARD ADMIN STORE", admin: "@jRami",
    meta: { Tipe: "DECO" },
  },
  {
    type: "idcard", size: "square",
    title: "ID CARD STAFF", admin: "@jRami",
    meta: { Tipe: "DESIGN" },
  },
  {
    type: "idcard", size: "square",
    title: "ID CARD MEMBER AGENSI", admin: "@jRami",
    meta: { Tipe: "DESIGN" },
  },
  {
    type: "linedist", size: "wide",
    title: "Line Distribution #LD01",
    meta: { "Judul lagu": "", Penyanyi: "", Tipe: "" },
    admin: "@jRami",
  },
   {
    type: "linedist", size: "wide",
    title: "Line Distribution #LD01",
    meta: { "Judul lagu": "", Penyanyi: "", Tipe: "" },
    admin: "@jRami",
  },
     {
    type: "linedist", size: "wide",
    title: "Line Distribution #LD01",
    meta: { "Judul lagu": "", Penyanyi: "", Tipe: "" },
    admin: "@jRami",
  },
  {
    type: "linedist", size: "wide",
    title: "Line Distribution #LD01",
    meta: { "Judul lagu": "", Penyanyi: "", Tipe: "" },
    admin: "@jRami",
  },
  {
    type: "kca", size: "story",
    title: "LAYOUT KCA #KC001",
    meta: { Opsi: "", Tema: "" },
    admin: "@jRami",
  },
  {
    type: "kca", size: "story",
    title: "LAYOUT KCA #KC002",
    meta: { Opsi: "", Tema: "" },
    admin: "@jRami",
  },
  {
    type: "kca", size: "story",
    title: "LAYOUT KCA #KC002",
    meta: { Opsi: "", Tema: "" },
    admin: "@jRami",
  },
  {
    type: "teaser", size: "yt",
    title: "TEASER GROUP CONCEPT",
    meta: { Tujuan: "Perkenalan konsep grup", Durasi: "±40 detik" },
    admin: "@jRami",
  },

  {
    type: "teaser", size: "yt",
    title: "TEASER ALBUM CONCEPT",
    meta: { Tujuan: "Promosi konsep album", Durasi: "±40 detik" },
    admin: "@jRami",
  },
  {
    type: "teaser", size: "yt",
    title: "TEASER TRAILER SURVIVAL",
    meta: { Tujuan: "Opening global survival", Durasi: "±60 detik" },
    admin: "@jRami",
  },
  {
    type: "thumbnail", size: "yt",
    title: "THUMBNAIL YOUTUBE",
    meta: { Jenis: "COVER YOUTUBE" },
    admin: "@jRami",
  },
  {
    type: "thumbnail", size: "yt",
    title: "THUMBNAIL YOUTUBE",
    meta: { Jenis: "DUET COVER THUMBNAIL" },
    admin: "@jRami",
  },
  {
    type: "rapch",
    title: "RAPCH (CH LITERASI)",
    meta: { Jenis: "Literasi", Tema: "BUCIN", Muse: "SUNWOO TBZ FT. SIYEON DREAMCATHER" },
    admin: "@jRami",
  },
  {
    type: "rapch",
    title: "RAPCH (CH LITERASI)",
    meta: { Jenis: "Literasi", Tema: "GFM", Muse: "SIU MAVE" },
    admin: "@jRami",
  },
  {
    type: "rapch",
    title: "RAPCH (CH LITERASI)",
    meta: { Jenis: "Literasi", Tema: "DOLLETE", Muse: "YOOHYEON DREMCATHER" },
    admin: "@jRami",
  },
  {
    type: "rapch",
    title: "RAPCH (CH LITERASI)",
    meta: { Jenis: "Literasi", Tema: "LOKALAN MAHASISWA TEKNIK KOMPUTER", Muse: "CHANELLE - FIFTYFIFTY" },
    admin: "@jRami",
  },
  {
    type: "rapch",
    title: "RAPCH (CH LITERASI)",
    meta: { Jenis: "Literasi", Tema: "THE JUDGE FROM HELL", Muse: "KANG BITNA" },
    admin: "@jRami",
  },
  {
    type: "rapch",
    title: "RAPCH (CH LITERASI)",
    meta: { Jenis: "Literasi", Tema: "GAMON", Muse: "YEONJUN TXT FT. BEOMGYU TXT" },
    admin: "@jRami",
  },
  {
    type: "rapch",
    title: "RAPCH (CH PRIBADI)",
    meta: { Jenis: "Pribadi", Tema: "GADIS BALI", Muse: "ESTHER NONA" },
    admin: "@jRami",
  },
  {
    type: "rapch",
    title: "RAPCH (CH LITERASI)",
    meta: { Jenis: "Literasi", Tema: "BFM", Muse: "SUNWOO TBZ" },
    admin: "@jRami",
  },
  {
    type: "rapch",
    title: "RAPCH (CH LITERASI)",
    meta: { Jenis: "Literasi", Tema: "VINTAGE POETRY", Muse: "YOOHYEON DREAMCATHER" },
    admin: "@jRami",
  },
  {
    type: "rapch",
    title: "RAPCH (CH LITERASI)",
    meta: { Jenis: "Literasi", Tema: "GFM", Muse: "SUA DREAMCATHER" },
    admin: "@jRami",
  },
  {
    type: "rapch",
    title: "RAPCH (CH LITERASI)",
    meta: { Jenis: "Literasi", Tema: "TAIWAN GIRL", Muse: "SHUHUA IDLE" },
    admin: "@jRami",
  },
  {
    type: "rapch",
    title: "RAPCH (CH PRIBADI)",
    meta: { Jenis: "Pribadi", Tema: "VOCALIST", Muse: "RAMI BABYMONSTER" },
    admin: "@jRami",
  },
  {
    type: "rapch",
    title: "RAPCH (CH LITERASI)",
    meta: { Jenis: "Literasi", Tema: "MAHASISWA SENI", Muse: "SUNWOO TBZ" },
    admin: "@jRami",
  },
  {
    type: "rapch",
    title: "RAPCH (CH PRIBADI)",
    meta: { Jenis: "Pribadi", Tema: "ROMCOM", Muse: "WONYOUNG IVE" },
    admin: "@jRami",
  },
  {
    type: "rapch",
    title: "RAPCH (CH LITERASI)",
    meta: { Jenis: "Literasi", Tema: "VAMPIRE/DRACULA", Muse: "JAMES CORTIS" },
    admin: "@jRami",
  },
  {
    type: "rapch",
    title: "RAPCH (CH LITERASI)",
    meta: { Jenis: "Literasi", Tema: "POERTY", Muse: "ALICE CULLEN" },
    admin: "@jRami",
  },
  {
    type: "rapch",
    title: "RAPCH (CH PRIBADI)",
    meta: { Jenis: "Pribadi", Tema: "TATTO ARTIST", Muse: "HAN SOHEE" },
    admin: "@jRami",
  },
  {
    type: "rapch",
    title: "RAPCH (CH PRIBADI)",
    meta: { Jenis: "Pribadi", Tema: "GFM", Muse: "CARMEN H2H" },
    admin: "@jRami",
  },
  {
    type: "rapch",
    title: "RAPCH (CH PRIBADI)",
    meta: { Jenis: "Pribadi", Tema: "GADIS SUNDA", Muse: "ANA H2H" },
    admin: "@jRami",
  },
  {
    type: "rapch",
    title: "RAPCH (CH LITERASI)",
    meta: { Jenis: "Literasi", Tema: "GFM", Muse: "RYUJIN ITZY" },
    admin: "@jRami",
  },
  {
    type: "rapch",
    title: "RAPCH (CH PRIBADI)",
    meta: { Jenis: "Pribadi", Tema: "BLUE POETRY", Muse: "RORA BABYMONSTER" },
    admin: "@jRami",
  },
  {
    type: "rapch",
    title: "RAPCH (CH PRIBADI)",
    meta: { Jenis: "Pribadi", Tema: "MAHASISWA TEKNIK KOMPUTER", Muse: "MARTIN CORTIS" },
    admin: "@jRami",
  },
];
works.forEach((w, i) => { w._i = i; });


const filtersEl = $("#filters");
categories.forEach((c, i) => {
  const b = document.createElement("button");
  b.className = "chip" + (i === 0 ? " active" : "");
  b.dataset.filter = c.id;
  b.setAttribute("role", "tab");
  b.setAttribute("aria-selected", i === 0);
  b.textContent = c.label;
  filtersEl.appendChild(b);
});

const labelOf = (id) => (categories.find((c) => c.id === id) || {}).label || id;

const worksEl = $("#works");
works.forEach((w, i) => {
  const b = document.createElement("button");
  b.className = "work" + (w.size ? " " + w.size : "");
  b.dataset.type = w.type;
  b.setAttribute("aria-label", `${w.title}, ${labelOf(w.type)}. Lihat detail`);
  b.innerHTML = `${mediaHTML(w, false)}
    <div class="work-info">
      <div><b>${w.title}</b><small>Admin ${w.admin || "-"}</small></div>
      <span class="work-type">${labelOf(w.type)}</span>
    </div>`;
  b.addEventListener("click", () => openWork(i, b));

  const vid = b.querySelector("video");
  if (vid) {
    const play = () => { vid.play().catch(() => {}); b.classList.add("playing"); };
    const stop = () => { vid.pause(); vid.currentTime = 0; b.classList.remove("playing"); };
    b.addEventListener("mouseenter", play);
    b.addEventListener("mouseleave", stop);
    b.addEventListener("focus", play);
    b.addEventListener("blur", stop);
  }
  worksEl.appendChild(b);
});

filtersEl.addEventListener("click", (e) => {
  const chip = e.target.closest(".chip");
  if (!chip) return;
  $$(".chip", filtersEl).forEach((c) => {
    c.classList.toggle("active", c === chip);
    c.setAttribute("aria-selected", c === chip);
  });
  const f = chip.dataset.filter;
  let shown = 0;
  $$(".work").forEach((w) => {
    const show = f === "semua" || w.dataset.type === f;
    w.classList.toggle("hide", !show);
    if (show) shown++;
  });
  $("#worksEmpty").hidden = shown > 0;
});

let lastFocus = null;
function openModal(el, focusEl) {
  lastFocus = document.activeElement;
  el.hidden = false;
  document.body.style.overflow = "hidden";
  (focusEl || $("[data-close]", el)).focus();
}
function closeModal(el) {
  el.hidden = true;
  if (el.id === "modal") $("#modalArt").innerHTML = "";
  if ($$(".modal").every((m) => m.hidden)) document.body.style.overflow = "";
  if (lastFocus && document.contains(lastFocus)) lastFocus.focus();
}
$$(".modal").forEach((m) => {
  m.addEventListener("click", (e) => {
    if (e.target === m || e.target.closest("[data-close]")) closeModal(m);
  });
});
document.addEventListener("keydown", (e) => {
  if (e.key !== "Escape") return;
  const open = $$(".modal").find((m) => !m.hidden);
  if (open) closeModal(open);
});

const modal = $("#modal");
let currentWork = null;
function openWork(i) {
  const w = works[i];
  currentWork = w;
  $("#modalArt").innerHTML = mediaHTML(w, true);
  $("#modalArt").classList.toggle("tall", w.size === "story" || w.size === "square");
  $("#modalTitle").textContent = w.title;
  $("#modalDesc").textContent = w.desc || "";
  $("#modalDesc").hidden = !w.desc;
  $("#modalMeta").innerHTML =
    `<dt>Kategori</dt><dd>${labelOf(w.type)}</dd>` +
    Object.entries(w.meta || {}).filter(([, v]) => v).map(([k, v]) => `<dt>${k}</dt><dd>${v}</dd>`).join("") +
    `<dt>Admin</dt><dd>${w.admin || "-"}</dd>`;
  openModal(modal);
}
$("#modalOrder").addEventListener("click", () => {
  if (!currentWork) return;
  modal.hidden = true;
  $("#modalArt").innerHTML = "";
  openPicker(`Halo Warung Ramyeon! Saya mau pesan ${labelOf(currentWork.type)} seperti contoh "${currentWork.title}". Bisa dibantu?`);
});

const picker = $("#picker");
let pickerText = "";

function openPicker(message) {
  pickerText = message || "";
  $("#pickerMsg").textContent = pickerText;
  $$(".admin", picker).forEach((a) => {
    const base = `https://t.me/${a.dataset.user}`;

    a.href = pickerText ? `${base}?text=${encodeURIComponent(pickerText)}` : base;
  });
  openModal(picker, $(".admin", picker));
}

$$(".admin", picker).forEach((a) =>
  a.addEventListener("click", () => {
    if (pickerText) {
      salin(pickerText).then((ok) =>
        toast(ok ? `Membuka @${a.dataset.user}. Pesan sudah disalin, tempel kalau belum terisi` : `Membuka @${a.dataset.user} di Telegram`)
      );
    } else {
      toast(`Membuka @${a.dataset.user} di Telegram`);
    }
    setTimeout(() => closeModal(picker), 300);
  })
);

const MENUS = [
  {
    id: "mvl", label: "MVL", star: "Paling laris",
    list: [
      ["Design Simple", "Rp 7.000 – 10.000", "Free 1 muse"],
      ["Design Medium", "Rp 10.000 – 15.000", "Free 1 muse"],
      ["Design Full", "Rp 15.000 – 20.000", "Free 1 muse"],
      ["Service", "Rp 5.000", "Wajib untuk full edit"],
      ["(+) Muse", "Rp 1.300 / muse"],
      ["(+) Line Distribution", "Rp 6.000"],
    ],
    notes: [
      "Pilih Design saja (tanpa service) atau Full edit (design + service).",
      "Full edit wajib disertai service.",
      "Harga desain MVL sudah termasuk 1 free muse.",
      "Penambahan muse dikenakan Rp 1.300/muse.",
    ],
    fields: [
      { type: "radio", id: "paket", name: "Pilih paket", hint: "Full edit otomatis termasuk service", options: [
        { v: "design", label: "Design saja" },
        { v: "full", label: "Full edit" },
      ] },
      { type: "radio", id: "design", name: "Design", hint: "Semua pilihan sudah termasuk 1 muse gratis", options: [
        { v: "simple", label: "Simple", min: 7000, max: 10000 },
        { v: "medium", label: "Medium", min: 10000, max: 15000 },
        { v: "full", label: "Full", min: 15000, max: 20000 },
      ] },
      { type: "req", name: "Service", price: 5000, when: (s) => s.paket === "full" },
      { type: "count", id: "muse", name: "Jumlah muse", unit: "muse", price: 1300, min: 1, free: 1, hint: "1 gratis, selanjutnya Rp 1.300/muse" },
      { type: "check", id: "ld", name: "Line Distribution", price: 6000 },
    ],
  },
  {
    id: "ccl", label: "CCL",
    list: [
      ["Template", "Rp 1.500 / muse"],
      ["Service (wajib)", "Rp 3.500"],
      ["(+) MV embed", "Rp 1.000"],
      ["(+) Language", "Rp 1.500"],
      ["Add lyrics", "Rp 1.100 / slide"],
    ],
    notes: [
      "Pembelian CCL wajib disertai service.",
      "Jika hanya ingin service saja atau template saja, harga sudah tertera di price list.",
      "MV embed merupakan penambahan MV dan dikenakan biaya tambahan Rp 1.000.",
      "Penambahan language dikenakan biaya Rp 1.500.",
    ],
    fields: [
      { type: "radio", id: "paket", name: "Pilih paket", options: [
        { v: "both", label: "Template + service" },
        { v: "tpl", label: "Template saja" },
        { v: "svc", label: "Service saja" },
      ] },
      { type: "count", id: "muse", name: "Template", unit: "muse", price: 1500, min: 1, free: 0, hint: "Rp 1.500/muse", when: (s) => s.paket !== "svc" },
      { type: "req", name: "Service", price: 3500, when: (s) => s.paket !== "tpl" },
      { type: "check", id: "mv", name: "MV embed", price: 1000 },
      { type: "check", id: "lang", name: "Language", price: 1500 },
      { type: "count", id: "lyr", name: "Add lyrics", unit: "slide", price: 1100, min: 0, free: 0, hint: "Rp 1.100/slide" },
    ],
  },
  {
    id: "teaser", label: "Teaser",
    list: [
      ["Teaser (±30 detik)", "Rp 1.700 / muse"],
      ["(+) Service (wajib)", "Rp 3.000"],
    ],
    notes: [
      "Harga yang tertera merupakan harga teaser dengan durasi ±30 detik.",
      "Apabila teaser melebihi ±30 detik, harga dapat berubah menyesuaikan durasi.",
    ],
    fields: [
      { type: "count", id: "muse", name: "Teaser", unit: "muse", price: 1700, min: 1, free: 0, hint: "Durasi ±30 detik, Rp 1.700/muse" },
      { type: "req", name: "Service", price: 3000 },
    ],
  },
  {
    id: "poster", label: "Poster",
    list: [
      ["Poster hiring", "Rp 7.000 – 50.000", "Tergantung kesulitan"],
      ["(+) Kepala muse", "Rp 2.000 / kepala", "2 kepala gratis"],
    ],
    notes: [
      "Jasa poster kami hanya melayani poster untuk hiring, bukan untuk debut, comeback, atau sejenisnya.",
      "Kami hanya menerima poster desain/cyber, tanpa dekorasi.",
      "Setiap 1 poster sudah termasuk 2 kepala muse gratis.",
      "Penambahan kepala muse dikenakan biaya Rp 2.000 per kepala.",
    ],
    fields: [
      { type: "range", name: "Poster hiring", min: 7000, max: 50000, hint: "Tergantung kesulitan, desain/cyber tanpa dekorasi" },
      { type: "count", id: "head", name: "Kepala muse", unit: "kepala", price: 2000, min: 1, start: 2, free: 2, hint: "2 gratis, selanjutnya Rp 2.000/kepala" },
    ],
  },
  {
    id: "thumbnail", label: "Thumbnail",
    list: [["Thumbnail YouTube", "Rp 5.000 – 15.000", "Tergantung kesulitan"]],
    notes: [
      "Pemesan sangat disarankan untuk menyertakan referensi desain.",
      "Thumbnail yang kami sediakan khusus untuk platform YouTube saja.",
    ],
    fields: [
      { type: "range", name: "Thumbnail YouTube", min: 5000, max: 15000, hint: "Tergantung kesulitan, sertakan referensi" },
    ],
  },
  {
    id: "wording", label: "Wording",
    list: [
      ["Short", "Rp 2.000 – 5.000"],
      ["Medium", "Rp 6.000 – 8.000"],
      ["Long", "Rp 9.000 – 14.000"],
      ["Start Page", "Rp 3.500 – 4.000"],
      ["Location", "Rp 2.000 – 3.000"],
      ["Prem Bios", "Rp 5.000"],
      ["Non Prem Bios", "Rp 3.000"],
    ],
    notes: [
      "Harga yang tertera berlaku untuk wording, bukan rapch.",
      "Harga tidak dapat ditawar.",
    ],
    fields: [
      { type: "radio", id: "len", name: "Wording", options: [
        { v: "none", label: "Tidak" },
        { v: "short", label: "Short", min: 2000, max: 5000 },
        { v: "medium", label: "Medium", min: 6000, max: 8000 },
        { v: "long", label: "Long", min: 9000, max: 14000 },
      ], start: "short" },
      { type: "check", id: "sp", name: "Start Page", min: 3500, max: 4000 },
      { type: "check", id: "loc", name: "Location", min: 2000, max: 3000 },
      { type: "radio", id: "bios", name: "Bios", options: [
        { v: "none", label: "Tidak" },
        { v: "prem", label: "Prem", min: 5000 },
        { v: "non", label: "Non Prem", min: 3000 },
      ] },
    ],
  },
  {
    id: "rapch", label: "Rapch",
    list: [
      ["Literasi", "Mulai Rp 20.000"],
      ["Pribadi", "Mulai Rp 15.000"],
    ],
    notes: [
      "Harga RAPCH dapat menyesuaikan dengan budget, namun tidak dapat di bawah harga start.",
      "Harga sudah termasuk seluruh media yang digunakan serta comsect jika ada.",
      "Penggunaan emoji premium dapat menyebabkan penyesuaian harga.",
      "Harga sudah termasuk username.",
    ],
    fields: [
      { type: "radio", id: "jenis", name: "Jenis rapch", options: [
        { v: "literasi", label: "Literasi", min: 20000, max: Infinity },
        { v: "pribadi", label: "Pribadi", min: 15000, max: Infinity },
      ] },
      { type: "budget", id: "budget", name: "Budget kamu (opsional)", ref: "jenis" },
    ],
  },
  {
    id: "linedist", label: "Line Distribution", short: "Line Dist", noRush: true,
    list: [
      ["Design", "Rp 10.000 – 20.000"],
      ["Service (wajib)", "Rp 6.000"],
      ["Line Dist", "Rp 3.000 / muse"],
    ],
    notes: [
      "Setiap pembelian Line Dist wajib disertai service.",
      "Harga total sudah termasuk video utuh, MV, dan lirik.",
      "Tidak dapat inrush.",
    ],
    fields: [
      { type: "range", name: "Design", min: 10000, max: 20000, hint: "Termasuk video utuh, MV, dan lirik" },
      { type: "req", name: "Service", price: 6000 },
      { type: "count", id: "muse", name: "Line Dist", unit: "muse", price: 3000, min: 1, free: 0, hint: "Rp 3.000/muse" },
    ],
  },
  {
    id: "kca", label: "Layout KCA", short: "KCA",
    list: [
      ["Design", "Rp 7.000 – 30.000", "Tergantung kesulitan"],
      ["(+) Template only", "Rp 2.000", "Template yang bisa kamu edit sendiri"],
      ["(+) Service", "Rp 5.000", "Kami yang mengerjakan sampai jadi"],
    ],
    notes: [
      "Pemesan wajib membawa contoh referensi.",
      "Template only: kamu mendapat template yang bisa diedit sendiri, tambah Rp 2.000.",
      "Service: kami yang mengerjakan layout sampai jadi, tambah Rp 5.000.",
    ],
    fields: [
      { type: "range", name: "Design", min: 7000, max: 30000, hint: "Tergantung kesulitan, wajib bawa contoh referensi" },
      { type: "radio", id: "opsi", name: "Pilih opsi", options: [
        { v: "none", label: "Design saja" },
        { v: "tpl", label: "Template only", min: 2000 },
        { v: "svc", label: "Service", min: 5000 },
      ] },
    ],
  },
];

const rpRange = ([a, b]) =>
  b === Infinity ? "Mulai " + rupiah(a) :
  a === b ? rupiah(a) :
  `${rupiah(a)} – ${Math.round(b).toLocaleString("id-ID")}`;

const board = $("#board");
[...MENUS, { id: "idcard", label: "ID Card", list: [["ID Card", "Tanya admin"]], notes: [], ask: true }].forEach((m) => {
  const card = document.createElement("article");
  card.className = "mcard" + (m.star ? " mcard-star" : "");
  card.innerHTML = `
    ${m.star ? `<span class="sticker">${m.star}</span>` : ""}
    <h3>${m.label}</h3>
    <ul class="mrows">
      ${m.list.map(([n, p, s]) => `<li><span>${n}${s ? `<small>${s}</small>` : ""}</span><i></i><b>${p}</b></li>`).join("")}
    </ul>
    ${m.notes.length ? `<details class="mnotes"><summary>Ketentuan</summary><ol>${m.notes.map((t) => `<li>${t}</li>`).join("")}</ol></details>` : `<p class="mask">Harga menyesuaikan desain. Chat admin untuk info.</p>`}
    <button class="btn ${m.star ? "btn-red" : "btn-line"} btn-wide">${m.ask ? "Tanya admin" : "Racik menu ini"}</button>`;
  $("button", card).addEventListener("click", () => {
    if (m.ask) openPicker("Halo Warung Ramyeon! Saya mau tanya harga ID Card.");
    else {
      pilihMenu(m.id);
      $("#kitchen").scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
    }
  });
  board.appendChild(card);
});

const RUSH = [
  { label: "Normal", note: "Tanpa biaya inrush.", broth: "#F2A33A" },
  { label: "Inrush", note: "Kena biaya inrush, ditentukan admin.", broth: "#FF7A1A" },
  { label: "Inrush besar", note: "Biaya inrush lebih besar, ditentukan admin.", broth: "#C81E1E" },
];
const HARI = 864e5;
const dl = $("#deadline");
const catatan = $("#catatan");
const toInput = (d) => new Date(d.getTime() - d.getTimezoneOffset() * 6e4).toISOString().slice(0, 16);
const fmtTanggal = (d) => d.toLocaleString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" });

function cekDeadline() {
  if (!dl.value) return { ok: false, empty: true, level: 0 };
  const d = new Date(dl.value);
  const hari = (d.getTime() - Date.now()) / HARI;
  if (!(hari > 0)) return { ok: false, level: 0, msg: "Deadline sudah lewat. Pilih tanggal yang akan datang." };
  const level = hari > 7 ? 0 : hari >= 3 ? 1 : 2;
  if (menu.noRush && level > 0) return { ok: false, level: 0, msg: `${menu.label} tidak dapat inrush. Pilih deadline lebih dari 7 hari dari sekarang.` };
  return { ok: true, d, hari, level };
}

const chili = $("#chili");
const totalEl = $("#billTotal");
const fieldsEl = $("#menuFields");
let menu = MENUS[0];
let state = {};

function defaults(m) {
  const s = {};
  m.fields.forEach((f) => {
    if (f.type === "count") s[f.id] = f.start ?? f.min;
    if (f.type === "check") s[f.id] = false;
    if (f.type === "radio") s[f.id] = f.start ?? f.options[0].v;
    if (f.type === "budget") s[f.id] = "";
  });
  return s;
}

function visible(f, s) { return !f.when || f.when(s); }

function cost(f, s) {
  switch (f.type) {
    case "range": return [f.min, f.max];
    case "req": return [f.price, f.price];
    case "count": { const c = Math.max(0, s[f.id] - f.free) * f.price; return [c, c]; }
    case "check": return s[f.id] ? [f.price ?? f.min, f.price ?? f.max] : [0, 0];
    case "radio": { const o = f.options.find((x) => x.v === s[f.id]); return [o.min || 0, o.max ?? o.min ?? 0]; }
    default: return [0, 0];
  }
}

function totalOf(m, s) {
  let lo = 0, hi = 0;
  m.fields.forEach((f) => {
    if (!visible(f, s)) return;
    const [a, b] = cost(f, s);
    lo += a; hi += b;
  });
  const bf = m.fields.find((f) => f.type === "budget");
  if (bf) {
    const b = +s[bf.id];
    if (b && b >= lo) return [b, b];
  }
  return [lo, hi];
}

const pick = $("#menuPick");
MENUS.forEach((m, i) => {
  const [lo] = totalOf(m, defaults(m));
  pick.insertAdjacentHTML("beforeend",
    `<label class="opt"><input type="radio" name="menu" value="${m.id}" ${i === 0 ? "checked" : ""}><span><b>${m.label}</b><small>mulai ${rupiah(lo)}</small></span></label>`);
});
pick.addEventListener("change", (e) => pilihMenu(e.target.value));

function pilihMenu(id) {
  menu = MENUS.find((m) => m.id === id);
  state = defaults(menu);
  $(`input[name="menu"][value="${id}"]`).checked = true;
  renderFields();
  $("#menuNotes ol").innerHTML = menu.notes.map((t) => `<li>${t}</li>`).join("");
  dl.min = toInput(new Date(Date.now() + (menu.noRush ? 7 * HARI + 6e4 : 6e4)));
  hitung();
}

function renderFields() {
  fieldsEl.innerHTML = "";
  menu.fields.forEach((f, i) => {
    const el = document.createElement("div");
    el.className = "field f-" + f.type;
    el.dataset.i = i;
    const hint = f.hint ? `<small>${f.hint}</small>` : "";

    if (f.type === "range") {
      el.innerHTML = `<span class="field-name"><b>${f.name}</b>${hint}</span><span class="field-price">${rpRange([f.min, f.max])}</span>`;
    }
    if (f.type === "req") {
      el.innerHTML = `<span class="field-name"><b>${f.name}</b><em>wajib</em></span><span class="field-price">${rupiah(f.price)}</span>`;
    }
    if (f.type === "count") {
      el.innerHTML = `<span class="field-name"><b>${f.name}</b>${hint}</span>
        <span class="stepper sm">
          <button type="button" data-step="-1" aria-label="Kurangi ${f.unit}">−</button>
          <output>${state[f.id]}</output>
          <button type="button" data-step="1" aria-label="Tambah ${f.unit}">+</button>
          <span class="stepper-unit">${f.unit}</span>
        </span>`;
      el.addEventListener("click", (e) => {
        const btn = e.target.closest("[data-step]");
        if (!btn) return;
        state[f.id] = Math.min(99, Math.max(f.min, state[f.id] + +btn.dataset.step));
        $("output", el).textContent = state[f.id];
        hitung();
      });
    }
    if (f.type === "check") {
      el.innerHTML = `<label class="check-row"><input type="checkbox"><span class="field-name"><b>${f.name}</b><small>tambahan</small></span><span class="field-price">+ ${rpRange([f.price ?? f.min, f.price ?? f.max])}</span></label>`;
      $("input", el).addEventListener("change", (e) => { state[f.id] = e.target.checked; hitung(); });
    }
    if (f.type === "radio") {
      el.innerHTML = `<span class="field-name"><b>${f.name}</b>${hint}</span>
        <div class="seg" role="radiogroup" aria-label="${f.name}">
          ${f.options.map((o) => `<label><input type="radio" name="r-${f.id}" value="${o.v}" ${o.v === state[f.id] ? "checked" : ""}><span>${o.label}${o.min ? `<small>${rpRange([o.min, o.max ?? o.min])}</small>` : ""}</span></label>`).join("")}
        </div>`;
      el.addEventListener("change", (e) => { state[f.id] = e.target.value; hitung(); });
    }
    if (f.type === "budget") {
      el.innerHTML = `<label class="budget"><span class="field-name"><b>${f.name}</b><small id="budgetHint"></small></span>
        <span class="budget-input">Rp <input type="number" inputmode="numeric" min="0" step="1000" placeholder="contoh 25000"></span></label>`;
      $("input", el).addEventListener("input", (e) => { state[f.id] = e.target.value; hitung(); });
    }
    fieldsEl.appendChild(el);
  });
}

let lastLevel = -1;
function hitung() {
  const s = state;
  const lines = [];
  let extras = 0;

  menu.fields.forEach((f, i) => {
    const el = fieldsEl.querySelector(`[data-i="${i}"]`);
    const show = visible(f, s);
    el.hidden = !show;
    if (!show) return;
    const c = cost(f, s);
    if (f.type === "check") el.classList.toggle("on", s[f.id]);
    if (f.type === "count" && s[f.id] > Math.max(f.free, f.start ?? f.min)) extras++;
    if ((f.type === "check" && s[f.id]) || (f.type === "radio" && c[0] > 0 && i > 0)) extras++;

    if (f.type === "range") lines.push([f.name, rpRange(c)]);
    if (f.type === "req") lines.push([`${f.name} (wajib)`, rpRange(c)]);
    if (f.type === "count" && s[f.id] > 0) {
      const freeTxt = f.free ? ` (${Math.min(f.free, s[f.id])} gratis)` : "";
      lines.push([`${f.name} × ${s[f.id]} ${f.unit}${freeTxt}`, c[0] ? rupiah(c[0]) : "gratis"]);
    }
    if (f.type === "check" && s[f.id]) lines.push([f.name, rpRange(c)]);
    if (f.type === "radio") {
      const o = f.options.find((x) => x.v === s[f.id]);
      if (c[0] > 0) lines.push([`${f.name}: ${o.label}`, rpRange(c)]);
      else if (!o.min && o.v !== "none") lines.push([f.name, o.label]);
    }
  });

  const bf = menu.fields.find((f) => f.type === "budget");
  let budgetNote = "";
  if (bf) {
    const start = cost(menu.fields.find((f) => f.id === bf.ref), s)[0];
    const b = +s[bf.id];
    $("#budgetHint").textContent = `Minimal ${rupiah(start)}`;
    if (s[bf.id] !== "" && b < start) budgetNote = `Budget minimal ${rupiah(start)} untuk jenis ini.`;
    else if (b >= start) lines.push(["Budget", rupiah(b)]);
  }

  const dlc = cekDeadline();
  const tier = RUSH[dlc.level];
  const info = $("#deadlineInfo");
  if (dlc.empty) {
    info.textContent = menu.noRush
      ? `Pilih tanggal dan jam deadline. ${menu.label} minimal lebih dari 7 hari dari sekarang.`
      : "Pilih tanggal dan jam deadline.";
  } else if (!dlc.ok) {
    info.textContent = dlc.msg;
  } else {
    const hariBulat = Math.floor(dlc.hari + 2 / 1440);
    const sisa = hariBulat < 1 ? "kurang dari 1 hari lagi" : `${hariBulat} hari lagi`;
    info.textContent = `${tier.label}, ${sisa}. ${tier.note}`;
    lines.push(["Deadline", fmtTanggal(dlc.d)]);
    lines.push(["Kecepatan", tier.label]);
  }
  info.classList.toggle("warn", !dlc.ok && !dlc.empty);
  $$("#rushScale span").forEach((sp) => sp.classList.toggle("on", dlc.ok && +sp.dataset.level === dlc.level));
  $("#broth").setAttribute("fill", tier.broth);
  if (dlc.level !== lastLevel) {
    chili.innerHTML = chiliPaths(dlc.level);
    lastLevel = dlc.level;
  }

  const total = totalOf(menu, s);
  $("#billLines").innerHTML = lines.map(([n, v]) => `<div class="bill-row"><span>${n}</span><span>${v}</span></div>`).join("");
  $("#bowlText").textContent = menu.short || menu.label;
  $("#billNote").textContent = budgetNote ||
    ((total[0] !== total[1] ? "Harga final ditentukan admin sesuai tingkat kesulitan." : "Harga sudah sesuai price list.") +
     (dlc.ok && dlc.level > 0 ? " Belum termasuk biaya inrush." : ""));
  $("#billNote").classList.toggle("warn", !!budgetNote);

  [0, 1, 2, 3].forEach((k) => $("#t-" + k).classList.toggle("on", k < extras));

  const txt = total[0] === 0 && total[1] === 0 ? "Pilih isinya dulu" : rpRange(total);
  if (totalEl.textContent !== txt) {
    totalEl.textContent = txt;
    totalEl.classList.remove("bump");
    void totalEl.offsetWidth;
    totalEl.classList.add("bump");
  }
  return { lines, total, dlc };
}

function chiliPaths(level) {
  const spots = [[70, 100], [230, 104], [176, 92], [120, 96], [210, 118], [86, 120], [150, 124], [252, 112], [60, 110]];
  return spots.slice(0, level * 4).map(([x, y], i) =>
    `<path d="M${x} ${y}c4-6 12-6 14 0-2 5-10 7-14 0z" fill="${i % 2 ? "#9E1711" : "#E8251B"}" style="animation-delay:${i * 40}ms"/>`
  ).join("");
}

dl.addEventListener("input", hitung);
dl.addEventListener("change", hitung);
pilihMenu(MENUS[0].id);

$("#orderBtn").addEventListener("click", () => {
  const o = hitung();
  if (o.total[0] === 0 && o.total[1] === 0) {
    toast("Pilih minimal satu isi dulu ya");
    return;
  }
  if (!o.dlc.ok) {
    toast(o.dlc.empty ? "Pilih deadline dulu ya" : o.dlc.msg);
    dl.focus();
    return;
  }
  const cat = catatan.value.trim();
  openPicker(
    `Halo Warung Ramyeon! Saya mau pesan ${menu.label}:\n` +
    o.lines.map(([n, v]) => `• ${n}: ${v}`).join("\n") +
    (cat ? `\n• Catatan: ${cat}` : "") +
    `\nPerkiraan total: ${rpRange(o.total)}${o.dlc.level > 0 ? " + biaya inrush" : ""}`
  );
});

const ruleTabs = $$(".rule-tab");
function pilihTab(tab) {
  ruleTabs.forEach((t) => {
    const on = t === tab;
    t.classList.toggle("active", on);
    t.setAttribute("aria-selected", on);
    t.tabIndex = on ? 0 : -1;
    document.getElementById(t.getAttribute("aria-controls")).hidden = !on;
  });
}
ruleTabs.forEach((t, i) => {
  t.addEventListener("click", () => pilihTab(t));
  t.addEventListener("keydown", (e) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    const next = ruleTabs[(i + (e.key === "ArrowRight" ? 1 : ruleTabs.length - 1)) % ruleTabs.length];
    pilihTab(next);
    next.focus();
  });
});

$("#copyFormat").addEventListener("click", async () => {
  const ok = await salin($("#formatText").textContent);
  toast(ok ? "Format order disalin. Isi lalu kirim ke admin" : "Gagal menyalin. Tekan lama teksnya untuk menyalin manual");
});

const reviews = [
  { name: "Qiaaa", user: "zyqing24", order: "CCL", quote: "DEMI GACOR BGT, EDITANNYA BAHKAN KELAR GANYAMPE 5 JAM😭🖐️✨ MANA BGS BGT LG CCLNYA. KEREN BGT KAK, AK BANGGA PADA EDITORNYA, MAKASI BANYAK SUDAH MENYELAMATKAN HIDUPKU HARI INI😭🖐️✨ WORTH IT BGT INI GED. 10000/100!!!!", tilt: "-1.5deg" },
  { name: "Primrose", user: "KWiONG", order: "MVL", quote: "♾️♾️♾️♾️/10 😭🔥 bener-bener puas banget sama hasilnya! Editannya rapi, detailnya niat, dan hasil akhirnya cakep parah sampai di luar ekspektasi aku. Proses pengerjaannya juga cepet banget, adminnya ramah dan enak diajak komunikasi. Yang paling penting, kualitas yang dikasih bener-bener sebanding sama harganya jadi worth it banget buat di-order. TRUSTED DAN RECOMMENDED parah sih, fix bakal order lagi lain waktu 🤤🤤💓💓💓", tilt: "1deg" },
  { name: "Lioren", user: "bubbleaholic", order: "CCL", quote: "100000/10! Adminnya ramah dan responsif banget, hasil + kualitasnya mantappp dan pengerjaannya pun cepet ❤️🔥 WORTH IT DAH POKOKNYAAAA", tilt: "-0.5deg" },
  { name: "Ayya", user: "gemifourth", order: "MVL", quote: "INI SIH 1000000000/10 PENGERJAAN NYA CEPET DAN ADMIN RAMAH BANGET. KUALITASNYA GA KALENG KALENG, ALIS BAGUS BANGETT PWISS 🤯🤯🤯🤯🤯🤯🤯🤯🤯 harganya sesuai banget sih ini sama kualitas. ini bakal jadi toko langganan sih, worth ih banget. sehat sehat admin !! aku harap store nya makin ramai dilirik orang hshshs 💓💓💓💓", tilt: "1.5deg" },
  { name: "Clar", user: "LeerJieun", order: "MVL", quote: "HEHEHEH ♾♾♾♾♾♾/10 EDITANNYA ALWAYS MEMUASKANNNNN MI NEOMU NEOMU LAIK IT DEMIK, TERUS YA LANGGANAN DISINI TUH BEUH KENIKMATAN SURGAWI SOALNYA SAT SET WAR WER WOR EHEHHEH LAIK LAIK, THE RILL ADA HARGA ADA KUALITAS. REKOMEN BANGET BUAT REPEAT ORDER. AKU AJA KETAGIHAN REPEAT ORDER MASA YANG LAIN ENGGA?", tilt: "-1deg" },
  { name: "Celenara", user: "celenara", order: "Rapch", quote: "♾/10!!!!! ADMINNYA SABAR, BAIK, RAMAH, BISA JADI BESTIE POKOKNYA, keren banget cuyyyy kakaknya bener bener ngejelasin gini gitunya, pokoknya bakal, pasti balik lagi ke sini, kalau bisa reapet order tiap hari mauuu CINTA ADMIN, 💗💗💗💗💗", tilt: "0.8deg" },
];

const track = $("#receiptTrack");
const dots = $("#reviewDots");
let rIdx = 0;

reviews.forEach((r, i) => {
  const el = document.createElement("article");
  el.className = "receipt";
  el.style.setProperty("--tilt", r.tilt);
  el.innerHTML = `
    <div class="receipt-head"><b>Warung Ramyeon</b><small>Struk no. ${String(1024 + i * 37).padStart(5, "0")}</small></div>
    <div class="receipt-line"><span>Pesanan</span><span>${r.order}</span></div>
    <div class="receipt-line"><span>Rasa</span><span class="stars" aria-label="5 dari 5 bintang">★★★★★</span></div>
    <q>${r.quote}</q>
    <div class="receipt-foot">${r.name}<small>@${r.user}</small></div>`;
  track.appendChild(el);

  const d = document.createElement("button");
  d.setAttribute("aria-label", `Testimoni ${i + 1}`);
  d.addEventListener("click", () => goReview(i));
  dots.appendChild(d);
});

function stepWidth() {
  return $(".receipt", track).offsetWidth + 24;
}
function maxIdx() {
  const perView = Math.max(1, Math.floor(($("#receipts").offsetWidth + 24) / stepWidth()));
  return Math.max(0, reviews.length - perView);
}
function goReview(i) {
  const max = maxIdx();
  rIdx = Math.max(0, Math.min(i, max));
  track.style.transform = `translateX(-${rIdx * stepWidth()}px)`;
  $$("button", dots).forEach((d, j) => {
    d.classList.toggle("active", j === rIdx);
    d.style.display = j > max ? "none" : "";
  });
}
$("#prevReview").addEventListener("click", () => goReview(rIdx - 1));
$("#nextReview").addEventListener("click", () => goReview(rIdx >= maxIdx() ? 0 : rIdx + 1));
window.addEventListener("resize", () => goReview(rIdx));
goReview(0);

let touchX = null;
track.addEventListener("touchstart", (e) => (touchX = e.touches[0].clientX), { passive: true });
track.addEventListener("touchend", (e) => {
  if (touchX === null) return;
  const dx = e.changedTouches[0].clientX - touchX;
  if (Math.abs(dx) > 40) goReview(rIdx + (dx < 0 ? 1 : -1));
  touchX = null;
});

const TESTIMONI = [
  { img: "testi/testi1.jpg", ket: "" },
  { img: "testi/testi2.jpg", ket: "" },
  { img: "testi/testi3.jpg", ket: "" },
  { img: "testi/testi4.jpg", ket: "" },
  { img: "testi/testi5.jpg", ket: "" },
  { img: "testi/testi6.jpg", ket: "" },
  { img: "testi/testi7.jpg", ket: "" },
  { img: "testi/testi8.jpg", ket: "" },
];

const ORNAMENTS = [
  { k: "ball", x: 182, y: 140, c: "#D7261E" },
  { k: "ball", x: 230, y: 116, c: "#FFC23D" },
  { k: "ball", x: 150, y: 238, c: "#FF7A1A" },
  { k: "ball", x: 214, y: 212, c: "#FFFDF8" },
  { k: "ball", x: 258, y: 254, c: "#D7261E" },
  { k: "ball", x: 128, y: 350, c: "#FFC23D" },
  { k: "ball", x: 205, y: 318, c: "#D7261E" },
  { k: "ball", x: 276, y: 366, c: "#FF7A1A" },
  { k: "bulb", x: 205, y: 163, c: "#FFC23D" },
  { k: "bulb", x: 148, y: 276, c: "#FF7A1A" },
  { k: "bulb", x: 252, y: 266, c: "#FFC23D" },
  { k: "bulb", x: 112, y: 392, c: "#D7261E" },
  { k: "bulb", x: 200, y: 403, c: "#FFC23D" },
  { k: "bulb", x: 290, y: 376, c: "#FF7A1A" },
];

const treeEl = $("#tree");
const panel = $("#testiPanel");
const dibuka = new Set();
let testiNow = -1;

function pop() {
  panel.classList.remove("pop");
  void panel.offsetWidth;
  panel.classList.add("pop");
}

function tampilkanTesti(i) {
  const t = TESTIMONI[i];
  testiNow = i;
  dibuka.add(i);
  panel.innerHTML = `<figure class="testi-shot">
      <img src="${t.img}" alt="Bukti pembayaran ${i + 1}">
      <figcaption>${t.ket || `Bukti pembayaran #${String(i + 1).padStart(2, "0")}`}</figcaption>
    </figure>`;
  $("img", panel).addEventListener("error", () => {
    $("img", panel).replaceWith(Object.assign(document.createElement("div"), {
      className: "testi-missing",
      innerHTML: `<b>Gambar belum diupload</b><span>Taruh file <code>${t.img}</code> di folder website.</span>`,
    }));
  });
  pop();
  $$(".orn", treeEl).forEach((o) => o.classList.toggle("opened", dibuka.has(+o.dataset.r)));
  $("#treeCount").textContent = dibuka.size >= TESTIMONI.length
    ? "Semua bukti pembayaran sudah kamu lihat. Terima kasih sudah mampir!"
    : `${dibuka.size} dari ${TESTIMONI.length} bukti pembayaran sudah dilihat.`;
}

ORNAMENTS.forEach((o, i) => {
  const r = i % TESTIMONI.length;
  const b = document.createElement("button");
  b.type = "button";
  b.className = `orn ${o.k}`;
  b.dataset.r = r;
  b.style.left = (o.x / 400 * 100) + "%";
  b.style.top = (o.y / 480 * 100) + "%";
  b.style.setProperty("--c", o.c);
  b.style.setProperty("--d", (i * 0.37 % 2).toFixed(2) + "s");
  b.setAttribute("aria-label", `Lihat bukti pembayaran ${r + 1}`);
  b.addEventListener("click", () => {
    b.classList.remove("hit");
    void b.offsetWidth;
    b.classList.add("hit");
    tampilkanTesti(r);
  });
  treeEl.appendChild(b);
});

const star = document.createElement("button");
star.type = "button";
star.className = "tree-star";
star.setAttribute("aria-label", "Lihat bukti pembayaran acak");
star.addEventListener("click", () => {
  let r;
  do { r = Math.floor(Math.random() * TESTIMONI.length); } while (TESTIMONI.length > 1 && r === testiNow);
  star.classList.remove("hit");
  void star.offsetWidth;
  star.classList.add("hit");
  tampilkanTesti(r);
});
treeEl.appendChild(star);
$("#treeCount").textContent = `${TESTIMONI.length} bukti pembayaran tersimpan di pohon ini.`;

$$(".faq details").forEach((d) =>
  d.addEventListener("toggle", () => {
    if (d.open) $$(".faq details").forEach((o) => o !== d && (o.open = false));
  })
);

$("#year").textContent = new Date().getFullYear();

(() => {
  const q = (s, el = document) => el.querySelector(s);
  const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function targetNatal(now) {
    const y = now.getFullYear();
    const natal = new Date(`${y}-12-25T00:00:00+07:00`);
    const habis = new Date(`${y}-12-26T00:00:00+07:00`);
    if (now >= habis) return { natal: new Date(`${y + 1}-12-25T00:00:00+07:00`), hariH: false };
    return { natal, hariH: now >= natal };
  }

  const tiles = q("#xmasTiles");
  const title = q("#xmasTitle");
  const sub = q("#xmasSub");
  const pad = (n) => String(n).padStart(2, "0");
  const last = {};

  function setTile(unit, value) {
    if (last[unit] === value) return;
    last[unit] = value;
    const b = q(`[data-u="${unit}"]`, tiles);
    b.textContent = value;
    if (!calm) {
      b.classList.remove("tick");
      void b.offsetWidth;
      b.classList.add("tick");
    }
  }

  function tick() {
    const now = new Date();
    const { natal, hariH } = targetNatal(now);
    if (hariH) {
      title.textContent = "Selamat Natal!";
      sub.textContent = "Selamat Natal dari Warung Ramyeon. Semoga harimu sehangat semangkuk ramyeon.";
      tiles.hidden = true;
      return;
    }
    tiles.hidden = false;
    title.textContent = `Menuju Natal ${natal.getFullYear()}`;
    const diff = natal - now;
    setTile("d", pad(Math.floor(diff / 864e5)));
    setTile("h", pad(Math.floor(diff / 36e5) % 24));
    setTile("m", pad(Math.floor(diff / 6e4) % 60));
    setTile("s", pad(Math.floor(diff / 1e3) % 60));
    tiles.setAttribute("aria-label",
      `${Math.floor(diff / 864e5)} hari, ${Math.floor(diff / 36e5) % 24} jam, ${Math.floor(diff / 6e4) % 60} menit lagi menuju Natal`);
  }
  tick();
  setInterval(tick, 1000);

  const ISI_KADO = [
    "Hohoho! Terima kasih sudah mampir ke Warung Ramyeon.",
    "Semoga Natalmu sehangat semangkuk ramyeon yang baru matang.",
    "Kado kecil dari dapur: kursor Santa itu gratis, hehe.",
    "Kirim referensi yang jelas, biar masakannya pas di lidah.",
    "Menjelang Natal dapur makin ramai. Pesan lebih awal biar nggak kena inrush.",
    "Selamat Natal dari @jRami dan @lkimbora!",
    "Semoga tahun depan kontenmu makin rame, kayak warung kami pas jam makan.",
  ];

  const stage = q("#giftStage");
  const gift = q("#gift");
  const card = q("#giftCard");
  const msg = q("#giftMsg");
  const hint = q("#giftHint");
  let urutan = [];
  let terbuka = false;

  function ambilIsi() {
    if (!urutan.length) urutan = [...ISI_KADO.keys()].sort(() => Math.random() - 0.5);
    return ISI_KADO[urutan.pop()];
  }

  function confetti() {
    if (calm) return;
    const warna = ["#D7261E", "#FFC23D", "#FF7A1A", "#2E7D4F", "#FFFDF8"];
    for (let i = 0; i < 28; i++) {
      const c = document.createElement("i");
      c.className = "confetti";
      const sudut = (Math.random() * 160 + 10) * Math.PI / 180;
      const jarak = 90 + Math.random() * 120;
      c.style.setProperty("--x", `${Math.cos(sudut) * jarak * (Math.random() < 0.5 ? -1 : 1)}px`);
      c.style.setProperty("--y", `${-Math.sin(sudut) * jarak}px`);
      c.style.setProperty("--r", `${Math.random() * 720 - 360}deg`);
      c.style.background = warna[i % warna.length];
      stage.appendChild(c);
      setTimeout(() => c.remove(), 1300);
    }
  }

  function buka() {
    msg.textContent = ambilIsi();
    stage.classList.add("open");
    terbuka = true;
    gift.setAttribute("aria-label", "Tutup kado");
    hint.textContent = "Pencet kadonya untuk menutup";
    confetti();
  }
  function tutup() {
    stage.classList.remove("open");
    terbuka = false;
    gift.setAttribute("aria-label", "Buka kado Natal");
    hint.textContent = "Pencet kadonya";
  }

  gift.addEventListener("click", () => (terbuka ? tutup() : buka()));
  q("#giftAgain").addEventListener("click", () => {
    card.classList.remove("swap");
    void card.offsetWidth;
    card.classList.add("swap");
    msg.textContent = ambilIsi();
    confetti();
  });
})();

const daftarForm = $("#daftarForm");
const memberCard = $("#member");

const kotaSelect = $("#fKota");
const cariKota = $("#fCariKota");
const hobiLain = $("#fHobiLain");
const hobiLainWrap = $("#hobiLainWrap");
const cekLainnya = $("#hLainnya");
const JUMLAH_WILAYAH = $$("option", kotaSelect).filter((o) => o.value && o.parentElement.label && o.parentElement.label !== "Kota pilihan").length;

function hobiTerpilih() {
  return $$('input[name="hobi"]:checked', daftarForm)
    .map((c) => (c === cekLainnya ? hobiLain.value.trim() : c.value))
    .filter(Boolean);
}

function kotaTerpilih() {
  const opt = kotaSelect.selectedOptions[0];
  if (!opt || !opt.value) return "";
  const grup = opt.parentElement.label;
  return grup && grup !== "Kota pilihan" ? `${opt.value}, ${grup}` : opt.value;
}

cariKota.addEventListener("input", () => {
  const q = cariKota.value.trim().toLowerCase();
  let cocok = 0;
  let pertama = null;
  $$("optgroup", kotaSelect).forEach((grup) => {
    let ada = false;
    $$("option", grup).forEach((o) => {
      const tampil = !q || o.value.toLowerCase().includes(q) || grup.label.toLowerCase().includes(q);
      o.hidden = !tampil;
      if (tampil) {
        ada = true;
        if (grup.label !== "Kota pilihan") { cocok++; if (!pertama) pertama = o; }
      }
    });
    grup.hidden = !ada;
  });
  $("#kotaInfo").textContent = q
    ? (cocok ? `${cocok} kabupaten/kota cocok dengan "${cariKota.value.trim()}". Pilih di daftar sebelah.` : `Tidak ada kabupaten/kota yang cocok dengan "${cariKota.value.trim()}".`)
    : `${JUMLAH_WILAYAH} kabupaten/kota dari 38 provinsi di Indonesia.`;
  if (q && cocok === 1) { pertama.selected = true; perbaruiKartu(); }
});
cariKota.addEventListener("keydown", (e) => {
  if (e.key !== "Enter") return;
  e.preventDefault();
  const pertama = $$("option", kotaSelect).find((o) => o.value && !o.hidden && o.parentElement.label !== "Kota pilihan");
  if (pertama) { pertama.selected = true; perbaruiKartu(); kotaSelect.focus(); }
});

cekLainnya.addEventListener("change", () => {
  hobiLainWrap.hidden = !cekLainnya.checked;
  hobiLain.required = cekLainnya.checked;
  if (cekLainnya.checked) hobiLain.focus();
  else hobiLain.value = "";
});

function perbaruiKartu() {
  const nama = $("#fNama").value.trim();
  const alamat = $("#fAlamat").value.trim();
  const kota = kotaTerpilih();
  const hobi = hobiTerpilih();

  $("#mNama").textContent = nama || "Nama kamu";
  $("#mInisial").textContent = nama ? nama[0].toUpperCase() : "?";
  $("#mKota").textContent = kota || "Kota belum dipilih";
  $("#mAlamat").textContent = alamat || "Alamat belum diisi";
  $("#mHobi").innerHTML = hobi.length
    ? hobi.map((h) => `<span class="member-chip">${h}</span>`).join("")
    : '<span class="member-chip kosong">Belum ada hobi</span>';
  memberCard.classList.toggle("terisi", !!(nama || alamat || kota || hobi.length));
}

daftarForm.addEventListener("input", () => {
  memberCard.classList.remove("terdaftar");
  perbaruiKartu();
});
daftarForm.addEventListener("change", perbaruiKartu);

daftarForm.addEventListener("submit", (e) => {
  e.preventDefault();
  daftarForm.classList.add("was-validated");
  if (!daftarForm.checkValidity()) {
    const kosong = daftarForm.querySelector("input:invalid, select:invalid, textarea:invalid");
    if (kosong) kosong.focus();
    toast("Masih ada data yang kosong. Cek kolom yang berwarna merah.");
    return;
  }
  const nomor = "WR-" + new Date().getFullYear() + "-" + String(Math.floor(Math.random() * 9000) + 1000);
  $("#mNo").textContent = nomor;
  memberCard.classList.remove("terdaftar");
  void memberCard.offsetWidth;
  memberCard.classList.add("terdaftar");
  toast(`Terima kasih, ${$("#fNama").value.trim()}! Kamu terdaftar dengan nomor ${nomor}.`);
});

daftarForm.addEventListener("reset", () => {
  daftarForm.classList.remove("was-validated");
  hobiLainWrap.hidden = true;
  hobiLain.required = false;
  setTimeout(() => cariKota.dispatchEvent(new Event("input")));
  memberCard.classList.remove("terdaftar");
  $("#mNo").textContent = "WR-????";
  setTimeout(perbaruiKartu);
});

