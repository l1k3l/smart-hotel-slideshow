<script lang="ts">
	import { goto } from '$app/navigation';

	let { data } = $props();
	let { supabase } = $derived(data);

	let email = $state('');
	let password = $state('');
	let loading = $state(false);
	let error = $state('');

	async function handleLogin(e: Event) {
		e.preventDefault();
		loading = true;
		error = '';

		const { error: authError } = await supabase.auth.signInWithPassword({
			email,
			password
		});

		if (authError) {
			error = authError.message;
			loading = false;
		} else {
			goto('/admin');
		}
	}
</script>

<svelte:head>
	<title>Admin Login</title>
</svelte:head>

<div class="login-page">
	<form class="login-form" onsubmit={handleLogin}>
		<h1>Hotel Admin</h1>
		<p class="subtitle">Sign in to manage your display</p>

		{#if error}
			<div class="error">{error}</div>
		{/if}

		<label>
			<span>Email</span>
			<input type="email" bind:value={email} required autocomplete="email" />
		</label>

		<label>
			<span>Password</span>
			<input type="password" bind:value={password} required autocomplete="current-password" />
		</label>

		<button type="submit" disabled={loading}>
			{loading ? 'Signing in...' : 'Sign in'}
		</button>
	</form>
</div>

<style>
	.login-page {
		min-height: 100vh;
		display: flex;
		align-items: center;
		justify-content: center;
		background: #0f172a;
		font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
	}

	.login-form {
		width: 100%;
		max-width: 380px;
		padding: 32px;
		background: #1e293b;
		border-radius: 12px;
	}

	h1 {
		color: #f1f5f9;
		font-size: 1.5rem;
		margin: 0 0 4px;
	}

	.subtitle {
		color: #94a3b8;
		font-size: 0.9rem;
		margin: 0 0 24px;
	}

	.error {
		background: #3a1a1a;
		color: #ef4444;
		padding: 10px 14px;
		border-radius: 8px;
		font-size: 0.85rem;
		margin-bottom: 16px;
	}

	label {
		display: block;
		margin-bottom: 16px;
	}

	label span {
		display: block;
		color: #94a3b8;
		font-size: 0.85rem;
		margin-bottom: 6px;
	}

	input {
		width: 100%;
		padding: 10px 12px;
		background: #0f172a;
		border: 1px solid #334155;
		border-radius: 8px;
		color: #f1f5f9;
		font-size: 0.95rem;
		outline: none;
	}

	input:focus {
		border-color: #3b82f6;
	}

	button {
		width: 100%;
		padding: 12px;
		background: #3b82f6;
		color: #fff;
		border: none;
		border-radius: 8px;
		font-size: 0.95rem;
		font-weight: 600;
		cursor: pointer;
		margin-top: 8px;
	}

	button:hover:not(:disabled) {
		background: #2563eb;
	}

	button:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}
</style>
