// Handles user input bindings for keyboard and buttons.

const KEY_BINDINGS = new Map([
	['ArrowLeft', 'left'],
	['ArrowRight', 'right'],
	['ArrowDown', 'down'],
	['ArrowUp', 'rotate'],
	['KeyQ', 'drop'],
	['q', 'drop'],
	['Q', 'drop'],
	['KeyP', 'pause'],
	['p', 'pause'],
	['P', 'pause'],
	['KeyR', 'restart'],
	['r', 'restart'],
	['R', 'restart']
]);

export function setupKeyboardControls(callbacks) {
	const handler = event => {
		const action = KEY_BINDINGS.get(event.code) ?? KEY_BINDINGS.get(event.key);
		if (!action) {
			return;
		}

		event.preventDefault();

		switch (action) {
			case 'left':
				callbacks.onMoveLeft?.();
				break;
			case 'right':
				callbacks.onMoveRight?.();
				break;
			case 'down':
				callbacks.onSoftDrop?.();
				break;
			case 'rotate':
				callbacks.onRotate?.();
				break;
			case 'drop':
				callbacks.onHardDrop?.();
				break;
			case 'pause':
				callbacks.onTogglePause?.();
				break;
			case 'restart':
				callbacks.onRestart?.();
				break;
			default:
				break;
		}
	};

	document.addEventListener('keydown', handler);

	return () => {
		document.removeEventListener('keydown', handler);
	};
}

export function setupButtonControls(elements, callbacks) {
	const { startButton, pauseButton, restartButton } = elements;

	if (startButton) {
		startButton.addEventListener('click', () => {
			callbacks.onStart?.();
		});
	}

	if (pauseButton) {
		pauseButton.addEventListener('click', () => {
			callbacks.onTogglePause?.();
		});
	}

	if (restartButton) {
		restartButton.addEventListener('click', () => {
			callbacks.onRestart?.();
		});
	}
}

export function updatePauseButtonVisuals(button, paused) {
	if (!button) {
		return;
	}

	button.innerHTML = paused ? '<i class="fas fa-play"></i> Resume' : '<i class="fas fa-pause"></i> Pause';
	button.setAttribute('aria-pressed', paused ? 'true' : 'false');
}
