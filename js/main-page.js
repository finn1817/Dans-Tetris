import { SETTINGS, createEmptyBoard } from './page-settings.js';
import { TetrominoGenerator, cloneShape, rotateClockwise } from './blocks.js';
import { GameScreen } from './game-screen.js';
import { NextPiecePreview } from './next-piece.js';
import { GameStats } from './game-stats.js';
import { ScoreHistory } from './previous-scores.js';
import { setupKeyboardControls, setupButtonControls, updatePauseButtonVisuals } from './controls-&-motion.js';
import { renderInstructions } from './how-to-play-panel.js';
import { initializeThemeToggle } from './page-styles.js';

document.addEventListener('DOMContentLoaded', () => {
	const dom = queryDom();

	renderInstructions(dom.instructionsList);
	initializeThemeToggle(dom.themeToggle);

	const generator = new TetrominoGenerator(SETTINGS.cols);
	const gameScreen = new GameScreen(dom.playfieldCanvas, generator.getColors());
	const nextPreview = new NextPiecePreview(dom.nextPieceCanvas, generator.getColors());
	const stats = new GameStats({
		score: dom.score,
		level: dom.level,
		totalLines: dom.totalLines,
		totalPieces: dom.totalPieces,
		highScore: dom.highScore,
		highLevel: dom.highLevel
	});
	const scoreHistory = new ScoreHistory(dom.scoresList);

	const game = new TetrisGame({
		generator,
		screen: gameScreen,
		preview: nextPreview,
		stats,
		history: scoreHistory,
		elements: {
			startButton: dom.startButton,
			pauseButton: dom.pauseButton,
			modal: dom.gameOverModal,
			finalScore: dom.finalScore
		}
	});

	setupButtonControls({
		startButton: dom.startButton,
		pauseButton: dom.pauseButton,
		restartButton: dom.restartButton
	}, {
		onStart: () => game.startNewGame(),
		onTogglePause: () => game.togglePause(),
		onRestart: () => game.restartFromModal()
	});

	setupKeyboardControls({
		onMoveLeft: () => game.moveHorizontal(-1),
		onMoveRight: () => game.moveHorizontal(1),
		onSoftDrop: () => game.softDropManual(),
		onRotate: () => game.rotateActivePiece(),
		onHardDrop: () => game.hardDrop(),
		onTogglePause: () => game.togglePause(),
		onRestart: () => game.quickRestart()
	});

	document.addEventListener('themechange', () => {
		generator.refreshColors();
		const colors = generator.getColors();
		gameScreen.setColors(colors);
		nextPreview.setColors(colors);
		gameScreen.refreshThemeStyles();
		nextPreview.refreshThemeStyles();
		game.renderFrame();
	});

	game.renderFrame();
});

class TetrisGame {
	constructor({ generator, screen, preview, stats, history, elements }) {
		this.generator = generator;
		this.screen = screen;
		this.preview = preview;
		this.stats = stats;
		this.history = history;

		this.startButton = elements.startButton;
		this.pauseButton = elements.pauseButton;
		this.modal = elements.modal;
		this.finalScoreElement = elements.finalScore;

		this.board = createEmptyBoard();
		this.activePiece = null;
		this.nextPiece = null;
		this.dropCounter = 0;
		this.lastTimestamp = 0;
		this.animationFrameId = null;
		this.active = false;
		this.paused = false;

		this.gameLoop = this.gameLoop.bind(this);
	}

	startNewGame() {
		if (this.animationFrameId) {
			cancelAnimationFrame(this.animationFrameId);
		}

		this.board = createEmptyBoard();
		this.stats.resetForNewGame();
		this.activePiece = this.generator.next();
		this.nextPiece = this.generator.next();
		this.dropCounter = 0;
		this.lastTimestamp = performance.now();
		this.active = true;
		this.paused = false;

		this.hideModal();
		this.updateButtonStates();
		this.preview.render(this.nextPiece);
		this.renderFrame();

		this.animationFrameId = requestAnimationFrame(this.gameLoop);
	}

