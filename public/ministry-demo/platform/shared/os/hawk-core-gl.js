/* Copied from the Genesis OS repo (v2/hawk-core-gl.js). Refresh with node tools/sync-os.mjs <repo>. */
/* HawkCoreGL: Genesis gold port of the MCC WebGL neural core.
   Source was copied read-only from MCC core-gl.js. MCC itself is not edited.
   Same API as HawkCore (setState, setLevel, beat, resize). Falls back to HawkCore
   when WebGL is missing. Palette is gold only. Speaking uses setLevel, not MCCTTS.
   HawkCoreGL.attach also places the official Genesis G mark at the center. */
(() => {
"use strict";
const VS = `
attribute vec3 a_pos; attribute float a_seed;
uniform float u_t, u_amp, u_ripple, u_swirl, u_level, u_pulse, u_rot, u_size, u_gain, u_bright, u_breath, u_flow, u_aspect;
varying float v_a, v_rim, v_hot;
vec3 mod289(vec3 x){return x-floor(x*(1./289.))*289.;}
vec4 mod289(vec4 x){return x-floor(x*(1./289.))*289.;}
vec4 permute(vec4 x){return mod289(((x*34.)+1.)*x);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-.85373472095314*r;}
float snoise(vec3 v){
  const vec2 C=vec2(1./6.,1./3.); const vec4 D=vec4(0.,.5,1.,2.);
  vec3 i=floor(v+dot(v,C.yyy)); vec3 x0=v-i+dot(i,C.xxx);
  vec3 g=step(x0.yzx,x0.xyz); vec3 l=1.-g; vec3 i1=min(g.xyz,l.zxy); vec3 i2=max(g.xyz,l.zxy);
  vec3 x1=x0-i1+C.xxx; vec3 x2=x0-i2+C.yyy; vec3 x3=x0-D.yyy;
  i=mod289(i);
  vec4 p=permute(permute(permute(i.z+vec4(0.,i1.z,i2.z,1.))+i.y+vec4(0.,i1.y,i2.y,1.))+i.x+vec4(0.,i1.x,i2.x,1.));
  float n_=.142857142857; vec3 ns=n_*D.wyz-D.xzx;
  vec4 j=p-49.*floor(p*ns.z*ns.z); vec4 x_=floor(j*ns.z); vec4 y_=floor(j-7.*x_);
  vec4 x=x_*ns.x+ns.yyyy; vec4 y=y_*ns.x+ns.yyyy; vec4 h=1.-abs(x)-abs(y);
  vec4 b0=vec4(x.xy,y.xy); vec4 b1=vec4(x.zw,y.zw);
  vec4 s0=floor(b0)*2.+1.; vec4 s1=floor(b1)*2.+1.; vec4 sh=-step(h,vec4(0.));
  vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy; vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
  vec3 p0=vec3(a0.xy,h.x); vec3 p1=vec3(a0.zw,h.y); vec3 p2=vec3(a1.xy,h.z); vec3 p3=vec3(a1.zw,h.w);
  vec4 nr=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3))); p0*=nr.x; p1*=nr.y; p2*=nr.z; p3*=nr.w;
  vec4 m=max(.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.); m=m*m;
  return 42.*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
}
void main(){
  vec3 n=a_pos; float t=u_t;
  float tw=u_swirl*(n.y*2.4+sin(t*1.1+n.y*3.)*.5);                      // working: latitude twist that orbits
  float c=cos(tw), s=sin(tw); n=vec3(c*n.x-s*n.z,n.y,s*n.x+c*n.z);
  vec3 q=n*1.3+vec3(0.,t*.16,t*.1);
  float d=snoise(q)+snoise(q*2.2+7.3)*.42;
  vec3 fl=vec3(snoise(q+vec3(31.4,0.,0.)),snoise(q+vec3(0.,17.1,0.)),snoise(q+vec3(0.,0.,47.7)));
  fl-=dot(fl,n)*n;                                                        // keep the flow tangential: fluid, not jittery
  float cr=cos(u_rot), sr=sin(u_rot), ct=.93, st=.36;                     // spin + fixed tilt into view space
  vec3 v=vec3(cr*n.x-sr*n.z,n.y,sr*n.x+cr*n.z); v=vec3(v.x,ct*v.y-st*v.z,st*v.y+ct*v.z);
  vec3 f=vec3(cr*fl.x-sr*fl.z,fl.y,sr*fl.x+cr*fl.z); f=vec3(f.x,ct*f.y-st*f.z,st*f.y+ct*f.z);
  float ang=acos(clamp(v.z,-1.,1.));                                      // listening: rings expand from the front
  float rip=sin(ang*8.-t*6.5)*u_ripple*(.025+u_level*.11)*(1.-ang/3.1416);
  float r=1.+u_amp*d+u_breath+u_pulse*.05+rip;
  vec3 p=v*r+f*u_flow;
  float per=3.2/(3.2-p.z); vec2 xy=p.xy*per*.6;
  if(u_aspect>1.) xy.x/=u_aspect; else xy.y*=u_aspect;
  gl_Position=vec4(xy,0.,1.);
  gl_PointSize=u_size*per*(.65+.7*a_seed)*(1.+u_pulse*.25);
  float near=(v.z+1.)*.5;
  v_a=u_gain*u_bright*(.14+.86*near*near)*(.55+.45*a_seed);
  v_rim=pow(1.-abs(v.z),3.)*smoothstep(-.2,.6,v.y-v.x*.4);               // faint gold on the upper rim
  v_hot=clamp(d*u_amp*3.2+u_level*.25,0.,1.);
}`;
const FS = `
precision mediump float;
varying float v_a, v_rim, v_hot;
uniform vec3 u_c1, u_c2;
void main(){
  vec2 p=gl_PointCoord-.5; float d=dot(p,p)*4.;
  if(d>1.) discard;
  float a=(1.-d); a*=a; a*=v_a;
  vec3 col=mix(u_c1,u_c2,v_rim*.6); col=mix(col,vec3(.945,.847,.596),v_hot*.4);
  gl_FragColor=vec4(col*a,a);
}`;
const TARGET = {
  idle:      L => ({amp: .085, ripple: 0, swirl: 0, bright: .82, speed: .10, flow: .045}),
  listening: L => ({amp: .10 + L * .22, ripple: 1, swirl: 0, bright: .95 + L * .5, speed: .14, flow: .06 + L * .05}),
  working:   L => ({amp: .14, ripple: 0, swirl: 1, bright: 1, speed: .55, flow: .09}),
  speaking:  L => ({amp: .10 + L * .42, ripple: 0, swirl: 0, bright: .9 + L * .8, speed: .14, flow: .05 + L * .1}),
};
function fib(n, seedArr) {
  const a = new Float32Array(n * 3), g = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < n; i++) { const y = 1 - (i / (n - 1)) * 2, r = Math.sqrt(1 - y * y), t = g * i; a[i * 3] = Math.cos(t) * r; a[i * 3 + 1] = y; a[i * 3 + 2] = Math.sin(t) * r; seedArr[i] = Math.random(); }
  return a;
}
class HawkCoreGL {
  constructor(canvas, opts = {}) {
    this.c = canvas; this.opts = opts; this.state = "idle"; this.level = 0; this.lv = 0; this.pulse = 0; this.t = 0; this.rot = 0;
    this.reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    this.n = opts.points || ((typeof innerWidth === "number" && innerWidth < 600) ? 3000 : 9000);
    this.cur = {...TARGET.idle(0)};
    if (!this.init()) {                          // no WebGL: hand over to the 2D core on a fresh canvas
      const fresh = canvas.cloneNode(false); canvas.replaceWith(fresh);
      return window.HawkCore ? new window.HawkCore(fresh, {points: opts.fallbackPoints || 260}) : this.stub();
    }
    canvas.addEventListener("webglcontextlost", e => { e.preventDefault(); this.lost = true; cancelAnimationFrame(this.raf); this.raf = null; });
    canvas.addEventListener("webglcontextrestored", () => { this.lost = false; this.init(); this.kick(); });
    this._ro = new ResizeObserver(() => this.resize()); this._ro.observe(canvas);
    this.visible = true;
    this._io = new IntersectionObserver(e => { this.visible = e[e.length - 1].isIntersecting; this.kick(); }); this._io.observe(canvas);
    this._vis = () => { this.last = performance.now(); this.kick(); }; document.addEventListener("visibilitychange", this._vis);
    this.resize(); this.last = performance.now(); this.kick();
  }
  stub() { return {setState() {}, setLevel() {}, beat() {}, resize() {}}; }
  init() {
    const gl = this.c.getContext("webgl", {alpha: true, premultipliedAlpha: true, antialias: false, depth: false, stencil: false, powerPreference: "low-power"});
    if (!gl) return false;
    const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) { console.warn(gl.getShaderInfoLog(s)); return null; } return s; };
    const vs = sh(gl.VERTEX_SHADER, VS), fs = sh(gl.FRAGMENT_SHADER, FS); if (!vs || !fs) return false;
    const pr = gl.createProgram(); gl.attachShader(pr, vs); gl.attachShader(pr, fs); gl.linkProgram(pr);
    if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) { console.warn(gl.getProgramInfoLog(pr)); return false; }
    gl.useProgram(pr);
    const seeds = new Float32Array(this.n), pos = fib(this.n, seeds);
    const bind = (name, data, size) => { const b = gl.createBuffer(), loc = gl.getAttribLocation(pr, name); gl.bindBuffer(gl.ARRAY_BUFFER, b); gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, size, gl.FLOAT, false, 0, 0); };
    bind("a_pos", pos, 3); bind("a_seed", seeds, 1);
    this.u = {}; ["u_t", "u_amp", "u_ripple", "u_swirl", "u_level", "u_pulse", "u_rot", "u_size", "u_gain", "u_bright", "u_breath", "u_flow", "u_aspect", "u_c1", "u_c2"].forEach(k => this.u[k] = gl.getUniformLocation(pr, k));
    gl.uniform3f(this.u.u_c1, .788, .631, .341); gl.uniform3f(this.u.u_c2, .945, .847, .596);   // fill #c9a157, rim #f1d898
    gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, gl.ONE); gl.disable(gl.DEPTH_TEST); gl.clearColor(0, 0, 0, 0);
    this.gl = gl; return true;
  }
  resize() {
    if (!this.gl) return;
    const r = this.c.getBoundingClientRect(), d = Math.min(devicePixelRatio || 1, 2);
    this.w = Math.max(1, r.width); this.h = Math.max(1, r.height); this.dpr = d;
    const W = Math.round(this.w * d), H = Math.round(this.h * d);
    if (this.c.width !== W || this.c.height !== H) { this.c.width = W; this.c.height = H; }
    this.gl.viewport(0, 0, W, H);
    const m = Math.min(this.w, this.h);
    this.size = Math.max(1.2, Math.min(6, m / Math.sqrt(this.n) * 1.3)) * d;
    this.gain = Math.max(.22, Math.min(1, 2400 / this.n)) * (m < 80 ? 1.4 : 1);
    this.frame(performance.now(), true);
  }
  setState(s) { if (TARGET[s]) this.state = s; this.kick(); if (this.reduced) this.frame(performance.now(), true); }
  setLevel(v) { this.level = Math.max(0, Math.min(1, +v || 0)); }
  beat(v = 1) { this.pulse = Math.min(1.4, this.pulse + v * .6); this.kick(); }
  kick() { if (!this.raf && !this.lost && !document.hidden && this.visible && !this.reduced) this.raf = requestAnimationFrame(t => this.loop(t)); }
  loop(now) {
    this.raf = null;
    if (document.hidden || !this.visible || this.lost) return;
    this.frame(now); this.kick();
  }
  frame(now, still) {
    const gl = this.gl; if (!gl || this.lost) return;
    const dt = Math.min(.05, Math.max(0, (now - (this.last || now)) / 1000)); this.last = now;
    const S = this.state;
    let L = 0;
    if (S === "listening") L = this.level;
    else if (S === "speaking") L = this.level > 0 ? this.level : (.18 + .14 * Math.sin(this.t * 9) * Math.sin(this.t * 3.1));
    if (this.reduced) L = 0;
    this.lv += (L - this.lv) * (1 - Math.exp(-dt / .08));
    const tg = TARGET[S](this.lv), k = 1 - Math.exp(-dt / .45), c = this.cur;
    if (this.reduced) Object.assign(c, tg); else for (const key in tg) c[key] += (tg[key] - c[key]) * k;
    if (!still && !this.reduced) { this.t += dt * (1 + c.swirl * .6 + this.lv * .8); this.rot += dt * c.speed; }
    this.pulse *= Math.exp(-dt * 3);
    const breath = this.reduced ? 0 : Math.sin(this.t * (S === "idle" ? .9 : 1.5)) * (S === "idle" ? .022 : .012);
    const u = this.u;
    gl.uniform1f(u.u_t, this.t); gl.uniform1f(u.u_amp, c.amp); gl.uniform1f(u.u_ripple, c.ripple); gl.uniform1f(u.u_swirl, c.swirl);
    gl.uniform1f(u.u_level, this.lv); gl.uniform1f(u.u_pulse, this.pulse); gl.uniform1f(u.u_rot, this.rot); gl.uniform1f(u.u_size, this.size || 2);
    gl.uniform1f(u.u_gain, this.gain || .5); gl.uniform1f(u.u_bright, c.bright); gl.uniform1f(u.u_breath, breath); gl.uniform1f(u.u_flow, this.reduced ? 0 : c.flow);
    gl.uniform1f(u.u_aspect, (this.w || 1) / (this.h || 1));
    gl.clear(gl.COLOR_BUFFER_BIT); gl.drawArrays(gl.POINTS, 0, this.n);
  }
}
window.HawkCoreGL = HawkCoreGL;
  HawkCoreGL.MARK_SRC = window.HawkCore && window.HawkCore.MARK_SRC || "/genesis-mark.svg?v=brand6";
  HawkCoreGL.attach = function (host, opts) {
    if (!host) return null;
    host.classList.add("hawk-core");
    var canvas = host.querySelector("canvas.hawk-core-canvas");
    if (!canvas) {
      canvas = document.createElement("canvas");
      canvas.className = "hawk-core-canvas";
      canvas.setAttribute("aria-hidden", "true");
      host.insertBefore(canvas, host.firstChild);
    }
    if (window.HawkCore && window.HawkCore.mountMark) window.HawkCore.mountMark(host);
    var core = new HawkCoreGL(canvas, opts || {});
    if (window.HawkCore && host) {
      core.host = host;
      core.mark = host.querySelector(".hawk-core-mark");
      var setState = core.setState.bind(core);
      core.setState = function (s) { setState(s); host.setAttribute("data-state", core.state || s || "idle"); };
      var setLevel = core.setLevel.bind(core);
      core.setLevel = function (v) { setLevel(v); host.style.setProperty("--hawk-core-level", String(core.level || 0)); };
      host.setAttribute("data-state", core.state || "idle");
    }
    return core;
  };
})();
