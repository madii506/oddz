// oddz home: inside a Vice City sportsbook at night, one giant curved LED wall of live GTA VI odds, inked in real time
import * as THREE from './three.module.min.js';
import { RoundedBoxGeometry } from './RoundedBoxGeometry.js';
const cv = document.getElementById('bg');
const PHONE = matchMedia('(max-width: 760px)').matches;
const R = new THREE.WebGLRenderer({ canvas: cv, antialias: false, powerPreference: 'high-performance' });
let DPR = Math.min(devicePixelRatio || 1, PHONE ? 1.5 : 1.6); R.setPixelRatio(DPR);
R.shadowMap.enabled = true; R.shadowMap.autoUpdate = false; R.shadowMap.type = THREE.PCFSoftShadowMap; R.outputColorSpace = THREE.SRGBColorSpace; R.toneMapping = THREE.NoToneMapping;
const scene = new THREE.Scene();
const hsh = (a, b) => { let h = (a * 374761393 + b * 668265263) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967296; };
const canvasTex = (w, h, draw, srgb = true) => { const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); if (srgb) t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t; };
const ramp = new THREE.DataTexture(new Uint8Array([70, 70, 70, 255, 150, 150, 150, 255, 255, 255, 255, 255]), 3, 1); ramp.minFilter = ramp.magFilter = THREE.NearestFilter; ramp.needsUpdate = true;
const TOONS = new Map(); const toon = (color, o = {}) => { const plain = !Object.keys(o).length; if (plain && TOONS.has(color)) return TOONS.get(color); const m = new THREE.MeshToonMaterial({ color, gradientMap: ramp, ...o }); if (plain) TOONS.set(color, m); return m; };
function mergeGeo(list) { const parts = list.map(g => g.index ? g.toNonIndexed() : g); const names = ['position', 'normal', 'uv'].filter(n => parts.every(p => p.attributes[n]));
  const out = new THREE.BufferGeometry(); for (const n of names) { const size = parts[0].attributes[n].itemSize, len = parts.reduce((a, p) => a + p.attributes[n].array.length, 0), arr = new Float32Array(len); let o = 0; for (const p of parts) { arr.set(p.attributes[n].array, o); o += p.attributes[n].array.length; } out.setAttribute(n, new THREE.BufferAttribute(arr, size)); }
  return out; }
const mesh = (geo, mat, x = 0, y = 0, z = 0, parent = scene, shadow = true) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = shadow; m.receiveShadow = true; parent.add(m); return m; };
await Promise.all([document.fonts.load('900 40px RB'), document.fonts.load('800 20px JB'), document.fonts.load('700 20px JB')]).catch(() => {});
const frondTex = canvasTex(1024, 256, (g, w, h) => { g.clearRect(0, 0, w, h); g.fillStyle = '#fff';
  g.beginPath(); g.moveTo(0, h / 2 - 7); g.lineTo(w, h / 2 - 1); g.lineTo(w, h / 2 + 1); g.lineTo(0, h / 2 + 7); g.fill();
  for (let i = 0; i < 70; i++) { const x = 10 + i * 14.3, t = x / w, len = (h / 2 - 4) * Math.sin(Math.PI * Math.min(1, t * 1.1 + .05)) * (.8 + .2 * hsh(i, 41)), wd = 7 - t * 4;
    for (const s of [-1, 1]) { g.beginPath(); g.moveTo(x - wd, h / 2); g.lineTo(x + wd, h / 2); g.lineTo(x + len * .55 + 2, h / 2 + s * len); g.closePath(); g.fill(); } } }, false);
frondTex.generateMipmaps = false; frondTex.minFilter = THREE.LinearFilter;
const frondMat = toon(0x3c8a4a, { alphaMap: frondTex, alphaTest: .4, side: THREE.DoubleSide, transparent: false });
const frondDepth = new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking, alphaMap: frondTex, alphaTest: .4, side: THREE.DoubleSide });
const barkTex = canvasTex(64, 512, (g, w, h) => { g.fillStyle = '#9a7a62'; g.fillRect(0, 0, w, h); for (let y = 0; y < h; y += 14) { g.fillStyle = 'rgba(70,40,40,.45)'; g.fillRect(0, y, w, 4); g.fillStyle = 'rgba(255,220,190,.2)'; g.fillRect(0, y + 5, w, 2); } });
barkTex.wrapT = THREE.RepeatWrapping; barkTex.repeat.set(1, 3);
function palm(x, z, hgt, lean, seed, parent = scene) { const grp = new THREE.Group(); grp.position.set(x, 0, z); parent.add(grp);
  const top = new THREE.Vector3(lean, hgt, lean * .2);
  const curve = new THREE.CatmullRomCurve3([new THREE.Vector3(0, 0, 0), new THREE.Vector3(lean * .15, hgt * .35, 0), new THREE.Vector3(lean * .55, hgt * .72, lean * .1), top]);
  const tr = mesh(new THREE.TubeGeometry(curve, 40, .16, 10, false), toon(0xffffff, { map: barkTex }), 0, 0, 0, grp);
  const crownG = []; for (let i = 0; i < 18; i++) { const L = 2.4 + hsh(seed, i) * 1.1, geo = new THREE.PlaneGeometry(L, 1.0, 20, 2); geo.translate(L / 2, 0, 0); const p = geo.attributes.position;
    const droop = .38 + hsh(seed, i + 50) * .3; for (let k = 0; k < p.count; k++) { const u = p.getX(k) / L; p.setY(k, p.getY(k) * .0 - droop * L * u * u + .25 * L * u); p.setZ(k, (k % 2 ? 1 : -1) * .31 * Math.sin(Math.PI * Math.min(1, u * 1.05)) * .6); }
    // put the leaf width in the plane of the frond: rebuild y/z so the blade lies flat
    geo.computeVertexNormals();
    geo.applyMatrix4(new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(0, i / 18 * Math.PI * 2 + hsh(seed, i + 9) * .3, (hsh(seed, i + 20) - .5) * .3))); crownG.push(geo); }
  const f = new THREE.Mesh(mergeGeo(crownG), frondMat); f.customDepthMaterial = frondDepth; f.castShadow = true; f.receiveShadow = true; f.position.copy(top); grp.add(f);
  mesh(new THREE.SphereGeometry(.22, 12, 10), toon(0x6b5a3a), top.x, top.y - .05, top.z, grp);
  return grp; }


