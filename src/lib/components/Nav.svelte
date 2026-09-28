<script lang="ts">
  import { resolve } from '$app/paths';
  import NavButtonGroup from './NavButtonGroup.svelte';
</script>

<header>
  <a class="brand" href={resolve('/')} aria-label="Radiant Stats home">
    <img src="/images/logo.png" alt="" draggable="false" />
    <span>Radiant Stats</span>
  </a>
  <NavButtonGroup />
</header>

<style>
  header {
    position: fixed;
    z-index: 50;
    top: 0;
    right: 0;
    left: 0;
    display: flex;
    width: 100%;
    align-items: center;
    min-height: 4.5rem;
    gap: 1rem;
    padding: 0.625rem clamp(1rem, 4vw, 3rem);
    border-bottom: 1px solid #2b2b32;
    background: rgba(13, 13, 15, 0.92);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
    color: white;
    font-family: 'Chakra Petch', sans-serif;
    backdrop-filter: blur(6.9px);
    -webkit-backdrop-filter: blur(6.9px);
  }

  img {
    height: 2.5rem;
    user-select: none;
    -webkit-user-drag: none;
  }

  .brand {
    display: flex;
    align-items: center;
    color: white;
    gap: 0.5rem;
    font-size: 1.25rem;
    font-weight: 600;
    letter-spacing: 0;
    text-decoration: none;
    text-transform: uppercase;
  }

  .brand span {
    margin: 0;
  }

  :global(nav) {
    margin-left: auto;
  }

  @media (max-width: 700px) {
    .brand {
      font-size: 1rem;
    }

    :global(nav) {
      margin-left: 0;
      overflow-x: auto;
    }
  }
</style>
