#!/bin/bash

# Mini Gigs Hub - Quick Start Script
# This script helps you get started quickly

echo "🚀 Mini Gigs Hub - Quick Start"
echo "==========================================="
echo ""

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js 18+ first."
    exit 1
fi

echo "✓ Node.js $(node --version) detected"

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo ""
    echo "📝 Creating .env.local from template..."
    cp .env.example .env.local
    echo "✓ Created .env.local"
    echo ""
    echo "⚠️  IMPORTANT: Edit .env.local with your credentials:"
    echo "   - DATABASE_URL (from Neon/Supabase/PlanetScale)"
    echo "   - CLERK_* keys (from Clerk dashboard)"
    echo "   - RESEND_API_KEY (from Resend)"
    echo ""
    echo "Press ENTER when you've updated .env.local..."
    read
fi

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo "✓ Dependencies installed"

# Generate Prisma client
echo ""
echo "🔨 Generating Prisma client..."
npx prisma generate

if [ $? -ne 0 ]; then
    echo "❌ Failed to generate Prisma client"
    exit 1
fi

echo "✓ Prisma client generated"

# Push database schema
echo ""
echo "🗄️  Pushing database schema..."
npx prisma db push

if [ $? -ne 0 ]; then
    echo "❌ Failed to push database schema"
    echo "   Check your DATABASE_URL in .env.local"
    exit 1
fi

echo "✓ Database schema pushed"

# Success message
echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Start the dev server: npm run dev"
echo "2. Open http://localhost:3000"
echo "3. Sign up to create your first user"
echo "4. Promote your user to admin in Prisma Studio:"
echo "   npx prisma studio"
echo ""
echo "📖 Read SETUP_GUIDE.md for detailed instructions"
echo ""
