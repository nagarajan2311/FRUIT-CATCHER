
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const W = canvas.width, H = canvas.height;
const scoreEl = document.getElementById('score'), livesEl = document.getElementById('lives');
const timerEl = document.getElementById('timer');
const bgm = document.getElementById('bgm'), catchSfx = document.getElementById('catchSfx'), missSfx = document.getElementById('missSfx');
const gameOverEl = document.getElementById('gameOver'), finalScore = document.getElementById('finalScore');
let score=0, lives=5, running=false, fruits=[], lastSpawn=0, spawnInterval=900, startTime=0, gameDuration=60;
let basket = {x: W/2-60, y: H-140, w:140, h:80, speed:60};

const fruitImgs = {};
['egg','apple','banana','orange'].forEach(n=>{ const i=new Image(); i.src='assets/img/'+n+'.png'; fruitImgs[n]=i; });

function start(){ score=0; lives=5; fruits=[]; lastSpawn=0; spawnInterval=900; startTime = Date.now(); running=true; document.getElementById('score').textContent=0; livesEl.textContent=5; timerEl.textContent=gameDuration;
  bgm.currentTime=0; bgm.play().catch(()=>{});
  requestAnimationFrame(loop);
}

function end(){ running=false; bgm.pause(); finalScore.textContent = score; gameOverEl.classList.remove('hidden'); }

function spawnFruit(){
  const kinds = ['egg','apple','banana','orange'];
  // weighted: egg most common, apple/banana/orange rarer -> bonus fruits give +2
  const weights = [0.6,0.15,0.15,0.1];
  let r=Math.random(), sum=0, idx=0;
  for(let i=0;i<weights.length;i++){ sum+=weights[i]; if(r<=sum){ idx=i; break; } }
  const kind = kinds[idx];
  const img = fruitImgs[kind];
  const x = Math.random() * (W-80) + 40;
  const speed = 2 + Math.random()*2 + ( (Date.now()-startTime)/60000 )*3; // increases over time
  fruits.push({x, y:-40, kind, img, speed, w:img.width, h:img.height});
}

function update(dt){
  // spawn
  if(Date.now() - lastSpawn > spawnInterval){
    spawnFruit(); lastSpawn = Date.now();
    // slowly speed up spawn
    if(spawnInterval>350) spawnInterval -= 10;
  }
  // move fruits
  for(let i=fruits.length-1;i>=0;i--){
    const f = fruits[i];
    f.y += f.speed;
    // catch collision
    if(f.y + f.h/2 >= basket.y && f.x >= basket.x - 10 && f.x <= basket.x + basket.w + 10){
      // caught
      let points = (f.kind==='egg')?1:2;
      score += points; scoreEl.textContent = score; catchSfx.play().catch(()=>{});
      fruits.splice(i,1);
      continue;
    }
    // missed
    if(f.y > H + 40){
      fruits.splice(i,1); lives--; livesEl.textContent = lives; missSfx.play().catch(()=>{});
      if(lives <= 0) end();
    }
  }
  // timer
  const elapsed = Math.floor((Date.now()-startTime)/1000);
  const remain = Math.max(0, gameDuration - elapsed);
  timerEl.textContent = remain;
  if(remain<=0) end();
}

function draw(){
  ctx.clearRect(0,0,W,H);
  // draw basket
  const bimg = new Image(); bimg.src='assets/img/basket.png';
  ctx.drawImage(bimg, basket.x, basket.y, basket.w, basket.h);
  // draw fruits
  for(const f of fruits){
    ctx.drawImage(f.img, f.x - f.w/2, f.y - f.h/2, f.w, f.h);
  }
  // draw simple basket outline for guidance (optional)
  ctx.strokeStyle = 'rgba(0,0,0,0.1)'; ctx.lineWidth=2; ctx.strokeRect(basket.x, basket.y, basket.w, basket.h);
}

let last = performance.now();
function loop(now){
  if(!running) return;
  const dt = now - last; last = now;
  update(dt); draw();
  requestAnimationFrame(loop);
}

// --- Keyboard controls ---
document.addEventListener('keydown', e => {
  if (e.key === 'ArrowLeft') basket.x -= basket.speed * 2;
  if (e.key === 'ArrowRight') basket.x += basket.speed * 2;
  basket.x = Math.max(0, Math.min(W - basket.w, basket.x));
});

// --- Touch swipe controls ---
let touchX = null;

document.addEventListener('touchstart', e => {
  touchX = e.touches[0].clientX;
});

document.addEventListener('touchmove', e => {
  let currentX = e.touches[0].clientX;
  let dx = currentX - touchX;

  basket.x += dx * 0.5; // adjust sensitivity here
  basket.x = Math.max(0, Math.min(W - basket.w, basket.x));

  touchX = currentX;
});

document.addEventListener('touchend', () => {
  touchX = null;
});

// --- Optional: Touch buttons (only if leftBtn & rightBtn exist in HTML) ---
let leftBtn = document.getElementById('leftBtn');
let rightBtn = document.getElementById('rightBtn');

if (leftBtn && rightBtn) {
  leftBtn.addEventListener('touchstart', () => { basket.x -= 40; });
  rightBtn.addEventListener('touchstart', () => { basket.x += 40; });
  leftBtn.addEventListener('click', () => { basket.x -= 40; });
  rightBtn.addEventListener('click', () => { basket.x += 40; });
}

// restart
document.getElementById('restart').addEventListener('click', ()=>{ gameOverEl.classList.add('hidden'); start(); });

// start automatically
window.addEventListener('load', ()=> start());
