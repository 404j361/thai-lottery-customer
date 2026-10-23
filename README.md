# Thai Lottery Customer

Mobile-first customer wallet app built with TanStack Start and shadcn/ui.

## Features

- Email/password register & login, Google OAuth (`?app=shop`)
- Wallet balances
- Guided top-up (wallet → bank → amount + receipt)
- Withdrawals to a saved bank account
- Transaction history
- Profile / bank account management

## Setup

```bash
pnpm install
pnpm dev
```

App runs at [http://localhost:3002](http://localhost:3002) and proxies `/api` to `BACKEND_URL` (default `http://localhost:8000`).

Copy `.env.example` to `.env` (or edit `.env` directly). Variables used by the app:

| Variable | Where | Purpose |
|----------|--------|---------|
| `BACKEND_URL` | `vite.config.ts` | Dev proxy target for `/api` (default `http://localhost:8000`) |
| `VITE_API_URL` | `src/lib/api.ts` | Client API origin; leave empty in dev to use the proxy |
| `VITE_CONTACT_FACEBOOK` | `src/features/contact/channels.ts` | Facebook contact URL |
| `VITE_CONTACT_MESSENGER` | `src/features/contact/channels.ts` | Messenger contact URL |
| `VITE_CONTACT_TELEGRAM` | `src/features/contact/channels.ts` | Telegram contact URL |
| `VITE_CONTACT_VIBER` | `src/features/contact/channels.ts` | Viber contact URL |

Leave `VITE_API_URL` empty in local dev so requests use the Vite proxy. Restart the dev server after changing env.

## Deploy (Vercel)

This is a **TanStack Start** app. Vercel needs the **Nitro** Vite plugin (already in `vite.config.ts`).

1. Framework preset: **TanStack Start** (auto-detect once Nitro is present).
2. Do **not** set a custom static `outputDirectory` like `dist` / `.next`.
3. In Vercel env, set `VITE_API_URL` to your public API origin (the Vite `BACKEND_URL` proxy only works locally).
4. Redeploy after adding Nitro.
