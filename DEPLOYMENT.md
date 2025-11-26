# Deployment Checklist

Quick reference guide for deploying the Standart PN Notice Filer to Vercel from GitHub.

## Pre-Deployment Checklist

- [ ] Code is committed and pushed to GitHub
- [ ] Shopify Admin API access token is ready
- [ ] Vercel account is created and ready
- [ ] Have chosen a secure APP_PASSWORD
- [ ] Have generated a JWT_SECRET (32+ characters)

## Deployment Steps

### 1. Prepare Shopify API Credentials

```bash
Store Domain: yourstore.myshopify.com
Access Token: shpat_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

Required Shopify API scope: `read_orders`

### 2. Deploy to Vercel

1. Go to https://vercel.com/dashboard
2. Click **Add New** → **Project**
3. Select your GitHub repository
4. Click **Import**

### 3. Configure Environment Variables

Add these BEFORE first deployment:

```env
APP_PASSWORD=your-secure-password
JWT_SECRET=your-32-character-secret-key
SHOPIFY_STORE_DOMAIN=yourstore.myshopify.com
SHOPIFY_ACCESS_TOKEN=shpat_xxxxxxxxxxxxxxxxxxxxx
```

⚠️ DO NOT add database variables - they'll be auto-added in step 4.

### 4. Click Deploy

Wait for initial deployment to complete (2-3 minutes).

### 5. Add Vercel Postgres Database

After deployment:

1. Go to project dashboard → **Storage** tab
2. Click **Create Database**
3. Select **Postgres**
4. Choose database name and region
5. Click **Create**

✅ Database variables will be automatically added

### 6. Redeploy

After database creation:

1. Go to **Deployments** tab
2. Click **⋯** on latest deployment
3. Click **Redeploy**
4. Confirm and wait for completion

### 7. Initialize Database

On your local machine:

```bash
# Run the automated setup script
./scripts/post-deploy.sh
```

Or manually:

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Pull environment variables
vercel env pull .env.local

# Setup database
npm install
npx prisma generate
npx prisma migrate deploy
npx prisma db seed
```

### 8. Verify Deployment

1. Visit your deployment URL
2. Login with APP_PASSWORD
3. Check Settings page (should show default values)
4. Add a test product
5. Try generating a CSV

## Quick Troubleshooting

| Problem | Solution |
|---------|----------|
| Can't login | Check APP_PASSWORD in environment variables |
| Database connection error | Verify POSTGRES_PRISMA_URL exists, redeploy |
| Build fails | Check build logs, verify all dependencies |
| 500 errors | Check Function logs in Vercel dashboard |
| Shopify API fails | Verify SHOPIFY_ACCESS_TOKEN and store domain |

## Environment Variables Reference

### Required (Manual Setup)
```
APP_PASSWORD              - Your login password
JWT_SECRET                - 32+ character secret key
SHOPIFY_STORE_DOMAIN      - yourstore.myshopify.com
SHOPIFY_ACCESS_TOKEN      - Shopify Admin API token
```

### Auto-Added by Vercel
```
POSTGRES_URL              - Database connection URL
POSTGRES_PRISMA_URL       - Prisma connection URL (use this)
POSTGRES_URL_NON_POOLING  - Direct connection URL
POSTGRES_URL_NO_SSL       - Non-SSL connection
POSTGRES_USER             - Database user
POSTGRES_HOST             - Database host
POSTGRES_PASSWORD         - Database password
POSTGRES_DATABASE         - Database name
```

## Post-Deployment Updates

When you make code changes:

```bash
# Commit and push to GitHub
git add .
git commit -m "Your commit message"
git push

# Vercel will automatically deploy
```

For environment variable changes:
1. Update in Vercel dashboard → Settings → Environment Variables
2. Redeploy from Deployments tab

## Need Help?

- Check the main [README.md](README.md) for detailed instructions
- Review Vercel Function logs for errors
- Verify all environment variables are set correctly
- Ensure database migrations completed successfully

---

**Deployment Status**: Complete ✅ when all steps pass verification
