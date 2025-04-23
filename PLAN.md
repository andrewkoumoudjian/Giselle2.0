# HR Talent Platform Integration Plan

**Overall Goal:** Extend the existing Twenty CRM monorepo (`giselle2.5`) into an advanced HR Talent Platform by integrating Supabase, LangGraph AI agents for resume analysis, and adapting the frontend/backend components as outlined in `guide.md`.

**Core Technologies:**

*   **Backend:** NestJS (`packages/twenty-server`) adapted to run on Vercel Serverless Functions.
*   **Database:** Supabase (Postgres) hosting both original Twenty schema and new `giselle` schema.
*   **Authentication:** Supabase Auth.
*   **Frontend:** React (`packages/twenty-front`) using `packages/twenty-ui` components.
*   **AI:** LangGraph/Langchain with OpenAI (`gpt-4o`).
*   **Background Jobs:** BullMQ backed by Upstash Redis.
*   **Deployment:** Vercel.

## Phased Plan

**Phase 1: Foundation & Twenty CRM Adaptation** (Aligns with Guide Parts 1, 3, 6)

1.  **Supabase Setup:**
    *   Provision a new Supabase project.
    *   Apply the `giselle` schema using the provided SQL (`supabase/migrations/1_initial_schema.sql`).
    *   Implement the Row Level Security (RLS) policies defined in the SQL script.
2.  **`twenty-server` Adaptation (NestJS):**
    *   Update database connection configuration in `twenty-server` to point to the Supabase instance. (Requires identifying and modifying the current DB connection logic, likely using Prisma or TypeORM).
    *   Run existing Twenty CRM database migrations against the Supabase instance to create the necessary Twenty tables alongside the `giselle` schema.
    *   Integrate Supabase Auth:
        *   Replace or augment the existing authentication module in `twenty-server` with Supabase Auth strategies (e.g., using `passport-supabase-auth`).
        *   Define user roles (e.g., 'candidate', 'hr-staff') aligned with RLS policies.
3.  **`twenty-front` Adaptation (React):**
    *   Integrate Supabase client library (`@supabase/supabase-js`).
    *   Update login/signup components to use Supabase Auth methods.
    *   Create a basic candidate application form component.
    *   Ensure frontend API calls target the adapted `twenty-server` endpoints.

**Phase 2: AI Resume Analysis Core** (Aligns with Guide Parts 2, 5)

1.  **Backend Setup (`twenty-server`):**
    *   Add Langchain, LangGraph, OpenAI, BullMQ, and Upstash Redis client dependencies.
    *   Create a new NestJS module (e.g., `AnalysisModule`) to encapsulate AI logic.
    *   Adapt the `resume-analyzer.ts` LangGraph agent logic into a NestJS service (`AnalysisService`) within this module. Use prompts from `resume-prompts.ts`.
    *   Configure BullMQ within NestJS, connecting to Upstash Redis.
    *   Create a BullMQ queue specifically for resume analysis jobs.
2.  **API & Worker:**
    *   Create a NestJS controller endpoint (e.g., `POST /applications/:id/analyze`) that receives an application ID and adds an analysis job to the BullMQ queue.
    *   Implement a BullMQ worker (can be part of the NestJS application instance or a separate process) that:
        *   Pulls jobs from the queue.
        *   Retrieves necessary data (resume text, job requirements) from Supabase via `twenty-server`'s database service.
        *   Executes the `AnalysisService` (LangGraph agent).
        *   Updates the corresponding `giselle.applications` record in Supabase with the `ai_score` and `ai_analysis` JSONB.
3.  **Evaluation:**
    *   Adapt the `resume-analyzer-test.ts` script into a test suite (e.g., using Jest) within the `twenty-server` package to validate the agent's performance.

**Phase 3: Frontend Integration & Dashboard** (Aligns with Guide Part 4)

