<script lang="ts">
  import { resolve } from '$app/paths';
  import Nav from '$lib/components/Nav.svelte';
  import PerformanceChart from '$lib/components/PerformanceChart.svelte';
  import type { PageData } from './$types';

  let { data } = $props<{ data: PageData }>();

  const numberFormat = new Intl.NumberFormat('en-US');
  const chronologicalMatches = $derived([...data.dashboard.matches].reverse());

  function formatDate(value: string): string {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
    }).format(new Date(value));
  }

  function calculateKda(
    kills: number,
    deaths: number,
    assists: number,
  ): number {
    return Math.round(((kills + assists) / Math.max(deaths, 1)) * 100) / 100;
  }
</script>

<svelte:head>
  <title>{data.dashboard.profile.riotId.name} | Radiant Stats</title>
  <meta
    name="description"
    content="Recent Valorant competitive match performance."
  />
</svelte:head>

<Nav />
<main>
  <header id="profile" class="player-header">
    <div class="header-visual" aria-hidden="true">
      <img src={data.dashboard.profile.card.wide} alt="" />
    </div>
    <a class="back" href={resolve('/')}>Back to search</a>
    <div class="identity">
      <img src={data.dashboard.profile.card.small} alt="" />
      <div>
        <p class="eyebrow">
          Last {data.dashboard.summary.matchCount} competitive matches
        </p>
        <h1>
          {data.dashboard.profile.riotId.name}<span
            >#{data.dashboard.profile.riotId.tag}</span
          >
        </h1>
        <p class="subtle">
          Level {data.dashboard.profile.accountLevel} · {data.dashboard.profile.region.toUpperCase()}
        </p>
        {#if data.dashboard.summary.mostPlayedAgent}
          <p class="agent-insight">
            Most played agent: {data.dashboard.summary.mostPlayedAgent}
          </p>
        {/if}
      </div>
    </div>
  </header>

  {#if data.dashboard.summary.matchCount === 0}
    <section class="empty" aria-labelledby="empty-title">
      <p class="eyebrow">No competitive history</p>
      <h2 id="empty-title">No recent competitive matches are available.</h2>
      <p>
        HenrikDev returned no competitive matches for this player. Try another
        Riot ID or return later.
      </p>
    </section>
  {:else}
    <section id="summary" aria-labelledby="summary-title">
      <div class="section-heading">
        <p class="eyebrow">Performance snapshot</p>
        <h2 id="summary-title">Recent form</h2>
      </div>
      <div class="metrics">
        <article>
          <span>Win rate</span><strong>{data.dashboard.summary.winRate}%</strong
          ><small
            >{data.dashboard.summary.wins}W · {data.dashboard.summary
              .losses}L</small
          >
        </article>
        <article>
          <span>K/D</span><strong
            >{data.dashboard.summary.killDeathRatio}</strong
          ><small
            >{data.dashboard.summary.averageKills} / {data.dashboard.summary
              .averageDeaths} / {data.dashboard.summary.averageAssists}</small
          >
        </article>
        <article>
          <span>KDA</span><strong
            >{data.dashboard.summary.killAssistDeathRatio}</strong
          ><small>Kills + assists per death</small>
        </article>
        <article>
          <span>ACS</span><strong
            >{data.dashboard.summary.averageCombatScore}</strong
          ><small>Average combat score</small>
        </article>
        <article>
          <span>ADR</span><strong
            >{data.dashboard.summary.averageDamagePerRound}</strong
          ><small>Damage per round</small>
        </article>
        <article>
          <span>HS%</span><strong
            >{data.dashboard.summary.headshotPercentage}%</strong
          ><small>Hit-location accuracy</small>
        </article>
        <article>
          <span>Top agent</span><strong
            >{data.dashboard.summary.mostPlayedAgent}</strong
          ><small>Most played recently</small>
        </article>
        <article>
          <span>Top map</span><strong
            >{data.dashboard.summary.mostPlayedMap}</strong
          ><small>Most played recently</small>
        </article>
      </div>
    </section>

    <section id="history" class="history" aria-labelledby="history-title">
      <div class="section-heading">
        <p class="eyebrow">Match log</p>
        <h2 id="history-title">Competitive history</h2>
      </div>
      <div class="performance-charts" aria-label="Performance by match">
        <PerformanceChart
          title="ACS"
          description="Average combat score by match start time"
          kind="area"
          values={chronologicalMatches.map((match) => ({
            startedAt: match.startedAt,
            outcome: match.outcome,
            value: match.stats.averageCombatScore,
          }))}
        />
        <PerformanceChart
          title="Headshot %"
          description="Hit-location accuracy by match start time"
          kind="line"
          suffix="%"
          values={chronologicalMatches.map((match) => ({
            startedAt: match.startedAt,
            outcome: match.outcome,
            value: match.stats.headshotPercentage,
          }))}
        />
        <PerformanceChart
          title="KDA"
          description="Kills plus assists per death by match start time"
          kind="lollipop"
          suffix=" KDA"
          values={chronologicalMatches.map((match) => ({
            startedAt: match.startedAt,
            outcome: match.outcome,
            value: calculateKda(
              match.stats.kills,
              match.stats.deaths,
              match.stats.assists,
            ),
          }))}
        />
      </div>
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th scope="col">Date</th>
              <th scope="col">Result</th>
              <th scope="col">Map</th>
              <th scope="col">Agent</th>
              <th scope="col">Score</th>
              <th scope="col">K / D / A</th>
              <th scope="col">ACS</th>
              <th scope="col">ADR</th>
              <th scope="col">HS%</th>
            </tr>
          </thead>
          <tbody>
            {#each data.dashboard.matches as match (match.id)}
              <tr>
                <td>{formatDate(match.startedAt)}</td>
                <td
                  ><span
                    class:win={match.outcome === 'win'}
                    class:loss={match.outcome === 'loss'}
                    class="outcome">{match.outcome}</span
                  ></td
                >
                <td>{match.mapName}</td>
                <td>{match.agentName}</td>
                <td>{match.score.won} - {match.score.lost}</td>
                <td
                  >{match.stats.kills} / {match.stats.deaths} / {match.stats
                    .assists}</td
                >
                <td>{numberFormat.format(match.stats.averageCombatScore)}</td>
                <td>{numberFormat.format(match.stats.averageDamagePerRound)}</td
                >
                <td>{match.stats.headshotPercentage}%</td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    </section>
  {/if}
</main>

<style>
  main {
    width: min(100%, 76rem);
    margin: 0 auto;
    padding: 8rem 2rem 4rem;
  }

  .player-header {
    position: relative;
    isolation: isolate;
    overflow: hidden;
    border-bottom: 1px solid #303038;
    padding-bottom: 2rem;
  }

  .header-visual {
    position: absolute;
    z-index: 0;
    inset: 0;
    overflow: hidden;
    pointer-events: none;
  }

  .header-visual::after {
    position: absolute;
    inset: 0;
    content: '';
    background: linear-gradient(90deg, #141418 22%, transparent 75%);
  }

  .header-visual img {
    width: 100%;
    height: 100%;
    opacity: 0.72;
    object-fit: cover;
    object-position: center;
  }

  .back {
    position: relative;
    z-index: 1;
    color: #b8b8c0;
    font-family: 'Chakra Petch', sans-serif;
    font-size: 0.85rem;
    text-decoration: none;
  }

  .back:hover {
    color: var(--valorant-red);
  }

  .identity {
    display: flex;
    position: relative;
    z-index: 1;
    align-items: center;
    gap: 1.25rem;
    margin-top: 2rem;
  }

  .identity img {
    width: 5rem;
    height: 5rem;
    object-fit: cover;
  }

  .eyebrow {
    margin: 0 0 0.5rem;
    color: var(--valorant-red);
    font-family: 'Chakra Petch', sans-serif;
    font-size: 0.75rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  h1,
  h2,
  p {
    margin: 0;
  }

  h1,
  h2 {
    font-family: 'Chakra Petch', sans-serif;
    letter-spacing: 0;
  }

  h1 {
    color: white;
    font-size: clamp(2rem, 4vw, 3.5rem);
  }

  h1 span {
    color: #a8a8b0;
    font-weight: 400;
  }

  h2 {
    color: white;
    font-size: 1.6rem;
  }

  .subtle,
  small,
  .empty p {
    color: #a8a8b0;
  }

  .subtle {
    margin-top: 0.4rem;
  }

  .agent-insight {
    margin-top: 1.25rem;
    color: #e8e8eb;
    font-family: 'Chakra Petch', sans-serif;
    font-size: 0.8rem;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }

  section {
    margin-top: 3rem;
  }

  .section-heading {
    margin-bottom: 1.25rem;
  }

  .metrics {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 1px;
    border: 1px solid #303038;
    background: #303038;
  }

  article {
    display: grid;
    min-height: 9rem;
    align-content: space-between;
    gap: 0.5rem;
    padding: 1.25rem;
    background: #141418;
  }

  article span,
  th {
    color: #a8a8b0;
    font-family: 'Chakra Petch', sans-serif;
    font-size: 0.75rem;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }

  article strong {
    color: white;
    font-family: 'Chakra Petch', sans-serif;
    font-size: 1.8rem;
  }

  .table-wrap {
    overflow-x: auto;
    border: 1px solid #303038;
  }

  .performance-charts {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 1rem;
    margin-bottom: 1.25rem;
  }

  table {
    width: 100%;
    min-width: 50rem;
    border-collapse: collapse;
    text-align: left;
  }

  th,
  td {
    border-bottom: 1px solid #303038;
    padding: 1rem;
    white-space: nowrap;
  }

  tbody tr:last-child td {
    border-bottom: 0;
  }

  td {
    color: #e5e5e8;
    font-size: 0.92rem;
  }

  .outcome {
    font-family: 'Chakra Petch', sans-serif;
    font-weight: 700;
    text-transform: uppercase;
  }

  .win {
    color: #66d59a;
  }

  .loss {
    color: #ff7580;
  }

  .empty {
    max-width: 36rem;
  }

  .empty p:last-child {
    margin-top: 0.75rem;
    line-height: 1.6;
  }

  @media (max-width: 760px) {
    main {
      padding: 8rem 1rem 3rem;
    }

    .metrics {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .performance-charts {
      grid-template-columns: 1fr;
    }

    article {
      min-height: 7.5rem;
      padding: 1rem;
    }

    .header-visual {
      display: none;
    }
  }
</style>
