#!/bin/bash

echo "🚀 Setting up WatchParty development environment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js v16 or higher."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 16 ]; then
    print_error "Node.js version must be 16 or higher. Current version: $(node -v)"
    exit 1
fi

print_success "Node.js version: $(node -v)"

# Check if MongoDB is running
if ! pgrep -x "mongod" > /dev/null; then
    print_warning "MongoDB is not running. Please start MongoDB before running the application."
    print_status "Start MongoDB with: mongod"
fi

# Backend setup
print_status "Setting up backend..."
cd backend

# Install backend dependencies
print_status "Installing backend dependencies..."
npm install

# Copy environment files if they don't exist
if [ ! -f ".env" ]; then
    print_status "Creating backend .env file..."
    cp .env.example .env
    print_warning "Please update backend/.env with your configuration"
else
    print_warning "Backend .env already exists. Please verify your configuration."
fi

# Copy JWT config if it doesn't exist
if [ ! -f "src/config/jwt.ts" ]; then
    print_status "Creating JWT configuration..."
    cp src/config/jwt.ts.example src/config/jwt.ts
    print_warning "Please update backend/src/config/jwt.ts with your JWT secret"
else
    print_warning "JWT config already exists. Please verify your configuration."
fi

# Frontend setup
print_status "Setting up frontend..."
cd ../frontend

# Install frontend dependencies
print_status "Installing frontend dependencies..."
npm install

# Copy environment files if they don't exist
if [ ! -f ".env" ]; then
    print_status "Creating frontend .env file..."
    cp .env.example .env
    print_success "Frontend .env created"
else
    print_success "Frontend .env already exists"
fi

# Go back to root directory
cd ..

print_success "Setup completed! 🎉"
echo ""
print_status "Next steps:"
echo "1. Update backend/.env with your MongoDB URI and JWT secret"
echo "2. Update backend/src/config/jwt.ts with the same JWT secret"
echo "3. Start MongoDB: mongod"
echo "4. Start backend: cd backend && npm run dev"
echo "5. Start frontend: cd frontend && npm run dev"
echo ""
print_status "The application will be available at:"
echo "   Frontend: http://localhost:5173"
echo "   Backend:  http://localhost:8081"
echo ""
print_warning "Don't forget to generate a secure JWT secret for production!"
echo "   Generate one with: node -e \"console.log(require('crypto').randomBytes(64).toString('hex'))\""
