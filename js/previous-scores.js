// Manage the "previous scores" list persisted in localStorage.

import { SETTINGS, STORAGE_KEYS } from './page-settings.js';

export class ScoreHistory {
	constructor(listElement) {
		this.listElement = listElement;
		this.history = this.#loadFromStorage();
		this.render();
	}

	add(score) {
		const entry = {
			score,
			date: new Date().toLocaleString()
		};

		this.history.unshift(entry);

		if (this.history.length > SETTINGS.maxScoreHistory) {
			this.history.length = SETTINGS.maxScoreHistory;
		}

		this.#persist();
		this.render();
	}

	render() {
		this.listElement.innerHTML = '';

		if (!this.history.length) {
			const emptyItem = document.createElement('li');
			emptyItem.className = 'score-item';
			emptyItem.textContent = 'No previous scores yet';
			this.listElement.appendChild(emptyItem);
			return;
		}

		this.history.forEach(entry => {
			const item = document.createElement('li');
			item.className = 'score-item';

			const value = document.createElement('div');
			value.className = 'score-value';
			value.textContent = entry.score;

			const date = document.createElement('div');
			date.className = 'score-date';
			date.textContent = entry.date;

			item.appendChild(value);
			item.appendChild(date);
			this.listElement.appendChild(item);
		});
	}

	#loadFromStorage() {
		try {
			const raw = localStorage.getItem(STORAGE_KEYS.previousScores);
			if (!raw) {
				return [];
			}

			const parsed = JSON.parse(raw);
			if (Array.isArray(parsed)) {
				return parsed.slice(0, SETTINGS.maxScoreHistory);
			}
		} catch (error) {
			console.error('Failed to parse score history', error);
		}

		return [];
	}

	#persist() {
		localStorage.setItem(STORAGE_KEYS.previousScores, JSON.stringify(this.history));
	}
}
