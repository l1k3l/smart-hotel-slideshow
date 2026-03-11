<script lang="ts">
	import type { Slope } from '$lib/types';
	import { statusColor, difficultyColor } from '../helpers';

	let { slopes }: { slopes: Slope[] } = $props();
</script>

<section class="module slopes-module">
	<h2>Slopes</h2>
	<div class="table-wrap">
		<table>
			<thead>
				<tr>
					<th>Name</th>
					<th>Difficulty</th>
					<th>Status</th>
					<th>Length</th>
					<th>Elevation</th>
				</tr>
			</thead>
			<tbody>
				{#each slopes as slope}
					<tr>
						<td>{slope.name}</td>
						<td>
							<span
								class="difficulty-dot"
								style="background: {difficultyColor(slope.difficultyCode)}"
							></span>
							{slope.difficulty}
						</td>
						<td>
							<span class="badge" style="background: {statusColor(slope.status)}"
								>{slope.status}</span
							>
						</td>
						<td>{slope.length ? `${slope.length} m` : '--'}</td>
						<td>{slope.elevation ? `${slope.elevation} m` : '--'}</td>
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

	.difficulty-dot {
		display: inline-block;
		width: 10px;
		height: 10px;
		border-radius: 50%;
		margin-right: 6px;
		vertical-align: middle;
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
