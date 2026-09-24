// Production-ready Node.js Socket.IO & REST Backend Server for Checkmate Nexus
// Can be run with: node server.js (requires express & socket.io)
// If running purely client-side, the frontend also includes automatic multi-tab sync & configurable remote socket connection.

const http = require('http');
const express = require('express');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

const PORT = process.env.PORT || 4000;

app.use(express.json());
app.use(express.static(path.join(__dirname, '.')));

// In-Memory Game Store
const games = new Map();

function generateGameId() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let id = '';
  for (let i = 0; i < 6; i++) {
    id += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return id;
}

// REST Endpoints
app.post('/api/games/create', (req, res) => {
  const { timeControl, gameType, hostName, hostRating, preferredColor } = req.body;
  const gameId = generateGameId();

  // Parse time control (e.g., "3+2" -> 180s base, 2s inc)
  let baseSeconds = 180;
  let incrementSeconds = 0;
  if (timeControl && timeControl.includes('+')) {
    const parts = timeControl.split('+');
    baseSeconds = parseInt(parts[0], 10) * 60;
    incrementSeconds = parseInt(parts[1], 10);
  }

  let hostColor = 'white';
  if (preferredColor === 'black') hostColor = 'black';
  else if (preferredColor === 'random') hostColor = Math.random() < 0.5 ? 'white' : 'black';

  const game = {
    id: gameId,
    timeControl: timeControl || '3+2',
    baseSeconds,
    incrementSeconds,
    gameType: gameType || 'private',
    createdAt: Date.now(),
    status: 'waiting', // waiting, playing, finished
    fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
    turn: 'white',
    moves: [],
    history: [],
    white: hostColor === 'white' ? { id: null, name: hostName || 'Player 1', rating: hostRating || 1500, time: baseSeconds, connected: false } : null,
    black: hostColor === 'black' ? { id: null, name: hostName || 'Player 1', rating: hostRating || 1500, time: baseSeconds, connected: false } : null,
    drawOffer: null,
    winner: null,
    resultReason: null,
    chat: []
  };

  games.set(gameId, game);
  res.status(201).json({ success: true, gameId, game });
});

app.get('/api/games/:gameId', (req, res) => {
  const game = games.get(req.params.gameId.toUpperCase());
  if (!game) {
    return res.status(404).json({ success: false, message: 'Game not found' });
  }
  res.json({ success: true, game });
});

app.get('/api/games', (req, res) => {
  const publicGames = [];
  games.forEach((g) => {
    if (g.gameType === 'public' && g.status === 'waiting') {
      publicGames.push(g);
    }
  });
  res.json({ success: true, games: publicGames });
});

