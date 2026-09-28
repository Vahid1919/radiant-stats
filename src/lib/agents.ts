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
  'Skye',
  'Sova',
  'Tejo',
  'Veto',
  'Viper',
  'Vyse',
  'Waylay',
  'Yoru',
] as const;

export type AgentName = (typeof AGENTS)[number];

const PNG_ARTWORK_AGENTS = new Set<AgentName>([
  'Skye',
  'Sova',
  'Tejo',
  'Veto',
  'Viper',
  'Vyse',
  'Waylay',
  'Yoru',
]);

export function getAgentArtworkName(agentName: string): AgentName | null {
  const artworkName = agentName === 'KAY/O' ? 'KAYO' : agentName;
  return AGENTS.includes(artworkName as AgentName)
    ? (artworkName as AgentName)
    : null;
}

export function agentImageUrl(name: AgentName): string {
  const extension = PNG_ARTWORK_AGENTS.has(name) ? 'png' : 'webp';
  return `/images/agents/${name}_Artwork_Full.${extension}`;
}
