# ♔ Checkmate Nexus — Real-Time Multiplayer Live Chess Application

> **"Grandmaster Precision • Sub-Second Real-Time Synchronization • Pure Live Chess"**

![Checkmate Nexus Banner](https://img.shields.io/badge/Checkmate%20Nexus-Live%20Multiplayer%20Chess-6366f1?style=for-the-badge)
![Tech Stack](https://img.shields.io/badge/Stack-HTML5%20%7C%20CSS3%20%7C%20JavaScript%20%7C%20Socket.IO-06b6d4?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-fbbf24?style=for-the-badge)

---

## 📖 Overview

**Checkmate Nexus** is a state-of-the-art live multiplayer chess web application engineered for real-time online play. It connects two players seamlessly over **Socket.IO WebSockets** and **REST APIs**, complete with live clocks, instant piece animation, move notation log, captured piece counters with material advantage tracking, interactive in-game chat, draw offers, resignations, rematches, and mobile drawers.

---

## ✨ Features

### 1. ⚡ Create Live Game
- **Time Controls**:
  - `1+0` (Bullet)
  - `2+1` (Bullet)
  - `3+0` (Blitz)
  - `3+2` (Blitz)
  - `5+0` (Blitz)
  - `10+0` (Rapid)
  - `10+5` (Rapid)
  - `15+10` (Rapid)
  - `30+0` (Classical)
  - `CUSTOM` (Configurable base minutes and increment seconds)
- **Game Types**:
  - `Private Link` (Invite-only room)
  - `Public Arena` (Listed in the live public lobby)
- **Preferred Color**: White / Random / Black

### 2. 🔗 Share Game Screen & Waiting Room
- Displays generated 6-character **Game ID** (e.g. `8F72KQ`).
- One-click `COPY LINK` with `✓ LINK COPIED` feedback.
- Native `SHARE` button (Web Share API integration).
- Real-time animated **Waiting for opponent...** radar slot.
- **Automatic Transition**: When opponent joins, updates player card with Username, Rating (e.g. `1450`), and `Status: CONNECTED` before smoothly transitioning directly to the live chessboard.

### 3. 🎯 Join Game Page (`/game/:gameId`)
- Route support via URL hash / deep link (`#/game/8F72KQ`).
- Displays Match Preview: Game ID, Host, Time Control, and Assigned Color.
- `JOIN GAME` sequence:
  - `JOINING GAME...` ➔ `CONNECTED` ➔ Enters Live Board.

### 4. ♚ Live Chess Room & Real-Time Sync
- **Server Authoritative State**: Synchronizes via `game:move` with FEN, SAN, and clock timers.
- **Interactive Chessboard**:
  - Drag-and-drop & touch support for mobile.
  - Legal move dots and capture rings.
  - Dynamic check glow and king alert.
  - Pawn promotion modal (Queen, Rook, Bishop, Knight).
  - Board theme switcher (Neo Wood, Cyber Neon, Obsidian Gold, Slate Glass).
- **Synchronized Digital Clocks**:
  - Active turn glow.
  - Low-time panic animation under 20 seconds.
- **Controls**:
  - `DRAW` (Interactive offer / accept prompt)
  - `RESIGN` (Confirmation modal)
  - `SETTINGS` (Themes & backend URL)
  - `FLIP BOARD` (Perspective flip)

### 5. 💬 Instant Game Chat
- Right-hand panel on desktop; slide-up bottom sheet on mobile.
- Real-time chat messages with timestamps and sender badges.
- Quick chess emote chips (`Good luck!`, `Have fun!`, `Well played!`, `Thanks!`).

### 6. 🏆 Game End & Rematch Modal
- Beautiful victory/defeat/draw fanfare:
  - `♔ CHECKMATE` • `YOU WIN` • `+18 Rating`
- Action buttons:
  - `REMATCH`: Creates a brand-new live match with swapped colors.
  - `ANALYZE GAME`: Step through the move list history.
  - `NEW GAME`: Returns to Play lobby.

### 7. 📱 Mobile Optimized
- Chessboard dynamically spans full mobile width.
- Move list and Chat collapse into touch drawers and bottom sheets.
- Mobile floating quick-action navigation bar.

---

## 🚀 Quick Start

### Option 1: Open Locally in Browser (Zero Backend Setup Needed)
Simply open [`index.html`](file:///c:/Users/Vishn/OneDrive/Desktop/vortex/index.html) in your browser. The application includes a built-in multi-tab peer synchronization bridge (`BroadcastChannel`), allowing two browser tabs on the same computer to play against each other with 100% full live synchronization!

### Option 2: Run with Node.js & Socket.IO Backend Server
```bash
# Install dependencies (if not already installed)
npm install express socket.io

# Start the live backend server
node server.js
```
Then visit `http://localhost:4000` in multiple browser windows or devices.

---

## 📡 Backend Integration & Socket.IO Events

| Event Name | Direction | Payload | Description |
| :--- | :--- | :--- | :--- |
| `game:join` | Client ➔ Server | `{ gameId, playerName, playerRating }` | Join room |
| `game:joined` | Server ➔ Client | `{ gameId, color, game }` | Joined confirmation |
| `player:joined` | Server ➔ Client | `{ player, color, game }` | Opponent entered |
| `game:start` | Server ➔ Client | `{ game }` | Both players ready |
| `game:move` | Bi-directional | `{ gameId, from, to, promotion, fen, san }` | Authoritative move |
| `game:chat` | Bi-directional | `{ gameId, username, message }` | Instant message |
| `game:draw_offer` | Bi-directional | `{ gameId }` | Offer draw |
| `game:draw_response`| Bi-directional | `{ gameId, accept }` | Accept/decline draw |
| `game:resign` | Client ➔ Server | `{ gameId }` | Player resigns |
| `game:end` | Server ➔ Client | `{ winner, reason, game }` | Match outcome |
| `game:rematch_offer`| Bi-directional | `{ gameId }` | Rematch challenge |
| `game:rematch_start`| Server ➔ Client | `{ newGameId, game }` | New rematch room |

---

## 📁 Project Architecture

```
├── index.html        # Main HTML5 SPA structure, modals & views
├── style.css         # Cyber-grandmaster dark glassmorphic design system
├── app.js            # Core application state, UI router, drag-and-drop & clocks
├── chess-engine.js   # Pure lightweight rule validator & FEN/SAN generator
├── sound-fx.js       # Web Audio API procedural sound synthesizer
├── network.js        # Socket.IO client manager & multi-tab peer bridge
├── server.js         # Node.js Express + Socket.IO live backend server
└── README.md         # Documentation
```