// ================================================================ THE BOOK: inside a Vice City sportsbook at night. One giant curved LED wall of live GTA VI odds.
const REFL = []; const refl = o => { REFL.push(o); return o; };
const envTex = canvasTex(1024, 512, (g, w, h) => { g.fillStyle = '#07040f'; g.fillRect(0, 0, w, h); for (let i = 0; i < 60; i++) { g.fillStyle = ['#ff3fa4', '#19e3ff', '#9b5cff', '#fff0d8'][i % 4]; g.fillRect(hsh(i, 1) * w, h * (.3 + hsh(i, 2) * .3), 10 + hsh(i, 3) * 60, 3 + hsh(i, 4) * 8); } });
envTex.mapping = THREE.EquirectangularReflectionMapping;
const pm = new THREE.PMREMGenerator(R); scene.environment = pm.fromEquirectangular(envTex).texture; scene.environmentIntensity = .7;
scene.background = new THREE.Color(0x06040d); scene.fog = new THREE.Fog(0x0b0618, 18, 70);
const glowTex = canvasTex(256, 256, (g, w, h) => { const gr = g.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(.25, 'rgba(255,255,255,.5)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, w, h); });
const glow = (col, s, x, y, z, parent = scene, o = .9) => { const m = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: col, transparent: true, opacity: o, depthWrite: false, blending: THREE.AdditiveBlending, fog: false })); m.scale.set(s, s, 1); m.position.set(x, y, z); m.layers.set(1); parent.add(m); return m; };
const NEONS = []; const neonMat = (c, order = 9) => { const m = new THREE.MeshBasicMaterial({ color: c, fog: false }); NEONS.push({ m, c: new THREE.Color(c), order, k: Math.random() }); return m; };
const RX = 16, ZW = -14, ZB = 16, CEIL = 8.6;
// ---- the room: glossy floor, dark walls, a ceiling of neon lines
const floorTex = canvasTex(512, 512, (g, w, h) => { g.fillStyle = '#1a1128'; g.fillRect(0, 0, w, h); g.strokeStyle = 'rgba(0,0,0,.45)'; g.lineWidth = 3; for (let x = 0; x <= w; x += 128) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke(); g.beginPath(); g.moveTo(0, x); g.lineTo(w, x); g.stroke(); }
  for (let i = 0; i < 3000; i++) { g.fillStyle = hsh(i, 9) > .5 ? 'rgba(255,230,255,.03)' : 'rgba(0,0,0,.08)'; g.fillRect(hsh(i, 10) * w, hsh(i, 11) * h, 2, 2); } });
