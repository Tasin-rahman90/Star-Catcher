const arena = document.querySelector('#arena');
const scoreEl = document.querySelector('#score');
const timerEl = document.querySelector('#timer');
const bestEl = document.querySelector('#best');
const timerRing = document.querySelector('.timer-ring');
const startBtn = document.querySelector('#startBtn');
const startLabel = document.querySelector('#startLabel');
const hint = document.querySelector('#hint');
const countdownEl = document.querySelector('#countdown');
const toast = document.querySelector('#toast');

let score = 0;
let timeLeft = 30;
let running = false;
let spawnTimeout;
let clockInterval;
let toastTimeout;
let best = Number(localStorage.getItem('starCatcherBest') || 0);
bestEl.innerHTML = `${String(best).padStart(2, '0')} <span class="best-star">✦</span>`;

function showToast(message) {
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => toast.classList.remove('show'), 2300);
}

function spawnStar() {
  if (!running) return;
  const star = document.createElement('button');
  star.className = 'target';
  star.type = 'button';
  star.textContent = Math.random() < 0.14 ? '✷' : '★';
  star.setAttribute('aria-label', 'Catch star');
  const size = 28 + Math.random() * 12;
  const bounds = arena.getBoundingClientRect();
  const x = 14 + Math.random() * Math.max(0, bounds.width - size - 28);
  const y = 14 + Math.random() * Math.max(0, bounds.height - size - 28);
  star.style.cssText = `left:${x}px;top:${y}px;font-size:${size}px`;
  const lifetime = 850 + Math.random() * 650;
  let alive = true;

  const disappear = () => {
    if (!alive) return;
    alive = false;
    star.remove();
    if (running) spawnTimeout = setTimeout(spawnStar, 180 + Math.random() * 250);
  };

  star.addEventListener('click', (event) => {
    event.stopPropagation();
    if (!running || !alive) return;
    alive = false;
    score += star.textContent === '✷' ? 3 : 1;
    scoreEl.textContent = String(score).padStart(2, '0');
    burst(x + size / 2, y + size / 2);
    star.remove();
    spawnTimeout = setTimeout(spawnStar, 180 + Math.random() * 220);
  });
  arena.append(star);
  setTimeout(disappear, lifetime);
}

function burst(x, y) {
  for (let i = 0; i < 5; i++) {
    const spark = document.createElement('span');
    spark.className = 'spark';
    spark.textContent = i % 2 ? '✧' : '·';
    spark.style.left = `${x}px`;
    spark.style.top = `${y}px`;
    spark.style.setProperty('--x', `${(Math.random() - .5) * 54}px`);
    spark.style.setProperty('--y', `${(Math.random() - .5) * 54}px`);
    arena.append(spark);
    setTimeout(() => spark.remove(), 520);
  }
}

function startGame() {
  clearTimeout(spawnTimeout);
  clearInterval(clockInterval);
  score = 0;
  timeLeft = 30;
  running = false;
  scoreEl.textContent = '00';
  timerEl.textContent = '30';
  timerRing.style.setProperty('--progress', '360deg');
  arena.querySelectorAll('.target,.spark').forEach((el) => el.remove());
  hint.hidden = true;
  startBtn.disabled = true;
  startLabel.textContent = 'Get ready…';

  let count = 3;
  countdownEl.textContent = count;
  const countdown = setInterval(() => {
    count -= 1;
    if (count > 0) {
      countdownEl.textContent = count;
      return;
    }
    clearInterval(countdown);
    countdownEl.textContent = 'GO!';
    setTimeout(() => {
      countdownEl.textContent = '';
      running = true;
      startLabel.textContent = 'Playing…';
      spawnStar();
      clockInterval = setInterval(tick, 1000);
    }, 450);
  }, 700);
}

function tick() {
  timeLeft -= 1;
  timerEl.textContent = String(timeLeft).padStart(2, '0');
  timerRing.style.setProperty('--progress', `${(timeLeft / 30) * 360}deg`);
  if (timeLeft <= 0) endGame();
}

function endGame() {
  running = false;
  clearInterval(clockInterval);
  clearTimeout(spawnTimeout);
  arena.querySelectorAll('.target').forEach((el) => el.remove());
  startBtn.disabled = false;
  startLabel.textContent = 'Play again';
  hint.hidden = false;
  const isNewBest = score > best;
  if (isNewBest) {
    best = score;
    localStorage.setItem('starCatcherBest', String(best));
    bestEl.innerHTML = `${String(best).padStart(2, '0')} <span class="best-star">✦</span>`;
  }
  hint.innerHTML = `<span class="hint-star">${isNewBest && score > 0 ? '✷' : '✦'}</span><strong>${score === 0 ? 'The stars are still out there' : `${score} ${score === 1 ? 'star' : 'stars'} caught!`}</strong><span>${isNewBest && score > 0 ? 'A new personal best. Nicely done!' : 'Ready for another round?'}</span>`;
  if (score >= 20) showToast('Incredible reflexes! You caught a whole constellation. ✨');
  else if (score >= 10) showToast('Lovely catching! The cosmos approves. ✦');
  else showToast('Time’s up! Take another shot?');
}

startBtn.addEventListener('click', startGame);
