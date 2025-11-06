// Rendering for the "next piece" preview panel.

import { SETTINGS } from './page-settings.js';

export class NextPiecePreview {
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
			border: rootStyles.getPropertyValue('--grid-border').trim() || '#333333'
		};
	}

	clear() {
		const width = this.canvas.width / SETTINGS.nextBlockSize;
		const height = this.canvas.height / SETTINGS.nextBlockSize;
		this.context.fillStyle = this.cachedStyles.background;
		this.context.fillRect(0, 0, width, height);
	}

	render(piece) {
		this.clear();
		if (!piece) {
			return;
		}

		const bounds = getShapeBounds(piece.shape);
		const width = this.canvas.width / SETTINGS.nextBlockSize;
		const height = this.canvas.height / SETTINGS.nextBlockSize;

		const offsetX = (width - bounds.width) / 2 - bounds.minX;
		const offsetY = (height - bounds.height) / 2 - bounds.minY;

		this.context.fillStyle = this.#colorFor(piece.type);
		piece.shape.forEach((row, y) => {
			row.forEach((value, x) => {
				if (!value) {
					return;
				}
				const drawX = x + offsetX;
				const drawY = y + offsetY;
				this.context.fillRect(drawX, drawY, 1, 1);
				this.context.strokeStyle = 'rgba(0, 0, 0, 0.35)';
				this.context.lineWidth = 0.05;
				this.context.strokeRect(drawX, drawY, 1, 1);
			});
		});
	}

	#configureContext() {
		const scale = SETTINGS.nextBlockSize;
		this.context.scale(scale, scale);
		this.context.imageSmoothingEnabled = false;
	}

	#colorFor(type) {
		return this.colors[type] || '#ffffff';
	}
}

function getShapeBounds(shape) {
	let minX = Infinity;
	let maxX = -Infinity;
	let minY = Infinity;
	let maxY = -Infinity;

	shape.forEach((row, y) => {
		row.forEach((value, x) => {
			if (!value) {
				return;
			}
			minX = Math.min(minX, x);
			maxX = Math.max(maxX, x);
			minY = Math.min(minY, y);
			maxY = Math.max(maxY, y);
		});
	});

	return {
		minX: minX === Infinity ? 0 : minX,
		maxX: maxX === -Infinity ? 0 : maxX,
		minY: minY === Infinity ? 0 : minY,
		maxY: maxY === -Infinity ? 0 : maxY,
		width: maxX - minX + 1,
		height: maxY - minY + 1
	};
}
