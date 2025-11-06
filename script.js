// Import dependencies

import hotkeys from "hotkeys-js";
import * as kontra from "kontra";

// zustand imported but not used yet - available for future state management

// Destructure kontra exports
const { init, GameLoop, Sprite, Text } = kontra;

// Variables for canvas and context (will be initialized after DOM loads)
let canvas, context, loop;

// Game state
const gameState = {
    isRunning: false,
    score: 0,
    level: 1,
    combo: 0,
    startTime: null,
    fallingHotkeys: [],
    spawnTimer: 0,
    spawnInterval: 3000, // milliseconds between spawns
    gameSpeed: 50, // pixels per second
    activeHotkeys: new Map(), // Track active hotkey bindings
};

// Hotkey combinations pool
const hotkeyCombos = [
    "ctrl+a",
    "ctrl+s",
    "ctrl+z",
    "ctrl+c",
    "ctrl+v",
    "ctrl+x",
    "ctrl+f",
    "ctrl+n",
    "ctrl+o",
    "ctrl+p",
    "ctrl+w",
    "ctrl+t",
    "shift+a",
    "shift+b",
    "shift+c",
    "shift+d",
    "shift+e",
    "alt+tab",
    "alt+f4",
    "alt+enter",
    "ctrl+shift+n",
    "ctrl+shift+t",
    "ctrl+shift+i",
    "ctrl+1",
    "ctrl+2",
    "ctrl+3",
    "ctrl+4",
    "ctrl+5",
];

// DOM elements
const startBtn = document.getElementById("startBtn");
const resetBtn = document.getElementById("resetBtn");
const scoreDisplay = document.getElementById("score");
const timerDisplay = document.getElementById("timer");
const levelDisplay = document.getElementById("level");
const comboDisplay = document.getElementById("combo");
const gameOverlay = document.getElementById("gameOverlay");

// Create a falling hotkey sprite
function createFallingHotkey(combo) {
    if (!canvas) return null;

    const x = Math.random() * (canvas.width - 200) + 100;
    const y = -50;

    // Create text sprite for the hotkey
    const text = Text({
        text: combo,
        font: "20px Arial",
        color: "#667eea",
        x: x,
        y: y,
        textAlign: "center",
        width: 150,
        height: 40,
    });

    // Create a background box sprite
    const background = Sprite({
        x: x - 75,
        y: y - 20,
        width: 150,
        height: 40,
        color: "#f8f9fa",
    });

    // Initialize opacity for fade effects
    text.opacity = 1;
    background.opacity = 1;

    return {
        combo: combo,
        text: text,
        background: background,
        x: x,
        y: y,
        speed: gameState.gameSpeed,
        active: true,
        hit: false,
    };
}

// Spawn a new falling hotkey
function spawnHotkey() {
    if (!canvas) {
        console.error("Cannot spawn hotkey: canvas not initialized");
        return;
    }

    const randomCombo = hotkeyCombos[Math.floor(Math.random() * hotkeyCombos.length)];
    const hotkey = createFallingHotkey(randomCombo);

    if (!hotkey) {
        console.error("Failed to create hotkey");
        return;
    }

    console.log("Spawning hotkey:", randomCombo);

    // Register the hotkey with hotkeys-js
    const handler = (_event, _handler) => {
        if (hotkey.active && !hotkey.hit) {
            hotkey.hit = true;
            handleHotkeyHit(hotkey);
        }
    };

    // Bind the hotkey
    hotkeys(randomCombo, handler);

    // Store the handler for cleanup
    hotkey.handler = handler;
    hotkey.hotkeyString = randomCombo;

    gameState.fallingHotkeys.push(hotkey);
    gameState.activeHotkeys.set(randomCombo, handler);

    console.log("Hotkey spawned. Total hotkeys:", gameState.fallingHotkeys.length);
}

