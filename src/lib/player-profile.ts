export type PlayerProfile = {
  puuid: string;
  riotId: {
    name: string;
    tag: string;
  };
  region: string;
  accountLevel: number;
  card: {
    id: string;
    small: string;
    large: string;
    wide: string;
  };
  lastUpdatedAt: string;
};
