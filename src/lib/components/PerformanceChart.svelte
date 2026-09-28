<script lang="ts">
  import { SvelteMap } from 'svelte/reactivity';
  import {
    area,
    line,
    scaleLinear,
    scaleTime,
    select,
    timeFormat,
    type Selection,
  } from 'd3';

  export type PerformanceChartValue = {
    startedAt: string;
    outcome: 'win' | 'loss' | 'draw';
    value: number | null;
  };

  export type PerformanceChartKind = 'area' | 'bar' | 'line' | 'lollipop';

  type ChartPoint = PerformanceChartValue & {
    gameNumber: number;
    occurredAt: Date;
    value: number;
  };

  type TooltipPoint = {
    gameNumber: number;
    outcome: PerformanceChartValue['outcome'];
    time: string;
    value: number;
    x: number;
    y: number;
  };

  type Props = {
    title: string;
    description: string;
    values: PerformanceChartValue[];
    kind: PerformanceChartKind;
    suffix?: string;
  };

  let { title, description, values, kind, suffix = '' }: Props = $props();
  let chartElement = $state<SVGSVGElement | null>(null);
  let hoveredPoint = $state<TooltipPoint | null>(null);
  const hasData = $derived(values.some((value) => value.value !== null));

  function pointColor(outcome: PerformanceChartValue['outcome']): string {
    if (outcome === 'win') return '#66d59a';
    if (outcome === 'loss') return '#ff7580';
    return '#a8a8b0';
  }

  function showTooltip(
    point: ChartPoint,
    xPosition: number,
    yPosition: number,
    width: number,
    height: number,
    formatTime: (date: Date) => string,
  ): void {
    hoveredPoint = {
      gameNumber: point.gameNumber,
      outcome: point.outcome,
      time: formatTime(point.occurredAt),
      value: point.value,
      x: Math.min(Math.max((xPosition / width) * 100, 22), 78),
      y: Math.max((yPosition / height) * 100, 28),
    };
  }

  function drawChart(svgElement: SVGSVGElement): void {
    const width = 360;
    const height = 188;
    const padding = { top: 18, right: 16, bottom: 28, left: 38 };
    const points: ChartPoint[] = [];

    const gamesByDay = new SvelteMap<string, number>();
    values.forEach((value) => {
      const occurredAt = new Date(value.startedAt);
      if (value.value !== null && !Number.isNaN(occurredAt.getTime())) {
        const dayKey = occurredAt.toLocaleDateString('en-CA');
        const gameNumber = (gamesByDay.get(dayKey) ?? 0) + 1;
        gamesByDay.set(dayKey, gameNumber);
        points.push({ ...value, occurredAt, gameNumber, value: value.value });
      }
    });

    const svg: Selection<SVGSVGElement, unknown, null, undefined> =
      select(svgElement);
    svg.selectAll('*').remove();
    svg.attr('viewBox', `0 0 ${width} ${height}`);

    const maximum = Math.max(...points.map((point) => point.value), 1);
    const firstMatch = points[0].occurredAt;
    const lastMatch = points[points.length - 1].occurredAt;
    const [domainStart, domainEnd] =
      firstMatch.getTime() === lastMatch.getTime()
        ? [
            new Date(firstMatch.getTime() - 30 * 60 * 1000),
            new Date(lastMatch.getTime() + 30 * 60 * 1000),
          ]
        : [firstMatch, lastMatch];
    const x = scaleTime()
      .domain([domainStart, domainEnd])
      .range([padding.left, width - padding.right]);
    const y = scaleLinear()
      .domain([0, maximum])
      .nice()
      .range([height - padding.bottom, padding.top]);

    const ticks = y.ticks(3);
    svg
      .append('g')
      .selectAll('line')
      .data(ticks)
      .join('line')
      .attr('x1', padding.left)
      .attr('x2', width - padding.right)
      .attr('y1', (tick) => y(tick))
      .attr('y2', (tick) => y(tick))
      .attr('stroke', '#303038')
      .attr('stroke-dasharray', '2 4');

    svg
      .append('g')
      .selectAll('text')
      .data(ticks)
      .join('text')
      .attr('x', padding.left - 8)
      .attr('y', (tick) => y(tick) + 4)
      .attr('fill', '#a8a8b0')
      .attr('font-size', 10)
      .attr('text-anchor', 'end')
      .text((tick) => `${tick}${suffix}`);

    const formatTime = timeFormat('%b %-d %H:%M');
    const formatTooltipTime = timeFormat('%A, %b %-d at %-I:%M %p');
    svg
      .append('g')
      .selectAll('text')
      .data(x.ticks(3))
      .join('text')
      .attr('x', (tick) => x(tick))
      .attr('y', height - 8)
      .attr('fill', '#a8a8b0')
      .attr('font-size', 9)
      .attr('text-anchor', 'middle')
      .text((tick) => formatTime(tick));

    const trend = line<ChartPoint>()
      .x((point) => x(point.occurredAt))
      .y((point) => y(point.value));

    if (kind === 'area') {
      const filledArea = area<ChartPoint>()
        .x((point) => x(point.occurredAt))
        .y0(height - padding.bottom)
        .y1((point) => y(point.value));
      svg
        .append('path')
        .datum(points)
        .attr('class', 'area-fill')
        .attr('fill', '#ff4655')
        .attr('fill-opacity', 0.22)
        .attr('d', filledArea);
    }

    if (kind === 'bar') {
      const barWidth = Math.max(
        6,
        Math.min(
          24,
          ((width - padding.left - padding.right) / points.length) * 0.65,
        ),
      );
      svg
        .append('g')
        .selectAll('rect')
        .data(points)
        .join('rect')
        .attr('class', 'metric-bar')
        .attr('x', (point) => x(point.occurredAt) - barWidth / 2)
        .attr('y', (point) => y(point.value))
        .attr('width', barWidth)
        .attr('height', (point) => height - padding.bottom - y(point.value))
        .attr('fill', (point) => pointColor(point.outcome))
        .attr('tabindex', 0)
        .attr('role', 'graphics-symbol')
        .attr(
          'aria-label',
          (point) =>
            `${formatTooltipTime(point.occurredAt)}, game ${point.gameNumber} of the day: ${point.value}${suffix}`,
        )
        .on('pointerenter focus', (_event, point) => {
          showTooltip(
            point,
            x(point.occurredAt),
            y(point.value),
            width,
            height,
            formatTooltipTime,
          );
        })
        .on('pointerleave blur', () => {
          hoveredPoint = null;
        });
      return;
    }

    if (kind === 'lollipop') {
      svg
        .append('g')
        .selectAll('line')
        .data(points)
        .join('line')
        .attr('class', 'lollipop-stem')
        .attr('x1', (point) => x(point.occurredAt))
        .attr('x2', (point) => x(point.occurredAt))
        .attr('y1', height - padding.bottom)
        .attr('y2', (point) => y(point.value))
        .attr('stroke', (point) => pointColor(point.outcome))
        .attr('stroke-width', 2);
    } else {
      svg
        .append('path')
        .datum(points)
        .attr('class', 'trend')
        .attr('fill', 'none')
        .attr('stroke', '#ff4655')
        .attr('stroke-width', 2.5)
        .attr('d', trend);
    }

    svg
      .append('g')
      .selectAll('circle')
      .data(points)
      .join('circle')
      .attr('class', 'metric-mark')
      .attr('cx', (point) => x(point.occurredAt))
      .attr('cy', (point) => y(point.value))
      .attr('r', kind === 'lollipop' ? 4.5 : 3.5)
      .attr('fill', (point) => pointColor(point.outcome))
      .attr('tabindex', 0)
      .attr('role', 'graphics-symbol')
      .attr(
        'aria-label',
        (point) =>
          `${formatTooltipTime(point.occurredAt)}, game ${point.gameNumber} of the day: ${point.value}${suffix}`,
      )
      .on('pointerenter focus', (_event, point) => {
        showTooltip(
          point,
          x(point.occurredAt),
          y(point.value),
          width,
          height,
          formatTooltipTime,
        );
      })
      .on('pointerleave blur', () => {
        hoveredPoint = null;
      });
  }

  $effect(() => {
    if (chartElement && hasData) {
      drawChart(chartElement);
    }
  });
