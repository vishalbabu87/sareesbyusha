# Cloudflare Deployment Guide

## Prerequisites

1. **Install Wrangler CLI:**
```bash
npm install -g wrangler
```

2. **Login to Cloudflare:**
```bash
wrangler login
```

## Important Limitations for Cloudflare

⚠️ **This app uses a database and file uploads which require additional setup on Cloudflare:**

### Option 1: Use Cloudflare with Prisma Accelerate (Recommended)

1. **Set up Prisma Accelerate:**
   - Go to https://cloud.prisma.io/
   - Create a new project
   - Get your Accelerate connection string
   - It will look like: `prisma://accelerate.prisma-data.net/?api_key=...`

2. **Set environment variables in Cloudflare:**
```bash
wrangler secret put DATABASE_URL
# Paste your Prisma Accelerate connection string

# (Optional) This project does not currently use SESSION_SECRET.
# Keep this if you later migrate sessions to signed/encrypted cookies.
# wrangler secret put SESSION_SECRET
# Generate a random string: openssl rand -base64 32
```

### Option 2: Use Vercel Instead (Easier)

If you want easier deployment without database changes:
```bash
# Deploy to Vercel instead
npm i -g vercel
vercel
```

## Build and Deploy

### Use these commands in Cloudflare Pages settings

Set in **Cloudflare Pages → Project Settings → Builds & deployments**:

- **Build command:** `npm run build`
- **Build output directory:** `.vercel/output/static`

`npm run build` must run a plain Next.js build (`next build`).
If it points to `next-on-pages`, Cloudflare can fail with recursive build errors.

For safety, this project uses:
- `build` → `next build`
- `pages:build` → `next-on-pages`

Do **not** use `npx wrangler versions upload` for this project.
That command is for Worker version uploads and causes the
"Missing entry-point to Worker script" error.

### Step 1: Build the static site
```bash
npm run pages:build
```

### Step 2: Deploy to Cloudflare Pages
```bash
npm run deploy
```

Or manually:
```bash
wrangler pages deploy .vercel/output/static --project-name sareesbyusha
```

## Fixing "Internal Server Error" (must-do checklist)

If your site deploys but shows 500/Internal Server Error, this is usually one of these:

1. **Missing `DATABASE_URL` in Cloudflare Pages env vars**
2. **Old build output path deployment mismatch**
3. **Stale secret/config from previous deployments**

Use this exact sequence:

```bash
# 1) Ensure latest code is pushed
git add .
git commit -m "cloudflare runtime/db fixes"
git push

# 2) Set DATABASE_URL in Cloudflare Pages project (Production and Preview)
wrangler secret put DATABASE_URL

# 3) Trigger a fresh deploy
npm run deploy
```

Then verify:

- `https://<your-domain>/api/test-db` should return `status: "success"`
- `https://<your-domain>/api/debug` should show `database_url: "PRESENT"`

If either fails, re-check the `DATABASE_URL` value in Cloudflare Pages Dashboard:

**Pages → sareesbyusha → Settings → Environment variables**

## Configuration

### Environment Variables

Set these in the Cloudflare Dashboard > Pages > Your Project > Settings > Environment Variables:

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | Prisma Accelerate URL | `prisma://accelerate.prisma-data.net/?api_key=xxx` |
| `SESSION_SECRET` | (Optional) Random secret for cookies | `your-random-secret-here` |
| `NODE_ENV` | Environment | `production` |

### Database Setup

1. You need a database that works with Prisma Accelerate:
   - PostgreSQL (Supabase, Railway, Neon, etc.)
   - MySQL
   - MongoDB

2. Run migrations on your database:
```bash
npx prisma migrate deploy
```

## Known Issues on Cloudflare

1. **File Uploads:** Images are saved as base64 in the database. For production, consider:
   - Cloudflare R2 storage
   - External storage like AWS S3 + CloudFront
   - Keep base64 for small images only

2. **API Routes:** Some Node.js APIs may not work. Test thoroughly.

3. **Server-side Features:** Server Actions and API routes need special handling.

## Alternative: Static Export with Client-Side Only

For a fully static site that works anywhere:

1. Remove server-side database calls
2. Use client-side storage (IndexedDB, localStorage)
3. Or use Firebase/Firestore for data

## Testing Locally

```bash
# Build and preview (Cloudflare Pages)
npm run pages:build
npm run pages:dev
```

## Windows note

`@cloudflare/next-on-pages` uses the Vercel CLI internally and can be unreliable on Windows.
If local `npm run pages:build` fails on Windows, use one of these:

1. **Let Cloudflare Pages build it (recommended)** by connecting your GitHub repo
2. **Run builds in WSL** (Ubuntu on Windows)

## Support

- Cloudflare Pages: https://developers.cloudflare.com/pages/
- Prisma Accelerate: https://www.prisma.io/data-platform/accelerate
- Wrangler CLI: https://developers.cloudflare.com/workers/wrangler/