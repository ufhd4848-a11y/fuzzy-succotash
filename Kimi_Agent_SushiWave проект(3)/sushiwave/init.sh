#!/bin/bash

# ==========================================
# SushiWave Project Initialization Script
# ==========================================

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Check Node.js version
check_node() {
    print_status "Checking Node.js version..."
    
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js 18 or higher."
        exit 1
    fi
    
    NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    
    if [ "$NODE_VERSION" -lt 18 ]; then
        print_error "Node.js version 18 or higher is required. Current version: $(node -v)"
        exit 1
    fi
    
    print_success "Node.js $(node -v) is installed"
}

# Check npm
check_npm() {
    print_status "Checking npm..."
    
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed"
        exit 1
    fi
    
    print_success "npm $(npm -v) is installed"
}

# Check Docker (optional)
check_docker() {
    print_status "Checking Docker (optional)..."
    
    if command -v docker &> /dev/null; then
        print_success "Docker is installed"
        
        if command -v docker-compose &> /dev/null; then
            print_success "Docker Compose is installed"
            return 0
        fi
    fi
    
    print_warning "Docker not found. Local development will use Node.js directly."
    return 1
}

# Install backend dependencies
install_backend() {
    print_status "Installing Backend dependencies..."
    
    cd backend
    npm install
    
    # Generate Prisma Client
    print_status "Generating Prisma Client..."
    npx prisma generate
    
    cd ..
    print_success "Backend dependencies installed"
}

# Install frontend dependencies
install_frontend() {
    print_status "Installing Frontend dependencies..."
    
    cd frontend
    npm install
    
    cd ..
    print_success "Frontend dependencies installed"
}

# Setup environment files
setup_env() {
    print_status "Setting up environment files..."
    
    # Root .env
    if [ ! -f .env ]; then
        cp .env.example .env
        print_success "Created .env file"
    else
        print_warning ".env already exists"
    fi
    
    print_success "Environment files created"
}

# Make scripts executable
setup_scripts() {
    print_status "Setting up scripts..."
    
    chmod +x deploy.sh 2>/dev/null || true
    chmod +x init.sh 2>/dev/null || true
    
    print_success "Scripts are ready"
}

# Print next steps
print_next_steps() {
    echo ""
    echo "=========================================="
    echo "       🎉 SushiWave is ready!"
    echo "=========================================="
    echo ""
    echo "Next steps:"
    echo ""
    echo "1. Local Development:"
    echo "   docker-compose up -d"
    echo ""
    echo "2. Or run manually:"
    echo "   cd backend && npm run dev"
    echo "   cd frontend && npm run dev"
    echo ""
    echo "3. Deploy to production:"
    echo "   ./deploy.sh"
    echo ""
    echo "   Or follow DEPLOY.md for detailed instructions"
    echo ""
    echo "📖 Documentation:"
    echo "   - README.md - Project overview"
    echo "   - DEPLOY.md - Deployment guide"
    echo ""
    echo "🌐 URLs after deployment:"
    echo "   Frontend: https://sushiwave.netlify.app"
    echo "   Backend:  https://sushiwave-backend.onrender.com"
    echo ""
}

# Main
main() {
    echo "=========================================="
    echo "       SushiWave Initialization"
    echo "=========================================="
    echo ""
    
    check_node
    check_npm
    check_docker
    
    echo ""
    print_status "Installing dependencies..."
    echo ""
    
    install_backend
    install_frontend
    setup_env
    setup_scripts
    
    echo ""
    print_success "Initialization complete!"
    echo ""
    
    print_next_steps
}

# Run
main