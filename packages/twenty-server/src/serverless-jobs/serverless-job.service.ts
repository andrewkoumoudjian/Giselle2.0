import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import * as crypto from 'crypto';

/**
 * Service for managing background jobs in a serverless environment
 * Uses Upstash QStash for reliable job execution
 */
@Injectable()
export class ServerlessJobService {
  private readonly logger = new Logger(ServerlessJobService.name);
  private readonly qstashToken: string;
  private readonly qstashUrl = 'https://qstash.upstash.io/v1/publish';
  private readonly frontendUrl: string;
  private readonly currentSigningKey: string;
  private readonly nextSigningKey: string;

  constructor(private readonly configService: ConfigService) {
    this.qstashToken = this.configService.get<string>('QSTASH_TOKEN');
    this.frontendUrl = this.configService.get<string>('FRONTEND_URL');
    this.currentSigningKey = this.configService.get<string>('QSTASH_CURRENT_SIGNING_KEY');
    this.nextSigningKey = this.configService.get<string>('QSTASH_NEXT_SIGNING_KEY');
  }

  /**
   * Enqueues a job to be processed asynchronously via QStash
   * 
   * @param jobType The type of job to process
   * @param payload The data needed to process the job
   * @param options Optional settings like delay
   * @returns The QStash response containing the messageId
   */
  async enqueueJob(
    jobType: string,
    payload: Record<string, any>,
    options?: {
      delay?: number; // Delay in seconds
      deduplicationId?: string; // Unique ID to prevent duplicate jobs
    },
  ) {
    if (!this.qstashToken) {
      this.logger.warn(
        'QStash token not configured. Jobs will not be enqueued in production.',
      );
      
      if (process.env.NODE_ENV === 'development') {
        this.logger.debug(
          `[DEV] Would have enqueued job: ${jobType} with payload:`,
          payload,
        );
        return { messageId: `dev-${Date.now()}`, success: true };
      }
      
      throw new Error('QStash token not configured');
    }

    try {
      // Construct the target URL for the job runner API route
      const targetUrl = `${this.frontendUrl}/api/job-runner`;
      
      // Prepare the data to send to QStash
      const jobData = {
        jobType,
        payload,
      };
      
      // Prepare the request headers
      const headers = {
        'Authorization': `Bearer ${this.qstashToken}`,
        'Content-Type': 'application/json',
      };
      
      // Add optional QStash parameters
      if (options?.delay) {
        headers['Upstash-Delay'] = String(options.delay);
      }
      
      if (options?.deduplicationId) {
        headers['Upstash-Deduplication-Id'] = options.deduplicationId;
      }
      
      // Send the job to QStash
      const response = await axios.post(
        this.qstashUrl,
        jobData,
        {
          headers,
          params: {
            url: targetUrl,
          },
        },
      );
      
      this.logger.debug(
        `Successfully enqueued job ${jobType} with ID: ${response.data.messageId}`,
      );
      
      return response.data;
    } catch (error) {
      this.logger.error(
        `Failed to enqueue job ${jobType}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Schedules a job to run at a specific time
   * 
   * @param jobType The type of job to process
   * @param payload The data needed to process the job
   * @param scheduledTime The ISO string time when the job should execute
   * @returns The QStash response
   */
  async scheduleJob(
    jobType: string,
    payload: Record<string, any>,
    scheduledTime: string,
  ) {
    // Calculate delay in seconds from now until the scheduled time
    const now = new Date();
    const scheduled = new Date(scheduledTime);
    const delaySeconds = Math.max(
      0,
      Math.floor((scheduled.getTime() - now.getTime()) / 1000),
    );
    
    return this.enqueueJob(jobType, payload, { delay: delaySeconds });
  }

  /**
   * Verify that a request actually came from QStash
   * 
   * @param signature The signature from the Upstash-Signature header
   * @param body The raw request body as a string
   * @returns boolean indicating whether the signature is valid
   */
  verifySignature(signature: string, body: string): boolean {
    if (!this.currentSigningKey) {
      this.logger.warn('QStash signing key not configured, skipping verification');
      return process.env.NODE_ENV === 'development';
    }

    try {
      // Parse the signature header
      const parsedSignature = this.parseSignatureHeader(signature);
      
      // Verify using current signing key
      const isValidWithCurrentKey = this.verifyWithKey(
        parsedSignature.signature,
        parsedSignature.timestamp,
        body,
        this.currentSigningKey,
      );
      
      if (isValidWithCurrentKey) {
        return true;
      }
      
      // Try with next signing key if available
      if (this.nextSigningKey) {
        return this.verifyWithKey(
          parsedSignature.signature,
          parsedSignature.timestamp,
          body,
          this.nextSigningKey,
        );
      }
      
      return false;
    } catch (error) {
      this.logger.error('Error verifying QStash signature:', error.message);
      return false;
    }
  }

  /**
   * Parse the signature header from QStash
   */
  private parseSignatureHeader(header: string) {
    const [signaturePart, timestampPart] = header.split(',');
    const signature = signaturePart.split('=')[1];
    const timestamp = timestampPart.split('=')[1];
    
    if (!signature || !timestamp) {
      throw new Error('Invalid QStash signature header format');
    }
    
    return { signature, timestamp };
  }

  /**
   * Verify the signature with a specific key
   */
  private verifyWithKey(
    signature: string,
    timestamp: string,
    body: string,
    key: string,
  ): boolean {
    const hmac = crypto.createHmac('sha256', key);
    const data = timestamp + body;
    const expectedSignature = hmac.update(data).digest('base64');
    
    return signature === expectedSignature;
  }
}