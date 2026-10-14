/**
 * CyberSnake - Main Arcade Engine
 * Modern Canvas Snake with Particle Systems, Combos & Retro Effects
 */

document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const canvas = document.getElementById('gameCanvas');
  const ctx = canvas.getContext('2d');
  
  const scoreDisplay = document.getElementById('scoreDisplay');
  const highScoreDisplay = document.getElementById('highScoreDisplay');
  const multiplierDisplay = document.getElementById('multiplierDisplay');
  const levelDisplay = document.getElementById('levelDisplay');
  
  const screenOverlay = document.getElementById('screenOverlay');
  const startScreen = document.getElementById('startScreen');
  const gameOverScreen = document.getElementById('gameOverScreen');
  const pauseScreen = document.getElementById('pauseScreen');
  const finalScoreEl = document.getElementById('finalScore');
  const newRecordNotice = document.getElementById('newRecordNotice');
  
  const btnPlay = document.getElementById('btnPlay');
  const btnRestart = document.getElementById('btnRestart');
  const btnResume = document.getElementById('btnResume');
  const btnPauseGame = document.getElementById('btnPauseGame');
  const btnResetGame = document.getElementById('btnResetGame');
  const btnSoundToggle = document.getElementById('btnSoundToggle');
  const btnCrtToggle = document.getElementById('btnCrtToggle');
  const difficultySelect = document.getElementById('difficultySelect');
  
  // D-Pad buttons
  const dpadUp = document.getElementById('dpadUp');
  const dpadDown = document.getElementById('dpadDown');
  const dpadLeft = document.getElementById('dpadLeft');
  const dpadRight = document.getElementById('dpadRight');

  // Grid Configuration
  const GRID_SIZE = 20; // 24x24 grid on 480x480 canvas
  const TILE_COUNT = canvas.width / GRID_SIZE; // 24 tiles

  // Game States
  const STATES = {
    MENU: 'MENU',
    PLAYING: 'PLAYING',
    PAUSED: 'PAUSED',
    GAMEOVER: 'GAMEOVER'
  };

  let gameState = STATES.MENU;
  let score = 0;
  let highScore = parseInt(localStorage.getItem('cybersnake_highscore') || '0', 10);
  let multiplier = 1.0;
  let lastEatTime = 0;
  let level = 1;

  // Snake State
  let snake = [];
  let velocity = { x: 1, y: 0 };
  let nextVelocity = { x: 1, y: 0 };

  // Food & Bonus
  let food = { x: 5, y: 5 };
  let bonus = null;
  let bonusTimer = null;
  let foodsEatenCount = 0;

  // Particle System
  let particles = [];

  // Timing & Speed
  let lastFrameTime = 0;
  let moveInterval = 120; // ms per grid move
  let timeSinceLastMove = 0;

  // Difficulties Map
  const DIFFICULTY_SETTINGS = {
    easy: { baseSpeed: 150, speedStep: 3, minSpeed: 80, wrapWalls: false },
    normal: { baseSpeed: 120, speedStep: 4, minSpeed: 60, wrapWalls: false },
    hard: { baseSpeed: 90, speedStep: 5, minSpeed: 45, wrapWalls: false },
    hyper: { baseSpeed: 65, speedStep: 6, minSpeed: 35, wrapWalls: false }
  };
  let currentDifficulty = DIFFICULTY_SETTINGS.normal;

  // Initialize display
  highScoreDisplay.textContent = padZero(highScore);

  // Initialize Game Data
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
    foodsEatenCount = 0;
    bonus = null;
    particles = [];
    
    currentDifficulty = DIFFICULTY_SETTINGS[difficultySelect.value] || DIFFICULTY_SETTINGS.normal;
    moveInterval = currentDifficulty.baseSpeed;
    
    updateHUD();
    spawnFood();
  }

  function updateHUD() {
    scoreDisplay.textContent = padZero(score);
    highScoreDisplay.textContent = padZero(highScore);
    multiplierDisplay.textContent = `x${multiplier.toFixed(1)}`;
    levelDisplay.textContent = `LVL ${level}`;
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
      valid = !snake.some(segment => segment.x === food.x && segment.y === food.y);
    }
  }

  function spawnBonus() {
    let valid = false;
    let newBonus = {};
    while (!valid) {
      newBonus = {
        x: Math.floor(Math.random() * TILE_COUNT),
        y: Math.floor(Math.random() * TILE_COUNT),
        expiresAt: Date.now() + 8000 // 8 seconds duration
      };
      valid = !snake.some(s => s.x === newBonus.x && s.y === newBonus.y) &&
              (newBonus.x !== food.x || newBonus.y !== food.y);
    }
    bonus = newBonus;
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

  // Update Game Logic
  function update(delta) {
    if (gameState !== STATES.PLAYING) return;

    // Update Particles
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.alpha -= 0.035;
      if (p.alpha <= 0) {
        particles.splice(i, 1);
      }
    }

    // Check bonus timeout
    if (bonus && Date.now() > bonus.expiresAt) {
      bonus = null;
    }

    // Multiplier decay after 4 seconds of inactivity
    if (multiplier > 1.0 && Date.now() - lastEatTime > 4500) {
      multiplier = Math.max(1.0, multiplier - 0.5);
      multiplierDisplay.textContent = `x${multiplier.toFixed(1)}`;
    }

    // Movement Interval Trigger
    timeSinceLastMove += delta;
    if (timeSinceLastMove >= moveInterval) {
      timeSinceLastMove = 0;
      stepSnake();
    }
  }

  function stepSnake() {
    // Apply buffered direction
    velocity = { ...nextVelocity };

    const head = { ...snake[0] };
    head.x += velocity.x;
    head.y += velocity.y;

    // Wall Collision Check
    if (head.x < 0 || head.x >= TILE_COUNT || head.y < 0 || head.y >= TILE_COUNT) {
      triggerGameOver();
      return;
    }

    // Self Collision Check
    for (let i = 0; i < snake.length; i++) {
      if (snake[i].x === head.x && snake[i].y === head.y) {
        triggerGameOver();
        return;
      }
    }

    snake.unshift(head);

    // Food Eaten Check
    let grew = false;
    if (head.x === food.x && head.y === food.y) {
      grew = true;
      foodsEatenCount++;
      const now = Date.now();
      
      // Combo multiplier increment
      if (now - lastEatTime < 3500) {
        multiplier = Math.min(4.0, +(multiplier + 0.5).toFixed(1));
      } else {
        multiplier = 1.0;
      }
      lastEatTime = now;

      // Base points + multiplier
      const earned = Math.round(10 * multiplier * level);
      score += earned;

      createExplosion(food.x, food.y, '#ff007f', 20);
      window.arcadeAudio.playEat();

      // Check level progression
      if (foodsEatenCount % 5 === 0) {
        level++;
        moveInterval = Math.max(currentDifficulty.minSpeed, currentDifficulty.baseSpeed - (level * currentDifficulty.speedStep));
        window.arcadeAudio.playLevelUp();
      }

      // Occasional bonus spawn
      if (foodsEatenCount % 4 === 0 && !bonus) {
        spawnBonus();
      }

      spawnFood();
      updateHUD();
    }

    // Bonus Orb Eaten Check
    if (bonus && head.x === bonus.x && head.y === bonus.y) {
      grew = true;
      const earned = Math.round(50 * multiplier * level);
      score += earned;
      multiplier = Math.min(5.0, +(multiplier + 1.0).toFixed(1));
      lastEatTime = Date.now();

      createExplosion(bonus.x, bonus.y, '#ffe600', 30);
      window.arcadeAudio.playBonus();
      bonus = null;
      updateHUD();
    }

    if (!grew) {
      snake.pop();
    }
  }

  function triggerGameOver() {
    gameState = STATES.GAMEOVER;
    window.arcadeAudio.playGameOver();

    // Check for high score
    let isNewRecord = false;
    if (score > highScore) {
      highScore = score;
      localStorage.setItem('cybersnake_highscore', highScore.toString());
      isNewRecord = true;
      highScoreDisplay.textContent = padZero(highScore);
    }

    finalScoreEl.textContent = score;
    if (isNewRecord && score > 0) {
      newRecordNotice.classList.remove('hidden');
    } else {
      newRecordNotice.classList.add('hidden');
    }

    screenOverlay.classList.remove('hidden');
    startScreen.classList.add('hidden');
    pauseScreen.classList.add('hidden');
    gameOverScreen.classList.remove('hidden');
  }

  // Render Loop
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

    // Draw Particles
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

    // Draw Regular Food (Pulsing Neon Pink)
    const pulseScale = 0.8 + 0.2 * Math.sin(Date.now() / 150);
    const foodRadius = (GRID_SIZE / 2 - 2) * pulseScale;
    const foodCenterX = food.x * GRID_SIZE + GRID_SIZE / 2;
    const foodCenterY = food.y * GRID_SIZE + GRID_SIZE / 2;

    ctx.save();
    ctx.fillStyle = '#ff007f';
    ctx.shadowColor = '#ff007f';
    ctx.shadowBlur = 15;
    ctx.beginPath();
    ctx.arc(foodCenterX, foodCenterY, foodRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Draw Bonus Orb (Golden Glow with remaining time ring)
    if (bonus) {
      const remainingRatio = Math.max(0, (bonus.expiresAt - Date.now()) / 8000);
      const bx = bonus.x * GRID_SIZE + GRID_SIZE / 2;
      const by = bonus.y * GRID_SIZE + GRID_SIZE / 2;

      ctx.save();
      ctx.fillStyle = '#ffe600';
      ctx.shadowColor = '#ffe600';
      ctx.shadowBlur = 20;
      ctx.beginPath();
      ctx.arc(bx, by, GRID_SIZE / 2 - 2, 0, Math.PI * 2);
      ctx.fill();

      // Countdown arc
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(bx, by, GRID_SIZE / 2 + 1, -Math.PI / 2, -Math.PI / 2 + (Math.PI * 2 * remainingRatio));
      ctx.stroke();
      ctx.restore();
    }

    // Draw Snake
    snake.forEach((segment, index) => {
      const segX = segment.x * GRID_SIZE;
      const segY = segment.y * GRID_SIZE;
      const isHead = index === 0;

      ctx.save();
      if (isHead) {
        // Snake Head
        ctx.fillStyle = '#00f0ff';
        ctx.shadowColor = '#00f0ff';
        ctx.shadowBlur = 14;
        ctx.beginPath();
        ctx.roundRect(segX + 1, segY + 1, GRID_SIZE - 2, GRID_SIZE - 2, 5);
        ctx.fill();

        // Eyes
        ctx.fillStyle = '#08090f';
        const eyeOffset = 4;
        let eye1 = { x: segX + 5, y: segY + 5 };
        let eye2 = { x: segX + GRID_SIZE - 7, y: segY + 5 };

        if (velocity.x === 1) { // Moving Right
          eye1 = { x: segX + GRID_SIZE - 6, y: segY + 4 };
          eye2 = { x: segX + GRID_SIZE - 6, y: segY + GRID_SIZE - 7 };
        } else if (velocity.x === -1) { // Moving Left
          eye1 = { x: segX + 4, y: segY + 4 };
          eye2 = { x: segX + 4, y: segY + GRID_SIZE - 7 };
        } else if (velocity.y === 1) { // Moving Down
          eye1 = { x: segX + 4, y: segY + GRID_SIZE - 6 };
          eye2 = { x: segX + GRID_SIZE - 7, y: segY + GRID_SIZE - 6 };
        }

        ctx.fillRect(eye1.x, eye1.y, 3, 3);
        ctx.fillRect(eye2.x, eye2.y, 3, 3);
      } else {
        // Snake Body with gradual neon gradient
        const ratio = index / snake.length;
        ctx.fillStyle = `rgba(0, ${Math.floor(240 - ratio * 100)}, 255, ${0.9 - ratio * 0.4})`;
        ctx.shadowColor = '#00f0ff';
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
    // Prevent 180 degree instant reversal
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
    window.arcadeAudio.playGameStart();
  }

  function pauseGame() {
    if (gameState !== STATES.PLAYING) return;
    gameState = STATES.PAUSED;
    screenOverlay.classList.remove('hidden');
    pauseScreen.classList.remove('hidden');
  }

  function resumeGame() {
    if (gameState !== STATES.PAUSED) return;
    gameState = STATES.PLAYING;
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
  btnResetGame.addEventListener('click', () => {
    startGame();
  });

  // Sound Toggle
  btnSoundToggle.addEventListener('click', () => {
    const isEnabled = window.arcadeAudio.toggleSound();
    btnSoundToggle.classList.toggle('active', isEnabled);
    btnSoundToggle.querySelector('.label').textContent = isEnabled ? 'AUDIO: ON' : 'AUDIO: OFF';
    btnSoundToggle.querySelector('.icon').textContent = isEnabled ? '🔊' : '🔇';
  });

  // CRT Filter Toggle
  btnCrtToggle.addEventListener('click', () => {
    const hasCrt = document.body.classList.toggle('crt-enabled');
    btnCrtToggle.classList.toggle('active', hasCrt);
    btnCrtToggle.querySelector('.label').textContent = hasCrt ? 'CRT: ON' : 'CRT: OFF';
  });

  // Difficulty change
  difficultySelect.addEventListener('change', () => {
    if (gameState === STATES.PLAYING || gameState === STATES.PAUSED) {
      currentDifficulty = DIFFICULTY_SETTINGS[difficultySelect.value] || DIFFICULTY_SETTINGS.normal;
      moveInterval = currentDifficulty.baseSpeed;
    }
  });

  // Start animation loop
  requestAnimationFrame(gameLoop);
});

