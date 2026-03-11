export function weatherIcon(code: number | null): string {
	const icons: Record<number, string> = {
		1: '\u2600\uFE0F',
		2: '\uD83C\uDF24\uFE0F',
		3: '\u26C5',
		4: '\u2601\uFE0F',
		5: '\uD83C\uDF27\uFE0F',
		6: '\uD83C\uDF28\uFE0F',
		7: '\u2744\uFE0F',
		8: '\uD83C\uDF2B\uFE0F',
		9: '\u26C8\uFE0F',
		10: '\uD83C\uDF2C\uFE0F'
	};
	return code ? icons[code] ?? '\uD83C\uDF21\uFE0F' : '\uD83C\uDF21\uFE0F';
}

export function statusColor(status: string): string {
	const s = status.toLowerCase();
	if (s === 'open' || s === 'opened') return 'var(--green)';
	if (s === 'closed' || s === 'close') return 'var(--red)';
	return 'var(--yellow)';
}

export function difficultyColor(code: number): string {
	if (code === 1) return 'var(--blue)';
	if (code === 2) return 'var(--red)';
	if (code === 3) return '#111';
	return 'var(--text-muted)';
}
