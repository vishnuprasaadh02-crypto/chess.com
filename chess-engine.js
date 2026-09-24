/**
 * Checkmate Nexus - Chess Engine & AI Bot Module
 * High-performance Chess Rule Engine, FEN/SAN generator, and Minimax AI (Easy, Medium, Hard)
 */

class ChessEngine {
  constructor(fen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1') {
    this.reset(fen);
  }

  reset(fen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1') {
    this.board = Array(8).fill(null).map(() => Array(8).fill(null));
    this.turn = 'w';
    this.castling = { K: true, Q: true, k: true, q: true };
    this.enPassant = null; // e.g. [row, col]
    this.halfMoves = 0;
    this.fullMoves = 1;
    this.history = [];
    this.loadFen(fen);
  }

  loadFen(fen) {
    const parts = fen.trim().split(/\s+/);
    const rows = parts[0].split('/');
    
    this.board = Array(8).fill(null).map(() => Array(8).fill(null));
    
    for (let r = 0; r < 8; r++) {
      let c = 0;
      for (const ch of rows[r]) {
        if (/\d/.test(ch)) {
          c += parseInt(ch, 10);
        } else {
          const color = ch === ch.toUpperCase() ? 'w' : 'b';
          const type = ch.toLowerCase();
          this.board[r][c] = { type, color };
          c++;
        }
      }
    }

    this.turn = parts[1] || 'w';
    const castlingStr = parts[2] || '-';
    this.castling = {
      K: castlingStr.includes('K'),
      Q: castlingStr.includes('Q'),
      k: castlingStr.includes('k'),
      q: castlingStr.includes('q')
    };

    if (parts[3] && parts[3] !== '-') {
      this.enPassant = this.algebraicToCoords(parts[3]);
    } else {
      this.enPassant = null;
    }

    this.halfMoves = parseInt(parts[4] || '0', 10);
    this.fullMoves = parseInt(parts[5] || '1', 10);
  }

  getFen() {
    let fen = '';
    for (let r = 0; r < 8; r++) {
      let empty = 0;
      for (let c = 0; c < 8; c++) {
        const piece = this.board[r][c];
        if (!piece) {
          empty++;
        } else {
          if (empty > 0) {
            fen += empty;
            empty = 0;
          }
          fen += piece.color === 'w' ? piece.type.toUpperCase() : piece.type.toLowerCase();
        }
      }
      if (empty > 0) fen += empty;
      if (r < 7) fen += '/';
    }

    let castling = '';
    if (this.castling.K) castling += 'K';
    if (this.castling.Q) castling += 'Q';
    if (this.castling.k) castling += 'k';
    if (this.castling.q) castling += 'q';
    if (!castling) castling = '-';

    const ep = this.enPassant ? this.coordsToAlgebraic(this.enPassant[0], this.enPassant[1]) : '-';

    return `${fen} ${this.turn} ${castling} ${ep} ${this.halfMoves} ${this.fullMoves}`;
  }

  coordsToAlgebraic(r, c) {
    const file = String.fromCharCode('a'.charCodeAt(0) + c);
    const rank = 8 - r;
    return `${file}${rank}`;
  }

  algebraicToCoords(sq) {
    if (!sq || sq.length < 2) return null;
    const col = sq.charCodeAt(0) - 'a'.charCodeAt(0);
    const row = 8 - parseInt(sq[1], 10);
    if (row >= 0 && row < 8 && col >= 0 && col < 8) {
      return [row, col];
    }
    return null;
  }

  getPiece(r, c) {
    if (r < 0 || r > 7 || c < 0 || c > 7) return null;
    return this.board[r][c];
  }

  isOccupied(r, c) {
    return this.getPiece(r, c) !== null;
  }

  getLegalMoves(r, c) {
    const piece = this.getPiece(r, c);
    if (!piece || piece.color !== this.turn) return [];

    const pseudoMoves = this.getPseudoMoves(r, c);
    const legalMoves = [];

    for (const move of pseudoMoves) {
      if (!this.moveLeavesKingInCheck(move)) {
        legalMoves.push(move);
      }
    }

    return legalMoves;
  }

