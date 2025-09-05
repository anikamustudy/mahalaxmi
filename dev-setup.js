#!/usr/bin/env node

const { spawn, exec } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuration options
const config = {
  port: process.env.PORT || 3000,
  dbPort: process.env.DB_PORT || 5432,
  environment: process.env.NODE_ENV || 'development',
  setupDb: process.env.SETUP_DB === 'true',
  seedDb: process.env.SEED_DB === 'true',
  openBrowser: process.env.OPEN_BROWSER !== 'false',
  enableHotReload: process.env.HOT_RELOAD !== 'false',
  enableTurbo: process.env.TURBO === 'true',
  dbType: process.env.DB_TYPE || 'postgres',
  verbose: process.env.VERBOSE === 'true'
};

// Color codes for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  log(`\n${'='.repeat(50)}`, 'cyan');
  log(`${title}`, 'cyan');
  log(`${'='.repeat(50)}`, 'cyan');
}

async function checkPrerequisites() {
  logSection('Checking Prerequisites');
  
  const commands = [
    { cmd: 'node --version', name: 'Node.js' },
    { cmd: 'npm --version', name: 'NPM' }
  ];

  for (const { cmd, name } of commands) {
    try {
      await new Promise((resolve, reject) => {
        exec(cmd, (error, stdout) => {
          if (error) reject(error);
          else {
            log(`✓ ${name}: ${stdout.trim()}`, 'green');
            resolve();
          }
        });
      });
    } catch (error) {
      log(`✗ ${name} not found. Please install it first.`, 'red');
      process.exit(1);
    }
  }
}

async function installDependencies() {
  if (!fs.existsSync('node_modules')) {
    logSection('Installing Dependencies');
    log('Installing npm packages...', 'yellow');
    
    return new Promise((resolve, reject) => {
      const install = spawn('npm', ['install'], { stdio: 'inherit' });
      install.on('close', (code) => {
        if (code === 0) {
          log('✓ Dependencies installed successfully', 'green');
          resolve();
        } else {
          log('✗ Failed to install dependencies', 'red');
          reject(new Error('Installation failed'));
        }
      });
    });
  } else {
    log('✓ Dependencies already installed', 'green');
  }
}

async function setupDatabase() {
  if (!config.setupDb) {
    log('Database setup skipped (SETUP_DB=false)', 'yellow');
    return;
  }

  logSection('Setting up Database');
  
  try {
    // Check if Prisma schema exists
    if (!fs.existsSync('prisma/schema.prisma')) {
      log('No Prisma schema found, skipping database setup', 'yellow');
      return;
    }

    log('Generating Prisma client...', 'yellow');
    await new Promise((resolve, reject) => {
      const generate = spawn('npx', ['prisma', 'generate'], { stdio: 'inherit' });
      generate.on('close', (code) => {
        if (code === 0) resolve();
        else reject(new Error('Prisma generate failed'));
      });
    });

    log('Running database migrations...', 'yellow');
    await new Promise((resolve, reject) => {
      const migrate = spawn('npx', ['prisma', 'migrate', 'dev'], { stdio: 'inherit' });
      migrate.on('close', (code) => {
        if (code === 0) resolve();
        else reject(new Error('Migration failed'));
      });
    });

    if (config.seedDb) {
      log('Seeding database...', 'yellow');
      await new Promise((resolve, reject) => {
        const seed = spawn('npm', ['run', 'db:seed'], { stdio: 'inherit' });
        seed.on('close', (code) => {
          if (code === 0) resolve();
          else {
            log('Seeding failed, continuing anyway...', 'yellow');
            resolve();
          }
        });
      });
    }

    log('✓ Database setup completed', 'green');
  } catch (error) {
    log(`Database setup failed: ${error.message}`, 'red');
    log('Continuing without database...', 'yellow');
  }
}

