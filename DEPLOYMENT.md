# Next.js Bundling and Vercel Deployment Guide

This document explains how Next.js bundling works and how this project is deployed to Vercel.

## Next.js Bundling Process

### Build System

Next.js 15 uses different bundlers depending on the context:

- **Development**: Turbopack (default, faster, written in Rust)
- **Production**: Webpack (stable, mature ecosystem)
- Configured automatically or via `next.config.js`

### Build Output Structure

When you run `npm run build` or `make build`, Next.js creates the following structure:

```
.next/
├── static/              # Static assets (JS, CSS, images)
│   ├── chunks/         # Code-split JavaScript bundles
│   ├── css/            # Extracted CSS files
│   └── media/          # Optimized images
├── server/              # Server-side code
│   ├── app/            # App Router pages (SSR/ISR)
│   ├── chunks/         # Server bundles
│   └── middleware.js  # Edge middleware (if present)
├── cache/              # Build cache
└── BUILD_ID            # Unique build identifier
```

### Rendering Strategies

This project uses multiple rendering strategies:

#### 1. Static Site Generation (SSG)
- **Pages**: `blog/[slug]/page.tsx`, `calendar/[slug]/page.tsx`
- **How**: Uses `generateStaticParams()` to pre-render pages at build time
- **Output**: Static HTML files served from CDN
- **Benefits**: Fastest performance, no server needed

#### 2. Server-Side Rendering (SSR)
- **Pages**: `page.tsx` (homepage) with `export const dynamic = 'force-dynamic'`
- **How**: Rendered on each request
- **Output**: Serverless functions that generate HTML dynamically
- **Benefits**: Always fresh content, can access request data

#### 3. Client-Side Rendering (CSR)
- **Components**: Marked with `'use client'` directive
- **How**: Rendered in the browser using JavaScript
- **Output**: JavaScript bundles loaded by the browser
- **Benefits**: Interactive UI, reduced server load

### Code Splitting

Next.js automatically splits code for optimal performance:

- **Route-based splitting**: Each route gets its own bundle
- **Dynamic imports**: Use `next/dynamic` for component-level splitting
- **Shared dependencies**: Common code extracted to shared chunks
- **Tree shaking**: Unused code removed automatically

### Asset Optimization

- **Images**: Next.js Image component optimizes automatically (WebP, AVIF formats)
- **Fonts**: `next/font` optimizes font loading (self-hosting, subsetting)
- **CSS**: Tailwind CSS purged and minified in production
- **JavaScript**: Minified, tree-shaken, and compressed

## Vercel Deployment Process

### How Vercel Deploys Next.js

#### 1. Build Detection
- Vercel automatically detects Next.js projects
- Reads `package.json` for build scripts
- Uses `npm run build` by default (no configuration needed)

#### 2. Build Phase
```
Install Dependencies → npm install
Run Build Command → npm run build
Analyze Output → Detect routes and rendering modes
```

#### 3. Deployment Strategy

Vercel intelligently deploys different parts of your app:

- **Static Routes**: Deployed to CDN (edge locations worldwide)
  - Instant global access
  - Zero cold starts
  - Automatic caching

- **Dynamic Routes**: Deployed as serverless functions
  - Runs on-demand
  - Scales automatically
  - Pay-per-use pricing

- **API Routes**: Deployed as serverless functions
  - Same benefits as dynamic routes
  - Can access request/response objects

- **Middleware**: Deployed to Edge Network
  - Runs at edge locations
  - Ultra-low latency
  - Can modify requests/responses

#### 4. Runtime

- **Node.js Runtime**: For SSR and API routes (Node.js 18+)
- **Edge Runtime**: For middleware and edge functions (V8 isolates)
- **Static Assets**: Served from CDN (global edge network)

### Vercel Features Used

- **Incremental Static Regeneration (ISR)**: Revalidate static pages without full rebuild
- **Edge Functions**: Middleware runs at edge locations for lowest latency
- **Automatic HTTPS**: SSL certificates provisioned automatically
- **Preview Deployments**: Every push gets a preview URL for testing
- **Analytics**: Built-in performance monitoring and Core Web Vitals
- **Automatic Scaling**: Handles traffic spikes automatically

## Current Project Configuration

### Project Status

- ✅ **Linked to Vercel**: `.vercel/project.json` exists
- ✅ **Project ID**: `prj_83OCS3oa9f37Y5GkWUa9Bt1OSDU4`
- ✅ **Organization**: `team_jgW94og8c1KyHN3hIs2zQMCw`
- ✅ **Git Ignore**: `.vercel` folder properly ignored

### Build Configuration

- **Build Command**: `npm run build` (standard Next.js build)
- **Output**: `.next/` directory (not static export)
- **Rendering**: Mixed (SSG + SSR)
- **Static Export**: Disabled (commented out in `next.config.js`)

### Rendering Breakdown

