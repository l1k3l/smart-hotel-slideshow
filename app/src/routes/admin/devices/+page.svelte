<script lang="ts">
	import { invalidateAll } from '$app/navigation';

	let { data } = $props();

	let generating = $state(false);
	let newToken = $state('');
	let errorMessage = $state('');
	let expandedId = $state('');
	let editingName = $state('');

	const BANNER_DURATION = 10_000;
	let bannerVisible = $state(false);
	let bannerTimer: ReturnType<typeof setTimeout> | null = null;

	const onlineThreshold = 2 * 60 * 1000;

	function isOnline(lastSeenAt: Date | null): boolean {
		if (!lastSeenAt) return false;
		return Date.now() - lastSeenAt.getTime() < onlineThreshold;
	}

	function displayUrl(token: string): string {
		return `${data.origin}/display/${token}`;
	}

	function showBanner() {
		if (bannerTimer) clearTimeout(bannerTimer);
		bannerVisible = true;
		bannerTimer = setTimeout(() => {
			bannerVisible = false;
			bannerTimer = null;
		}, BANNER_DURATION);
	}

	function dismissBanner() {
		if (bannerTimer) clearTimeout(bannerTimer);
		bannerVisible = false;
		bannerTimer = null;
	}

	async function generateToken() {
		generating = true;
		newToken = '';
		errorMessage = '';
		try {
			const resp = await fetch('/api/admin/tokens/generate', { method: 'POST' });
			if (!resp.ok) {
				const body = await resp.json().catch(() => null);
				errorMessage = body?.message ?? 'Failed to generate token';
				return;
			}
			const result = await resp.json();
			newToken = result.token;
			showBanner();
			await invalidateAll();
		} finally {
			generating = false;
		}
	}

	async function toggleActive(id: string, currentlyActive: boolean) {
		await fetch(`/api/admin/devices/${id}`, {
			method: 'PATCH',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ isActive: !currentlyActive })
		});
		await invalidateAll();
	}

	async function unlinkDevice(id: string) {
		await fetch(`/api/admin/devices/${id}/unlink`, { method: 'POST' });
		await invalidateAll();
	}

	async function deleteDevice(id: string) {
		if (!confirm('Delete this device and its token?')) return;
		await fetch(`/api/admin/devices/${id}`, { method: 'DELETE' });
		if (expandedId === id) expandedId = '';
		await invalidateAll();
	}

	function toggleExpand(id: string, currentName: string) {
		if (expandedId === id) {
			expandedId = '';
		} else {
			expandedId = id;
			editingName = currentName;
		}
	}

	async function saveRename(id: string) {
		await fetch(`/api/admin/devices/${id}`, {
			method: 'PATCH',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ deviceName: editingName })
		});
		expandedId = '';
		await invalidateAll();
	}
</script>

<svelte:head>
	<title>Devices - Admin</title>
</svelte:head>

<div class="header-row">
	<h1>Devices</h1>
	<button class="btn-primary" onclick={generateToken} disabled={generating}>
		{generating ? 'Generating...' : 'Generate Token'}
	</button>
</div>

