// Verification script to check if all required files are present
const fs = require('fs');
const path = require('path');

const requiredFiles = [
  'package.json',
  'prisma/schema.prisma',
  'prisma/seed.ts',
  'lib/db.ts',
  'lib/auth.ts',
  'lib/shopify.ts',
  'lib/csv-generator.ts',
  'middleware.ts',
  'app/page.tsx',
  'app/login/page.tsx',
  'app/products/page.tsx',
  'app/settings/page.tsx',
  'app/api/auth/login/route.ts',
  'app/api/auth/logout/route.ts',
  'app/api/products/route.ts',
  'app/api/products/[id]/route.ts',
  'app/api/settings/route.ts',
  'app/api/generate-csv/route.ts',
  'components/navbar.tsx',
  'components/csv-upload-form.tsx',
  'components/manual-entry-form.tsx',
  '.env.local',
  'README.md',
];

console.log('🔍 Verifying application setup...\n');

let allFilesPresent = true;

requiredFiles.forEach(file => {
  const filePath = path.join(process.cwd(), file);
  const exists = fs.existsSync(filePath);
  const status = exists ? '✅' : '❌';
  console.log(`${status} ${file}`);
  if (!exists) allFilesPresent = false;
});

console.log('\n' + '='.repeat(50));

if (allFilesPresent) {
  console.log('✅ All required files are present!');
  console.log('\n📝 Next steps:');
  console.log('1. Configure environment variables in .env.local');
  console.log('2. Deploy to Vercel');
  console.log('3. Set up Vercel Postgres database');
  console.log('4. Run: npx prisma migrate deploy');
  console.log('5. Run: npx prisma db seed');
  console.log('6. Start using the application!');
} else {
  console.log('❌ Some files are missing. Please check the setup.');
}

console.log('='.repeat(50));
