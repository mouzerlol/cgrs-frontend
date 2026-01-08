# CGRS Frontend - Vercel Deployment Guide

## Overview

This guide covers deploying the Coronation Gardens Residents Society website to Vercel, including account setup, pricing considerations, and step-by-step deployment instructions.

## 🚀 Why Vercel?

- **Free Tier**: Generous limits for MVP deployment
- **Next.js Optimized**: Built by the Next.js team
- **Global CDN**: Fast loading worldwide
- **Automatic HTTPS**: SSL certificates included
- **Easy Domain Setup**: Simple custom domain configuration
- **Git Integration**: Automatic deployments from Git (future)

## 💰 Pricing & Free Tier Limits

### Vercel Free Tier (Hobby Plan)
- **Bandwidth**: 100GB/month
- **Build Minutes**: 6,000 minutes/month
- **Serverless Functions**: 100GB-hours/month
- **Edge Functions**: 500,000 invocations/month
- **Custom Domains**: Unlimited
- **Team Members**: 1 (you)

### For CGRS Website
- **Estimated Traffic**: ~300 residents + visitors
- **Bandwidth Usage**: ~1-2GB/month (well within limits)
- **Build Time**: ~2-3 minutes per deployment
- **Cost**: **$0/month** (completely free for MVP)

### When You Might Need Paid Plans
- **Pro Plan ($20/month)**: If you need team collaboration or advanced analytics
- **Enterprise**: Only if you scale to thousands of users

## 📋 Prerequisites

