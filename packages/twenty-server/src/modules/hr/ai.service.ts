import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

interface AiResponse {
  skills?: string[];
  matchScore?: number;
  questions?: string[];
  analysis?: any;
}

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private readonly apiKey: string;
  private readonly apiEndpoint: string;
  private readonly model: string;

  constructor(private readonly configService: ConfigService) {
    this.apiKey = this.configService.get<string>('AI_API_KEY', '');
    this.apiEndpoint = this.configService.get<string>(
      'AI_API_ENDPOINT',
      'https://openrouter.ai/api/v1/chat/completions'
    );
    this.model = this.configService.get<string>(
      'AI_MODEL',
      'openai/gpt-4-1106-preview'
    );
  }

  async extractSkillsFromText(text: string): Promise<AiResponse> {
    try {
      const response = await this.callAiApi({
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant that extracts skills from job descriptions.'
          },
          {
            role: 'user',
            content: `Extract the technical and soft skills from the following job description. Return ONLY a JSON array of skills with no explanation or other text:\n\n${text}`
          }
        ]
      });

      // Parse the response to extract skills
      const content = response?.choices?.[0]?.message?.content;
      if (!content) {
        return { skills: [] };
      }

      // Try to parse JSON directly from the content
      try {
        const skillsJson = JSON.parse(content);
        if (Array.isArray(skillsJson)) {
          return { skills: skillsJson };
        }
        if (skillsJson.skills && Array.isArray(skillsJson.skills)) {
          return { skills: skillsJson.skills };
        }
      } catch (error) {
        // If direct parsing failed, try to extract a JSON array from the text
        const match = content.match(/\[.*?\]/s);
        if (match) {
          try {
            const skills = JSON.parse(match[0]);
            return { skills };
          } catch (innerError) {
            this.logger.error('Error parsing skills JSON', innerError);
          }
        }
        
        // If all else fails, simply split by commas or newlines
        const skills = content
          .replace(/[\[\]"'{}]/g, '')
          .split(/[,\n]+/)
          .map(s => s.trim())
          .filter(s => s.length > 0);
        
        return { skills };
      }

      return { skills: [] };
    } catch (error) {
      this.logger.error('Error extracting skills from text', error);
      return { skills: [] };
    }
  }

  async getMatchScore(candidateSkills: string[], jobSkills: string[]): Promise<AiResponse> {
    try {
      const response = await this.callAiApi({
        messages: [
          {
            role: 'system',
            content: 'You are an HR assistant that calculates match scores between candidates and job requirements.'
          },
          {
            role: 'user',
            content: `Calculate a match score (0-100) between these candidate skills and job requirements. Return ONLY a JSON with the score and no other text.\n\nCandidate skills: ${candidateSkills.join(', ')}\n\nJob requirements: ${jobSkills.join(', ')}`
          }
        ]
      });

      const content = response?.choices?.[0]?.message?.content;
      if (!content) {
        return { matchScore: 0 };
      }

      // Try to parse JSON from the content
      try {
        const scoreJson = JSON.parse(content);
        if (typeof scoreJson === 'number') {
          return { matchScore: scoreJson };
        }
        if (scoreJson.score || scoreJson.matchScore) {
          return { matchScore: scoreJson.score || scoreJson.matchScore };
        }
      } catch (error) {
        // Extract numbers from the text
        const match = content.match(/\d+/);
        if (match) {
          const score = parseInt(match[0], 10);
          if (!isNaN(score) && score >= 0 && score <= 100) {
            return { matchScore: score };
          }
        }
      }

      return { matchScore: 0 };
    } catch (error) {
      this.logger.error('Error calculating match score', error);
      return { matchScore: 0 };
    }
  }

  async generateInterviewQuestions(jobDescription: string, candidateSkills: string[]): Promise<AiResponse> {
    try {
      const response = await this.callAiApi({
        messages: [
          {
            role: 'system',
            content: 'You are an HR assistant that generates relevant interview questions.'
          },
          {
            role: 'user',
            content: `Generate 5 technical interview questions based on this job description and candidate skills. Make the questions challenging but fair. Return ONLY a JSON array of questions with no explanation.\n\nJob Description: ${jobDescription}\n\nCandidate Skills: ${candidateSkills.join(', ')}`
          }
        ]
      });

      const content = response?.choices?.[0]?.message?.content;
      if (!content) {
        return { questions: [] };
      }

      // Try to parse JSON from the content
      try {
        const questionsJson = JSON.parse(content);
        if (Array.isArray(questionsJson)) {
          return { questions: questionsJson };
        }
        if (questionsJson.questions && Array.isArray(questionsJson.questions)) {
          return { questions: questionsJson.questions };
        }
      } catch (error) {
        // Parse questions line by line
        const questions = content
          .split(/\d+\.|\n/)
          .map(q => q.trim())
          .filter(q => q.length > 0 && q.endsWith('?'));
        
        return { questions };
      }

      return { questions: [] };
    } catch (error) {
      this.logger.error('Error generating interview questions', error);
      return { questions: [] };
    }
  }

  async analyzeInterviewResponse(question: string, response: string): Promise<AiResponse> {
    try {
      const aiResponse = await this.callAiApi({
        messages: [
          {
            role: 'system',
            content: 'You are an HR assistant that analyzes interview responses.'
          },
          {
            role: 'user',
            content: `Analyze this interview response objectively. Rate technical accuracy, communication clarity, and overall fit on a scale of 1-10. Return a JSON with these ratings and a brief feedback comment.\n\nQuestion: ${question}\n\nResponse: ${response}`
          }
        ]
      });

      const content = aiResponse?.choices?.[0]?.message?.content;
      if (!content) {
        return { analysis: null };
      }

      // Try to parse JSON from the content
      try {
        const analysisJson = JSON.parse(content);
        return { analysis: analysisJson };
      } catch (error) {
        // Create a structured analysis from text
        return {
          analysis: {
            technicalAccuracy: 5,
            communicationClarity: 5,
            overallFit: 5,
            feedback: content.substring(0, 200) // Use first 200 chars as feedback
          }
        };
      }
    } catch (error) {
      this.logger.error('Error analyzing interview response', error);
      return { analysis: null };
    }
  }

  private async callAiApi(requestData: any): Promise<any> {
    if (!this.apiKey) {
      this.logger.warn('AI_API_KEY not set. Using mock responses.');
      return this.getMockResponse(requestData);
    }

    try {
      const response = await axios.post(
        this.apiEndpoint,
        {
          model: this.model,
          ...requestData,
          max_tokens: 1000,
          temperature: 0.1, // Low temperature for more deterministic responses
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`,
          },
        }
      );

      return response.data;
    } catch (error) {
      this.logger.error('Error calling AI API', error.response?.data || error.message);
      throw error;
    }
  }

  private getMockResponse(requestData: any): any {
    // Extract the user request to determine what kind of mock to return
    const userMessage = requestData.messages.find((m: any) => m.role === 'user')?.content || '';

    if (userMessage.includes('Extract the technical and soft skills')) {
      return {
        choices: [{
          message: {
            content: '["JavaScript", "React", "TypeScript", "Node.js", "Communication", "Problem Solving"]'
          }
        }]
      };
    }
    
    if (userMessage.includes('Calculate a match score')) {
      return {
        choices: [{
          message: {
            content: '{"score": 75}'
          }
        }]
      };
    }
    
    if (userMessage.includes('Generate 5 technical interview questions')) {
      return {
        choices: [{
          message: {
            content: '["Explain how React\'s virtual DOM works and its benefits?", "How would you optimize the performance of a Node.js application?", "Describe your experience with TypeScript interfaces vs. types.", "What strategies do you use for state management in large React applications?", "How do you handle API error states in your frontend applications?"]'
          }
        }]
      };
    }
    
    if (userMessage.includes('Analyze this interview response')) {
      return {
        choices: [{
          message: {
            content: '{"technicalAccuracy": 7, "communicationClarity": 8, "overallFit": 7, "feedback": "The candidate demonstrated good technical knowledge but could provide more specific examples."}'
          }
        }]
      };
    }
    
    // Default mock response
    return {
      choices: [{
        message: {
          content: 'Mock AI response'
        }
      }]
    };
  }
}