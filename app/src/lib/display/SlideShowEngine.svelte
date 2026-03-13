<script lang="ts">
	import { onMount } from 'svelte';
	import type { ModuleName, DisplayConfig } from './types';
	import { moduleComponents, getModuleProps } from './modules/index';

	let {
		modules,
		config,
		speedSeconds = 15
	}: {
		modules: ModuleName[];
		config: DisplayConfig;
		speedSeconds?: number;
	} = $props();

	let currentIndex = $state(0);

	onMount(() => {
		if (modules.length <= 1) return;

		const interval = setInterval(() => {
			currentIndex = (currentIndex + 1) % modules.length;
		}, speedSeconds * 1000);

		return () => clearInterval(interval);
	});
</script>

<!--
  All modules stay mounted so images/canvases persist in the DOM.
  Only the active slide is visible; others are hidden offscreen with
  visibility:hidden (preserves layout/images but doesn't paint).
-->
<div class="slideshow">
	{#each modules as mod, i}
		{@const Component = moduleComponents[mod]}
		{@const props = getModuleProps(mod, config)}
		<div class="slide" class:active={i === currentIndex}>
			<Component {...props} />
		</div>
	{/each}
</div>

<style>
	.slideshow {
		position: relative;
		width: 100%;
		height: 100%;
	}

	.slide {
		position: absolute;
		inset: 0;
		opacity: 0;
		visibility: hidden;
		transition: opacity 0.5s ease-in-out;
	}

	.slide.active {
		opacity: 1;
		visibility: visible;
	}
</style>
