/**
 * Checkmate Nexus — Real-Time Live Chess Application Engine
 * Implements real user login, dynamic player names/emails, Live Rooms, Room IDs,
 * AI Bots (Easy, Medium, Hard), Clocks, Socket.IO, and Chat.
 */

// SVG Piece definitions
const PIECE_SVGS = {
  wp: `<svg viewBox="0 0 45 45"><path d="M22.5 9c-2.21 0-4 1.79-4 4 0 .89.29 1.71.78 2.38C17.33 16.5 16 18.59 16 21c0 2.03.94 3.84 2.41 5.03-3 1.06-7.41 5.55-7.41 13.47h23c0-7.92-4.41-12.41-7.41-13.47 1.47-1.19 2.41-3 2.41-5.03 0-2.41-1.33-4.5-3.28-5.62.49-.67.78-1.49.78-2.38 0-2.21-1.79-4-4-4z" fill="#fff" stroke="#000" stroke-width="1.5" stroke-linecap="round"/></svg>`,
  wn: `<svg viewBox="0 0 45 45"><g fill="none" fill-rule="evenodd" stroke="#000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10c10.5 1 16.5 8 16 29H15c0-9 10-6.5 8-21" fill="#fff"/><path d="M24 18c.38 2.91-5.55 7.37-8 9-3 2-2.82 4.34-5 4-1.042-.94 1.41-4.04 3-6 2.1-2.6 4.79-5.11 6-7 1.37-2.16 2.14-5.26 4-7z" fill="#fff"/><path d="M9.5 25.5a.5.5 0 1 1-1 0 .5.5 0 1 1 1 0zm5.5-12a.5.5 0 1 1-1 0 .5.5 0 1 1 1 0z" fill="#000"/></g></svg>`,
  wb: `<svg viewBox="0 0 45 45"><g fill="none" fill-rule="evenodd" stroke="#000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><g fill="#fff"><path d="M9 36c3.39-.97 10.11.43 13.5-2 3.39 2.43 10.11 1.03 13.5 2 0 0 1.65.54 3 2-.68.97-1.65.99-3 .5-3.39-.97-10.11.46-13.5-1-3.39 1.46-10.11.03-13.5 1-1.354.49-2.323.47-3-.5 1.354-1.94 3-2 3-2z"/><path d="M15 32c2.5 2.5 12.5 2.5 15 0 .5-1.5 0-2 0-2 0-2.5-2.5-4-2.5-4 5.5-1.5 6-11.5-5-15.5-11 4-10.5 14-5 15.5 0 0-2.5 1.5-2.5 4 0 0-.5.5 0 2z"/><path d="M25 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 1 1 5 0z"/></g><path d="M17.5 26h10M15 30h15m-7.5-14.5v5M20 18h5"/></g></svg>`,
  wr: `<svg viewBox="0 0 45 45"><g fill="none" fill-rule="evenodd" stroke="#000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 39h27v-3H9v3zm3-3v-4h21v4H12zm2-4V14h17v18H14z" fill="#fff"/><path d="M14 14V9h4v3h4V9h5v3h4V9h4v5H14z" fill="#fff"/><path d="M12 36v-4h21v4H12zm2-4V14h17v18H14zM11 14h23" stroke-width="1.5"/></g></svg>`,
  wq: `<svg viewBox="0 0 45 45"><g fill="#fff" fill-rule="evenodd" stroke="#000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M8 12a2 2 0 1 1-4 0 2 2 0 1 1 4 0zm16.5-4.5a2 2 0 1 1-4 0 2 2 0 1 1 4 0zm16.5 4.5a2 2 0 1 1-4 0 2 2 0 1 1 4 0zM11.5 18a2 2 0 1 1-4 0 2 2 0 1 1 4 0zm26 0a2 2 0 1 1-4 0 2 2 0 1 1 4 0z"/><path d="M9 26c8.5-1.5 21-1.5 27 0l2-12-7 11V11l-5.5 13.5-3-15-3 15-5.5-13.5V25l-7-11 2 12z"/><path d="M9 26c0 2 1.5 2 2.5 4 2.5 5 1 5.5 1 5.5h20s-1.5-.5 1-5.5c1-2 2.5-2 2.5-4H9zm2.5 13h20v-3h-20v3z"/></g></svg>`,
  wk: `<svg viewBox="0 0 45 45"><g fill="none" fill-rule="evenodd" stroke="#000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22.5 11.63V6M20 8h5" stroke-linejoin="miter"/><path d="M22.5 25s4.5-7.5 3-10.5c0 0-1-2.5-3-2.5s-3 2.5-3 2.5c-1.5 3 3 10.5 3 10.5" fill="#fff"/><path d="M11.5 37c5.5 3.5 15.5 3.5 21 0v-7s9-4.5 6-10.5c-4-1-6 2.5-6 2.5s-.5-1.5-2-2.5c-3-2-4-1.5-4-1.5s-2.5-6.5-6-6.5-6 6.5-6 6.5-1-.5-4 1.5c-1.5 1-2 2.5-2 2.5s-2-3.5-6-2.5c-3 6 6 10.5 6 10.5v7z" fill="#fff"/><path d="M11.5 30c5.5-3 15.5-3 21 0m-21 3.5c5.5-3 15.5-3 21 0m-21 3.5c5.5-3 15.5-3 21 0"/></g></svg>`,
  
  bp: `<svg viewBox="0 0 45 45"><path d="M22.5 9c-2.21 0-4 1.79-4 4 0 .89.29 1.71.78 2.38C17.33 16.5 16 18.59 16 21c0 2.03.94 3.84 2.41 5.03-3 1.06-7.41 5.55-7.41 13.47h23c0-7.92-4.41-12.41-7.41-13.47 1.47-1.19 2.41-3 2.41-5.03 0-2.41-1.33-4.5-3.28-5.62.49-.67.78-1.49.78-2.38 0-2.21-1.79-4-4-4z" fill="#1c1917" stroke="#000" stroke-width="1.5" stroke-linecap="round"/></svg>`,
  bn: `<svg viewBox="0 0 45 45"><g fill="none" fill-rule="evenodd" stroke="#000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10c10.5 1 16.5 8 16 29H15c0-9 10-6.5 8-21" fill="#1c1917"/><path d="M24 18c.38 2.91-5.55 7.37-8 9-3 2-2.82 4.34-5 4-1.042-.94 1.41-4.04 3-6 2.1-2.6 4.79-5.11 6-7 1.37-2.16 2.14-5.26 4-7z" fill="#1c1917"/><path d="M9.5 25.5a.5.5 0 1 1-1 0 .5.5 0 1 1 1 0zm5.5-12a.5.5 0 1 1-1 0 .5.5 0 1 1 1 0z" fill="#e2e8f0"/></g></svg>`,
  bb: `<svg viewBox="0 0 45 45"><g fill="none" fill-rule="evenodd" stroke="#000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><g fill="#1c1917"><path d="M9 36c3.39-.97 10.11.43 13.5-2 3.39 2.43 10.11 1.03 13.5 2 0 0 1.65.54 3 2-.68.97-1.65.99-3 .5-3.39-.97-10.11.46-13.5-1-3.39 1.46-10.11.03-13.5 1-1.354.49-2.323.47-3-.5 1.354-1.94 3-2 3-2z"/><path d="M15 32c2.5 2.5 12.5 2.5 15 0 .5-1.5 0-2 0-2 0-2.5-2.5-4-2.5-4 5.5-1.5 6-11.5-5-15.5-11 4-10.5 14-5 15.5 0 0-2.5 1.5-2.5 4 0 0-.5.5 0 2z"/><path d="M25 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 1 1 5 0z"/></g><path d="M17.5 26h10M15 30h15m-7.5-14.5v5M20 18h5" stroke="#e2e8f0"/></g></svg>`,
  br: `<svg viewBox="0 0 45 45"><g fill="none" fill-rule="evenodd" stroke="#000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 39h27v-3H9v3zm3-3v-4h21v4H12zm2-4V14h17v18H14z" fill="#1c1917"/><path d="M14 14V9h4v3h4V9h5v3h4V9h4v5H14z" fill="#1c1917"/><path d="M12 36v-4h21v4H12zm2-4V14h17v18H14zM11 14h23" stroke="#e2e8f0" stroke-width="1.5"/></g></svg>`,
  bq: `<svg viewBox="0 0 45 45"><g fill="#1c1917" fill-rule="evenodd" stroke="#000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M8 12a2 2 0 1 1-4 0 2 2 0 1 1 4 0zm16.5-4.5a2 2 0 1 1-4 0 2 2 0 1 1 4 0zm16.5 4.5a2 2 0 1 1-4 0 2 2 0 1 1 4 0zM11.5 18a2 2 0 1 1-4 0 2 2 0 1 1 4 0zm26 0a2 2 0 1 1-4 0 2 2 0 1 1 4 0z"/><path d="M9 26c8.5-1.5 21-1.5 27 0l2-12-7 11V11l-5.5 13.5-3-15-3 15-5.5-13.5V25l-7-11 2 12z"/><path d="M9 26c0 2 1.5 2 2.5 4 2.5 5 1 5.5 1 5.5h20s-1.5-.5 1-5.5c1-2 2.5-2 2.5-4H9zm2.5 13h20v-3h-20v3z"/><path d="M12 28h21M11 31h23" stroke="#e2e8f0"/></g></svg>`,
  bk: `<svg viewBox="0 0 45 45"><g fill="none" fill-rule="evenodd" stroke="#000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22.5 11.63V6M20 8h5" stroke-linejoin="miter"/><path d="M22.5 25s4.5-7.5 3-10.5c0 0-1-2.5-3-2.5s-3 2.5-3 2.5c-1.5 3 3 10.5 3 10.5" fill="#1c1917"/><path d="M11.5 37c5.5 3.5 15.5 3.5 21 0v-7s9-4.5 6-10.5c-4-1-6 2.5-6 2.5s-.5-1.5-2-2.5c-3-2-4-1.5-4-1.5s-2.5-6.5-6-6.5-6 6.5-6 6.5-1-.5-4 1.5c-1.5 1-2 2.5-2 2.5s-2-3.5-6-2.5c-3 6 6 10.5 6 10.5v7z" fill="#1c1917"/><path d="M11.5 30c5.5-3 15.5-3 21 0m-21 3.5c5.5-3 15.5-3 21 0m-21 3.5c5.5-3 15.5-3 21 0" stroke="#e2e8f0"/></g></svg>`
};

