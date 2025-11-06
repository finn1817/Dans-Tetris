// Tetromino shape definitions and utilities for generating pieces.

import { SETTINGS } from './page-settings.js';

const SHAPES = Object.freeze({
	I: [
		[0, 0, 0, 0],
		[1, 1, 1, 1],
		[0, 0, 0, 0],
		[0, 0, 0, 0]
	],
	J: [
		[1, 0, 0],
		[1, 1, 1],
		[0, 0, 0]
	],
	L: [
		[0, 0, 1],
		[1, 1, 1],
		[0, 0, 0]
	],
	O: [
		[1, 1],
		[1, 1]
	],
	S: [
		[0, 1, 1],
		[1, 1, 0],
		[0, 0, 0]
	],
	T: [
		[0, 1, 0],
		[1, 1, 1],
		[0, 0, 0]
	],
	Z: [
		[1, 1, 0],
		[0, 1, 1],
		[0, 0, 0]
	]
});

const DEFAULT_COLORS = Object.freeze({
	I: '#00f0f0',
	J: '#0000f0',
	L: '#f0a000',
	O: '#f0f000',
	S: '#00f000',
	T: '#a000f0',
	Z: '#f00000'
});

export function cloneShape(shape) {
	return shape.map(row => row.slice());
}

export function rotateClockwise(shape) {
	const rows = shape.length;
	const cols = shape[0].length;
	const rotated = Array.from({ length: cols }, () => Array(rows).fill(0));

	for (let y = 0; y < rows; y++) {
		for (let x = 0; x < cols; x++) {
			rotated[x][rows - 1 - y] = shape[y][x];
		}
	}

	return rotated;
}

export function rotateCounterClockwise(shape) {
	const rows = shape.length;
	const cols = shape[0].length;
	const rotated = Array.from({ length: cols }, () => Array(rows).fill(0));

	for (let y = 0; y < rows; y++) {
		for (let x = 0; x < cols; x++) {
			rotated[cols - 1 - x][y] = shape[y][x];
		}
	}

	return rotated;
}

export class TetrominoGenerator {
	constructor(cols = SETTINGS.cols) {
		this.cols = cols;
		this.colors = resolveTetrominoColors();
		this.queue = [];
	}

	next() {
		if (this.queue.length === 0) {
			this.queue = shuffle(Object.keys(SHAPES));
		}

		const type = this.queue.pop();
		return buildPiece(type, this.cols);
	}

	refreshColors() {
		this.colors = resolveTetrominoColors();
	}

	getColors() {
		return { ...this.colors };
	}
}

export function resolveTetrominoColors() {
	if (typeof window === 'undefined' || !window.getComputedStyle) {
		return { ...DEFAULT_COLORS };
	}

	const styles = getComputedStyle(document.documentElement);

	return Object.keys(SHAPES).reduce((colors, type) => {
		const value = styles.getPropertyValue(`--color-${type.toLowerCase()}`);
		colors[type] = value ? value.trim() : DEFAULT_COLORS[type];
		return colors;
	}, {});
}

export function buildPiece(type, cols = SETTINGS.cols) {
	const shape = cloneShape(SHAPES[type]);
	const width = shape[0].length;
	return {
		type,
		shape,
		pos: {
			x: Math.floor((cols - width) / 2),
			y: 0
		}
	};
}

export function getShapeTypes() {
	return Object.keys(SHAPES);
}

function shuffle(collection) {
	const array = [...collection];
	for (let i = array.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[array[i], array[j]] = [array[j], array[i]];
	}
	return array;
}
