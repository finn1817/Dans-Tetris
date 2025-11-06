// Theme toggle and persistence helpers.

import { STORAGE_KEYS } from './page-settings.js';

export function initializeThemeToggle(button) {
	if (!button) {
		return;
	}

	const mediaQuery = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;
	const systemPrefersDark = mediaQuery ? mediaQuery.matches : false;
	const storedPreference = localStorage.getItem(STORAGE_KEYS.darkMode);
	const shouldEnableDark = storedPreference === null ? systemPrefersDark : storedPreference === 'true';

	applyTheme(shouldEnableDark);
	updateToggleButton(button, shouldEnableDark);

	button.addEventListener('click', () => {
		const currentlyDark = document.body.classList.contains('dark-mode');
		const nextState = !currentlyDark;
		applyTheme(nextState);
		updateToggleButton(button, nextState);
		document.dispatchEvent(new CustomEvent('themechange', { detail: { darkMode: nextState } }));
		localStorage.setItem(STORAGE_KEYS.darkMode, nextState ? 'true' : 'false');
	});

	if (mediaQuery) {
		const listener = event => {
			const saved = localStorage.getItem(STORAGE_KEYS.darkMode);
			if (saved !== null) {
				return; // user preference overrides system changes
			}
			applyTheme(event.matches);
			updateToggleButton(button, event.matches);
			document.dispatchEvent(new CustomEvent('themechange', { detail: { darkMode: event.matches } }));
		};

		if (mediaQuery.addEventListener) {
			mediaQuery.addEventListener('change', listener);
		} else if (mediaQuery.addListener) {
			mediaQuery.addListener(listener);
		}
	}
}

export function applyTheme(enableDark) {
	document.body.classList.toggle('dark-mode', enableDark);
}

export function updateToggleButton(button, darkModeEnabled) {
	if (!button) {
		return;
	}

	button.innerHTML = darkModeEnabled ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
	button.setAttribute('aria-pressed', darkModeEnabled ? 'true' : 'false');
	button.setAttribute('title', darkModeEnabled ? 'Switch to light theme' : 'Switch to dark theme');
	button.setAttribute('aria-label', darkModeEnabled ? 'Switch to light theme' : 'Switch to dark theme');
}
