#!/bin/bash

# ==========================================
# SushiWave Deployment Script
# ==========================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
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

# Check if required tools are installed
check_requirements() {
    print_status "Checking requirements..."
    
    if ! command -v git &> /dev/null; then
        print_error "Git is not installed"
        exit 1
    fi
    
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed"
        exit 1
    fi
    
    print_success "All requirements met"
}

# Deploy to Render
deploy_render() {
    print_status "Deploying Backend to Render..."
    
    if ! command -v railway &> /dev/null; then
        print_warning "Railway CLI not found. Installing..."
        npm install -g @railway/cli
    fi
    
    cd backend
    
    # Login to Railway (if not already logged in)
    if ! railway whoami &> /dev/null; then
        print_status "Please login to Railway..."
        railway login
    fi
    
    # Link to project or create new
    if [ ! -f .railway/config.json ]; then
        print_status "Linking to Railway project..."
        railway link
    fi
    
    # Deploy
    railway up
    
    # Run migrations
    print_status "Running database migrations..."
    railway run npx prisma migrate deploy
    
    # Seed database
    print_status "Seeding database..."
    railway run npx prisma db seed || true
    
    cd ..
    print_success "Backend deployed to Render!"
}

# Deploy to Netlify
deploy_netlify() {
    print_status "Deploying Frontend to Netlify..."
    
    if ! command -v netlify &> /dev/null; then
        print_warning "Netlify CLI not found. Installing..."
        npm install -g netlify-cli
    fi
    
    cd frontend
    
    # Install dependencies
    print_status "Installing dependencies..."
    npm ci
    
    # Build
    print_status "Building frontend..."
    npm run build
    
    # Deploy
    if [ -f ../.netlify/state.json ]; then
        print_status "Deploying to existing site..."
        netlify deploy --prod --dir=dist
    else
        print_status "Creating new Netlify site..."
        netlify deploy --prod --dir=dist --open
    fi
    
    cd ..
    print_success "Frontend deployed to Netlify!"
}

# Setup environment variables
setup_env() {
    print_status "Setting up environment variables..."
    
    if [ ! -f .env ]; then
        cp .env.example .env
        print_warning "Please update .env file with your values"
    fi
    
    # Backend
    if [ ! -f backend/.env ]; then
        cp backend/.env.example backend/.env 2>/dev/null || true
    fi
    
    print_success "Environment files created"
}

# Main menu
show_menu() {
    echo ""
    echo "=========================================="
    echo "       SushiWave Deployment Tool"
    echo "=========================================="
    echo ""
    echo "1. Deploy Backend to Render"
    echo "2. Deploy Frontend to Netlify"
    echo "3. Deploy Both"
    echo "4. Setup Environment"
    echo "5. Check Requirements"
    echo "6. Exit"
    echo ""
    read -p "Select option [1-6]: " choice
    
    case $choice in
        1)
            deploy_render
            ;;
        2)
            deploy_netlify
            ;;
        3)
            deploy_render
            deploy_netlify
            ;;
        4)
            setup_env
            ;;
        5)
            check_requirements
            ;;
        6)
            print_success "Goodbye!"
            exit 0
            ;;
        *)
            print_error "Invalid option"
            show_menu
            ;;
    esac
}

# Main
main() {
    print_status "SushiWave Deployment Script"
    print_status "==========================="
    
    # Check if running in project root
    if [ ! -f "docker-compose.yml" ]; then
        print_error "Please run this script from the project root directory"
        exit 1
    fi
    
    check_requirements
    show_menu
}

# Run main function
main