floorTex.wrapS = floorTex.wrapT = THREE.RepeatWrapping; floorTex.repeat.set(8, 8);
const floor = mesh(new THREE.PlaneGeometry(RX * 2, ZB - ZW + 4), new THREE.MeshStandardMaterial({ map: floorTex, roughness: .2, metalness: .45, envMapIntensity: .8, transparent: true, opacity: .8 }), 0, 0, (ZB + ZW) / 2, scene, false); floor.rotation.x = -Math.PI / 2;
const WALL = toon(0x1c1230), WALL2 = toon(0x140c24);
mesh(new THREE.PlaneGeometry(ZB - ZW + 4, CEIL), WALL, -RX, CEIL / 2, (ZB + ZW) / 2, scene, false).rotation.y = Math.PI / 2;
mesh(new THREE.PlaneGeometry(RX * 2, CEIL), WALL2, 0, CEIL / 2, ZB, scene, false).rotation.y = Math.PI;
mesh(new THREE.PlaneGeometry(RX * 2 + 4, 30), toon(0x0a0614), 0, CEIL, 0, scene, false).rotation.x = Math.PI / 2;
mesh(new THREE.PlaneGeometry(RX * 2 + 6, CEIL), WALL2, 0, CEIL / 2, ZW - 1.2, scene, false);
// neon lines along the ceiling, all running at the wall
[-10.5, -6.5, -2.2, 2.2, 6.5, 10.5].forEach((x, i) => { refl(mesh(new THREE.BoxGeometry(.1, .06, ZB - ZW - 4), neonMat(i % 2 ? 0x19e3ff : 0xff3fa4, [0, 2, 4, 5, 3, 1][i]), x, CEIL - .1, (ZB + ZW) / 2 + 1, scene, false)); });
for (let z = ZW + 4; z < ZB; z += 5) mesh(new THREE.BoxGeometry(RX * 2, .35, .35), toon(0x241838), 0, CEIL - .3, z, scene);
// the left wall: vertical neon slats
for (let z = ZW + 3; z < ZB - 2; z += 3.2) { refl(mesh(new THREE.BoxGeometry(.08, 5.2, .08), neonMat(0x9b5cff, 6), -RX + .06, 3.6, z, scene, false)); mesh(new THREE.BoxGeometry(.3, CEIL, .6), toon(0x261a3c), -RX + .15, CEIL / 2, z + 1.6, scene); }
// the right wall: tall windows onto Vice City at night
const cityTex = canvasTex(2048, 512, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#0a0820'); gr.addColorStop(.55, '#3a1458'); gr.addColorStop(.72, '#a0286e'); gr.addColorStop(.74, '#160a24'); gr.addColorStop(1, '#0b0716'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
  for (let i = 0; i < 140; i++) { g.fillStyle = `rgba(255,255,255,${.2 + hsh(i, 5) * .6})`; g.fillRect(hsh(i, 6) * w, hsh(i, 7) * h * .45, 2, 2); }
  let x = 0; while (x < w) { const bw = 40 + hsh(x, 1) * 120, bh = 60 + hsh(x, 2) * 230; g.fillStyle = '#100a1c'; g.fillRect(x, h * .74 - bh, bw, bh); for (let y = h * .74 - bh + 10; y < h * .74 - 8; y += 14) for (let xx = x + 6; xx < x + bw - 8; xx += 12) if (hsh(xx, y) > .62) { g.fillStyle = ['#ffd9a8', '#ff9fd0', '#9fe8ff'][(xx + y | 0) % 3]; g.fillRect(xx, y, 5, 7); }
    if (hsh(x, 3) > .7) { g.fillStyle = ['#ff3fa4', '#19e3ff', '#ffb347'][x % 3 | 0]; g.fillRect(x + 4, h * .74 - bh - 4, bw - 8, 4); } x += bw + 4; }
  const palm = (px, ph) => { g.strokeStyle = '#06030c'; g.lineWidth = 7; g.beginPath(); g.moveTo(px, h); g.quadraticCurveTo(px + 10, h - ph * .5, px + 18, h - ph); g.stroke(); g.lineWidth = 6; for (let a = 0; a < 8; a++) { const t = a / 8 * Math.PI * 2; g.beginPath(); g.moveTo(px + 18, h - ph); g.quadraticCurveTo(px + 18 + Math.cos(t) * 40, h - ph - 22, px + 18 + Math.cos(t) * 70, h - ph + Math.abs(Math.sin(t)) * 30 + 10); g.stroke(); } };
  [120, 520, 980, 1400, 1820].forEach((px, i) => palm(px, 210 + hsh(i, 4) * 80)); });
