// === Game Constants =======
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const W = canvas.width;
const H = canvas.height;

// Load fruit images
const fruitImgs = [
  'https://cdn-icons-png.flaticon.com/512/415/415682.png', // Apple
  'https://cdn-icons-png.flaticon.com/512/415/415733.png', // Banana
  'https://cdn-icons-png.flaticon.com/512/415/415734.png', // Orange
  'https://cdn-icons-png.flaticon.com/512/415/415735.png', // Grapes
  'https://cdn-icons-png.flaticon.com/512/415/415736.png'  // Watermelon
].map(src => {
  let img = new Image();
  img.src = src;
  return img;
});

// Basket properties
const basket = { x: W/2-40, y: H-50, w: 80, h: 40, speed: 250 };
let fruits = [];
let score = 0;
let lives = 5;
let running = false;
let lastSpawn = 0;
let spawnInterval = 900;
let startTime = 0;
let gameDuration = 60; // seconds

const scoreEl = document.getElementById("score");
const livesEl = document.getElementById("lives");
const timerEl = document.getElementById("timer");
const startScreen = document.getElementById("startScreen");
const hud = document.getElementById("hud");
const gameOverScreen = document.getElementById("gameOverScreen");
const finalScoreEl = document.getElementById("finalScore");
const leftBtn = document.getElementById('leftBtn');
const rightBtn = document.getElementById('rightBtn');

let last = performance.now();

// === Fruit Spawning =======
function spawnFruit() {
  const size = 30;
  const x = Math.random() * (W - size);
  const speed = 100 + Math.random() * 100;
  const bonus = Math.random() < 0.1;
  const type = Math.floor(Math.random() * fruitImgs.length); // random fruit type
  fruits.push({ x, y: -size, size, speed, bonus, type });
}

// === Game Loop =======
function loop(now) {
  if (!running) return;
  const dt = (now - last) / 1000;
  last = now;
  update(dt);
  draw();
  requestAnimationFrame(loop);
}

function startGame() {
  score = 0;
  lives = 5;
  fruits = [];
  lastSpawn = 0;
  spawnInterval = 900;
  startTime = Date.now();
  running = true;
  scoreEl.textContent = 0;
  livesEl.textContent = 5;
  timerEl.textContent = gameDuration;

  // UI visibility
  startScreen.style.display = "none";
  gameOverScreen.style.display = "none";
  canvas.style.display = "block";
  hud.style.display = "block";

  last = performance.now();
  requestAnimationFrame(loop);
}

function endGame() {
  running = false;
  canvas.style.display = "none";
  hud.style.display = "none";
  gameOverScreen.style.display = "block";
  finalScoreEl.textContent = score;
}

function restartGame() {
  startGame();
}

// === Helpers =======
function rectsOverlap(ax, ay, aw, ah, bx, by, bw, bh) {
  return ax < bx + bw &&
         ax + aw > bx &&
         ay < by + bh &&
         ay + ah > by;
}

// === Update =======
function update(dt) {
  // Spawn fruits at interval
  if (Date.now() - lastSpawn > spawnInterval) {
    spawnFruit();
    lastSpawn = Date.now();
    if (spawnInterval > 350) spawnInterval -= 10;
  }

  // Move basket
  const movePerSecond = basket.speed;
  if (leftPressed) basket.x -= movePerSecond * dt;
  if (rightPressed) basket.x += movePerSecond * dt;
  basket.x = Math.max(0, Math.min(W - basket.w, basket.x));

  // Update fruits
  for (let i = fruits.length - 1; i >= 0; i--) {
    const f = fruits[i];
    f.y += f.speed * dt;

    // Check collision
    if (rectsOverlap(f.x, f.y, f.size, f.size, basket.x, basket.y, basket.w, basket.h)) {
      fruits.splice(i, 1);
      score += f.bonus ? 5 : 1;
      scoreEl.textContent = score;
    } else if (f.y > H) {
      fruits.splice(i, 1);
      lives--;
      livesEl.textContent = lives;
      if (lives <= 0) endGame();
    }
  }

  // Timer
  const elapsed = Math.floor((Date.now() - startTime) / 1000);
  const remain = Math.max(0, gameDuration - elapsed);
  timerEl.textContent = remain;
  if (remain <= 0) endGame();
}

// === Draw =======
function draw() {
  ctx.clearRect(0, 0, W, H);

  // Draw basket
  ctx.fillStyle = "brown";
  ctx.fillRect(basket.x, basket.y, basket.w, basket.h);

  // Draw fruits
  fruits.forEach(f => {
    let img = fruitImgs[f.type % fruitImgs.length];
    ctx.drawImage(img, f.x, f.y, f.size, f.size);
    if (f.bonus) {
      ctx.save();
      ctx.strokeStyle = 'gold';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(f.x + f.size / 2, f.y + f.size / 2, f.size / 2, 0, 2 * Math.PI);
      ctx.stroke();
      ctx.restore();
    }
  });
}

// === Controls =======
let leftPressed = false, rightPressed = false;

document.addEventListener('keydown', e => {
  if (e.key === 'ArrowLeft') leftPressed = true;
  if (e.key === 'ArrowRight') rightPressed = true;
});
document.addEventListener('keyup', e => {
  if (e.key === 'ArrowLeft') leftPressed = false;
  if (e.key === 'ArrowRight') rightPressed = false;
});

// Touch swipe
let touchX = null;
canvas.addEventListener('touchstart', e => {
  if (e.touches.length) touchX = e.touches[0].clientX;
});
canvas.addEventListener('touchmove', e => {
  if (e.touches.length) {
    let currentX = e.touches[0].clientX;
    let dx = currentX - touchX;
    basket.x += dx;
    basket.x = Math.max(0, Math.min(W - basket.w, basket.x));
    touchX = currentX;
  }
});
canvas.addEventListener('touchend', () => { touchX = null; });

// Button controls
if (leftBtn && rightBtn) {
  leftBtn.addEventListener('touchstart', () => { leftPressed = true; });
  leftBtn.addEventListener('touchend', () => { leftPressed = false; });
  rightBtn.addEventListener('touchstart', () => { rightPressed = true; });
  rightBtn.addEventListener('touchend', () => { rightPressed = false; });
  leftBtn.addEventListener('mousedown', () => { leftPressed = true; });
  leftBtn.addEventListener('mouseup', () => { leftPressed = false; });
  rightBtn.addEventListener('mousedown', () => { rightPressed = true; });
  rightBtn.addEventListener('mouseup', () => { rightPressed = false; });
}

// === Start/restart listeners ===
if (startScreen) {
  startScreen.querySelector('button').addEventListener('click', startGame);
}
if (gameOverScreen) {
  gameOverScreen.querySelector('button').addEventListener('click', restartGame);
}

// Optionally, call startGame automatically or let user start via button
// startGame();

