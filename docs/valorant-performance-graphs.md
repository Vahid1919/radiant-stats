# Valorant Performance Graph Research

## Question

Which HenrikDev match fields can support useful Player Dashboard graphs, and how
much Competitive History can the dashboard load?

## Verified HenrikDev Facts

- The current `GET /valorant/v4/matches/{affinity}/pc/{name}/{tag}` request
  accepts `size` and `start` for pagination.
- Each v4 Competitive Match includes player statistics, Agent, tier, economy,
  ability casts, behaviour, detailed rounds, and kill events.
- A v4 match includes `first_bloods` for a player, plus the round and kill-event
  data needed to calculate opening-duel measures.
- The stored-matches endpoint can return all currently stored matching records
  when `size` is omitted. Its `total` is not a Player's career total.
- Stored Matches are incomplete by design: they can contain holes and page
  positions can change. Their response has less detail than the v4 match
  response.

## Implications

- First Blood trends should use paginated v4 match history, not Stored Matches.
- The dashboard must describe loaded history as available history, not complete
  career history.
- Raw kills per match are misleading because Competitive Matches have different
  numbers of rounds. First Blood measures should be normalized by all completed
  rounds.

## Product Hypotheses To Validate

- Show First Bloods per 100 rounds with the number of Competitive Matches and
  rounds in the selected sample.

## Sources

- [HenrikDev: Get matches by name (v4)](https://docs.henrikdev.xyz/api-reference/valorant/get-matches-by-name-v4.md)
- [HenrikDev: Stored Matches](https://docs.henrikdev.xyz/valorant/guides/stored-matches.md)
- [HenrikDev OpenAPI specification](https://docs.henrikdev.xyz/api-reference/openapi.json)
