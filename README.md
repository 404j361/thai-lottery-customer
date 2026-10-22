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

Optional env:

```bash
BACKEND_URL=http://localhost:8000
VITE_API_URL=
```

Leave `VITE_API_URL` empty in local dev so requests use the Vite proxy.
