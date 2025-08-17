// =============== game.js (fixed & complete) ===============

// ================= Game Constants =================
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const W = canvas.width;
const H = canvas.height;

// --- image sources (you can replace with your own local files if you want) ---
const fruitSrcs = [
  'https://cdn-icons-png.flaticon.com/512/415/415682.png', // apple
  'https://cdn-icons-png.flaticon.com/512/415/415733.png', // banana
  'https://cdn-icons-png.flaticon.com/512/415/415734.png', // orange
  'https://cdn-icons-png.flaticon.com/512/415/415735.png', // grapes
  'https://cdn-icons-png.flaticon.com/512/415/415736.png'  // watermelon
];

// preload images into fruitImgs[] (Image objects)
const fruitImgs = [];
let imagesLoaded = 0;
fruitSrcs.forEach(src => {
  const img = new Image();
  // try anonymous CORS - safe for many CDNs (if it fails, image still loads without export)
  img.crossOrigin = "anonymous";
  img.onload = () => { imagesLoaded++; };
  img.onerror = () => { imagesLoaded++; /* still count to avoid wait lock */ };
  img.src = src;
  fruitImgs.push(img);
});

// ================= Game state =================
const basket = { x: W/2 - 40, y: H - 70, w: 80, h: 48, speed: 300 }; // speed in px/sec
let fruits = [];
let score = 0;
let lives = 5;
let running = false;

let lastSpawn = 0;
let spawnInterval = 900; // ms
let startTime = 0;
let gameDuration = 60; // seconds

const scoreEl = document.getElementById("score");
const livesEl = document.getElementById("lives");
const timerEl = document.getElementById("timer");

const startScreen = document.getElementById("startScreen");
const hud = document.getElementById("hud");
const gameOverScreen = document.getElementById("gameOverScreen");
const finalScoreEl = document.getElementById("finalScore");

// input flags
let leftPressed = false, rightPressed = false;

// time bookkeeping
let last = performance.now();

// ================= Fruit Spawning =================
function spawnFruit() {
  const size = 38; // size of fruit in px
  const x = Math.random() * (W - size);
  const speed = 120 + Math.random() * 140; // px / sec
  const bonus = Math.random() < 0.12; // ~12% bonus
  const type = Math.floor(Math.random() * fruitImgs.length);
  fruits.push({ x, y: -size, size, speed, bonus, type });
}

// ================= Game Loop =================
function loop(now) {
  if (!running) return;
  const dt = (now - last) / 1000; // seconds
  last = now;

  update(dt);
  draw();

  requestAnimationFrame(loop);
}

function startGame() {
  // Ensure images at least started loading (not required but nicer)
  score = 0;
  lives = 5;
  fruits = [];
  lastSpawn = 0;
  spawnInterval = 900;
  startTime = Date.now();
  running = true;

  scoreEl.textContent = score;
  livesEl.textContent = lives;
  timerEl.textContent = gameDuration;

  // UI
  if (startScreen) startScreen.style.display = "none";
  if (gameOverScreen) gameOverScreen.style.display = "none";
  if (canvas) canvas.style.display = "block";
  if (hud) hud.style.display = "block";

  last = performance.now();
  requestAnimationFrame(loop);
}

function endGame() {
  running = false;
  // UI
  if (canvas) canvas.style.display = "none";
  if (hud) hud.style.display = "none";
  if (gameOverScreen) gameOverScreen.style.display = "block";
  if (finalScoreEl) finalScoreEl.textContent = score;
}

function restartGame() {
  startGame();
}

