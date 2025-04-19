import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateCandidatePersonMapping1713179012346 implements MigrationInterface {
  name = 'CreateCandidatePersonMapping1713179012346';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "candidate_person_mapping" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "candidateId" uuid NOT NULL,
        "personId" uuid NOT NULL,
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_candidate_person_mapping" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      ALTER TABLE "candidate_person_mapping" 
      ADD CONSTRAINT "FK_candidate_person_mapping_candidate" 
      FOREIGN KEY ("candidateId") REFERENCES "candidate"("id") 
      ON DELETE CASCADE
    `);

    // Create index for faster lookups
    await queryRunner.query(`
      CREATE INDEX "IDX_candidate_person_mapping_candidateId" 
      ON "candidate_person_mapping" ("candidateId")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_candidate_person_mapping_personId" 
      ON "candidate_person_mapping" ("personId")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP INDEX "IDX_candidate_person_mapping_personId"
    `);

    await queryRunner.query(`
      DROP INDEX "IDX_candidate_person_mapping_candidateId"
    `);

    await queryRunner.query(`
      ALTER TABLE "candidate_person_mapping" 
      DROP CONSTRAINT "FK_candidate_person_mapping_candidate"
    `);

    await queryRunner.query(`
      DROP TABLE "candidate_person_mapping"
    `);
  }
} 