# Standart PN Notice Filer

A Next.js web application for generating CSV files compatible with CustomsCity for FDA PN submission. The application retrieves order data from Shopify and manages product codes via a PostgreSQL database.

## Features

- **Password-protected access** with JWT-based authentication
- **CSV/Excel file upload** for bulk order processing
- **Manual order entry** for individual submissions
- **Product management** with CustomsCity product codes
- **Settings management** for CSV field mapping and sticker dimensions
- **Shopify integration** with GraphQL API for order data retrieval
- **Rate limiting and retry logic** for Shopify API calls
- **Responsive design** that works on all devices

## Tech Stack

- **Next.js 14** (App Router, TypeScript)
- **Vercel** for deployment
- **Vercel Postgres** for database
- **Prisma ORM** for database operations
- **React Server Components** and Server Actions
- **Tailwind CSS** for styling
- **XLSX** for Excel file parsing
- **Jose** for JWT authentication
- **date-fns** for date manipulation

## Prerequisites

- Node.js 18+ and npm
- A Vercel account
- A Shopify store with Admin API access
- Vercel Postgres database (created during Vercel deployment)

## Getting Started

> 📚 **Quick Links**: 
> - [Complete Deployment Guide](#5-deploy-to-vercel-github-integration) (see below)
> - [Quick Deployment Checklist](DEPLOYMENT.md)
> - [Post-Deployment Script](scripts/post-deploy.sh)

### 1. Clone the Repository

```bash
git clone <repository-url>
cd pn-filing-app-2
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
# Authentication
APP_PASSWORD=your-shared-password
JWT_SECRET=your-jwt-secret-key-min-32-chars

# Shopify API
SHOPIFY_STORE_DOMAIN=your-store.myshopify.com
SHOPIFY_ACCESS_TOKEN=your-shopify-admin-api-token

# Database (provided by Vercel Postgres)
POSTGRES_URL=
```

#### Environment Variable Details

- **APP_PASSWORD**: The shared password for accessing the application
- **JWT_SECRET**: A secret key for JWT token signing (minimum 32 characters)
- **SHOPIFY_STORE_DOMAIN**: Your Shopify store domain (e.g., `yourstore.myshopify.com`)
- **SHOPIFY_ACCESS_TOKEN**: Shopify Admin API access token with `read_orders` permission
- **POSTGRES_URL**: Provided by Vercel Postgres (database connection URL)

### 4. Set Up Shopify Admin API Access

1. Go to your Shopify Admin dashboard
2. Navigate to **Settings** → **Apps and sales channels** → **Develop apps**
3. Create a new app or select an existing one
4. Under **Admin API**, configure the scopes to include `read_orders`
5. Install the app and copy the **Admin API access token**
6. Use your store's myshopify.com domain (e.g., `yourstore.myshopify.com`)

### 5. Deploy to Vercel (GitHub Integration)

This is the **recommended deployment method** for production use.

#### Step-by-Step Deployment Process

##### 5.1. Push Your Code to GitHub

```bash
# Initialize git repository (if not already initialized)
git init

# Add all files
git add .

# Commit your changes
git commit -m "Initial commit: Standart PN Notice Filer"

# Add your GitHub repository as remote
git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPO-NAME.git

# Push to GitHub
git push -u origin main
```

##### 5.2. Create Vercel Project

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **Add New** → **Project**
3. Click **Import** next to your GitHub repository
4. Configure the project:
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `./` (default)
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: `.next` (default)

##### 5.3. Set Up Environment Variables

Before deploying, add these environment variables in the Vercel project settings:

1. In the project configuration page, scroll to **Environment Variables**
2. Add each variable for all environments (Production, Preview, Development):

```env
APP_PASSWORD=your-secure-password-here
JWT_SECRET=your-32-plus-character-secret-key-here
SHOPIFY_STORE_DOMAIN=yourstore.myshopify.com
SHOPIFY_ACCESS_TOKEN=shpat_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**Important**: DO NOT add the Postgres variables yet - they will be added automatically in the next step.

##### 5.4. Create Vercel Postgres Database

**After the initial deployment**, set up the database:

1. Go to your project dashboard on Vercel
2. Navigate to the **Storage** tab
3. Click **Create Database**
4. Select **Postgres** from the database options
5. Click **Continue**
6. Choose a database name (e.g., `pn-filer-db`)
7. Select your preferred region (choose closest to your users)
8. Click **Create**

Vercel will automatically:
- Create the Postgres database
- Add the following environment variables to your project:
  - `POSTGRES_URL`
  - `POSTGRES_PRISMA_URL`
  - `POSTGRES_URL_NON_POOLING`
  - `POSTGRES_URL_NO_SSL`
  - `POSTGRES_USER`
  - `POSTGRES_HOST`
  - `POSTGRES_PASSWORD`
  - `POSTGRES_DATABASE`

##### 5.5. Verify Environment Variables

1. Go to **Settings** → **Environment Variables**
2. Verify all required variables are present:
   - ✅ APP_PASSWORD
   - ✅ JWT_SECRET
   - ✅ SHOPIFY_STORE_DOMAIN
   - ✅ SHOPIFY_ACCESS_TOKEN
   - ✅ POSTGRES_URL (added by Vercel)

##### 5.6. Redeploy After Database Setup

After adding the database, trigger a new deployment:

1. Go to **Deployments** tab
2. Click the **⋯** menu on the latest deployment
3. Click **Redeploy**
4. Select **Use existing Build Cache**
5. Click **Redeploy**

This ensures your application connects to the database properly.

### 6. Initialize Database (Post-Deployment)

After your Vercel deployment is live with the database connected, you need to initialize the database schema and seed initial data.

#### Option A: Automated Script (Recommended)

Use the provided post-deployment script:

```bash
# Make sure you're in the project root directory
cd pn-filing-app-2

# Run the automated setup script
./scripts/post-deploy.sh
```

This script will:
1. ✅ Pull environment variables from Vercel
2. ✅ Validate all required variables are set
3. ✅ Install dependencies
4. ✅ Generate Prisma Client
5. ✅ Run database migrations
6. ✅ Seed default settings

#### Option B: Manual Setup

If you prefer to run commands manually:

```bash
# Install Vercel CLI if not installed
npm install -g vercel

# Login to Vercel
vercel login

# Pull environment variables from your deployment
vercel env pull .env.local

# Install dependencies
npm install

# Generate Prisma Client
npx prisma generate

# Run database migrations
npx prisma migrate deploy

# Seed the database with default settings
npx prisma db seed
```

#### Verify Database Setup

After running the setup:

1. Visit your Vercel deployment URL
2. You should see the login page
3. Try logging in with your `APP_PASSWORD`
4. Navigate to **Settings** - you should see default CSV field values
5. Navigate to **Products** - you should be able to add products

### 7. Troubleshooting Deployment

#### Database Connection Issues

**Problem**: "Can't reach database server" error

**Solutions**:
1. Verify `POSTGRES_URL` is set in Vercel
2. Check if the database was created successfully in Storage tab
3. Redeploy the application after adding the database
4. Check Vercel Function logs for detailed error messages

#### Migration Errors

**Problem**: Migration fails with "relation already exists"

**Solutions**:
```bash
# Reset the database (⚠️ This will delete all data)
npx prisma migrate reset

# Or manually push the schema
npx prisma db push
```

#### Environment Variable Issues

**Problem**: Variables not loading properly

**Solutions**:
1. Ensure variables are set for the correct environment (Production/Preview)
2. Redeploy after adding new variables
3. Use `vercel env pull` to sync locally
4. Check for typos in variable names

#### Build Failures

**Problem**: Build fails on Vercel

**Solutions**:
1. Check build logs in Vercel dashboard
2. Verify `package.json` scripts are correct
3. Ensure all dependencies are in `dependencies` (not just `devDependencies`)
4. Try building locally: `npm run build`

## Development

To run the application locally:

```bash
# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

### 1. Login

Access the application and log in using the password set in the `APP_PASSWORD` environment variable.

### 2. Manage Products

Navigate to the **Products** page to:
- Add new products with nicknames and CustomsCity product codes
- Edit existing products
- Delete products

### 3. Generate CSV Files

#### Option A: Upload CSV/Excel File

1. Prepare a CSV or Excel file with two columns: `OrderName` and `Tracking`
2. Select a product from the dropdown (assumes all orders contain this product)
3. Set the Estimated Date of Arrival (defaults to today + 21 days)
4. Upload the file
5. Review the preview
6. Click **Generate CSV**

#### Option B: Manual Entry

1. Enter order details manually:
   - Order Name (Shopify order name)
   - Tracking Number
   - Select one or more products with quantities
2. Add multiple orders if needed
3. Set the Estimated Date of Arrival
4. Click **Generate CSV**

The application will:
- Fetch order details from Shopify
- Generate CSV rows according to CustomsCity format
- Download the CSV file to your computer

### 4. Configure Settings

Navigate to the **Settings** page to:
- Set sticker dimensions (height and width in mm)
- Configure default values for static CSV fields
- View dynamic field sources (read-only)

## Database Schema

### Product

- `id`: Unique identifier
- `nickname`: User-friendly product name
- `productCode`: CustomsCity product code
- `createdAt`: Timestamp
- `updatedAt`: Timestamp

### Settings

- `id`: Unique identifier
- `key`: Setting key
- `value`: Setting value
- `updatedAt`: Timestamp

## CSV Output Format

The generated CSV file contains 46 columns as required by CustomsCity:

1. Entry Type
2. Reference Qualifier
3. Reference Number
4. Mode of Transport
5. I dont have a Tracking Number
6. Bill Type
7. MBOL/TRIP Number (Order Name)
8. HBOL/ Shipment Control Number (Tracking)
9. Estimate Date of Arrival (MM/DD/YYYY)
10. Time of Arrival
11. US Port of Arrival
12. Equipment Number
13. Shipper Name
14. Shipper Address
15. Shipper City
16. Shipper Country
17. Consignee Name (from Shopify)
18. Consignee Address (from Shopify)
19. Consignee City (from Shopify)
20. Consignee State or Province (from Shopify)
21. Consignee Postal Code (from Shopify)
22. Consignee Country (from Shopify, 2-letter ISO code)
23. Description
24. Product ID (CustomsCity code)
25. PGA Product Base UOM
26. PGA Product Base Quantity
27-46. Additional PGA Product fields and carrier information

## API Routes

- `POST /api/auth/login` - Authenticate user
- `POST /api/auth/logout` - Log out user
- `GET /api/products` - Get all products
- `POST /api/products` - Create a new product
- `PUT /api/products/[id]` - Update a product
- `DELETE /api/products/[id]` - Delete a product
- `GET /api/settings` - Get all settings
- `POST /api/settings` - Update settings
- `POST /api/generate-csv` - Generate CSV file

## Security

- All routes except `/login` are protected by middleware
- JWT tokens are stored in HTTP-only cookies
- Passwords are environment variables, not stored in database
- API routes are protected by the same authentication middleware

## Troubleshooting

### Shopify API Rate Limiting

The application includes automatic retry logic with exponential backoff for Shopify API calls. If you encounter rate limiting issues:
- The app will automatically retry after the specified wait time
- Consider reducing batch sizes for very large order lists

### Database Connection Issues

If you encounter database connection issues:
- Verify that the Vercel Postgres environment variables are correctly set
- Ensure migrations have been run: `npx prisma migrate deploy`
- Check Vercel logs for detailed error messages

### CSV Generation Errors

If CSV generation fails:
- Verify that all orders exist in Shopify
- Check that products are correctly configured
- Ensure Shopify API credentials are valid
- Review browser console and Vercel logs for error details

## License

Private - All rights reserved

## Support

For issues or questions, please contact the development team.