const win = mesh(new THREE.PlaneGeometry(ZB - ZW - 2, 5.6), new THREE.MeshBasicMaterial({ map: cityTex, fog: false }), RX, 3.6, (ZB + ZW) / 2, scene, false); win.rotation.y = -Math.PI / 2; win.layers.set(1); refl(win);
for (let z = ZW + 1; z <= ZB - 1; z += 3.8) mesh(new THREE.BoxGeometry(.25, CEIL, .35), toon(0x2a1c40), RX - .12, CEIL / 2, z, scene);
mesh(new THREE.BoxGeometry(.4, .4, ZB - ZW), toon(0x2a1c40), RX - .2, .7, (ZB + ZW) / 2, scene); mesh(new THREE.BoxGeometry(.4, .4, ZB - ZW), toon(0x2a1c40), RX - .2, 6.5, (ZB + ZW) / 2, scene);
// ---- the wall: a curved LED board, 30 m wide, drawn from the live markets
let FEED = { real: [], props: [] }, FEAT = 0;
const WR = 24, WZC = ZW + WR, WL = 30 / WR, WH = 5.4, WY = 4.6;
function flipU(geo) { const uv = geo.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setX(i, 1 - uv.getX(i)); return geo; }
function canvasT(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return { c, g: c.getContext('2d'), t }; }
const wall = canvasT(4096, 740);
const wallM = refl(new THREE.Mesh(flipU(new THREE.CylinderGeometry(WR, WR, WH, 96, 1, true, Math.PI - WL / 2, WL)), new THREE.MeshBasicMaterial({ map: wall.t, side: THREE.BackSide, fog: false }))); wallM.position.set(0, WY, WZC); wallM.layers.set(1); scene.add(wallM);
// its frame: a thin bezel top and bottom
[WY + WH / 2 + .08, WY - WH / 2 - .08].forEach(y => { const b = new THREE.Mesh(new THREE.CylinderGeometry(WR + .05, WR + .05, .16, 96, 1, true, Math.PI - WL / 2 - .01, WL + .02), toon(0x2a1c40, { side: THREE.BackSide })); b.position.set(0, y, WZC); scene.add(b); });
// the ticker band above the wall
const tick = canvasT(4096, 96); tick.t.wrapS = THREE.RepeatWrapping; tick.t.repeat.set(1.6, 1);
const tickM = refl(new THREE.Mesh(flipU(new THREE.CylinderGeometry(WR - .02, WR - .02, .55, 96, 1, true, Math.PI - WL / 2, WL)), new THREE.MeshBasicMaterial({ map: tick.t, side: THREE.BackSide, fog: false }))); tickM.position.set(0, WY + WH / 2 + .52, WZC); tickM.layers.set(1); scene.add(tickM);
const grain = (g, w, h) => { g.fillStyle = 'rgba(0,0,0,.26)'; for (let y = 0; y < h; y += 4) g.fillRect(0, y, w, 1); for (let x = 0; x < w; x += 4) g.fillRect(x, 0, 1, h); };
const ct = v => v == null ? '—' : v * 100 < 1 ? '<1¢' : v * 100 > 99 ? '>99¢' : Math.round(v * 100) + '¢';
const fit = (g, s, max) => { while (g.measureText(s).width > max && s.length > 4) s = s.slice(0, -2).trim() + '…'; return s; };
function wrapLines(g, s, max) { const out = []; let line = ''; for (const w of s.split(' ')) { if (g.measureText(line + w).width > max && line) { out.push(line.trim()); line = ''; } line += w + ' '; } if (line.trim()) out.push(line.trim()); return out; }
function drawWall(rv = 1) { const { g, c } = wall, w = c.width, h = c.height; const NR = Math.ceil(7 * rv); g.fillStyle = '#04020a'; g.fillRect(0, 0, w, h); g.textBaseline = 'middle';
  const panel = (x, pw, title, col) => { g.fillStyle = 'rgba(255,255,255,.025)'; g.fillRect(x, 24, pw, h - 48); g.fillStyle = col; g.fillRect(x, 24, pw, 64); g.fillStyle = '#04020a'; g.font = '800 34px JB'; g.fillText(title, x + 24, 57); };
  // left: props tonight, with the crowd's lean
  const LX = 40, LW = 1140; panel(LX, LW, 'PROPS TONIGHT · FREE CALLS', '#19e3ff'); g.textAlign = 'right'; g.fillText('CROWD', LX + LW - 24, 57); g.textAlign = 'left';
  const P = FEED.props.length ? FEED.props.slice(0, Math.min(7, NR)) : []; const rh = (h - 150) / 7;
  P.forEach((r, i) => { const y = 88 + rh * i + rh / 2 + 8; g.font = '700 34px JB'; g.fillStyle = '#f2eaff'; g.fillText(fit(g, String(r.q).toUpperCase(), LW - 330), LX + 24, y); g.textAlign = 'right'; g.font = '800 38px JB'; g.fillStyle = '#ffc65a'; g.fillText(r.pct == null ? '—' : `${r.pct}% ${r.pick}`, LX + LW - 24, y); g.textAlign = 'left';
    g.fillStyle = 'rgba(255,255,255,.06)'; g.fillRect(LX + 24, y + 26, LW - 48, 4); g.fillStyle = '#ffc65a'; g.fillRect(LX + 24, y + 26, (LW - 48) * (r.pct || 0) / 100, 4); });
  if (!P.length && rv >= 1) { g.font = '700 34px JB'; g.fillStyle = 'rgba(255,255,255,.45)'; g.fillText('LOADING THE PROPS…', LX + 24, h / 2); }
  // right: real money
  const RX0 = w - 40 - 1140; panel(RX0, 1140, 'REAL MONEY · POLYMARKET × JUPITER', '#ff3fa4'); g.textAlign = 'right'; g.fillText('YES    NO', RX0 + 1140 - 24, 57); g.textAlign = 'left';
  const RlAll = FEED.real.slice(0, 7), Rl = RlAll.slice(0, NR);
  Rl.forEach((r, i) => { const y = 88 + rh * i + rh / 2 + 8; g.font = '700 34px JB'; g.fillStyle = '#f2eaff'; g.fillText(fit(g, String(r.q).toUpperCase(), 1140 - 400), RX0 + 24, y); g.textAlign = 'right'; g.font = '800 38px JB';
    g.fillStyle = '#2fe0a8'; g.fillText(ct(r.yes), RX0 + 1140 - 190, y); g.fillStyle = '#ff5f98'; g.fillText(ct(r.no), RX0 + 1140 - 24, y); g.textAlign = 'left'; });
  if (!Rl.length && rv >= 1) { g.font = '700 34px JB'; g.fillStyle = 'rgba(255,255,255,.45)'; g.fillText('LOADING THE MARKETS…', RX0 + 24, h / 2); }
  // centre: the featured market, huge
  const CX = LX + LW + 60, CW = RX0 - 60 - CX, f = rv > .55 && RlAll.length ? RlAll[FEAT % RlAll.length] : null; g.fillStyle = 'rgba(255,255,255,.03)'; g.fillRect(CX, 24, CW, h - 48);
  g.textAlign = 'center'; g.font = '800 34px JB'; g.fillStyle = '#ffc65a'; g.fillText('GTA VI · LIVE ODDZ', CX + CW / 2, 80);
  if (f) { g.font = '900 78px RB'; g.fillStyle = '#fff6f2'; const L = wrapLines(g, f.q, CW - 120).slice(0, 2); L.forEach((s, i) => g.fillText(s, CX + CW / 2, 190 + i * 88));
    const by = L.length > 1 ? 470 : 420, bw = (CW - 180) / 2;
    [[f.yes, 'YES', '#2fe0a8', 'rgba(47,224,168,.14)'], [f.no, 'NO', '#ff5f98', 'rgba(255,95,152,.13)']].forEach(([v, lab, col, bg], i) => { const x = CX + 60 + i * (bw + 60); g.fillStyle = bg; g.fillRect(x, by - 110, bw, 220); g.strokeStyle = col; g.lineWidth = 4; g.strokeRect(x, by - 110, bw, 220);
      g.fillStyle = col; g.font = '800 40px JB'; g.fillText(lab, x + bw / 2, by - 62); g.font = '900 120px RB'; g.fillText(ct(v), x + bw / 2, by + 30); }); }
  else if (rv >= 1) { g.font = '900 78px RB'; g.fillStyle = 'rgba(255,255,255,.5)'; g.fillText('THE BOARD IS LOADING', CX + CW / 2, h / 2); }
  g.textAlign = 'left'; grain(g, w, h); wall.t.needsUpdate = true; }
