# GearVault — Equipment Rental Platform

A responsive equipment rental marketplace connecting equipment owners with customers. Owners submit equipment listings for review; customers search, filter, favorite, book, and pay for approved equipment; administrators manage users, listings, and rentals.

## Live URL

- Frontend: `https://YOUR-VERCEL-DOMAIN.vercel.app` (replace after deployment)
- Backend: `https://YOUR-RENDER-SERVICE.onrender.com` (replace after deployment)

## Features
- Public registration lets users choose Customer or Owner; new Google sign-ins default to Customer. Admin assignment is restricted to the admin dashboard.


- Responsive industrial-inspired glassmorphism UI with dark graphite surfaces and orange gradients.
- Better Auth email/password registration and Google sign-in; password rules enforced on registration.
- Short-lived JWT API tokens, server-side token verification, and Customer/Owner/Admin role middleware.
- Public approved-equipment marketplace with backend search, category/rental type/availability filters, sorting, and pagination-ready API.
- Equipment details, owner information, favorites, rental request form, date/quantity validation, and duration-based totals.
- Stripe Checkout with signed webhook processing; successful payments create booking and payment records.
- Customer, Owner, and Admin dashboard endpoints; profile management; owner equipment submission; admin approval and role management.
- Admin and owner analytics endpoints (see API route list; dashboard cards are ready to display returned metrics).
- Loading, error, and not-found pages; scheduled booking completion and expired checkout cleanup.

## Tech stack / npm packages

**Client:** Next.js, React, TypeScript, Tailwind CSS, Better Auth, @better-auth/mongo-adapter, Framer Motion, Recharts, Sonner, Lucide React.

**Server:** Express, MongoDB driver, TypeScript, jsonwebtoken, Stripe, cors, helmet, dotenv, node-cron, zod (available for request schemas), bcryptjs.

## Project structure

```text
client/  Next.js App Router application
server/  Express REST API and Stripe webhook
```

## Local setup

1. Install Node.js 20.
2. Copy `client/.env.example` to `client/.env.local` and `server/.env.example` to `server/.env`.
3. Create a MongoDB Atlas database and use the same `MONGODB_URI` and `DB_NAME` in both apps. Never commit env files.
4. Set the same `JWT_SECRET` in both apps. Set Better Auth secret/URL and Google OAuth credentials in the client.
5. Configure Stripe test keys and webhook secret in the server. Set success/cancel URLs to the client domain.
6. From the repository root run `npm install`, `npm install --prefix client`, `npm install --prefix server`, then `npm run dev`.
7. Register the intended admin email through the normal app first, then promote it using `npm run seed:admin --prefix server -- admin@example.com`. The seed script promotes an existing Better Auth account and never stores a plaintext password.

Client runs on `http://localhost:3000`; API runs on `http://localhost:4000`. Health check: `GET http://localhost:4000/health`.

## Deployment

### Render (server)

- Root directory: `server`
- Build command: `npm install && npm run build`
- Start command: `npm start`
- Add all server environment variables from `server/.env.example`. `CLIENT_URLS` must be the exact Vercel origin(s), comma-separated.
- Add a Stripe webhook endpoint at `https://YOUR-RENDER-DOMAIN.onrender.com/api/webhooks/stripe` for `checkout.session.completed`; set its signing secret as `STRIPE_WEBHOOK_SECRET`.

### Vercel (client)

- Root directory: `client`
- Framework: Next.js
- Add all client environment variables. `NEXT_PUBLIC_API_URL` must be `https://YOUR-RENDER-DOMAIN.onrender.com/api`; `BETTER_AUTH_URL` must be the Vercel origin.
- Set `JWT_SECRET` to exactly the same value used by Render.
- Add the Vercel origin to Google OAuth authorized redirect URI: `https://YOUR-VERCEL-DOMAIN.vercel.app/api/auth/callback/google` (verify the callback URL in Better Auth's current docs/config before production).

## Important production checklist

- **Stripe country availability:** Stripe currently does not list Bangladesh among its supported merchant-account countries. A business registered in Bangladesh cannot onboard directly as a Stripe merchant at this time. The Stripe integration is included for the assignment and can be tested with eligible Stripe test credentials, but live payment activation requires a legitimately eligible business account in a supported country. Check [Stripe global availability](https://stripe.com/global) and [account eligibility requirements](https://support.stripe.com/questions/requirements-to-open-a-stripe-account-in-another-country) before planning production payments. Do not use false business details or an unsupported-country workaround.

- Use strong, unique production secrets and test mode Stripe keys until payment flow is verified.
- Verify webhook delivery and signature validation using Stripe CLI before accepting live payments. Do not rely on the browser success redirect as proof of payment.
- The admin seeding script must be run once against the production database. Protect the admin credentials. Register an Owner account, promote it to `owner` using the Admin dashboard, then optionally run `npm run seed:demo --prefix server -- owner@example.com` to add six approved sample listings to the homepage.
- Add your actual deployed URLs to this README and test refresh/direct navigation for every route.
- Configure image host allow-lists if using Next Image optimization; external image URLs are currently rendered unoptimized.
- Test simultaneous bookings, inventory contention, refunds/cancellations, and failed Stripe payments before real-world use.

## API overview

- `GET /health`
- `GET /api/equipment` and `GET /api/equipment/:id`
- `POST /api/equipment/owner`, `GET/PATCH/DELETE /api/equipment/owner...`
- `GET/PATCH/DELETE /api/equipment/admin...`
- `GET/PATCH /api/users/me`; `GET/PATCH /api/users/admin...`
- `GET/POST/DELETE /api/favorites...`
- `GET /api/bookings/mine|owner|admin`; `PATCH /api/bookings/:id/status`
- `POST /api/payments/checkout`; `GET /api/payments/session/:id`
- `POST /api/webhooks/stripe` (Stripe signature required)

## Git commit requirement

Do not submit one giant commit. Use the suggested commit sequence in `GIT-COMMIT-PLAN.md` to create at least 20 meaningful client commits and 12 meaningful server commits in your own GitHub repositories. Commits must represent real incremental work and should not be fabricated after the fact.
