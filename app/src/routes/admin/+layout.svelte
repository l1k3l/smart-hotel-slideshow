<script lang="ts">
	import { page } from '$app/state';
	import { goto } from '$app/navigation';

	let { data, children } = $props();
	let { supabase } = $derived(data);

	// Don't show admin shell on login page
	let isLoginPage = $derived(page.url.pathname === '/admin/login');

	async function handleLogout() {
		await supabase.auth.signOut();
		goto('/admin/login');
	}

	const navItems = [
		{ href: '/admin', label: 'Dashboard' },
		{ href: '/admin/devices', label: 'Devices' },
		{ href: '/admin/services', label: 'Services' },
		{ href: '/admin/announcements', label: 'Announcements' },
		{ href: '/admin/settings', label: 'Settings' },
		{ href: '/admin/preview', label: 'Preview' }
	];
</script>

{#if isLoginPage}
	{@render children()}
{:else}
	<div class="admin-layout">
		<nav class="sidebar">
			<div class="sidebar-header">
				<h2>Hotel Admin</h2>
			</div>
			<ul class="nav-list">
				{#each navItems as item}
					<li>
						<a href={item.href} class:active={page.url.pathname === item.href}>
							{item.label}
						</a>
					</li>
				{/each}
			</ul>
			<div class="sidebar-footer">
				<button class="logout-btn" onclick={handleLogout}>Sign out</button>
			</div>
		</nav>
		<main class="admin-content">
			{@render children()}
		</main>
	</div>
{/if}

<style>
	:global(body) {
		margin: 0;
		background: #0f172a;
		color: #f1f5f9;
		font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
	}

	.admin-layout {
		display: flex;
		height: 100vh;
		overflow: hidden;
	}

	.sidebar {
		width: 220px;
		background: #1e293b;
		display: flex;
		flex-direction: column;
		flex-shrink: 0;
		border-right: 1px solid #334155;
		overflow-y: auto;
	}

	.sidebar-header {
		padding: 20px;
		border-bottom: 1px solid #334155;
	}

	.sidebar-header h2 {
		margin: 0;
		font-size: 1.1rem;
		background: linear-gradient(135deg, #60a5fa, #a78bfa);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
	}

	.nav-list {
		list-style: none;
		padding: 12px 0;
		margin: 0;
		flex: 1;
	}

	.nav-list li a {
		display: block;
		padding: 10px 20px;
		color: #94a3b8;
		text-decoration: none;
		font-size: 0.9rem;
		transition: all 0.15s;
	}

	.nav-list li a:hover {
		color: #f1f5f9;
		background: #334155;
	}

	.nav-list li a.active {
		color: #f1f5f9;
		background: #334155;
		border-right: 2px solid #3b82f6;
	}

	.sidebar-footer {
		padding: 16px 20px;
		border-top: 1px solid #334155;
	}

	.logout-btn {
		background: none;
		border: none;
		color: #94a3b8;
		font-size: 0.85rem;
		cursor: pointer;
		padding: 0;
	}

	.logout-btn:hover {
		color: #ef4444;
	}

	.admin-content {
		flex: 1;
		padding: 32px;
		overflow-y: auto;
	}
</style>
