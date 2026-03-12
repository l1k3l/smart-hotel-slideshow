<script lang="ts">
	interface AnnouncementItem {
		title: string;
		body: string;
		imageUrl: string | null;
		priority: number;
	}

	let { announcements }: { announcements: AnnouncementItem[] } = $props();
</script>

<section class="module announcements-module">
	<h2>Announcements</h2>
	<div class="announcements-list">
		{#each announcements as ann}
			<div class="announcement-card" class:high-priority={ann.priority > 0}>
				{#if ann.imageUrl}
					<div class="ann-image" style="background-image: url({ann.imageUrl})"></div>
				{/if}
				<div class="ann-body">
					<h3>{ann.title}</h3>
					{#if ann.body}
						<p>{ann.body}</p>
					{/if}
				</div>
			</div>
		{/each}
	</div>
</section>

<style>
	.announcements-list {
		display: flex;
		flex-direction: column;
		gap: 16px;
	}

	.announcement-card {
		background: var(--surface);
		border-radius: 12px;
		overflow: hidden;
		display: flex;
		align-items: stretch;
	}

	.announcement-card.high-priority {
		border-left: 4px solid var(--accent, #eab308);
	}

	.ann-image {
		width: 200px;
		min-height: 120px;
		background-size: cover;
		background-position: center;
		flex-shrink: 0;
	}

	.ann-body {
		padding: 20px 24px;
		flex: 1;
	}

	.ann-body h3 {
		margin: 0 0 8px;
		font-size: 1.2rem;
		color: var(--text);
	}

	.ann-body p {
		margin: 0;
		font-size: 1rem;
		color: var(--text-muted);
		line-height: 1.5;
	}

	h2 {
		font-size: 1.4rem;
		margin: 0 0 16px;
		color: var(--text);
		border-bottom: 1px solid var(--border);
		padding-bottom: 8px;
	}
</style>
