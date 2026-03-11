<script lang="ts">
	import { page } from '$app/state';
</script>

<svelte:head>
	<title>Error</title>
</svelte:head>

<div class="error-page">
	<h1>{page.status}</h1>
	<p>{page.error?.message ?? 'Something went wrong'}</p>
	<a href="/">Go home</a>
</div>

<style>
	.error-page {
		min-height: 100vh;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		background: #0f172a;
		color: #f1f5f9;
		font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
	}

	h1 {
		font-size: 4rem;
		margin: 0;
		color: #ef4444;
	}

	p {
		color: #94a3b8;
		margin: 8px 0 24px;
		font-size: 1.1rem;
	}

	a {
		color: #3b82f6;
		text-decoration: none;
		font-size: 0.95rem;
	}

	a:hover {
		text-decoration: underline;
	}
</style>
