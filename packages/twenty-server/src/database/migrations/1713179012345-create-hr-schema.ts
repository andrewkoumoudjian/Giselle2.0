import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateHrSchema1713179012345 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create candidate table
    await queryRunner.query(`
      CREATE TABLE "candidate" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "userId" character varying,
        "skills" text[] DEFAULT '{}',
        "experienceYears" integer,
        "resumeData" jsonb,
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_candidate" PRIMARY KEY ("id")
      )
    `);

    // Create job_posting table
    await queryRunner.query(`
      CREATE TABLE "job_posting" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "title" character varying NOT NULL,
        "description" character varying,
        "requiredSkills" text[] DEFAULT '{}',
        "salaryRange" character varying,
        "status" character varying DEFAULT 'active',
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_job_posting" PRIMARY KEY ("id")
      )
    `);

    // Create application table
    await queryRunner.query(`
      CREATE TABLE "application" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "candidateId" uuid NOT NULL,
        "jobPostingId" uuid NOT NULL,
        "status" character varying NOT NULL DEFAULT 'pending',
        "matchScore" decimal(5,2) NOT NULL DEFAULT 0,
        "coverLetter" jsonb,
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_application" PRIMARY KEY ("id"),
        CONSTRAINT "FK_application_candidate" FOREIGN KEY ("candidateId") REFERENCES "candidate"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_application_job_posting" FOREIGN KEY ("jobPostingId") REFERENCES "job_posting"("id") ON DELETE CASCADE
      )
    `);

    // Create interview table
    await queryRunner.query(`
      CREATE TABLE "interview" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "applicationId" uuid NOT NULL,
        "scheduledAt" TIMESTAMP WITH TIME ZONE NOT NULL,
        "interviewerUserId" character varying,
        "status" character varying NOT NULL DEFAULT 'scheduled',
        "questions" jsonb,
        "overallScore" decimal(5,2),
        "feedback" character varying,
        "recordingUrl" character varying,
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_interview" PRIMARY KEY ("id"),
        CONSTRAINT "FK_interview_application" FOREIGN KEY ("applicationId") REFERENCES "application"("id") ON DELETE CASCADE
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop tables in reverse order to avoid foreign key constraint issues
    await queryRunner.query(`DROP TABLE "interview"`);
    await queryRunner.query(`DROP TABLE "application"`);
    await queryRunner.query(`DROP TABLE "job_posting"`);
    await queryRunner.query(`DROP TABLE "candidate"`);
  }
}