- Vercel account (we'll create this)
- Domain name (cgrs.co.nz) - optional for MVP
- Local development environment ready

## 🔧 Step 1: Create Vercel Account

1. **Visit Vercel**: Go to [vercel.com](https://vercel.com)
2. **Sign Up**: Click "Sign Up" in the top right
3. **Choose Method**: 
   - **Recommended**: Sign up with GitHub (for future Git integration)
   - **Alternative**: Sign up with email
4. **Complete Profile**: Fill in your details
5. **Verify Email**: Check your email and verify your account

## 📦 Step 2: Install Vercel CLI

Install the Vercel CLI globally on your machine:

```bash
npm install -g vercel
```

Verify installation:
```bash
vercel --version
```

## 🔐 Step 3: Login to Vercel

Login to your Vercel account:

```bash
vercel login
```

Follow the prompts:
1. Choose your login method (GitHub recommended)
2. Complete authentication in your browser
3. Return to terminal when prompted

## 🚀 Step 4: Deploy from Local Machine

### Navigate to Project Directory
```bash
cd /home/damander/Projects/cgrs-frontend
```

### Initial Deployment
```bash
vercel
```

**Follow the prompts:**

1. **Set up and deploy?** → `Y`
2. **Which scope?** → Select your account
3. **Link to existing project?** → `N` (first deployment)
4. **Project name** → `cgrs-frontend` (or press Enter for default)
5. **Directory** → `./` (current directory)
6. **Override settings?** → `N` (use Next.js defaults)

### Deployment Process
- Vercel will automatically detect Next.js
- It will run `npm run build`
- Upload files to Vercel's CDN
- Provide you with deployment URLs

### Expected Output
```
✅ Production: https://cgrs-frontend-xxx.vercel.app
✅ Preview: https://cgrs-frontend-git-main-xxx.vercel.app
```

## 🌐 Step 5: Configure Custom Domain (Optional for MVP)

### Option A: Use Vercel Subdomain (Free)
- Your site will be available at: `https://cgrs-frontend-xxx.vercel.app`
- Perfect for MVP testing
- No additional configuration needed

### Option B: Custom Domain (cgrs.co.nz)
1. **In Vercel Dashboard**:
   - Go to your project
   - Click "Settings" → "Domains"
   - Click "Add Domain"
   - Enter: `cgrs.co.nz`

2. **DNS Configuration**:
   - Add CNAME record: `www` → `cname.vercel-dns.com`
   - Add A record: `@` → `76.76.19.61` (Vercel's IP)

3. **SSL Certificate**:
   - Automatically provisioned by Vercel
   - Takes 5-10 minutes to activate

## 🔄 Step 6: Future Deployments

### Redeploy After Changes
```bash
vercel --prod
```

### Deploy Preview (for testing)
```bash
vercel
```

## 📊 Step 7: Monitor Deployment

### Vercel Dashboard
1. Visit [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click on your `cgrs-frontend` project
3. Monitor:
   - **Deployments**: Build status and logs
   - **Analytics**: Traffic and performance
   - **Functions**: Serverless function usage
   - **Domains**: Domain configuration

### Key Metrics to Watch
- **Build Time**: Should be 2-3 minutes
- **Bandwidth**: Monitor monthly usage
- **Uptime**: Should be 99.9%+

## 🛠️ Step 8: Environment Configuration

### Environment Variables (if needed)
```bash
vercel env add VARIABLE_NAME
```

### Build Settings
- **Framework Preset**: Next.js (auto-detected)
- **Build Command**: `npm run build`
- **Output Directory**: `.next` (auto-detected)
- **Install Command**: `npm install`

## 🔧 Step 9: Performance Optimization

### Automatic Optimizations
- **Image Optimization**: Next.js Image component
- **Code Splitting**: Automatic
- **CDN**: Global edge network
- **Compression**: Gzip/Brotli

### Manual Optimizations
- **Bundle Analysis**: `npm run build` shows bundle sizes
- **Lighthouse**: Test performance scores
- **Core Web Vitals**: Monitor in Vercel Analytics

## 🚨 Troubleshooting

### Common Issues

**Build Failures**:
```bash
# Check build logs
vercel logs

# Test build locally
npm run build
```

**Domain Issues**:
- Check DNS propagation (can take 24-48 hours)
- Verify SSL certificate status
- Check domain configuration in Vercel

**Performance Issues**:
- Check bundle size
- Optimize images
- Review Core Web Vitals

### Getting Help
- **Vercel Docs**: [vercel.com/docs](https://vercel.com/docs)
- **Community**: [github.com/vercel/vercel/discussions](https://github.com/vercel/vercel/discussions)
- **Support**: Available in Vercel dashboard

## 📈 Step 10: Post-Deployment Checklist

### ✅ Immediate Tasks
- [ ] Test all pages on live site
- [ ] Verify contact form functionality
- [ ] Check mobile responsiveness
- [ ] Test page load speeds
- [ ] Verify SSL certificate

### ✅ SEO Setup
- [ ] Submit sitemap to Google Search Console
- [ ] Set up Google Analytics (optional)
- [ ] Test meta tags and Open Graph
- [ ] Verify structured data

### ✅ Monitoring Setup
- [ ] Set up uptime monitoring
- [ ] Configure error tracking
- [ ] Monitor Core Web Vitals
- [ ] Set up performance alerts

## 🔄 Step 11: Future Git Integration (Phase 2)

### Connect GitHub Repository
1. **Push to GitHub**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/yourusername/cgrs-frontend.git
   git push -u origin main
   ```

2. **Connect in Vercel**:
   - Go to Vercel dashboard
   - Click "Import Project"
   - Select your GitHub repository
   - Configure build settings

3. **Automatic Deployments**:
   - Every push to `main` = production deployment
   - Pull requests = preview deployments
   - Branch deployments = preview URLs

## 📋 Deployment Commands Summary

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy to production
vercel --prod

# Deploy preview
vercel

# Check deployment status
vercel ls

# View logs
vercel logs

# Remove deployment
vercel remove
```

## 🎯 MVP Deployment Timeline

- **Account Setup**: 5 minutes
- **CLI Installation**: 2 minutes
- **Initial Deployment**: 5-10 minutes
- **Domain Setup**: 10-15 minutes (optional)
- **Testing**: 15-30 minutes
- **Total Time**: ~1 hour

## 💡 Pro Tips

1. **Start with Subdomain**: Use Vercel's free subdomain for MVP testing
2. **Monitor Usage**: Check bandwidth usage monthly
3. **Preview Deployments**: Use `vercel` for testing before `vercel --prod`
4. **Environment Variables**: Store sensitive data in Vercel dashboard
5. **Custom 404**: Your `not-found.tsx` will work automatically

## 🚀 Ready to Deploy?

Your CGRS website is ready for deployment! The MVP includes:
- ✅ All 6 pages (Home, About, Events, News, Contact, Guidelines)
- ✅ Mobile-responsive design
- ✅ Contact form with validation
- ✅ Performance optimized
- ✅ SEO ready
- ✅ Static site generation

**Next Command**: `vercel` (from your project directory)

---

**Need Help?** Contact the development team or refer to [Vercel's documentation](https://vercel.com/docs) for detailed guidance.