// Socket.IO Events
io.on('connection', (socket) => {
  console.log(`[Socket] Client connected: ${socket.id}`);

  socket.on('game:join', ({ gameId, playerName, playerRating }) => {
    const cleanId = (gameId || '').toUpperCase();
    const game = games.get(cleanId);
    if (!game) {
      socket.emit('error', { message: 'Game not found' });
      return;
    }

    socket.join(cleanId);
    socket.gameId = cleanId;

    let assignedColor = null;

    if (!game.white) {
      game.white = { id: socket.id, name: playerName || 'Player 1', rating: playerRating || 1500, time: game.baseSeconds, connected: true };
      assignedColor = 'white';
    } else if (!game.black) {
      game.black = { id: socket.id, name: playerName || 'Player 2', rating: playerRating || 1500, time: game.baseSeconds, connected: true };
      assignedColor = 'black';
    } else if (game.white.id === socket.id) {
      game.white.connected = true;
      assignedColor = 'white';
    } else if (game.black.id === socket.id) {
      game.black.connected = true;
      assignedColor = 'black';
    } else {
      // Spectator
      assignedColor = 'spectator';
    }

    socket.playerColor = assignedColor;

    socket.emit('game:joined', {
      gameId: cleanId,
      color: assignedColor,
      game
    });

    socket.to(cleanId).emit('player:joined', {
      player: assignedColor === 'white' ? game.white : game.black,
      color: assignedColor,
      game
    });

    // If both players joined, start game
    if (game.white && game.black && game.status === 'waiting') {
      game.status = 'playing';
      game.lastMoveTime = Date.now();
      io.to(cleanId).emit('game:start', { game });
    }
  });

  socket.on('game:move', (moveData) => {
    const { gameId, from, to, promotion, fen, san, moveNumber } = moveData;
    const game = games.get(gameId);
    if (!game || game.status !== 'playing') return;

    // Increment clock for player who moved
    const now = Date.now();
    if (game.lastMoveTime) {
      const elapsed = (now - game.lastMoveTime) / 1000;
      if (game.turn === 'white' && game.white) {
        game.white.time = Math.max(0, game.white.time - elapsed + game.incrementSeconds);
      } else if (game.turn === 'black' && game.black) {
        game.black.time = Math.max(0, game.black.time - elapsed + game.incrementSeconds);
      }
    }
    game.lastMoveTime = now;
    game.fen = fen || game.fen;
    game.turn = game.turn === 'white' ? 'black' : 'white';
    game.moves.push({ from, to, promotion, san, moveNumber, time: now });

    io.to(gameId).emit('game:move', {
      from,
      to,
      promotion,
      fen: game.fen,
      san,
      turn: game.turn,
      whiteTime: game.white ? game.white.time : 0,
      blackTime: game.black ? game.black.time : 0,
      game
    });
  });

  socket.on('game:chat', ({ gameId, username, message }) => {
    const game = games.get(gameId);
    const chatMsg = {
      id: Date.now() + Math.random().toString(),
      sender: username || 'Player',
      color: socket.playerColor,
      text: message,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    if (game) game.chat.push(chatMsg);
    io.to(gameId).emit('game:chat', chatMsg);
  });

  socket.on('game:draw_offer', ({ gameId }) => {
    const game = games.get(gameId);
    if (!game) return;
    game.drawOffer = socket.playerColor;
    socket.to(gameId).emit('game:draw_offer', { fromColor: socket.playerColor });
  });

  socket.on('game:draw_response', ({ gameId, accept }) => {
    const game = games.get(gameId);
    if (!game) return;
    if (accept) {
      game.status = 'finished';
      game.winner = 'draw';
      game.resultReason = 'Draw by agreement';
      io.to(gameId).emit('game:end', {
        winner: 'draw',
        reason: 'Draw by mutual agreement',
        game
      });
    } else {
      game.drawOffer = null;
      socket.to(gameId).emit('game:draw_declined');
    }
  });

  socket.on('game:resign', ({ gameId }) => {
    const game = games.get(gameId);
    if (!game || game.status !== 'playing') return;
    const resigningColor = socket.playerColor;
    const winner = resigningColor === 'white' ? 'black' : 'white';
    game.status = 'finished';
    game.winner = winner;
    game.resultReason = `${resigningColor === 'white' ? 'White' : 'Black'} resigned`;
    io.to(gameId).emit('game:end', {
      winner,
      reason: game.resultReason,
      resignedColor: resigningColor,
      game
    });
  });

  socket.on('game:timeout', ({ gameId, timedOutColor }) => {
    const game = games.get(gameId);
    if (!game || game.status !== 'playing') return;
    const winner = timedOutColor === 'white' ? 'black' : 'white';
    game.status = 'finished';
    game.winner = winner;
    game.resultReason = `${timedOutColor === 'white' ? 'White' : 'Black'} ran out of time`;
    io.to(gameId).emit('game:end', {
      winner,
      reason: game.resultReason,
      game
    });
  });

  socket.on('game:checkmate', ({ gameId, winnerColor }) => {
    const game = games.get(gameId);
    if (!game || game.status !== 'playing') return;
    game.status = 'finished';
    game.winner = winnerColor;
    game.resultReason = `${winnerColor === 'white' ? 'White' : 'Black'} wins by Checkmate`;
    io.to(gameId).emit('game:end', {
      winner: winnerColor,
      reason: game.resultReason,
      game
    });
  });

  socket.on('game:rematch_offer', ({ gameId }) => {
    socket.to(gameId).emit('game:rematch_offer', { fromColor: socket.playerColor });
  });

  socket.on('game:rematch_accept', ({ oldGameId }) => {
    const oldGame = games.get(oldGameId);
    const newGameId = generateGameId();
    if (oldGame) {
      const newGame = {
        id: newGameId,
        timeControl: oldGame.timeControl,
        baseSeconds: oldGame.baseSeconds,
        incrementSeconds: oldGame.incrementSeconds,
        gameType: oldGame.gameType,
        createdAt: Date.now(),
        status: 'waiting',
        fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
        turn: 'white',
        moves: [],
        history: [],
        // Swap colors on rematch
        white: oldGame.black ? { ...oldGame.black, time: oldGame.baseSeconds } : null,
        black: oldGame.white ? { ...oldGame.white, time: oldGame.baseSeconds } : null,
        drawOffer: null,
        winner: null,
        resultReason: null,
        chat: []
      };
      games.set(newGameId, newGame);
      io.to(oldGameId).emit('game:rematch_start', { newGameId, game: newGame });
    }
  });

  socket.on('disconnect', () => {
    console.log(`[Socket] Client disconnected: ${socket.id}`);
    if (socket.gameId) {
      const game = games.get(socket.gameId);
      if (game) {
        if (game.white && game.white.id === socket.id) game.white.connected = false;
        if (game.black && game.black.id === socket.id) game.black.connected = false;
        socket.to(socket.gameId).emit('player:disconnected', {
          color: socket.playerColor,
          socketId: socket.id
        });
      }
    }
  });
});

if (require.main === module) {
  server.listen(PORT, () => {
    console.log(`♛ Checkmate Nexus Backend Server running on http://localhost:${PORT}`);
  });
}

module.exports = { app, server, io };
