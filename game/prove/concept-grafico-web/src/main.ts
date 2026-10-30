// Concept grafico: una carta resa bene (cornice, illustrazione segnaposto, effetto lucido,
// animazione di entrata, particelle). CONCEPT NON DI DESIGN: nome, testi e valori sono segnaposto.
import * as THREE from 'three';

const CW = 1024;
const CH = 1434;

// ---------- Texture della carta (disegnata con canvas 2D) ----------
function rr(c: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number): void {
  c.beginPath();
  c.roundRect(x, y, w, h, r);
}

function righe(c: CanvasRenderingContext2D, testo: string, maxW: number): string[] {
  const out: string[] = [];
  let riga = '';
  for (const p of testo.split(' ')) {
    const prova = riga ? `${riga} ${p}` : p;
    if (c.measureText(prova).width > maxW && riga) {
      out.push(riga);
      riga = p;
    } else riga = prova;
  }
  if (riga) out.push(riga);
  return out;
}

function rumore(seed: number): () => number {
  let s = seed;
  return () => ((s = (s * 1664525 + 1013904223) % 4294967296) / 4294967296);
}

function disegnaArtePlaceholder(c: CanvasRenderingContext2D, x: number, y: number, w: number, h: number): void {
  const rnd = rumore(7);
  c.save();
  rr(c, x, y, w, h, 10);
  c.clip();
  const sfondo = c.createLinearGradient(0, y, 0, y + h);
  sfondo.addColorStop(0, '#0b2b3a');
  sfondo.addColorStop(0.55, '#1d1a4a');
  sfondo.addColorStop(1, '#07060f');
  c.fillStyle = sfondo;
  c.fillRect(x, y, w, h);
  c.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 70; i++) {
    const px = x + rnd() * w;
    const py = y + rnd() * h;
    const r = 60 + rnd() * 190;
    const g = c.createRadialGradient(px, py, 0, px, py, r);
    const t = rnd();
    const col = t < 0.5 ? '40,170,170' : t < 0.8 ? '110,70,200' : '30,90,150';
    g.addColorStop(0, `rgba(${col},0.10)`);
    g.addColorStop(1, `rgba(${col},0)`);
    c.fillStyle = g;
    c.fillRect(px - r, py - r, 2 * r, 2 * r);
  }
  // Tentacoli luminosi
  c.lineCap = 'round';
  for (let i = 0; i < 9; i++) {
    const bx = x + w * (0.1 + 0.8 * (i / 8));
    c.beginPath();
    c.moveTo(bx, y + h + 20);
    let px = bx;
    let py = y + h;
    for (let k = 0; k < 5; k++) {
      px += (rnd() - 0.5) * 220;
      py -= h * (0.16 + rnd() * 0.08);
      c.quadraticCurveTo(px + (rnd() - 0.5) * 140, py + 60, px, py);
    }
    c.shadowColor = 'rgba(80,240,220,0.9)';
    c.shadowBlur = 28;
    c.strokeStyle = 'rgba(70,200,190,0.55)';
    c.lineWidth = 16 + rnd() * 12;
    c.stroke();
    c.shadowBlur = 0;
    c.strokeStyle = 'rgba(190,255,245,0.35)';
    c.lineWidth = 4;
    c.stroke();
  }
  // Occhio centrale
  const ex = x + w / 2;
  const ey = y + h * 0.4;
  c.globalCompositeOperation = 'source-over';
  const alone = c.createRadialGradient(ex, ey, 20, ex, ey, 330);
  alone.addColorStop(0, 'rgba(140,255,230,0.45)');
  alone.addColorStop(1, 'rgba(140,255,230,0)');
  c.fillStyle = alone;
  c.fillRect(ex - 330, ey - 330, 660, 660);
  c.beginPath();
  c.ellipse(ex, ey, 230, 110, 0, 0, Math.PI * 2);
  c.fillStyle = '#05080c';
  c.fill();
  const iride = c.createRadialGradient(ex, ey, 10, ex, ey, 105);
  iride.addColorStop(0, '#f6ffb0');
  iride.addColorStop(0.45, '#44e0c0');
  iride.addColorStop(1, '#0a4a6a');
  c.beginPath();
  c.arc(ex, ey, 100, 0, Math.PI * 2);
  c.fillStyle = iride;
  c.fill();
  c.beginPath();
  c.ellipse(ex, ey, 14, 88, 0, 0, Math.PI * 2);
  c.fillStyle = '#020305';
  c.fill();
  c.beginPath();
  c.ellipse(ex, ey, 230, 110, 0, 0, Math.PI * 2);
  c.strokeStyle = 'rgba(160,255,235,0.8)';
  c.lineWidth = 5;
  c.stroke();
  // Vignetta
  const vig = c.createRadialGradient(ex, y + h / 2, h * 0.3, ex, y + h / 2, h * 0.85);
  vig.addColorStop(0, 'rgba(0,0,0,0)');
  vig.addColorStop(1, 'rgba(0,0,0,0.65)');
  c.fillStyle = vig;
  c.fillRect(x, y, w, h);
  c.restore();
}

