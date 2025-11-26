# 🚀 Quick Start Guide

Get the Standart PN Notice Filer up and running in 15 minutes.

## Prerequisites (5 min)

1. ✅ GitHub account with repository
2. ✅ Vercel account (sign up at vercel.com)
3. ✅ Shopify store with Admin API access
4. ✅ Node.js 18+ installed locally

## Setup Steps

### 1️⃣ Prepare Shopify API (3 min)

1. Go to Shopify Admin → Settings → Apps and sales channels → Develop apps
2. Create new app or use existing
3. Configure Admin API scope: `read_orders`
4. Copy **Admin API Access Token** (starts with `shpat_`)
5. Note your store domain: `yourstore.myshopify.com`

### 2️⃣ Push to GitHub (2 min)

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPO.git
git push -u origin main
```

### 3️⃣ Deploy to Vercel (3 min)

1. Visit https://vercel.com/dashboard
2. Click **Add New** → **Project**
3. Import your GitHub repository
4. Add Environment Variables:
   ```
   APP_PASSWORD=YourSecurePassword123
   JWT_SECRET=your-32-character-secret-key-here
   SHOPIFY_STORE_DOMAIN=yourstore.myshopify.com
   SHOPIFY_ACCESS_TOKEN=shpat_xxxxx
   ```
5. Click **Deploy** (wait 2-3 minutes)

### 4️⃣ Add Database (2 min)

1. Go to project → **Storage** tab
2. **Create Database** → Select **Postgres**
3. Choose name and region
4. Click **Create**
5. Go to **Deployments** → **Redeploy** latest

### 5️⃣ Initialize Database (3 min)

Run on your local machine:

```bash
./scripts/post-deploy.sh
```

Or manually:
```bash
npm install -g vercel
vercel login
vercel env pull .env.local
npm install
npx prisma generate
npx prisma migrate deploy
npx prisma db seed
```

### 6️⃣ Verify (2 min)

1. Visit your Vercel deployment URL
2. Login with your APP_PASSWORD
3. Go to Products → Add a test product
4. Go to Settings → Verify default values loaded
5. Try generating a test CSV

## 🎉 Done!

Your application is now live and ready to use.

## What's Next?

- [ ] Add your production Shopify products
- [ ] Configure CSV field defaults in Settings
- [ ] Test with real orders
- [ ] Share deployment URL with team

## Need Help?

- 📖 Full guide: [README.md](README.md)
- ✅ Detailed checklist: [DEPLOYMENT.md](DEPLOYMENT.md)
- 🔧 Troubleshooting: See README section 7

## Common Issues

**Can't login?**
→ Check APP_PASSWORD in Vercel environment variables

**Database error?**
→ Verify database was created and redeployed

**Shopify API fails?**
→ Check SHOPIFY_ACCESS_TOKEN and store domain

---

⏱️ **Total Time**: ~15 minutes
🎯 **Difficulty**: Easy
💰 **Cost**: Free (Vercel hobby tier)
