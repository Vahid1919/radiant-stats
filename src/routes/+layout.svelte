<script lang="ts">
  import { navigating } from '$app/state';
  import LoadingOverlay from '$lib/components/LoadingOverlay.svelte';
  import '../app.css';

  let { children } = $props();
</script>

<svelte:head>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link
    rel="preconnect"
    href="https://fonts.gstatic.com"
    crossorigin="anonymous"
  />
  <link
    href="https://fonts.googleapis.com/css2?family=Chakra+Petch:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400;1,500;1,600;1,700&family=Google+Sans+Flex:opsz@6..144&family=Space+Mono:ital,wght@0,400;0,700;1,400;1,700&display=swap"
    rel="stylesheet"
  />
</svelte:head>

{#if navigating.to}
  <LoadingOverlay label="Loading player dashboard..." />
{/if}

{@render children()}
