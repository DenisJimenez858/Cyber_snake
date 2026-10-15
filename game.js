/**
 * CyberSnake Arcade - Ultimate Engine v2.0
 * Features:
 * - 4 Game Modes: Classic, Time Attack, Maze (Obstacles), Portal Mode
 * - 4 Themes: Cyberpunk, Matrix, Vaporwave, Rainbow RGB
 * - Power-ups: Magnet 🧲, Slow-Mo ⏱️, Ghost 👻, Scissors ✂️, Bonus Star ⭐
 * - Web Audio Chiptune BGM & Sound FX
 * - Haptic Vibration Feedback for mobile
 * - Arcade Hall of Fame Top 5 with 3 Initials
 * - Matrix Digital Rain Background
 */

document.addEventListener('DOMContentLoaded', () => {
  // Canvas Setup
  const canvas = document.getElementById('gameCanvas');
  const ctx = canvas.getContext('2d');
  
  // Matrix Background Canvas
  const matrixCanvas = document.getElementById('matrixCanvas');
  const matrixCtx = matrixCanvas.getContext('2d');

  // HUD Elements
  const scoreDisplay = document.getElementById('scoreDisplay');
  const highScoreDisplay = document.getElementById('highScoreDisplay');
  const multiplierDisplay = document.getElementById('multiplierDisplay');
  const dynamicStatLabel = document.getElementById('dynamicStatLabel');
  const dynamicStatValue = document.getElementById('dynamicStatValue');

  // Powerup Banner Elements
  const activePowerupBanner = document.getElementById('activePowerupBanner');
  const powerupIcon = document.getElementById('powerupIcon');
  const powerupName = document.getElementById('powerupName');
  const powerupProgressBar = document.getElementById('powerupProgressBar');
  const powerupTimeText = document.getElementById('powerupTimeText');

  // Screen Overlays
  const screenOverlay = document.getElementById('screenOverlay');
  const startScreen = document.getElementById('startScreen');
  const pauseScreen = document.getElementById('pauseScreen');
  const gameOverScreen = document.getElementById('gameOverScreen');
  const leaderboardScreen = document.getElementById('leaderboardScreen');
  const finalScoreEl = document.getElementById('finalScore');
  const modeDescriptionPill = document.getElementById('modeDescriptionPill');

  // Initials Entry Elements
  const initialsEntryContainer = document.getElementById('initialsEntryContainer');
  const letter1 = document.getElementById('letter1');
  const letter2 = document.getElementById('letter2');
  const letter3 = document.getElementById('letter3');
  const init1Up = document.getElementById('init1Up');
  const init1Down = document.getElementById('init1Down');
  const init2Up = document.getElementById('init2Up');
  const init2Down = document.getElementById('init2Down');
  const init3Up = document.getElementById('init3Up');
  const init3Down = document.getElementById('init3Down');
  const btnSaveInitials = document.getElementById('btnSaveInitials');
  const leaderboardBody = document.getElementById('leaderboardBody');

  // Action Buttons
  const btnPlay = document.getElementById('btnPlay');
  const btnRestart = document.getElementById('btnRestart');
  const btnResume = document.getElementById('btnResume');
  const btnPauseGame = document.getElementById('btnPauseGame');
  const btnResetGame = document.getElementById('btnResetGame');
  const btnSoundToggle = document.getElementById('btnSoundToggle');
  const btnMusicToggle = document.getElementById('btnMusicToggle');
  const btnCrtToggle = document.getElementById('btnCrtToggle');
  const btnOpenLeaderboard = document.getElementById('btnOpenLeaderboard');
  const btnCloseLeaderboard = document.getElementById('btnCloseLeaderboard');
  const btnShowLeaderboardFromOver = document.getElementById('btnShowLeaderboardFromOver');

  // Selectors
  const modeSelect = document.getElementById('modeSelect');
  const themeSelect = document.getElementById('themeSelect');
  const difficultySelect = document.getElementById('difficultySelect');

  // Virtual D-Pad
  const dpadUp = document.getElementById('dpadUp');
  const dpadDown = document.getElementById('dpadDown');
  const dpadLeft = document.getElementById('dpadLeft');
  const dpadRight = document.getElementById('dpadRight');

  // Grid Configuration
  const GRID_SIZE = 20;
  const TILE_COUNT = canvas.width / GRID_SIZE; // 24 tiles

  // States
  const STATES = {
    MENU: 'MENU',
    PLAYING: 'PLAYING',
    PAUSED: 'PAUSED',
    GAMEOVER: 'GAMEOVER',
    LEADERBOARD: 'LEADERBOARD'
  };

  let gameState = STATES.MENU;
  let previousState = STATES.MENU;
  let score = 0;
  let multiplier = 1.0;
  let lastEatTime = 0;
  let level = 1;
  let timeLeft = 60; // for Time Attack mode
  let lastSecondTime = 0;

  // Snake State
  let snake = [];
  let velocity = { x: 1, y: 0 };
  let nextVelocity = { x: 1, y: 0 };

  // Items State
  let food = { x: 5, y: 5 };
  let activePowerupItem = null; // Power-up spawned on the grid to be collected
  let currentActivePowerup = null; // Power-up currently active on the snake
  let foodsEatenCount = 0;

  // Obstacles (Maze mode)
  let obstacles = [];

  // Portals (Portal mode)
  let portalA = null;
  let portalB = null;

  // Particle System
  let particles = [];
  let trailParticles = [];

  // Timing
  let lastFrameTime = 0;
  let moveInterval = 120;
  let timeSinceLastMove = 0;

  // Difficulties Map
  const DIFFICULTY_SETTINGS = {
    easy: { baseSpeed: 150, speedStep: 3, minSpeed: 85 },
    normal: { baseSpeed: 120, speedStep: 4, minSpeed: 60 },
    hard: { baseSpeed: 95, speedStep: 5, minSpeed: 45 },
    hyper: { baseSpeed: 68, speedStep: 6, minSpeed: 35 }
  };
  let currentDifficulty = DIFFICULTY_SETTINGS.normal;

  // Modes metadata
  const MODES_INFO = {
    classic: { name: 'Clásico', desc: 'Modo Clásico: Recoge comida, usa power-ups y evita las paredes.' },
    timeattack: { name: 'Contrarreloj', desc: 'Contrarreloj: 60s iniciales. Cada comida suma +3s. ¡Consigue el récord!' },
    maze: { name: 'Laberinto', desc: 'Laberinto: Esquiva barreras láser que aparecen en el mapa.' },
    portal: { name: 'Portales', desc: 'Portales: Entra por el portal Azul o Naranja para teletransportarte.' }
  };

  // Letters for initials entry
  const CHARACTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let initIndices = [0, 0, 0];

  // Default Leaderboard
  const DEFAULT_LEADERBOARD = [
    { name: 'DNS', score: 1850, mode: 'Clásico' },
    { name: 'NEO', score: 1420, mode: 'Matrix' },
    { name: 'CYB', score: 1100, mode: 'Portales' },
    { name: 'VAP', score: 850, mode: 'Contrarreloj' },
    { name: 'ACE', score: 620, mode: 'Laberinto' }
  ];

  function getLeaderboard() {
    try {
      const data = localStorage.getItem('cybersnake_leaderboard_v2');
      if (data) return JSON.parse(data);
    } catch (e) {}
    return [...DEFAULT_LEADERBOARD];
  }

  function saveLeaderboard(board) {
    localStorage.setItem('cybersnake_leaderboard_v2', JSON.stringify(board));
  }

  function getTopScore() {
    const board = getLeaderboard();
    return board.length > 0 ? board[0].score : 0;
  }

  // Haptic feedback helper
  function triggerHaptic(type) {
    if (!navigator.vibrate) return;
    try {
      if (type === 'eat') navigator.vibrate(15);
      else if (type === 'powerup') navigator.vibrate(35);
      else if (type === 'crash') navigator.vibrate([70, 30, 110]);
    } catch (e) {}
  }

  // Initialize Matrix digital rain
  function initMatrixRain() {
    matrixCanvas.width = window.innerWidth;
    matrixCanvas.height = window.innerHeight;
    const columns = Math.floor(matrixCanvas.width / 20);
    const drops = [];
    for (let i = 0; i < columns; i++) {
      drops[i] = Math.floor(Math.random() * -100);
    }

    function drawMatrix() {
      if (!document.body.classList.contains('theme-matrix')) {
        matrixCtx.clearRect(0, 0, matrixCanvas.width, matrixCanvas.height);
        requestAnimationFrame(drawMatrix);
        return;
      }

      matrixCtx.fillStyle = 'rgba(2, 11, 5, 0.1)';
      matrixCtx.fillRect(0, 0, matrixCanvas.width, matrixCanvas.height);

      matrixCtx.fillStyle = '#00ff66';
      matrixCtx.font = '14px monospace';

      for (let i = 0; i < drops.length; i++) {
        const char = String.fromCharCode(0x30A0 + Math.random() * 96);
        const x = i * 20;
        const y = drops[i] * 20;

        matrixCtx.fillText(char, x, y);

        if (y > matrixCanvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }
      requestAnimationFrame(drawMatrix);
    }
    requestAnimationFrame(drawMatrix);
  }
  initMatrixRain();

  window.addEventListener('resize', () => {
    matrixCanvas.width = window.innerWidth;
    matrixCanvas.height = window.innerHeight;
  });

  // Reset / Start Game
  function resetGame() {
    snake = [
      { x: 10, y: 12 },
      { x: 9, y: 12 },
      { x: 8, y: 12 }
    ];
    velocity = { x: 1, y: 0 };
    nextVelocity = { x: 1, y: 0 };
    score = 0;
    multiplier = 1.0;
    level = 1;
    timeLeft = 60;
    foodsEatenCount = 0;
    activePowerupItem = null;
    currentActivePowerup = null;
    particles = [];
    trailParticles = [];

    currentDifficulty = DIFFICULTY_SETTINGS[difficultySelect.value] || DIFFICULTY_SETTINGS.normal;
    moveInterval = currentDifficulty.baseSpeed;

    generateObstacles();
    generatePortals();
    spawnFood();
    updateHUD();
    hidePowerupBanner();
  }

  function generateObstacles() {
    obstacles = [];
    if (modeSelect.value !== 'maze') return;
    const count = 4 + (level - 1) * 2;
    for (let i = 0; i < count; i++) {
      let valid = false;
      let obs = {};
      while (!valid) {
        obs = {
          x: Math.floor(Math.random() * (TILE_COUNT - 4)) + 2,
          y: Math.floor(Math.random() * (TILE_COUNT - 4)) + 2
        };
        valid = !snake.some(s => s.x === obs.x && s.y === obs.y) &&
                !obstacles.some(o => o.x === obs.x && o.y === obs.y);
      }
      obstacles.push(obs);
    }
  }

  function generatePortals() {
    portalA = null;
    portalB = null;
    if (modeSelect.value !== 'portal') return;

    portalA = { x: 3, y: Math.floor(TILE_COUNT / 2), color: '#00d4ff' };
    portalB = { x: TILE_COUNT - 4, y: Math.floor(TILE_COUNT / 2), color: '#ff7b00' };
  }

  function updateHUD() {
    scoreDisplay.textContent = padZero(score);
    highScoreDisplay.textContent = padZero(getTopScore());
    multiplierDisplay.textContent = `x${multiplier.toFixed(1)}`;

    if (modeSelect.value === 'timeattack') {
      dynamicStatLabel.textContent = 'TIEMPO';
      dynamicStatValue.textContent = `${Math.ceil(timeLeft)}s`;
      if (timeLeft <= 10) {
        dynamicStatValue.style.color = '#ff0055';
      } else {
        dynamicStatValue.style.color = '#39ff14';
      }
    } else {
      dynamicStatLabel.textContent = 'LEVEL';
      dynamicStatValue.textContent = `LVL ${level}`;
      dynamicStatValue.style.color = '#39ff14';
    }
  }

  function padZero(num, length = 4) {
    return String(num).padStart(length, '0');
  }

  function spawnFood() {
    let valid = false;
    while (!valid) {
      food = {
        x: Math.floor(Math.random() * TILE_COUNT),
        y: Math.floor(Math.random() * TILE_COUNT)
      };
      valid = !snake.some(s => s.x === food.x && s.y === food.y) &&
              !obstacles.some(o => o.x === food.x && o.y === food.y) &&
              !(portalA && portalA.x === food.x && portalA.y === food.y) &&
              !(portalB && portalB.x === food.x && portalB.y === food.y);
    }
  }

  // Spawns a special powerup item onto the grid
  function spawnPowerup() {
    const types = ['MAGNET', 'SLOWMO', 'GHOST', 'SCISSORS', 'BONUS'];
    const chosenType = types[Math.floor(Math.random() * types.length)];
    let valid = false;
    let pos = {};
    while (!valid) {
      pos = {
        x: Math.floor(Math.random() * TILE_COUNT),
        y: Math.floor(Math.random() * TILE_COUNT)
      };
      valid = !snake.some(s => s.x === pos.x && s.y === pos.y) &&
              !obstacles.some(o => o.x === pos.x && o.y === pos.y) &&
              (pos.x !== food.x || pos.y !== food.y);
    }

    activePowerupItem = {
      type: chosenType,
      x: pos.x,
      y: pos.y,
      expiresAt: Date.now() + 8500
    };
  }

  // Activate power-up effects
  function activatePowerup(type) {
    triggerHaptic('powerup');
    window.arcadeAudio.playPowerup();

    if (type === 'SCISSORS') {
      // Instant action: cut tail in half
      window.arcadeAudio.playCutTail();
      const newLength = Math.max(3, Math.floor(snake.length / 2));
      snake = snake.slice(0, newLength);
      score += 50;
      createExplosion(snake[0].x, snake[0].y, '#00f0ff', 25);
      showTemporaryBanner('✂️', 'TIJERA: COLA REDUCIDA', 2000);
      return;
    }

    if (type === 'BONUS') {
      window.arcadeAudio.playBonus();
      score += Math.round(60 * multiplier);
      if (modeSelect.value === 'timeattack') timeLeft += 6;
      createExplosion(snake[0].x, snake[0].y, '#ffe600', 30);
      showTemporaryBanner('⭐', 'GEMA DORADA (+60)', 2000);
      return;
    }

    // Timed power-ups: MAGNET, SLOWMO, GHOST
    let duration = 7000;
    let nameText = '';
    let icon = '';

    if (type === 'MAGNET') {
      nameText = 'IMÁN ACTIVADO';
      icon = '🧲';
    } else if (type === 'SLOWMO') {
      nameText = 'SLOW-MO (CÁMARA LENTA)';
      icon = '⏱️';
      window.arcadeAudio.playSlowMo();
    } else if (type === 'GHOST') {
      nameText = 'MODO FANTASMA';
      icon = '👻';
      window.arcadeAudio.playGhost();
    }

    currentActivePowerup = {
      type: type,
      icon: icon,
      name: nameText,
      duration: duration,
      endsAt: Date.now() + duration
    };

    activePowerupBanner.classList.remove('hidden');
    powerupIcon.textContent = icon;
    powerupName.textContent = nameText;
  }

  function showTemporaryBanner(icon, text, ms) {
    activePowerupBanner.classList.remove('hidden');
    powerupIcon.textContent = icon;
    powerupName.textContent = text;
    powerupProgressBar.style.width = '100%';
    powerupTimeText.textContent = 'OK';
    setTimeout(() => {
      if (!currentActivePowerup) {
        hidePowerupBanner();
      }
    }, ms);
  }

  function hidePowerupBanner() {
    activePowerupBanner.classList.add('hidden');
  }

  // Particle Explosions
  function createExplosion(tileX, tileY, color, count = 16) {
    const pixelX = tileX * GRID_SIZE + GRID_SIZE / 2;
    const pixelY = tileY * GRID_SIZE + GRID_SIZE / 2;
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 / count) * i + (Math.random() - 0.5);
      const speed = 1.5 + Math.random() * 3.5;
      particles.push({
        x: pixelX,
        y: pixelY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        alpha: 1.0,
        color: color,
        size: 2.5 + Math.random() * 2.5
      });
    }
  }

  // Game Loop Update
  function update(delta) {
    if (gameState !== STATES.PLAYING) return;

    // Time Attack Countdown
    if (modeSelect.value === 'timeattack') {
      timeLeft -= delta / 1000;
      if (timeLeft <= 0) {
        timeLeft = 0;
        triggerGameOver();
        return;
      }
      // Low time sound warning
      if (timeLeft <= 10 && Date.now() - lastSecondTime >= 1000) {
        lastSecondTime = Date.now();
        window.arcadeAudio.playTimeWarning();
      }
      updateHUD();
    }

    // Active Power-up countdown
    if (currentActivePowerup) {
      const remainingMs = currentActivePowerup.endsAt - Date.now();
      if (remainingMs <= 0) {
        currentActivePowerup = null;
        hidePowerupBanner();
      } else {
        const percent = (remainingMs / currentActivePowerup.duration) * 100;
        powerupProgressBar.style.width = `${percent}%`;
        powerupTimeText.textContent = `${(remainingMs / 1000).toFixed(1)}s`;
      }
    }

    // Power-up item on grid expiration check
    if (activePowerupItem && Date.now() > activePowerupItem.expiresAt) {
      activePowerupItem = null;
    }

    // Update Particles
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.alpha -= 0.035;
      if (p.alpha <= 0) particles.splice(i, 1);
    }

    // Update Trail Particles
    for (let i = trailParticles.length - 1; i >= 0; i--) {
      const tp = trailParticles[i];
      tp.alpha -= 0.05;
      if (tp.alpha <= 0) trailParticles.splice(i, 1);
    }

    // Multiplier decay
    if (multiplier > 1.0 && Date.now() - lastEatTime > 4500) {
      multiplier = Math.max(1.0, multiplier - 0.5);
      multiplierDisplay.textContent = `x${multiplier.toFixed(1)}`;
    }

    // Calculate effective move speed
    let effectiveInterval = moveInterval;
    if (currentActivePowerup && currentActivePowerup.type === 'SLOWMO') {
      effectiveInterval = Math.round(moveInterval * 1.6);
    }

    // Movement Trigger
    timeSinceLastMove += delta;
    if (timeSinceLastMove >= effectiveInterval) {
      timeSinceLastMove = 0;
      stepSnake();
    }
  }

  function stepSnake() {
    velocity = { ...nextVelocity };

    let head = { ...snake[0] };
    head.x += velocity.x;
    head.y += velocity.y;

    const isGhost = currentActivePowerup && currentActivePowerup.type === 'GHOST';

    // Portal Teleportation
    if (modeSelect.value === 'portal' && portalA && portalB) {
      if (head.x === portalA.x && head.y === portalA.y) {
        head = { x: portalB.x + velocity.x, y: portalB.y + velocity.y };
        window.arcadeAudio.playPortal();
        createExplosion(portalA.x, portalA.y, portalA.color, 18);
        createExplosion(portalB.x, portalB.y, portalB.color, 18);
      } else if (head.x === portalB.x && head.y === portalB.y) {
        head = { x: portalA.x + velocity.x, y: portalA.y + velocity.y };
        window.arcadeAudio.playPortal();
        createExplosion(portalB.x, portalB.y, portalB.color, 18);
        createExplosion(portalA.x, portalA.y, portalA.color, 18);
      }
    }

    // Wall Collision Check (Ghost mode wraps around walls!)
    if (head.x < 0 || head.x >= TILE_COUNT || head.y < 0 || head.y >= TILE_COUNT) {
      if (isGhost) {
        head.x = (head.x + TILE_COUNT) % TILE_COUNT;
        head.y = (head.y + TILE_COUNT) % TILE_COUNT;
      } else {
        triggerGameOver();
        return;
      }
    }

    // Obstacle Collision Check
    if (obstacles.some(o => o.x === head.x && o.y === head.y)) {
      if (!isGhost) {
        triggerGameOver();
        return;
      }
    }

    // Self Collision Check
    for (let i = 0; i < snake.length; i++) {
      if (snake[i].x === head.x && snake[i].y === head.y) {
        if (!isGhost) {
          triggerGameOver();
          return;
        }
      }
    }

    // Add trail spark at previous head position
    trailParticles.push({
      x: snake[0].x * GRID_SIZE + GRID_SIZE / 2,
      y: snake[0].y * GRID_SIZE + GRID_SIZE / 2,
      alpha: 0.8,
      size: 3
    });

    snake.unshift(head);

    // Magnet Power-up Logic: pull food or power-up closer
    if (currentActivePowerup && currentActivePowerup.type === 'MAGNET') {
      pullItemTowardsHead(food, head);
      if (activePowerupItem) pullItemTowardsHead(activePowerupItem, head);
    }

    let grew = false;

    // Normal Food Eaten
    if (head.x === food.x && head.y === food.y) {
      grew = true;
      foodsEatenCount++;
      const now = Date.now();

      if (now - lastEatTime < 3500) {
        multiplier = Math.min(4.0, +(multiplier + 0.5).toFixed(1));
      } else {
        multiplier = 1.0;
      }
      lastEatTime = now;

      const earned = Math.round(10 * multiplier * level);
      score += earned;
      if (modeSelect.value === 'timeattack') timeLeft += 3;

      createExplosion(food.x, food.y, '#ff007f', 18);
      window.arcadeAudio.playEat();
      triggerHaptic('eat');

      // Level Progression
      if (foodsEatenCount % 5 === 0) {
        level++;
        moveInterval = Math.max(currentDifficulty.minSpeed, currentDifficulty.baseSpeed - (level * currentDifficulty.speedStep));
        window.arcadeAudio.playLevelUp();
        window.arcadeAudio.setBpm(128 + level * 4);
        if (modeSelect.value === 'maze') generateObstacles();
      }

      // Chance to spawn special power-up item
      if (foodsEatenCount % 3 === 0 && !activePowerupItem) {
        spawnPowerup();
      }

      spawnFood();
      updateHUD();
    }

    // Power-up Item Eaten
    if (activePowerupItem && head.x === activePowerupItem.x && head.y === activePowerupItem.y) {
      grew = true;
      createExplosion(activePowerupItem.x, activePowerupItem.y, '#ffe600', 25);
      activatePowerup(activePowerupItem.type);
      activePowerupItem = null;
      updateHUD();
    }

    if (!grew) {
      snake.pop();
    }
  }

  function pullItemTowardsHead(item, head) {
    const dist = Math.hypot(head.x - item.x, head.y - item.y);
    if (dist > 0 && dist <= 6) {
      if (item.x < head.x) item.x++;
      else if (item.x > head.x) item.x--;
      if (item.y < head.y) item.y++;
      else if (item.y > head.y) item.y--;
    }
  }

  function triggerGameOver() {
    gameState = STATES.GAMEOVER;
    triggerHaptic('crash');
    window.arcadeAudio.playGameOver();

    finalScoreEl.textContent = score;

    // Check if score qualifies for Hall of Fame
    const leaderboard = getLeaderboard();
    const qualifies = leaderboard.length < 5 || score > leaderboard[leaderboard.length - 1].score;

    if (qualifies && score > 0) {
      initialsEntryContainer.classList.remove('hidden');
      initIndices = [0, 0, 0];
      updateInitialLetters();
    } else {
      initialsEntryContainer.classList.add('hidden');
    }

    screenOverlay.classList.remove('hidden');
    startScreen.classList.add('hidden');
    pauseScreen.classList.add('hidden');
    leaderboardScreen.classList.add('hidden');
    gameOverScreen.classList.remove('hidden');
  }

  // Initials Selection
  function updateInitialLetters() {
    letter1.textContent = CHARACTERS[initIndices[0]];
    letter2.textContent = CHARACTERS[initIndices[1]];
    letter3.textContent = CHARACTERS[initIndices[2]];
  }

  function cycleInitial(index, delta) {
    initIndices[index] = (initIndices[index] + delta + CHARACTERS.length) % CHARACTERS.length;
    updateInitialLetters();
    window.arcadeAudio.playTick();
  }

  init1Up.addEventListener('click', () => cycleInitial(0, 1));
  init1Down.addEventListener('click', () => cycleInitial(0, -1));
  init2Up.addEventListener('click', () => cycleInitial(1, 1));
  init2Down.addEventListener('click', () => cycleInitial(1, -1));
  init3Up.addEventListener('click', () => cycleInitial(2, 1));
  init3Down.addEventListener('click', () => cycleInitial(2, -1));

  btnSaveInitials.addEventListener('click', () => {
    const initials = `${CHARACTERS[initIndices[0]]}${CHARACTERS[initIndices[1]]}${CHARACTERS[initIndices[2]]}`;
    const modeName = MODES_INFO[modeSelect.value]?.name || 'Clásico';

    const board = getLeaderboard();
    board.push({ name: initials, score: score, mode: modeName });
    board.sort((a, b) => b.score - a.score);
    const top5 = board.slice(0, 5);
    saveLeaderboard(top5);

    initialsEntryContainer.classList.add('hidden');
    showLeaderboard();
  });

  // Render Leaderboard Table
  function showLeaderboard() {
    previousState = gameState;
    gameState = STATES.LEADERBOARD;

    const board = getLeaderboard();
    leaderboardBody.innerHTML = '';
    board.forEach((entry, idx) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${idx + 1}</td>
        <td><strong>${entry.name}</strong></td>
        <td>${entry.score}</td>
        <td><span class="badge">${entry.mode}</span></td>
      `;
      leaderboardBody.appendChild(tr);
    });

    screenOverlay.classList.remove('hidden');
    startScreen.classList.add('hidden');
    pauseScreen.classList.add('hidden');
    gameOverScreen.classList.add('hidden');
    leaderboardScreen.classList.remove('hidden');
  }

  btnCloseLeaderboard.addEventListener('click', () => {
    leaderboardScreen.classList.add('hidden');
    if (previousState === STATES.GAMEOVER) {
      gameOverScreen.classList.remove('hidden');
      gameState = STATES.GAMEOVER;
    } else {
      startScreen.classList.remove('hidden');
      gameState = STATES.MENU;
    }
  });

  btnOpenLeaderboard.addEventListener('click', showLeaderboard);
  btnShowLeaderboardFromOver.addEventListener('click', showLeaderboard);

  // Drawing Routine
  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Subtle Grid background
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
    ctx.lineWidth = 1;
    for (let x = 0; x <= canvas.width; x += GRID_SIZE) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    for (let y = 0; y <= canvas.height; y += GRID_SIZE) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    // Draw Obstacles (Maze Mode)
    if (obstacles.length > 0) {
      obstacles.forEach(o => {
        ctx.save();
        ctx.fillStyle = '#ff2a2a';
        ctx.shadowColor = '#ff2a2a';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.roundRect(o.x * GRID_SIZE + 2, o.y * GRID_SIZE + 2, GRID_SIZE - 4, GRID_SIZE - 4, 3);
        ctx.fill();

        // Warning hash pattern
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(o.x * GRID_SIZE + 4, o.y * GRID_SIZE + 4);
        ctx.lineTo(o.x * GRID_SIZE + GRID_SIZE - 4, o.y * GRID_SIZE + GRID_SIZE - 4);
        ctx.stroke();
        ctx.restore();
      });
    }

    // Draw Portals (Portal Mode)
    if (portalA && portalB) {
      [portalA, portalB].forEach(p => {
        const px = p.x * GRID_SIZE + GRID_SIZE / 2;
        const py = p.y * GRID_SIZE + GRID_SIZE / 2;
        const spin = (Date.now() / 250) % (Math.PI * 2);

        ctx.save();
        ctx.strokeStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 18;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(px, py, GRID_SIZE / 2 + 1, spin, spin + Math.PI * 1.5);
        ctx.stroke();

        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(px, py, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });
    }

    // Draw Trail Particles
    trailParticles.forEach(tp => {
      ctx.save();
      ctx.fillStyle = `rgba(0, 240, 255, ${tp.alpha * 0.4})`;
      ctx.beginPath();
      ctx.arc(tp.x, tp.y, tp.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });

    // Draw Explosion Particles
    particles.forEach(p => {
      ctx.save();
      ctx.globalAlpha = Math.max(0, p.alpha);
      ctx.fillStyle = p.color;
      ctx.shadowBlur = 8;
      ctx.shadowColor = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });

    // Draw Regular Food
    const pulseScale = 0.82 + 0.18 * Math.sin(Date.now() / 150);
    const fx = food.x * GRID_SIZE + GRID_SIZE / 2;
    const fy = food.y * GRID_SIZE + GRID_SIZE / 2;

    ctx.save();
    ctx.fillStyle = document.body.classList.contains('theme-matrix') ? '#00ff66' : '#ff007f';
    ctx.shadowColor = ctx.fillStyle;
    ctx.shadowBlur = 15;
    ctx.beginPath();
    ctx.arc(fx, fy, (GRID_SIZE / 2 - 2) * pulseScale, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Draw Power-up Item on Grid
    if (activePowerupItem) {
      const px = activePowerupItem.x * GRID_SIZE + GRID_SIZE / 2;
      const py = activePowerupItem.y * GRID_SIZE + GRID_SIZE / 2;
      const remainingRatio = Math.max(0, (activePowerupItem.expiresAt - Date.now()) / 8500);

      ctx.save();
      ctx.fillStyle = '#ffe600';
      ctx.shadowColor = '#ffe600';
      ctx.shadowBlur = 20;

      // Draw Icon emoji
      ctx.font = '14px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const icons = { MAGNET: '🧲', SLOWMO: '⏱️', GHOST: '👻', SCISSORS: '✂️', BONUS: '⭐' };
      ctx.fillText(icons[activePowerupItem.type] || '⚡', px, py);

      // Countdown timer ring
      ctx.strokeStyle = '#ffe600';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(px, py, GRID_SIZE / 2 + 2, -Math.PI / 2, -Math.PI / 2 + (Math.PI * 2 * remainingRatio));
      ctx.stroke();
      ctx.restore();
    }

    // Draw Snake
    const isGhost = currentActivePowerup && currentActivePowerup.type === 'GHOST';
    const isRainbow = document.body.classList.contains('theme-rainbow');
    const isMatrix = document.body.classList.contains('theme-matrix');
    const isVaporwave = document.body.classList.contains('theme-vaporwave');

    snake.forEach((segment, index) => {
      const segX = segment.x * GRID_SIZE;
      const segY = segment.y * GRID_SIZE;
      const isHead = index === 0;

      ctx.save();
      if (isGhost) {
        ctx.globalAlpha = 0.5 + 0.3 * Math.sin(Date.now() / 100);
      }

      if (isHead) {
        let headColor = '#00f0ff';
        if (isMatrix) headColor = '#00ff66';
        if (isVaporwave) headColor = '#01cdfe';
        if (isRainbow) headColor = `hsl(${(Date.now() / 15) % 360}, 100%, 60%)`;

        ctx.fillStyle = headColor;
        ctx.shadowColor = headColor;
        ctx.shadowBlur = 16;
        ctx.beginPath();
        ctx.roundRect(segX + 1, segY + 1, GRID_SIZE - 2, GRID_SIZE - 2, 5);
        ctx.fill();

        // Eyes
        ctx.fillStyle = '#08090f';
        let eye1 = { x: segX + 5, y: segY + 5 };
        let eye2 = { x: segX + GRID_SIZE - 7, y: segY + 5 };

        if (velocity.x === 1) {
          eye1 = { x: segX + GRID_SIZE - 6, y: segY + 4 };
          eye2 = { x: segX + GRID_SIZE - 6, y: segY + GRID_SIZE - 7 };
        } else if (velocity.x === -1) {
          eye1 = { x: segX + 4, y: segY + 4 };
          eye2 = { x: segX + 4, y: segY + GRID_SIZE - 7 };
        } else if (velocity.y === 1) {
          eye1 = { x: segX + 4, y: segY + GRID_SIZE - 6 };
          eye2 = { x: segX + GRID_SIZE - 7, y: segY + GRID_SIZE - 6 };
        }

        ctx.fillRect(eye1.x, eye1.y, 3, 3);
        ctx.fillRect(eye2.x, eye2.y, 3, 3);
      } else {
        const ratio = index / snake.length;
        let bodyColor = `rgba(0, 240, 255, ${0.9 - ratio * 0.4})`;

        if (isMatrix) {
          bodyColor = `rgba(0, 255, 102, ${0.9 - ratio * 0.4})`;
        } else if (isVaporwave) {
          bodyColor = `rgba(255, 113, 206, ${0.9 - ratio * 0.4})`;
        } else if (isRainbow) {
          bodyColor = `hsl(${((Date.now() / 15) + index * 12) % 360}, 95%, 50%)`;
        }

        ctx.fillStyle = bodyColor;
        ctx.shadowColor = isMatrix ? '#00ff66' : '#00f0ff';
        ctx.shadowBlur = 6;
        ctx.beginPath();
        ctx.roundRect(segX + 2, segY + 2, GRID_SIZE - 4, GRID_SIZE - 4, 3);
        ctx.fill();
      }
      ctx.restore();
    });
  }

  // Animation Frame Loop
  function gameLoop(currentTime) {
    if (!lastFrameTime) lastFrameTime = currentTime;
    const delta = currentTime - lastFrameTime;
    lastFrameTime = currentTime;

    update(delta);
    draw();

    requestAnimationFrame(gameLoop);
  }

  // Direction Change Handler
  function handleDirection(dx, dy) {
    if (gameState !== STATES.PLAYING) return;
    if (dx !== 0 && velocity.x !== 0) return;
    if (dy !== 0 && velocity.y !== 0) return;

    nextVelocity = { x: dx, y: dy };
    window.arcadeAudio.playTick();
  }

  // Keyboard controls
  window.addEventListener('keydown', (e) => {
    switch (e.key) {
      case 'ArrowUp':
      case 'w':
      case 'W':
        e.preventDefault();
        handleDirection(0, -1);
        break;
      case 'ArrowDown':
      case 's':
      case 'S':
        e.preventDefault();
        handleDirection(0, 1);
        break;
      case 'ArrowLeft':
      case 'a':
      case 'A':
        e.preventDefault();
        handleDirection(-1, 0);
        break;
      case 'ArrowRight':
      case 'd':
      case 'D':
        e.preventDefault();
        handleDirection(1, 0);
        break;
      case ' ':
        e.preventDefault();
        if (gameState === STATES.MENU || gameState === STATES.GAMEOVER) {
          startGame();
        } else if (gameState === STATES.PLAYING) {
          pauseGame();
        } else if (gameState === STATES.PAUSED) {
          resumeGame();
        }
        break;
      case 'p':
      case 'P':
        if (gameState === STATES.PLAYING) pauseGame();
        else if (gameState === STATES.PAUSED) resumeGame();
        break;
    }
  });

  // D-Pad Click / Touch controls
  dpadUp.addEventListener('click', () => handleDirection(0, -1));
  dpadDown.addEventListener('click', () => handleDirection(0, 1));
  dpadLeft.addEventListener('click', () => handleDirection(-1, 0));
  dpadRight.addEventListener('click', () => handleDirection(1, 0));

  // Game Lifecycle Actions
  function startGame() {
    resetGame();
    gameState = STATES.PLAYING;
    screenOverlay.classList.add('hidden');
    startScreen.classList.add('hidden');
    gameOverScreen.classList.add('hidden');
    pauseScreen.classList.add('hidden');
    leaderboardScreen.classList.add('hidden');
    window.arcadeAudio.playGameStart();
    window.arcadeAudio.startBgm();
  }

  function pauseGame() {
    if (gameState !== STATES.PLAYING) return;
    gameState = STATES.PAUSED;
    window.arcadeAudio.stopBgm();
    screenOverlay.classList.remove('hidden');
    pauseScreen.classList.remove('hidden');
  }

  function resumeGame() {
    if (gameState !== STATES.PAUSED) return;
    gameState = STATES.PLAYING;
    window.arcadeAudio.startBgm();
    screenOverlay.classList.add('hidden');
    pauseScreen.classList.add('hidden');
  }

  // Button Listeners
  btnPlay.addEventListener('click', startGame);
  btnRestart.addEventListener('click', startGame);
  btnResume.addEventListener('click', resumeGame);
  btnPauseGame.addEventListener('click', () => {
    if (gameState === STATES.PLAYING) pauseGame();
    else if (gameState === STATES.PAUSED) resumeGame();
  });
  btnResetGame.addEventListener('click', startGame);

  // Sound SFX Toggle
  btnSoundToggle.addEventListener('click', () => {
    const isEnabled = window.arcadeAudio.toggleSound();
    btnSoundToggle.classList.toggle('active', isEnabled);
    btnSoundToggle.querySelector('.label').textContent = isEnabled ? 'SFX: ON' : 'SFX: OFF';
    btnSoundToggle.querySelector('.icon').textContent = isEnabled ? '🔊' : '🔇';
  });

  // Music BGM Toggle
  btnMusicToggle.addEventListener('click', () => {
    const isEnabled = window.arcadeAudio.toggleBgm();
    btnMusicToggle.classList.toggle('active', isEnabled);
    btnMusicToggle.querySelector('.label').textContent = isEnabled ? 'BGM: ON' : 'BGM: OFF';
    btnMusicToggle.querySelector('.icon').textContent = isEnabled ? '🎵' : '🔇';
  });

  // CRT Filter Toggle
  btnCrtToggle.addEventListener('click', () => {
    const hasCrt = document.body.classList.toggle('crt-enabled');
    btnCrtToggle.classList.toggle('active', hasCrt);
    btnCrtToggle.querySelector('.label').textContent = hasCrt ? 'CRT: ON' : 'CRT: OFF';
  });

  // Mode Selection Changed
  modeSelect.addEventListener('change', () => {
    const info = MODES_INFO[modeSelect.value];
    if (info) modeDescriptionPill.textContent = info.desc;
    resetGame();
  });

  // Theme Selection Changed
  themeSelect.addEventListener('change', () => {
    document.body.classList.remove('theme-cyberpunk', 'theme-matrix', 'theme-vaporwave', 'theme-rainbow');
    document.body.classList.add(`theme-${themeSelect.value}`);
  });

  // Difficulty selection
  difficultySelect.addEventListener('change', () => {
    currentDifficulty = DIFFICULTY_SETTINGS[difficultySelect.value] || DIFFICULTY_SETTINGS.normal;
    moveInterval = currentDifficulty.baseSpeed;
  });

  // Start animation frame
  requestAnimationFrame(gameLoop);
});
