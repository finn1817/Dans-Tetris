// Shared configuration helpers for the Tetris application.

export const SETTINGS = Object.freeze({
	rows: 20,
	cols: 12,
	blockSize: 20,
	nextBlockSize: 20,
	initialDropInterval: 1000,
	minDropInterval: 90,
	dropStep: 85,
	hardDropBonusMultiplier: 1,
	levelScoreThreshold: 1000,
	maxScoreHistory: 10,
	linePoints: [0, 40, 100, 300, 1200]
});

export const STORAGE_KEYS = Object.freeze({
	highScore: 'tetris-highscore',
	highLevel: 'tetris-highlevel',
	totalLines: 'tetris-linescleared',
	totalPieces: 'tetris-piecesplaced',
	previousScores: 'tetris-previousscores',
	darkMode: 'tetris-darkmode'
});

export function createEmptyBoard() {
	return Array.from({ length: SETTINGS.rows }, () => Array(SETTINGS.cols).fill(null));
}

export function calculateDropInterval(level) {
	const reduction = (level - 1) * SETTINGS.dropStep;
	return Math.max(SETTINGS.minDropInterval, SETTINGS.initialDropInterval - reduction);
}