// Handle when a hotkey is pressed correctly
function handleHotkeyHit(hotkey) {
    gameState.score += 10 * gameState.level;
    gameState.combo += 1;
    // Bonus for combos
    if (gameState.combo > 1 && gameState.combo % 5 === 0) {
        gameState.score += 50;
    }

    updateStats();

    // Remove the hotkey binding
    if (hotkey.handler) {
        hotkeys.unbind(hotkey.hotkeyString, hotkey.handler);
        gameState.activeHotkeys.delete(hotkey.hotkeyString);
    }
}

// Remove hotkey that reached bottom
function removeHotkey(hotkey, index) {
    // Reset combo if missed
    if (hotkey.active && !hotkey.hit) {
        gameState.combo = 0;
        gameState.score = Math.max(0, gameState.score - 5);
    }
    // Remove hotkey binding
    if (hotkey.handler) {
        hotkeys.unbind(hotkey.hotkeyString, hotkey.handler);
        gameState.activeHotkeys.delete(hotkey.hotkeyString);
    }
    gameState.fallingHotkeys.splice(index, 1);
}

// Update statistics display
function updateStats() {
    scoreDisplay.textContent = gameState.score;
    levelDisplay.textContent = gameState.level;
    comboDisplay.textContent = gameState.combo;

    if (gameState.isRunning) {
        const elapsed = (Date.now() - gameState.startTime) / 1000;
        timerDisplay.textContent = `${Math.floor(elapsed)}s`;

        // Level up every 30 seconds
        const newLevel = Math.floor(elapsed / 30) + 1;
        if (newLevel > gameState.level) {
            gameState.level = newLevel;
            gameState.gameSpeed += 10;
            gameState.spawnInterval = Math.max(1000, gameState.spawnInterval - 200);
        }
    }
}

// Start the game
function startGame() {
    if (!canvas || !loop) {
        console.error("Canvas or game loop not initialized");
        return;
    }

    gameState.isRunning = true;
    gameState.startTime = Date.now();
    gameState.score = 0;
    gameState.level = 1;
    gameState.combo = 0;
    gameState.gameSpeed = 50;
    gameState.spawnInterval = 3000;
    gameState.fallingHotkeys = [];
    gameState.spawnTimer = 0;
    // Clear all existing hotkey bindings
    gameState.activeHotkeys.forEach((handler, combo) => {
        hotkeys.unbind(combo, handler);
    });
    gameState.activeHotkeys.clear();

    gameOverlay.style.display = "none";
    startBtn.disabled = true;
    resetBtn.disabled = false;

    // Spawn first hotkey
    spawnHotkey();

    // Start game loop
    loop.start();
}

// Reset the game
function resetGame() {
    gameState.isRunning = false;

    // Stop game loop
    loop.stop();

    // Clear all hotkey bindings
    gameState.activeHotkeys.forEach((handler, combo) => {
        hotkeys.unbind(combo, handler);
    });
    gameState.activeHotkeys.clear();

    // Clear all falling hotkeys
    gameState.fallingHotkeys = [];

    gameOverlay.style.display = "block";
    startBtn.disabled = false;
    resetBtn.disabled = true;

    // Reset stats
    gameState.score = 0;
    gameState.level = 1;
    gameState.combo = 0;
    updateStats();
    timerDisplay.textContent = "0s";
}