async function startDevelopmentServer() {
  logSection('Starting Development Server');
  
  const env = {
    ...process.env,
    PORT: config.port,
    NODE_ENV: config.environment
  };

  if (config.enableTurbo) {
    env.NEXT_PRIVATE_SKIP_VALIDATE = 'true';
  }

  log(`Starting Next.js development server on port ${config.port}...`, 'yellow');
  log(`Environment: ${config.environment}`, 'blue');
  log(`Hot reload: ${config.enableHotReload ? 'enabled' : 'disabled'}`, 'blue');
  log(`Turbo mode: ${config.enableTurbo ? 'enabled' : 'disabled'}`, 'blue');

  const devArgs = ['run', 'dev'];
  
  if (config.port !== 3000) {
    devArgs.push('--', '--port', config.port.toString());
  }

  const devServer = spawn('npm', devArgs, {
    stdio: 'inherit',
    env
  });

  // Open browser if requested
  if (config.openBrowser) {
    setTimeout(() => {
      const start = process.platform === 'darwin' ? 'open' : 
                   process.platform === 'win32' ? 'start' : 'xdg-open';
      exec(`${start} http://localhost:${config.port}`);
      log(`✓ Opening browser at http://localhost:${config.port}`, 'green');
    }, 3000);
  }

  // Handle graceful shutdown
  process.on('SIGINT', () => {
    log('\n\nShutting down development server...', 'yellow');
    devServer.kill();
    process.exit(0);
  });

  devServer.on('close', (code) => {
    if (code !== 0) {
      log(`Development server exited with code ${code}`, 'red');
    }
    process.exit(code);
  });

  return devServer;
}

function printConfiguration() {
  logSection('Development Configuration');
  log(`Port: ${config.port}`, 'blue');
  log(`Environment: ${config.environment}`, 'blue');
  log(`Database setup: ${config.setupDb ? 'enabled' : 'disabled'}`, 'blue');
  log(`Database seeding: ${config.seedDb ? 'enabled' : 'disabled'}`, 'blue');
  log(`Open browser: ${config.openBrowser ? 'enabled' : 'disabled'}`, 'blue');
  log(`Hot reload: ${config.enableHotReload ? 'enabled' : 'disabled'}`, 'blue');
  log(`Turbo mode: ${config.enableTurbo ? 'enabled' : 'disabled'}`, 'blue');
  log(`Verbose logging: ${config.verbose ? 'enabled' : 'disabled'}`, 'blue');
}

function showHelp() {
  console.log(`
${colors.bright}Startup Next.js Development Setup${colors.reset}

${colors.cyan}Usage:${colors.reset}
  node dev-setup.js [options]

${colors.cyan}Environment Variables:${colors.reset}
  PORT=3000                 Server port (default: 3000)
  NODE_ENV=development      Environment mode
  SETUP_DB=true            Setup and migrate database
  SEED_DB=true             Seed database with initial data
  OPEN_BROWSER=true        Open browser automatically
  HOT_RELOAD=true          Enable hot reload
  TURBO=false              Enable turbo mode
  VERBOSE=false            Enable verbose logging

${colors.cyan}Examples:${colors.reset}
  # Basic development server
  node dev-setup.js

  # Custom port with database setup
  PORT=3001 SETUP_DB=true node dev-setup.js

  # Production-like environment
  NODE_ENV=production TURBO=true node dev-setup.js

  # Full setup with seeding
  SETUP_DB=true SEED_DB=true node dev-setup.js

${colors.cyan}Quick Commands:${colors.reset}
  npm run dev              Start development server
  npm run build            Build for production
  npm run start            Start production server
  npm run db:migrate       Run database migrations
  npm run db:seed          Seed database
  npm run db:studio        Open Prisma Studio
`);
}

async function main() {
  // Check for help flag
  if (process.argv.includes('--help') || process.argv.includes('-h')) {
    showHelp();
    return;
  }

  try {
    printConfiguration();
    await checkPrerequisites();
    await installDependencies();
    await setupDatabase();
    await startDevelopmentServer();
  } catch (error) {
    log(`\nError: ${error.message}`, 'red');
    process.exit(1);
  }
}

// Run the setup
main().catch(console.error);