| Page | Strategy | Reason |
|------|----------|--------|
| `/` (homepage) | SSR (`force-dynamic`) | Events filtered at request time |
| `/blog/[slug]` | SSG (`generateStaticParams`) | Static content, pre-renderable |
| `/calendar/[slug]` | SSG (`generateStaticParams`) | Static content, pre-renderable |
| Other pages | Default (SSG) | Static content |

## Deployment Steps

### Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **GitHub Repository**: Code pushed to GitHub (recommended)
3. **Vercel CLI** (optional): `npm i -g vercel`

### Method 1: Automatic Deployment (Recommended)

1. **Connect Repository**:
   - Go to [vercel.com/dashboard](https://vercel.com/dashboard)
   - Click "Add New Project"
   - Import your GitHub repository
   - Vercel auto-detects Next.js settings

2. **Configure Project** (if needed):
   - **Framework Preset**: Next.js (auto-detected)
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: `.next` (auto-detected)
   - **Install Command**: `npm install` (default)

3. **Deploy**:
   - Click "Deploy"
   - Every push to main branch triggers automatic deployment
   - Preview deployments created for pull requests

### Method 2: Vercel CLI Deployment

1. **Install Vercel CLI**:
   ```bash
   npm i -g vercel
   ```

2. **Login**:
   ```bash
   vercel login
   ```

3. **Deploy**:
   ```bash
   # Preview deployment
   vercel

   # Production deployment
   vercel --prod
   ```

### Method 3: Manual Deployment

1. **Build Locally**:
   ```bash
   make build
   # or
   npm run build
   ```

2. **Verify Build**:
   - Check `.next/` directory exists
   - Review build output for errors

3. **Deploy via CLI**:
   ```bash
   vercel --prod
   ```

## Post-Deployment

### Verification Checklist

- [ ] Build completed successfully (check Vercel dashboard)
- [ ] Production URL accessible
- [ ] All routes work correctly
- [ ] Images load properly
- [ ] Forms submit correctly
- [ ] Mobile responsive design works
- [ ] Performance metrics acceptable

### Monitoring

1. **Vercel Dashboard**:
   - View deployment logs
   - Check build times
   - Monitor function invocations

2. **Analytics**:
   - Core Web Vitals
   - Page views
   - Performance metrics

3. **Logs**:
   - Function logs (for SSR/API routes)
   - Edge function logs (for middleware)
   - Build logs

## Troubleshooting

### Build Failures

**Issue**: Build fails with TypeScript errors
- **Solution**: Run `make lint` locally to catch errors before deploying

**Issue**: Build fails with missing dependencies
- **Solution**: Ensure `package.json` includes all dependencies (not just devDependencies)

**Issue**: Build succeeds but deployment fails
- **Solution**: Check Vercel build logs for runtime errors

### Runtime Errors

**Issue**: Pages return 404
- **Solution**: Verify route structure matches `src/app/` directory structure

**Issue**: Images not loading
- **Solution**: Check `next.config.js` image configuration and remote patterns

**Issue**: Environment variables not working
- **Solution**: Add environment variables in Vercel dashboard (Settings → Environment Variables)

### Performance Issues

**Issue**: Slow page loads
- **Solution**: 
  - Check if pages can be statically generated
  - Optimize images
  - Review bundle sizes in build output

**Issue**: High function execution time
- **Solution**:
  - Consider caching strategies
  - Move to static generation where possible
  - Optimize data fetching

## Environment Variables

If your project needs environment variables:

1. **Add in Vercel Dashboard**:
   - Go to Project Settings → Environment Variables
   - Add variables for Production, Preview, and Development

2. **Access in Code**:
   ```typescript
   // Server-side (API routes, SSR)
   const apiKey = process.env.API_KEY;

   // Client-side (must prefix with NEXT_PUBLIC_)
   const publicKey = process.env.NEXT_PUBLIC_API_KEY;
   ```

3. **Local Development**:
   - Create `.env.local` file (not committed to git)
   - Add variables: `API_KEY=your_key_here`

## Optimizations

### Incremental Static Regeneration (ISR)

For pages that need periodic updates:

```typescript
// Revalidate every 60 seconds
export const revalidate = 60;

// Or use on-demand revalidation
export async function GET() {
  await revalidatePath('/blog');
  return Response.json({ revalidated: true });
}
```

### Caching Headers

Configure in `vercel.json`:

```json
{
  "headers": [
    {
      "source": "/static/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

### Image Optimization

Next.js Image component automatically optimizes images:
- Converts to WebP/AVIF formats
- Resizes based on device
- Lazy loads by default
- Serves from CDN

## Additional Resources

- [Next.js Deployment Documentation](https://nextjs.org/docs/deployment)
- [Vercel Documentation](https://vercel.com/docs)
- [Next.js App Router](https://nextjs.org/docs/app)
- [Vercel Build Output API](https://vercel.com/docs/build-output-api/v3)

## Support

For deployment issues:
1. Check Vercel build logs
2. Review Next.js documentation
3. Contact Vercel support (if needed)

For project-specific issues:
- Check project README.md
- Review code comments
- Contact CGRS Development Team
