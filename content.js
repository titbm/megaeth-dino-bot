// === MEGAETH BOT (MAIN WORLD) ===
(function () {
    console.log("🦖 MegaETH Bot: v62 (Final)...");

    let isBotActive = false;
    let botFrameId = null;
    let jumpCount = 0;
    let lastSpeed = 0;

    // === UI INITIALIZATION ===
    const ui = document.createElement('div');
    Object.assign(ui.style, {
        position: 'fixed', bottom: '50px', left: '50%', transform: 'translateX(-50%)',
        padding: '10px 20px', background: 'rgba(0, 0, 0, 0.7)', color: '#fff',
        fontFamily: 'monospace', fontSize: '16px', borderRadius: '30px',
        zIndex: '2147483647', pointerEvents: 'none', border: '2px solid rgba(255,255,255,0.2)',
        textAlign: 'center', boxShadow: '0 2px 10px rgba(0,0,0,0.3)', transition: 'all 0.2s ease',
        display: 'flex', alignItems: 'center', gap: '15px'
    });
    ui.id = 'bot-overlay';
    ui.innerText = "Press 'S' to start bot";
    if (document.body) { document.body.appendChild(ui); }
    else { window.addEventListener('DOMContentLoaded', () => document.body.appendChild(ui)); }

    // === UI UPDATE LOGIC (v62 Icons) ===
    function updateUI(speed) {
        if (!isBotActive) {
            Object.assign(ui.style, { background: 'rgba(0, 0, 0, 0.7)', borderColor: '#666' });
            ui.innerText = "Bot is stopped";
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

        Object.assign(ui.style, { background: color, borderColor: 'rgba(255,255,255,0.5)' });
        ui.innerHTML = `${icon} SPEED: <b>${speed.toFixed(1)}</b> | TX: <b>${jumpCount}</b>`;
    }

    // === TOGGLE HANDLER ===
    window.addEventListener('keydown', (e) => {
        if (!e.isTrusted) return;
        if (e.key.toLowerCase() === 's') {
            if (e.target.tagName !== 'INPUT') {
                isBotActive = !isBotActive;
                if (isBotActive) {
                    startBot();
                    ui.innerHTML = "Bot Active...";
                } else {
                    stopBot();
                    updateUI(0);
                }
            }
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
                    triggerDist = 75;
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
                if (obs.xPos < triggerDist) {
                    if (!r.tRex.jumping && !r.tRex.ducking) {

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

                        setTimeout(() => {
                            if (r.tRex.jumping) {
                                releaseSpace();
                            }
                        }, holdTime + extraHold);
                    }
                }
            }
        }
    }

    function startBot() { if (!botFrameId) botLoop(); }
    function stopBot() { if (botFrameId) { cancelAnimationFrame(botFrameId); botFrameId = null; } }

})();
