import { ChatOpenAI } from "langchain/chat_models/openai";
import { HumanMessage, SystemMessage } from "langchain/schema";
import { createAgent, createFlow, createToolNode } from "langgraph/graph";

// Initialize the LLM
const llm = new ChatOpenAI({
  modelName: "gpt-4o",
  temperature: 0,
});

// Create extraction tool to pull skills from resume
const extractSkillsNode = createToolNode({
  name: "extract_skills",
  description: "Extract skills and experience from a resume",
  inputSchema: {
    resume: {
      type: "string",
      description: "The resume text content",
    },
  },
  handler: async ({ resume }) => {
    const response = await llm.invoke([
      new SystemMessage(
        `You are a skilled HR professional. Extract ALL technical skills, soft skills, and experience from the resume. Format as a JSON object with three keys: "technicalSkills", "softSkills", and "experience".`
      ),
      new HumanMessage(resume),
    ]);
    return JSON.parse(response.content);
  },
});

// Create matching tool to compare requirements with resume
const matchJobRequirementsNode = createToolNode({
  name: "match_job_requirements",
  description: "Match job requirements against candidate skills",
  inputSchema: {
    jobRequirements: {
      type: "object",
      description: "Job requirements object",
    },
    candidateSkills: {
      type: "object",
      description: "Candidate skills and experience",
    },
  },
  handler: async ({ jobRequirements, candidateSkills }) => {
    const response = await llm.invoke([
      new SystemMessage(
        `You are a skilled HR professional. Compare the job requirements with the candidate's skills and experience. 
      Provide a detailed analysis of the match with the following:
      1. Overall percentage match score (0-100)
      2. Key matches between requirements and candidate profile
      3. Important missing qualifications
      4. Additional candidate strengths not required but valuable
      Return as a JSON object with keys: "matchScore", "keyMatches", "missingQualifications", "additionalStrengths"`
      ),
      new HumanMessage(
        `Job Requirements: ${JSON.stringify(
          jobRequirements
        )}\n\nCandidate Skills: ${JSON.stringify(candidateSkills)}`
      ),
    ]);
    return JSON.parse(response.content);
  },
});

// Create a node for summarizing the analysis
const generateSummaryNode = createToolNode({
  name: "generate_summary",
  description: "Generate a summary of the candidate analysis",
  inputSchema: {
    matchResults: {
      type: "object",
      description: "The results of the job matching",
    },
    candidateSkills: {
      type: "object",
      description: "Candidate skills and experience",
    },
  },
  handler: async ({ matchResults, candidateSkills }) => {
    const response = await llm.invoke([
      new SystemMessage(
        `Generate a concise summary for HR professionals about this candidate. Include key strengths, weaknesses, fit for role, and recommended next steps.`
      ),
      new HumanMessage(
        `Match Results: ${JSON.stringify(
          matchResults
        )}\n\nCandidate Details: ${JSON.stringify(candidateSkills)}`
      ),
    ]);
    return response.content;
  },
});

// Define the agent workflow
export const resumeAnalysisFlow = createFlow({
  nodes: {
    extractSkills: extractSkillsNode,
    matchJobRequirements: matchJobRequirementsNode,
    generateSummary: generateSummaryNode,
  },
  edges: {
    start: "extractSkills",
    extractSkills: "matchJobRequirements",
    matchJobRequirements: "generateSummary",
    generateSummary: "end",
  },
});

// Create the agent
export const resumeAnalysisAgent = createAgent({
  name: "ResumeAnalyzer",
  description: "Analyzes resumes and matches them to job requirements",
  flow: resumeAnalysisFlow,
});