# 🦖 MegaETH Dino Bot

An automated Chrome extension bot for the MegaETH stress test dinosaur game at [stress.megaeth.com/egg](https://stress.megaeth.com/egg).

## 🎯 Features

- **Intelligent Jump Mechanics**: Physics-based calculations for optimal jump timing
- **Speed-Adaptive AI**: Different strategies for various speed ranges
- **Visual HUD**: Real-time display with color-coded speed indicators
- **Transaction Counter**: Tracks total jumps (transactions) per game session
- **Easy Controls**: Simple keyboard toggle (Press 'S' to start/stop)

## 🎮 HUD Display

The bot features a dynamic heads-up display showing:
- **Speed Indicator**: Current game speed
- **TX Counter**: Number of jumps performed in current session
- **Visual Modes** (color-coded by speed):
  - 🐢 **Teal** (< 13): Turtle mode - Safe start
  - 🐇 **Green** (13-22): Rabbit mode - Standard speed
  - 🐆 **Orange** (22-24.5): Cheetah mode - High speed
  - 🚀 **Red** (> 24.5): Rocket mode - Hyper speed

## 📦 Installation

1. **Download the extension**:
   - Clone this repository or download as ZIP
   ```bash
   git clone https://github.com/YOUR_USERNAME/megaeth-dino-bot.git
   ```

2. **Load in Chrome**:
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode" (top right)
   - Click "Load unpacked"
   - Select the `megaeth-dino-bot` folder

3. **Navigate to the game**:
   - Go to [https://stress.megaeth.com/egg](https://stress.megaeth.com/egg)

## 🎯 Usage

1. **Start the game** on the MegaETH stress test page
2. **Press 'S'** to activate the bot
3. Watch the bot play automatically with real-time stats
4. **Press 'S'** again to pause/stop the bot

## 🧠 Bot Intelligence

### Speed Tiers

The bot uses different strategies based on game speed:

- **< 13 (Blind Safety)**: Conservative jumps with extended hold time
- **13-22 (Standard)**: Linear trigger distance formula
- **22-24.5 (Goldilocks)**: Physics-based calculation with moderate gravity (0.75)
- **> 24.5 (Hyper-G)**: Aggressive physics with high gravity (0.9) for precise jumps

### Jump Mechanics

- **Single obstacles**: Quick, agile jumps
- **Obstacle groups**: Higher, longer jumps with extended hold time
- **Dynamic gravity**: Temporary gravity adjustments for optimal trajectory
- **Physics-based timing**: Calculates trigger distance using velocity and gravity

## 🛠️ Technical Details

- **Manifest Version**: 3
- **Permissions**: None required
- **Injection**: Main world script injection for direct game access
- **Framework**: Vanilla JavaScript

## 📊 Stats Tracking

- **TX Counter**: Automatically resets when a new game starts (detected by speed drop)
- **Persistent across toggles**: Counter maintains value when bot is paused/resumed during gameplay

## 🔧 Development

The bot consists of two main files:
- `manifest.json`: Chrome extension configuration
- `content.js`: Bot logic and UI implementation

### Key Components

1. **UI System**: Dynamic HUD with color-coded visual feedback
2. **Detection Logic**: Obstacle pattern recognition and grouping
3. **Physics Engine**: Gravity and velocity calculations
4. **Execution System**: Precise jump timing and key management

## 📝 Version History

- **v1.0 (v62)**: Initial release with full feature set
  - Speed-adaptive AI
  - Visual HUD with icons
  - Transaction counter
  - Multi-tier physics system

## ⚠️ Disclaimer

This bot is created for educational and testing purposes. Use responsibly and in accordance with the MegaETH stress test guidelines.

## 📄 License

MIT License - Feel free to modify and distribute

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

---

Made with 💎 for the MegaETH community
