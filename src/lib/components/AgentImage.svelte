<script lang="ts">
  import { agentImageUrl, type AgentName } from '$lib/agents';

  let { agentName = 'Neon' }: { agentName?: AgentName } = $props();
  const url = $derived(agentImageUrl(agentName));
</script>

<div class="agent-image">
  <img src={url} alt={agentName} draggable="false" />
</div>
<div class="agent-fade" aria-hidden="true"></div>

<style>
  .agent-image {
    display: flex;
    height: 100%;
    align-items: end;
    justify-content: center;
    scale: 1.8;
    user-select: none;
  }

  img {
    pointer-events: none;
    height: 100%;
    max-height: 100%;
    user-select: none;
    object-fit: contain;
    object-position: bottom;
    -webkit-user-drag: none;
  }

  .agent-fade {
    position: absolute;
    right: 0;
    bottom: 0;
    left: 0;
    height: 40%;
    pointer-events: none;
    background: linear-gradient(
      to top,
      var(--valorant-bg) 40%,
      transparent 100%
    );
  }
</style>