{#if bannerVisible && newToken}
	<div class="new-token-banner">
		<div class="banner-content">
			<span>New token:</span>
			<code class="token-highlight">{newToken}</code>
			<a href={displayUrl(newToken)} class="url-link" target="_blank">{displayUrl(newToken)}</a>
		</div>
		<div class="banner-right">
			<svg class="countdown-ring" viewBox="0 0 24 24" width="24" height="24">
				<circle class="ring-bg" cx="12" cy="12" r="10" />
				<circle
					class="ring-fg"
					cx="12" cy="12" r="10"
					style="animation-duration: {BANNER_DURATION}ms"
				/>
			</svg>
			<button class="btn-dismiss" onclick={dismissBanner} aria-label="Dismiss">&#x2715;</button>
		</div>
	</div>
{/if}

{#if errorMessage}
	<div class="error-banner">
		{errorMessage}
		<button class="btn-dismiss" onclick={() => (errorMessage = '')} aria-label="Dismiss">&#x2715;</button>
	</div>
{/if}

{#if data.devices.length === 0}
	<div class="empty">No devices yet. Generate a token to get started.</div>
{:else}
	<div class="table-wrap">
		<table>
			<thead>
				<tr>
					<th>Name</th>
					<th>Token</th>
					<th>Status</th>
					<th>Bound</th>
					<th>Last Seen</th>
					<th>Actions</th>
				</tr>
			</thead>
			<tbody>
				{#each data.devices as device}
					<tr class:inactive={!device.isActive}>
						<td>{device.deviceName}</td>
						<td><code class="token">{device.token}</code></td>
						<td>
							{#if !device.isActive}
								<span class="badge badge-inactive">Inactive</span>
							{:else if isOnline(device.lastSeenAt)}
								<span class="badge badge-online">Online</span>
							{:else if device.deviceUuid}
								<span class="badge badge-offline">Offline</span>
							{:else}
								<span class="badge badge-unbound">Unbound</span>
							{/if}
						</td>
						<td>
							{#if device.deviceUuid}
								<span class="bound-id" title={device.deviceUuid}
									>{device.deviceUuid.slice(0, 8)}...</span
								>
							{:else}
								<span class="muted">--</span>
							{/if}
						</td>
						<td>
							{#if device.lastSeenAt}
								{new Date(device.lastSeenAt).toLocaleString()}
							{:else}
								<span class="muted">Never</span>
							{/if}
						</td>
						<td class="actions">
							<button
								class="btn-small"
								onclick={() => toggleExpand(device.id, device.deviceName)}
							>
								Edit
							</button>
							<button
								class="btn-small"
								onclick={() => toggleActive(device.id, device.isActive)}
							>
								{device.isActive ? 'Disable' : 'Enable'}
							</button>
							{#if device.deviceUuid}
								<button class="btn-small" onclick={() => unlinkDevice(device.id)}>
									Unlink
								</button>
							{/if}
							<button class="btn-small btn-danger" onclick={() => deleteDevice(device.id)}>
								Delete
							</button>
						</td>
					</tr>
					{#if expandedId === device.id}
						<tr class="expanded-row">
							<td colspan="6">
								<div class="expand-panel">
									<div class="expand-field">
										<span class="field-label">Device Name</span>
										<form
											class="rename-form"
											onsubmit={(e) => {
												e.preventDefault();
												saveRename(device.id);
											}}
										>
											<input
												type="text"
												bind:value={editingName}
												class="rename-input"
												aria-label="Device name"
											/>
											<button type="submit" class="btn-small btn-save">Save</button>
										</form>
									</div>
									<div class="expand-field">
										<span class="field-label">Display URL</span>
										<a href={displayUrl(device.token)} class="url-link" target="_blank">
											{displayUrl(device.token)}
										</a>
									</div>
								</div>
							</td>
						</tr>
					{/if}
				{/each}
			</tbody>
		</table>
	</div>
{/if}

<style>
	.header-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 24px;
	}

	h1 {
		font-size: 1.8rem;
		margin: 0;
	}

	.btn-primary {
		padding: 10px 20px;
		background: #3b82f6;
		color: #fff;
		border: none;
		border-radius: 8px;
		font-size: 0.9rem;
		font-weight: 600;
		cursor: pointer;
	}

	.btn-primary:hover:not(:disabled) {
		background: #2563eb;
	}

	.btn-primary:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	/* Error banner */
	.error-banner {
		background: #3a1a1a;
		border: 1px solid #ef4444;
		border-radius: 8px;
		padding: 14px 20px;
		margin-bottom: 24px;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
		color: #fca5a5;
		font-size: 0.9rem;
		animation: fadeIn 0.3s ease;
	}

	/* Token banner with countdown */
	.new-token-banner {
		background: #1a3a2a;
		border: 1px solid #22c55e;
		border-radius: 8px;
		padding: 14px 20px;
		margin-bottom: 24px;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
		animation: fadeIn 0.3s ease;
	}

	.banner-content {
		display: flex;
		align-items: center;
		gap: 12px;
		flex-wrap: wrap;
		min-width: 0;
	}

	.token-highlight {
		font-size: 1.2rem;
		font-weight: 700;
		color: #22c55e;
	}

	.banner-right {
		display: flex;
		align-items: center;
		gap: 8px;
		flex-shrink: 0;
	}

	.btn-dismiss {
		background: none;
		border: none;
		color: #94a3b8;
		font-size: 1rem;
		cursor: pointer;
		padding: 4px;
		line-height: 1;
	}

	.btn-dismiss:hover {
		color: #f1f5f9;
	}

	/* Countdown ring */
	.countdown-ring {
		transform: rotate(-90deg);
	}

	.ring-bg {
		fill: none;
		stroke: #334155;
		stroke-width: 2;
	}

	.ring-fg {
		fill: none;
		stroke: #22c55e;
		stroke-width: 2;
		stroke-dasharray: 62.83; /* 2 * PI * 10 */
		stroke-dashoffset: 0;
		stroke-linecap: round;
		animation: countdown-stroke linear forwards;
	}

	@keyframes countdown-stroke {
		from {
			stroke-dashoffset: 0;
		}
		to {
			stroke-dashoffset: 62.83;
		}
	}

	@keyframes fadeIn {
		from { opacity: 0; transform: translateY(-8px); }
		to { opacity: 1; transform: translateY(0); }
	}

	/* URL link */
	.url-link {
		color: #60a5fa;
		font-size: 0.85rem;
		text-decoration: none;
		word-break: break-all;
	}

	.url-link:hover {
		text-decoration: underline;
	}

	.empty {
		text-align: center;
		color: #94a3b8;
		padding: 60px 20px;
		font-size: 1rem;
	}

	.table-wrap {
		overflow-x: auto;
	}

	table {
		width: 100%;
		border-collapse: collapse;
		background: #1e293b;
		border-radius: 12px;
		overflow: hidden;
	}

	th {
		background: #334155;
		text-align: left;
		padding: 12px 16px;
		font-size: 0.8rem;
		color: #94a3b8;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	td {
		padding: 12px 16px;
		border-top: 1px solid #334155;
		font-size: 0.9rem;
	}

	tr.inactive td {
		opacity: 0.5;
	}

	.token {
		font-size: 0.85rem;
		background: #0f172a;
		padding: 2px 8px;
		border-radius: 4px;
	}

	.badge {
		display: inline-block;
		padding: 2px 10px;
		border-radius: 12px;
		font-size: 0.75rem;
		font-weight: 600;
	}

	.badge-online {
		background: #22c55e;
		color: #fff;
	}

	.badge-offline {
		background: #6b7280;
		color: #fff;
	}

	.badge-unbound {
		background: #eab308;
		color: #000;
	}

	.badge-inactive {
		background: #ef4444;
		color: #fff;
	}

	.bound-id {
		font-family: monospace;
		font-size: 0.8rem;
		color: #94a3b8;
	}

	.muted {
		color: #64748b;
	}

	.actions {
		display: flex;
		gap: 6px;
		flex-wrap: wrap;
	}

	.btn-small {
		padding: 4px 10px;
		border: 1px solid #334155;
		background: #1e293b;
		color: #f1f5f9;
		border-radius: 6px;
		font-size: 0.8rem;
		cursor: pointer;
	}

	.btn-small:hover {
		background: #334155;
	}

	.btn-save {
		border-color: #22c55e;
		color: #22c55e;
	}

	.btn-save:hover {
		background: #1a3a2a;
	}

	.btn-danger {
		border-color: #7f1d1d;
		color: #ef4444;
	}

	.btn-danger:hover {
		background: #7f1d1d;
		color: #fff;
	}

	/* Expanded edit row */
	.expanded-row td {
		background: #162032;
		border-top: 1px dashed #334155;
		padding: 16px 20px;
	}

	.expand-panel {
		display: flex;
		flex-direction: column;
		gap: 14px;
	}

	.expand-field {
		display: flex;
		flex-direction: column;
		gap: 4px;
	}

	.expand-field .field-label {
		font-size: 0.75rem;
		color: #94a3b8;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.rename-form {
		display: flex;
		gap: 8px;
		align-items: center;
	}

	.rename-input {
		padding: 6px 10px;
		background: #0f172a;
		border: 1px solid #334155;
		border-radius: 6px;
		color: #f1f5f9;
		font-size: 0.9rem;
		width: 240px;
	}

	.rename-input:focus {
		outline: none;
		border-color: #3b82f6;
	}
</style>
