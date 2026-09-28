import { describe, expect, it } from 'vitest';
import { agentImageUrl, getAgentArtworkName } from '../src/lib/agents';

describe('agent artwork helpers', () => {
  it('uses the local PNG artwork for newly added agents', () => {
    expect(getAgentArtworkName('Vyse')).toBe('Vyse');
    expect(agentImageUrl('Vyse')).toBe('/images/agents/Vyse_Artwork_Full.png');
    expect(agentImageUrl('Viper')).toBe(
      '/images/agents/Viper_Artwork_Full.png',
    );
  });

  it('normalizes provider display names to local asset names', () => {
    expect(getAgentArtworkName('KAY/O')).toBe('KAYO');
    expect(agentImageUrl('KAYO')).toBe('/images/agents/KAYO_Artwork_Full.webp');
  });
});
