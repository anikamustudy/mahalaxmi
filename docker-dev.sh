#!/bin/bash

# Docker Development Helper Script
# Usage: ./docker-dev.sh [command] [options]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Default configuration
PROJECT_NAME="startup"
COMPOSE_FILE="docker-compose.yml"
ENV_FILE=".env"

log() {
    echo -e "${CYAN}[INFO]${NC} $1"
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
    exit 1
}

# Function to check if Docker is running
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        error "Docker is not running. Please start Docker first."
    fi
}

# Function to check if docker-compose is available
check_compose() {
    if ! command -v docker-compose > /dev/null 2>&1; then
        if ! docker compose version > /dev/null 2>&1; then
            error "Docker Compose is not available. Please install it first."
        fi
        COMPOSE_CMD="docker compose"
    else
        COMPOSE_CMD="docker-compose"
    fi
}

# Function to create .env file if it doesn't exist
setup_env() {
    if [ ! -f "$ENV_FILE" ]; then
        warn ".env file not found. Creating with default values..."
        cat > "$ENV_FILE" << EOF
# Database
DATABASE_URL="postgresql://postgres:password@localhost:5432/startup_db?schema=public"

# NextAuth.js
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-change-this-in-production"

# Email configuration
EMAIL_SERVER_HOST="smtp.gmail.com"
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER="your-email@gmail.com"
EMAIL_SERVER_PASSWORD="your-app-password"
EMAIL_FROM="your-email@gmail.com"

# Admin credentials
ADMIN_EMAIL="admin@startup.com"
ADMIN_PASSWORD="admin123"

# JWT Secret
JWT_SECRET="your-jwt-secret-change-this-in-production"
EOF
        success ".env file created. Please update it with your actual values."
    fi
}

# Function to start development environment
dev_start() {
    log "Starting development environment..."
    setup_env
    $COMPOSE_CMD --profile dev up -d
    success "Development environment started!"
    log "Application: http://localhost:3000"
    log "Database: localhost:5432"
    log "Redis: localhost:6379"
}

# Function to start production environment
prod_start() {
    log "Starting production environment..."
    setup_env
    $COMPOSE_CMD --profile prod up -d
    success "Production environment started!"
    log "Application: http://localhost:3000"
}

# Function to start with tools (Prisma Studio)
tools_start() {
    log "Starting development environment with tools..."
    setup_env
    $COMPOSE_CMD --profile dev --profile tools up -d
    success "Development environment with tools started!"
    log "Application: http://localhost:3000"
    log "Prisma Studio: http://localhost:5555"
}

# Function to stop services
stop_services() {
    log "Stopping all services..."
    $COMPOSE_CMD down
    success "All services stopped!"
}

# Function to restart services
restart_services() {
    log "Restarting services..."
    $COMPOSE_CMD restart
    success "Services restarted!"
}

# Function to view logs
view_logs() {
    if [ -n "$1" ]; then
        $COMPOSE_CMD logs -f "$1"
    else
        $COMPOSE_CMD logs -f
    fi
}

# Function to run database migrations
run_migrations() {
    log "Running database migrations..."
    if [ "$(docker ps -q -f name=${PROJECT_NAME}-postgres)" ]; then
        $COMPOSE_CMD exec app-dev npx prisma migrate dev
        success "Database migrations completed!"
    else
        warn "Database not running. Starting database first..."
        $COMPOSE_CMD up -d postgres
        sleep 5
        $COMPOSE_CMD exec app-dev npx prisma migrate dev
        success "Database migrations completed!"
    fi
}

# Function to seed database
seed_database() {
    log "Seeding database..."
    $COMPOSE_CMD exec app-dev npm run db:seed
    success "Database seeded!"
}

# Function to reset database
reset_database() {
    read -p "Are you sure you want to reset the database? This will delete all data. (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        log "Resetting database..."
        $COMPOSE_CMD exec app-dev npx prisma migrate reset --force
        success "Database reset completed!"
    else
        log "Database reset cancelled."
    fi
}

# Function to enter container shell
shell() {
    local service=${1:-app-dev}
    log "Opening shell in $service container..."
    $COMPOSE_CMD exec "$service" /bin/sh
}

# Function to clean up
cleanup() {
    log "Cleaning up..."
    $COMPOSE_CMD down -v --remove-orphans
    docker system prune -f
    success "Cleanup completed!"
}

# Function to show status
show_status() {
    log "Container Status:"
    $COMPOSE_CMD ps
    echo
    log "Images:"
    docker images | grep "$PROJECT_NAME"
    echo
    log "Volumes:"
    docker volume ls | grep "$PROJECT_NAME"
}

# Function to build images
build_images() {
    local service="$1"
    if [ -n "$service" ]; then
        log "Building $service image..."
        $COMPOSE_CMD build "$service"
    else
        log "Building all images..."
        $COMPOSE_CMD build
    fi
    success "Build completed!"
}

# Help function
show_help() {
    echo -e "${CYAN}Docker Development Helper for Startup Next.js${NC}"
    echo
    echo "Usage: $0 [command] [options]"
    echo
    echo "Commands:"
    echo "  dev             Start development environment"
    echo "  prod            Start production environment"
    echo "  tools           Start development environment with tools (Prisma Studio)"
    echo "  stop            Stop all services"
    echo "  restart         Restart services"
    echo "  logs [service]  View logs (optionally for specific service)"
    echo "  migrate         Run database migrations"
    echo "  seed            Seed database with initial data"
    echo "  reset-db        Reset database (WARNING: Deletes all data)"
    echo "  shell [service] Enter container shell (default: app-dev)"
    echo "  status          Show container status"
    echo "  build [service] Build images (optionally for specific service)"
    echo "  cleanup         Stop and remove all containers, volumes, and images"
    echo "  help            Show this help message"
    echo
    echo "Examples:"
    echo "  $0 dev              # Start development environment"
    echo "  $0 tools            # Start with Prisma Studio"
    echo "  $0 logs app-dev     # View app logs"
    echo "  $0 shell postgres   # Enter database shell"
    echo "  $0 migrate          # Run migrations"
}

# Main script logic
main() {
    check_docker
    check_compose

    case "${1:-help}" in
        "dev")
            dev_start
            ;;
        "prod")
            prod_start
            ;;
        "tools")
            tools_start
            ;;
        "stop")
            stop_services
            ;;
        "restart")
            restart_services
            ;;
        "logs")
            view_logs "$2"
            ;;
        "migrate")
            run_migrations
            ;;
        "seed")
            seed_database
            ;;
        "reset-db")
            reset_database
            ;;
        "shell")
            shell "$2"
            ;;
        "status")
            show_status
            ;;
        "build")
            build_images "$2"
            ;;
        "cleanup")
            cleanup
            ;;
        "help"|"--help"|"-h")
            show_help
            ;;
        *)
            error "Unknown command: $1. Use '$0 help' for usage information."
            ;;
    esac
}

# Run main function with all arguments
main "$@"
