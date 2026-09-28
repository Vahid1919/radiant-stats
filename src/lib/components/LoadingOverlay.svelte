<script lang="ts">
  let { label = 'Loading...' }: { label?: string } = $props();
</script>

<div class="loading-overlay" role="status" aria-live="polite">
  <div class="loading-content">
    <span class="loading-mark" aria-hidden="true"></span>
    <p>{label}</p>
  </div>
</div>

<style>
  .loading-overlay {
    position: fixed;
    z-index: 100;
    inset: 0;
    display: grid;
    place-items: center;
    background: rgba(13, 13, 15, 0.94);
    backdrop-filter: blur(10px);
  }

  .loading-content {
    display: grid;
    justify-items: center;
    gap: 1rem;
  }

  .loading-mark {
    width: 2.75rem;
    height: 2.75rem;
    border: 3px solid #38383f;
    border-top-color: var(--valorant-red);
    border-radius: 50%;
    animation: spin 800ms linear infinite;
  }

  p {
    margin: 0;
    color: #d8d8dc;
    font-family: 'Chakra Petch', sans-serif;
    font-size: 0.85rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
</style>
