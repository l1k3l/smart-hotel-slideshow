<script lang="ts">
	let { data } = $props();
</script>

<svelte:head>
	<title>Dashboard - Admin</title>
</svelte:head>

<h1>Dashboard</h1>

{#if data.hotel}
	<p class="hotel-name">{data.hotel.name}</p>
{/if}

{#if data.stats}
	<div class="stats-grid">
		<div class="stat-card">
			<span class="stat-value">{data.stats.totalDevices}</span>
			<span class="stat-label">Total Devices</span>
		</div>
		<div class="stat-card">
			<span class="stat-value">{data.stats.activeDevices}</span>
			<span class="stat-label">Active</span>
		</div>
		<div class="stat-card">
			<span class="stat-value online">{data.stats.onlineDevices}</span>
			<span class="stat-label">Online Now</span>
		</div>
		<div class="stat-card">
			<span class="stat-value">{data.stats.boundDevices}</span>
			<span class="stat-label">Bound</span>
		</div>
	</div>

	{#if data.settings}
		<div class="info-section">
			<h2>Current Configuration</h2>
			<div class="info-row">
				<span class="info-label">Theme</span>
				<span class="info-value">{data.settings.theme}</span>
			</div>
			<div class="info-row">
				<span class="info-label">Modules</span>
				<span class="info-value">{data.settings.enabledModules.join(', ')}</span>
			</div>
		</div>
	{/if}
{/if}

<style>
	h1 {
		font-size: 1.8rem;
		margin: 0 0 8px;
	}

	.hotel-name {
		color: #94a3b8;
		margin: 0 0 32px;
		font-size: 1rem;
	}

	.stats-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
		gap: 16px;
		margin-bottom: 40px;
	}

	.stat-card {
		background: #1e293b;
		border-radius: 12px;
		padding: 20px;
		display: flex;
		flex-direction: column;
	}

	.stat-value {
		font-size: 2rem;
		font-weight: 700;
		color: #f1f5f9;
	}

	.stat-value.online {
		color: #22c55e;
	}

	.stat-label {
		font-size: 0.85rem;
		color: #94a3b8;
		margin-top: 4px;
	}

	.info-section {
		background: #1e293b;
		border-radius: 12px;
		padding: 20px;
	}

	.info-section h2 {
		font-size: 1.1rem;
		margin: 0 0 16px;
		color: #f1f5f9;
	}

	.info-row {
		display: flex;
		justify-content: space-between;
		padding: 8px 0;
		border-bottom: 1px solid #334155;
	}

	.info-row:last-child {
		border-bottom: none;
	}

	.info-label {
		color: #94a3b8;
		font-size: 0.9rem;
	}

	.info-value {
		color: #f1f5f9;
		font-size: 0.9rem;
	}
</style>