  getAllLegalMoves(color = this.turn) {
    const moves = [];
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const piece = this.board[r][c];
        if (piece && piece.color === color) {
          const pieceMoves = this.getLegalMoves(r, c);
          moves.push(...pieceMoves);
        }
      }
    }
    return moves;
  }

  getPseudoMoves(r, c) {
    const piece = this.board[r][c];
    if (!piece) return [];

    const moves = [];
    const color = piece.color;
    const enemy = color === 'w' ? 'b' : 'w';

    switch (piece.type) {
      case 'p': {
        const dir = color === 'w' ? -1 : 1;
        const startRow = color === 'w' ? 6 : 1;

        // 1 step forward
        if (!this.isOccupied(r + dir, c)) {
          moves.push({ from: [r, c], to: [r + dir, c], piece });
          // 2 steps forward
          if (r === startRow && !this.isOccupied(r + 2 * dir, c)) {
            moves.push({ from: [r, c], to: [r + 2 * dir, c], piece, isDoublePawn: true });
          }
        }

        // Diagonal captures
        for (const dc of [-1, 1]) {
          const tr = r + dir;
          const tc = c + dc;
          if (tc >= 0 && tc < 8 && tr >= 0 && tr < 8) {
            const target = this.getPiece(tr, tc);
            if (target && target.color === enemy) {
              moves.push({ from: [r, c], to: [tr, tc], piece, captured: target });
            } else if (this.enPassant && this.enPassant[0] === tr && this.enPassant[1] === tc) {
              moves.push({
                from: [r, c],
                to: [tr, tc],
                piece,
                isEnPassant: true,
                captured: { type: 'p', color: enemy }
              });
            }
          }
        }
        break;
      }

      case 'n': {
        const knightDeltas = [
          [-2, -1], [-2, 1], [-1, -2], [-1, 2],
          [1, -2], [1, 2], [2, -1], [2, 1]
        ];
        for (const [dr, dc] of knightDeltas) {
          const tr = r + dr;
          const tc = c + dc;
          if (tr >= 0 && tr < 8 && tc >= 0 && tc < 8) {
            const target = this.getPiece(tr, tc);
            if (!target || target.color === enemy) {
              moves.push({ from: [r, c], to: [tr, tc], piece, captured: target });
            }
          }
        }
        break;
      }

      case 'b':
        this.addRayMoves(moves, r, c, [[-1, -1], [-1, 1], [1, -1], [1, 1]], piece, enemy);
        break;

      case 'r':
        this.addRayMoves(moves, r, c, [[-1, 0], [1, 0], [0, -1], [0, 1]], piece, enemy);
        break;

      case 'q':
        this.addRayMoves(moves, r, c, [
          [-1, -1], [-1, 1], [1, -1], [1, 1],
          [-1, 0], [1, 0], [0, -1], [0, 1]
        ], piece, enemy);
        break;

      case 'k': {
        const kingDeltas = [
          [-1, -1], [-1, 0], [-1, 1],
          [0, -1],           [0, 1],
          [1, -1],  [1, 0],  [1, 1]
        ];
        for (const [dr, dc] of kingDeltas) {
          const tr = r + dr;
          const tc = c + dc;
          if (tr >= 0 && tr < 8 && tc >= 0 && tc < 8) {
            const target = this.getPiece(tr, tc);
            if (!target || target.color === enemy) {
              moves.push({ from: [r, c], to: [tr, tc], piece, captured: target });
            }
          }
        }

        // Castling
        if (color === 'w' && r === 7 && c === 4) {
          if (this.castling.K && !this.isOccupied(7, 5) && !this.isOccupied(7, 6)) {
            if (!this.isSquareAttacked(7, 4, 'b') && !this.isSquareAttacked(7, 5, 'b') && !this.isSquareAttacked(7, 6, 'b')) {
              moves.push({ from: [7, 4], to: [7, 6], piece, isCastle: 'K' });
            }
          }
          if (this.castling.Q && !this.isOccupied(7, 3) && !this.isOccupied(7, 2) && !this.isOccupied(7, 1)) {
            if (!this.isSquareAttacked(7, 4, 'b') && !this.isSquareAttacked(7, 3, 'b') && !this.isSquareAttacked(7, 2, 'b')) {
              moves.push({ from: [7, 4], to: [7, 2], piece, isCastle: 'Q' });
            }
          }
        } else if (color === 'b' && r === 0 && c === 4) {
          if (this.castling.k && !this.isOccupied(0, 5) && !this.isOccupied(0, 6)) {
            if (!this.isSquareAttacked(0, 4, 'w') && !this.isSquareAttacked(0, 5, 'w') && !this.isSquareAttacked(0, 6, 'w')) {
              moves.push({ from: [0, 4], to: [0, 6], piece, isCastle: 'k' });
            }
          }
          if (this.castling.q && !this.isOccupied(0, 3) && !this.isOccupied(0, 2) && !this.isOccupied(0, 1)) {
            if (!this.isSquareAttacked(0, 4, 'w') && !this.isSquareAttacked(0, 3, 'w') && !this.isSquareAttacked(0, 2, 'w')) {
              moves.push({ from: [0, 4], to: [0, 2], piece, isCastle: 'q' });
            }
          }
        }
        break;
      }
    }

    return moves;
  }

  addRayMoves(moves, r, c, directions, piece, enemy) {
    for (const [dr, dc] of directions) {
      let tr = r + dr;
      let tc = c + dc;
      while (tr >= 0 && tr < 8 && tc >= 0 && tc < 8) {
        const target = this.getPiece(tr, tc);
        if (!target) {
          moves.push({ from: [r, c], to: [tr, tc], piece });
        } else {
          if (target.color === enemy) {
            moves.push({ from: [r, c], to: [tr, tc], piece, captured: target });
          }
          break;
        }
        tr += dr;
        tc += dc;
      }
    }
  }

  isSquareAttacked(r, c, attackerColor) {
    const pawnDir = attackerColor === 'w' ? 1 : -1;
    for (const dc of [-1, 1]) {
      const pr = r + pawnDir;
      const pc = c + dc;
      if (pr >= 0 && pr < 8 && pc >= 0 && pc < 8) {
        const piece = this.getPiece(pr, pc);
        if (piece && piece.color === attackerColor && piece.type === 'p') return true;
      }
    }

    const knightDeltas = [
      [-2, -1], [-2, 1], [-1, -2], [-1, 2],
      [1, -2], [1, 2], [2, -1], [2, 1]
    ];
    for (const [dr, dc] of knightDeltas) {
      const tr = r + dr;
      const tc = c + dc;
      if (tr >= 0 && tr < 8 && tc >= 0 && tc < 8) {
        const piece = this.getPiece(tr, tc);
        if (piece && piece.color === attackerColor && piece.type === 'n') return true;
      }
    }

    const straightDirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];
    for (const [dr, dc] of straightDirs) {
      let tr = r + dr;
      let tc = c + dc;
      while (tr >= 0 && tr < 8 && tc >= 0 && tc < 8) {
        const piece = this.getPiece(tr, tc);
        if (piece) {
          if (piece.color === attackerColor && (piece.type === 'r' || piece.type === 'q')) return true;
          break;
        }
        tr += dr;
        tc += dc;
      }
    }

    const diagDirs = [[-1, -1], [-1, 1], [1, -1], [1, 1]];
    for (const [dr, dc] of diagDirs) {
      let tr = r + dr;
      let tc = c + dc;
      while (tr >= 0 && tr < 8 && tc >= 0 && tc < 8) {
        const piece = this.getPiece(tr, tc);
        if (piece) {
          if (piece.color === attackerColor && (piece.type === 'b' || piece.type === 'q')) return true;
          break;
        }
        tr += dr;
        tc += dc;
      }
    }

    const kingDeltas = [
      [-1, -1], [-1, 0], [-1, 1],
      [0, -1],           [0, 1],
      [1, -1],  [1, 0],  [1, 1]
    ];
    for (const [dr, dc] of kingDeltas) {
      const tr = r + dr;
      const tc = c + dc;
      if (tr >= 0 && tr < 8 && tc >= 0 && tc < 8) {
        const piece = this.getPiece(tr, tc);
        if (piece && piece.color === attackerColor && piece.type === 'k') return true;
      }
    }

    return false;
  }

  findKing(color) {
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const piece = this.board[r][c];
        if (piece && piece.color === color && piece.type === 'k') {
          return [r, c];
        }
      }
    }
    return null;
  }

  inCheck(color = this.turn) {
    const kingPos = this.findKing(color);
    if (!kingPos) return false;
    const enemyColor = color === 'w' ? 'b' : 'w';
    return this.isSquareAttacked(kingPos[0], kingPos[1], enemyColor);
  }

  moveLeavesKingInCheck(move) {
    const [fr, fc] = move.from;
    const [tr, tc] = move.to;
    const origFrom = this.board[fr][fc];
    const origTo = this.board[tr][tc];
    const isEnPassant = move.isEnPassant;
    let epPawn = null;

    this.board[tr][tc] = origFrom;
    this.board[fr][fc] = null;

    if (isEnPassant) {
      const epRow = origFrom.color === 'w' ? tr + 1 : tr - 1;
      epPawn = this.board[epRow][tc];
      this.board[epRow][tc] = null;
    }

    const check = this.inCheck(origFrom.color);

    this.board[fr][fc] = origFrom;
    this.board[tr][tc] = origTo;
    if (isEnPassant) {
      const epRow = origFrom.color === 'w' ? tr + 1 : tr - 1;
      this.board[epRow][tc] = epPawn;
    }

    return check;
  }

  makeMove(moveObj) {
    let from = moveObj.from;
    let to = moveObj.to;
    if (typeof from === 'string') from = this.algebraicToCoords(from);
    if (typeof to === 'string') to = this.algebraicToCoords(to);

    const [fr, fc] = from;
    const [tr, tc] = to;
    const piece = this.board[fr][fc];
    if (!piece) return false;

    const legalMoves = this.getLegalMoves(fr, fc);
    const validMove = legalMoves.find(m => m.to[0] === tr && m.to[1] === tc);
    if (!validMove) return false;

    const san = this.generateSan(validMove, moveObj.promotion);
    const captured = validMove.captured || null;

    let finalPiece = { ...piece };
    if (piece.type === 'p' && (tr === 0 || tr === 7)) {
      finalPiece.type = (moveObj.promotion || 'q').toLowerCase();
    }

    this.board[tr][tc] = finalPiece;
    this.board[fr][fc] = null;

    if (validMove.isEnPassant) {
      const epRow = piece.color === 'w' ? tr + 1 : tr - 1;
      this.board[epRow][tc] = null;
    }

    if (validMove.isCastle) {
      if (validMove.isCastle === 'K') {
        this.board[7][5] = this.board[7][7];
        this.board[7][7] = null;
      } else if (validMove.isCastle === 'Q') {
        this.board[7][3] = this.board[7][0];
        this.board[7][0] = null;
      } else if (validMove.isCastle === 'k') {
        this.board[0][5] = this.board[0][7];
        this.board[0][7] = null;
      } else if (validMove.isCastle === 'q') {
        this.board[0][3] = this.board[0][0];
        this.board[0][0] = null;
      }
    }

    if (piece.type === 'k') {
      if (piece.color === 'w') {
        this.castling.K = false;
        this.castling.Q = false;
      } else {
        this.castling.k = false;
        this.castling.q = false;
      }
    }
    if (piece.type === 'r') {
      if (fr === 7 && fc === 0) this.castling.Q = false;
      if (fr === 7 && fc === 7) this.castling.K = false;
      if (fr === 0 && fc === 0) this.castling.q = false;
      if (fr === 0 && fc === 7) this.castling.k = false;
    }

    if (piece.type === 'p' && Math.abs(tr - fr) === 2) {
      this.enPassant = [(fr + tr) / 2, fc];
    } else {
      this.enPassant = null;
    }

    this.turn = this.turn === 'w' ? 'b' : 'w';
    if (this.turn === 'w') this.fullMoves++;

    const historyEntry = {
      from: this.coordsToAlgebraic(fr, fc),
      to: this.coordsToAlgebraic(tr, tc),
      san,
      piece: piece.type,
      color: piece.color,
      captured: captured ? captured.type : null,
      fen: this.getFen()
    };
    this.history.push(historyEntry);

    return historyEntry;
  }

  generateSan(move, promotion = 'q') {
    const [fr, fc] = move.from;
    const [tr, tc] = move.to;
    const piece = move.piece;
    const isCapture = !!move.captured || !!move.isEnPassant;
    const targetSq = this.coordsToAlgebraic(tr, tc);

    if (move.isCastle) {
      return move.isCastle.toUpperCase() === 'K' ? 'O-O' : 'O-O-O';
    }

    let san = '';
    if (piece.type === 'p') {
      if (isCapture) {
        san += String.fromCharCode('a'.charCodeAt(0) + fc) + 'x' + targetSq;
      } else {
        san += targetSq;
      }
      if (tr === 0 || tr === 7) {
        san += '=' + (promotion || 'Q').toUpperCase();
      }
    } else {
      san += piece.type.toUpperCase();
      if (isCapture) san += 'x';
      san += targetSq;
    }

    return san;
  }

  isCheckmate() {
    return this.inCheck(this.turn) && this.getAllLegalMoves(this.turn).length === 0;
  }

  isStalemate() {
    return !this.inCheck(this.turn) && this.getAllLegalMoves(this.turn).length === 0;
  }

  isDraw() {
    return this.isStalemate() || this.isInsufficientMaterial();
  }

  isInsufficientMaterial() {
    const pieces = [];
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const p = this.board[r][c];
        if (p) pieces.push(p);
      }
    }
    if (pieces.length === 2) return true;
    if (pieces.length === 3) {
      if (pieces.some(p => p.type === 'b' || p.type === 'n')) return true;
    }
    return false;
  }

  getCapturedPieces() {
    const initialCounts = {
      w: { p: 8, r: 2, n: 2, b: 2, q: 1, k: 1 },
      b: { p: 8, r: 2, n: 2, b: 2, q: 1, k: 1 }
    };

    const currentCounts = {
      w: { p: 0, r: 0, n: 0, b: 0, q: 0, k: 0 },
      b: { p: 0, r: 0, n: 0, b: 0, q: 0, k: 0 }
    };

    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const p = this.board[r][c];
        if (p) {
          currentCounts[p.color][p.type]++;
        }
      }
    }

    const capturedByWhite = [];
    const capturedByBlack = [];

    const pieceValues = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 0 };
    let whiteMaterial = 0;
    let blackMaterial = 0;

    for (const [type, count] of Object.entries(initialCounts.b)) {
      const diff = count - currentCounts.b[type];
      for (let i = 0; i < diff; i++) {
        capturedByWhite.push({ type, color: 'b', value: pieceValues[type] });
      }
    }

    for (const [type, count] of Object.entries(initialCounts.w)) {
      const diff = count - currentCounts.w[type];
      for (let i = 0; i < diff; i++) {
        capturedByBlack.push({ type, color: 'w', value: pieceValues[type] });
      }
    }

    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const p = this.board[r][c];
        if (p) {
          if (p.color === 'w') whiteMaterial += pieceValues[p.type];
          else blackMaterial += pieceValues[p.type];
        }
      }
    }

    return {
      capturedByWhite,
      capturedByBlack,
      whiteAdvantage: whiteMaterial - blackMaterial,
      blackAdvantage: blackMaterial - whiteMaterial
    };
  }

  // =========================================================================
  // AI BOT ENGINE (Easy: Random/Captures, Medium: 2-ply evaluation, Hard: Minimax)
  // =========================================================================
  getBestAIMove(difficulty = 'medium') {
    const allMoves = this.getAllLegalMoves(this.turn);
    if (allMoves.length === 0) return null;

    if (difficulty === 'easy') {
      // 70% random, 30% capture if available
      const captures = allMoves.filter(m => m.captured);
      if (captures.length > 0 && Math.random() < 0.3) {
        return captures[Math.floor(Math.random() * captures.length)];
      }
      return allMoves[Math.floor(Math.random() * allMoves.length)];
    }

    if (difficulty === 'medium') {
      // 1-2 ply shallow eval with positional preference
      let bestScore = -Infinity;
      let bestMove = allMoves[0];
      const isAIWhite = (this.turn === 'w');

      // Shuffle moves for variety
      const shuffled = [...allMoves].sort(() => Math.random() - 0.5);

      for (const move of shuffled) {
        // Clone board state
        const savedFen = this.getFen();
        this.makeMove(move);

        let score = this.evaluateBoard();
        if (!isAIWhite) score = -score;

        // Revert
        this.loadFen(savedFen);

        if (score > bestScore) {
          bestScore = score;
          bestMove = move;
        }
      }
      return bestMove;
    }

    // Hard Mode: Minimax Depth 3 with Alpha-Beta Pruning
    const depth = 3;
    const isMaximizing = (this.turn === 'w');
    let bestMove = allMoves[0];
    let bestValue = isMaximizing ? -Infinity : Infinity;

    const orderedMoves = this.orderMoves(allMoves);

    for (const move of orderedMoves) {
      const savedFen = this.getFen();
      this.makeMove(move);

      const val = this.minimax(depth - 1, -Infinity, Infinity, !isMaximizing);
      this.loadFen(savedFen);

      if (isMaximizing) {
        if (val > bestValue) {
          bestValue = val;
          bestMove = move;
        }
      } else {
        if (val < bestValue) {
          bestValue = val;
          bestMove = move;
        }
      }
    }
    return bestMove;
  }

  minimax(depth, alpha, beta, isMaximizing) {
    if (depth === 0 || this.isCheckmate() || this.isDraw()) {
      return this.evaluateBoard();
    }

    const legalMoves = this.getAllLegalMoves(this.turn);
    if (legalMoves.length === 0) {
      if (this.inCheck()) return isMaximizing ? -99999 : 99999;
      return 0; // Stalemate
    }

    if (isMaximizing) {
      let maxEval = -Infinity;
      for (const move of legalMoves) {
        const savedFen = this.getFen();
        this.makeMove(move);
        const evalVal = this.minimax(depth - 1, alpha, beta, false);
        this.loadFen(savedFen);
        maxEval = Math.max(maxEval, evalVal);
        alpha = Math.max(alpha, evalVal);
        if (beta <= alpha) break;
      }
      return maxEval;
    } else {
      let minEval = Infinity;
      for (const move of legalMoves) {
        const savedFen = this.getFen();
        this.makeMove(move);
        const evalVal = this.minimax(depth - 1, alpha, beta, true);
        this.loadFen(savedFen);
        minEval = Math.min(minEval, evalVal);
        beta = Math.min(beta, evalVal);
        if (beta <= alpha) break;
      }
      return minEval;
    }
  }

  orderMoves(moves) {
    return moves.sort((a, b) => {
      let scoreA = 0;
      let scoreB = 0;
      if (a.captured) scoreA += 10;
      if (b.captured) scoreB += 10;
      return scoreB - scoreA;
    });
  }

  evaluateBoard() {
    if (this.isCheckmate()) {
      return this.turn === 'w' ? -99999 : 99999;
    }
    if (this.isDraw()) return 0;

    const pieceValues = { p: 100, n: 320, b: 330, r: 500, q: 900, k: 20000 };
    let score = 0;

    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const piece = this.board[r][c];
        if (!piece) continue;

        let val = pieceValues[piece.type] || 0;
        
        // Positional bonus: Center control
        if ((r === 3 || r === 4) && (c === 3 || c === 4)) {
          val += 25;
        } else if ((r >= 2 && r <= 5) && (c >= 2 && c <= 5)) {
          val += 10;
        }

        // Advance pawns
        if (piece.type === 'p') {
          val += (piece.color === 'w' ? (6 - r) * 8 : (r - 1) * 8);
        }

        if (piece.color === 'w') score += val;
        else score -= val;
      }
    }
    return score;
  }
}

if (typeof window !== 'undefined') {
  window.ChessEngine = ChessEngine;
}
