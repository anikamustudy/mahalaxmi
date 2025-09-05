# 🚀 Development Setup Guide

This guide provides multiple ways to run your Next.js Startup template with customizable options for both frontend and backend.

## 📋 Prerequisites

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **PostgreSQL** (for database, optional with Docker)
- **Docker** & **Docker Compose** (for containerized setup)

## 🎯 Quick Start Options

### Option 1: Basic Development Server
```bash
# Start development server (frontend + API routes)
npm run dev
```

### Option 2: Customizable Development Setup
```bash
# Interactive environment setup
node setup-env.js

# Start with custom configuration
node dev-setup.js

# Or use environment variables
PORT=3001 SETUP_DB=true SEED_DB=true node dev-setup.js
```

### Option 3: Docker Development Environment
```bash
# Start full development environment with database
./docker-dev.sh dev

# Start with development tools (Prisma Studio)
./docker-dev.sh tools

# View all Docker commands
./docker-dev.sh help
```

## 🛠️ Available Scripts

### NPM Scripts
| Script | Description |
|--------|-------------|
| `npm run dev` | Start basic Next.js development server |
| `npm run dev:setup` | Start with customizable setup |
| `npm run dev:full` | Start with database setup and seeding |
| `npm run env:setup` | Interactive environment configuration |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run docker:dev` | Start Docker development environment |
| `npm run docker:tools` | Start Docker with development tools |
| `npm run db:migrate` | Run database migrations |
| `npm run db:seed` | Seed database with sample data |
| `npm run db:studio` | Open Prisma Studio |

### Development Setup Script (`dev-setup.js`)

**Environment Variables:**
- `PORT=3000` - Server port (default: 3000)
- `NODE_ENV=development` - Environment mode
- `SETUP_DB=true` - Setup and migrate database
- `SEED_DB=true` - Seed database with initial data
- `OPEN_BROWSER=true` - Open browser automatically
- `HOT_RELOAD=true` - Enable hot reload
- `TURBO=false` - Enable turbo mode
- `VERBOSE=false` - Enable verbose logging

**Examples:**
```bash
# Basic development server
node dev-setup.js

# Custom port with database setup
PORT=3001 SETUP_DB=true node dev-setup.js

# Production-like environment
NODE_ENV=production TURBO=true node dev-setup.js

# Full setup with seeding
SETUP_DB=true SEED_DB=true node dev-setup.js
```

### Docker Development Script (`docker-dev.sh`)

**Commands:**
- `dev` - Start development environment
- `prod` - Start production environment
- `tools` - Start development environment with tools (Prisma Studio)
- `stop` - Stop all services
- `restart` - Restart services
- `logs [service]` - View logs (optionally for specific service)
- `migrate` - Run database migrations
- `seed` - Seed database with initial data
- `reset-db` - Reset database (WARNING: Deletes all data)
- `shell [service]` - Enter container shell (default: app-dev)
- `status` - Show container status
- `build [service]` - Build images (optionally for specific service)
- `cleanup` - Stop and remove all containers, volumes, and images

**Examples:**
```bash
# Start development environment
./docker-dev.sh dev

# Start with Prisma Studio
./docker-dev.sh tools

# View app logs
./docker-dev.sh logs app-dev

# Enter database shell
./docker-dev.sh shell postgres

# Run migrations
./docker-dev.sh migrate
```

## 🔧 Environment Configuration

### Interactive Setup
```bash
node setup-env.js
```

### Template-based Setup
```bash
# Development template
node setup-env.js --template=dev

# Production template
node setup-env.js --template=prod

# Testing template
node setup-env.js --template=test

# Use defaults without prompts
node setup-env.js --auto
```

### Manual Configuration
Create a `.env` file with the following structure:

```env
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
```

## 🐳 Docker Setup

The project includes complete Docker configuration for development and production:

### Development with Docker
```bash
# Start development environment
docker-compose --profile dev up -d

