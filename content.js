// === MEGAETH BOT (MAIN WORLD) ===
(function () {
    console.log("🦖 MegaETH Bot: v66 (Background Mode)...");

    // === DISABLE GAME PAUSE ON BLUR ===
    // Patch the game to not pause when window loses focus
    function patchGameForBackground() {
        if (window.Runner && Runner.prototype) {
            // Disable visibility change handler (prevents pause on blur)
            Runner.prototype.onVisibilityChange = function () {
                // Do nothing - game continues in background
            };
            console.log("🦖 Game patched: will not pause on blur");
            return true;
        }
        return false;
    }

    // Try to patch immediately, or wait for Runner to load
    if (!patchGameForBackground()) {
        const patchInterval = setInterval(() => {
            if (patchGameForBackground()) {
                clearInterval(patchInterval);
            }
        }, 100);
        // Stop trying after 10 seconds
        setTimeout(() => clearInterval(patchInterval), 10000);
    }

    let isBotActive = false;
    let botFrameId = null;
    let jumpCount = 0;
    let lastSpeed = 0;
    let lastJumpTime = 0;
    let lastFrameTime = performance.now();
    let avgFrameTime = 16.67;

    // === AUTOSTOP FEATURE ===
    let autoStopEnabled = false;
    let autoStopTarget = 0;

    function generateAutoStopTarget() {
        return Math.floor(Math.random() * 201) + 100; // Random 100-300
    }

    // === UI INITIALIZATION ===
    const ui = document.createElement('div');
    Object.assign(ui.style, {
        position: 'fixed', bottom: '50px', left: '50%', transform: 'translateX(-50%)',
        padding: '10px 20px', background: 'rgba(0, 0, 0, 0.7)', color: '#fff',
        fontFamily: 'monospace', fontSize: '16px', borderRadius: '30px',
        zIndex: '2147483647', pointerEvents: 'none', border: '2px solid rgba(255,255,255,0.2)',
        textAlign: 'center', boxShadow: '0 2px 10px rgba(0,0,0,0.3)', transition: 'all 0.2s ease',
        display: 'flex', alignItems: 'center', gap: '15px',
        whiteSpace: 'nowrap'
    });
    ui.id = 'bot-overlay';
    ui.innerText = "Press 'S' to start | 'A' for autostop";
    if (document.body) { document.body.appendChild(ui); }
    else { window.addEventListener('DOMContentLoaded', () => document.body.appendChild(ui)); }

    // === RESPONSIVE UI ===
    function adaptUI() {
        const isNarrow = window.innerWidth < 450;
        Object.assign(ui.style, {
            fontSize: isNarrow ? '12px' : '16px',
            padding: isNarrow ? '6px 12px' : '10px 20px',
            gap: isNarrow ? '8px' : '15px',
            bottom: isNarrow ? '30px' : '50px'
        });
    }
    adaptUI();
    window.addEventListener('resize', adaptUI);

    // === UI UPDATE LOGIC (v62 Icons) ===
    function updateUI(speed) {
        if (!isBotActive) {
            Object.assign(ui.style, { background: 'rgba(0, 0, 0, 0.7)', borderColor: '#666' });
            const autoStopStatus = autoStopEnabled ? `🎯 Auto: ${autoStopTarget} TX` : '';
            ui.innerHTML = `Bot is stopped ${autoStopStatus}`;
            return;
        }

        let color = 'rgba(0, 128, 128, 0.9)';
        let icon = '🐢';

        if (speed > 24.5) {
            color = 'rgba(220, 20, 60, 0.9)';
            icon = '🚀';
        } else if (speed > 22) {
            color = 'rgba(255, 140, 0, 0.9)';
            icon = '🐆';
        } else if (speed >= 13) {
            color = 'rgba(34, 139, 34, 0.9)';
            icon = '🐇';
        }

        const fps = Math.round(1000 / avgFrameTime);
        const fpsColor = fps < 50 ? '#ff6b6b' : '#aaa';

        Object.assign(ui.style, { background: color, borderColor: 'rgba(255,255,255,0.5)' });
        const autoStopInfo = autoStopEnabled ? ` | 🎯 <b>${jumpCount}/${autoStopTarget}</b>` : '';
        ui.innerHTML = `${icon} SPEED: <b>${speed.toFixed(1)}</b> | TX: <b>${jumpCount}</b> | <span style="color: ${fpsColor}">FPS: <b>${fps}</b></span>${autoStopInfo}`;
    }

    // === TOGGLE HANDLER ===
    window.addEventListener('keydown', (e) => {
        if (!e.isTrusted) return;
        if (e.target.tagName === 'INPUT') return;

        if (e.key.toLowerCase() === 's') {
            isBotActive = !isBotActive;
            if (isBotActive) {
                if (autoStopEnabled) {
                    autoStopTarget = generateAutoStopTarget();
                    jumpCount = 0; // Reset counter for autostop
                }
                startBot();
                ui.innerHTML = "Bot Active...";
            } else {
                stopBot();
                updateUI(0);
            }
        }

        // Toggle autostop with 'A' key
        if (e.key.toLowerCase() === 'a') {
            autoStopEnabled = !autoStopEnabled;
            if (autoStopEnabled) {
                autoStopTarget = generateAutoStopTarget();
                console.log(`🎯 Autostop enabled: will stop at ${autoStopTarget} TX`);
            } else {
                console.log('🎯 Autostop disabled');
            }
            updateUI(lastSpeed);
        }
    });

    function pressSpace() {
        document.dispatchEvent(new KeyboardEvent('keydown', { keyCode: 32, which: 32, code: 'Space', bubbles: true }));
    }
    function releaseSpace() {
        document.dispatchEvent(new KeyboardEvent('keyup', { keyCode: 32, which: 32, code: 'Space', bubbles: true }));
    }

    // === CORE LOGIC ===
    function botLoop() {
        if (isBotActive) botFrameId = requestAnimationFrame(botLoop);

        // Performance monitoring
        const now = performance.now();
        const frameTime = now - lastFrameTime;
        lastFrameTime = now;
        avgFrameTime = avgFrameTime * 0.9 + frameTime * 0.1; // Exponential moving average

        if (window.Runner && Runner.instance_) {
            const r = Runner.instance_;
            const speed = r.currentSpeed;

            // Reset jump counter on new game (speed resets to ~6)
            if (speed < 7 && lastSpeed > 10) {
                jumpCount = 0;
            }
            lastSpeed = speed;

            if (r.crashed) return;

            // FAILSAFE: Force reset states if on ground
            if (r.tRex.yPos === r.tRex.groundYPos) {
                if (r.tRex.jumping) {
                    r.tRex.jumping = false;
                }
                if (r.tRex.speedDrop || r.tRex.ducking) {
                    r.tRex.speedDrop = false;
                    r.tRex.ducking = false;
                }
            }

            // Update UI every frame
            updateUI(speed);

            // === AUTOSTOP CHECK ===
            if (autoStopEnabled && jumpCount >= autoStopTarget) {
                console.log(`🎯 Autostop triggered at ${jumpCount} TX`);
                isBotActive = false;
                stopBot();
                updateUI(0);
                return;
            }

            if (r.activated && r.horizon.obstacles.length > 0) {
                const obs = r.horizon.obstacles[0];

                // === 1. GROUP DETECTION ===
                let groupEndPos = obs.xPos + obs.width;
                let pattern = (obs.width > 40 ? "B" : "S");
                const obsCount = r.horizon.obstacles.length;

                for (let i = 1; i < obsCount && i < 5; i++) {
                    if (r.horizon.obstacles[i]) {
                        if (r.horizon.obstacles[i].xPos - groupEndPos < 300) {
                            groupEndPos = r.horizon.obstacles[i].xPos + r.horizon.obstacles[i].width;
                            pattern += (r.horizon.obstacles[i].width > 40 ? "B" : "S");
                        } else {
                            break;
                        }
                    }
                }
                const effectiveWidth = groupEndPos - obs.xPos;
                const isSingle = effectiveWidth < 60;

                // === 2. DYNAMIC JUMP CONFIG ===
                let jumpForce = -11.5;
                let extraHold = 0;

                if (!isSingle) {
                    jumpForce = -14.5;
                    extraHold = 40;
                }

                // === 3. TRIGGER LOGIC ===
                let triggerDist = 0;
                let holdTime = 0;

                if (speed < 13) {
                    // Extra safety margin for low FPS at start
                    const lowFpsBonus = avgFrameTime > 30 ? 30 : 0;
                    triggerDist = 75 + lowFpsBonus;
                    jumpForce = -15.5;
                    holdTime = 160;
                } else {
                    if (speed > 24.5) {
                        const framesToApex = 13.33;
                        triggerDist = 20 + (speed * framesToApex);
                    } else if (speed > 22) {
                        const framesToApex = 15.33;
                        triggerDist = 20 + (speed * framesToApex);
                    } else {
                        triggerDist = 20 + (speed * 7.5);
                    }

                    if (isSingle) {
                        holdTime = speed > 20 ? 90 : 100;
                    } else {
                        holdTime = speed > 20 ? 150 : 130;
                    }
                }

                // === EXECUTION ===
                // Performance compensation: adaptive for different FPS tiers
                let fpsCompensation = 1;
                let fpsBonus = 0;

                if (avgFrameTime > 20) {
                    // Exponential compensation for very low FPS (<50)
                    fpsCompensation = Math.pow(avgFrameTime / 16.67, 1.2);
                    // Cap at 6x to prevent overly early jumps
                    fpsCompensation = Math.min(fpsCompensation, 6);
                } else if (avgFrameTime > 14) {
                    // Small buffer for 60-70 FPS range (vs 120+ FPS)
                    // At 60 FPS we have half the checks, so add small safety margin
                    fpsBonus = speed > 22 ? 15 : 8; // Extra pixels at high speed
                }

                const adjustedTriggerDist = triggerDist * fpsCompensation + fpsBonus;

                // Emergency jump: larger buffer for low FPS
                const emergencyMultiplier = avgFrameTime > 30 ? 3.5 : (avgFrameTime > 16 ? 2.8 : 2.5);
                const emergencyDist = speed * emergencyMultiplier + 50;
                const shouldJump = obs.xPos < adjustedTriggerDist || (obs.xPos < emergencyDist && obs.xPos > 0);

                if (shouldJump) {
                    // Cooldown check: prevent double jumps (min 200ms between jumps)
                    const timeSinceLastJump = now - lastJumpTime;
                    if (!r.tRex.jumping && !r.tRex.ducking && timeSinceLastJump > 200) {
                        lastJumpTime = now;

                        pressSpace();

                        const isBigStart = obs.width > 40;

                        if (speed < 13 && isBigStart) {
                            r.tRex.config.GRAVITY = 0.4;
                            setTimeout(() => { r.tRex.config.GRAVITY = 0.6; }, 650);
                            jumpForce = -16.0;
                        }

                        if (speed > 24.5) {
                            jumpForce = -12.0;
                            holdTime = 1;
                            extraHold = 0;
                            r.tRex.config.GRAVITY = 0.9;
                            setTimeout(() => { r.tRex.config.GRAVITY = 0.6; }, 300);
                        } else if (speed > 22) {
                            jumpForce = -11.5;
                            holdTime = 1;
                            extraHold = 0;
                            r.tRex.config.GRAVITY = 0.75;
                            setTimeout(() => { r.tRex.config.GRAVITY = 0.6; }, 300);
                        }

                        r.tRex.startJump(speed);
                        jumpCount++;
                        r.tRex.jumpVelocity = jumpForce;

                        // Compensate hold time for low FPS
                        const holdTimeCompensation = avgFrameTime > 25 ? (avgFrameTime / 16.67) : 1;
                        const adjustedHoldTime = (holdTime + extraHold) * holdTimeCompensation;

                        setTimeout(() => {
                            if (r.tRex.jumping) {
                                releaseSpace();
                            }
                        }, adjustedHoldTime);
                    }
                }
            }
        }
    }

    function startBot() { if (!botFrameId) botLoop(); }
    function stopBot() { if (botFrameId) { cancelAnimationFrame(botFrameId); botFrameId = null; } }

})();
