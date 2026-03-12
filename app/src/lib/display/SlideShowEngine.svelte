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
	let visible = $state(true);

	onMount(() => {
		if (modules.length <= 1) return;

		const interval = setInterval(() => {
			visible = false;
			setTimeout(() => {
				currentIndex = (currentIndex + 1) % modules.length;
				visible = true;
			}, 400);
		}, speedSeconds * 1000);

		return () => clearInterval(interval);
	});

	let currentModule = $derived(modules[currentIndex]);
	let CurrentComponent = $derived(moduleComponents[currentModule]);
	let currentProps = $derived(getModuleProps(currentModule, config));
</script>

<div class="slideshow" class:visible>
	{#key currentModule}
		<CurrentComponent {...currentProps} />
	{/key}
</div>

<style>
	.slideshow {
		opacity: 0;
		transition: opacity 0.4s ease-in-out;
	}

	.slideshow.visible {
		opacity: 1;
	}
</style>