function disegnaCarta(cv: HTMLCanvasElement, arte: HTMLImageElement | null): void {
  const c = cv.getContext('2d') as CanvasRenderingContext2D;
  c.clearRect(0, 0, CW, CH);
  const rnd = rumore(3);

  // Corpo e bordo esterno
  rr(c, 0, 0, CW, CH, 48);
  c.fillStyle = '#07070b';
  c.fill();
  const bronzo = c.createLinearGradient(0, 0, CW, CH);
  bronzo.addColorStop(0, '#d9b46a');
  bronzo.addColorStop(0.25, '#6f5326');
  bronzo.addColorStop(0.5, '#f0d89a');
  bronzo.addColorStop(0.75, '#5a4220');
  bronzo.addColorStop(1, '#c9a35a');
  rr(c, 14, 14, CW - 28, CH - 28, 40);
  c.lineWidth = 14;
  c.strokeStyle = bronzo;
  c.stroke();
  rr(c, 38, 38, CW - 76, CH - 76, 26);
  c.fillStyle = '#12101a';
  c.fill();

  // Barra del nome
  const barra = (y: number, h: number): void => {
    const g = c.createLinearGradient(0, y, 0, y + h);
    g.addColorStop(0, '#2a2538');
    g.addColorStop(1, '#14111d');
    rr(c, 62, y, CW - 124, h, 18);
    c.fillStyle = g;
    c.fill();
    c.lineWidth = 3;
    c.strokeStyle = bronzo;
    c.stroke();
  };
  barra(62, 96);
  c.fillStyle = '#efe6d0';
  c.font = '700 54px Georgia, "Times New Roman", serif';
  c.textBaseline = 'middle';
  c.fillText("Custode dell'Abisso", 96, 112);

  // Costo (sfere)
  [0, 1].forEach((i) => {
    const cx = CW - 158 + i * 64;
    const g = c.createRadialGradient(cx - 8, 104, 4, cx, 112, 30);
    g.addColorStop(0, i === 0 ? '#9ff0e0' : '#d0c4ff');
    g.addColorStop(1, i === 0 ? '#0f5a66' : '#3a2a7a');
    c.beginPath();
    c.arc(cx, 112, 28, 0, Math.PI * 2);
    c.fillStyle = g;
    c.fill();
    c.lineWidth = 3;
    c.strokeStyle = '#0a0a10';
    c.stroke();
  });

  // Finestra illustrazione
  const ax = 70;
  const ay = 176;
  const aw = CW - 140;
  const ah = 620;
  if (arte) {
    c.save();
    rr(c, ax, ay, aw, ah, 10);
    c.clip();
    const s = Math.max(aw / arte.width, ah / arte.height);
    c.drawImage(arte, ax + (aw - arte.width * s) / 2, ay + (ah - arte.height * s) / 2, arte.width * s, arte.height * s);
    c.restore();
  } else disegnaArtePlaceholder(c, ax, ay, aw, ah);
  rr(c, ax, ay, aw, ah, 10);
  c.lineWidth = 8;
  c.strokeStyle = bronzo;
  c.stroke();

  // Riga del tipo
  barra(812, 72);
  c.fillStyle = '#e4dcc6';
  c.font = '600 40px Georgia, serif';
  c.fillText('Entità — Abissale', 96, 850);

  // Riquadro del testo con pergamena scura
  const tx = 70;
  const ty = 902;
  const tw = CW - 140;
  const th = 420;
  const perg = c.createLinearGradient(0, ty, 0, ty + th);
  perg.addColorStop(0, '#d8cdb0');
  perg.addColorStop(1, '#bfb293');
  rr(c, tx, ty, tw, th, 14);
  c.fillStyle = perg;
  c.fill();
  c.save();
  rr(c, tx, ty, tw, th, 14);
  c.clip();
  for (let i = 0; i < 5000; i++) {
    c.fillStyle = `rgba(70,50,20,${rnd() * 0.07})`;
    c.fillRect(tx + rnd() * tw, ty + rnd() * th, 2 + rnd() * 3, 2 + rnd() * 3);
  }
  c.restore();
  c.lineWidth = 5;
  c.strokeStyle = bronzo;
  rr(c, tx, ty, tw, th, 14);
  c.stroke();

  c.fillStyle = '#1b1710';
  c.font = '500 38px Georgia, serif';
  c.textBaseline = 'alphabetic';
  let y = ty + 64;
  for (const r of righe(c, 'Quando entra in gioco, ogni territorio vicino diventa Oscurato fino alla fine del turno.', tw - 60)) {
    c.fillText(r, tx + 30, y);
    y += 50;
  }
  y += 14;
  c.font = 'italic 34px Georgia, serif';
  c.fillStyle = '#3b3325';
  for (const r of righe(c, '«Non dorme. Aspetta che smettiamo di guardare.»', tw - 60)) {
    c.fillText(r, tx + 30, y);
    y += 44;
  }

  // Piastra forza/resistenza e gemma rarità
  rr(c, CW - 280, 1280, 210, 90, 18);
  c.fillStyle = '#1c1828';
  c.fill();
  c.lineWidth = 4;
  c.strokeStyle = bronzo;
  c.stroke();
  c.fillStyle = '#f2e9d2';
  c.font = '700 58px Georgia, serif';
  c.textAlign = 'center';
  c.fillText('4 / 5', CW - 175, 1347);
  c.textAlign = 'left';
  const gem = c.createRadialGradient(CW / 2 - 4, 1392, 2, CW / 2, 1396, 22);
  gem.addColorStop(0, '#ffe9a8');
  gem.addColorStop(1, '#a8741a');
  c.beginPath();
  c.moveTo(CW / 2, 1372);
  c.lineTo(CW / 2 + 26, 1396);
  c.lineTo(CW / 2, 1420);
  c.lineTo(CW / 2 - 26, 1396);
  c.closePath();
  c.fillStyle = gem;
  c.fill();
  c.strokeStyle = '#0a0a10';
  c.lineWidth = 3;
  c.stroke();
}

