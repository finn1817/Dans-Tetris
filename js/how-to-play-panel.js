// Populates the "How to Play" panel from a structured data set.

const INSTRUCTIONS = [
	{ keys: ['←'], description: 'Move left' },
	{ keys: ['→'], description: 'Move right' },
	{ keys: ['↓'], description: 'Soft drop' },
	{ keys: ['↑'], description: 'Rotate clockwise' },
	{ keys: ['Space'], description: 'Hard drop instantly' },
	{ keys: ['P'], description: 'Pause or resume' },
	{ keys: ['R'], description: 'Restart current game' }
];

export function renderInstructions(container) {
	if (!container) {
		return;
	}

	container.innerHTML = '';

	INSTRUCTIONS.forEach(step => {
		const wrapper = document.createElement('div');
		wrapper.className = 'key-instruction';

		const keyElement = document.createElement('div');
		keyElement.className = 'key';
		keyElement.textContent = Array.isArray(step.keys) ? step.keys.join(' + ') : step.keys;

		const textElement = document.createElement('div');
		textElement.className = 'key-text';
		textElement.textContent = step.description;

		wrapper.appendChild(keyElement);
		wrapper.appendChild(textElement);
		container.appendChild(wrapper);
	});
}
