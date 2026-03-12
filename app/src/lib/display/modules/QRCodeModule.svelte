<script lang="ts">
	import { onMount } from 'svelte';

	interface QRItem {
		label: string;
		url: string;
	}

	let { qrCodes }: { qrCodes: QRItem[] } = $props();
	let canvases: Record<string, HTMLCanvasElement> = {};

	onMount(async () => {
		// Dynamic import to avoid SSR issues
		const QRCode = (await import('qrcode')).default;
		for (let i = 0; i < qrCodes.length; i++) {
			const canvas = canvases[i];
			if (canvas) {
				await QRCode.toCanvas(canvas, qrCodes[i].url, {
					width: 200,
					margin: 2,
					color: { dark: '#000000', light: '#ffffff' }
				});
			}
		}
	});
</script>

<section class="module qr-module">
	<h2>Useful Links</h2>
	<div class="qr-grid">
		{#each qrCodes as qr, i}
			<div class="qr-card">
				<canvas bind:this={canvases[i]} class="qr-canvas"></canvas>
				<span class="qr-label">{qr.label}</span>
			</div>
		{/each}
	</div>
</section>

<style>
	.qr-grid {
		display: flex;
		justify-content: center;
		gap: 40px;
		flex-wrap: wrap;
	}

	.qr-card {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 12px;
	}

	.qr-canvas {
		border-radius: 12px;
	}

	.qr-label {
		font-size: 1rem;
		font-weight: 600;
		color: var(--text);
		text-align: center;
	}

	h2 {
		font-size: 1.4rem;
		margin: 0 0 16px;
		color: var(--text);
		border-bottom: 1px solid var(--border);
		padding-bottom: 8px;
	}
</style>
