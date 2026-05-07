const canvas = document.getElementById("smoke-canvas");
const ctx = canvas.getContext("2d", { alpha: true });
const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
let width = 0;
let height = 0;
let particles = [];
let sparks = [];

const smokeHues = [188, 220, 286, 138];
const sparkHues = [185, 292, 132, 236];

function resize() {
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  width = window.innerWidth;
  height = window.innerHeight;
  canvas.width = Math.floor(width * ratio);
  canvas.height = Math.floor(height * ratio);
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  particles = Array.from({ length: Math.min(110, Math.floor((width * height) / 11500)) }, makeSmoke);
  sparks = Array.from({ length: Math.min(44, Math.floor((width * height) / 31000)) }, makeSpark);
}

function makeSmoke() {
  return {
    x: Math.random() * width,
    y: height + Math.random() * height * 0.35,
    r: 120 + Math.random() * 240,
    vx: -0.22 + Math.random() * 0.44,
    vy: -0.16 - Math.random() * 0.48,
    a: 0.018 + Math.random() * 0.05,
    hue: smokeHues[Math.floor(Math.random() * smokeHues.length)] + Math.random() * 16,
    drift: Math.random() * Math.PI * 2,
  };
}

function makeSpark() {
  return {
    x: Math.random() * width,
    y: height + Math.random() * 180,
    vx: -0.22 + Math.random() * 0.44,
    vy: -0.75 - Math.random() * 1.5,
    life: 0.28 + Math.random() * 0.58,
    hue: sparkHues[Math.floor(Math.random() * sparkHues.length)],
  };
}

function drawSmoke(p) {
  p.drift += 0.006;
  p.x += p.vx + Math.sin(p.drift) * 0.08;
  p.y += p.vy;
  p.a *= 0.9994;
  p.hue = (p.hue + 0.012) % 360;
  if (p.y + p.r < -80 || p.x < -p.r || p.x > width + p.r) Object.assign(p, makeSmoke());
  const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r);
  g.addColorStop(0, `hsla(${p.hue}, 95%, 66%, ${p.a})`);
  g.addColorStop(0.44, `hsla(${(p.hue + 42) % 360}, 88%, 52%, ${p.a * 0.42})`);
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
  ctx.fillStyle = `hsla(${s.hue}, 100%, 66%, ${s.life})`;
  ctx.shadowBlur = 18;
  ctx.shadowColor = `hsla(${s.hue}, 100%, 62%, 0.9)`;
  ctx.beginPath();
  ctx.arc(s.x, s.y, 1.1 + s.life * 2.0, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
}

function frame() {
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = "rgba(0,0,0,0.28)";
  ctx.fillRect(0, 0, width, height);
  for (const p of particles) drawSmoke(p);
  if (!reduced) for (const s of sparks) drawSpark(s);
  requestAnimationFrame(frame);
}

resize();
requestAnimationFrame(frame);
window.addEventListener("resize", resize);
