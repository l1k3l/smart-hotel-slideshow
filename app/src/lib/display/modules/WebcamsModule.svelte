<script lang="ts">
	import type { Webcam } from '$lib/types';

	let { webcams }: { webcams: Webcam[] } = $props();

	function bestVideo(cam: Webcam): string | null {
		// Prefer the full-size MP4
		const full = cam.videoFiles.find((v) => v.size.includes('full'));
		if (full) return full.url;
		// Fall back to any video file
		if (cam.videoFiles.length > 0) return cam.videoFiles[0].url;
		return cam.videoUrl;
	}
</script>

<section class="module webcams-module">
	<h2>Webcams</h2>
	<div class="webcam-grid">
		{#each webcams as cam}
			{@const video = bestVideo(cam)}
			<div class="webcam-card">
				<div class="webcam-header">
					<h3>{cam.name}</h3>
					<span class="cam-meta">
						{cam.altitude ? `${cam.altitude} m` : ''}
						{cam.temperature != null ? ` · ${cam.temperature}°C` : ''}
					</span>
				</div>
				<div class="webcam-media">
					{#if video}
						<!-- svelte-ignore a11y_media_has_caption -->
						<video
							src={video}
							autoplay
							loop
							muted
							playsinline
							poster={cam.imageUrl || undefined}
						></video>
					{:else if cam.imageUrl}
						<img src={cam.imageUrl} alt={cam.name} />
					{/if}
				</div>
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

	.webcam-media {
		position: relative;
		background: #000;
	}

	.webcam-card video,
	.webcam-card img {
		width: 100%;
		display: block;
	}
</style>
