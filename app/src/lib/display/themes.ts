export interface ThemeVars {
	'--bg': string;
	'--surface': string;
	'--surface-hover': string;
	'--text': string;
	'--text-muted': string;
	'--blue': string;
	'--green': string;
	'--red': string;
	'--yellow': string;
	'--border': string;
}

export const themes: Record<string, ThemeVars> = {
	dark: {
		'--bg': '#0f172a',
		'--surface': '#1e293b',
		'--surface-hover': '#334155',
		'--text': '#f1f5f9',
		'--text-muted': '#94a3b8',
		'--blue': '#3b82f6',
		'--green': '#22c55e',
		'--red': '#ef4444',
		'--yellow': '#eab308',
		'--border': '#334155'
	},
	light: {
		'--bg': '#f8fafc',
		'--surface': '#ffffff',
		'--surface-hover': '#f1f5f9',
		'--text': '#0f172a',
		'--text-muted': '#64748b',
		'--blue': '#2563eb',
		'--green': '#16a34a',
		'--red': '#dc2626',
		'--yellow': '#ca8a04',
		'--border': '#e2e8f0'
	},
	alpine: {
		'--bg': '#1a2332',
		'--surface': '#243447',
		'--surface-hover': '#2d4258',
		'--text': '#e8f0fe',
		'--text-muted': '#8ba4c4',
		'--blue': '#4a9eff',
		'--green': '#34d399',
		'--red': '#f87171',
		'--yellow': '#fbbf24',
		'--border': '#2d4258'
	},
	luxury: {
		'--bg': '#1c1917',
		'--surface': '#292524',
		'--surface-hover': '#3d3835',
		'--text': '#fef3c7',
		'--text-muted': '#a8a29e',
		'--blue': '#60a5fa',
		'--green': '#6ee7b7',
		'--red': '#fca5a5',
		'--yellow': '#d4a017',
		'--border': '#44403c'
	}
};

export function getThemeVars(name: string): ThemeVars {
	return themes[name] ?? themes.dark;
}

export function themeToStyle(vars: ThemeVars): string {
	return Object.entries(vars)
		.map(([k, v]) => `${k}: ${v}`)
		.join('; ');
}
