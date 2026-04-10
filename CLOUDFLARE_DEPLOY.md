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

wrangler secret put SESSION_SECRET
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

### Step 1: Build the static site
```bash
npm run build
```

### Step 2: Deploy to Cloudflare Pages
```bash
npm run deploy
```

Or manually:
```bash
wrangler pages deploy dist
```

## Configuration

### Environment Variables

Set these in the Cloudflare Dashboard > Pages > Your Project > Settings > Environment Variables:

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | Prisma Accelerate URL | `prisma://accelerate.prisma-data.net/?api_key=xxx` |
| `SESSION_SECRET` | Random secret for cookies | `your-random-secret-here` |
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
# Build and preview
npm run build
npm run preview
```

## Support

- Cloudflare Pages: https://developers.cloudflare.com/pages/
- Prisma Accelerate: https://www.prisma.io/data-platform/accelerate
- Wrangler CLI: https://developers.cloudflare.com/workers/wrangler/