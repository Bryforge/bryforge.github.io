const canvas = document.getElementById("smoke-canvas");
const ctx = canvas.getContext("2d", { alpha: true });
const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
let width = 0;
let height = 0;
let particles = [];
let sparks = [];

function resize() {
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  width = window.innerWidth;
  height = window.innerHeight;
  canvas.width = Math.floor(width * ratio);
  canvas.height = Math.floor(height * ratio);
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  particles = Array.from({ length: Math.min(90, Math.floor((width * height) / 13000)) }, makeSmoke);
  sparks = Array.from({ length: Math.min(34, Math.floor((width * height) / 36000)) }, makeSpark);
}

function makeSmoke() {
  return {
    x: Math.random() * width,
    y: height + Math.random() * height * 0.35,
    r: 90 + Math.random() * 210,
    vx: -0.18 + Math.random() * 0.36,
    vy: -0.18 - Math.random() * 0.55,
    a: 0.025 + Math.random() * 0.055,
    hue: 205 + Math.random() * 36,
  };
}

function makeSpark() {
  return {
    x: Math.random() * width,
    y: height + Math.random() * 180,
    vx: -0.2 + Math.random() * 0.4,
    vy: -0.8 - Math.random() * 1.6,
    life: 0.3 + Math.random() * 0.7,
  };
}

function drawSmoke(p) {
  p.x += p.vx;
  p.y += p.vy;
  p.a *= 0.999;
  if (p.y + p.r < -80 || p.x < -p.r || p.x > width + p.r) Object.assign(p, makeSmoke());
  const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r);
  g.addColorStop(0, `hsla(${p.hue}, 20%, 68%, ${p.a})`);
  g.addColorStop(0.46, `hsla(${p.hue}, 16%, 48%, ${p.a * 0.55})`);
  g.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
  ctx.fill();
}

function drawSpark(s) {
  s.x += s.vx;
  s.y += s.vy;
  s.life -= 0.004;
  if (s.y < -20 || s.life <= 0) Object.assign(s, makeSpark());
  ctx.fillStyle = `rgba(255, 126, 48, ${s.life})`;
  ctx.shadowBlur = 18;
  ctx.shadowColor = "rgba(255, 106, 40, 0.9)";
  ctx.beginPath();
  ctx.arc(s.x, s.y, 1.3 + s.life * 2.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
}

function frame() {
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = "rgba(0,0,0,0.2)";
  ctx.fillRect(0, 0, width, height);
  for (const p of particles) drawSmoke(p);
  if (!reduced) for (const s of sparks) drawSpark(s);
  requestAnimationFrame(frame);
}

resize();
requestAnimationFrame(frame);
window.addEventListener("resize", resize);
