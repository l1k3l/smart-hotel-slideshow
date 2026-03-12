<script lang="ts">
	import DisplayShell from '$lib/display/DisplayShell.svelte';

	let { data } = $props();
</script>

<svelte:head>
	<title>Preview - Admin</title>
</svelte:head>

<h1>Display Preview</h1>
<p class="hint">This is a scaled preview of what the TV display looks like.</p>

{#if data.config}
	<div class="preview-container">
		<div class="preview-frame">
			<DisplayShell config={data.config} />
		</div>
	</div>
{:else}
	<div class="empty">No configuration found. Set up your hotel settings first.</div>
{/if}

<style>
	h1 {
		font-size: 1.8rem;
		margin: 0 0 4px;
	}

	.hint {
		color: #94a3b8;
		font-size: 0.9rem;
		margin: 0 0 24px;
	}

	.preview-container {
		background: #000;
		border-radius: 12px;
		padding: 16px;
		overflow: hidden;
	}

	.preview-frame {
		width: 1920px;
		height: 1080px;
		transform-origin: top left;
		transform: scale(0.5);
		margin-bottom: -540px;
		margin-right: -960px;
		border-radius: 8px;
		overflow: hidden;
		position: relative;
	}

	.empty {
		text-align: center;
		color: #94a3b8;
		padding: 60px 20px;
	}
</style>