function drawTicker() { const { g, c } = tick; g.fillStyle = '#04020a'; g.fillRect(0, 0, c.width, c.height); g.font = '800 50px JB'; g.textBaseline = 'middle';
  const items = [...FEED.real.map(r => [r.q.toUpperCase(), r.yes]), ...FEED.props.map(r => [r.q.toUpperCase(), null, r.pct, r.pick])]; if (!items.length) items.push(['THE ODDZ ON EVERYTHING IN GTA VI', null]); let x = 20, i = 0;
  while (x < c.width) { const [q, y, pc, pk] = items[i % items.length]; g.fillStyle = '#ff3fa4'; g.fillText('●', x, 50); x += 52; g.fillStyle = '#fff2e8'; g.fillText(q, x, 50); x += g.measureText(q).width + 22;
    const s = y != null ? 'YES ' + ct(y) : pc != null ? pc + '% ' + pk : ''; if (s) { g.fillStyle = y != null ? '#2fe0a8' : '#ffc65a'; g.fillText(s, x, 50); x += g.measureText(s).width + 70; } else x += 50; i++; }
  grain(g, c.width, c.height); tick.t.needsUpdate = true; }
let WALLRV = 1; addEventListener('oddz:feed', e => { FEED = { real: e.detail.real || FEED.real, props: e.detail.props || FEED.props }; drawWall(WALLRV); drawTicker(); });
drawWall(); drawTicker();
// ---- the betting counter under the wall: windows, little screens, a neon edge
const counter = new THREE.Group(); scene.add(counter);
{ const CZ = ZW + 3.2; mesh(new RoundedBoxGeometry(22, 1.15, 1.3, 3, .08), toon(0x221634), 0, .58, CZ, counter); mesh(new RoundedBoxGeometry(22.4, .1, 1.6, 2, .04), toon(0x3a2a52), 0, 1.2, CZ, counter);
  refl(mesh(new THREE.BoxGeometry(22, .05, .05), neonMat(0xff3fa4, 7), 0, 1.14, CZ + .67, counter, false)); refl(mesh(new THREE.BoxGeometry(22, .04, .04), neonMat(0x19e3ff, 7), 0, .1, CZ + .67, counter, false));
  const scr = canvasTex(256, 160, (g, w, h) => { g.fillStyle = '#07040e'; g.fillRect(0, 0, w, h); g.fillStyle = '#19e3ff'; g.fillRect(0, 0, w, 26); g.fillStyle = '#07040e'; g.font = '800 18px JB'; g.fillText('GTA VI · ODDZ', 10, 18); g.font = '700 16px JB';
    for (let i = 0; i < 5; i++) { g.fillStyle = '#e8e0ff'; g.fillRect(10, 40 + i * 23, 120 + (i * 37 % 60), 8); g.fillStyle = i % 2 ? '#2fe0a8' : '#ff5f98'; g.fillRect(200, 40 + i * 23, 40, 8); } });
  for (let i = 0; i < 9; i++) { const x = -9.6 + i * 2.4; const s = mesh(new THREE.PlaneGeometry(.7, .44), new THREE.MeshBasicMaterial({ map: scr, fog: false }), x, 1.48, CZ - .1, counter, false); s.rotation.x = -.35; s.layers.set(1);
    mesh(new THREE.BoxGeometry(.06, .3, .06), toon(0x3a2a52), x, 1.3, CZ - .2, counter); glow(0x19e3ff, .9, x, 1.5, CZ, counter, .25); } }
// ---- lounge seats in rows, facing the wall
const SEAT = toon(0x2c1a3e), SEAT2 = toon(0x3c2652); const seatsG = [], backsG = [];
for (const [z, n] of [[-5.4, 7], [-1.6, 8], [2.2, 8], [6, 7]]) for (let i = 0; i < n; i++) { const x = (i - (n - 1) / 2) * 2.5 + (z > 0 ? .4 : 0); if (Math.abs(x) < .8 && z > 4) continue;
  const a = new RoundedBoxGeometry(1.7, .5, 1.5, 3, .18); a.translate(x, .45, z); seatsG.push(a); const b = new RoundedBoxGeometry(1.7, 1.1, .32, 3, .14); b.rotateX(-.14); b.translate(x, 1.05, z + .66); backsG.push(b);
  [-1, 1].forEach(s => { const r = new RoundedBoxGeometry(.22, .55, 1.4, 2, .08); r.translate(x + s * .82, .72, z + .02); backsG.push(r); }); }
