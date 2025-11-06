// Utilities for handling hard drop input and movement.

const HARD_DROP_CODES = new Set(['KeyQ']);
const HARD_DROP_KEYS = new Set(['q', 'Q']);

export function isHardDropKey(event) {
	return HARD_DROP_CODES.has(event.code) || HARD_DROP_KEYS.has(event.key);
}

export function calculateHardDropDistance(piece, validator) {
	if (!piece) {
		return 0;
	}

	let offset = 0;
	while (validator(offset + 1)) {
		offset += 1;
	}

	return offset;
}

export function applyHardDrop(piece, distance) {
	if (!piece || distance <= 0) {
		return;
	}
	piece.pos.y += distance;
}
