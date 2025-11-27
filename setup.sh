#!/bin/bash

echo "🔧 Setting up AI Music System..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first:"
    echo "   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -"
    echo "   sudo apt-get install -y nodejs"
    exit 1
fi

echo "✅ Node.js version: $(node --version)"
echo "✅ NPM version: $(npm --version)"

# Install dependencies if node_modules doesn't exist or is incomplete
if [ ! -d "node_modules" ] || [ ! -f "node_modules/.package-lock.json" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Generate Prisma client
echo "🗄️  Generating Prisma client..."
npx prisma generate

# Check database connection
echo "🔍 Checking database connection..."
npx prisma db push --accept-data-loss

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    echo "📝 Creating .env file from example..."
    cp .env.example .env
    echo "⚠️  Please update the .env file with your actual API keys and database URL"
fi

echo "✅ Setup complete!"
echo ""
echo "🚀 To start the development server:"
echo "   npm run dev"
echo ""
echo "🌐 The app will be available at:"
echo "   Frontend: http://localhost:3000"
echo "   API: http://localhost:3000/api/*"
echo ""
echo "📋 Make sure to update your .env file with:"
echo "   - DATABASE_URL (PostgreSQL connection string)"
echo "   - GROQ_API_KEY (from console.groq.com)"
echo "   - ACOUSTID_API_KEY (optional, from acoustid.org)"
echo "   - CLOUDINARY_* (optional, for image uploads)"
