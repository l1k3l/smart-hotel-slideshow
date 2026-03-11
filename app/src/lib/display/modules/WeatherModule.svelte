<script lang="ts">
	import type { WeatherData } from '$lib/types';
	import { weatherIcon, statusColor } from '../helpers';

	let { weather }: { weather: WeatherData[] } = $props();
</script>

<section class="module weather-module">
	<h2>Weather & Conditions</h2>
	<div class="weather-grid">
		{#each weather as w}
			<div class="weather-card">
				<div class="weather-header">
					<span class="weather-icon">{weatherIcon(w.weatherCode)}</span>
					<div>
						<h3>{w.location}</h3>
						<span class="badge" style="background: {statusColor(w.operationStatus)}"
							>{w.operationStatus}</span
						>
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

<style>
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

	.badge {
		display: inline-block;
		padding: 2px 10px;
		border-radius: 12px;
		font-size: 0.8rem;
		font-weight: 600;
		color: #fff;
		text-transform: capitalize;
	}

	h2 {
		font-size: 1.4rem;
		margin: 0 0 16px;
		color: var(--text);
		border-bottom: 1px solid var(--border);
		padding-bottom: 8px;
	}
</style>
