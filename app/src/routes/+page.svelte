<script lang="ts">
	import type { ResortData } from '$lib/types';
	import { onMount } from 'svelte';

	let data: ResortData | null = $state(null);
	let error: string | null = $state(null);
	let loading = $state(true);
	let lastRefresh = $state('');

	async function fetchData() {
		try {
			const resp = await fetch('/api/resort-data');
			if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
			data = await resp.json();
			error = null;
			lastRefresh = new Date().toLocaleTimeString();
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to fetch data';
		} finally {
			loading = false;
		}
	}

	onMount(() => {
		fetchData();
		const interval = setInterval(fetchData, 5 * 60 * 1000);
		return () => clearInterval(interval);
	});

	function weatherIcon(code: number | null): string {
		const icons: Record<number, string> = {
			1: '☀️', 2: '🌤️', 3: '⛅', 4: '☁️', 5: '🌧️', 6: '🌨️',
			7: '❄️', 8: '🌫️', 9: '⛈️', 10: '🌬️'
		};
		return code ? icons[code] ?? '🌡️' : '🌡️';
	}

	function statusColor(status: string): string {
		const s = status.toLowerCase();
		if (s === 'open' || s === 'opened') return 'var(--green)';
		if (s === 'closed' || s === 'close') return 'var(--red)';
		return 'var(--yellow)';
	}

	function difficultyColor(code: number): string {
		if (code === 1) return 'var(--blue)';
		if (code === 2) return 'var(--red)';
		if (code === 3) return '#111';
		return 'var(--text-muted)';
	}
</script>

<svelte:head>
	<title>Špindlerův Mlýn - Ski Resort Dashboard</title>
</svelte:head>