	quickRestart() {
		if (this.modal.classList.contains('active')) {
			this.restartFromModal();
			return;
		}

		if (this.active) {
			this.startNewGame();
		}
	}

	restartFromModal() {
		this.hideModal();
		this.startNewGame();
	}

	togglePause() {
		if (!this.active) {
			return;
		}

		this.paused = !this.paused;
		updatePauseButtonVisuals(this.pauseButton, this.paused);

		if (!this.paused) {
			this.lastTimestamp = performance.now();
		}
	}

	moveHorizontal(direction) {
		if (!this.isInteractionAllowed()) {
			return;
		}
		if (this.tryMove(direction, 0)) {
			this.renderFrame();
		}
	}

	softDropManual() {
		if (!this.isInteractionAllowed()) {
			return;
		}
		this.softDrop(true);
		this.renderFrame();
	}

	hardDrop() {
		if (!this.isInteractionAllowed()) {
			return;
		}

		let distance = 0;
		while (this.isValidMove(this.activePiece, 0, distance + 1)) {
			distance += 1;
		}

		if (distance > 0) {
			this.activePiece.pos.y += distance;
			this.stats.addHardDropBonus(distance);
		}

		this.lockPiece();
		this.renderFrame();
	}

	rotateActivePiece() {
		if (!this.isInteractionAllowed()) {
			return;
		}
		if (!this.activePiece) {
			return;
		}

		const originalShape = cloneShape(this.activePiece.shape);
		const originalPosition = { ...this.activePiece.pos };

		this.activePiece.shape = rotateClockwise(this.activePiece.shape);

		const kicks = [
			{ x: 0, y: 0 },
			{ x: 1, y: 0 },
			{ x: -1, y: 0 },
			{ x: 2, y: 0 },
			{ x: -2, y: 0 },
			{ x: 0, y: -1 }
		];

		for (const kick of kicks) {
			if (this.isValidMove(this.activePiece, kick.x, kick.y)) {
				this.activePiece.pos.x += kick.x;
				this.activePiece.pos.y += kick.y;
				this.renderFrame();
				return;
			}
		}

		this.activePiece.shape = originalShape;
		this.activePiece.pos = originalPosition;
	}

	gameLoop(timestamp) {
		if (!this.active) {
			return;
		}

		const delta = timestamp - this.lastTimestamp;
		this.lastTimestamp = timestamp;

		if (!this.paused) {
			this.dropCounter += delta;
			if (this.dropCounter >= this.stats.getDropInterval()) {
				this.softDrop(false);
				this.dropCounter = 0;
			}
		}

		this.renderFrame();
		this.animationFrameId = requestAnimationFrame(this.gameLoop);
	}

	softDrop(manual) {
		if (this.tryMove(0, 1)) {
			if (manual) {
				this.stats.addScore(1);
			}
			return true;
		}

		this.lockPiece();
		return false;
	}

	tryMove(offsetX, offsetY) {
		if (!this.activePiece) {
			return false;
		}
		if (!this.isValidMove(this.activePiece, offsetX, offsetY)) {
			return false;
		}

		this.activePiece.pos.x += offsetX;
		this.activePiece.pos.y += offsetY;
		return true;
	}

	isValidMove(piece, offsetX = 0, offsetY = 0) {
		return piece.shape.every((row, y) => {
			return row.every((value, x) => {
				if (!value) {
					return true;
				}

				const newX = x + piece.pos.x + offsetX;
				const newY = y + piece.pos.y + offsetY;

				if (newX < 0 || newX >= SETTINGS.cols) {
					return false;
				}

				if (newY >= SETTINGS.rows) {
					return false;
				}

				if (newY < 0) {
					return true;
				}

				return this.board[newY][newX] === null;
			});
		});
	}

