<script lang="ts">
	import { onMount } from 'svelte';
	import type { ResortData } from '$lib/types';
	import type { ModuleName } from './types';
	import { getThemeVars, themeToStyle } from './themes';
	import SlideShowEngine from './SlideShowEngine.svelte';

	let {
		hotelName,
		theme = 'dark',
		modules,
		data,
		speedSeconds = 15,
		customBranding = {}
	}: {
		hotelName: string;
		theme?: string;
		modules: ModuleName[];
		data: ResortData;
		speedSeconds?: number;
		customBranding?: Record<string, unknown>;
	} = $props();

	let clock = $state('');

	onMount(() => {
		function updateClock() {
			clock = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
		}
		updateClock();
		const interval = setInterval(updateClock, 1000);
		return () => clearInterval(interval);
	});

	let themeStyle = $derived(themeToStyle(getThemeVars(theme)));
</script>

<div class="display-shell" style={themeStyle}>
	<header class="display-header">
		<h1 class="hotel-name">{hotelName}</h1>
		<span class="clock">{clock}</span>
	</header>

	<div class="display-content">
		<SlideShowEngine {modules} {data} {speedSeconds} />
	</div>

	<footer class="display-footer">
		<span class="data-time">Data: {new Date(data.fetchedAt).toLocaleTimeString()}</span>
	</footer>
</div>

<style>
	.display-shell {
		position: fixed;
		inset: 0;
		display: flex;
		flex-direction: column;
		background: var(--bg);
		color: var(--text);
		font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
		cursor: none;
		overflow: hidden;
	}

	.display-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 16px 24px;
		flex-shrink: 0;
	}

	.hotel-name {
		font-size: 1.4rem;
		margin: 0;
		background: linear-gradient(135deg, #60a5fa, #a78bfa);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
	}

	.clock {
		font-size: 1.6rem;
		font-weight: 600;
		color: var(--text-muted);
		font-variant-numeric: tabular-nums;
	}

	.display-content {
		flex: 1;
		overflow-y: auto;
		padding: 0 24px 24px;
	}

	.display-footer {
		display: flex;
		justify-content: flex-end;
		padding: 8px 24px;
		flex-shrink: 0;
		border-top: 1px solid var(--border);
	}

	.data-time {
		font-size: 0.75rem;
		color: var(--text-muted);
	}
</style>