mesh(mergeGeo(seatsG), SEAT, 0, 0, 0); mesh(mergeGeo(backsG), SEAT2, 0, 0, 0);
// little table lamps between the rows
for (const [x, z] of [[-6.3, -3.5], [6.3, -3.5], [-6.3, .3], [6.3, .3]]) { mesh(new THREE.CylinderGeometry(.35, .35, .7, 18), toon(0x3a2a52), x, .35, z); refl(mesh(new THREE.CylinderGeometry(.12, .12, .2, 12), neonMat(0xffc68a), x, .82, z, scene, false)); glow(0xffb47a, 1.4, x, .9, z, scene, .55); }
// ---- pillars with neon edges
for (const [x, z] of [[-13.6, 4], [13.6, 4], [-13.6, 11], [13.6, 11]]) { mesh(new THREE.BoxGeometry(1.1, CEIL, 1.1), toon(0x261a3c), x, CEIL / 2, z); [-1, 1].forEach(s => refl(mesh(new THREE.BoxGeometry(.06, CEIL - .6, .06), neonMat(s < 0 ? 0xff3fa4 : 0x19e3ff, 6), x - Math.sign(x) * .58, CEIL / 2, z + s * .5, scene, false))); }
// ---- dust in the light of the wall
const ND = PHONE ? 220 : 600, dg = new THREE.BufferGeometry(), dp = new Float32Array(ND * 3); for (let i = 0; i < ND; i++) dp.set([(Math.random() - .5) * 30, Math.random() * 8, ZW + 1 + Math.random() * 22], i * 3);
dg.setAttribute('position', new THREE.BufferAttribute(dp, 3)); const dust = new THREE.Points(dg, new THREE.PointsMaterial({ map: glowTex, color: 0xffc8e8, size: .07, transparent: true, opacity: .55, depthWrite: false, blending: THREE.AdditiveBlending })); dust.layers.set(1); scene.add(dust);


// ================================================================ light: the wall washes the room; soft ceiling key for the seats
scene.add(new THREE.HemisphereLight(0x4a3a8a, 0x0a0612, .7));
const key = new THREE.DirectionalLight(0xb8a8ff, .75); key.position.set(4, 14, 8); key.target.position.set(0, 0, -2); key.castShadow = true; key.shadow.mapSize.set(2048, 2048); key.shadow.bias = -.0004; key.shadow.normalBias = .02;
Object.assign(key.shadow.camera, { left: -16, right: 16, top: 16, bottom: -16, near: 1, far: 40 }); scene.add(key, key.target);
const wallL = [[-9, 0xff3fa4, 46], [0, 0xfff0f6, 34], [9, 0x19e3ff, 46]].map(([x, c, i]) => { const l = new THREE.PointLight(c, i, 26, 1.5); l.position.set(x, 4.6, ZW + 3.5); scene.add(l); return l; });
const winL = new THREE.PointLight(0xa070ff, 20, 20, 1.6); winL.position.set(RX - 2, 4, 0); scene.add(winL);
// ---- the glossy floor: everything bright gets an upside-down twin under it
scene.updateMatrixWorld(true); const MIR = new THREE.Matrix4().makeScale(1, -1, 1);
for (const o of REFL) { const c = o.clone(false); c.matrixAutoUpdate = false; c.matrix.copy(MIR).multiply(o.matrixWorld); c.layers.set(1); c.castShadow = false; scene.add(c); }

// ================================================================ ink + grade, in real time
const near = .05, far = 420;
const cam = new THREE.PerspectiveCamera(32, 1, near, far);
let rtC, rtN; const normalMat = new THREE.MeshNormalMaterial();
const post = new THREE.ShaderMaterial({ uniforms: { tC: { value: null }, tN: { value: null }, tD: { value: null }, px: { value: new THREE.Vector2() }, time: { value: 0 }, dim: { value: 0 } },
  vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0., 1.); }',
  fragmentShader: `uniform sampler2D tC; uniform sampler2D tN; uniform sampler2D tD; uniform vec2 px; uniform float time; uniform float dim; varying vec2 vUv;
float lin(float d){ float z = d * 2. - 1.; return (2. * ${near.toFixed(3)} * ${far.toFixed(1)}) / (${far.toFixed(1)} + ${near.toFixed(3)} - z * (${far.toFixed(1)} - ${near.toFixed(3)})); }
float hash(vec2 p){ return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
void main(){ vec3 c = texture2D(tC, vUv).rgb; vec3 n0 = texture2D(tN, vUv).rgb; float d0 = lin(texture2D(tD, vUv).r); float e = 0.;
  vec2 o[4]; o[0] = vec2(px.x, 0.); o[1] = vec2(-px.x, 0.); o[2] = vec2(0., px.y); o[3] = vec2(0., -px.y);
  for (int i = 0; i < 4; i++) { vec3 n = texture2D(tN, vUv + o[i]).rgb; float d = lin(texture2D(tD, vUv + o[i]).r); e = max(e, length(n - n0) * 1.3); e = max(e, abs(d - d0) / max(d0, .01) * 7.); }
  e = smoothstep(.4, .95, e) * (1. - smoothstep(25., 60., d0));
  c = mix(c, vec3(.13, .05, .17), e * .82);
  float l = dot(c, vec3(.299, .587, .114)); c = mix(vec3(l), c, 1.1); c += vec3(.02, 0., -.015) * l;
  vec2 q = vUv - .5; c *= 1. - .35 * smoothstep(.35, .95, length(q * vec2(1.25, 1.)));
  c += (hash(vUv * 900. + time) - .5) * .035;
  c = mix(c, vec3(.32, .09, .24) * (.4 + l), dim);
  gl_FragColor = vec4(c, 1.);
#include <colorspace_fragment>
}` });
const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), post); const qs = new THREE.Scene(); qs.add(quad); const qc = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
function size() { const w = innerWidth, h = innerHeight; R.setSize(w, h, false); const pw = Math.round(w * DPR), ph = Math.round(h * DPR);
  rtC?.dispose(); rtN?.dispose(); rtC = new THREE.WebGLRenderTarget(pw, ph, { samples: 4, type: THREE.HalfFloatType }); rtN = new THREE.WebGLRenderTarget(pw, ph, { depthTexture: new THREE.DepthTexture(pw, ph) });
  post.uniforms.tC.value = rtC.texture; post.uniforms.tN.value = rtN.texture; post.uniforms.tD.value = rtN.depthTexture; post.uniforms.px.value.set(1.15 / pw, 1.15 / ph); cam.aspect = w / h; cam.updateProjectionMatrix(); }
