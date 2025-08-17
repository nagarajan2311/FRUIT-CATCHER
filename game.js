// ================= Game Constants =================
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const W = canvas.width;
const H = canvas.height;

const basket = { x: W/2-40, y: H-50, w: 80, h: 40, speed: 250 };
let fruits = [];
let score = 0;
let lives = 5;
let running = false;

let lastSpawn = 0;
let spawnInterval = 900;
let startTime = 0;
let gameDuration = 60;

const scoreEl = document.getElementById("score");
const livesEl = document.getElementById("lives");
const timerEl = document.getElementById("timer");

const startScreen = document.getElementById("startScreen");
const hud = document.getElementById("hud");
const gameOverScreen = document.getElementById("gameOverScreen");
const finalScoreEl = document.getElementById("finalScore");

let last = performance.now();

// ================= Fruit Spawning =================
function spawnFruit() {
  const size = 30;
  const x = Math.random() * (W - size);
  const speed = 100 + Math.random()*100;
  const bonus = Math.random() < 0.1;
  fruits.push({x, y: -size, size, speed, bonus});
}

// ================= Game Loop =================
function loop(now) {
  if (!running) return;
  const dt = (now - last) / 1000;
  last = now;

  update(dt);
  draw();

  requestAnimationFrame(loop);
}

function startGame() {
  score = 0; lives = 5; fruits = []; lastSpawn = 0; spawnInterval = 900;
  startTime = Date.now(); running = true;
  scoreEl.textContent = 0; livesEl.textContent = 5; timerEl.textContent = gameDuration;

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

// ================= Update =================
function update(dt) {
  if(Date.now() - lastSpawn > spawnInterval){
    spawnFruit(); lastSpawn = Date.now();
    if(spawnInterval > 350) spawnInterval -= 10;
  }

  const movePerSecond = basket.speed;
  if (leftPressed)  basket.x -= movePerSecond * dt;
  if (rightPressed) basket.x += movePerSecond * dt;
  basket.x = Math.max(0, Math.min(W - basket.w, basket.x));

  for(let i = fruits.length-1; i >= 0; i--){
    const f = fruits[i];
    f.y += f.speed * dt;

    if(f.y+f.size > basket.y && f.x < basket.x+basket.w && f.x+f.size > basket.x){
      fruits.splice(i,1);
      score += f.bonus ? 5 : 1;
      scoreEl.textContent = score;
    } else if(f.y > H){
      fruits.splice(i,1);
      lives--; livesEl.textContent = lives;
      if(lives <= 0) endGame();
    }
  }

  const elapsed = Math.floor((Date.now()-startTime)/1000);
  const remain = Math.max(0, gameDuration - elapsed);
  timerEl.textContent = remain;
  if(remain <= 0) endGame();
}

// ================= Draw =================
function draw() {
  ctx.clearRect(0,0,W,H);

  ctx.fillStyle = "brown";
  ctx.fillRect(basket.x, basket.y, basket.w, basket.h);

  fruits.forEach(f=>{
    ctx.fillStyle = f.bonus ? "gold" : "red";
    ctx.beginPath();
    ctx.arc(f.x+f.size/2, f.y+f.size/2, f.size/2, 0, Math.PI*2);
    ctx.fill();
  });
}

// ================= Controls =================
let leftPressed = false, rightPressed = false;

document.addEventListener('keydown', e=>{
  if(e.key==='ArrowLeft') leftPressed = true;
  if(e.key==='ArrowRight') rightPressed = true;
});
document.addEventListener('keyup', e=>{
  if(e.key==='ArrowLeft') leftPressed = false;
  if(e.key==='ArrowRight') rightPressed = false;
});

// swipe
let touchX = null;
document.addEventListener('touchstart', e => {
  touchX = e.touches[0].clientX;
});
document.addEventListener('touchmove', e => {
  let currentX = e.touches[0].clientX;
  let dx = currentX - touchX;
  basket.x += dx;
  basket.x = Math.max(0, Math.min(W - basket.w, basket.x));
  touchX = currentX;
});
document.addEventListener('touchend', ()=>{ touchX = null; });

// buttons
const leftBtn = document.getElementById('leftBtn');
const rightBtn = document.getElementById('rightBtn');

if(leftBtn && rightBtn){
  leftBtn.addEventListener('touchstart', ()=>{ leftPressed = true; });
  leftBtn.addEventListener('touchend', ()=>{ leftPressed = false; });
  rightBtn.addEventListener('touchstart', ()=>{ rightPressed = true; });
  rightBtn.addEventListener('touchend', ()=>{ rightPressed = false; });
  leftBtn.addEventListener('mousedown', ()=>{ leftPressed = true; });
  leftBtn.addEventListener('mouseup', ()=>{ leftPressed = false; });
  rightBtn.addEventListener('mousedown', ()=>{ rightPressed = true; });
  rightBtn.addEventListener('mouseup', ()=>{ rightPressed = false; });
}



