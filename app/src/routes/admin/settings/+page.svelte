<script lang="ts">
	import { invalidateAll } from '$app/navigation';

	let { data } = $props();
	let settings = $derived(data.settings);

	let theme = $state('dark');
	let speed = $state(15);
	let language = $state('en');
	let aliasesText = $state('');
	let enabledModules = $state<string[]>([]);
	let initialized = $state(false);

	// Sync form state from server data (initial + after invalidateAll)
	$effect(() => {
		if (settings && !initialized) {
			theme = settings.theme;
			speed = settings.slideshowSpeedSeconds;
			language = settings.language;
			aliasesText = (settings.resortAliases ?? []).join(', ');
			enabledModules = settings.enabledModules ?? [];
			initialized = true;
		}
	});

	let saving = $state(false);
	let saved = $state(false);
	let errorMsg = $state('');

	const allModules = ['weather', 'lifts', 'slopes', 'webcams'];
	const themes = ['dark', 'light', 'alpine', 'luxury'];
	const languages = [
		{ value: 'en', label: 'English' },
		{ value: 'cz', label: 'Czech' },
		{ value: 'de', label: 'German' },
		{ value: 'pl', label: 'Polish' }
	];

	function toggleModule(mod: string) {
		if (enabledModules.includes(mod)) {
			enabledModules = enabledModules.filter((m) => m !== mod);
		} else {
			enabledModules = [...enabledModules, mod];
		}
	}

	async function handleSave() {
		saving = true;
		saved = false;
		errorMsg = '';

		const aliases = aliasesText
			.split(',')
			.map((a) => a.trim())
			.filter(Boolean);

		try {
			const resp = await fetch('/api/admin/settings', {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					theme,
					slideshowSpeedSeconds: speed,
					language,
					resortAliases: aliases,
					enabledModules
				})
			});

			if (!resp.ok) {
				const data = await resp.json().catch(() => ({ message: 'Save failed' }));
				throw new Error(data.message ?? `HTTP ${resp.status}`);
			}

			saved = true;
			initialized = false;
			await invalidateAll();
			setTimeout(() => (saved = false), 3000);
		} catch (err) {
			errorMsg = err instanceof Error ? err.message : 'Save failed';
		} finally {
			saving = false;
		}
	}
</script>

<svelte:head>
	<title>Settings - Admin</title>
</svelte:head>

<div class="header-row">
	<h1>Settings</h1>
	<button class="btn-primary" onclick={handleSave} disabled={saving}>
		{saving ? 'Saving...' : 'Save Changes'}
	</button>
</div>

{#if saved}
	<div class="toast success">Settings saved. Displays will update within 60 seconds.</div>
{/if}
{#if errorMsg}
	<div class="toast error">{errorMsg}</div>
{/if}

{#if settings}
	<div class="settings-grid">
		<section class="settings-section">
			<h2>Display</h2>

			<label class="field">
				<span>Theme</span>
				<div class="theme-picker">
					{#each themes as t}
						<button
							class="theme-btn"
							class:selected={theme === t}
							onclick={() => (theme = t)}
						>
							{t}
						</button>
					{/each}
				</div>
			</label>

			<label class="field">
				<span>Slide duration (seconds)</span>
				<input type="number" bind:value={speed} min={5} max={120} />
			</label>

			<label class="field">
				<span>Language</span>
				<select bind:value={language}>
					{#each languages as lang}
						<option value={lang.value}>{lang.label}</option>
					{/each}
				</select>
			</label>
		</section>

		<section class="settings-section">
			<h2>Modules</h2>
			<div class="module-toggles">
				{#each allModules as mod}
					<label class="toggle">
						<input
							type="checkbox"
							checked={enabledModules.includes(mod)}
							onchange={() => toggleModule(mod)}
						/>
						<span>{mod}</span>
					</label>
				{/each}
			</div>
		</section>

		<section class="settings-section">
			<h2>Data Source</h2>
			<label class="field">
				<span>Resort aliases (comma-separated)</span>
				<input type="text" bind:value={aliasesText} placeholder="medvedin, svpetr" />
			</label>
			<p class="hint">
				These are the resort identifiers used by the data provider to fetch weather, lifts,
				slopes, and webcam data.
			</p>
		</section>
	</div>
{:else}
	<div class="empty">No settings found for this hotel.</div>
{/if}

<style>
	.header-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 24px;
	}

	h1 {
		font-size: 1.8rem;
		margin: 0;
	}

	h2 {
		font-size: 1.1rem;
		margin: 0 0 16px;
		color: #f1f5f9;
	}

	.btn-primary {
		padding: 10px 20px;
		background: #3b82f6;
		color: #fff;
		border: none;
		border-radius: 8px;
		font-size: 0.9rem;
		font-weight: 600;
		cursor: pointer;
	}

	.btn-primary:hover:not(:disabled) {
		background: #2563eb;
	}

	.btn-primary:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.toast {
		padding: 12px 16px;
		border-radius: 8px;
		margin-bottom: 20px;
		font-size: 0.9rem;
	}

	.toast.success {
		background: #1a3a2a;
		color: #22c55e;
		border: 1px solid #22c55e;
	}

	.toast.error {
		background: #3a1a1a;
		color: #ef4444;
		border: 1px solid #ef4444;
	}

	.settings-grid {
		display: flex;
		flex-direction: column;
		gap: 24px;
	}

	.settings-section {
		background: #1e293b;
		border-radius: 12px;
		padding: 24px;
	}

	.field {
		display: block;
		margin-bottom: 20px;
	}

	.field span {
		display: block;
		color: #94a3b8;
		font-size: 0.85rem;
		margin-bottom: 8px;
	}

	input[type='text'],
	input[type='number'],
	select {
		width: 100%;
		max-width: 400px;
		padding: 10px 12px;
		background: #0f172a;
		border: 1px solid #334155;
		border-radius: 8px;
		color: #f1f5f9;
		font-size: 0.9rem;
	}

	input:focus,
	select:focus {
		outline: none;
		border-color: #3b82f6;
	}

	.theme-picker {
		display: flex;
		gap: 8px;
		flex-wrap: wrap;
	}

	.theme-btn {
		padding: 8px 16px;
		background: #0f172a;
		border: 2px solid #334155;
		border-radius: 8px;
		color: #94a3b8;
		font-size: 0.85rem;
		cursor: pointer;
		text-transform: capitalize;
	}

	.theme-btn.selected {
		border-color: #3b82f6;
		color: #f1f5f9;
		background: #1e3a5f;
	}

	.module-toggles {
		display: flex;
		flex-wrap: wrap;
		gap: 12px;
	}

	.toggle {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 10px 16px;
		background: #0f172a;
		border-radius: 8px;
		cursor: pointer;
		font-size: 0.9rem;
		text-transform: capitalize;
	}

	.toggle input {
		accent-color: #3b82f6;
		width: 16px;
		height: 16px;
	}

	.hint {
		color: #64748b;
		font-size: 0.8rem;
		margin: 0;
	}

	.empty {
		text-align: center;
		color: #94a3b8;
		padding: 60px 20px;
	}
</style>
