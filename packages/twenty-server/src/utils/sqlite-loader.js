// This file handles conditional loading of better-sqlite3 for serverless environments
// When IS_SERVERLESS or SQLITE_DISABLED is true, this will provide a mock implementation
// to prevent build errors

function createMockSqlite() {
  return {
    Database: class MockDatabase {
      constructor() {
        throw new Error('SQLite is disabled in serverless environments');
      }
    },
    verbose: () => createMockSqlite(),
  };
}

let sqliteModule;

try {
  // Check environment variables
  const isServerless = process.env.IS_SERVERLESS === 'true';
  const isSqliteDisabled = process.env.SQLITE_DISABLED === 'true';

  if (isServerless || isSqliteDisabled) {
    // In serverless environment, return mock
    console.log('Running in serverless mode, SQLite disabled');
    sqliteModule = createMockSqlite();
  } else {
    // In regular environment, load the real module
    // This may throw if native dependencies can't be built
    sqliteModule = require('better-sqlite3');
  }
} catch (error) {
  console.warn(
    'Failed to load better-sqlite3, using mock implementation:',
    error.message,
  );
  sqliteModule = createMockSqlite();
}

module.exports = sqliteModule;
