const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const startBtn = document.getElementById("startBtn");

let gameRunning = false;

const player = {
  x: 450,
  y: 300,
  size: 20,
  speed: 3,
  hp: 100,
  fireRate: 200,
  lastShot: 0
};

let keys = {};
let enemies = [];
let bullets = [];
let cooldowns = { enemy: 0 };
let score = 0;

// Teclas
document.addEventListener("keydown", e => keys[e.key] = true);
document.addEventListener("keyup", e => keys[e.key] = false);

// Botão start
startBtn.onclick = () => {
  gameRunning = true;
  document.getElementById("ui").style.display = "none";
};

// Spawn inimigos
function spawnEnemy() {
  const side = Math.floor(Math.random() * 4);
  let x, y;

  if (side === 0) { x = 0; y = Math.random() * 600; }
  if (side === 1) { x = 900; y = Math.random() * 600; }
  if (side === 2) { x = Math.random() * 900; y = 0; }
  if (side === 3) { x = Math.random() * 900; y = 600; }

  enemies.push({
    x, y, size: 18, speed: 1 + Math.random(), hp: 30
  });
}

// atirar automático
function shoot() {
  if (!gameRunning) return;
  const now = Date.now();
  if (now - player.lastShot < player.fireRate) return;
  if (!enemies[0]) return;

  player.lastShot = now;

  const target = enemies[0];
  const dx = target.x - player.x;
  const dy = target.y - player.y;
  const dist = Math.hypot(dx, dy);

  bullets.push({
    x: player.x,
    y: player.y,
    vx: (dx / dist) * 7,
    vy: (dy / dist) * 7,
    size: 5
  });
}

// reiniciar
function resetGame() {
  enemies = [];
  bullets = [];
  player.hp = 100;
  player.x = 450;
  player.y = 300;
  score = 0;
  gameRunning = true;
}

// loop
function gameLoop() {
  ctx.clearRect(0, 0, 900, 600);

  if (!gameRunning) {
    ctx.fillStyle = "white";
    ctx.fillText("Clique em JOGAR", 400, 300);
    requestAnimationFrame(gameLoop);
    return;
  }

  // Movimento
  if (keys["w"] || keys["ArrowUp"]) player.y -= player.speed;
  if (keys["s"] || keys["ArrowDown"]) player.y += player.speed;
  if (keys["a"] || keys["ArrowLeft"]) player.x -= player.speed;
  if (keys["d"] || keys["ArrowRight"]) player.x += player.speed;

  shoot();

  // Spawn de inimigos
  if (Date.now() - cooldowns.enemy > 600) {
    spawnEnemy();
    cooldowns.enemy = Date.now();
  }

  // Player
  ctx.fillStyle = "cyan";
  ctx.beginPath();
  ctx.arc(player.x, player.y, player.size, 0, Math.PI * 2);
  ctx.fill();

  // Inimigos
  enemies.forEach((e, ei) => {
    const dx = player.x - e.x;
    const dy = player.y - e.y;
    const dist = Math.hypot(dx, dy);

    e.x += (dx / dist) * e.speed;
    e.y += (dy / dist) * e.speed;

    if (dist < e.size + player.size) {
      player.hp -= 0.3;
    }

    ctx.fillStyle = "red";
    ctx.beginPath();
    ctx.arc(e.x, e.y, e.size, 0, Math.PI * 2);
    ctx.fill();
  });

  // Balas
  bullets.forEach((b, bi) => {
    b.x += b.vx;
    b.y += b.vy;

    enemies.forEach((e, ei) => {
      const d = Math.hypot(b.x - e.x, b.y - e.y);
      if (d < b.size + e.size) {
        enemies.splice(ei, 1);
        bullets.splice(bi, 1);
        score++;
      }
    });

    ctx.fillStyle = "yellow";
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.size, 0, Math.PI*2);
    ctx.fill();
  });

  // HUD
  ctx.fillStyle = "white";
  ctx.fillText("HP: " + Math.floor(player.hp), 20, 20);
  ctx.fillText("Score: " + score, 20, 40);

  // Game over
  if (player.hp <= 0) {
    gameRunning = false;
    document.getElementById("ui").style.display = "block";
    document.getElementById("info").innerText = "GAME OVER - clique JOGAR";
  }

  requestAnimationFrame(gameLoop);
}

gameLoop();