<main>
	<header>
		<h1>Špindlerův Mlýn</h1>
		<p class="subtitle">Ski Resort Dashboard</p>
		{#if lastRefresh}
			<p class="refresh">Last updated: {lastRefresh}</p>
		{/if}
	</header>

	{#if loading}
		<div class="loading">Loading resort data...</div>
	{:else if error}
		<div class="error">{error}</div>
	{:else if data}
		<!-- WEATHER SECTION -->
		<section class="weather-section">
			<h2>Weather & Conditions</h2>
			<div class="weather-grid">
				{#each data.weather as w}
					<div class="weather-card">
						<div class="weather-header">
							<span class="weather-icon">{weatherIcon(w.weatherCode)}</span>
							<div>
								<h3>{w.location}</h3>
								<span class="badge" style="background: {statusColor(w.operationStatus)}">{w.operationStatus}</span>
							</div>
						</div>
						<div class="weather-details">
							<div class="stat">
								<span class="stat-value">{w.temp0700 ?? '--'}°C</span>
								<span class="stat-label">Temp (7:00)</span>
							</div>
							<div class="stat">
								<span class="stat-value">{w.snowHeightSlopes ?? '--'} cm</span>
								<span class="stat-label">Snow on slopes</span>
							</div>
							<div class="stat">
								<span class="stat-value">{w.snowNew ?? '--'} cm</span>
								<span class="stat-label">New snow</span>
							</div>
							<div class="stat">
								<span class="stat-value">{w.snowType || '--'}</span>
								<span class="stat-label">Snow type</span>
							</div>
						</div>
						<div class="weather-meta">
							<span>Hours: {w.operatingHours}</span>
							<span>Range: {w.snowHeightMin ?? '?'} – {w.snowHeightMax ?? '?'} cm</span>
						</div>
					</div>
				{/each}
			</div>
		</section>

		<!-- LIFTS SECTION -->
		<section>
			<h2>Lifts</h2>
			<div class="table-wrap">
				<table>
					<thead>
						<tr>
							<th>Name</th>
							<th>Type</th>
							<th>Status</th>
							<th>Capacity</th>
						</tr>
					</thead>
					<tbody>
						{#each data.lifts as lift}
							<tr>
								<td>{lift.name}</td>
								<td>{lift.type}</td>
								<td>
									<span class="badge" style="background: {statusColor(lift.status)}">{lift.status}</span>
								</td>
								<td>{lift.capacity ?? '--'} pers/h</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</section>

		<!-- SLOPES SECTION -->
		<section>
			<h2>Slopes</h2>
			<div class="table-wrap">
				<table>
					<thead>
						<tr>
							<th>Name</th>
							<th>Difficulty</th>
							<th>Status</th>
							<th>Length</th>
							<th>Elevation</th>
						</tr>
					</thead>
					<tbody>
						{#each data.slopes as slope}
							<tr>
								<td>{slope.name}</td>
								<td>
									<span class="difficulty-dot" style="background: {difficultyColor(slope.difficultyCode)}"></span>
									{slope.difficulty}
								</td>
								<td>
									<span class="badge" style="background: {statusColor(slope.status)}">{slope.status}</span>
								</td>
								<td>{slope.length ? `${slope.length} m` : '--'}</td>
								<td>{slope.elevation ? `${slope.elevation} m` : '--'}</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</section>

		<!-- WEBCAMS SECTION -->
		<section>
			<h2>Webcams</h2>
			<div class="webcam-grid">
				{#each data.webcams as cam}
					<div class="webcam-card">
						<div class="webcam-header">
							<h3>{cam.name}</h3>
							<span class="cam-meta">
								{cam.altitude ? `${cam.altitude} m` : ''}
								{cam.temperature != null ? ` · ${cam.temperature}°C` : ''}
							</span>
						</div>
						{#if cam.imageUrl}
							<img src={cam.imageUrl} alt={cam.name} loading="lazy" />
						{/if}
					</div>
				{/each}
			</div>
		</section>

		<footer>
			Data source: <a href="https://www.holidayinfo.cz" target="_blank">holidayinfo.cz</a>, &copy; Sitour CZ
		</footer>
	{/if}
</main>

<style>
	:root {
		--bg: #0f172a;
		--surface: #1e293b;
		--surface-hover: #334155;
		--text: #f1f5f9;
		--text-muted: #94a3b8;
		--blue: #3b82f6;
		--green: #22c55e;
		--red: #ef4444;
		--yellow: #eab308;
		--border: #334155;
	}

	:global(body) {
		margin: 0;
		background: var(--bg);
		color: var(--text);
		font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
	}

	main {
		max-width: 1200px;
		margin: 0 auto;
		padding: 24px;
	}

	header {
		text-align: center;
		margin-bottom: 40px;
	}

	h1 {
		font-size: 2.5rem;
		margin: 0;
		background: linear-gradient(135deg, #60a5fa, #a78bfa);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
	}

	.subtitle {
		color: var(--text-muted);
		margin: 4px 0 0;
		font-size: 1.1rem;
	}

	.refresh {
		color: var(--text-muted);
		font-size: 0.85rem;
		margin-top: 8px;
	}

	h2 {
		font-size: 1.4rem;
		margin: 0 0 16px;
		color: var(--text);
		border-bottom: 1px solid var(--border);
		padding-bottom: 8px;
	}

	section {
		margin-bottom: 40px;
	}

	.loading, .error {
		text-align: center;
		padding: 40px;
		font-size: 1.2rem;
	}

	.error {
		color: var(--red);
	}

	/* Weather */
	.weather-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(340px, 1fr));
		gap: 16px;
	}

	.weather-card {
		background: var(--surface);
		border-radius: 12px;
		padding: 20px;
	}

	.weather-header {
		display: flex;
		align-items: center;
		gap: 12px;
		margin-bottom: 16px;
	}

	.weather-icon {
		font-size: 2.5rem;
	}

	.weather-header h3 {
		margin: 0 0 4px;
		font-size: 1.1rem;
	}

	.weather-details {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 12px;
		margin-bottom: 12px;
	}

	.stat {
		display: flex;
		flex-direction: column;
	}

	.stat-value {
		font-size: 1.3rem;
		font-weight: 600;
	}

	.stat-label {
		font-size: 0.8rem;
		color: var(--text-muted);
	}

	.weather-meta {
		display: flex;
		justify-content: space-between;
		font-size: 0.85rem;
		color: var(--text-muted);
		border-top: 1px solid var(--border);
		padding-top: 10px;
	}

	/* Badge */
	.badge {
		display: inline-block;
		padding: 2px 10px;
		border-radius: 12px;
		font-size: 0.8rem;
		font-weight: 600;
		color: #fff;
		text-transform: capitalize;
	}

	/* Tables */
	.table-wrap {
		overflow-x: auto;
	}

	table {
		width: 100%;
		border-collapse: collapse;
		background: var(--surface);
		border-radius: 12px;
		overflow: hidden;
	}

	th {
		background: var(--surface-hover);
		text-align: left;
		padding: 12px 16px;
		font-size: 0.85rem;
		color: var(--text-muted);
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	td {
		padding: 10px 16px;
		border-top: 1px solid var(--border);
		font-size: 0.95rem;
	}

	tr:hover td {
		background: var(--surface-hover);
	}

	.difficulty-dot {
		display: inline-block;
		width: 10px;
		height: 10px;
		border-radius: 50%;
		margin-right: 6px;
		vertical-align: middle;
	}

	/* Webcams */
	.webcam-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(340px, 1fr));
		gap: 16px;
	}

	.webcam-card {
		background: var(--surface);
		border-radius: 12px;
		overflow: hidden;
	}

	.webcam-header {
		padding: 12px 16px;
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.webcam-header h3 {
		margin: 0;
		font-size: 1rem;
	}

	.cam-meta {
		font-size: 0.85rem;
		color: var(--text-muted);
	}

	.webcam-card img {
		width: 100%;
		display: block;
	}

	/* Footer */
	footer {
		text-align: center;
		color: var(--text-muted);
		font-size: 0.85rem;
		padding: 20px 0;
		border-top: 1px solid var(--border);
	}

	footer a {
		color: var(--blue);
	}
</style>
