export { AGENTS } from '@radiant-stats/shared';
export type { AgentName } from '@radiant-stats/shared';
import type { AgentName } from '@radiant-stats/shared';

export function agentImageUrl(name: AgentName): string {
  return `images/agents/${name}_Artwork_Full.webp`;
}