# With development tools
docker-compose --profile dev --profile tools up -d
```

### Production with Docker
```bash
# Build and start production environment
docker-compose --profile prod up -d
```

### Services Included
- **Next.js Application** (Frontend + API Routes)
- **PostgreSQL Database**
- **Redis Cache** (optional)
- **Prisma Studio** (database GUI)
- **Nginx** (production load balancer)

## 🌐 Access URLs

| Service | Development | Production |
|---------|-------------|------------|
| Application | http://localhost:3000 | http://localhost:3000 |
| Prisma Studio | http://localhost:5555 | N/A |
| Database | localhost:5432 | localhost:5432 |
| Redis | localhost:6379 | localhost:6379 |

## 📁 Project Structure

```
startup-nextjs/
├── src/
│   ├── app/          # Next.js App Router pages
│   │   ├── api/      # API routes (backend)
│   │   └── ...       # Frontend pages
│   ├── components/   # Reusable components
│   └── lib/         # Utility functions
├── prisma/          # Database schema and migrations
├── docker-compose.yml    # Docker services configuration
├── Dockerfile           # Production Docker image
├── Dockerfile.dev       # Development Docker image
├── dev-setup.js        # Customizable development script
├── setup-env.js        # Environment configuration helper
├── docker-dev.sh       # Docker management script
└── README.md           # Project documentation
```

## 🔄 Development Workflow

### 1. Initial Setup
```bash
# Clone and setup
git clone <your-repo>
cd startup-nextjs

# Interactive environment setup
node setup-env.js

# Start development server
npm run dev:full
```

### 2. Docker Development
```bash
# Start everything with Docker
./docker-dev.sh dev

# Open Prisma Studio
./docker-dev.sh tools

# View logs
./docker-dev.sh logs
```

### 3. Database Operations
```bash
# Run migrations
npm run db:migrate

# Seed database
npm run db:seed

# Open database GUI
npm run db:studio
```

## 🚀 Deployment

### Production Build
```bash
# Local production build
npm run build
npm run start

# Docker production
./docker-dev.sh prod
```

### Environment Variables for Production
Update your production `.env` file:
- Change `NEXTAUTH_SECRET` and `JWT_SECRET` to secure random strings
- Update database URL to production database
- Configure email settings for production SMTP
- Update `NEXTAUTH_URL` to your production domain

## 🔧 Customization

### Port Configuration
```bash
# Different port
PORT=3001 node dev-setup.js

# Docker with different port
PORT=3001 docker-compose --profile dev up -d
```

### Database Configuration
The setup supports multiple database types:
- PostgreSQL (default)
- MySQL
- SQLite
- Custom database URLs

### Adding New Services
Edit `docker-compose.yml` to add new services like:
- Elasticsearch
- MongoDB
- RabbitMQ
- Additional microservices

## 🐛 Troubleshooting

### Common Issues

**1. Database Connection Issues**
```bash
# Check database status
./docker-dev.sh status

# Restart database
./docker-dev.sh restart postgres
```

**2. Port Already in Use**
```bash
# Use different port
PORT=3001 node dev-setup.js
```

**3. Dependencies Issues**
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install
```

**4. Docker Issues**
```bash
# Clean Docker environment
./docker-dev.sh cleanup

# Rebuild images
./docker-dev.sh build
```

### Getting Help
```bash
# Development script help
node dev-setup.js --help

# Docker script help
./docker-dev.sh help

# Environment setup help
node setup-env.js --help
```

## 🎉 Features

- ✅ **Customizable Development Environment**
- ✅ **Docker Support with Hot Reload**
- ✅ **Database Setup and Seeding**
- ✅ **Environment Configuration Helper**
- ✅ **Production-Ready Docker Setup**
- ✅ **Development Tools Integration**
- ✅ **Multiple Database Support**
- ✅ **Automated Browser Opening**
- ✅ **Comprehensive Error Handling**
- ✅ **Graceful Shutdown Handling**

This setup provides maximum flexibility for both frontend and backend development while maintaining simplicity for quick start scenarios.
