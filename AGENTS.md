# AGENTS.md

## Cursor Cloud specific instructions

This is a single Next.js 16 browser game (FLARE: Earthfall) with no backend, database, or external services. All game state is client-side React state.

### Quick reference

| Action | Command |
|--------|---------|
| Install deps | `npm install` |
| Dev server | `npm run dev` |
| Lint | `npm run lint` |
| Build | `npm run build` |

### Notes

- The project uses **npm** (lockfile: `package-lock.json`).
- No environment variables or `.env` files are needed.
- No tests are configured yet (`npm test` exits with error by design).
- Dev server runs on port 3000 by default (Turbopack).
- The app is entirely static/client-side — no API routes, no database, no auth.