addEventListener('resize', size); size();


// ================================================================ the cinematography: slow moves through the book
const P = innerWidth / innerHeight < .9;
const SHOTS = P ? [
  { p: [0, 5.6, 11], t: [0, .2, -5], f: 64, m: [0, -.3, -2] }, { p: [-11, 2.1, 6.5], t: [0, 4.1, -14], f: 58, m: [2.2, .1, -2] }, { p: [2.5, 4.4, -3], t: [0, 4.8, -14], f: 54, m: [-3, 0, .4] },
  { p: [9, 7.4, 10], t: [-1, 3.2, -11], f: 60, m: [-4, -1, -2] }, { p: [11, 2.2, -5], t: [-6, 4.4, -13], f: 56, m: [-1.5, .3, 1.2] }] : [
  { p: [0, 5.2, 11], t: [0, 1.0, -6], f: 47, m: [0, -.3, -2.2] }, { p: [-11.6, 2.1, 6.5], t: [0, 4.0, -14], f: 40, m: [2.4, .1, -2] }, { p: [2.2, 4.3, -3.6], t: [0, 4.7, -14], f: 36, m: [-3, 0, .4] },
  { p: [9, 7.6, 11], t: [-1, 3.2, -11], f: 42, m: [-4.5, -1, -2] }, { p: [11.5, 2.2, -5.5], t: [-6, 4.4, -13], f: 38, m: [-1.6, .3, 1.2] }];
const sm = x => x * x * x * (x * (x * 6 - 15) + 10); const V = a => new THREE.Vector3(...a);
const QPS = new URLSearchParams(location.search); if (QPS.get('seq')) { const o = QPS.get('seq').split(',').map(Number).map(i => SHOTS[i]).filter(Boolean); SHOTS.splice(0, SHOTS.length, ...o); }
const SHOT = +QPS.get('len') || 9, BLEND = Math.min(3, SHOT * .38); let mode = 'home', tsV = 1, dimV = 0, mx = 0, my = 0;
addEventListener('pointermove', e => { mx = e.clientX / innerWidth - .5; my = e.clientY / innerHeight - .5; });
function shotAt(s, f) { const m = s.m || [0, 0, 0]; return { p: V(s.p).add(new THREE.Vector3(m[0] * f, m[1] * f, m[2] * f)), t: V(s.t), f: s.f }; }
const CAMQ = (QPS.get('cam') || '').split(',').map(Number);
function camAt(t) { if (CAMQ.length === 7) { cam.position.set(CAMQ[0], CAMQ[1], CAMQ[2]); cam.fov = CAMQ[6]; cam.lookAt(CAMQ[3], CAMQ[4], CAMQ[5]); cam.updateProjectionMatrix(); return; } const n = SHOTS.length, i = Math.floor(t / SHOT) % n, f = (t % SHOT) / SHOT, A = shotAt(SHOTS[i], f), B = shotAt(SHOTS[(i + 1) % n], 0);
  const k = sm(Math.max(0, (t % SHOT - (SHOT - BLEND)) / BLEND)); cam.position.lerpVectors(A.p, B.p, k); const tt = new THREE.Vector3().lerpVectors(A.t, B.t, k); cam.fov = A.f + (B.f - A.f) * k;
  cam.position.x += mx * .4 + Math.sin(t * .7) * .05; cam.position.y += -my * .2 + Math.sin(t * .9) * .03; cam.lookAt(tt); cam.updateProjectionMatrix(); }
