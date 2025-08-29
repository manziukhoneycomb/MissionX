/**
 * Helper script for TypeORM migrations
 * Usage: node scripts/migration.js [generate|create|run|revert] [name]
 */

const { execSync } = require('child_process');
const path = require('path');

const MIGRATIONS_DIR = path.join('src', 'infrastructure', 'persistence', 'migrations');
const DATA_SOURCE = path.join('src', 'infrastructure', 'persistence', 'typeorm.config.ts');

const SUPPORTED_COMMANDS = ['generate', 'create', 'run', 'revert'];
const COMMANDS_REQUIRING_NAME = ['generate', 'create'];

const [,, command, name] = process.argv;

if (!SUPPORTED_COMMANDS.includes(command)) {
  console.error(`Invalid command. Supported commands: ${SUPPORTED_COMMANDS.join(', ')}`);

  process.exit(1);
}

if (COMMANDS_REQUIRING_NAME.includes(command) && !name) {
  console.error(`Missing migration name for '${command}' command`);

  process.exit(1);
}

let typeormCommand = '';

switch (command) {
  case 'generate':
    typeormCommand = `ts-node ./node_modules/typeorm/cli -d ${DATA_SOURCE} migration:generate ${path.join(MIGRATIONS_DIR, name)}`;
    break;
  case 'create':
    typeormCommand = `ts-node ./node_modules/typeorm/cli migration:create ${path.join(MIGRATIONS_DIR, name)}`;
    break;
  case 'run':
    typeormCommand = `ts-node ./node_modules/typeorm/cli migration:run -d ${DATA_SOURCE}`;
    break;
  case 'revert':
    typeormCommand = `ts-node ./node_modules/typeorm/cli migration:revert -d ${DATA_SOURCE}`;
    break;
}

try {
  console.log(`Executing: ${typeormCommand}`);

  execSync(typeormCommand, { stdio: 'inherit' });
} catch (error) {
  console.error('Migration command failed');
  
  process.exit(1);
}
