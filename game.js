
// ================= Game Constants =================
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const W = canvas.width;
const H = canvas.height;

const basket = { x: W/2-40, y: H-50, w: 80, h: 40, speed: 250 }; // pixels/sec
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

const FRAME_RATE_SCALE = 60; // normalize speeds

// ================= Fruit Spawning =================
function spawnFruit() {
  const size = 30;
  const x = Math.random() * (W - size);
  const speed = 100 + Math.random()*100; // px/sec
  const bonus = Math.random() < 0.1;
  fruits.push({x, y: -size, size, speed, bonus});
}

// ================= Game Loop =================
let last = performance.now();

function loop(now) {
  if (!running) return;
  const dt = (now - last) / 1000; // seconds
  last = now;

  update(dt);
  draw();

  requestAnimationFrame(loop);
}

function start() {
  score = 0; lives = 5; fruits = []; lastSpawn = 0; spawnInterval = 900;
  startTime = Date.now(); running = true;
  scoreEl.textContent = 0; livesEl.textContent = 5; timerEl.textContent = gameDuration;

  last = performance.now(); // reset time
  requestAnimationFrame(loop);
}

function end() {
  running = false;
  alert("Game Over! Final Score: " + score);
}

// ================= Update =================
function update(dt) {
  // spawn
  if(Date.now() - lastSpawn > spawnInterval){
    spawnFruit(); lastSpawn = Date.now();
    if(spawnInterval > 350) spawnInterval -= 10;
  }

  // basket movement (keyboard + touch swipe)
  const movePerSecond = basket.speed;
  if (leftPressed)  basket.x -= movePerSecond * dt;
  if (rightPressed) basket.x += movePerSecond * dt;
  basket.x = Math.max(0, Math.min(W - basket.w, basket.x));

  // fruits
  for(let i = fruits.length-1; i >= 0; i--){
    const f = fruits[i];
    f.y += f.speed * dt;

    if(f.y+f.size > basket.y && f.x < basket.x+basket.w && f.x+f.size > basket.x){
      fruits.splice(i,1);
      if(f.bonus){ score += 5; } else { score += 1; }
      scoreEl.textContent = score;
    } else if(f.y > H){
      fruits.splice(i,1);
      lives--; livesEl.textContent = lives;
      if(lives <= 0) end();
    }
  }

  // timer
  const elapsed = Math.floor((Date.now()-startTime)/1000);
  const remain = Math.max(0, gameDuration - elapsed);
  timerEl.textContent = remain;
  if(remain <= 0) end();
}

// ================= Draw =================
function draw() {
  ctx.clearRect(0,0,W,H);

  // basket
  ctx.fillStyle = "brown";
  ctx.fillRect(basket.x, basket.y, basket.w, basket.h);

  // fruits
  fruits.forEach(f=>{
    ctx.fillStyle = f.bonus ? "gold" : "red";
    ctx.beginPath();
    ctx.arc(f.x+f.size/2, f.y+f.size/2, f.size/2, 0, Math.PI*2);
    ctx.fill();
  });
}

// ================= Controls =================
let leftPressed = false, rightPressed = false;

// keyboard
document.addEventListener('keydown', e=>{
  if(e.key==='ArrowLeft') leftPressed = true;
  if(e.key==='ArrowRight') rightPressed = true;
});
document.addEventListener('keyup', e=>{
  if(e.key==='ArrowLeft') leftPressed = false;
  if(e.key==='ArrowRight') rightPressed = false;
});

// touch swipe
let touchX = null;
document.addEventListener('touchstart', e => {
  touchX = e.touches[0].clientX;
});
document.addEventListener('touchmove', e => {
  let currentX = e.touches[0].clientX;
  let dx = currentX - touchX;
  basket.x += dx; // natural drag
  basket.x = Math.max(0, Math.min(W - basket.w, basket.x));
  touchX = currentX;
});
document.addEventListener('touchend', ()=>{ touchX = null; });

// on-screen buttons
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

// ================= Start Game =================
start();
