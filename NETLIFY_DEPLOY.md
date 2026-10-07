# CashCoin Netlify Deployment

This project is prepared for Netlify's platform-managed OpenNext adapter.

## Netlify site settings

- **Repository:** `danyal955163/cash-coin-`
- **Branch:** `main`
- **Build command:** `npm run build`
- **Publish directory:** `.next`
- **Node.js:** `20`
- **Do not add** `@netlify/plugin-nextjs` manually. Netlify detects Next.js and manages the adapter automatically.
- **Do not use** `next export`, `output: "export"`, Cloudflare adapters, or Edge runtime settings.

`netlify.toml` already contains these build settings. The project also enables `NETLIFY_NEXT_SKEW_PROTECTION=true` to reduce client/deployment version mismatch errors during releases.

## Required environment variables

Add these in **Netlify → Site configuration → Environment variables** for the Production, Deploy Preview, and Branch deploy scopes as needed:

```text
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
OPENROUTER_API_KEY
NEXT_PUBLIC_MONETAG_DIRECT_LINK
NEXT_PUBLIC_SITE_URL
```

The repository template is in `.env.local.example`.

## First deployment

1. Import the GitHub repository into Netlify.
2. Select the `main` branch.
3. Confirm the build command and publish directory above.
4. Add the environment variables before deploying.
5. Trigger a fresh deploy with **Clear cache and deploy site** if the site had older failed builds.

## If a deploy fails

- Check that the deploy uses Node 20 and the `main` branch.
- Confirm all required environment variables exist in the selected deploy scope.
- Do not install a second Netlify Next.js plugin in the UI or repository.
- Use **Clear cache and deploy site** after changing Node, Next.js, or environment settings.
- If the build succeeds but function upload returns HTTP 400, retry once after a clean cache deploy; this error can be a platform-side function provisioning failure rather than an application compile error.

## Verified locally

The repository was tested with:

```bash
rm -rf node_modules .next
npm ci --legacy-peer-deps
npm run build
```

The clean build completed successfully on Next.js `15.5.27` and generated `38/38` routes.