// ---------- Scena three.js ----------
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 3));
renderer.outputColorSpace = THREE.LinearSRGBColorSpace; // niente conversioni: i valori disegnati restano quelli
renderer.setClearColor(0x05060a);
document.body.appendChild(renderer.domElement);

const scena = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 50);

const cartaCanvas = document.createElement('canvas');
cartaCanvas.width = CW;
cartaCanvas.height = CH;
disegnaCarta(cartaCanvas, null);
const texture = new THREE.CanvasTexture(cartaCanvas);
texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
texture.generateMipmaps = true;
texture.minFilter = THREE.LinearMipmapLinearFilter;

const noiseGlsl = `
float hash(vec2 p){ p = fract(p*vec2(123.34, 456.21)); p += dot(p, p+45.32); return fract(p.x*p.y); }
float vnoise(vec2 p){ vec2 i=floor(p), f=fract(p); f=f*f*(3.0-2.0*f);
  return mix(mix(hash(i),hash(i+vec2(1,0)),f.x), mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x), f.y); }
float fbm(vec2 p){ float v=0.0, a=0.5; for(int i=0;i<5;i++){ v+=a*vnoise(p); p*=2.0; a*=0.5; } return v; }
`;

const cartaMat = new THREE.ShaderMaterial({
  transparent: true,
  uniforms: {
    uMap: { value: texture },
    uTilt: { value: new THREE.Vector2(0, 0) },
    uTime: { value: 0 },
    uFoil: { value: 1 },
    uFlash: { value: 0 },
    uArt: { value: new THREE.Vector4(70 / CW, 1 - (176 + 620) / CH, (CW - 140) / CW, 620 / CH) },
  },
  vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
  fragmentShader: `
    varying vec2 vUv; uniform sampler2D uMap; uniform vec2 uTilt; uniform float uTime, uFoil, uFlash; uniform vec4 uArt;
    ${noiseGlsl}
    vec3 arcobaleno(float t){ return 0.5 + 0.5*cos(6.28318*(t + vec3(0.0, 0.33, 0.67))); }
    float angoli(vec2 uv, vec2 size, float r){ vec2 q = abs(uv-0.5)*size - (size*0.5 - r); return length(max(q,0.0)) + min(max(q.x,q.y),0.0) - r; }
    void main(){
      vec4 base = texture2D(uMap, vUv);
      float d = angoli(vUv, vec2(2.5,3.5), 0.12);
      float alfa = base.a * (1.0 - smoothstep(-0.004, 0.004, d));
      vec3 col = base.rgb;
      // maschera del lucido: tutta la zona illustrazione, e i bordi metallici
      vec2 ua = (vUv - uArt.xy) / uArt.zw;
      float inArt = step(0.0, ua.x)*step(ua.x,1.0)*step(0.0,ua.y)*step(ua.y,1.0);
      float lum = dot(base.rgb, vec3(0.299,0.587,0.114));
      // il riquadro del testo non riceve l'arcobaleno (resta leggibile)
      float inTesto = step(70.0/1024.0, vUv.x)*step(vUv.x, 954.0/1024.0)*step(1.0-1322.0/1434.0, vUv.y)*step(vUv.y, 1.0-902.0/1434.0);
      float bordo = smoothstep(0.35, 0.8, lum) * (1.0 - inArt) * (1.0 - inTesto);
      float maschera = inArt*0.8 + bordo*0.55;
      float t = vUv.x*1.4 + vUv.y*0.9 + uTilt.x*1.3 - uTilt.y*0.9 + fbm(vUv*5.0 + uTime*0.03)*0.35;
      vec3 foil = arcobaleno(t);
      col += foil * maschera * 0.24 * uFoil;
      // scintille che si accendono a seconda dell'inclinazione
      vec2 cella = floor(vUv*vec2(260.0, 364.0));
      float s = hash(cella);
      float acceso = step(0.992, s) * (0.5 + 0.5*sin(uTime*2.5 + s*60.0 + uTilt.x*9.0 + uTilt.y*7.0));
      col += vec3(1.0,0.95,0.85) * acceso * maschera * uFoil * 1.2;
      // riflesso lucido: una fascia di luce che scorre con l'inclinazione
      float fascia = (vUv.x + vUv.y*0.6) - (0.5 + uTilt.x*0.9 - uTilt.y*0.5);
      float g = exp(-fascia*fascia*40.0);
      col += vec3(1.0,0.97,0.9) * g * (0.05 + 0.22*maschera + 0.06*inTesto) * uFoil;
      col += vec3(0.7,1.0,0.95) * uFlash * (0.6 - abs(vUv.y - 0.5));
      gl_FragColor = vec4(col, alfa);
    }`,
});
const CARTA_W = 2.5;
const CARTA_H = 3.5;
const carta = new THREE.Mesh(new THREE.PlaneGeometry(CARTA_W, CARTA_H), cartaMat);
const gruppo = new THREE.Group();
gruppo.add(carta);
scena.add(gruppo);

