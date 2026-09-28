<script lang="ts">
  import { resolve } from '$app/paths';
  import { page } from '$app/state';

  const dashboardSections = [
    { route: '/players/[name]/[tag]#profile', label: 'Profile' },
    { route: '/players/[name]/[tag]#summary', label: 'Overview' },
    { route: '/players/[name]/[tag]#history', label: 'Match log' },
  ] as const;

  const isDashboard = $derived(page.url.pathname.startsWith('/players/'));
</script>

<nav aria-label={isDashboard ? 'Player dashboard sections' : 'Site navigation'}>
  <a href={isDashboard ? resolve('/') : '#player-search'}>Search</a>
  {#if isDashboard}
    {#each dashboardSections as section (section.route)}
      <a
        href={resolve(section.route, {
          name: page.params.name ?? '',
          tag: page.params.tag ?? '',
        })}
      >
        {section.label}
        <span aria-hidden="true"></span>
      </a>
    {/each}
  {/if}
</nav>

<style>
  nav {
    display: flex;
    align-items: center;
    gap: 0.125rem;
  }

  a {
    position: relative;
    overflow: visible;
    border: 0;
    padding: 0.55rem 0.65rem;
    color: #b9b9c0;
    background: transparent;
    font-family: 'Space Mono', monospace;
    font-size: 0.75rem;
    font-weight: 700;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    text-decoration: none;
    transition:
      color 150ms ease,
      background 150ms ease;
  }

  a:hover {
    color: white;
    background: #24242a;
  }

  a:focus-visible {
    outline: 2px solid white;
    outline-offset: 3px;
  }

  span {
    position: absolute;
    bottom: 0.2rem;
    left: 50%;
    width: 0;
    height: 1px;
    background: var(--valorant-red);
    filter: none;
    transform: translateX(-50%);
    transition: width 300ms ease;
  }

  a:hover span,
  a:focus-visible span {
    width: calc(100% - 1.3rem);
  }
</style>
