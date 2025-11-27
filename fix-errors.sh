#!/bin/bash

echo "🔧 Fixing AI Music System errors..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "package.json not found. Please run this script from the project root directory."
    exit 1
fi

print_status "Found package.json, proceeding with fixes..."

# 1. Check Node.js installation
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Installing Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs
else
    print_status "Node.js is installed: $(node --version)"
fi

# 2. Install/update dependencies
print_status "Installing dependencies..."
npm install

# 3. Generate Prisma client
print_status "Generating Prisma client..."
if npx prisma generate; then
    print_status "Prisma client generated successfully"
else
    print_warning "Prisma client generation failed, but continuing..."
fi

# 4. Check environment file
if [ ! -f ".env" ]; then
    print_warning ".env file not found, creating from example..."
    if [ -f ".env.example" ]; then
        cp .env.example .env
        print_status "Created .env from .env.example"
    else
        print_warning "No .env.example found, creating basic .env file..."
        cat > .env << EOF
# Database
DATABASE_URL="postgresql://user:password@host:5432/database?sslmode=require"

# JWT Secret (generate a random string)
JWT_SECRET="$(openssl rand -hex 32)"

# Groq API
GROQ_API_KEY="your-groq-api-key"

# AcoustID (Optional - free music recognition)
ACOUSTID_API_KEY=""

# Cloudinary (Optional)
CLOUDINARY_CLOUD_NAME=""
CLOUDINARY_UPLOAD_PRESET=""
CLOUDINARY_API_KEY=""
CLOUDINARY_API_SECRET=""

# App URL
APP_URL="http://localhost:3000"
EOF
        print_status "Created basic .env file"
    fi
else
    print_status ".env file exists"
fi

# 5. Try to push database schema (if DATABASE_URL is configured)
if grep -q "postgresql://" .env 2>/dev/null; then
    print_status "Attempting to sync database schema..."
    if npx prisma db push --accept-data-loss; then
        print_status "Database schema synced successfully"
    else
        print_warning "Database sync failed - please check your DATABASE_URL"
    fi
else
    print_warning "DATABASE_URL not configured in .env file"
fi

# 6. Check for common file issues
print_status "Checking for common file issues..."

# Check if all required API files exist
api_files=(
    "api/lib/db.ts"
    "api/lib/auth.ts"
    "api/auth/login.ts"
    "api/auth/register.ts"
    "api/me/index.ts"
)

for file in "${api_files[@]}"; do
    if [ -f "$file" ]; then
        print_status "Found $file"
    else
        print_error "Missing $file"
    fi
done

# 7. Create a simple test script
cat > test-server.js << 'EOF'
const express = require('express');
const app = express();
const port = 3001;

app.use(express.json());

app.get('/test', (req, res) => {
    res.json({ message: 'Server is working!', timestamp: new Date().toISOString() });
});

app.listen(port, () => {
    console.log(`Test server running at http://localhost:${port}`);
    console.log('Visit http://localhost:3001/test to verify');
});
EOF

print_status "Created test-server.js for basic testing"

echo ""
echo "🎉 Fix script completed!"
echo ""
echo "📋 Next steps:"
echo "1. Update your .env file with correct values:"
echo "   - DATABASE_URL: Your PostgreSQL connection string"
echo "   - GROQ_API_KEY: Get from https://console.groq.com"
echo ""
echo "2. Test basic server functionality:"
echo "   node test-server.js"
echo ""
echo "3. Start the development server:"
echo "   npm run dev"
echo ""
echo "4. If you still get errors, check the logs and:"
echo "   - Verify your database is running"
echo "   - Check all API keys are valid"
echo "   - Run: npx prisma studio (to test database connection)"
echo ""
echo "🔍 For detailed troubleshooting, see TROUBLESHOOTING.md"
