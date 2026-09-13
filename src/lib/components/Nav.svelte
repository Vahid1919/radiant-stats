<script lang="ts">
  import NavButtonGroup from './NavButtonGroup.svelte';
</script>

<header>
  <img src="/images/logo.png" alt="" draggable="false" />
  <h1>Radiant Stats</h1>
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
    gap: 0.25rem;
    padding: 0.5rem;
    border: 1px solid rgba(0, 0, 0, 0.14);
    background: rgba(0, 0, 0, 0.4);
    box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
    color: white;
    font-family: 'Chakra Petch', sans-serif;
    backdrop-filter: blur(6.9px);
    -webkit-backdrop-filter: blur(6.9px);
  }

  img {
    height: 4rem;
    user-select: none;
    -webkit-user-drag: none;
  }

  h1 {
    margin: 0;
    font-size: 2.25rem;
    font-weight: 600;
    letter-spacing: 0;
    text-transform: uppercase;
  }

  :global(nav) {
    margin-left: 2rem;
  }

  @media (max-width: 700px) {
    header {
      flex-wrap: wrap;
    }

    h1 {
      font-size: 1.5rem;
    }

    :global(nav) {
      width: 100%;
      margin-left: 0;
      overflow-x: auto;
    }
  }
</style>