class ChessApp {
  constructor() {
    // Dynamic user state
    const savedName = localStorage.getItem('chess_username');
    this.user = {
      name: savedName || null,
      rating: parseInt(localStorage.getItem('chess_rating') || '1500', 10)
    };
    
    this.engine = new ChessEngine();
    this.network = window.networkManager;
    this.sounds = window.soundFx;

    // Game state
    this.gameId = null;
    this.playerColor = 'white';
    this.isAiGame = false;
    this.aiDifficulty = 'medium';
    this.flipped = false;
    this.selectedSquare = null;
    this.legalMoves = [];
    this.lastMove = null;
    this.pendingPromotion = null;
    this.gameStatus = 'idle';

    // Clocks
    this.whiteTime = 180;
    this.blackTime = 180;
    this.increment = 2;
    this.clockInterval = null;

    this.initElements();
    this.bindEvents();
    this.initNetworkHandlers();
    this.updateUserInterface();
    this.handleRoute();

    // If user has never logged in, show login modal upfront
    if (!this.user.name) {
      setTimeout(() => {
        this.modalPlayerLogin.classList.add('active');
        document.getElementById('loginNameOrEmailInput').focus();
      }, 300);
    }

    // Start network
    this.network.connect();
  }

  initElements() {
    // Views
    this.viewPlay = document.getElementById('viewPlay');
    this.viewWaiting = document.getElementById('viewWaiting');
    this.viewJoin = document.getElementById('viewJoin');
    this.viewRoom = document.getElementById('viewRoom');

    // Modals
    this.modalPlayerLogin = document.getElementById('modalPlayerLogin');
    this.modalPlayAi = document.getElementById('modalPlayAi');
    this.modalCreateGame = document.getElementById('modalCreateGame');
    this.modalGameEnd = document.getElementById('modalGameEnd');
    this.modalSettings = document.getElementById('modalSettings');
    this.promotionModal = document.getElementById('promotionModal');

    // Header & Info
    this.headerUserName = document.getElementById('headerUserName');
    this.headerUserRating = document.getElementById('headerUserRating');
    this.userAvatar = document.getElementById('userAvatar');
    this.heroWelcomeName = document.getElementById('heroWelcomeName');
    this.connectionStatusText = document.getElementById('connectionStatusText');
    this.navConnectionStatus = document.getElementById('navConnectionStatus');
    this.pingValue = document.getElementById('pingValue');
    this.connectionBanner = document.getElementById('connectionBanner');

    // Waiting room elements
    this.waitingGameId = document.getElementById('waitingGameId');
    this.waitingShareLink = document.getElementById('waitingShareLink');
    this.waitingHostName = document.getElementById('waitingHostName');
    this.waitingHostColor = document.getElementById('waitingHostColor');
    this.waitingOpponentName = document.getElementById('waitingOpponentName');
    this.waitingOpponentStatus = document.getElementById('waitingOpponentStatus');
    this.waitingOpponentAvatar = document.getElementById('waitingOpponentAvatar');

    // Board elements
    this.chessboardGrid = document.getElementById('chessboardGrid');
    this.topPlayerClock = document.getElementById('topPlayerClock');
    this.bottomPlayerClock = document.getElementById('bottomPlayerClock');
    this.topPlayerName = document.getElementById('topPlayerName');
    this.bottomPlayerName = document.getElementById('bottomPlayerName');
    this.topPlayerRating = document.getElementById('topPlayerRating');
    this.bottomPlayerRating = document.getElementById('bottomPlayerRating');
    this.topPlayerStrip = document.getElementById('topPlayerStrip');
    this.bottomPlayerStrip = document.getElementById('bottomPlayerStrip');
    this.topCapturedPieces = document.getElementById('topCapturedPieces');
    this.bottomCapturedPieces = document.getElementById('bottomCapturedPieces');
    this.movesTableBody = document.getElementById('movesTableBody');

    // Chat
    this.chatMessagesScroll = document.getElementById('chatMessagesScroll');
    this.chatInput = document.getElementById('chatInput');
    this.btnChatSend = document.getElementById('btnChatSend');
    this.chatUnreadCount = document.getElementById('chatUnreadCount');
    this.unreadCount = 0;
  }

