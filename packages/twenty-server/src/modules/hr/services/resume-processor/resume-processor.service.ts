import { StructuredOutputParser } from '@langchain/core/output_parsers';
import { PromptTemplate } from '@langchain/core/prompts';
import { RunnableSequence } from '@langchain/core/runnables';
import { ChatOpenAI } from '@langchain/openai';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { z } from 'zod';

// Define schema for education entry
const educationSchema = z.object({
  degree: z.string().optional(),
  field: z.string().optional(),
  institution: z.string().optional(),
  year: z.string().optional(),
});

// Define schema for work experience entry
const workExperienceSchema = z.object({
  title: z.string().optional(),
  company: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  description: z.string().optional(),
});

// Define schema for resume data
const resumeDataSchema = z.object({
  skills: z.array(z.string()),
  experienceYears: z.number(),
  resumeData: z.object({
    education: z.array(educationSchema),
    workExperience: z.array(workExperienceSchema),
  }),
});

// Define the type for the schema output
type ResumeData = z.infer<typeof resumeDataSchema>;

@Injectable()
export class ResumeProcessorService {
  private readonly logger = new Logger(ResumeProcessorService.name);
  private parser: StructuredOutputParser<ResumeData>;
  private chainWithParser: RunnableSequence;

  constructor(private configService: ConfigService) {
    this.initializeChain();
  }

  private initializeChain() {
    try {
      // Initialize the output parser
      this.parser = StructuredOutputParser.fromZodSchema<ResumeData>(resumeDataSchema);

      // Create the prompt template
      const promptTemplate = PromptTemplate.fromTemplate(`
        Extract the following information from this resume:
        1. A list of technical skills
        2. Total years of experience
        3. Structured data including education and work experience
        
        Resume text:
        {resumeText}
        
        {format_instructions}
      `);

      // Initialize the language model
      const model = new ChatOpenAI({
        modelName: this.configService.get<string>('AI_MODEL', 'gpt-4o'),
        temperature: 0.1,
        openAIApiKey: this.configService.get<string>('OPENAI_API_KEY'),
      });

      // Create the chain
      this.chainWithParser = RunnableSequence.from([
        {
          resumeText: (input) => input.resumeText,
          format_instructions: () => this.parser.getFormatInstructions(),
        },
        promptTemplate,
        model,
        this.parser,
      ]);
    } catch (error) {
      this.logger.error('Error initializing LangChain resume processor', error);
      throw error;
    }
  }

  async analyzeResume(resumeText: string): Promise<{
    skills: string[];
    experienceYears: number;
    resumeData: Record<string, any>;
  }> {
    try {
      // Process the resume
      const result = await this.chainWithParser.invoke({
        resumeText,
      });

      return {
        skills: result.skills,
        experienceYears: result.experienceYears,
        resumeData: result.resumeData,
      };
    } catch (error) {
      this.logger.error('Error analyzing resume with LangChain', error);
      return {
        skills: [],
        experienceYears: 0,
        resumeData: {
          education: [],
          workExperience: [],
        },
      };
    }
  }
} 