// ================================================================ loop
const clock = new THREE.Clock(); let T = (+QPS.get('shot') || 0) * SHOT + .5, ready = false, frames = 0, slow = 0, featT = 0, blink = 0;
// ================================================================ the house lights: tubes flicker on toward the wall, then the board boots and its rows type in
const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
const INTRO = { t: (location.hash === '#book' || RM || QPS.has('shot') || CAMQ.length === 7) ? 99 : 0, lit: false, rv: -1 }; const DUR = 3.9;
const skip = () => { if (INTRO.t < DUR) INTRO.t = DUR; }; addEventListener('pointerdown', skip); addEventListener('keydown', skip);
const offC = new THREE.Color(0x000000), tmpC = new THREE.Color(), wallMat = wallM.material, tickMat = tickM.material;
const smooth = x => x <= 0 ? 0 : x >= 1 ? 1 : x * x * (3 - 2 * x), flick = (t, k) => t <= 0 ? 0 : t >= .42 ? 1 : (Math.sin(t * 90 + k * 40) > .1 ? .9 : .08) * Math.min(1, t * 5);
function intro(dt) { if (INTRO.t >= 99) return 1; INTRO.t += dt; const t = INTRO.t;
  for (const n of NEONS) { const at = n.order <= 5 ? .15 + n.order * .16 : n.order === 6 ? 1.15 + n.k * .3 : 1.5; n.m.color.copy(tmpC.copy(offC).lerp(n.c, flick(t - at, n.k))); }
  const w = t < 1.75 ? 0 : t < 2.05 ? (Math.sin(t * 120) > 0 ? .85 : .15) : 1; wallMat.color.setScalar(w); tickMat.color.setScalar(t < 2.3 ? 0 : smooth((t - 2.3) / .3));
  const rv = t < 2.05 ? 0 : smooth((t - 2.05) / 1.0); if (Math.abs(rv - INTRO.rv) > .06 || (rv >= 1 && INTRO.rv < 1)) { INTRO.rv = rv; WALLRV = rv; drawWall(rv); }
  for (const l of wallL) l.userData.k = w; if (!INTRO.lit && t > 2.7) { INTRO.lit = true; window.dispatchEvent(new Event('oddz:lit')); }
  if (t >= DUR) { INTRO.t = 99; for (const n of NEONS) n.m.color.copy(n.c); wallMat.color.setScalar(1); tickMat.color.setScalar(1); WALLRV = 1; drawWall(1); for (const l of wallL) l.userData.k = 1; if (!INTRO.lit) { INTRO.lit = true; window.dispatchEvent(new Event('oddz:lit')); } return 1; }
  return smooth(t / DUR); }
if (INTRO.t >= 99) setTimeout(() => window.dispatchEvent(new Event('oddz:lit')), 50); else { for (const n of NEONS) n.m.color.copy(offC); wallMat.color.setScalar(0); tickMat.color.setScalar(0); WALLRV = 0; drawWall(0); for (const l of wallL) l.userData.k = 0; }
const C0 = new THREE.Vector3(), CT = new THREE.Vector3(), IP = new THREE.Vector3(0, 6.6, 15), IT = new THREE.Vector3(0, 3.2, -14);
function frame() { requestAnimationFrame(frame); const dt = Math.min(clock.getDelta(), .05); if (document.hidden) return; tsV += ((mode === 'term' ? .45 : 1) - tsV) * Math.min(1, dt * 1.2); const ts = tsV; const ik = intro(dt); if (ik >= 1) T += dt * ts;
  dimV += ((mode === 'term' ? 1 : 0) - dimV) * Math.min(1, dt * 1.4); post.uniforms.dim.value = dimV * .55; post.uniforms.time.value = T % 10;
  camAt(T + 1); if (ik < 1) { C0.copy(cam.position); const e = ik; cam.position.lerpVectors(IP, C0, e); CT.set(0, 0, -1).applyQuaternion(cam.quaternion); cam.lookAt(IT.clone().lerp(cam.position.clone().add(CT.multiplyScalar(20)), e)); }
  tick.t.offset.x += dt * ts * .03;
  featT += dt; if (featT > 7 && INTRO.t >= 99) { featT = 0; FEAT++; blink = .16; drawWall(); } if (blink > 0) { blink -= dt; wallMat.color.setScalar(blink > .08 ? .25 : blink > 0 ? .6 : 1); if (blink <= 0) wallMat.color.setScalar(1); }
  const dpA = dust.geometry.attributes.position; for (let i = 0; i < ND; i++) { const o = i * 3; dpA.array[o + 1] += dt * .08 * (1 + (i % 5) * .2); dpA.array[o] += Math.sin(T * .3 + i) * dt * .03; if (dpA.array[o + 1] > 8) dpA.array[o + 1] = 0; } dpA.needsUpdate = true;
  const pulse = .92 + Math.sin(T * 1.7) * .08, wk = wallL[0].userData.k ?? 1; wallL[0].intensity = 46 * pulse * wk; wallL[2].intensity = 46 * (2 - pulse) * wk; wallL[1].intensity = 34 * wk;
  // render: colour (all layers), normals+depth (layer 0), then ink
  if (frames % 3 === 0) R.shadowMap.needsUpdate = true; cam.layers.enableAll(); scene.overrideMaterial = null; R.setRenderTarget(rtC); R.render(scene, cam);
  cam.layers.set(0); scene.overrideMaterial = normalMat; R.setRenderTarget(rtN); R.render(scene, cam); scene.overrideMaterial = null;
  R.setRenderTarget(null); R.render(qs, qc);
  frames++; if (!ready && frames > 2) { ready = true; window.dispatchEvent(new Event('oddz:scene')); }
  if (dt > .045) slow++; else slow = Math.max(0, slow - 1); if (slow > 40 && DPR > .8) { DPR = Math.max(.75, DPR - .25); R.setPixelRatio(DPR); size(); slow = 0; } }
frame();
const DPR0 = DPR; let dprT = 0; window.oddzScene = { introAt(t) { INTRO.t = t; INTRO.rv = -1; }, mode(m) { if (m === mode) return; mode = m; clearTimeout(dprT); const set = () => { DPR = mode === 'term' ? Math.min(.6, DPR0) : DPR0; R.setPixelRatio(DPR); size(); }; if (m === 'term') dprT = setTimeout(set, 1500); else set(); }, get ready() { return ready; } };