  updateUserInterface() {
    const displayName = this.user.name || 'Login to Play';
    this.headerUserName.textContent = displayName;
    this.headerUserRating.textContent = this.user.rating;
    this.userAvatar.textContent = this.user.name ? this.user.name.charAt(0).toUpperCase() : '?';
    
    if (this.heroWelcomeName) {
      this.heroWelcomeName.textContent = this.user.name ? `Welcome, ${this.user.name}!` : 'Multiplayer & AI';
    }

    const joinInput = document.getElementById('joinPlayerNameInput');
    if (joinInput && this.user.name) joinInput.value = this.user.name;
    const loginInput = document.getElementById('loginNameOrEmailInput');
    if (loginInput && this.user.name) loginInput.value = this.user.name;
  }

  requireLogin(callback) {
    if (this.user.name) {
      if (callback) callback();
      return true;
    }
    this.pendingAction = callback;
    this.modalPlayerLogin.classList.add('active');
    document.getElementById('loginNameOrEmailInput').focus();
    return false;
  }

  bindEvents() {
    // Hash routing
    window.addEventListener('hashchange', () => this.handleRoute());

    // Navigation & Modals
    document.getElementById('brandLogo').addEventListener('click', () => this.navigateTo('play'));
    document.getElementById('btnOpenCreateGame').addEventListener('click', () => {
      this.requireLogin(() => this.openCreateModal());
    });
    document.getElementById('btnCloseCreateModal').addEventListener('click', () => this.closeModal(this.modalCreateGame));
    document.getElementById('btnBoardSettings').addEventListener('click', () => this.openSettingsModal());
    document.getElementById('btnServerConfig').addEventListener('click', () => this.openSettingsModal());
    document.getElementById('btnCloseSettingsModal').addEventListener('click', () => this.closeModal(this.modalSettings));

    // Player Login / Profile Modal
    document.getElementById('userProfileBtn').addEventListener('click', () => {
      document.getElementById('btnCloseLoginModal').style.display = this.user.name ? 'block' : 'none';
      this.modalPlayerLogin.classList.add('active');
      document.getElementById('loginNameOrEmailInput').focus();
    });
    document.getElementById('btnCloseLoginModal').addEventListener('click', () => {
      this.closeModal(this.modalPlayerLogin);
    });

    // Form submission on Enter key
    document.getElementById('loginNameOrEmailInput').addEventListener('keypress', (e) => {
      if (e.key === 'Enter') document.getElementById('btnSavePlayerProfile').click();
    });

    document.getElementById('btnSavePlayerProfile').addEventListener('click', () => {
      const input = document.getElementById('loginNameOrEmailInput');
      const name = input.value.trim();
      if (!name) {
        input.focus();
        this.showToast('Please enter your player name or email to continue.');
        return;
      }
      const rating = parseInt(document.getElementById('loginRatingSelect').value || '1500', 10);
      this.user.name = name;
      this.user.rating = rating;
      localStorage.setItem('chess_username', name);
      localStorage.setItem('chess_rating', rating);
      this.updateUserInterface();
      this.closeModal(this.modalPlayerLogin);
      this.showToast(`Logged in as: ${name}`);

      if (this.pendingAction) {
        const action = this.pendingAction;
        this.pendingAction = null;
        action();
      }
    });

    // AI Bot Modal & Buttons
    document.getElementById('btnOpenPlayAi').addEventListener('click', () => {
      this.requireLogin(() => this.modalPlayAi.classList.add('active'));
    });
    document.getElementById('btnClosePlayAiModal').addEventListener('click', () => {
      this.closeModal(this.modalPlayAi);
    });

    const diffBtns = document.querySelectorAll('[data-difficulty]');
    diffBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        diffBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      });
    });

    const aiTcBtns = document.querySelectorAll('[data-ai-tc]');
    aiTcBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        aiTcBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      });
    });

    const aiColorBtns = document.querySelectorAll('[data-ai-color]');
    aiColorBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        aiColorBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      });
    });

    document.getElementById('btnStartAiMatch').addEventListener('click', () => {
      const activeDiff = document.querySelector('[data-difficulty].active')?.dataset.difficulty || 'medium';
      const activeTc = document.querySelector('[data-ai-tc].active')?.dataset.aiTc || '5+0';
      const activeColor = document.querySelector('[data-ai-color].active')?.dataset.aiColor || 'white';
      this.closeModal(this.modalPlayAi);
      this.startAiGame(activeDiff, activeTc, activeColor);
    });

    // Quick Room ID Join
    document.getElementById('btnQuickJoinRoom').addEventListener('click', () => {
      const input = document.getElementById('quickRoomIdInput');
      const val = input.value.trim().toUpperCase();
      if (!val) {
        this.showToast('Please enter a 6-digit Game ID.');
        return;
      }
      this.requireLogin(() => {
        window.location.hash = `#/game/${val}`;
      });
    });

    // Sound toggle
    document.getElementById('btnSoundToggle').addEventListener('click', (e) => {
      const enabled = this.sounds.toggle();
      e.currentTarget.textContent = enabled ? '🔊' : '🔇';
    });

    // Time Control Options in Modal
    const tcBtns = document.querySelectorAll('.tc-option-btn');
    tcBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        tcBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const isCustom = btn.dataset.tc === 'custom';
        document.getElementById('customTcInputs').classList.toggle('active', isCustom);
      });
    });

    // Game Type Toggle
    const gameTypeBtns = document.querySelectorAll('.game-type-btn');
    gameTypeBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        gameTypeBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      });
    });

    // Color Choice Toggle
    const colorBtns = document.querySelectorAll('.color-choice-btn');
    colorBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        colorBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      });
    });

    // Quick Pool Cards
    document.querySelectorAll('.pool-card').forEach(card => {
      card.addEventListener('click', () => {
        this.requireLogin(() => this.createQuickGame(card.dataset.tc));
      });
    });

    // Create Game Submission
    document.getElementById('btnSubmitCreateGame').addEventListener('click', () => this.handleCreateGameSubmit());

    // Share game buttons
    document.getElementById('btnCopyShareLink').addEventListener('click', () => this.copyShareLink());
    document.getElementById('btnNativeShare').addEventListener('click', () => this.nativeShare());
    document.getElementById('btnCancelGame').addEventListener('click', () => this.cancelWaitingGame());
    document.getElementById('btnWaitingSwitchAi').addEventListener('click', () => {
      this.cancelWaitingGame();
      this.startAiGame('medium', '5+0', this.playerColor || 'white');
    });

    // Join page actions
    document.getElementById('btnExecuteJoinGame').addEventListener('click', () => this.executeJoinGame());

    // Game Controls
    document.getElementById('btnOfferDraw').addEventListener('click', () => this.handleDrawOffer());
    document.getElementById('btnResign').addEventListener('click', () => this.handleResignClick());
    document.getElementById('btnFlipBoard').addEventListener('click', () => this.flipBoard());

    // Settings save
    document.getElementById('btnSaveSettings').addEventListener('click', () => {
      const theme = document.getElementById('boardThemeSelector').value;
      document.body.dataset.boardTheme = theme;
      localStorage.setItem('chess_board_theme', theme);
      const url = document.getElementById('serverUrlInput').value;
      if (url) this.network.setServerUrl(url);
      this.closeModal(this.modalSettings);
    });

    // Restore saved theme
    const savedTheme = localStorage.getItem('chess_board_theme');
    if (savedTheme) {
      document.body.dataset.boardTheme = savedTheme;
      document.getElementById('boardThemeSelector').value = savedTheme;
    }

    // Side panel tabs (Moves / Chat)
    document.getElementById('tabBtnMoves').addEventListener('click', () => this.switchPanelTab('moves'));
    document.getElementById('tabBtnChat').addEventListener('click', () => this.switchPanelTab('chat'));

    // Chat
    this.btnChatSend.addEventListener('click', () => this.handleChatSend());
    this.chatInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.handleChatSend();
    });

    // Quick Emotes
    document.querySelectorAll('.emote-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        this.network.sendChat(this.user.name || 'Player', chip.dataset.msg);
      });
    });

    // Game End Modal Actions
    document.getElementById('btnModalRematch').addEventListener('click', () => this.handleRematchClick());
    document.getElementById('btnModalAnalyze').addEventListener('click', () => {
      this.closeModal(this.modalGameEnd);
      this.showToast('Analysis mode: Step through moves using the move list table.');
    });
    document.getElementById('btnModalNewGame').addEventListener('click', () => {
      this.closeModal(this.modalGameEnd);
      this.navigateTo('play');
    });

    // Mobile drawer drag handle
    document.getElementById('mobileDrawerHandle').addEventListener('click', () => {
      document.getElementById('sidePanel').classList.toggle('mobile-open');
    });
  }

  initNetworkHandlers() {
    this.network.on('connection_change', ({ state, latency }) => {
      this.connectionStatusText.textContent = state === 'connected' ? '● LIVE' : (state === 'reconnecting' ? '⚠ RECONNECTING' : '⚠ OFFLINE');
      this.navConnectionStatus.className = 'nav-status-badge ' + state;
      
      if (state === 'reconnecting') {
        this.connectionBanner.style.display = 'block';
        this.connectionBanner.style.background = 'rgba(245, 158, 11, 0.9)';
        this.connectionBanner.style.color = '#000';
        this.connectionBanner.textContent = '⚠ CONNECTION LOST — Reconnecting to live server...';
      } else if (state === 'connected') {
        if (this.connectionBanner.style.display === 'block') {
          this.connectionBanner.style.background = 'rgba(16, 185, 129, 0.9)';
          this.connectionBanner.textContent = '✓ RECONNECTED';
          setTimeout(() => { this.connectionBanner.style.display = 'none'; }, 2000);
        }
      }
    });

    this.network.on('latency_update', (ms) => {
      this.pingValue.textContent = `${ms}ms`;
    });

    this.network.on('game:joined', (data) => {
      this.playerColor = data.color;
      this.flipped = (this.playerColor === 'black');
      this.renderBoard();
    });

    this.network.on('player:joined', ({ player, color, game }) => {
      this.waitingOpponentName.textContent = player ? player.name : 'Challenger';
      this.waitingOpponentStatus.className = 'slot-status-pill ready';
      this.waitingOpponentStatus.textContent = 'CONNECTED';
      this.waitingOpponentAvatar.className = 'slot-avatar ready';
      this.waitingOpponentAvatar.textContent = color === 'white' ? '♔' : '♚';

      this.sounds.playGameStart();
      this.showToast(`Player ${player ? player.name : ''} connected! Game starting...`);

      setTimeout(() => {
        this.startLiveGame(game);
      }, 1000);
    });

    this.network.on('game:start', ({ game }) => {
      this.startLiveGame(game);
    });

    this.network.on('game:move', (data) => {
      if (!this.isAiGame) {
        this.handleIncomingMove(data);
      }
    });

    this.network.on('game:chat', (chatMsg) => {
      this.appendChatMessage(chatMsg);
    });

    this.network.on('game:draw_offer', () => {
      this.showDrawPrompt();
    });

    this.network.on('game:draw_declined', () => {
      this.showToast('Draw offer was declined.');
    });

    this.network.on('game:end', (data) => {
      this.handleServerGameEnd(data);
    });

    this.network.on('game:rematch_offer', () => {
      this.showRematchPrompt();
    });

    this.network.on('game:rematch_start', ({ newGameId }) => {
      this.showToast('Rematch accepted! Starting new game...');
      setTimeout(() => {
        window.location.hash = `#/game/${newGameId}`;
      }, 800);
    });
  }

  handleRoute() {
    const hash = window.location.hash || '#play';
    const matchJoin = hash.match(/^#\/game\/([A-Za-z0-9]+)$/);

    if (matchJoin) {
      const targetGameId = matchJoin[1].toUpperCase();
      this.showJoinView(targetGameId);
    } else if (hash === '#waiting') {
      this.switchPage(this.viewWaiting);
    } else if (hash === '#room') {
      this.switchPage(this.viewRoom);
    } else {
      this.switchPage(this.viewPlay);
    }
  }

  navigateTo(viewName) {
    if (viewName === 'play') window.location.hash = '#play';
    else if (viewName === 'waiting') window.location.hash = '#waiting';
    else if (viewName === 'room') window.location.hash = '#room';
  }

  switchPage(targetPage) {
    [this.viewPlay, this.viewWaiting, this.viewJoin, this.viewRoom].forEach(page => {
      page.classList.remove('active');
    });
    targetPage.classList.add('active');
    window.scrollTo(0, 0);
  }

  openCreateModal() {
    this.modalCreateGame.classList.add('active');
  }

  openSettingsModal() {
    this.modalSettings.classList.add('active');
  }

  closeModal(modal) {
    modal.classList.remove('active');
  }

  createQuickGame(timeControl) {
    this.executeCreateGame(timeControl, 'private', 'white');
  }

  handleCreateGameSubmit() {
    const activeTcBtn = document.querySelector('.tc-option-btn.active');
    let timeControl = activeTcBtn ? activeTcBtn.dataset.tc : '3+2';
    if (timeControl === 'custom') {
      const mins = document.getElementById('customBaseMinutes').value || 5;
      const inc = document.getElementById('customIncrementSec').value || 0;
      timeControl = `${mins}+${inc}`;
    }

    const activeTypeBtn = document.querySelector('.game-type-btn.active');
    const gameType = activeTypeBtn ? activeTypeBtn.dataset.type : 'private';

    const activeColorBtn = document.querySelector('.color-choice-btn.active');
    const preferredColor = activeColorBtn ? activeColorBtn.dataset.color : 'white';

    this.closeModal(this.modalCreateGame);
    this.executeCreateGame(timeControl, gameType, preferredColor);
  }

  async executeCreateGame(timeControl, gameType, preferredColor) {
    try {
      this.isAiGame = false;
      const res = await this.network.createGame({
        timeControl,
        gameType,
        hostName: this.user.name || 'Host',
        hostRating: this.user.rating,
        preferredColor
      });

      if (res && res.success) {
        this.gameId = res.gameId;
        this.playerColor = (preferredColor === 'black') ? 'black' : 'white';
        this.showWaitingRoom(res.game);
      }
    } catch (e) {
      console.error('Create game error', e);
      this.showToast('Failed to create game.');
    }
  }

  showWaitingRoom(game) {
    this.waitingGameId.textContent = game.id;
    const gameUrl = `${window.location.origin}${window.location.pathname}#/game/${game.id}`;
    this.waitingShareLink.value = gameUrl;

    this.waitingHostName.textContent = this.user.name || 'Host';
    this.waitingHostColor.textContent = `Your Color: ${this.playerColor.toUpperCase()}`;
    this.waitingOpponentName.textContent = 'WAITING...';
    this.waitingOpponentStatus.className = 'slot-status-pill waiting';
    this.waitingOpponentStatus.textContent = 'Waiting for opponent...';

    this.network.joinGame(game.id, this.user.name || 'Host', this.user.rating);
    this.navigateTo('waiting');
  }

  copyShareLink() {
    const link = this.waitingShareLink.value;
    navigator.clipboard.writeText(link).then(() => {
      const btn = document.getElementById('btnCopyShareLink');
      const text = document.getElementById('copyBtnText');
      const icon = document.getElementById('copyIcon');
      btn.classList.add('copied');
      text.textContent = '✓ LINK COPIED';
      icon.textContent = '✓';
      setTimeout(() => {
        btn.classList.remove('copied');
        text.textContent = 'COPY LINK';
        icon.textContent = '📋';
      }, 2500);
    });
  }

  nativeShare() {
    const link = this.waitingShareLink.value;
    if (navigator.share) {
      navigator.share({
        title: 'Checkmate Nexus — Chess Challenge',
        text: `Play live chess against ${this.user.name || 'Player'} on Checkmate Nexus!`,
        url: link
      }).catch(() => {});
    } else {
      this.copyShareLink();
    }
  }

  cancelWaitingGame() {
    this.gameId = null;
    this.navigateTo('play');
  }

  // ==========================================
  // PLAY VS AI ENGINE
  // ==========================================
  startAiGame(difficulty = 'medium', timeControl = '5+0', preferredColor = 'white') {
    this.requireLogin(() => {
      this.isAiGame = true;
      this.aiDifficulty = difficulty;
      this.gameId = 'AI_' + Math.random().toString(36).substr(2, 5).toUpperCase();

      let color = preferredColor;
      if (color === 'random') color = Math.random() < 0.5 ? 'white' : 'black';
      this.playerColor = color;
      this.flipped = (color === 'black');

      const botNames = {
        easy: { name: 'Apprentice Bot (Easy)', rating: 800 },
        medium: { name: 'Tactician Bot (Medium)', rating: 1400 },
        hard: { name: 'Nexus Master AI (Hard)', rating: 1950 }
      };

      const bot = botNames[difficulty] || botNames.medium;

      const game = {
        id: this.gameId,
        timeControl,
        fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
        white: color === 'white' ? { name: this.user.name, rating: this.user.rating } : bot,
        black: color === 'black' ? { name: this.user.name, rating: this.user.rating } : bot
      };

      this.startLiveGame(game);
      this.showToast(`Match started vs ${bot.name}!`);

      if (this.playerColor === 'black') {
        setTimeout(() => this.makeAiMove(), 600);
      }
    });
  }

  makeAiMove() {
    if (this.gameStatus !== 'playing' || !this.isAiGame) return;

    const isBotWhite = (this.playerColor === 'black');
    const isBotsTurn = (this.engine.turn === 'w' && isBotWhite) || (this.engine.turn === 'b' && !isBotWhite);

    if (!isBotsTurn) return;

    const thinkTimes = { easy: 300, medium: 500, hard: 800 };
    const delay = thinkTimes[this.aiDifficulty] || 500;

    setTimeout(() => {
      const bestMove = this.engine.getBestAIMove(this.aiDifficulty);
      if (bestMove) {
        const historyEntry = this.engine.makeMove(bestMove);
        if (historyEntry) {
          this.lastMove = { from: bestMove.from, to: bestMove.to };
          
          if (historyEntry.captured) this.sounds.playCapture();
          else if (historyEntry.san.includes('O-O')) this.sounds.playCastle();
          else this.sounds.playMove();

          if (this.engine.inCheck()) this.sounds.playCheck();

          this.renderBoard();
          this.renderMoveList();
          this.checkLocalEndConditions();
        }
      }
    }, delay);
  }

  // ==========================================
  // JOIN GAME PAGE
  // ==========================================
  async showJoinView(gameId) {
    this.gameId = gameId;
    this.isAiGame = false;
    this.switchPage(this.viewJoin);
    document.getElementById('joinGameIdDisplay').textContent = gameId;

    const game = await this.network.getGame(gameId);
    if (game) {
      document.getElementById('joinTimeControl').textContent = game.timeControl;
      const host = game.white || game.black;
      if (host) {
        document.getElementById('joinHostName').textContent = `${host.name} (${host.rating || 1500})`;
      }
      const hostIsWhite = !!game.white;
      document.getElementById('joinAssignedColor').textContent = hostIsWhite ? 'BLACK' : 'WHITE';
    }

    const joinInput = document.getElementById('joinPlayerNameInput');
    if (joinInput && this.user.name) joinInput.value = this.user.name;
  }

  executeJoinGame() {
    const nameInput = document.getElementById('joinPlayerNameInput');
    const enteredName = nameInput.value.trim();
    if (!enteredName) {
      nameInput.focus();
      this.showToast('Please enter your player name or email to join.');
      return;
    }

    this.user.name = enteredName;
    localStorage.setItem('chess_username', this.user.name);
    this.updateUserInterface();

    const btnText = document.getElementById('joinBtnText');
    const spinner = document.getElementById('joinBtnSpinner');
    btnText.textContent = 'JOINING GAME...';
    spinner.style.display = 'inline-block';

    setTimeout(() => {
      btnText.textContent = 'CONNECTED';
      this.network.joinGame(this.gameId, this.user.name, this.user.rating);
    }, 500);
  }

  // ==========================================
  // START LIVE GAME & RENDER BOARD
  // ==========================================
  startLiveGame(game) {
    this.gameStatus = 'playing';
    this.gameId = game ? game.id : this.gameId;
    document.getElementById('roomGameIdBadge').textContent = `ID: ${this.gameId}`;
    
    if (game && game.timeControl) {
      document.getElementById('roomTimeControlTag').textContent = `${game.timeControl} LIVE`;
      const parts = game.timeControl.split('+');
      this.whiteTime = parseInt(parts[0], 10) * 60;
      this.blackTime = this.whiteTime;
      this.increment = parseInt(parts[1] || '0', 10);
    }

    this.flipped = (this.playerColor === 'black');
    this.engine.reset(game && game.fen ? game.fen : undefined);

    const playerName = this.user.name || 'Player';

    if (this.playerColor === 'white') {
      this.bottomPlayerName.textContent = playerName;
      this.bottomPlayerRating.textContent = this.user.rating;
      this.topPlayerName.textContent = (game && game.black) ? game.black.name : 'Opponent';
      this.topPlayerRating.textContent = (game && game.black) ? game.black.rating : '1450';
    } else {
      this.bottomPlayerName.textContent = playerName;
      this.bottomPlayerRating.textContent = this.user.rating;
      this.topPlayerName.textContent = (game && game.white) ? game.white.name : 'Opponent';
      this.topPlayerRating.textContent = (game && game.white) ? game.white.rating : '1500';
    }

    this.renderBoard();
    this.renderMoveList();
    this.startClock();
    this.navigateTo('room');
    this.sounds.playGameStart();
  }

  renderBoard() {
    this.chessboardGrid.innerHTML = '';

    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const displayRow = this.flipped ? 7 - r : r;
        const displayCol = this.flipped ? 7 - c : c;

        const square = document.createElement('div');
        const isLight = (displayRow + displayCol) % 2 === 0;
        square.className = `square ${isLight ? 'light' : 'dark'}`;
        square.dataset.row = displayRow;
        square.dataset.col = displayCol;
        square.dataset.sq = this.engine.coordsToAlgebraic(displayRow, displayCol);

        if (displayCol === (this.flipped ? 7 : 0)) {
          const rankEl = document.createElement('span');
          rankEl.className = 'square-coord rank';
          rankEl.textContent = 8 - displayRow;
          square.appendChild(rankEl);
        }
        if (displayRow === (this.flipped ? 0 : 7)) {
          const fileEl = document.createElement('span');
          fileEl.className = 'square-coord file';
          fileEl.textContent = String.fromCharCode('a'.charCodeAt(0) + displayCol);
          square.appendChild(fileEl);
        }

        if (this.selectedSquare && this.selectedSquare[0] === displayRow && this.selectedSquare[1] === displayCol) {
          square.classList.add('selected');
        }

        if (this.legalMoves.some(m => m.to[0] === displayRow && m.to[1] === displayCol)) {
          const targetPiece = this.engine.getPiece(displayRow, displayCol);
          if (targetPiece || this.isEnPassantTarget(displayRow, displayCol)) {
            square.classList.add('capture-target');
          } else {
            square.classList.add('move-target');
          }
        }

        if (this.lastMove) {
          if ((this.lastMove.from[0] === displayRow && this.lastMove.from[1] === displayCol) ||
              (this.lastMove.to[0] === displayRow && this.lastMove.to[1] === displayCol)) {
            square.classList.add('last-move');
          }
        }

        if (this.engine.inCheck()) {
          const kingPos = this.engine.findKing(this.engine.turn);
          if (kingPos && kingPos[0] === displayRow && kingPos[1] === displayCol) {
            square.classList.add('in-check');
          }
        }

        const piece = this.engine.getPiece(displayRow, displayCol);
        if (piece) {
          const pieceEl = document.createElement('div');
          pieceEl.className = 'piece';
          const pieceKey = `${piece.color}${piece.type}`;
          pieceEl.innerHTML = PIECE_SVGS[pieceKey] || '';
          pieceEl.draggable = true;

          pieceEl.addEventListener('dragstart', (e) => this.handleDragStart(e, displayRow, displayCol));
          pieceEl.addEventListener('dragend', (e) => this.handleDragEnd(e));

          pieceEl.addEventListener('touchstart', (e) => this.handleTouchStart(e, displayRow, displayCol), { passive: false });
          pieceEl.addEventListener('touchmove', (e) => this.handleTouchMove(e), { passive: false });
          pieceEl.addEventListener('touchend', (e) => this.handleTouchEnd(e, displayRow, displayCol));

          square.appendChild(pieceEl);
        }

        square.addEventListener('click', () => this.handleSquareClick(displayRow, displayCol));
        square.addEventListener('dragover', (e) => e.preventDefault());
        square.addEventListener('drop', (e) => this.handleDrop(e, displayRow, displayCol));

        this.chessboardGrid.appendChild(square);
      }
    }

    this.updateCapturedPieces();
    this.updateTurnIndicator();
  }

  isEnPassantTarget(r, c) {
    return this.engine.enPassant && this.engine.enPassant[0] === r && this.engine.enPassant[1] === c;
  }

  // ==========================================
  // MOVE EXECUTION & DRAG-AND-DROP
  // ==========================================
  handleSquareClick(r, c) {
    if (this.gameStatus !== 'playing') return;

    const isMyTurn = (this.engine.turn === 'w' && this.playerColor === 'white') ||
                     (this.engine.turn === 'b' && this.playerColor === 'black');
    if (!isMyTurn) return;

    const clickedPiece = this.engine.getPiece(r, c);

    if (this.selectedSquare) {
      const [sr, sc] = this.selectedSquare;
      
      if (sr === r && sc === c) {
        this.selectedSquare = null;
        this.legalMoves = [];
        this.renderBoard();
        return;
      }

      const move = this.legalMoves.find(m => m.to[0] === r && m.to[1] === c);
      if (move) {
        this.checkPawnPromotion(sr, sc, r, c);
        return;
      }
    }

    const myPieceColor = this.playerColor === 'white' ? 'w' : 'b';
    if (clickedPiece && clickedPiece.color === myPieceColor && clickedPiece.color === this.engine.turn) {
      this.selectedSquare = [r, c];
      this.legalMoves = this.engine.getLegalMoves(r, c);
    } else {
      this.selectedSquare = null;
      this.legalMoves = [];
    }

    this.renderBoard();
  }

  handleDragStart(e, r, c) {
    const isMyTurn = (this.engine.turn === 'w' && this.playerColor === 'white') ||
                     (this.engine.turn === 'b' && this.playerColor === 'black');
    const piece = this.engine.getPiece(r, c);
    const myColor = this.playerColor === 'white' ? 'w' : 'b';

    if (!isMyTurn || !piece || piece.color !== myColor) {
      e.preventDefault();
      return;
    }

    this.selectedSquare = [r, c];
    this.legalMoves = this.engine.getLegalMoves(r, c);
    e.dataTransfer.setData('text/plain', JSON.stringify({ r, c }));
    setTimeout(() => this.renderBoard(), 10);
  }

  handleDragEnd(e) {}

  handleDrop(e, r, c) {
    e.preventDefault();
    if (!this.selectedSquare) return;
    const [sr, sc] = this.selectedSquare;
    const move = this.legalMoves.find(m => m.to[0] === r && m.to[1] === c);
    if (move) {
      this.checkPawnPromotion(sr, sc, r, c);
    }
  }

  handleTouchStart(e, r, c) {
    this.touchStartSq = [r, c];
    this.handleSquareClick(r, c);
  }

  handleTouchMove(e) {
    e.preventDefault();
  }

  handleTouchEnd(e, r, c) {
    const touch = e.changedTouches[0];
    const elem = document.elementFromPoint(touch.clientX, touch.clientY);
    const square = elem ? elem.closest('.square') : null;
    if (square) {
      const tr = parseInt(square.dataset.row, 10);
      const tc = parseInt(square.dataset.col, 10);
      if (this.selectedSquare && (this.selectedSquare[0] !== tr || this.selectedSquare[1] !== tc)) {
        this.handleSquareClick(tr, tc);
      }
    }
  }

  checkPawnPromotion(fromR, fromC, toR, toC) {
    const piece = this.engine.getPiece(fromR, fromC);
    if (piece && piece.type === 'p' && (toR === 0 || toR === 7)) {
      this.pendingPromotion = { from: [fromR, fromC], to: [toR, toC] };
      this.showPromotionPicker(piece.color);
    } else {
      this.executePlayerMove(fromR, fromC, toR, toC);
    }
  }

  showPromotionPicker(color) {
    const choices = document.getElementById('promotionChoices');
    choices.innerHTML = '';
    ['q', 'r', 'b', 'n'].forEach(type => {
      const btn = document.createElement('button');
      btn.className = 'promo-piece-btn';
      btn.innerHTML = PIECE_SVGS[`${color}${type}`];
      btn.addEventListener('click', () => {
        this.promotionModal.classList.remove('active');
        if (this.pendingPromotion) {
          const { from, to } = this.pendingPromotion;
          this.executePlayerMove(from[0], from[1], to[0], to[1], type);
          this.pendingPromotion = null;
        }
      });
      choices.appendChild(btn);
    });
    this.promotionModal.classList.add('active');
  }

  executePlayerMove(fromR, fromC, toR, toC, promotion = 'q') {
    const moveObj = { from: [fromR, fromC], to: [toR, toC], promotion };
    const historyEntry = this.engine.makeMove(moveObj);

    if (historyEntry) {
      this.lastMove = { from: [fromR, fromC], to: [toR, toC] };
      this.selectedSquare = null;
      this.legalMoves = [];

      if (historyEntry.captured) this.sounds.playCapture();
      else if (historyEntry.san.includes('O-O')) this.sounds.playCastle();
      else this.sounds.playMove();

      if (this.engine.inCheck()) this.sounds.playCheck();

      if (!this.isAiGame) {
        this.network.sendMove({
          from: historyEntry.from,
          to: historyEntry.to,
          promotion,
          fen: this.engine.getFen(),
          san: historyEntry.san,
          moveNumber: this.engine.fullMoves
        });
      }

      this.renderBoard();
      this.renderMoveList();
      this.checkLocalEndConditions();

      if (this.isAiGame && this.gameStatus === 'playing') {
        this.makeAiMove();
      }
    }
  }

  handleIncomingMove(data) {
    const { from, to, promotion, fen, san } = data;
    
    if (fen) {
      this.engine.loadFen(fen);
    } else {
      this.engine.makeMove({ from, to, promotion });
    }

    const fromCoords = this.engine.algebraicToCoords(from);
    const toCoords = this.engine.algebraicToCoords(to);
    if (fromCoords && toCoords) {
      this.lastMove = { from: fromCoords, to: toCoords };
    }

    if (san && san.includes('x')) this.sounds.playCapture();
    else if (san && san.includes('O-O')) this.sounds.playCastle();
    else this.sounds.playMove();

    if (this.engine.inCheck()) this.sounds.playCheck();

    this.renderBoard();
    this.renderMoveList();
    this.checkLocalEndConditions();
  }

  // ==========================================
  // CLOCKS & TURN TIMING
  // ==========================================
  startClock() {
    if (this.clockInterval) clearInterval(this.clockInterval);
    this.clockInterval = setInterval(() => {
      if (this.gameStatus !== 'playing') return;

      if (this.engine.turn === 'w') {
        this.whiteTime = Math.max(0, this.whiteTime - 1);
        if (this.whiteTime <= 0) this.handleTimeout('white');
        if (this.whiteTime <= 15 && this.whiteTime > 0 && this.playerColor === 'white') {
          this.sounds.playLowTime();
        }
      } else {
        this.blackTime = Math.max(0, this.blackTime - 1);
        if (this.blackTime <= 0) this.handleTimeout('black');
        if (this.blackTime <= 15 && this.blackTime > 0 && this.playerColor === 'black') {
          this.sounds.playLowTime();
        }
      }
      this.updateClockDisplays();
    }, 1000);
  }

  formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  updateClockDisplays() {
    const isPlayerWhite = this.playerColor === 'white';
    const myTime = isPlayerWhite ? this.whiteTime : this.blackTime;
    const oppTime = isPlayerWhite ? this.blackTime : this.whiteTime;

    this.bottomPlayerClock.textContent = this.formatTime(myTime);
    this.topPlayerClock.textContent = this.formatTime(oppTime);

    this.bottomPlayerClock.classList.toggle('low-time', myTime <= 20);
    this.topPlayerClock.classList.toggle('low-time', oppTime <= 20);
  }

  updateTurnIndicator() {
    const isWhiteTurn = this.engine.turn === 'w';
    const isPlayerWhite = this.playerColor === 'white';
    const isMyTurn = (isWhiteTurn && isPlayerWhite) || (!isWhiteTurn && !isPlayerWhite);

    this.bottomPlayerStrip.classList.toggle('active-turn', isMyTurn);
    this.topPlayerStrip.classList.toggle('active-turn', !isMyTurn);
  }

  updateCapturedPieces() {
    const { capturedByWhite, capturedByBlack, whiteAdvantage, blackAdvantage } = this.engine.getCapturedPieces();
    const isPlayerWhite = this.playerColor === 'white';

    const myCaptures = isPlayerWhite ? capturedByWhite : capturedByBlack;
    const oppCaptures = isPlayerWhite ? capturedByBlack : capturedByWhite;

    this.bottomCapturedPieces.innerHTML = myCaptures.map(p => PIECE_SVGS[`${p.color}${p.type}`]).join('');
    this.topCapturedPieces.innerHTML = oppCaptures.map(p => PIECE_SVGS[`${p.color}${p.type}`]).join('');

    const myAdvantage = isPlayerWhite ? whiteAdvantage : blackAdvantage;
    const oppAdvantage = isPlayerWhite ? blackAdvantage : whiteAdvantage;

    if (myAdvantage > 0) {
      this.bottomCapturedPieces.innerHTML += `<span class="material-advantage">+${myAdvantage}</span>`;
    }
    if (oppAdvantage > 0) {
      this.topCapturedPieces.innerHTML += `<span class="material-advantage">+${oppAdvantage}</span>`;
    }
  }

  renderMoveList() {
    this.movesTableBody.innerHTML = '';
    const history = this.engine.history;

    for (let i = 0; i < history.length; i += 2) {
      const moveNum = Math.floor(i / 2) + 1;
      const whiteMove = history[i];
      const blackMove = history[i + 1];

      const row = document.createElement('tr');
      row.innerHTML = `
        <td class="move-num">${moveNum}.</td>
        <td class="move-cell ${i === history.length - 1 ? 'active-move' : ''}">${whiteMove ? whiteMove.san : ''}</td>
        <td class="move-cell ${i + 1 === history.length - 1 ? 'active-move' : ''}">${blackMove ? blackMove.san : ''}</td>
      `;
      this.movesTableBody.appendChild(row);
    }

    const scrollArea = document.querySelector('.moves-scroll-area');
    if (scrollArea) scrollArea.scrollTop = scrollArea.scrollHeight;
  }

  // ==========================================
  // GAME END CONDITIONS & MODAL
  // ==========================================
  checkLocalEndConditions() {
    if (this.engine.isCheckmate()) {
      const winnerColor = this.engine.turn === 'w' ? 'black' : 'white';
      if (!this.isAiGame) this.network.sendCheckmate(winnerColor);
      this.showGameEndModal('checkmate', winnerColor, `${winnerColor === 'white' ? 'White' : 'Black'} won by Checkmate`);
    } else if (this.engine.isStalemate()) {
      if (!this.isAiGame) this.network.respondDraw(true);
      this.showGameEndModal('draw', 'draw', 'Draw by Stalemate');
    } else if (this.engine.isInsufficientMaterial()) {
      if (!this.isAiGame) this.network.respondDraw(true);
      this.showGameEndModal('draw', 'draw', 'Draw by Insufficient Material');
    }
  }

  handleTimeout(timedOutColor) {
    if (this.gameStatus !== 'playing') return;
    if (!this.isAiGame) this.network.sendTimeout(timedOutColor);
    const winner = timedOutColor === 'white' ? 'black' : 'white';
    this.showGameEndModal('timeout', winner, `${timedOutColor === 'white' ? 'White' : 'Black'} ran out of time`);
  }

  handleServerGameEnd(data) {
    const { winner, reason } = data;
    this.showGameEndModal('server', winner, reason || 'Game concluded');
  }

  showGameEndModal(type, winner, reason) {
    this.gameStatus = 'ended';
    if (this.clockInterval) clearInterval(this.clockInterval);

    const isWin = (winner === this.playerColor);
    const isDraw = (winner === 'draw');

    const iconEl = document.getElementById('gameEndIcon');
    const statusEl = document.getElementById('gameEndStatus');
    const subTitleEl = document.getElementById('gameEndSubTitle');
    const reasonEl = document.getElementById('gameEndReason');
    const eloEl = document.getElementById('gameEndElo');

    reasonEl.textContent = reason;

    if (isDraw) {
      iconEl.textContent = '🤝';
      statusEl.textContent = 'DRAW';
      statusEl.className = 'game-end-status draw';
      subTitleEl.textContent = 'GAME TIED';
      eloEl.textContent = '+0 Rating';
      eloEl.className = 'elo-val';
      this.sounds.playGameStart();
    } else if (isWin) {
      iconEl.textContent = '♔';
      statusEl.textContent = 'CHECKMATE';
      statusEl.className = 'game-end-status win';
      subTitleEl.textContent = 'YOU WIN';
      eloEl.textContent = '+18 Rating';
      eloEl.className = 'elo-val plus';
      this.sounds.playVictory();
    } else {
      iconEl.textContent = '♚';
      statusEl.textContent = 'DEFEAT';
      statusEl.className = 'game-end-status loss';
      subTitleEl.textContent = 'YOU LOST';
      eloEl.textContent = '-14 Rating';
      eloEl.className = 'elo-val minus';
      this.sounds.playDefeat();
    }

    this.modalGameEnd.classList.add('active');
  }

  handleDrawOffer() {
    if (this.gameStatus !== 'playing') return;
    if (this.isAiGame) {
      if (Math.random() < 0.5) {
        this.showToast('AI Bot accepted your draw offer!');
        this.showGameEndModal('draw', 'draw', 'Draw by mutual agreement');
      } else {
        this.showToast('AI Bot declined the draw offer.');
      }
      return;
    }
    this.network.offerDraw();
    this.showToast('Draw offer sent to opponent.');
  }

  showDrawPrompt() {
    this.showToast('Opponent offered a draw.', true, () => {
      this.network.respondDraw(true);
    }, () => {
      this.network.respondDraw(false);
    });
  }

  handleResignClick() {
    if (this.gameStatus !== 'playing') return;
    if (confirm('Are you sure you want to resign the game?')) {
      if (!this.isAiGame) this.network.resign();
      const oppColor = this.playerColor === 'white' ? 'black' : 'white';
      this.showGameEndModal('resignation', oppColor, `${this.user.name || 'Player'} resigned`);
    }
  }

  handleRematchClick() {
    this.closeModal(this.modalGameEnd);
    if (this.isAiGame) {
      const swappedColor = this.playerColor === 'white' ? 'black' : 'white';
      this.startAiGame(this.aiDifficulty, '5+0', swappedColor);
      return;
    }
    this.network.offerRematch();
    this.showToast('Rematch challenge sent to opponent...');
  }

  showRematchPrompt() {
    this.showToast('Opponent challenged you to a REMATCH!', true, () => {
      this.network.acceptRematch(this.gameId);
    }, () => {
      this.showToast('Rematch declined.');
    });
  }

  flipBoard() {
    this.flipped = !this.flipped;
    this.renderBoard();
  }

  // ==========================================
  // REAL-TIME GAME CHAT
  // ==========================================
  handleChatSend() {
    const text = this.chatInput.value.trim();
    if (!text) return;
    const sender = this.user.name || 'Player';
    this.network.sendChat(sender, text);
    this.chatInput.value = '';

    if (this.isAiGame) {
      setTimeout(() => {
        const botReplies = [
          'Good move! Let us see how this position develops.',
          'Thanks for the message! Best of luck.',
          'Analyzing 15,000 positions per second...',
          'Interesting tactical idea!'
        ];
        const reply = botReplies[Math.floor(Math.random() * botReplies.length)];
        this.appendChatMessage({
          sender: this.topPlayerName.textContent,
          text: reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        });
      }, 900);
    }
  }

  appendChatMessage(msg) {
    const isMine = (msg.sender === (this.user.name || 'Player'));
    const bubble = document.createElement('div');
    bubble.className = `chat-bubble ${isMine ? 'mine' : 'theirs'}`;
    bubble.innerHTML = `
      <div class="chat-meta">
        <strong>${msg.sender}</strong>
        <span>${msg.timestamp || ''}</span>
      </div>
      <div class="chat-text">${msg.text}</div>
    `;
    this.chatMessagesScroll.appendChild(bubble);
    this.chatMessagesScroll.scrollTop = this.chatMessagesScroll.scrollHeight;

    if (!isMine) {
      this.sounds.playChat();
      if (!document.getElementById('tabContentChat').classList.contains('active')) {
        this.unreadCount++;
        this.chatUnreadCount.style.display = 'inline-block';
        this.chatUnreadCount.textContent = this.unreadCount;
      }
    }
  }

  switchPanelTab(tab) {
    const isMoves = (tab === 'moves');
    document.getElementById('tabBtnMoves').classList.toggle('active', isMoves);
    document.getElementById('tabBtnChat').classList.toggle('active', !isMoves);
    document.getElementById('tabContentMoves').classList.toggle('active', isMoves);
    document.getElementById('tabContentChat').classList.toggle('active', !isMoves);

    if (!isMoves) {
      this.unreadCount = 0;
      this.chatUnreadCount.style.display = 'none';
    }
  }

  toggleMobilePanel(tab) {
    this.switchPanelTab(tab);
    document.getElementById('sidePanel').classList.add('mobile-open');
  }

  showToast(message, isPrompt = false, onAccept = null, onDecline = null) {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = 'game-toast';

    let html = `<span>${message}</span>`;
    if (isPrompt) {
      html += `
        <div class="toast-actions">
          <button class="btn-join-sm" style="background:#10b981;" id="toastAccept">Accept</button>
          <button class="btn-join-sm" style="background:#ef4444;" id="toastDecline">Decline</button>
        </div>
      `;
    }
    toast.innerHTML = html;

    if (isPrompt) {
      toast.querySelector('#toastAccept').addEventListener('click', () => {
        if (onAccept) onAccept();
        toast.remove();
      });
      toast.querySelector('#toastDecline').addEventListener('click', () => {
        if (onDecline) onDecline();
        toast.remove();
      });
    } else {
      setTimeout(() => toast.remove(), 4000);
    }

    container.appendChild(toast);
  }
}

// Initialize
window.addEventListener('DOMContentLoaded', () => {
  window.app = new ChessApp();
});
