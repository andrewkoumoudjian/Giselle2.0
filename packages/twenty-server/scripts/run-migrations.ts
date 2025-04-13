import * as dotenv from 'dotenv';
import { DataSource } from 'typeorm';

// Load environment variables
dotenv.config();

// Create a data source connection
const dataSource = new DataSource({
  type: 'postgres',
  url: process.env.PG_DATABASE_URL,
  entities: ['src/**/*.entity.ts'],
  migrations: ['src/database/migrations/*.ts'],
  logging: true,
});

// Connect and run migrations
dataSource.initialize()
  .then(async () => {
    console.log('Data Source has been initialized!');
    
    // Run migrations
    await dataSource.runMigrations();
    console.log('Migrations have been executed successfully');
    
    // Close the connection
    await dataSource.destroy();
    console.log('Connection closed');
  })
  .catch((err) => {
    console.error('Error during Data Source initialization:', err);
  });