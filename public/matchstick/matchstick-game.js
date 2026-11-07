/**
 * MATCHSTICK MIND - UI Game Controller
 * Compact Zero-Scroll Single Viewport Edition
 * Fully interactive matchstick logic puzzle with particle physics & smooth graphics animations
 * Harmonized with MyFolio's warm paper aesthetic & design system.
 */

(function () {
  'use strict';

  class MatchstickGame {
    constructor(rootElementId) {
      this.root = document.getElementById(rootElementId);
      if (!this.root) return;

      this.engine = window.MatchstickEngine;
      if (!this.engine) {
        console.error('[MatchstickGame] Engine not found.');
        return;
      }

      // State
      this.currentLevelIndex = 0;
      this.currentTokens = [];
      this.initialTokens = [];
      this.selectedStick = null; // { tokenIdx, slotKey }
      this.moveHistory = [];
      this.hintsRevealed = 0;
      this.timerSeconds = 0;
      this.timerInterval = null;
      this.isLevelSolved = false;
      this.score = 0;
      this.highScore = 0;
      this.unlockedLevels = 1;

      // Particle System
      this.particles = [];
      this.canvas = null;
      this.ctx = null;
      this.particleAnimId = null;

      // Drag State
      this.dragActive = false;
      this.dragGhost = null;
      this.dragOrigin = null;

      this.loadStorage();
      this.renderSkeleton();
      this.initParticleCanvas();
      this.loadLevel(this.currentLevelIndex);
      this.bindGlobalKeys();
    }

    /* ------------------------------------------------------------------------
       Persistence
       ------------------------------------------------------------------------ */
    loadStorage() {
      try {
        const savedLevel = localStorage.getItem('mm_level');
        const savedScore = localStorage.getItem('mm_score');
        const savedHighScore = localStorage.getItem('mm_high_score');
        const savedUnlocked = localStorage.getItem('mm_unlocked');

        if (savedLevel !== null) this.currentLevelIndex = Math.min(Math.max(parseInt(savedLevel, 10), 0), 19);
        if (savedScore !== null) this.score = parseInt(savedScore, 10) || 0;
        if (savedHighScore !== null) this.highScore = parseInt(savedHighScore, 10) || 0;
        if (savedUnlocked !== null) this.unlockedLevels = Math.min(Math.max(parseInt(savedUnlocked, 10), 1), 20);
      } catch (e) {}
    }

    saveStorage() {
      try {
        localStorage.setItem('mm_level', this.currentLevelIndex);
        localStorage.setItem('mm_score', this.score);
        localStorage.setItem('mm_high_score', Math.max(this.score, this.highScore));
        localStorage.setItem('mm_unlocked', Math.max(this.unlockedLevels, this.currentLevelIndex + 1));
      } catch (e) {}
    }

    /* ------------------------------------------------------------------------
       Render Compact DOM Shell (Fits 100vh with Zero Cutoff)
       ------------------------------------------------------------------------ */
    renderSkeleton() {
      this.root.innerHTML = `
        <div class="mm-container" role="region" aria-label="Matchstick Mind Logic Puzzle Game">
          <!-- Compact Header -->
          <div class="mm-header">
            <div class="mm-title-row">
              <div class="mm-brand-group">
                <div class="mm-game-logo" aria-hidden="true">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="6" y1="18" x2="16" y2="8" stroke="currentColor"/>
                    <circle cx="17.5" cy="6.5" r="2.8" fill="#fb923c" stroke="#ea580c" stroke-width="0.8"/>
                  </svg>
                </div>
                <div class="mm-title-text">
                  <h2>Matchstick Mind</h2>
                  <div class="mm-subtitle">Think logically. Move carefully.</div>
                </div>
              </div>

              <div class="mm-header-controls">
                <select id="mm-level-select" class="mm-level-select" aria-label="Select puzzle level">
                  ${this.engine.PUZZLES.map((p, idx) => `<option value="${idx}">Lvl ${p.id}: ${p.title}</option>`).join('')}
                </select>
                <div class="mm-diff-pill mm-diff-Easy" id="mm-diff-pill">Easy</div>
              </div>
            </div>

            <!-- Single-Line Stats Strip -->
            <div class="mm-stats-bar">
              <div class="mm-stat-item">
                <span class="mm-stat-label">Moves</span>
                <span class="mm-stat-val" id="mm-moves-allowed">1</span>
              </div>
              <div class="mm-stat-item">
                <span class="mm-stat-label">Remaining</span>
                <span class="mm-stat-val highlight" id="mm-moves-left">1</span>
              </div>
              <div class="mm-stat-item">
                <span class="mm-stat-label">Timer</span>
                <span class="mm-stat-val" id="mm-timer">00:00</span>
              </div>
              <div class="mm-stat-item">
                <span class="mm-stat-label">Score</span>
                <span class="mm-stat-val" id="mm-score">0</span>
              </div>
              <div class="mm-stat-item">
                <span class="mm-stat-label">Best</span>
                <span class="mm-stat-val" id="mm-high-score">${this.highScore}</span>
              </div>
            </div>
          </div>

          <!-- Dynamic Unified Status Strip -->
          <div class="mm-status-strip info" id="mm-message-bar" aria-live="polite">
            <span id="mm-message-text">Move 1 matchstick to balance the equation.</span>
          </div>

          <!-- Interactive Board Stage -->
          <div class="mm-board-stage" id="mm-board-stage" tabindex="0" aria-label="Matchstick Equation Arena">
            <canvas class="mm-particle-canvas" id="mm-particle-canvas"></canvas>
            <div class="mm-equation-grid" id="mm-equation-grid"></div>
          </div>

          <!-- Hint Box -->
          <div class="mm-hint-box" id="mm-hint-box"></div>

          <!-- Compact Controls Toolbar -->
          <div class="mm-controls">
            <div class="mm-control-group">
              <button type="button" class="mm-btn" id="mm-btn-undo" title="Undo move (U)">
                <span>↺</span> Undo
              </button>
              <button type="button" class="mm-btn" id="mm-btn-reset" title="Reset (R)">
                <span>⟲</span> Reset
              </button>
              <button type="button" class="mm-btn" id="mm-btn-hint" title="Hint (H)">
                <span style="font-size:11px;">✦</span> Hint (<span id="mm-hint-count">0</span>/3)
              </button>
            </div>

            <div class="mm-control-group">
              <button type="button" class="mm-btn mm-btn-submit" id="mm-btn-submit">
                <span>✓</span> Check Equation
              </button>
              <button type="button" class="mm-btn mm-btn-next-level" id="mm-btn-next" style="display:none;">
                Next Level ➔
              </button>
            </div>
          </div>

          <!-- Victory / Level Solved Overlay -->
          <div class="mm-overlay-modal" id="mm-modal-victory" role="dialog" aria-modal="true" aria-labelledby="mm-victory-title">
            <div class="mm-modal-card">
              <div class="mm-victory-icon" aria-hidden="true">
                <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#15803d" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                  <polyline points="22 4 12 14.01 9 11.01"/>
                </svg>
              </div>
              <h3 id="mm-victory-title">PUZZLE SOLVED!</h3>
              <p style="font-size:13px; color:var(--mm-muted); margin-bottom:10px;">Mathematical equilibrium restored.</p>
              
              <div class="mm-solved-eq" id="mm-modal-solved-eq">6 + 4 = 10</div>
              
              <div class="mm-score-breakdown">
                <div>Level Points: <strong id="mm-modal-pts-base">+500</strong></div>
                <div>Moves Bonus: <strong id="mm-modal-pts-moves">+200</strong></div>
                <div>Hint Bonus: <strong id="mm-modal-pts-hint">+150</strong></div>
                <div>Speed Bonus: <strong id="mm-modal-pts-time">+80</strong></div>
              </div>

              <div class="mm-modal-actions">
                <button type="button" class="mm-btn mm-btn-next-level" id="mm-modal-btn-next" style="padding:10px 24px; font-size:13.5px;">
                  Continue to Next Level ➔
                </button>
              </div>
            </div>
          </div>
        </div>
      `;

      // Cache DOM references
      this.dom = {
        board: document.getElementById('mm-board-stage'),
        grid: document.getElementById('mm-equation-grid'),
        particleCanvas: document.getElementById('mm-particle-canvas'),
        levelSelect: document.getElementById('mm-level-select'),
        diffPill: document.getElementById('mm-diff-pill'),
        movesAllowed: document.getElementById('mm-moves-allowed'),
        movesLeft: document.getElementById('mm-moves-left'),
        timer: document.getElementById('mm-timer'),
        score: document.getElementById('mm-score'),
        highScore: document.getElementById('mm-high-score'),
        messageBar: document.getElementById('mm-message-bar'),
        messageText: document.getElementById('mm-message-text'),
        hintBox: document.getElementById('mm-hint-box'),
        hintCount: document.getElementById('mm-hint-count'),
        btnUndo: document.getElementById('mm-btn-undo'),
        btnReset: document.getElementById('mm-btn-reset'),
        btnHint: document.getElementById('mm-btn-hint'),
        btnSubmit: document.getElementById('mm-btn-submit'),
        btnNext: document.getElementById('mm-btn-next'),
        modalVictory: document.getElementById('mm-modal-victory'),
        modalSolvedEq: document.getElementById('mm-modal-solved-eq'),
        modalPtsBase: document.getElementById('mm-modal-pts-base'),
        modalPtsMoves: document.getElementById('mm-modal-pts-moves'),
        modalPtsHint: document.getElementById('mm-modal-pts-hint'),
        modalPtsTime: document.getElementById('mm-modal-pts-time'),
        modalBtnNext: document.getElementById('mm-modal-btn-next')
      };

      this.dom.btnUndo.addEventListener('click', () => this.undoMove());
      this.dom.btnReset.addEventListener('click', () => this.resetPuzzle());
      this.dom.btnHint.addEventListener('click', () => this.revealNextHint());
      this.dom.btnSubmit.addEventListener('click', () => this.checkEquation(true));
      this.dom.btnNext.addEventListener('click', () => this.nextLevel());
      this.dom.modalBtnNext.addEventListener('click', () => this.nextLevel());

      this.dom.levelSelect.addEventListener('change', (e) => {
        this.loadLevel(parseInt(e.target.value, 10));
      });
    }

    /* ------------------------------------------------------------------------
       Smooth Ember Particle Physics
       ------------------------------------------------------------------------ */
    initParticleCanvas() {
      this.canvas = this.dom.particleCanvas;
      if (!this.canvas) return;
      this.ctx = this.canvas.getContext('2d');

      const resizeCanvas = () => {
        if (!this.dom.board) return;
        const rect = this.dom.board.getBoundingClientRect();
        this.canvas.width = rect.width;
        this.canvas.height = rect.height;
      };

      resizeCanvas();
      window.addEventListener('resize', resizeCanvas);

      const loop = () => {
        this.updateAndDrawParticles();
        this.particleAnimId = requestAnimationFrame(loop);
      };
      loop();
    }

    emitSparks(clientX, clientY, count = 8, isVictory = false) {
      if (!this.canvas || !this.ctx) return;
      const rect = this.canvas.getBoundingClientRect();
      const originX = clientX - rect.left;
      const originY = clientY - rect.top;

      const colors = isVictory
        ? ['#75c5de', '#38bdf8', '#4ade80', '#fbbf24', '#ffedd5']
        : ['#fb923c', '#ea580c', '#f59e0b', '#fef08a', '#ffffff'];

      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * (isVictory ? 4 : 2.5) + 0.5;
        this.particles.push({
          x: originX,
          y: originY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - (isVictory ? 2 : 1),
          radius: Math.random() * (isVictory ? 3 : 2) + 1,
          color: colors[Math.floor(Math.random() * colors.length)],
          alpha: 1,
          decay: Math.random() * 0.025 + 0.015
        });
      }
    }

    updateAndDrawParticles() {
      if (!this.ctx || !this.canvas) return;
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

      for (let i = this.particles.length - 1; i >= 0; i--) {
        const p = this.particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.04;
        p.alpha -= p.decay;

        if (p.alpha <= 0) {
          this.particles.splice(i, 1);
          continue;
        }

        this.ctx.save();
        this.ctx.globalAlpha = Math.max(0, p.alpha);
        this.ctx.fillStyle = p.color;
        this.ctx.shadowColor = p.color;
        this.ctx.shadowBlur = 5;
        this.ctx.beginPath();
        this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.restore();
      }
    }

    /* ------------------------------------------------------------------------
       Level Initialization
       ------------------------------------------------------------------------ */
    loadLevel(idx) {
      this.currentLevelIndex = idx;
      this.puzzle = this.engine.PUZZLES[idx] || this.engine.PUZZLES[0];
      this.initialTokens = this.engine.parseEquation(this.puzzle.initialEquation);
      this.currentTokens = this.engine.cloneTokens(this.initialTokens);
      this.selectedStick = null;
      this.moveHistory = [];
      this.hintsRevealed = 0;
      this.isLevelSolved = false;

      // Update Header & Stats
      this.dom.levelSelect.value = idx;
      this.dom.diffPill.textContent = this.puzzle.difficulty;
      this.dom.diffPill.className = `mm-diff-pill mm-diff-${this.puzzle.difficulty}`;
      this.dom.movesAllowed.textContent = this.puzzle.movesAllowed;
      
      this.dom.hintBox.classList.remove('is-visible');
      this.dom.hintBox.innerHTML = '';
      this.dom.hintCount.textContent = '0';
      this.dom.btnNext.style.display = 'none';
      this.dom.modalVictory.classList.remove('is-active');

      this.updateMovesDisplay();
      this.renderBoard();
      this.setMessage(`Move <strong>${this.puzzle.movesAllowed} matchstick${this.puzzle.movesAllowed > 1 ? 's' : ''}</strong> to balance the equation.`, 'info', true);
      this.startTimer();
      this.saveStorage();
    }

    /* ------------------------------------------------------------------------
       Timer & Score
       ------------------------------------------------------------------------ */
    startTimer() {
      clearInterval(this.timerInterval);
      this.timerSeconds = 0;
      this.dom.timer.textContent = '00:00';
      this.timerInterval = setInterval(() => {
        if (!this.isLevelSolved) {
          this.timerSeconds++;
          const mins = String(Math.floor(this.timerSeconds / 60)).padStart(2, '0');
          const secs = String(this.timerSeconds % 60).padStart(2, '0');
          this.dom.timer.textContent = `${mins}:${secs}`;
        }
      }, 1000);
    }

    stopTimer() {
      clearInterval(this.timerInterval);
    }

    updateMovesDisplay() {
      const stats = this.engine.calculateMoves(this.initialTokens, this.currentTokens);
      const remaining = Math.max(0, this.puzzle.movesAllowed - stats.movesUsed);
      this.dom.movesLeft.textContent = remaining;
      this.dom.movesLeft.className = `mm-stat-val highlight ${remaining === 0 ? 'moves-exhausted' : ''}`;
      this.dom.btnUndo.disabled = this.moveHistory.length === 0 || this.isLevelSolved;

      if (this.selectedStick) {
        this.dom.board.classList.add('has-selected-stick');
      } else {
        this.dom.board.classList.remove('has-selected-stick');
      }
    }

    /* ------------------------------------------------------------------------
       Board Rendering
       ------------------------------------------------------------------------ */
    renderBoard() {
      this.dom.grid.innerHTML = '';

      this.currentTokens.forEach((token, tokenIdx) => {
        if (token.type === 'digit') {
          const digitEl = document.createElement('div');
          digitEl.className = 'mm-digit-token';
          digitEl.setAttribute('data-token-idx', tokenIdx);

          this.engine.SEGMENT_NAMES.forEach((segName) => {
            const isOccupied = token.slots[segName] === 1;
            const slotEl = this.createSlotElement(tokenIdx, segName, isOccupied, `mm-slot-${['a','d','g'].includes(segName)?'h':'v'} mm-slot-seg-${segName}`);
            digitEl.appendChild(slotEl);
          });

          this.dom.grid.appendChild(digitEl);
        } else if (token.type === 'operator') {
          const opEl = document.createElement('div');
          opEl.className = 'mm-operator-token';
          opEl.setAttribute('data-token-idx', tokenIdx);

          // Horizontal slot
          const hOccupied = token.slots.h === 1;
          opEl.appendChild(this.createSlotElement(tokenIdx, 'h', hOccupied, 'mm-slot-h mm-slot-op-h'));

          // Vertical slot
          const vOccupied = token.slots.v === 1;
          opEl.appendChild(this.createSlotElement(tokenIdx, 'v', vOccupied, 'mm-slot-v mm-slot-op-v'));

          this.dom.grid.appendChild(opEl);
        } else if (token.type === 'equals') {
          const eqEl = document.createElement('div');
          eqEl.className = 'mm-equals-token';
          eqEl.setAttribute('data-token-idx', tokenIdx);

          // Top slot
          const topOccupied = token.slots.top === 1;
          eqEl.appendChild(this.createSlotElement(tokenIdx, 'top', topOccupied, 'mm-slot-h mm-slot-eq-top'));

          // Bottom slot
          const btmOccupied = token.slots.bottom === 1;
          eqEl.appendChild(this.createSlotElement(tokenIdx, 'bottom', btmOccupied, 'mm-slot-h mm-slot-eq-bottom'));

          this.dom.grid.appendChild(eqEl);
        }
      });
    }

    createSlotElement(tokenIdx, slotKey, isOccupied, layoutClasses) {
      const slot = document.createElement('div');
      slot.className = `mm-slot ${layoutClasses} ${isOccupied ? 'is-occupied' : 'is-empty'}`;
      slot.setAttribute('data-token', tokenIdx);
      slot.setAttribute('data-slot', slotKey);
      slot.setAttribute('role', 'button');
      slot.setAttribute('tabindex', '0');
      slot.setAttribute('aria-label', `Token ${tokenIdx + 1}, slot ${slotKey}, ${isOccupied ? 'occupied' : 'empty'}`);

      if (isOccupied) {
        const stick = document.createElement('div');
        stick.className = 'mm-stick';
        const head = document.createElement('div');
        head.className = 'mm-head';
        stick.appendChild(head);
        slot.appendChild(stick);

        if (this.selectedStick && this.selectedStick.tokenIdx === tokenIdx && this.selectedStick.slotKey === slotKey) {
          slot.classList.add('is-selected');
        }

        stick.addEventListener('pointerdown', (e) => this.handleStickPointerDown(e, tokenIdx, slotKey));
      }

      slot.addEventListener('click', (e) => {
        e.stopPropagation();
        this.handleSlotClick(e, tokenIdx, slotKey, isOccupied);
      });

      slot.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          const rect = slot.getBoundingClientRect();
          this.handleSlotClick({ clientX: rect.left + rect.width / 2, clientY: rect.top + rect.height / 2 }, tokenIdx, slotKey, isOccupied);
        }
      });

      return slot;
    }

    /* ------------------------------------------------------------------------
       Interaction: Click / Tap Mechanics
       ------------------------------------------------------------------------ */
    handleSlotClick(e, tokenIdx, slotKey, isOccupied) {
      if (this.isLevelSolved) return;

      const clickX = e.clientX || 0;
      const clickY = e.clientY || 0;

      // Case 1: No stick is currently held
      if (!this.selectedStick) {
        if (isOccupied) {
          const stats = this.engine.calculateMoves(this.initialTokens, this.currentTokens);
          if (stats.movesUsed >= this.puzzle.movesAllowed) {
            this.setMessage(`Used all ${this.puzzle.movesAllowed} move(s). Tap Undo or Reset to try again.`, 'error');
            return;
          }

          this.selectedStick = { tokenIdx, slotKey };
          this.emitSparks(clickX, clickY, 8);
          this.renderBoard();
          this.updateMovesDisplay();
          this.vibrate(15);
          this.setMessage('✋ <strong>Stick in hand:</strong> tap an empty slot to place.', 'info', true);
        } else {
          this.setMessage('Tap a glowing matchstick to pick it up.', 'info');
        }
        return;
      }

      // Case 2: A stick IS currently held
      const originToken = this.selectedStick.tokenIdx;
      const originSlot = this.selectedStick.slotKey;

      // 2A: Tapped the exact same stick -> Put back
      if (originToken === tokenIdx && originSlot === slotKey) {
        this.selectedStick = null;
        this.renderBoard();
        this.updateMovesDisplay();
        this.setMessage(`Move <strong>${this.puzzle.movesAllowed} matchstick${this.puzzle.movesAllowed > 1 ? 's' : ''}</strong> to balance the equation.`, 'info', true);
        return;
      }

      // 2B: Tapped another occupied stick -> Switch selection
      if (isOccupied) {
        this.selectedStick = { tokenIdx, slotKey };
        this.emitSparks(clickX, clickY, 6);
        this.renderBoard();
        this.updateMovesDisplay();
        this.vibrate(15);
        this.setMessage('Switched selected stick. Tap an empty slot to place.', 'info');
        return;
      }

      // 2C: Tapped an EMPTY slot -> Execute Move!
      this.emitSparks(clickX, clickY, 12);
      this.executeMove(originToken, originSlot, tokenIdx, slotKey);
    }

    /* ------------------------------------------------------------------------
       Interaction: Drag & Drop Mechanics (Pointer Events)
       ------------------------------------------------------------------------ */
    handleStickPointerDown(e, tokenIdx, slotKey) {
      if (this.isLevelSolved || e.button !== 0) return;

      const stats = this.engine.calculateMoves(this.initialTokens, this.currentTokens);
      if (stats.movesUsed >= this.puzzle.movesAllowed && !this.selectedStick) {
        return;
      }

      e.preventDefault();
      this.dragActive = true;
      this.dragOrigin = { tokenIdx, slotKey };

      this.dragGhost = document.createElement('div');
      this.dragGhost.className = 'mm-dragging-stick';
      const isVert = ['b', 'c', 'e', 'f', 'v'].includes(slotKey);
      this.dragGhost.style.width = isVert ? '9px' : '42px';
      this.dragGhost.style.height = isVert ? '42px' : '9px';
      this.dragGhost.style.left = `${e.clientX}px`;
      this.dragGhost.style.top = `${e.clientY}px`;

      const head = document.createElement('div');
      head.className = 'mm-head';
      this.dragGhost.appendChild(head);
      document.body.appendChild(this.dragGhost);

      this.selectedStick = { tokenIdx, slotKey };
      this.emitSparks(e.clientX, e.clientY, 8);
      this.renderBoard();
      this.updateMovesDisplay();
      this.vibrate(15);

      const onPointerMove = (moveEv) => {
        if (!this.dragActive || !this.dragGhost) return;
        this.dragGhost.style.left = `${moveEv.clientX}px`;
        this.dragGhost.style.top = `${moveEv.clientY}px`;
      };

      const onPointerUp = (upEv) => {
        document.removeEventListener('pointermove', onPointerMove);
        document.removeEventListener('pointerup', onPointerUp);

        if (!this.dragActive) return;
        this.dragActive = false;

        if (this.dragGhost && this.dragGhost.parentNode) {
          this.dragGhost.parentNode.removeChild(this.dragGhost);
        }
        this.dragGhost = null;

        const dropTarget = document.elementFromPoint(upEv.clientX, upEv.clientY);
        const slotEl = dropTarget ? dropTarget.closest('.mm-slot') : null;

        if (slotEl) {
          const targetToken = parseInt(slotEl.getAttribute('data-token'), 10);
          const targetSlot = slotEl.getAttribute('data-slot');
          const isTargetOccupied = slotEl.classList.contains('is-occupied');

          if (!isTargetOccupied) {
            this.emitSparks(upEv.clientX, upEv.clientY, 12);
            this.executeMove(this.dragOrigin.tokenIdx, this.dragOrigin.slotKey, targetToken, targetSlot);
            return;
          }
        }
      };

      document.addEventListener('pointermove', onPointerMove);
      document.addEventListener('pointerup', onPointerUp);
    }

    /* ------------------------------------------------------------------------
       Move Execution & Verification
       ------------------------------------------------------------------------ */
    executeMove(fromToken, fromSlot, toToken, toSlot) {
      this.currentTokens[fromToken].slots[fromSlot] = 0;
      this.currentTokens[toToken].slots[toSlot] = 1;

      this.moveHistory.push({
        from: { token: fromToken, slot: fromSlot },
        to: { token: toToken, slot: toSlot }
      });

      this.selectedStick = null;
      this.vibrate([20, 40]);
      this.renderBoard();

      // Trigger placement snap animation
      const targetSlotEl = this.dom.grid.querySelector(`.mm-digit-token[data-token-idx="${toToken}"] .mm-slot[data-slot="${toSlot}"], .mm-operator-token[data-token-idx="${toToken}"] .mm-slot[data-slot="${toSlot}"], .mm-equals-token[data-token-idx="${toToken}"] .mm-slot[data-slot="${toSlot}"]`);
      if (targetSlotEl) {
        targetSlotEl.classList.add('just-placed');
        setTimeout(() => targetSlotEl.classList.remove('just-placed'), 350);
      }

      this.updateMovesDisplay();
      this.checkEquation(false);
    }

    undoMove() {
      if (this.moveHistory.length === 0 || this.isLevelSolved) return;

      const lastMove = this.moveHistory.pop();
      this.currentTokens[lastMove.to.token].slots[lastMove.to.slot] = 0;
      this.currentTokens[lastMove.from.token].slots[lastMove.from.slot] = 1;

      this.selectedStick = null;
      this.vibrate(15);
      this.renderBoard();
      this.updateMovesDisplay();
      this.setMessage('Move undone.', 'info');
    }

    resetPuzzle() {
      this.currentTokens = this.engine.cloneTokens(this.initialTokens);
      this.selectedStick = null;
      this.moveHistory = [];
      this.isLevelSolved = false;
      this.renderBoard();
      this.updateMovesDisplay();
      this.setMessage(`Reset. Move <strong>${this.puzzle.movesAllowed} matchstick${this.puzzle.movesAllowed > 1 ? 's' : ''}</strong> to balance equation.`, 'info', true);
    }

    checkEquation(isManualSubmit = false) {
      const result = this.engine.validateBoard(this.puzzle, this.currentTokens);

      if (result.isValid) {
        this.handleLevelVictory(result);
      } else {
        if (isManualSubmit) {
          this.vibrate([40, 60, 40]);
          this.setMessage(`Incorrect: ${result.message}`, 'error');
        } else {
          const stats = this.engine.calculateMoves(this.initialTokens, this.currentTokens);
          if (stats.movesUsed === this.puzzle.movesAllowed) {
            if (result.errorType === 'MATH_MISMATCH') {
              this.setMessage(`Evaluates to ${result.decodedEquation} (not balanced). Tap Undo to rethink.`, 'error');
            } else if (result.errorType === 'INVALID_GLYPH') {
              this.setMessage('One shape is not a valid digit. Tap Undo or adjust.', 'error');
            }
          }
        }
      }
    }

    /* ------------------------------------------------------------------------
       Hints Engine
       ------------------------------------------------------------------------ */
    revealNextHint() {
      if (this.hintsRevealed >= this.puzzle.hints.length) {
        this.setMessage('All hints for this puzzle revealed!', 'info');
        return;
      }

      this.hintsRevealed++;
      this.dom.hintCount.textContent = this.hintsRevealed;

      const hintText = this.puzzle.hints[this.hintsRevealed - 1];
      this.dom.hintBox.innerHTML = `<strong>Hint ${this.hintsRevealed}/${this.puzzle.hints.length}:</strong> ${hintText}`;
      this.dom.hintBox.classList.add('is-visible');
      this.setMessage(`Hint ${this.hintsRevealed} revealed below.`, 'info');
    }

    /* ------------------------------------------------------------------------
       Victory & Scoring
       ------------------------------------------------------------------------ */
    handleLevelVictory(result) {
      this.isLevelSolved = true;
      this.stopTimer();
      this.vibrate([60, 40, 100]);

      if (this.canvas) {
        const rect = this.canvas.getBoundingClientRect();
        this.emitSparks(rect.left + rect.width / 2, rect.top + rect.height / 2, 30, true);
      }

      const basePts = 500;
      const movesBonus = (this.puzzle.movesAllowed - (result.moveStats.movesUsed - 1)) * 100;
      const hintBonus = Math.max(0, 150 - (this.hintsRevealed * 50));
      const speedBonus = Math.max(0, 200 - Math.min(this.timerSeconds * 2, 200));
      const levelTotal = basePts + movesBonus + hintBonus + speedBonus;

      this.score += levelTotal;
      if (this.score > this.highScore) this.highScore = this.score;

      this.unlockedLevels = Math.max(this.unlockedLevels, this.currentLevelIndex + 2);
      this.saveStorage();

      this.dom.score.textContent = `${this.score}`;
      this.dom.highScore.textContent = `${this.highScore}`;
      this.dom.btnNext.style.display = 'inline-flex';
      this.setMessage(`✦ PUZZLE SOLVED! ${result.decodedEquation} (+${levelTotal} pts)`, 'success');

      this.dom.modalSolvedEq.textContent = result.decodedEquation;
      this.dom.modalPtsBase.textContent = `+${basePts}`;
      this.dom.modalPtsMoves.textContent = `+${movesBonus}`;
      this.dom.modalPtsHint.textContent = `+${hintBonus}`;
      this.dom.modalPtsTime.textContent = `+${speedBonus}`;
      this.dom.modalVictory.classList.add('is-active');
    }

    nextLevel() {
      this.dom.modalVictory.classList.remove('is-active');
      const nextIdx = (this.currentLevelIndex + 1) % this.engine.PUZZLES.length;
      this.loadLevel(nextIdx);
    }

    resetGame() {
      this.currentLevelIndex = 0;
      this.score = 0;
      this.loadLevel(0);
      this.dom.board.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    bindGlobalKeys() {
      document.addEventListener('keydown', (e) => {
        if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName)) return;

        if (e.key === 'u' || e.key === 'U') {
          e.preventDefault();
          this.undoMove();
        } else if (e.key === 'r' || e.key === 'R') {
          e.preventDefault();
          this.resetPuzzle();
        } else if (e.key === 'h' || e.key === 'H') {
          e.preventDefault();
          this.revealNextHint();
        } else if (e.key === 'Escape') {
          if (this.selectedStick) {
            this.selectedStick = null;
            this.renderBoard();
            this.updateMovesDisplay();
            this.setMessage('Stick put down.', 'info');
          }
        }
      });
    }

    setMessage(msg, type = 'info', isHtml = false) {
      this.dom.messageBar.className = `mm-status-strip ${type}`;
      if (isHtml) {
        this.dom.messageText.innerHTML = msg;
      } else {
        this.dom.messageText.textContent = msg;
      }
    }

    vibrate(pattern) {
      try {
        if ('vibrate' in navigator) navigator.vibrate(pattern);
      } catch (e) {}
    }
  }

  // Auto-mount when DOM is ready
  document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('matchstick-game-root')) {
      window.matchstickGame = new MatchstickGame('matchstick-game-root');
    }
  });

  window.MatchstickGame = MatchstickGame;
})();
