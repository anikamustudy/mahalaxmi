#!/usr/bin/env node

const fs = require('fs');
const readline = require('readline');

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

const defaultConfig = {
  // Database
  DATABASE_URL: "postgresql://postgres:password@localhost:5432/startup_db?schema=public",
  
  // NextAuth.js
  NEXTAUTH_URL: "http://localhost:3000",
  NEXTAUTH_SECRET: generateRandomString(32),
  
  // Email configuration
  EMAIL_SERVER_HOST: "smtp.gmail.com",
  EMAIL_SERVER_PORT: "587",
  EMAIL_SERVER_USER: "your-email@gmail.com",
  EMAIL_SERVER_PASSWORD: "your-app-password",
  EMAIL_FROM: "your-email@gmail.com",
  
  // Admin credentials
  ADMIN_EMAIL: "admin@startup.com",
  ADMIN_PASSWORD: "admin123",
  
  // JWT Secret
  JWT_SECRET: generateRandomString(64)
};

function generateRandomString(length) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

async function setupEnvironment() {
  log('🚀 Startup Next.js Environment Setup', 'cyan');
  log('=====================================\n', 'cyan');

  const config = { ...defaultConfig };
  const envExists = fs.existsSync('.env');

  if (envExists) {
    log('Found existing .env file', 'yellow');
    const overwrite = await question('Do you want to overwrite it? (y/N): ');
    if (overwrite.toLowerCase() !== 'y') {
      log('Setup cancelled', 'yellow');
      rl.close();
      return;
    }
  }

  log('\nLet\'s configure your environment variables:\n', 'green');

  // Database configuration
  log('📦 Database Configuration', 'blue');
  const dbChoice = await question('Choose database type (1: PostgreSQL, 2: MySQL, 3: SQLite, 4: Custom): ');
  
  switch (dbChoice) {
    case '1':
      const dbHost = await question('Database host (localhost): ') || 'localhost';
      const dbPort = await question('Database port (5432): ') || '5432';
      const dbUser = await question('Database user (postgres): ') || 'postgres';
      const dbPass = await question('Database password: ') || 'password';
      const dbName = await question('Database name (startup_db): ') || 'startup_db';
      config.DATABASE_URL = `postgresql://${dbUser}:${dbPass}@${dbHost}:${dbPort}/${dbName}?schema=public`;
      break;
    case '2':
      const mysqlHost = await question('MySQL host (localhost): ') || 'localhost';
      const mysqlPort = await question('MySQL port (3306): ') || '3306';
      const mysqlUser = await question('MySQL user (root): ') || 'root';
      const mysqlPass = await question('MySQL password: ') || 'password';
      const mysqlDb = await question('MySQL database (startup_db): ') || 'startup_db';
      config.DATABASE_URL = `mysql://${mysqlUser}:${mysqlPass}@${mysqlHost}:${mysqlPort}/${mysqlDb}`;
      break;
    case '3':
      config.DATABASE_URL = 'file:./dev.db';
      break;
    case '4':
      config.DATABASE_URL = await question('Enter custom database URL: ');
      break;
    default:
      log('Using default PostgreSQL configuration', 'yellow');
  }

  // Server configuration
  log('\n🌐 Server Configuration', 'blue');
  const serverPort = await question('Server port (3000): ') || '3000';
  config.NEXTAUTH_URL = `http://localhost:${serverPort}`;

  // Email configuration
  log('\n📧 Email Configuration', 'blue');
  const configureEmail = await question('Configure email settings? (y/N): ');
  if (configureEmail.toLowerCase() === 'y') {
    config.EMAIL_SERVER_HOST = await question('SMTP host (smtp.gmail.com): ') || 'smtp.gmail.com';
    config.EMAIL_SERVER_PORT = await question('SMTP port (587): ') || '587';
    config.EMAIL_SERVER_USER = await question('Email address: ') || config.EMAIL_SERVER_USER;
    config.EMAIL_SERVER_PASSWORD = await question('Email password/app password: ') || config.EMAIL_SERVER_PASSWORD;
    config.EMAIL_FROM = config.EMAIL_SERVER_USER;
  }

  // Admin configuration
  log('\n👤 Admin Configuration', 'blue');
  config.ADMIN_EMAIL = await question('Admin email (admin@startup.com): ') || 'admin@startup.com';
  config.ADMIN_PASSWORD = await question('Admin password (admin123): ') || 'admin123';

  // Generate .env file
  const envContent = Object.entries(config)
    .map(([key, value]) => `${key}="${value}"`)
    .join('\n');

  const envWithComments = `# Database
${config.DATABASE_URL.includes('postgresql') ? '# PostgreSQL database connection' : 
  config.DATABASE_URL.includes('mysql') ? '# MySQL database connection' : 
  config.DATABASE_URL.includes('file:') ? '# SQLite database file' : '# Custom database connection'}
DATABASE_URL="${config.DATABASE_URL}"

# NextAuth.js
NEXTAUTH_URL="${config.NEXTAUTH_URL}"
NEXTAUTH_SECRET="${config.NEXTAUTH_SECRET}"

# Email configuration (for contact forms and notifications)
EMAIL_SERVER_HOST="${config.EMAIL_SERVER_HOST}"
EMAIL_SERVER_PORT=${config.EMAIL_SERVER_PORT}
EMAIL_SERVER_USER="${config.EMAIL_SERVER_USER}"
EMAIL_SERVER_PASSWORD="${config.EMAIL_SERVER_PASSWORD}"
EMAIL_FROM="${config.EMAIL_FROM}"

# Admin credentials
ADMIN_EMAIL="${config.ADMIN_EMAIL}"
ADMIN_PASSWORD="${config.ADMIN_PASSWORD}"

# JWT Secret
JWT_SECRET="${config.JWT_SECRET}"
`;

  fs.writeFileSync('.env', envWithComments);
  log('\n✅ Environment configuration saved to .env', 'green');

  // Create .env.example
  const exampleContent = envWithComments.replace(/="[^"]*"/g, '="your-value-here"');
  fs.writeFileSync('.env.example', exampleContent);
  log('✅ Example configuration saved to .env.example', 'green');

  log('\n🎉 Setup completed successfully!', 'green');
  log('\nNext steps:', 'cyan');
  log('1. Review the .env file and update any values as needed', 'blue');
  log('2. Run: node dev-setup.js to start the development server', 'blue');
  log('3. Or run: SETUP_DB=true SEED_DB=true node dev-setup.js for full setup', 'blue');

  rl.close();
}