1.  **HR Dashboard (`twenty-front`):**
    *   Adapt the `HRDashboard.tsx` component structure using `twenty-ui` components where applicable.
    *   Fetch application data (including candidate and job details) from the adapted `twenty-server` endpoints.
    *   Implement the "Analyze" button to call the `POST /applications/:id/analyze` endpoint.
    *   Display application status, AI score (once available), and other details.
    *   Implement the Candidate Details Modal:
        *   Display summary, skills, job match details fetched from the `ai_analysis` field.
        *   Consider using Supabase Realtime subscriptions to automatically update the dashboard/modal when the background analysis job completes and updates the database.

**Phase 4: Advanced Features & Deployment** (Aligns with Guide Parts 6, 7, 8, 9)

1.  **Deployment (`vercel.json`):**
    *   Configure `vercel.json` to deploy the adapted `twenty-server` (NestJS) application, potentially splitting controllers into separate serverless functions if needed for performance.
    *   Map necessary environment variables (Supabase keys, OpenAI key, Upstash Redis URL, Twenty API keys if still needed externally).
2.  **CI/CD (GitHub Actions):**
    *   Create workflows for:
        *   Running tests (unit, integration, e2e) on PRs.
        *   Applying Supabase schema migrations (`supabase/migrations`).
        *   Deploying preview environments to Vercel on PRs.
        *   Deploying to production on merges to the main branch.
3.  **Enhancements (Based on Guide):**
    *   Implement bias mitigation features (blind screening toggle, audit reports).
    *   Plan/Implement interview scheduling features.
    *   Refine analytics and candidate comparison tools in the dashboard.
4.  **Testing & Refinement:**
    *   Conduct thorough end-to-end testing.
    *   Gather feedback and refine AI prompts/agent logic.
    *   Perform security reviews and performance optimizations.

## Architecture Diagram

```mermaid
graph TD
    subgraph User Interfaces (React - twenty-front)
        UI_Login[Login/Signup (Supabase Auth)]
        UI_AppForm[Candidate Application Form]
        UI_HRDash[HR Dashboard (Applications List)]
        UI_Modal[Candidate Details Modal (Analysis Results)]
    end

    subgraph Backend API (NestJS - twenty-server on Vercel)
        API_Auth[Auth Module (Supabase Auth)]
        API_Apps[Applications Module]
        API_Jobs[Jobs Module]
        API_AnalysisCtrl[Analysis Controller] --> API_QueueJob(Add Job to Queue)
        API_CoreServices[Core Twenty Services (Adapted)]
        API_DbService[Database Service (Supabase)]
    end

    subgraph Background Processing (BullMQ Worker on Vercel/QStash)
        BG_Queue[(BullMQ Queue)] --> BG_Worker{Analysis Worker}
        BG_Worker -- Uses --> AI_Agent[LangGraph Agent Service]
        BG_Worker -- Updates --> DB[(Supabase DB)]
    end

    subgraph Data & Services
        DB[(Supabase DB)]
        DB -- Contains --> Schema_Twenty[Twenty Schema]
        DB -- Contains --> Schema_Giselle[Giselle Schema]
        Ext_OpenAI[OpenAI API]
        Ext_Redis[(Upstash Redis)]
    end

    %% UI to API
    UI_Login --> API_Auth
    UI_AppForm --> API_Apps
    UI_HRDash -- Fetches Data --> API_Apps
    UI_HRDash -- Triggers Analysis --> API_AnalysisCtrl
    UI_Modal -- Fetches Details --> API_Apps

    %% API Internal & External
    API_Auth --> DB
    API_Apps --> API_DbService
    API_Jobs --> API_DbService
    API_CoreServices --> API_DbService
    API_DbService --> DB
    API_QueueJob -- Sends Job --> BG_Queue

    %% Background Processing
    BG_Queue -- Powered By --> Ext_Redis
    AI_Agent -- Calls --> Ext_OpenAI

    %% RLS enforced at DB level
    DB -- RLS Policies Applied --> API_DbService