import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPersonIdToCandidate1713179015678 implements MigrationInterface {
  name = 'AddPersonIdToCandidate1713179015678';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add personId column to candidate table
    await queryRunner.query(`
      ALTER TABLE "candidate" 
      ADD COLUMN "personId" uuid NULL
    `);

    // Create index for faster lookups
    await queryRunner.query(`
      CREATE INDEX "IDX_candidate_personId" 
      ON "candidate" ("personId")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove index
    await queryRunner.query(`
      DROP INDEX "IDX_candidate_personId"
    `);

    // Remove column
    await queryRunner.query(`
      ALTER TABLE "candidate" 
      DROP COLUMN "personId"
    `);
  }
} 