	lockPiece() {
		if (!this.activePiece) {
			return;
		}

		this.mergePieceIntoBoard(this.activePiece);
		this.stats.recordPiecePlaced();

		const cleared = this.clearCompletedLines();
		if (cleared > 0) {
			this.stats.recordLinesCleared(cleared);
		}

		this.dropCounter = 0;
		this.spawnNextPiece();
	}

	mergePieceIntoBoard(piece) {
		piece.shape.forEach((row, y) => {
			row.forEach((value, x) => {
				if (!value) {
					return;
				}

				const boardX = x + piece.pos.x;
				const boardY = y + piece.pos.y;

				if (boardY < 0) {
					return;
				}

				if (this.board[boardY] && this.board[boardY][boardX] == null) {
					this.board[boardY][boardX] = piece.type;
				}
			});
		});
	}

	clearCompletedLines() {
		let cleared = 0;

		for (let y = SETTINGS.rows - 1; y >= 0; y--) {
			if (this.board[y].every(value => value !== null)) {
				this.board.splice(y, 1);
				this.board.unshift(Array(SETTINGS.cols).fill(null));
				cleared += 1;
				y += 1;
			}
		}

		return cleared;
	}

	spawnNextPiece() {
		this.activePiece = this.nextPiece;
		this.nextPiece = this.generator.next();
		this.preview.render(this.nextPiece);

		if (!this.activePiece) {
			return;
		}

		this.activePiece.pos = {
			x: Math.floor((SETTINGS.cols - this.activePiece.shape[0].length) / 2),
			y: 0
		};

		if (!this.isValidMove(this.activePiece, 0, 0)) {
			this.triggerGameOver();
		}
	}

	triggerGameOver() {
		this.active = false;
		if (this.animationFrameId) {
			cancelAnimationFrame(this.animationFrameId);
			this.animationFrameId = null;
		}

		const finalScore = this.stats.getScore();
		this.history.add(finalScore);
		this.finalScoreElement.textContent = finalScore;
		this.modal.classList.add('active');

		this.updateButtonStates(true);
	}

	hideModal() {
		this.modal.classList.remove('active');
	}

	renderFrame() {
		const ghost = this.calculateGhostPiece();
		this.screen.render(this.board, this.activePiece, ghost);
		this.preview.render(this.nextPiece);
	}

	calculateGhostPiece() {
		if (!this.activePiece) {
			return null;
		}

		const ghost = {
			type: this.activePiece.type,
			shape: cloneShape(this.activePiece.shape),
			pos: { ...this.activePiece.pos }
		};

		while (this.isValidMove(ghost, 0, 1)) {
			ghost.pos.y += 1;
		}

		return ghost;
	}

	updateButtonStates(gameOver = false) {
		if (this.startButton) {
			this.startButton.disabled = !gameOver && this.active;
			this.startButton.innerHTML = this.active ? '<i class="fas fa-arrow-rotate-right"></i> Restart' : '<i class="fas fa-play"></i> Start Game';
		}

		if (this.pauseButton) {
			this.pauseButton.disabled = !this.active;
			updatePauseButtonVisuals(this.pauseButton, this.paused);
		}
	}

	isInteractionAllowed() {
		return this.active && !this.paused && this.activePiece;
	}
}

function queryDom() {
	return {
		playfieldCanvas: document.getElementById('tetris'),
		nextPieceCanvas: document.getElementById('next-piece'),
		startButton: document.getElementById('start-button'),
		pauseButton: document.getElementById('pause-button'),
		restartButton: document.getElementById('restart-button'),
		score: document.getElementById('score'),
		level: document.getElementById('level'),
		totalLines: document.getElementById('total-lines'),
		totalPieces: document.getElementById('total-tetrominoes'),
		highScore: document.getElementById('highest-score'),
		highLevel: document.getElementById('highest-level'),
		scoresList: document.getElementById('scores-list'),
		themeToggle: document.getElementById('theme-toggle'),
		instructionsList: document.getElementById('instructions-list'),
		gameOverModal: document.getElementById('game-over-modal'),
		finalScore: document.getElementById('final-score')
	};
}