function showHelp() {
  console.log(`
${colors.bright}Environment Setup Helper${colors.reset}

${colors.cyan}Usage:${colors.reset}
  node setup-env.js [options]

${colors.cyan}Options:${colors.reset}
  --help, -h               Show this help message
  --auto                   Use default configuration without prompts
  --template=<name>        Use predefined template (dev, prod, test)

${colors.cyan}Templates:${colors.reset}
  dev                      Development environment with local database
  prod                     Production environment template
  test                     Testing environment with in-memory database

${colors.cyan}Examples:${colors.reset}
  node setup-env.js                    # Interactive setup
  node setup-env.js --auto             # Use defaults
  node setup-env.js --template=dev     # Use dev template
`);
}

async function useTemplate(templateName) {
  const templates = {
    dev: {
      ...defaultConfig,
      DATABASE_URL: "postgresql://postgres:password@localhost:5432/startup_dev?schema=public",
      NEXTAUTH_URL: "http://localhost:3000"
    },
    prod: {
      ...defaultConfig,
      DATABASE_URL: "postgresql://user:password@your-db-host:5432/startup_prod?schema=public",
      NEXTAUTH_URL: "https://your-domain.com",
      ADMIN_PASSWORD: generateRandomString(16)
    },
    test: {
      ...defaultConfig,
      DATABASE_URL: "file:./test.db",
      NEXTAUTH_URL: "http://localhost:3001"
    }
  };

  const template = templates[templateName];
  if (!template) {
    log(`Template '${templateName}' not found`, 'red');
    process.exit(1);
  }

  const envContent = Object.entries(template)
    .map(([key, value]) => `${key}="${value}"`)
    .join('\n');

  fs.writeFileSync('.env', envContent);
  log(`✅ ${templateName} template applied to .env`, 'green');
}

async function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--help') || args.includes('-h')) {
    showHelp();
    return;
  }

  const templateArg = args.find(arg => arg.startsWith('--template='));
  if (templateArg) {
    const templateName = templateArg.split('=')[1];
    await useTemplate(templateName);
    return;
  }

  if (args.includes('--auto')) {
    const envContent = Object.entries(defaultConfig)
      .map(([key, value]) => `${key}="${value}"`)
      .join('\n');
    
    fs.writeFileSync('.env', envContent);
    log('✅ Default environment configuration applied', 'green');
    return;
  }

  await setupEnvironment();
}

main().catch(console.error);