// Create game loop function
function createGameLoop() {
    return GameLoop({
        update: (dt) => {
            if (!gameState.isRunning || !canvas) return;

            // Spawn new hotkeys
            gameState.spawnTimer += dt * 1000;
            if (gameState.spawnTimer >= gameState.spawnInterval) {
                spawnHotkey();
                gameState.spawnTimer = 0;
            }

            // Update falling hotkeys
            for (let i = gameState.fallingHotkeys.length - 1; i >= 0; i--) {
                const hotkey = gameState.fallingHotkeys[i];

                if (hotkey.hit) {
                    // Animate hit effect (fade out and move up)
                    hotkey.y -= dt * 200;
                    hotkey.text.y = hotkey.y;
                    hotkey.background.y = hotkey.y - 20;
                    hotkey.text.opacity = Math.max(0, (hotkey.text.opacity || 1) - dt * 2);
                    hotkey.background.opacity = hotkey.text.opacity;

                    if (hotkey.text.opacity <= 0) {
                        removeHotkey(hotkey, i);
                    }
                } else {
                    // Move down
                    hotkey.y += dt * hotkey.speed;
                    hotkey.text.y = hotkey.y;
                    hotkey.background.y = hotkey.y - 20;

                    // Check if reached bottom
                    if (hotkey.y > canvas.height + 50) {
                        removeHotkey(hotkey, i);
                    }
                }
            }

            // Update stats
            updateStats();

            // Game over if too many hotkeys on screen
            if (gameState.fallingHotkeys.length > 10) {
                endGame();
            }
        },

        render: () => {
            if (!canvas || !context) return;

            // Clear canvas
            context.clearRect(0, 0, canvas.width, canvas.height);

            // Draw all falling hotkeys
            if (gameState.fallingHotkeys.length === 0 && gameState.isRunning) {
                // Debug: draw text if no hotkeys
                context.fillStyle = "#999";
                context.font = "16px Arial";
                context.textAlign = "center";
                context.fillText(
                    "Waiting for hotkeys to spawn...",
                    canvas.width / 2,
                    canvas.height / 2,
                );
            }

            gameState.fallingHotkeys.forEach((hotkey) => {
                if (hotkey.active) {
                    // Draw background box
                    context.fillStyle = hotkey.background.color || "#f8f9fa";
                    context.globalAlpha = hotkey.background.opacity || 1;
                    context.fillRect(
                        hotkey.background.x,
                        hotkey.background.y,
                        hotkey.background.width,
                        hotkey.background.height,
                    );

                    // Draw border
                    context.strokeStyle = "#667eea";
                    context.lineWidth = 2;
                    context.strokeRect(
                        hotkey.background.x,
                        hotkey.background.y,
                        hotkey.background.width,
                        hotkey.background.height,
                    );

                    // Draw text
                    context.globalAlpha = hotkey.text.opacity || 1;
                    context.fillStyle = hotkey.text.color || "#667eea";
                    context.font = hotkey.text.font || "20px Arial";
                    context.textAlign = "center";
                    context.textBaseline = "middle";
                    context.fillText(hotkey.text.text, hotkey.text.x, hotkey.text.y);

                    context.globalAlpha = 1;
                }
            });
        },
    });
}

// End game
function endGame() {
    gameState.isRunning = false;
    loop.stop();
    // Clear all hotkey bindings
    gameState.activeHotkeys.forEach((handler, combo) => {
        hotkeys.unbind(combo, handler);
    });
    gameState.activeHotkeys.clear();

    const elapsed = (Date.now() - gameState.startTime) / 1000;
    alert(
        `Game Over!\nScore: ${gameState.score}\nTime: ${Math.floor(
            elapsed,
        )}s\nLevel: ${gameState.level}`,
    );

    resetGame();
}

// Setup event listeners
function setupEventListeners() {
    startBtn.addEventListener("click", startGame);
    resetBtn.addEventListener("click", resetGame);
}

// Prevent default browser shortcuts for game hotkeys
hotkeys.filter = (_event) => {
    // Allow hotkeys to work in the game
    return true;
};

// Initialize when page loads
document.addEventListener("DOMContentLoaded", () => {
    // Get canvas element and initialize Kontra
    const canvasElement = document.getElementById("gameCanvas");

    // Set canvas size first
    canvasElement.width = 800;
    canvasElement.height = 500;

    // Initialize Kontra - it returns an object with canvas and context
    const kontraInit = init(canvasElement);
    canvas = kontraInit.canvas || canvasElement;
    context = kontraInit.context || canvasElement.getContext("2d");

    console.log("Kontra init result:", kontraInit);
    console.log("Canvas:", canvas, "Context:", context);

    // Create game loop after canvas is initialized
    loop = createGameLoop();

    // Start the loop immediately (it will only update if game is running)
    if (loop) {
        loop.start();
        console.log("Game loop started");
    } else {
        console.error("Failed to create game loop");
    }

    setupEventListeners();
    updateStats();

    console.log("Game initialized. Canvas:", canvas, "Context:", context, "Loop:", loop);
});
