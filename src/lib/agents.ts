export const AGENTS = [
  'Astra',
  'Breach',
  'Brimstone',
  'Chamber',
  'Clove',
  'Cypher',
  'Deadlock',
  'Fade',
  'Gekko',
  'Harbor',
  'Iso',
  'Jett',
  'KAYO',
  'Killjoy',
  'Miks',
  'Neon',
  'Omen',
  'Phoenix',
  'Raze',
  'Reyna',
  'Sage',
] as const;

export type AgentName = (typeof AGENTS)[number];

export function agentImageUrl(name: AgentName): string {
  return `/images/agents/${name}_Artwork_Full.webp`;
}