// Ombra morbida sotto la carta
const ombra = new THREE.Mesh(
  new THREE.PlaneGeometry(CARTA_W * 1.5, CARTA_H * 1.35),
  new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    uniforms: {},
    vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
    fragmentShader: `varying vec2 vUv; void main(){ vec2 q = (vUv-0.5)*vec2(2.0,2.0); float a = 1.0 - smoothstep(0.35, 1.0, length(q*vec2(1.0,0.95))); gl_FragColor = vec4(0.0,0.0,0.0,a*0.75); }`,
  }),
);
ombra.position.z = -0.15;
gruppo.add(ombra);

// Nebbia di fondo
const nebbia = new THREE.Mesh(
  new THREE.PlaneGeometry(30, 20),
  new THREE.ShaderMaterial({
    depthWrite: false,
    uniforms: { uTime: { value: 0 } },
    vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
    fragmentShader: `varying vec2 vUv; uniform float uTime; ${noiseGlsl}
      void main(){
        float n = fbm(vUv*vec2(6.0,4.0) + vec2(uTime*0.02, -uTime*0.015));
        float n2 = fbm(vUv*vec2(9.0,6.0) - vec2(uTime*0.03, uTime*0.01) + 4.0);
        float v = 1.0 - smoothstep(0.1, 0.75, length((vUv-0.5)*vec2(1.0,1.3)));
        vec3 c = mix(vec3(0.02,0.03,0.06), vec3(0.04,0.20,0.24), n*v) + vec3(0.10,0.04,0.20)*n2*v*0.7;
        gl_FragColor = vec4(c, 1.0);
      }`,
  }),
);
nebbia.position.z = -4;
scena.add(nebbia);

