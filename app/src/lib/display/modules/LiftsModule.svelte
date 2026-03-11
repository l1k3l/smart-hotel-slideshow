<script lang="ts">
	import type { Lift } from '$lib/types';
	import { statusColor } from '../helpers';

	let { lifts }: { lifts: Lift[] } = $props();
</script>

<section class="module lifts-module">
	<h2>Lifts</h2>
	<div class="table-wrap">
		<table>
			<thead>
				<tr>
					<th>Name</th>
					<th>Type</th>
					<th>Status</th>
					<th>Capacity</th>
				</tr>
			</thead>
			<tbody>
				{#each lifts as lift}
					<tr>
						<td>{lift.name}</td>
						<td>{lift.type}</td>
						<td>
							<span class="badge" style="background: {statusColor(lift.status)}">{lift.status}</span>
						</td>
						<td>{lift.capacity ?? '--'} pers/h</td>
					</tr>
				{/each}
			</tbody>
		</table>
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

	.table-wrap {
		overflow-x: auto;
	}

	table {
		width: 100%;
		border-collapse: collapse;
		background: var(--surface);
		border-radius: 12px;
		overflow: hidden;
	}

	th {
		background: var(--surface-hover);
		text-align: left;
		padding: 12px 16px;
		font-size: 0.85rem;
		color: var(--text-muted);
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	td {
		padding: 10px 16px;
		border-top: 1px solid var(--border);
		font-size: 0.95rem;
	}

	tr:hover td {
		background: var(--surface-hover);
	}

	.badge {
		display: inline-block;
		padding: 2px 10px;
		border-radius: 12px;
		font-size: 0.8rem;
		font-weight: 600;
		color: #fff;
		text-transform: capitalize;
	}
</style>
