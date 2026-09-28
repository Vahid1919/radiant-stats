<script lang="ts">
  import { goto } from '$app/navigation';
  import { resolve } from '$app/paths';
  import type { PlayerProfile } from '$lib/player-profile';
  import LoadingOverlay from './LoadingOverlay.svelte';

  const defaultRiotId = 'Janhoi#VAL';

  let riotId = $state('');
  let errorMessage = $state<string | null>(null);
  let isLoading = $state(false);

  function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null;
  }

  function isPlayerProfileResponse(
    value: unknown,
  ): value is { data: PlayerProfile } {
    return isRecord(value) && isRecord(value.data);
  }

  function getErrorMessage(value: unknown): string {
    return isRecord(value) && typeof value.error === 'string'
      ? value.error
      : 'The player profile could not be retrieved.';
  }

  function parseRiotId(value: string): { name: string; tag: string } | null {
    const normalized = value.trim();
    const tagSeparator = normalized.lastIndexOf('#');
    if (tagSeparator <= 0 || tagSeparator === normalized.length - 1) {
      return null;
    }

    const name = normalized.slice(0, tagSeparator).trim();
    const tag = normalized.slice(tagSeparator + 1).trim();
    return name && tag ? { name, tag } : null;
  }

  async function searchPlayer(event: SubmitEvent) {
    event.preventDefault();

    const parsedRiotId = parseRiotId(riotId || defaultRiotId);
    if (!parsedRiotId) {
      errorMessage = 'Enter a Riot ID in the format NAME#TAG.';
      return;
    }

    isLoading = true;
    errorMessage = null;

    try {
      const response = await fetch(
        `/api/players/${encodeURIComponent(parsedRiotId.name)}/${encodeURIComponent(parsedRiotId.tag)}`,
      );
      const body: unknown = await response.json();

      if (!response.ok || !isPlayerProfileResponse(body)) {
        errorMessage = getErrorMessage(body);
        return;
      }

      await goto(
        resolve(
          `/players/${encodeURIComponent(body.data.riotId.name)}/${encodeURIComponent(body.data.riotId.tag)}`,
        ),
      );
    } catch {
      errorMessage = 'The player profile could not be retrieved. Try again.';
    } finally {
      isLoading = false;
    }
  }
</script>

<section id="player-search" aria-labelledby="hero-title">
  <div class="player">
    <div class="content">
      <p class="eyebrow">Valorant profile lookup</p>
      <h1 id="hero-title">Find your next advantage.</h1>
      <form onsubmit={searchPlayer}>
        <div class="fields">
          <label>
            Riot ID
            <input
              bind:value={riotId}
              name="riotId"
              placeholder={defaultRiotId}
              autocomplete="username"
              maxlength="32"
            />
          </label>
        </div>
        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Searching...' : 'Find player'}
        </button>
      </form>

      {#if errorMessage}
        <p class="message error" role="alert">{errorMessage}</p>
      {:else}
        <p class="message">
          Enter a Riot ID, or leave this blank and select Find player to explore
          an example profile.
        </p>
      {/if}
    </div>
  </div>
</section>

{#if isLoading}
  <LoadingOverlay label="Finding player..." />
{/if}

<style>
  section {
    position: relative;
    display: flex;
    width: 100%;
    min-height: 100dvh;
    overflow: hidden;
    padding-top: 5rem;
  }

  .player {
    display: flex;
    width: 100%;
    align-items: center;
    justify-content: center;
    padding: 2rem;
  }

  .content {
    width: min(100%, 31rem);
  }

  .eyebrow {
    margin: 0 0 0.75rem;
    color: var(--valorant-red);
    font-family: 'Chakra Petch', sans-serif;
    font-size: 0.8rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  h1 {
    margin: 0;
    color: white;
    font-family: 'Chakra Petch', sans-serif;
    font-size: clamp(2.4rem, 4vw, 4rem);
    line-height: 0.95;
    letter-spacing: 0;
  }

  form {
    display: grid;
    gap: 1.25rem;
    margin-top: 2rem;
  }

  .fields {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    gap: 0.75rem;
  }

  label {
    display: grid;
    gap: 0.45rem;
    color: #b8b8c0;
    font-family: 'Chakra Petch', sans-serif;
    font-size: 0.8rem;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }

  input {
    width: 100%;
    min-height: 3.25rem;
    border: 1px solid #44444d;
    border-radius: 0;
    padding: 0.75rem;
    color: white;
    background: #18181d;
    font: inherit;
    letter-spacing: 0;
    text-transform: none;
  }

  input::placeholder {
    color: #777781;
  }

  input:focus-visible,
  button:focus-visible {
    outline: 2px solid white;
    outline-offset: 3px;
  }

  button {
    min-height: 3.25rem;
    border: 0;
    border-radius: 0;
    padding: 0.75rem 1.25rem;
    color: white;
    background: var(--valorant-red);
    font-family: 'Chakra Petch', sans-serif;
    font-size: 0.95rem;
    font-weight: 700;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  button:hover:not(:disabled) {
    background: #ff6470;
  }

  button:disabled {
    cursor: wait;
    opacity: 0.65;
  }

  .message {
    min-height: 1.5rem;
    margin: 1rem 0 0;
    color: #a8a8b0;
    font-size: 0.95rem;
  }

  .error {
    color: #ff8c95;
  }

  @media (max-width: 700px) {
    section {
      min-height: 100dvh;
      flex-direction: column;
      padding-top: 8.75rem;
    }

    .player {
      min-height: 25dvh;
      padding: 2rem 1.5rem 3rem;
    }
  }
</style>