// Particelle: brace/spore che salgono
const N = 260;
const pos = new Float32Array(N * 3);
const vel = new Float32Array(N);
const dim = new Float32Array(N);
const rnd = rumore(11);
for (let i = 0; i < N; i++) {
  pos[i * 3] = (rnd() - 0.5) * 7;
  pos[i * 3 + 1] = (rnd() - 0.5) * 6;
  pos[i * 3 + 2] = -1 + rnd() * 2.5;
  vel[i] = 0.1 + rnd() * 0.35;
  dim[i] = 0.6 + rnd() * 1.6;
}
const geoP = new THREE.BufferGeometry();
geoP.setAttribute('position', new THREE.BufferAttribute(pos, 3));
geoP.setAttribute('aDim', new THREE.BufferAttribute(dim, 1));
const particelle = new THREE.Points(
  geoP,
  new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: { uPx: { value: renderer.getPixelRatio() }, uBoost: { value: 0 } },
    vertexShader: `attribute float aDim; uniform float uPx; varying float vA; void main(){ vec4 mv = modelViewMatrix*vec4(position,1.0); gl_PointSize = aDim*5.0*uPx*(6.0/-mv.z); vA = 0.45 + 0.4*fract(aDim*7.0); gl_Position = projectionMatrix*mv; }`,
    fragmentShader: `varying float vA; uniform float uBoost; void main(){ float d = length(gl_PointCoord-0.5)*2.0; float a = (1.0-smoothstep(0.0,1.0,d))*vA*(1.0+uBoost); gl_FragColor = vec4(vec3(0.35,1.0,0.9)*a, a); }`,
  }),
);
scena.add(particelle);

// ---------- Interazione, animazione, ridimensionamento ----------
const tilt = new THREE.Vector2(0, 0);
const tiltObiettivo = new THREE.Vector2(0, 0);
let trascino = false;
let giroscopio = false;
let inizio = performance.now();
const durata = 1.5;

function adatta(): void {
  const w = window.innerWidth;
  const h = window.innerHeight;
  renderer.setSize(w, h);
  camera.aspect = w / h;
  const tanMezzo = Math.tan((camera.fov * Math.PI) / 360);
  const perAltezza = CARTA_H / 0.74 / (2 * tanMezzo);
  const perLarghezza = CARTA_W / 0.9 / (2 * tanMezzo * camera.aspect);
  camera.position.z = Math.max(perAltezza, perLarghezza);
  camera.updateProjectionMatrix();
}
window.addEventListener('resize', adatta);
adatta();

const rect = (): DOMRect => renderer.domElement.getBoundingClientRect();
function puntatore(e: PointerEvent): void {
  const r = rect();
  tiltObiettivo.set(((e.clientX - r.left) / r.width - 0.5) * 2, -((e.clientY - r.top) / r.height - 0.5) * 2);
}
renderer.domElement.addEventListener('pointerdown', (e) => { trascino = true; puntatore(e); });
renderer.domElement.addEventListener('pointermove', (e) => { if (trascino || e.pointerType === 'mouse') puntatore(e); });
window.addEventListener('pointerup', () => { trascino = false; });

