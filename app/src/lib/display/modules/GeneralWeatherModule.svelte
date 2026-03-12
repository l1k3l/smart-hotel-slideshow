<script lang="ts">
	interface WeatherDestination {
		name: string;
		temp: number;
		feelsLike: number;
		description: string;
		icon: string;
		humidity: number;
		windSpeed: number;
	}

	let { destinations }: { destinations: WeatherDestination[] } = $props();

	function weatherEmoji(icon: string): string {
		if (icon.startsWith('01')) return '☀️';
		if (icon.startsWith('02')) return '🌤️';
		if (icon.startsWith('03')) return '⛅';
		if (icon.startsWith('04')) return '☁️';
		if (icon.startsWith('09')) return '🌧️';
		if (icon.startsWith('10')) return '🌦️';
		if (icon.startsWith('11')) return '⛈️';
		if (icon.startsWith('13')) return '🌨️';
		if (icon.startsWith('50')) return '🌫️';
		return '🌡️';
	}
</script>

<section class="module general-weather-module">
	<h2>Weather</h2>
	<div class="weather-grid">
		{#each destinations as dest}
			<div class="weather-card">
				<div class="weather-header">
					<span class="weather-emoji">{weatherEmoji(dest.icon)}</span>
					<div>
						<h3>{dest.name}</h3>
						<span class="weather-desc">{dest.description}</span>
					</div>
				</div>
				<div class="weather-details">
					<div class="stat">
						<span class="stat-value">{Math.round(dest.temp)}°C</span>
						<span class="stat-label">Temperature</span>
					</div>
					<div class="stat">
						<span class="stat-value">{Math.round(dest.feelsLike)}°C</span>
						<span class="stat-label">Feels like</span>
					</div>
					<div class="stat">
						<span class="stat-value">{dest.humidity}%</span>
						<span class="stat-label">Humidity</span>
					</div>
					<div class="stat">
						<span class="stat-value">{Math.round(dest.windSpeed)} m/s</span>
						<span class="stat-label">Wind</span>
					</div>
				</div>
			</div>
		{/each}
	</div>
</section>

<style>
	.weather-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
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

	.weather-emoji {
		font-size: 2.5rem;
	}

	.weather-header h3 {
		margin: 0 0 2px;
		font-size: 1.1rem;
		color: var(--text);
	}

	.weather-desc {
		font-size: 0.85rem;
		color: var(--text-muted);
		text-transform: capitalize;
	}

	.weather-details {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 12px;
	}

	.stat {
		display: flex;
		flex-direction: column;
	}

	.stat-value {
		font-size: 1.3rem;
		font-weight: 600;
		color: var(--text);
	}

	.stat-label {
		font-size: 0.8rem;
		color: var(--text-muted);
	}

	h2 {
		font-size: 1.4rem;
		margin: 0 0 16px;
		color: var(--text);
		border-bottom: 1px solid var(--border);
		padding-bottom: 8px;
	}
</style>
