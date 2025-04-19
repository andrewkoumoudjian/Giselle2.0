import { StringOutputParser } from '@langchain/core/output_parsers';
import { PromptTemplate } from '@langchain/core/prompts';
import { RunnableSequence } from '@langchain/core/runnables';
import { ChatOpenAI } from '@langchain/openai';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LLMTracingService } from 'src/engine/core-modules/llm-tracing/llm-tracing.service';

interface MatchResult {
  score: number;
  matchedSkills: string[];
  missingSkills: string[];
  additionalSkills: string[];
  summary: string;
}

@Injectable()
export class JobMatcherService {
  private readonly logger = new Logger(JobMatcherService.name);
  private matchChain: RunnableSequence;

  constructor(
    private configService: ConfigService,
    private llmTracingService: LLMTracingService,
  ) {
    this.initializeChain();
  }

  private initializeChain() {
    try {
      // Initialize the language model with tracing
      const model = new ChatOpenAI({
        modelName: this.configService.get<string>('AI_MODEL', 'gpt-4o'),
        temperature: 0.1,
        openAIApiKey: this.configService.get<string>('OPENAI_API_KEY'),
      }).bind({
        callbacks: [
          this.llmTracingService.getCallbackHandler({
            operation: 'job_matching',
          }),
        ],
      });

      // Create the prompt template for matching
      const promptTemplate = PromptTemplate.fromTemplate(`
        You are an expert HR assistant tasked with matching candidates to job positions.
        
        Job Requirements:
        {jobRequirements}
        
        Candidate Skills:
        {candidateSkills}
        
        Please analyze how well the candidate's skills match the job requirements.
        Provide the following information in JSON format:
        1. A match score from 0 to 100
        2. List of matched skills
        3. List of missing skills (required but not possessed by the candidate)
        4. List of additional skills (possessed by the candidate but not required)
        5. A brief summary explaining the match
        
        Response format:
        {
          "score": number,
          "matchedSkills": string[],
          "missingSkills": string[],
          "additionalSkills": string[],
          "summary": string
        }
      `);

      // Create the parser
      const parser = new StringOutputParser();

      // Create the chain
      this.matchChain = RunnableSequence.from([
        {
          jobRequirements: (input) => input.jobRequirements,
          candidateSkills: (input) => input.candidateSkills,
        },
        promptTemplate,
        model,
        parser,
      ]);
    } catch (error) {
      this.logger.error('Error initializing LangChain job matcher', error);
      throw error;
    }
  }

  async matchCandidateToJob(
    candidateSkills: string[],
    jobRequirements: string[],
  ): Promise<MatchResult> {
    try {
      // Run the match chain
      const resultString = await this.matchChain.invoke({
        jobRequirements: jobRequirements.join(', '),
        candidateSkills: candidateSkills.join(', '),
      });

      // Parse the JSON response
      const result = JSON.parse(resultString);

      return {
        score: result.score,
        matchedSkills: result.matchedSkills,
        missingSkills: result.missingSkills,
        additionalSkills: result.additionalSkills,
        summary: result.summary,
      };
    } catch (error) {
      this.logger.error('Error matching candidate to job with LangChain', error);
      return {
        score: 0,
        matchedSkills: [],
        missingSkills: [],
        additionalSkills: [],
        summary: 'Error occurred during matching process.',
      };
    }
  }
} 