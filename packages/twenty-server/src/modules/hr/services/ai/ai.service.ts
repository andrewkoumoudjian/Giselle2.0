import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private openAiApiKey: string;
  private openRouterApiKey: string;
  private useOpenRouter: boolean;

  constructor(private configService: ConfigService) {
    this.openAiApiKey = this.configService.get<string>('OPENAI_API_KEY');
    this.openRouterApiKey = this.configService.get<string>('OPENROUTER_API_KEY');
    this.useOpenRouter = !!this.openRouterApiKey;
  }

  // Resume parsing and skill extraction
  async analyzeResume(resumeText: string): Promise<{
    skills: string[];
    experienceYears: number;
    resumeData: Record<string, any>;
  }> {
    const prompt = `
      Extract the following information from this resume:
      1. A list of technical skills
      2. Total years of experience
      3. Structured data including education and work experience
      
      Resume text:
      ${resumeText}
      
      Respond with a JSON object only, no other text, with the following structure:
      {
        "skills": ["skill1", "skill2", ...],
        "experienceYears": number,
        "resumeData": {
          "education": [
            { "degree": "...", "field": "...", "institution": "...", "year": "..." }
          ],
          "workExperience": [
            { "title": "...", "company": "...", "startDate": "...", "endDate": "...", "description": "..." }
          ]
        }
      }
    `;

    const response = await this.sendAiRequest({
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.1,
      max_tokens: 1500,
    });

    try {
      // Parse the response
      return JSON.parse(response);
    } catch (error) {
      this.logger.error('Error parsing AI response for resume analysis', { error });
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

  // Job description analysis to extract key skills
  async analyzeJobRequirements(description: string): Promise<string[]> {
    const prompt = `
      Extract technical and soft skills from this job description:
      
      ${description}
      
      Respond with a JSON array only, no other text, containing the skills in the following format:
      ["skill1", "skill2", ...]
    `;

    const response = await this.sendAiRequest({
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.1,
      max_tokens: 500,
    });

    try {
      // Parse the response
      return JSON.parse(response);
    } catch (error) {
      this.logger.error('Error parsing AI response for job requirements analysis', { error });
      return [];
    }
  }

  // Generate interview questions based on job requirements
  async generateInterviewQuestions(jobTitle: string, requiredSkills: string[]): Promise<any[]> {
    const prompt = `
      Generate interview questions for a ${jobTitle} position.
      The job requires the following skills: ${requiredSkills.join(', ')}.
      
      Create 3 general questions and 2 specific questions for each skill listed.
      
      Respond with a JSON array only, no other text, with the following structure:
      [
        {
          "id": "1",
          "question": "...",
          "type": "general"
        },
        {
          "id": "skill-javascript-1",
          "question": "...",
          "type": "technical",
          "skill": "JavaScript"
        }
      ]
    `;

    const response = await this.sendAiRequest({
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 1500,
    });

    try {
      // Parse the response
      return JSON.parse(response);
    } catch (error) {
      this.logger.error('Error parsing AI response for interview questions', { error });
      return [];
    }
  }

  // Evaluate interview responses
  async evaluateResponse(question: string, response: string, jobTitle: string, skill?: string): Promise<{
    score: number;
    feedback: string;
  }> {
    const prompt = `
      Evaluate this interview response for a ${jobTitle} position${skill ? ` related to ${skill}` : ''}.
      
      Question: ${question}
      Response: ${response}
      
      Score the response from 1-5 (with 5 being excellent) based on clarity, relevance, and technical accuracy.
      Provide brief constructive feedback.
      
      Respond with a JSON object only, no other text, with the following structure:
      {
        "score": number,
        "feedback": "..."
      }
    `;

    const response_text = await this.sendAiRequest({
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      max_tokens: 500,
    });

    try {
      // Parse the response
      return JSON.parse(response_text);
    } catch (error) {
      this.logger.error('Error parsing AI response for interview evaluation', { error });
      return {
        score: 3,
        feedback: 'Unable to properly evaluate the response.',
      };
    }
  }

  // Helper method to send requests to OpenAI or OpenRouter
  private async sendAiRequest(params: {
    messages: Array<{ role: string; content: string }>;
    temperature: number;
    max_tokens: number;
  }): Promise<string> {
    try {
      if (this.useOpenRouter) {
        // Use OpenRouter
        const response = await axios.post(
          'https://openrouter.ai/api/v1/chat/completions',
          {
            model: 'openai/gpt-4-turbo',
            messages: params.messages,
            temperature: params.temperature,
            max_tokens: params.max_tokens,
          },
          {
            headers: {
              Authorization: `Bearer ${this.openRouterApiKey}`,
              'HTTP-Referer': 'https://hr-platform.example.com',
              'X-Title': 'HR Platform',
            },
          }
        );
        return response.data.choices[0].message.content;
      } else {
        // Use OpenAI directly
        const response = await axios.post(
          'https://api.openai.com/v1/chat/completions',
          {
            model: 'gpt-4-turbo',
            messages: params.messages,
            temperature: params.temperature,
            max_tokens: params.max_tokens,
          },
          {
            headers: {
              Authorization: `Bearer ${this.openAiApiKey}`,
              'Content-Type': 'application/json',
            },
          }
        );
        return response.data.choices[0].message.content;
      }
    } catch (error) {
      console.error('Error in AI service:', error.response?.data || error.message);
      throw new Error('Failed to get AI response');
    }
  }
}