<script lang="ts">
	import { onMount } from 'svelte';
	import type { DisplayConfig, ModuleName } from '$lib/display/types';
	import DisplayShell from '$lib/display/DisplayShell.svelte';

	let { data: pageData } = $props();
	let token = $derived(pageData.token);

	let config: DisplayConfig | null = $state(null);
	let error: string | null = $state(null);
	let status: 'loading' | 'binding' | 'ready' | 'error' = $state('loading');
	let lastConfigVersion = $state(0);

	function getDeviceId(): string {
		const key = 'display_device_id';
		let id = localStorage.getItem(key);
		if (!id) {
			id = crypto.randomUUID();
			localStorage.setItem(key, id);
		}
		return id;
	}

	function getCacheKey(): string {
		return `display_config_${token}`;
	}

	function cacheConfig(cfg: DisplayConfig) {
		try {
			localStorage.setItem(getCacheKey(), JSON.stringify(cfg));
		} catch {
			// localStorage full or unavailable
		}
	}

	function loadCachedConfig(): DisplayConfig | null {
		try {
			const raw = localStorage.getItem(getCacheKey());
			if (raw) return JSON.parse(raw);
		} catch {
			// ignore
		}
		return null;
	}

	async function bindDevice(deviceId: string): Promise<boolean> {
		try {
			const resp = await fetch(`/api/display/${token}/bind`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ deviceId })
			});
			if (!resp.ok) {
				const data = await resp.json().catch(() => ({ message: `HTTP ${resp.status}` }));
				error = data.message ?? `Bind failed: ${resp.status}`;
				return false;
			}
			return true;
		} catch (err) {
			error = err instanceof Error ? err.message : 'Bind failed';
			return false;
		}
	}

	async function fetchConfig(): Promise<DisplayConfig | null> {
		try {
			const resp = await fetch(`/api/display/${token}`);
			if (!resp.ok) {
				const data = await resp.json().catch(() => ({ message: `HTTP ${resp.status}` }));
				throw new Error(data.message ?? `HTTP ${resp.status}`);
			}
			return await resp.json();
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to fetch config';
			return null;
		}
	}

	async function heartbeat(): Promise<void> {
		try {
			const resp = await fetch(`/api/display/${token}/heartbeat`, { method: 'POST' });
			if (!resp.ok) return;
			const data = await resp.json();
			if (data.configVersion && data.configVersion !== lastConfigVersion) {
				// Config changed, refetch
				const newConfig = await fetchConfig();
				if (newConfig) {
					config = newConfig;
					lastConfigVersion = data.configVersion;
					cacheConfig(newConfig);
				}
			}
		} catch {
			// Heartbeat failures are non-fatal
		}
	}

	let heartbeatInterval: ReturnType<typeof setInterval> | undefined;
	let dataInterval: ReturnType<typeof setInterval> | undefined;

	async function init() {
		// Try loading cached config first for instant display
		const cached = loadCachedConfig();
		if (cached) {
			config = cached;
			status = 'ready';
		}

		// Bind device
		status = cached ? 'ready' : 'binding';
		const deviceId = getDeviceId();
		const bound = await bindDevice(deviceId);
		if (!bound) {
			if (!cached) {
				status = 'error';
				return;
			}
		}

		// Fetch fresh config
		const freshConfig = await fetchConfig();
		if (freshConfig) {
			config = freshConfig;
			lastConfigVersion = freshConfig.configVersion;
			cacheConfig(freshConfig);
			status = 'ready';
		} else if (!cached) {
			status = 'error';
			return;
		}

		// Start heartbeats
		heartbeatInterval = setInterval(heartbeat, 60 * 1000);

		// Refresh data every 5 minutes
		dataInterval = setInterval(async () => {
			const newConfig = await fetchConfig();
			if (newConfig) {
				config = newConfig;
				lastConfigVersion = newConfig.configVersion;
				cacheConfig(newConfig);
			}
		}, 5 * 60 * 1000);
	}

	onMount(() => {
		init();
		return () => {
			clearInterval(heartbeatInterval);
			clearInterval(dataInterval);
		};
	});
</script>

<svelte:head>
	<title>{config?.hotelName ?? 'Display'}</title>
	<meta name="robots" content="noindex" />
</svelte:head>

{#if status === 'loading' || status === 'binding'}
	<div class="status-screen">
		<div class="spinner"></div>
		<p>{status === 'loading' ? 'Loading...' : 'Connecting device...'}</p>
	</div>
{:else if status === 'error' && !config}
	<div class="status-screen error-screen">
		<p class="error-text">{error ?? 'Unknown error'}</p>
		<p class="error-hint">Check the device token or contact support.</p>
	</div>
{:else if config}
	<DisplayShell {config} />
{/if}

<style>
	:global(body) {
		margin: 0;
		overflow: hidden;
	}

	.status-screen {
		position: fixed;
		inset: 0;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		background: #0f172a;
		color: #f1f5f9;
		font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
	}

	.spinner {
		width: 40px;
		height: 40px;
		border: 3px solid #334155;
		border-top-color: #3b82f6;
		border-radius: 50%;
		animation: spin 1s linear infinite;
		margin-bottom: 16px;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	.error-screen {
		background: #1c1917;
	}

	.error-text {
		color: #ef4444;
		font-size: 1.2rem;
		margin: 0 0 8px;
	}

	.error-hint {
		color: #94a3b8;
		font-size: 0.9rem;
		margin: 0;
	}
</style>
