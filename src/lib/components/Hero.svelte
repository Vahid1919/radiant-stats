<script lang="ts">
  import AgentImage from './AgentImage.svelte';
</script>

<section aria-labelledby="player-name">
  <div class="artwork">
    <AgentImage agentName="Neon" />
  </div>
  <div class="player">
    <h2 id="player-name">Player Name</h2>
  </div>
</section>

<style>
  section {
    position: relative;
    display: flex;
    width: 100%;
    min-height: 100dvh;
    overflow: hidden;
    padding-top: 5rem;
  }

  .artwork,
  .player {
    width: 50%;
    flex: 0 0 50%;
  }

  .artwork {
    position: relative;
    height: calc(100dvh - 5rem);
    user-select: none;
  }

  .player {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  h2 {
    margin: 0;
    color: white;
    font-family: 'Chakra Petch', sans-serif;
    font-size: 2.5rem;
    letter-spacing: 0;
  }

  @media (max-width: 700px) {
    section {
      min-height: 100dvh;
      flex-direction: column;
      padding-top: 8.75rem;
    }

    .artwork,
    .player {
      width: 100%;
      flex-basis: auto;
    }

    .artwork {
      height: 60dvh;
    }

    .player {
      min-height: 25dvh;
    }
  }
</style>