// ================= Update =================
function update(dt) {
  // spawning
  if (Date.now() - lastSpawn > spawnInterval) {
    spawnFruit();
    lastSpawn = Date.now();
    if (spawnInterval > 350) spawnInterval -= 8; // slowly faster
  }

  // basket movement (keyboard)
  const movePerSecond = basket.speed;
  if (leftPressed)  basket.x -= movePerSecond * dt;
  if (rightPressed) basket.x += movePerSecond * dt;
  // clamp
  basket.x = Math.max(0, Math.min(W - basket.w, basket.x));

  // fruits movement & collision
  for (let i = fruits.length - 1; i >= 0; i--) {
    const f = fruits[i];
    f.y += f.speed * dt;

    // simple AABB collision: fruit box vs basket box
    const fruitLeft = f.x;
    const fruitRight = f.x + f.size;
    const fruitTop = f.y;
    const fruitBottom = f.y + f.size;

    const basketLeft = basket.x;
    const basketRight = basket.x + basket.w;
    const basketTop = basket.y;
    const basketBottom = basket.y + basket.h;

    if (fruitBottom >= basketTop && fruitTop <= basketBottom && fruitRight >= basketLeft && fruitLeft <= basketRight) {
      // caught
      fruits.splice(i, 1);
      score += f.bonus ? 5 : 1;
      if (scoreEl) scoreEl.textContent = score;
      continue;
    }

    // missed (fell beyond bottom)
    if (f.y > H + 40) {
      fruits.splice(i, 1);
      lives--;
      if (livesEl) livesEl.textContent = lives;
      if (lives <= 0) {
        endGame();
        return;
      }
    }
  }

  // timer
  const elapsed = Math.floor((Date.now() - startTime) / 1000);
  const remain = Math.max(0, gameDuration - elapsed);
  if (timerEl) timerEl.textContent = remain;
  if (remain <= 0) {
    endGame();
    return;
  }
}

// ================= Draw =================
function draw() {
  ctx.clearRect(0, 0, W, H);

  // draw basket (you can replace with image later)
  // slight basket shading
  ctx.fillStyle = "#7A4B2A";
  ctx.fillRect(basket.x, basket.y, basket.w, basket.h);
  ctx.fillStyle = "#A36B3A";
  ctx.fillRect(basket.x + 6, basket.y + 6, basket.w - 12, basket.h - 12);

  // draw fruits (image if loaded, fallback circle)
  for (const f of fruits) {
    const img = fruitImgs[f.type];
    if (img && img.complete && img.naturalWidth > 0) {
      // draw image; use rounded corners by default images are square; good enough
      ctx.drawImage(img, f.x, f.y, f.size, f.size);

      if (f.bonus) {
        // glow for bonus fruit
        ctx.strokeStyle = "rgba(255,215,0,0.7)";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.ellipse(f.x + f.size / 2, f.y + f.size / 2, f.size / 2 + 3, f.size / 2 + 3, 0, 0, Math.PI * 2);
        ctx.stroke();
      }
    } else {
      // fallback while image loads
      ctx.fillStyle = f.bonus ? "gold" : "red";
      ctx.beginPath();
      ctx.arc(f.x + f.size / 2, f.y + f.size / 2, f.size / 2, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

// ================= Controls =================
// keyboard hold flags
document.addEventListener('keydown', e => {
  if (e.key === 'ArrowLeft') leftPressed = true;
  if (e.key === 'ArrowRight') rightPressed = true;
});
document.addEventListener('keyup', e => {
  if (e.key === 'ArrowLeft') leftPressed = false;
  if (e.key === 'ArrowRight') rightPressed = false;
});

// touch swipe (drag)
let touchX = null;
document.addEventListener('touchstart', e => {
  if (!e.touches || e.touches.length === 0) return;
  touchX = e.touches[0].clientX;
});
document.addEventListener('touchmove', e => {
  if (!touchX || !e.touches || e.touches.length === 0) return;
  const currentX = e.touches[0].clientX;
  const dx = currentX - touchX;
  // convert screen dx to canvas dx (if your canvas is scaled, convert accordingly)
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  basket.x += dx * scaleX;
  basket.x = Math.max(0, Math.min(W - basket.w, basket.x));
  touchX = currentX;
  // prevent page scrolling while dragging
  e.preventDefault();
}, { passive: false });
document.addEventListener('touchend', () => { touchX = null; });

// on-screen buttons (if present)
const leftBtn = document.getElementById('leftBtn');
const rightBtn = document.getElementById('rightBtn');
if (leftBtn && rightBtn) {
  leftBtn.addEventListener('pointerdown', () => { leftPressed = true; });
  leftBtn.addEventListener('pointerup', () => { leftPressed = false; });
  leftBtn.addEventListener('pointerleave', () => { leftPressed = false; });

  rightBtn.addEventListener('pointerdown', () => { rightPressed = true; });
  rightBtn.addEventListener('pointerup', () => { rightPressed = false; });
  rightBtn.addEventListener('pointerleave', () => { rightPressed = false; });
}

// start/restart hooks for HTML buttons (they should exist in your index.html)
if (typeof startGame === 'undefined') {
  // if user used inline onclick in HTML, these will already exist
  window.startGame = startGame;
  window.restartGame = restartGame;
}

// auto-start if you want (commented out):
// startGame();
