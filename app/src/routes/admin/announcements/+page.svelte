<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import ImageUpload from '$lib/components/ImageUpload.svelte';

	let { data } = $props();

	let showForm = $state(false);
	let editingId = $state('');
	let formTitle = $state('');
	let formBody = $state('');
	let formImageUrl = $state('');
	let formShowFrom = $state('');
	let formShowUntil = $state('');
	let formPriority = $state(0);

	function resetForm() {
		showForm = false;
		editingId = '';
		formTitle = '';
		formBody = '';
		formImageUrl = '';
		formShowFrom = '';
		formShowUntil = '';
		formPriority = 0;
	}

	function startEdit(ann: typeof data.announcements[0]) {
		editingId = ann.id;
		formTitle = ann.title;
		formBody = ann.body;
		formImageUrl = ann.imageUrl ?? '';
		formShowFrom = ann.showFrom ? new Date(ann.showFrom).toISOString().slice(0, 16) : '';
		formShowUntil = ann.showUntil ? new Date(ann.showUntil).toISOString().slice(0, 16) : '';
		formPriority = ann.priority;
		showForm = true;
	}

	async function handleSubmit() {
		const payload = {
			title: formTitle,
			body: formBody,
			imageUrl: formImageUrl || null,
			showFrom: formShowFrom || null,
			showUntil: formShowUntil || null,
			priority: formPriority
		};

		if (editingId) {
			await fetch(`/api/admin/announcements/${editingId}`, {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(payload)
			});
		} else {
			await fetch('/api/admin/announcements', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(payload)
			});
		}

		resetForm();
		await invalidateAll();
	}

	async function toggleActive(id: string, isActive: boolean) {
		await fetch(`/api/admin/announcements/${id}`, {
			method: 'PATCH',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ isActive: !isActive })
		});
		await invalidateAll();
	}

	async function deleteAnnouncement(id: string) {
		if (!confirm('Delete this announcement?')) return;
		await fetch(`/api/admin/announcements/${id}`, { method: 'DELETE' });
		await invalidateAll();
	}

	function formatDate(date: string | Date | null): string {
		if (!date) return '--';
		return new Date(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
	}
</script>

<svelte:head>
	<title>Announcements - Admin</title>
</svelte:head>

<div class="header-row">
	<h1>Announcements</h1>
	<button class="btn-primary" onclick={() => { resetForm(); showForm = true; }}>
		New Announcement
	</button>
</div>

{#if showForm}
	<div class="form-card">
		<h2>{editingId ? 'Edit Announcement' : 'New Announcement'}</h2>
		<form onsubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
			<label class="field">
				<span>Title</span>
				<input type="text" bind:value={formTitle} required placeholder="e.g. Pool Maintenance Notice" />
			</label>
			<label class="field">
				<span>Message</span>
				<textarea bind:value={formBody} rows="4" placeholder="The pool will be closed for maintenance..."></textarea>
			</label>
			<div class="field">
				<span>Image (optional)</span>
				<ImageUpload value={formImageUrl} onchange={(url) => formImageUrl = url} />
			</div>
			<div class="field-row">
				<label class="field">
					<span>Show from (optional)</span>
					<input type="datetime-local" bind:value={formShowFrom} />
				</label>
				<label class="field">
					<span>Show until (optional)</span>
					<input type="datetime-local" bind:value={formShowUntil} />
				</label>
				<label class="field">
					<span>Priority</span>
					<select bind:value={formPriority}>
						<option value={0}>Normal</option>
						<option value={1}>High</option>
						<option value={2}>Urgent</option>
					</select>
				</label>
			</div>
			<div class="form-actions">
				<button type="submit" class="btn-primary">{editingId ? 'Update' : 'Create'}</button>
				<button type="button" class="btn-ghost" onclick={resetForm}>Cancel</button>
			</div>
		</form>
	</div>
{/if}

{#if data.announcements.length === 0 && !showForm}
	<div class="empty">No announcements yet. Create one to display messages on TV screens.</div>
{:else if data.announcements.length > 0}
	<div class="table-wrap">
		<table>
			<thead>
				<tr>
					<th>Title</th>
					<th>Priority</th>
					<th>From</th>
					<th>Until</th>
					<th>Status</th>
					<th>Actions</th>
				</tr>
			</thead>
			<tbody>
				{#each data.announcements as ann}
					<tr class:inactive={!ann.isActive}>
						<td>
							<div class="ann-title">{ann.title}</div>
							{#if ann.body}
								<div class="ann-preview">{ann.body.slice(0, 80)}{ann.body.length > 80 ? '...' : ''}</div>
							{/if}
						</td>
						<td>
							{#if ann.priority >= 2}
								<span class="badge badge-urgent">Urgent</span>
							{:else if ann.priority >= 1}
								<span class="badge badge-high">High</span>
							{:else}
								<span class="badge badge-normal">Normal</span>
							{/if}
						</td>
						<td>{formatDate(ann.showFrom)}</td>
						<td>{formatDate(ann.showUntil)}</td>
						<td>
							<span class="badge" class:badge-active={ann.isActive} class:badge-off={!ann.isActive}>
								{ann.isActive ? 'Active' : 'Inactive'}
							</span>
						</td>
						<td class="actions">
							<button class="btn-small" onclick={() => startEdit(ann)}>Edit</button>
							<button class="btn-small" onclick={() => toggleActive(ann.id, ann.isActive)}>
								{ann.isActive ? 'Disable' : 'Enable'}
							</button>
							<button class="btn-small btn-danger" onclick={() => deleteAnnouncement(ann.id)}>Delete</button>
						</td>
					</tr>
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

	h1 { font-size: 1.8rem; margin: 0; }
	h2 { font-size: 1.2rem; margin: 0 0 16px; color: #f1f5f9; }

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
	.btn-primary:hover { background: #2563eb; }

	.btn-ghost {
		padding: 10px 20px;
		background: none;
		border: 1px solid #334155;
		color: #94a3b8;
		border-radius: 8px;
		font-size: 0.9rem;
		cursor: pointer;
	}

	.form-card {
		background: #1e293b;
		border-radius: 12px;
		padding: 24px;
		margin-bottom: 24px;
	}

	.field {
		display: block;
		margin-bottom: 16px;
	}

	.field span {
		display: block;
		color: #94a3b8;
		font-size: 0.85rem;
		margin-bottom: 6px;
	}

	.field-row {
		display: flex;
		gap: 16px;
		flex-wrap: wrap;
	}

	input[type='text'], input[type='datetime-local'], select, textarea {
		width: 100%;
		max-width: 500px;
		padding: 10px 12px;
		background: #0f172a;
		border: 1px solid #334155;
		border-radius: 8px;
		color: #f1f5f9;
		font-size: 0.9rem;
		font-family: inherit;
		color-scheme: dark;
	}

	textarea { resize: vertical; }
	input:focus, select:focus, textarea:focus { outline: none; border-color: #3b82f6; }

	.form-actions {
		display: flex;
		gap: 10px;
		margin-top: 8px;
	}

	.empty {
		text-align: center;
		color: #94a3b8;
		padding: 60px 20px;
	}

	.table-wrap { overflow-x: auto; }

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

	tr.inactive td { opacity: 0.5; }

	.ann-title { font-weight: 600; }
	.ann-preview { font-size: 0.8rem; color: #94a3b8; margin-top: 2px; }

	.badge {
		display: inline-block;
		padding: 2px 10px;
		border-radius: 12px;
		font-size: 0.75rem;
		font-weight: 600;
	}
	.badge-normal { background: #334155; color: #94a3b8; }
	.badge-high { background: #eab308; color: #000; }
	.badge-urgent { background: #ef4444; color: #fff; }
	.badge-active { background: #22c55e; color: #fff; }
	.badge-off { background: #ef4444; color: #fff; }

	.actions { display: flex; gap: 6px; flex-wrap: wrap; }

	.btn-small {
		padding: 4px 10px;
		border: 1px solid #334155;
		background: #1e293b;
		color: #f1f5f9;
		border-radius: 6px;
		font-size: 0.8rem;
		cursor: pointer;
	}
	.btn-small:hover { background: #334155; }

	.btn-danger { border-color: #7f1d1d; color: #ef4444; }
	.btn-danger:hover { background: #7f1d1d; color: #fff; }
</style>
