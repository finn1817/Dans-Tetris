// Canvas rendering for the main Tetris playfield.

import { SETTINGS } from './page-settings.js';

export class GameScreen {
	constructor(canvas, colors = {}) {
		this.canvas = canvas;
		this.context = canvas.getContext('2d');
		this.colors = colors;
		this.cachedStyles = null;

		this.#configureContext();
		this.refreshThemeStyles();
	}

	setColors(colors) {
		this.colors = colors;
	}

	refreshThemeStyles() {
		const rootStyles = getComputedStyle(document.documentElement);
		this.cachedStyles = {
			background: rootStyles.getPropertyValue('--grid-bg').trim() || '#000000',
			gridLine: 'rgba(255, 255, 255, 0.12)',
			border: rootStyles.getPropertyValue('--grid-border').trim() || '#333333',
			ghost: rootStyles.getPropertyValue('--ghost-color').trim() || 'rgba(255, 255, 255, 0.35)'
		};
	}

	render(board, activePiece, ghostPiece) {
		this.clear();
		this.drawGrid();
		this.drawBoard(board);

		if (ghostPiece) {
			this.drawTetromino(ghostPiece, { ghost: true });
		}

		if (activePiece) {
			this.drawTetromino(activePiece);
		}
	}

	clear() {
		const width = this.canvas.width / SETTINGS.blockSize;
		const height = this.canvas.height / SETTINGS.blockSize;

		this.context.fillStyle = this.cachedStyles.background;
		this.context.fillRect(0, 0, width, height);
	}

	drawGrid() {
		this.context.save();
		this.context.strokeStyle = this.cachedStyles.gridLine;
		this.context.lineWidth = 0.025;

		for (let x = 0; x <= SETTINGS.cols; x++) {
			this.context.beginPath();
			this.context.moveTo(x, 0);
			this.context.lineTo(x, SETTINGS.rows);
			this.context.stroke();
		}

		for (let y = 0; y <= SETTINGS.rows; y++) {
			this.context.beginPath();
			this.context.moveTo(0, y);
			this.context.lineTo(SETTINGS.cols, y);
			this.context.stroke();
		}

		this.context.restore();
	}

	drawBoard(board) {
		board.forEach((row, y) => {
			row.forEach((value, x) => {
				if (value) {
					this.#drawCell(x, y, this.#colorFor(value));
				}
			});
		});
	}

	drawTetromino(piece, options = {}) {
		const { ghost = false, offsetX = 0, offsetY = 0 } = options;
		const fill = ghost ? this.cachedStyles.ghost : this.#colorFor(piece.type);

		piece.shape.forEach((row, y) => {
			row.forEach((value, x) => {
				if (value) {
					const drawX = x + piece.pos.x + offsetX;
					const drawY = y + piece.pos.y + offsetY;
					this.#drawCell(drawX, drawY, fill, ghost);
				}
			});
		});
	}

	#drawCell(x, y, fill, ghost = false) {
		this.context.fillStyle = fill;
		this.context.fillRect(x, y, 1, 1);

		this.context.strokeStyle = ghost ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.35)';
		this.context.lineWidth = 0.05;
		this.context.strokeRect(x, y, 1, 1);
	}

	#configureContext() {
		const scale = SETTINGS.blockSize;
		this.context.scale(scale, scale);
		this.context.imageSmoothingEnabled = false;
	}

	#colorFor(type) {
		return this.colors[type] || '#ffffff';
	}
}
