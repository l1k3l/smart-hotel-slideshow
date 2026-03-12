<script lang="ts">
	interface ServiceItem {
		name: string;
		category: string;
		description: string;
		hours: string;
		imageUrl: string | null;
	}

	let { services }: { services: ServiceItem[] } = $props();

	const categoryIcons: Record<string, string> = {
		restaurant: '🍽️',
		spa: '🧖',
		pool: '🏊',
		gym: '💪',
		bar: '🍸',
		reception: '🛎️',
		parking: '🅿️',
		laundry: '👔',
		other: '📌'
	};

	function icon(category: string): string {
		return categoryIcons[category] ?? categoryIcons.other;
	}
</script>

<section class="module services-module">
	<h2>Hotel Services</h2>
	<div class="services-grid">
		{#each services as svc}
			<div class="service-card">
				{#if svc.imageUrl}
					<div class="service-image" style="background-image: url({svc.imageUrl})"></div>
				{/if}
				<div class="service-body">
					<div class="service-header">
						<span class="service-icon">{icon(svc.category)}</span>
						<h3>{svc.name}</h3>
					</div>
					{#if svc.hours}
						<div class="service-hours">{svc.hours}</div>
					{/if}
					{#if svc.description}
						<p class="service-desc">{svc.description}</p>
					{/if}
				</div>
			</div>
		{/each}
	</div>
</section>

<style>
	.services-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
		gap: 16px;
	}

	.service-card {
		background: var(--surface);
		border-radius: 12px;
		overflow: hidden;
	}

	.service-image {
		height: 140px;
		background-size: cover;
		background-position: center;
	}

	.service-body {
		padding: 16px 20px;
	}

	.service-header {
		display: flex;
		align-items: center;
		gap: 10px;
		margin-bottom: 8px;
	}

	.service-icon {
		font-size: 1.8rem;
	}

	.service-header h3 {
		margin: 0;
		font-size: 1.1rem;
		color: var(--text);
	}

	.service-hours {
		font-size: 0.95rem;
		color: var(--accent, #3b82f6);
		font-weight: 600;
		margin-bottom: 6px;
	}

	.service-desc {
		margin: 0;
		font-size: 0.9rem;
		color: var(--text-muted);
		line-height: 1.4;
	}

	h2 {
		font-size: 1.4rem;
		margin: 0 0 16px;
		color: var(--text);
		border-bottom: 1px solid var(--border);
		padding-bottom: 8px;
	}
</style>
