// Score, level, and persistent statistics management.

import { SETTINGS, STORAGE_KEYS, calculateDropInterval } from './page-settings.js';

export class GameStats {
	constructor(elements) {
		this.elements = elements;

		this.score = 0;
		this.level = 1;
		this.linesThisGame = 0;

		this.lifetime = {
			highScore: 0,
			highLevel: 1,
			totalLines: 0,
			totalPieces: 0
		};

		this.#loadPersistentValues();
		this.#refreshDisplayedValues();
	}

	resetForNewGame() {
		this.score = 0;
		this.level = 1;
		this.linesThisGame = 0;
		this.#updateScoreDisplay();
		this.#updateLevelDisplay();
	}

	getDropInterval() {
		return calculateDropInterval(this.level);
	}

	addHardDropBonus(distance) {
		if (distance <= 0) {
			return;
		}
		const bonus = distance * SETTINGS.hardDropBonusMultiplier;
		this.addScore(bonus);
	}

	addScore(points) {
		if (!points) {
			return;
		}
		this.score += points;
		this.#updateScoreDisplay();
		this.#checkHighScore();
		this.#checkLevelUp();
	}

	recordPiecePlaced() {
		this.lifetime.totalPieces += 1;
		this.elements.totalPieces.textContent = this.lifetime.totalPieces;
		this.#persist(STORAGE_KEYS.totalPieces, this.lifetime.totalPieces);
	}

	recordLinesCleared(count) {
		if (count <= 0) {
			return;
		}

		this.linesThisGame += count;
		this.lifetime.totalLines += count;
		this.elements.totalLines.textContent = this.lifetime.totalLines;
		this.#persist(STORAGE_KEYS.totalLines, this.lifetime.totalLines);

		const linePoints = SETTINGS.linePoints[count] ?? 0;
		this.addScore(linePoints * this.level);
	}

	getScore() {
		return this.score;
	}

	getLevel() {
		return this.level;
	}

	#loadPersistentValues() {
		const highScore = parseInt(localStorage.getItem(STORAGE_KEYS.highScore), 10);
		const highLevel = parseInt(localStorage.getItem(STORAGE_KEYS.highLevel), 10);
		const totalLines = parseInt(localStorage.getItem(STORAGE_KEYS.totalLines), 10);
		const totalPieces = parseInt(localStorage.getItem(STORAGE_KEYS.totalPieces), 10);

		if (!Number.isNaN(highScore)) {
			this.lifetime.highScore = highScore;
		}

		if (!Number.isNaN(highLevel)) {
			this.lifetime.highLevel = Math.max(1, highLevel);
		}

		if (!Number.isNaN(totalLines)) {
			this.lifetime.totalLines = Math.max(0, totalLines);
		}

		if (!Number.isNaN(totalPieces)) {
			this.lifetime.totalPieces = Math.max(0, totalPieces);
		}
	}

	#refreshDisplayedValues() {
		this.elements.highScore.textContent = this.lifetime.highScore;
		this.elements.highLevel.textContent = this.lifetime.highLevel;
		this.elements.totalLines.textContent = this.lifetime.totalLines;
		this.elements.totalPieces.textContent = this.lifetime.totalPieces;
		this.#updateScoreDisplay();
		this.#updateLevelDisplay();
	}

	#checkHighScore() {
		if (this.score <= this.lifetime.highScore) {
			return;
		}
		this.lifetime.highScore = this.score;
		this.elements.highScore.textContent = this.lifetime.highScore;
		this.#persist(STORAGE_KEYS.highScore, this.lifetime.highScore);
	}

	#checkLevelUp() {
		const targetLevel = Math.floor(this.score / SETTINGS.levelScoreThreshold) + 1;
		if (targetLevel <= this.level) {
			return;
		}

		this.level = targetLevel;
		this.#updateLevelDisplay();

		if (this.level > this.lifetime.highLevel) {
			this.lifetime.highLevel = this.level;
			this.elements.highLevel.textContent = this.lifetime.highLevel;
			this.#persist(STORAGE_KEYS.highLevel, this.lifetime.highLevel);
		}
	}

	#updateScoreDisplay() {
		this.elements.score.textContent = this.score;
	}

	#updateLevelDisplay() {
		this.elements.level.textContent = this.level;
	}

	#persist(key, value) {
		localStorage.setItem(key, String(value));
	}
}
