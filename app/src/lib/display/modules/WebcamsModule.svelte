<script lang="ts">
	import type { Webcam } from '$lib/types';

	let { webcams }: { webcams: Webcam[] } = $props();
</script>

<section class="module webcams-module">
	<h2>Webcams</h2>
	<div class="webcam-grid">
		{#each webcams as cam}
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

<style>
	h2 {
		font-size: 1.4rem;
		margin: 0 0 16px;
		color: var(--text);
		border-bottom: 1px solid var(--border);
		padding-bottom: 8px;
	}

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
</style>
