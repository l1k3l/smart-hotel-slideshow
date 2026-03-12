<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import ImageUpload from '$lib/components/ImageUpload.svelte';

	let { data } = $props();

	const categories = [
		{ value: 'restaurant', label: 'Restaurant' },
		{ value: 'spa', label: 'Spa & Wellness' },
		{ value: 'pool', label: 'Pool' },
		{ value: 'gym', label: 'Gym & Fitness' },
		{ value: 'bar', label: 'Bar & Lounge' },
		{ value: 'reception', label: 'Reception' },
		{ value: 'parking', label: 'Parking' },
		{ value: 'laundry', label: 'Laundry' },
		{ value: 'other', label: 'Other' }
	];

	let showForm = $state(false);
	let editingId = $state('');
	let formName = $state('');
	let formCategory = $state('other');
	let formDescription = $state('');
	let formHours = $state('');
	let formImageUrl = $state('');

	function resetForm() {
		showForm = false;
		editingId = '';
		formName = '';
		formCategory = 'other';
		formDescription = '';
		formHours = '';
		formImageUrl = '';
	}

	function startEdit(service: typeof data.services[0]) {
		editingId = service.id;
		formName = service.name;
		formCategory = service.category;
		formDescription = service.description;
		formHours = service.hours;
		formImageUrl = service.imageUrl ?? '';
		showForm = true;
	}

	async function handleSubmit() {
		const payload = {
			name: formName,
			category: formCategory,
			description: formDescription,
			hours: formHours,
			imageUrl: formImageUrl || null
		};

		if (editingId) {
			await fetch(`/api/admin/services/${editingId}`, {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(payload)
			});
		} else {
			await fetch('/api/admin/services', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(payload)
			});
		}

		resetForm();
		await invalidateAll();
	}

	async function toggleActive(id: string, isActive: boolean) {
		await fetch(`/api/admin/services/${id}`, {
			method: 'PATCH',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ isActive: !isActive })
		});
		await invalidateAll();
	}

	async function deleteService(id: string) {
		if (!confirm('Delete this service?')) return;
		await fetch(`/api/admin/services/${id}`, { method: 'DELETE' });
		await invalidateAll();
	}

	function categoryLabel(value: string): string {
		return categories.find((c) => c.value === value)?.label ?? value;
	}
</script>

<svelte:head>
	<title>Services - Admin</title>
</svelte:head>

<div class="header-row">
	<h1>Hotel Services</h1>
	<button class="btn-primary" onclick={() => { resetForm(); showForm = true; }}>
		Add Service
	</button>
</div>

{#if showForm}
	<div class="form-card">
		<h2>{editingId ? 'Edit Service' : 'New Service'}</h2>
		<form onsubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
			<label class="field">
				<span>Name</span>
				<input type="text" bind:value={formName} required placeholder="e.g. Restaurant La Montagne" />
			</label>
			<label class="field">
				<span>Category</span>
				<select bind:value={formCategory}>
					{#each categories as cat}
						<option value={cat.value}>{cat.label}</option>
					{/each}
				</select>
			</label>
			<label class="field">
				<span>Hours</span>
				<input type="text" bind:value={formHours} placeholder="e.g. 7:00 - 22:00" />
			</label>
			<label class="field">
				<span>Description</span>
				<textarea bind:value={formDescription} rows="3" placeholder="Brief description shown on the display"></textarea>
			</label>
			<div class="field">
				<span>Image (optional)</span>
				<ImageUpload value={formImageUrl} onchange={(url) => formImageUrl = url} />
			</div>
			<div class="form-actions">
				<button type="submit" class="btn-primary">{editingId ? 'Update' : 'Create'}</button>
				<button type="button" class="btn-ghost" onclick={resetForm}>Cancel</button>
			</div>
		</form>
	</div>
{/if}

{#if data.services.length === 0 && !showForm}
	<div class="empty">No services yet. Add your hotel's services to display on TV screens.</div>
{:else if data.services.length > 0}
	<div class="table-wrap">
		<table>
			<thead>
				<tr>
					<th>Name</th>
					<th>Category</th>
					<th>Hours</th>
					<th>Status</th>
					<th>Actions</th>
				</tr>
			</thead>
			<tbody>
				{#each data.services as service}
					<tr class:inactive={!service.isActive}>
						<td>{service.name}</td>
						<td>{categoryLabel(service.category)}</td>
						<td>{service.hours || '--'}</td>
						<td>
							<span class="badge" class:badge-active={service.isActive} class:badge-inactive={!service.isActive}>
								{service.isActive ? 'Active' : 'Inactive'}
							</span>
						</td>
						<td class="actions">
							<button class="btn-small" onclick={() => startEdit(service)}>Edit</button>
							<button class="btn-small" onclick={() => toggleActive(service.id, service.isActive)}>
								{service.isActive ? 'Disable' : 'Enable'}
							</button>
							<button class="btn-small btn-danger" onclick={() => deleteService(service.id)}>Delete</button>
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

	input[type='text'], select, textarea {
		width: 100%;
		max-width: 500px;
		padding: 10px 12px;
		background: #0f172a;
		border: 1px solid #334155;
		border-radius: 8px;
		color: #f1f5f9;
		font-size: 0.9rem;
		font-family: inherit;
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

	.badge {
		display: inline-block;
		padding: 2px 10px;
		border-radius: 12px;
		font-size: 0.75rem;
		font-weight: 600;
	}
	.badge-active { background: #22c55e; color: #fff; }
	.badge-inactive { background: #ef4444; color: #fff; }

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