document.getElementById('b-anim')?.addEventListener('click', () => { inizio = performance.now(); });
document.getElementById('b-foil')?.addEventListener('click', () => { cartaMat.uniforms.uFoil.value = cartaMat.uniforms.uFoil.value > 0 ? 0 : 1; });
document.getElementById('b-tilt')?.addEventListener('click', async () => {
  const DOE = (window as unknown as { DeviceOrientationEvent?: { requestPermission?: () => Promise<string> } }).DeviceOrientationEvent;
  try {
    if (DOE?.requestPermission) {
      const r = await DOE.requestPermission();
      if (r !== 'granted') return;
    }
    giroscopio = true;
    window.addEventListener('deviceorientation', (e) => {
      const g = (e.gamma ?? 0) / 30;
      const b = ((e.beta ?? 45) - 45) / 30;
      tiltObiettivo.set(Math.max(-1, Math.min(1, g)), Math.max(-1, Math.min(1, -b)));
    });
  } catch { /* il giroscopio non e' disponibile: si resta con il tocco */ }
});

const easeOutBack = (t: number): number => 1 + 2.70158 * Math.pow(t - 1, 3) + 1.70158 * Math.pow(t - 1, 2);
const orologio = new THREE.Clock();
let frame = 0;

function anima(): void {
  const dt = Math.min(orologio.getDelta(), 0.05);
  const tt = orologio.elapsedTime;
  const p = Math.min(1, (performance.now() - inizio) / 1000 / durata);
  const e = easeOutBack(p);
  // Entrata: la carta arriva da sotto, ruotando, e si assesta
  gruppo.position.y = (1 - e) * -3.2;
  gruppo.position.z = (1 - e) * -2.5;
  const rotEntrata = (1 - e) * Math.PI * 0.9;
  cartaMat.uniforms.uFlash.value = Math.max(0, 1 - Math.abs(p - 0.82) * 6) * 0.5;
  (particelle.material as THREE.ShaderMaterial).uniforms.uBoost.value = Math.max(0, 1 - p) * 2.5;

  if (!trascino && !giroscopio && p >= 1) {
    tiltObiettivo.set(Math.sin(tt * 0.5) * 0.55, Math.cos(tt * 0.37) * 0.35); // oscillazione lenta a riposo
  }
  tilt.lerp(tiltObiettivo, 1 - Math.pow(0.001, dt));
  gruppo.rotation.y = tilt.x * 0.42 + rotEntrata;
  gruppo.rotation.x = -tilt.y * 0.32;
  cartaMat.uniforms.uTilt.value.copy(tilt);
  cartaMat.uniforms.uTime.value = tt;
  (nebbia.material as THREE.ShaderMaterial).uniforms.uTime.value = tt;

  const a = geoP.getAttribute('position') as THREE.BufferAttribute;
  for (let i = 0; i < N; i++) {
    a.array[i * 3 + 1] += vel[i] * dt;
    a.array[i * 3] += Math.sin(tt * 0.7 + i) * 0.003;
    if (a.array[i * 3 + 1] > 3.2) a.array[i * 3 + 1] = -3.2;
  }
  a.needsUpdate = true;

  renderer.render(scena, camera);
  frame++;
  requestAnimationFrame(anima);
}
anima();

// Illustrazione vera (opzionale): se accanto alla pagina c'e' "art.jpg" (immagine generata con ComfyUI), la usa.
const arteImg = new Image();
arteImg.onload = () => { disegnaCarta(cartaCanvas, arteImg); texture.needsUpdate = true; };
const param = new URLSearchParams(location.search).get('art');
arteImg.src = param ?? new URL('art.jpg', location.href).toString();

// Interfaccia per i test automatici (non fa parte del concept).
(window as unknown as Record<string, unknown>).ct = {
  frame: () => frame,
  replay: () => { inizio = performance.now(); },
  fermaTilt: (x: number, y: number) => { trascino = true; tiltObiettivo.set(x, y); },
  tempo: (s: number) => { inizio = performance.now() - s * 1000; },
};
