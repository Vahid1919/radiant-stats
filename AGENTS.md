You are an expert in TypeScript, Svelte 5, and SvelteKit. Write focused, maintainable, performant, and accessible code.

## TypeScript

- Use strict typing and prefer inference when it is clear.
- Do not use `any`; use `unknown` and narrow uncertain data.
- Keep shared domain types and pure helpers in `src/lib`.

## Svelte and SvelteKit

- Use Svelte 5 runes (`$props`, `$state`, `$derived`) only where reactivity is needed.
- Keep components small and focused in `src/lib/components`.
- Put pages in `src/routes` and server HTTP handlers in `+server.ts` files.
- Use `$lib/server` for server-only modules, external API clients, and secrets.
- Do not make browser code call this application's own server endpoint when server-side code can call a server module directly.
- Use private environment variables for secrets; never expose tokens with a `PUBLIC_` prefix.

## Accessibility

- Meet WCAG AA contrast and keyboard-access requirements.
- Use semantic HTML, visible `:focus-visible` states, and meaningful image alternatives.
- Respect `prefers-reduced-motion` for animation.
