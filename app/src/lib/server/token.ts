import { randomBytes } from 'crypto';

const CHARSET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no 0, O, I, 1

export function generateToken(): string {
	const bytes = randomBytes(8);
	let token = '';
	for (let i = 0; i < 8; i++) {
		token += CHARSET[bytes[i] % CHARSET.length];
		if (i === 3) token += '-';
	}
	return token;
}
