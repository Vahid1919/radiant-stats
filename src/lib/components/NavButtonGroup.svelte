<script lang="ts">
  const labels = ['Form', 'Aim', 'Entry', 'Queue x Time'];
</script>

<nav aria-label="Dashboard sections">
  {#each labels as label (label)}
    <button type="button">
      {label}
      <span aria-hidden="true"></span>
    </button>
  {/each}
</nav>

<style>
  nav {
    display: flex;
    gap: 0.5rem;
  }

  button {
    position: relative;
    overflow: visible;
    border: 0;
    padding: 0.5rem 0.75rem;
    color: #9ca3af;
    background: transparent;
    font-family: 'Space Mono', monospace;
    font-size: 0.875rem;
    font-weight: 400;
    transition:
      color 200ms ease,
      text-shadow 200ms ease;
  }

  button:hover {
    color: white;
    text-shadow: 0 0 8px rgba(255, 255, 255, 0.8);
  }

  button:focus-visible {
    outline: 2px solid white;
    outline-offset: 3px;
  }

  span {
    position: absolute;
    bottom: 0;
    left: 50%;
    width: 0;
    height: 1px;
    background: white;
    filter: drop-shadow(0 0 4px rgba(255, 255, 255, 0.9));
    transform: translateX(-50%);
    transition: width 300ms ease;
  }

  button:hover span,
  button:focus-visible span {
    width: 60%;
  }
</style>
