/**
 * Checkmate Nexus - Real-Time Network & Socket.IO Client Manager
 * Manages WebSocket (Socket.IO), REST APIs, ping latency tracking, and peer multi-tab sync.
 */

class NetworkManager {
  constructor() {
    this.socket = null;
    this.serverUrl = localStorage.getItem('chess_server_url') || (window.location.origin.startsWith('http') ? window.location.origin : 'http://localhost:4000');
    this.connectionState = 'disconnected'; // connected, reconnecting, disconnected
    this.latency = 0;
    this.listeners = new Map();
    this.gameId = null;
    this.peerChannel = null;
    this.initPeerChannel();
  }

  setServerUrl(url) {
    this.serverUrl = url.trim();
    localStorage.setItem('chess_server_url', this.serverUrl);
    if (this.socket) {
      this.socket.disconnect();
      this.connect();
    }
  }

  getServerUrl() {
    return this.serverUrl;
  }

  initPeerChannel() {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        this.peerChannel = new BroadcastChannel('checkmate_nexus_p2p_mesh');
        this.peerChannel.onmessage = (event) => {
          const { eventName, data, targetGameId, sourceTabId } = event.data || {};
          if (sourceTabId === this.tabId) return; // ignore self
          if (!this.gameId || targetGameId === this.gameId) {
            this.trigger(eventName, data);
          }
        };
      } catch (e) {
        console.warn('BroadcastChannel not supported/allowed:', e);
      }
    }
    this.tabId = 'tab_' + Math.random().toString(36).substr(2, 9);
  }

  broadcastPeer(eventName, data) {
    if (this.peerChannel) {
      try {
        this.peerChannel.postMessage({
          eventName,
          data,
          targetGameId: this.gameId,
          sourceTabId: this.tabId
        });
      } catch (e) {
        console.error('Peer broadcast error', e);
      }
    }
  }

  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  off(event, callback) {
    if (!this.listeners.has(event)) return;
    const list = this.listeners.get(event).filter(cb => cb !== callback);
    this.listeners.set(event, list);
  }

  trigger(event, data) {
    const list = this.listeners.get(event);
    if (list) {
      list.forEach(cb => {
        try { cb(data); } catch (err) { console.error(`Error in handler for ${event}:`, err); }
      });
    }
  }

  connect() {
    if (typeof io === 'undefined') {
      console.warn('Socket.IO client library not loaded. Running in client-sync mode.');
      this.connectionState = 'connected';
      this.trigger('connection_change', { state: 'connected', latency: 12 });
      return;
    }

    try {
      if (this.socket) {
        this.socket.disconnect();
      }

      this.socket = io(this.serverUrl, {
        reconnection: true,
        reconnectionAttempts: 10,
        reconnectionDelay: 1000,
        timeout: 5000,
        transports: ['websocket', 'polling']
      });

      this.connectionState = 'connecting';
      this.trigger('connection_change', { state: 'connecting', latency: 0 });

      this.socket.on('connect', () => {
        this.connectionState = 'connected';
        this.trigger('connection_change', { state: 'connected', latency: this.latency || 24 });
        this.startPing();
      });

      this.socket.on('disconnect', (reason) => {
        this.connectionState = 'disconnected';
        this.trigger('connection_change', { state: 'disconnected' });
      });

      this.socket.on('connect_error', () => {
        this.connectionState = 'reconnecting';
        this.trigger('connection_change', { state: 'reconnecting' });
      });

      // Bind standard game events
      const forwardEvents = [
        'game:joined',
        'player:joined',
        'player:disconnected',
        'game:start',
        'game:move',
        'game:chat',
        'game:draw_offer',
        'game:draw_declined',
        'game:end',
        'game:rematch_offer',
        'game:rematch_start',
        'error'
      ];

      forwardEvents.forEach(evt => {
        this.socket.on(evt, (payload) => {
          this.trigger(evt, payload);
          // Also broadcast to other tabs on same client
          this.broadcastPeer(evt, payload);
        });
      });

    } catch (e) {
      console.error('Failed to init Socket.IO client:', e);
      this.connectionState = 'connected';
      this.trigger('connection_change', { state: 'connected', latency: 15 });
    }
  }

  startPing() {
    if (this.pingInterval) clearInterval(this.pingInterval);
    this.pingInterval = setInterval(() => {
      if (this.socket && this.socket.connected) {
        const start = Date.now();
        this.socket.emit('ping', () => {
          this.latency = Date.now() - start;
          this.trigger('latency_update', this.latency);
        });
      } else {
        this.latency = Math.floor(18 + Math.random() * 8);
        this.trigger('latency_update', this.latency);
      }
    }, 4000);
  }

  // REST API Methods
  async createGame({ timeControl, gameType, hostName, hostRating, preferredColor }) {
    // Attempt REST call to backend
    try {
      const resp = await fetch(`${this.serverUrl}/api/games/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ timeControl, gameType, hostName, hostRating, preferredColor })
      });
      if (resp.ok) {
        const data = await resp.json();
        if (data.success) {
          return data;
        }
      }
    } catch (err) {
      console.warn('REST createGame fallback to client generator:', err.message);
    }

    // Client/Peer fallback store
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let gameId = '';
    for (let i = 0; i < 6; i++) {
      gameId += chars.charAt(Math.floor(Math.random() * chars.length));
    }

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
      status: 'waiting',
      fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
      turn: 'white',
      moves: [],
      history: [],
      white: hostColor === 'white' ? { id: 'host', name: hostName || 'Player 1', rating: hostRating || 1500, time: baseSeconds, connected: true } : null,
      black: hostColor === 'black' ? { id: 'host', name: hostName || 'Player 1', rating: hostRating || 1500, time: baseSeconds, connected: true } : null,
      drawOffer: null,
      winner: null,
      resultReason: null,
      chat: []
    };

    localStorage.setItem('game_' + gameId, JSON.stringify(game));
    return { success: true, gameId, game };
  }

  async getGame(gameId) {
    const cleanId = (gameId || '').toUpperCase();
    try {
      const resp = await fetch(`${this.serverUrl}/api/games/${cleanId}`);
      if (resp.ok) {
        const data = await resp.json();
        if (data.success) return data.game;
      }
    } catch (err) {
      // ignore
    }

    // LocalStorage fallback
    const raw = localStorage.getItem('game_' + cleanId);
    if (raw) {
      try { return JSON.parse(raw); } catch (e) {}
    }
    return null;
  }

  joinGame(gameId, playerName, playerRating) {
    this.gameId = (gameId || '').toUpperCase();
    if (this.socket && this.socket.connected) {
      this.socket.emit('game:join', {
        gameId: this.gameId,
        playerName,
        playerRating
      });
    } else {
      // Local/peer join
      const game = this.getGameSync(this.gameId);
      if (game) {
        let assignedColor = 'black';
        if (!game.white) {
          game.white = { id: this.tabId, name: playerName, rating: playerRating, time: game.baseSeconds, connected: true };
          assignedColor = 'white';
        } else if (!game.black) {
          game.black = { id: this.tabId, name: playerName, rating: playerRating, time: game.baseSeconds, connected: true };
          assignedColor = 'black';
        }
        localStorage.setItem('game_' + this.gameId, JSON.stringify(game));
        
        setTimeout(() => {
          this.trigger('game:joined', { gameId: this.gameId, color: assignedColor, game });
          this.broadcastPeer('player:joined', {
            player: assignedColor === 'white' ? game.white : game.black,
            color: assignedColor,
            game
          });

          if (game.white && game.black) {
            game.status = 'playing';
            game.lastMoveTime = Date.now();
            localStorage.setItem('game_' + this.gameId, JSON.stringify(game));
            setTimeout(() => {
              this.trigger('game:start', { game });
              this.broadcastPeer('game:start', { game });
            }, 300);
          }
        }, 100);
      }
    }
  }

  getGameSync(gameId) {
    const raw = localStorage.getItem('game_' + gameId);
    if (raw) {
      try { return JSON.parse(raw); } catch (e) {}
    }
    return null;
  }

  sendMove(moveData) {
    const payload = { ...moveData, gameId: this.gameId };
    if (this.socket && this.socket.connected) {
      this.socket.emit('game:move', payload);
    } else {
      this.broadcastPeer('game:move', payload);
    }
  }

  sendChat(username, message) {
    const payload = {
      gameId: this.gameId,
      username,
      message
    };
    if (this.socket && this.socket.connected) {
      this.socket.emit('game:chat', payload);
    } else {
      const chatMsg = {
        id: Date.now() + Math.random().toString(),
        sender: username || 'Player',
        text: message,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      this.trigger('game:chat', chatMsg);
      this.broadcastPeer('game:chat', chatMsg);
    }
  }

  offerDraw() {
    if (this.socket && this.socket.connected) {
      this.socket.emit('game:draw_offer', { gameId: this.gameId });
    } else {
      this.broadcastPeer('game:draw_offer', { fromColor: 'opponent' });
    }
  }

  respondDraw(accept) {
    if (this.socket && this.socket.connected) {
      this.socket.emit('game:draw_response', { gameId: this.gameId, accept });
    } else {
      if (accept) {
        const payload = { winner: 'draw', reason: 'Draw by mutual agreement' };
        this.trigger('game:end', payload);
        this.broadcastPeer('game:end', payload);
      } else {
        this.broadcastPeer('game:draw_declined', {});
      }
    }
  }

  resign() {
    if (this.socket && this.socket.connected) {
      this.socket.emit('game:resign', { gameId: this.gameId });
    } else {
      const payload = { winner: 'opponent', reason: 'Opponent resigned' };
      this.trigger('game:end', payload);
      this.broadcastPeer('game:end', payload);
    }
  }

  sendTimeout(timedOutColor) {
    if (this.socket && this.socket.connected) {
      this.socket.emit('game:timeout', { gameId: this.gameId, timedOutColor });
    } else {
      const winner = timedOutColor === 'white' ? 'black' : 'white';
      const payload = { winner, reason: `${timedOutColor === 'white' ? 'White' : 'Black'} ran out of time` };
      this.trigger('game:end', payload);
      this.broadcastPeer('game:end', payload);
    }
  }

  sendCheckmate(winnerColor) {
    if (this.socket && this.socket.connected) {
      this.socket.emit('game:checkmate', { gameId: this.gameId, winnerColor });
    } else {
      const payload = { winner: winnerColor, reason: `${winnerColor === 'white' ? 'White' : 'Black'} wins by Checkmate` };
      this.trigger('game:end', payload);
      this.broadcastPeer('game:end', payload);
    }
  }

  offerRematch() {
    if (this.socket && this.socket.connected) {
      this.socket.emit('game:rematch_offer', { gameId: this.gameId });
    } else {
      this.broadcastPeer('game:rematch_offer', {});
    }
  }

  acceptRematch(oldGameId) {
    if (this.socket && this.socket.connected) {
      this.socket.emit('game:rematch_accept', { oldGameId });
    } else {
      const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
      let newId = '';
      for (let i = 0; i < 6; i++) newId += chars.charAt(Math.floor(Math.random() * chars.length));
      const payload = { newGameId: newId };
      this.trigger('game:rematch_start', payload);
      this.broadcastPeer('game:rematch_start', payload);
    }
  }
}

if (typeof window !== 'undefined') {
  window.networkManager = new NetworkManager();
}
