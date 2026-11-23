/* Copied from the Genesis OS repo (v2/hawk-core.js). Refresh with node tools/sync-os.mjs <repo>. */
/* HawkCore: Genesis gold port of the MCC 2D neural core.
   Source was copied read-only from MCC core.js. MCC itself is not edited.
   Particles use the Genesis gold palette. The official header mark
   (/genesis-mark.svg?v=brand6) is mounted in the center by HawkCore.attach.
   States: idle | listening | speaking | working. */
(() => {
"use strict";
const TAU = Math.PI * 2;
function fib(n) { // even points on a sphere
  const pts = [], g = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < n; i++) { const y = 1 - (i / (n - 1)) * 2, r = Math.sqrt(1 - y * y), t = g * i; pts.push([Math.cos(t) * r, y, Math.sin(t) * r]); }
  return pts;
}

const MARK_SRC = "/genesis-mark.svg?v=brand6";
function mountMark(host) {
  if (!host) return null;
  var img = host.querySelector(".hawk-core-mark");
  if (img) return img;
  img = document.createElement("img");
  img.className = "hawk-core-mark";
  img.src = MARK_SRC;
  img.alt = "";
  img.setAttribute("aria-hidden", "true");
  img.decoding = "async";
  img.draggable = false;
  host.appendChild(img);
  return img;
}
function bindHost(core, host) {
  if (!core || !host) return core;
  core.host = host;
  core.mark = host.querySelector(".hawk-core-mark");
  var setState = core.setState.bind(core);
  core.setState = function (s) {
    setState(s);
    host.setAttribute("data-state", core.state || "idle");
  };
  var setLevel = core.setLevel.bind(core);
  core.setLevel = function (v) {
    setLevel(v);
    host.style.setProperty("--hawk-core-level", String(core.level || 0));
  };
  host.setAttribute("data-state", core.state || "idle");
  return core;
}
function attachCore(host, opts) {
  if (!host) return null;
  host.classList.add("hawk-core");
  var canvas = host.querySelector("canvas.hawk-core-canvas");
  if (!canvas) {
    canvas = document.createElement("canvas");
    canvas.className = "hawk-core-canvas";
    canvas.setAttribute("aria-hidden", "true");
    host.insertBefore(canvas, host.firstChild);
  }
  mountMark(host);
  return bindHost(new HawkCore(canvas, opts || {}), host);
}

class HawkCore {
  constructor(canvas, opts = {}) {
    this.c = canvas; this.x = canvas.getContext("2d", {alpha: true});
    this.n = opts.points || 260; this.state = "idle"; this.level = 0; this.pulse = 0; this.t = 0; this.rot = 0;
    this.reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    this.pts = fib(this.n).map(p => ({b: p, j: Math.random() * TAU, s: .6 + Math.random() * .8}));
    this.edges = [];
    const th = opts.link || .32;
    for (let i = 0; i < this.n; i++) for (let k = i + 1; k < this.n; k++) {
      const a = this.pts[i].b, b = this.pts[k].b, d = Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
      if (d < th && Math.random() < .55) this.edges.push([i, k, d / th]);
    }
    this.sparks = []; this.proj = new Float32Array(this.n * 3);
    this.resize(); this._ro = new ResizeObserver(() => this.resize()); this._ro.observe(canvas);
    this.visible = true;
    this._io = new IntersectionObserver(e => { this.visible = e[0].isIntersecting; if (this.visible) this.kick(); }); this._io.observe(canvas);
    document.addEventListener("visibilitychange", () => this.kick());
    this.last = performance.now(); this.kick();
  }
  resize() {
    const r = this.c.getBoundingClientRect(), d = Math.min(devicePixelRatio || 1, 2);
    this.w = Math.max(1, r.width); this.h = Math.max(1, r.height);
    this.c.width = Math.round(this.w * d); this.c.height = Math.round(this.h * d); this.x.setTransform(d, 0, 0, d, 0, 0);
    if (this.reduced) this.frame(performance.now(), true);
  }
  setState(s) { this.state = s; this.kick(); }
  setLevel(v) { this.level = Math.max(0, Math.min(1, v)); }
  beat(v = 1) { this.pulse = Math.min(1.4, this.pulse + v); if (this.sparks.length < 24) for (let i = 0; i < 3; i++) this.sparks.push({e: (Math.random() * this.edges.length) | 0, p: 0, v: .015 + Math.random() * .02}); }
  kick() { if (!this.raf && !document.hidden && this.visible) this.raf = requestAnimationFrame(t => this.loop(t)); }
  loop(now) {
    this.raf = null;
    if (document.hidden || !this.visible) return;
    this.frame(now);
    if (!this.reduced) this.kick();
  }
  frame(now, still) {
    const dt = Math.min(.05, (now - this.last) / 1000); this.last = now;
    const S = this.state, x = this.x, w = this.w, h = this.h;
    const speed = {idle: .08, listening: .14, speaking: .12, working: .55}[S] || .08;
    if (!still && !this.reduced) { this.t += dt; this.rot += dt * speed; }
    this.pulse *= Math.pow(.04, dt);
    if (S === "speaking" && !this.reduced && Math.random() < dt * 3) this.beat(.25);   // syllable-like shimmer
    if (S === "working" && Math.random() < dt * 6) this.beat(.15);
    const breath = this.reduced ? 0 : Math.sin(this.t * (S === "idle" ? .9 : 1.6)) * .5 + .5;
    const lvl = S === "listening" ? this.level : 0;
    const R = Math.min(w, h) * .36 * (1 + breath * .025 + this.pulse * .05 + lvl * .1);
    const cx = w / 2, cy = h / 2, cr = Math.cos(this.rot), sr = Math.sin(this.rot), tilt = .38, ct = Math.cos(tilt), st = Math.sin(tilt);
    x.clearRect(0, 0, w, h);
    // halo
    const g = x.createRadialGradient(cx, cy, R * .2, cx, cy, R * 1.6);
    g.addColorStop(0, `rgba(201,161,87,${.05 + this.pulse * .05 + lvl * .08})`); g.addColorStop(1, "rgba(201,161,87,0)");
    x.fillStyle = g; x.fillRect(0, 0, w, h);
    // project
    const P = this.proj, wob = this.reduced ? 0 : .018 + lvl * .06 + this.pulse * .03;
    for (let i = 0; i < this.n; i++) {
      const p = this.pts[i], k = 1 + Math.sin(this.t * 1.3 * p.s + p.j) * wob;
      let [a, b, c] = p.b; a *= k; b *= k; c *= k;
      const x1 = a * cr - c * sr, z1 = a * sr + c * cr, y2 = b * ct - z1 * st, z2 = b * st + z1 * ct;
      const f = 2.6 / (2.6 + z2); P[i * 3] = cx + x1 * R * f; P[i * 3 + 1] = cy + y2 * R * f; P[i * 3 + 2] = z2;
    }
    x.globalCompositeOperation = "lighter"; x.lineWidth = 1;
    const base = .10 + this.pulse * .12 + lvl * .15;
    for (const [i, k, d] of this.edges) {
      const z = (P[i * 3 + 2] + P[k * 3 + 2]) * .5, a = base * (1 - d * .6) * (.35 + (1 - (z + 1) / 2) * .65);
      if (a < .015) continue;
      x.strokeStyle = `rgba(201,161,87,${a.toFixed(3)})`;
      x.beginPath(); x.moveTo(P[i * 3], P[i * 3 + 1]); x.lineTo(P[k * 3], P[k * 3 + 1]); x.stroke();
    }
    for (let i = 0; i < this.n; i++) {
      const z = P[i * 3 + 2], near = 1 - (z + 1) / 2, s = .6 + near * 1.3;
      x.fillStyle = `rgba(${near > .75 ? "241,216,152" : "201,161,87"},${(.25 + near * .65).toFixed(3)})`;
      x.fillRect(P[i * 3] - s / 2, P[i * 3 + 1] - s / 2, s, s);
    }
    // sparks travel along filaments
    for (let j = this.sparks.length - 1; j >= 0; j--) {
      const sp = this.sparks[j], e = this.edges[sp.e]; if (!e) { this.sparks.splice(j, 1); continue; }
      sp.p += sp.v * (dt * 60); if (sp.p >= 1) { this.sparks.splice(j, 1); continue; }
      const [i, k] = e, px = P[i * 3] + (P[k * 3] - P[i * 3]) * sp.p, py = P[i * 3 + 1] + (P[k * 3 + 1] - P[i * 3 + 1]) * sp.p;
      x.fillStyle = "rgba(200,248,255,.9)"; x.beginPath(); x.arc(px, py, 1.4, 0, TAU); x.fill();
    }
    // equator ring + state arc
    x.globalCompositeOperation = "source-over";
    x.strokeStyle = "rgba(255,255,255,.06)"; x.beginPath(); x.ellipse(cx, cy, R * 1.18, R * 1.18 * .28, 0, 0, TAU); x.stroke();
    if (S !== "idle") {
      const a0 = this.t * (S === "working" ? 2.4 : .8);
      x.strokeStyle = `rgba(201,161,87,${S === "listening" ? .35 + lvl * .6 : .45})`; x.lineWidth = 1.5;
      x.beginPath(); x.arc(cx, cy, R * 1.32, a0, a0 + (S === "listening" ? .4 + lvl * 2.4 : S === "speaking" ? 1.1 + this.pulse : .9)); x.stroke();
    }
  }
}
window.HawkCore = HawkCore;
  HawkCore.MARK_SRC = MARK_SRC;
  HawkCore.attach = attachCore;
  HawkCore.mountMark = mountMark;
})();
