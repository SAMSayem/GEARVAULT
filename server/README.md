# GearVault API

Express + TypeScript API for the GearVault equipment marketplace. Copy `.env.example` to `.env`, configure Atlas and Stripe, then run `npm install`, `npm run dev`.

The Better Auth `user` collection is shared with the Next.js client. API bearer tokens are short-lived JWTs minted by the Next.js `/api/session-token` endpoint and verified by Express. Roles are read from MongoDB on every authenticated API request.
