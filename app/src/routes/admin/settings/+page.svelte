<script lang="ts">
	import { invalidateAll, beforeNavigate } from '$app/navigation';
	import { onMount } from 'svelte';

	let { data } = $props();
	let settings = $derived(data.settings);

	let theme = $state('dark');
	let speed = $state(15);
	let language = $state('en');
	let aliasesText = $state('');
	let enabledModules = $state<string[]>([]);
	let weatherDestinations = $state<Array<{ name: string; lat: number; lon: number }>>([]);
	let qrCodes = $state<Array<{ label: string; url: string }>>([]);
	let initialized = $state(false);

	// Snapshot of saved state for dirty tracking
	let savedSnapshot = $state('');

	function currentSnapshot(): string {
		return JSON.stringify({ theme, speed, language, aliasesText, enabledModules, weatherDestinations, qrCodes });
	}

	let isDirty = $derived(initialized && currentSnapshot() !== savedSnapshot);

	// City search state
	let cityQuery = $state('');
	let cityResults = $state<Array<{ name: string; country: string; state?: string; lat: number; lon: number }>>([]);
	let searchingCity = $state(false);
	let searchTimeout: ReturnType<typeof setTimeout> | null = null;

	// Drag & drop state for modules
	let dragIndex = $state<number | null>(null);
	let dragOverIndex = $state<number | null>(null);

	$effect(() => {
		if (settings && !initialized) {
			theme = settings.theme;
			speed = settings.slideshowSpeedSeconds;
			language = settings.language;
			aliasesText = (settings.resortAliases ?? []).join(', ');
			enabledModules = settings.enabledModules ?? [];
			const wd = (settings.weatherDestinations ?? []) as Array<{ name: string; lat: number; lon: number }>;
			weatherDestinations = wd.map((d) => ({ ...d }));
			const qr = (settings.qrCodes ?? []) as Array<{ label: string; url: string }>;
			qrCodes = qr.map((q) => ({ ...q }));
			initialized = true;
			// Take snapshot after a tick so $state settles
			queueMicrotask(() => {
				savedSnapshot = currentSnapshot();
			});
		}
	});

	// Warn on SvelteKit navigation
	beforeNavigate(({ cancel }) => {
		if (isDirty && !confirm('You have unsaved changes. Leave this page?')) {
			cancel();
		}
	});

	// Warn on browser tab close / external navigation
	onMount(() => {
		function handleBeforeUnload(e: BeforeUnloadEvent) {
			if (isDirty) {
				e.preventDefault();
			}
		}
		window.addEventListener('beforeunload', handleBeforeUnload);
		return () => window.removeEventListener('beforeunload', handleBeforeUnload);
	});

	let saving = $state(false);
	let saved = $state(false);
	let errorMsg = $state('');

	const allModules: Record<string, string> = {
		weather: 'Ski Weather',
		lifts: 'Lifts',
		slopes: 'Slopes',
		webcams: 'Webcams',
		services: 'Hotel Services',
		announcements: 'Announcements',
		generalWeather: 'General Weather',
		qrCodes: 'QR Codes'
	};

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

	// Drag & drop handlers
	function handleDragStart(index: number) {
		dragIndex = index;
	}

	function handleDragOver(e: DragEvent, index: number) {
		e.preventDefault();
		dragOverIndex = index;
	}

	function handleDragLeave() {
		dragOverIndex = null;
	}

	function handleDrop(targetIndex: number) {
		if (dragIndex === null || dragIndex === targetIndex) {
			dragIndex = null;
			dragOverIndex = null;
			return;
		}
		const items = [...enabledModules];
		const [moved] = items.splice(dragIndex, 1);
		items.splice(targetIndex, 0, moved);
		enabledModules = items;
		dragIndex = null;
		dragOverIndex = null;
	}

	function handleDragEnd() {
		dragIndex = null;
		dragOverIndex = null;
	}

	// City search
	function handleCityInput() {
		if (searchTimeout) clearTimeout(searchTimeout);
		cityResults = [];
		if (cityQuery.length < 2) return;
		searchingCity = true;
		searchTimeout = setTimeout(async () => {
			try {
				const resp = await fetch(`/api/admin/weather-search?q=${encodeURIComponent(cityQuery)}`);
				if (resp.ok) {
					cityResults = await resp.json();
				}
			} finally {
				searchingCity = false;
			}
		}, 400);
	}

	function selectCity(city: { name: string; country: string; state?: string; lat: number; lon: number }) {
		if (weatherDestinations.length >= 5) return;
		const label = city.state ? `${city.name}, ${city.state}, ${city.country}` : `${city.name}, ${city.country}`;
		weatherDestinations = [...weatherDestinations, { name: label, lat: city.lat, lon: city.lon }];
		cityQuery = '';
		cityResults = [];
	}

	function removeWeatherDest(index: number) {
		weatherDestinations = weatherDestinations.filter((_, i) => i !== index);
	}

	function addQRCode() {
		if (qrCodes.length >= 6) return;
		qrCodes = [...qrCodes, { label: '', url: '' }];
	}

	function removeQRCode(index: number) {
		qrCodes = qrCodes.filter((_, i) => i !== index);
	}

	async function handleSave() {
		saving = true;
		saved = false;
		errorMsg = '';

		const aliases = aliasesText
			.split(',')
			.map((a) => a.trim())
			.filter(Boolean);

		const qr = qrCodes.filter((q) => q.label && q.url);

		try {
			const resp = await fetch('/api/admin/settings', {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					theme,
					slideshowSpeedSeconds: speed,
					language,
					resortAliases: aliases,
					enabledModules,
					weatherDestinations,
					qrCodes: qr
				})
			});

			if (!resp.ok) {
				const data = await resp.json().catch(() => ({ message: 'Save failed' }));
				throw new Error(data.message ?? `HTTP ${resp.status}`);
			}

			saved = true;
			savedSnapshot = currentSnapshot();
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
	<button class="btn-primary" class:has-changes={isDirty} onclick={handleSave} disabled={saving}>
		{saving ? 'Saving...' : 'Save Changes'}
		{#if isDirty}<span class="unsaved-dot"></span>{/if}
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
			<p class="hint">Toggle modules on/off. Drag enabled modules to reorder their slideshow sequence.</p>

			<div class="module-checkboxes">
				{#each Object.entries(allModules) as [value, label]}
					<label class="toggle">
						<input
							type="checkbox"
							checked={enabledModules.includes(value)}
							onchange={() => toggleModule(value)}
						/>
						<span>{label}</span>
					</label>
				{/each}
			</div>

			{#if enabledModules.length > 1}
				<div class="module-order">
					<span class="order-label">Slideshow order:</span>
					<div class="order-list" role="list">
						{#each enabledModules as mod, i}
							<div
								class="order-item"
								class:dragging={dragIndex === i}
								class:drop-above={dragOverIndex === i && dragIndex !== null && dragIndex > i}
								class:drop-below={dragOverIndex === i && dragIndex !== null && dragIndex < i}
								role="listitem"
								draggable="true"
								ondragstart={() => handleDragStart(i)}
								ondragover={(e) => handleDragOver(e, i)}
								ondragleave={handleDragLeave}
								ondrop={() => handleDrop(i)}
								ondragend={handleDragEnd}
							>
								<span class="drag-handle">⠿</span>
								<span>{allModules[mod] ?? mod}</span>
							</div>
						{/each}
					</div>
				</div>
			{/if}
		</section>

		<section class="settings-section">
			<h2>Ski Resort Data Source</h2>
			<label class="field">
				<span>Resort aliases (comma-separated)</span>
				<input type="text" bind:value={aliasesText} placeholder="medvedin, svpetr" />
			</label>
			<p class="hint">
				These are the resort identifiers used by the Holidayinfo provider to fetch weather, lifts,
				slopes, and webcam data.
			</p>
		</section>

		<section class="settings-section">
			<h2>General Weather Destinations</h2>
			<p class="hint">Search for cities to show current weather conditions on the display. Max 5.</p>

			{#each weatherDestinations as dest, i}
				<div class="dest-chip">
					<span>{dest.name}</span>
					<span class="dest-coords">({dest.lat}, {dest.lon})</span>
					<button class="btn-remove" onclick={() => removeWeatherDest(i)} aria-label="Remove">&#x2715;</button>
				</div>
			{/each}

			{#if weatherDestinations.length < 5}
				<div class="city-search">
					<input
						type="text"
						bind:value={cityQuery}
						oninput={handleCityInput}
						placeholder="Search city name..."
						class="city-input"
					/>
					{#if searchingCity}
						<div class="search-status">Searching...</div>
					{/if}
					{#if cityResults.length > 0}
						<div class="search-results">
							{#each cityResults as city}
								<button class="search-result" onclick={() => selectCity(city)}>
									<span class="result-name">{city.name}</span>
									{#if city.state}<span class="result-detail">{city.state},</span>{/if}
									<span class="result-detail">{city.country}</span>
									<span class="result-coords">({city.lat}, {city.lon})</span>
								</button>
							{/each}
						</div>
					{/if}
				</div>
			{/if}
		</section>

		<section class="settings-section">
			<h2>QR Codes</h2>
			<p class="hint">Add QR codes that will be displayed on TV screens. Guests can scan with their phone. Max 6.</p>
			{#each qrCodes as qr, i}
				<div class="dest-row">
					<input type="text" bind:value={qr.label} placeholder="Label (e.g. Wi-Fi Login)" class="dest-name" />
					<input type="text" bind:value={qr.url} placeholder="https://..." class="qr-url" />
					<button class="btn-remove" onclick={() => removeQRCode(i)} aria-label="Remove">&#x2715;</button>
				</div>
			{/each}
			{#if qrCodes.length < 6}
				<button class="btn-add" onclick={addQRCode}>+ Add QR code</button>
			{/if}
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

	h1 { font-size: 1.8rem; margin: 0; }

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

	.btn-primary:hover:not(:disabled) { background: #2563eb; }
	.btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }

	.btn-primary.has-changes {
		position: relative;
		animation: pulse-glow 2s ease-in-out infinite;
	}

	.unsaved-dot {
		position: absolute;
		top: -4px;
		right: -4px;
		width: 10px;
		height: 10px;
		background: #f59e0b;
		border-radius: 50%;
		border: 2px solid #0f172a;
	}

	@keyframes pulse-glow {
		0%, 100% { box-shadow: none; }
		50% { box-shadow: 0 0 12px rgba(59, 130, 246, 0.5); }
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

	input:focus, select:focus { outline: none; border-color: #3b82f6; }

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

	/* Module checkboxes */
	.module-checkboxes {
		display: flex;
		flex-wrap: wrap;
		gap: 12px;
		margin-bottom: 16px;
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
	}

	.toggle input {
		accent-color: #3b82f6;
		width: 16px;
		height: 16px;
	}

	/* Drag & drop module ordering */
	.module-order {
		border-top: 1px solid #334155;
		padding-top: 16px;
	}

	.order-label {
		display: block;
		color: #94a3b8;
		font-size: 0.85rem;
		margin-bottom: 8px;
	}

	.order-list {
		display: flex;
		flex-direction: column;
		gap: 4px;
	}

	.order-item {
		display: flex;
		align-items: center;
		gap: 10px;
		padding: 10px 14px;
		background: #0f172a;
		border: 2px solid transparent;
		border-radius: 8px;
		font-size: 0.9rem;
		cursor: grab;
		transition: background 0.15s, border-color 0.15s, transform 0.15s;
		user-select: none;
	}

	.order-item:active { cursor: grabbing; }

	.order-item.dragging {
		opacity: 0.4;
	}

	.order-item.drop-above {
		border-top-color: #3b82f6;
		transform: translateY(2px);
	}

	.order-item.drop-below {
		border-bottom-color: #3b82f6;
		transform: translateY(-2px);
	}

	.drag-handle {
		color: #64748b;
		font-size: 1.1rem;
		line-height: 1;
	}

	.hint {
		color: #64748b;
		font-size: 0.8rem;
		margin: 0 0 12px;
	}

	/* Weather city search */
	.dest-chip {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		padding: 8px 12px;
		background: #0f172a;
		border: 1px solid #334155;
		border-radius: 8px;
		margin: 0 8px 8px 0;
		font-size: 0.9rem;
	}

	.dest-coords {
		color: #64748b;
		font-size: 0.8rem;
	}

	.city-search {
		position: relative;
		margin-top: 8px;
	}

	.city-input {
		max-width: 400px !important;
	}

	.search-status {
		color: #64748b;
		font-size: 0.8rem;
		margin-top: 4px;
	}

	.search-results {
		position: absolute;
		top: 100%;
		left: 0;
		width: 400px;
		background: #1e293b;
		border: 1px solid #334155;
		border-radius: 8px;
		margin-top: 4px;
		overflow: hidden;
		z-index: 10;
		box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
	}

	.search-result {
		display: flex;
		align-items: center;
		gap: 6px;
		width: 100%;
		padding: 10px 14px;
		background: none;
		border: none;
		border-top: 1px solid #334155;
		color: #f1f5f9;
		font-size: 0.9rem;
		cursor: pointer;
		text-align: left;
	}

	.search-result:first-child { border-top: none; }
	.search-result:hover { background: #334155; }

	.result-name { font-weight: 600; }
	.result-detail { color: #94a3b8; }
	.result-coords { color: #64748b; font-size: 0.8rem; margin-left: auto; }

	/* QR code rows */
	.dest-row {
		display: flex;
		gap: 8px;
		margin-bottom: 8px;
		align-items: center;
	}

	.dest-name {
		max-width: 180px !important;
	}

	.qr-url {
		max-width: 300px !important;
	}

	.btn-remove {
		background: none;
		border: none;
		color: #ef4444;
		font-size: 1rem;
		cursor: pointer;
		padding: 4px 8px;
	}

	.btn-remove:hover { color: #fca5a5; }

	.btn-add {
		background: none;
		border: 1px dashed #334155;
		color: #94a3b8;
		padding: 8px 16px;
		border-radius: 8px;
		font-size: 0.85rem;
		cursor: pointer;
		margin-top: 4px;
	}

	.btn-add:hover {
		border-color: #3b82f6;
		color: #f1f5f9;
	}

	.empty {
		text-align: center;
		color: #94a3b8;
		padding: 60px 20px;
	}
</style>