</script>

<article class="chart-card">
  <div class="chart-heading">
    <h3>{title}</h3>
    <p>{description}</p>
  </div>
  {#if hasData}
    <svg bind:this={chartElement} role="img" aria-label={`${title} by match`}
    ></svg>
    {#if hoveredPoint}
      <div
        class="chart-tooltip"
        style:left={`${hoveredPoint.x}%`}
        style:top={`${hoveredPoint.y}%`}
      >
        <strong>{hoveredPoint.value}{suffix}</strong>
        <span>{hoveredPoint.time}</span>
        <span
          >Game {hoveredPoint.gameNumber} of the day · {hoveredPoint.outcome}</span
        >
      </div>
    {/if}
  {:else}
    <p class="empty-chart">No matching history is available for this chart.</p>
  {/if}
</article>

<style>
  .chart-card {
    position: relative;
    min-width: 0;
    border: 1px solid #303038;
    padding: 1.25rem;
    background: #141418;
  }

  .chart-heading h3,
  .chart-heading p {
    margin: 0;
  }

  .chart-heading h3 {
    color: white;
    font-family: 'Chakra Petch', sans-serif;
    font-size: 1rem;
    letter-spacing: 0;
  }

  .chart-heading p,
  .empty-chart {
    margin-top: 0.35rem;
    color: #a8a8b0;
    font-size: 0.82rem;
    line-height: 1.4;
  }

  svg {
    display: block;
    width: 100%;
    margin-top: 1rem;
  }

  .empty-chart {
    min-height: 10rem;
    display: grid;
    align-items: center;
  }

  .chart-tooltip {
    position: absolute;
    z-index: 1;
    display: grid;
    gap: 0.2rem;
    min-width: 10rem;
    border: 1px solid #4a4a55;
    padding: 0.65rem 0.75rem;
    color: #d8d8dc;
    background: #0e0e12;
    box-shadow: 0 0.5rem 1.5rem rgb(0 0 0 / 35%);
    font-size: 0.72rem;
    line-height: 1.35;
    pointer-events: none;
    transform: translate(-50%, -110%);
    animation: tooltip-enter 160ms ease-out;
  }

  .chart-tooltip strong {
    color: white;
    font-family: 'Chakra Petch', sans-serif;
    font-size: 0.95rem;
  }

  .chart-tooltip span:last-child {
    color: #a8a8b0;
    text-transform: capitalize;
  }

  .chart-card :global(.trend) {
    stroke-dasharray: 1000;
    stroke-dashoffset: 1000;
    animation: draw-line 800ms ease-out forwards;
  }

  .chart-card :global(.area-fill) {
    transform-box: fill-box;
    transform-origin: center bottom;
    animation: reveal-area 550ms ease-out both;
  }

  .chart-card :global(.lollipop-stem) {
    transform-box: fill-box;
    transform-origin: center bottom;
    animation: reveal-stem 500ms ease-out both;
  }

  .chart-card :global(.metric-mark),
  .chart-card :global(.metric-bar) {
    cursor: pointer;
    transform-box: fill-box;
    transform-origin: center;
    animation: reveal-mark 450ms ease-out both;
  }

  .chart-card :global(.metric-mark:hover),
  .chart-card :global(.metric-mark:focus-visible) {
    stroke: white;
    stroke-width: 2;
  }

  @keyframes draw-line {
    to {
      stroke-dashoffset: 0;
    }
  }

  @keyframes reveal-area {
    from {
      opacity: 0;
      transform: scaleY(0.01);
    }
  }

  @keyframes reveal-stem {
    from {
      transform: scaleY(0.01);
    }
  }

  @keyframes reveal-mark {
    from {
      opacity: 0;
      transform: scale(0.01);
    }
  }

  @keyframes tooltip-enter {
    from {
      opacity: 0;
      transform: translate(-50%, -100%);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .chart-tooltip,
    .chart-card :global(.trend),
    .chart-card :global(.area-fill),
    .chart-card :global(.lollipop-stem),
    .chart-card :global(.metric-mark),
    .chart-card :global(.metric-bar) {
      animation: none;
    }
  }
</style>
