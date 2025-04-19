import { StructuredOutputParser } from '@langchain/core/output_parsers';
import { PromptTemplate } from '@langchain/core/prompts';
import { RunnableSequence } from '@langchain/core/runnables';
import { ChatOpenAI } from '@langchain/openai';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LLMTracingService } from 'src/engine/core-modules/llm-tracing/llm-tracing.service';
import { z } from 'zod';

// Define schema for interview questions
const questionSchema = z.object({
  id: z.string(),
  question: z.string(),
  type: z.enum(['general', 'technical', 'behavioral']),
  skill: z.string().optional(),
  expectedResponse: z.string().optional(),
  difficulty: z.enum(['easy', 'medium', 'hard']).optional(),
});

// Define schema for the output
const questionsOutputSchema = z.array(questionSchema);

// Define the type for the schema output
type QuestionOutput = z.infer<typeof questionsOutputSchema>;

@Injectable()
export class InterviewQuestionGeneratorService {
  private readonly logger = new Logger(InterviewQuestionGeneratorService.name);
  private parser: StructuredOutputParser<QuestionOutput>;
  private questionGeneratorChain: RunnableSequence;

  constructor(
    private configService: ConfigService,
    private llmTracingService: LLMTracingService,
  ) {
    this.initializeChain();
  }

  private initializeChain() {
    try {
      // Initialize the output parser
      this.parser = StructuredOutputParser.fromZodSchema<QuestionOutput>(questionsOutputSchema);

      // Create the prompt template
      const promptTemplate = PromptTemplate.fromTemplate(`
        Generate interview questions for a {jobTitle} position.
        The job requires the following skills: {requiredSkills}.
        The candidate has the following skills: {candidateSkills}.
        
        Create 3 general questions, 2 behavioral questions, and 2 specific technical questions for each of the 
        top 3 most important skills required for the position.
        
        For each question, generate:
        1. A unique ID
        2. The question text
        3. The type of question (general, technical, or behavioral)
        4. The skill being tested (for technical questions)
        5. A brief expected response outline
        6. A difficulty level (easy, medium, or hard)
        
        {format_instructions}
      `);

      // Initialize the language model with tracing
      const model = new ChatOpenAI({
        modelName: this.configService.get<string>('AI_MODEL', 'gpt-4o'),
        temperature: 0.7,
        openAIApiKey: this.configService.get<string>('OPENAI_API_KEY'),
      }).bind({
        callbacks: [
          this.llmTracingService.getCallbackHandler({
            operation: 'interview_question_generation',
          }),
        ],
      });

      // Create the chain
      this.questionGeneratorChain = RunnableSequence.from([
        {
          jobTitle: (input: any) => input.jobTitle,
          requiredSkills: (input: any) => input.requiredSkills,
          candidateSkills: (input: any) => input.candidateSkills,
          format_instructions: () => this.parser.getFormatInstructions(),
        },
        promptTemplate,
        model,
        this.parser,
      ]);
    } catch (error) {
      this.logger.error('Error initializing LangChain interview question generator', error);
      throw error;
    }
  }

  async generateQuestions(
    jobTitle: string,
    requiredSkills: string[],
    candidateSkills: string[] = [],
  ): Promise<QuestionOutput> {
    try {
      // Generate the questions
      const result = await this.questionGeneratorChain.invoke({
        jobTitle,
        requiredSkills: requiredSkills.join(', '),
        candidateSkills: candidateSkills.join(', '),
      });

      return result;
    } catch (error) {
      this.logger.error('Error generating interview questions with LangChain', error);
      return [];
    }
  }
} 