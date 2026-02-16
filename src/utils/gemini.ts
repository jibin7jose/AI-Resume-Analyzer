
import { GoogleGenerativeAI } from "@google/generative-ai";

export interface CategoryScore {
  name: string;
  score: number;
}

export interface WritingIssue {
  issue: string;
  suggestion: string;
}

export interface InterviewQuestion {
  question: string;
  rationale: string;
}

export interface AnalysisResult {
  detectedRole: string;
  matchPercentage: number;
  categoryScores: CategoryScore[];
  missingSkills: string[];
  jobRecommendations: string[];
  projectIdeas: string[];
  writingIssues: WritingIssue[];
  missingPortions: string[];
  suggestions: string[];
  interviewQuestions: InterviewQuestion[];
  jdMatchScore?: number;
  jdAnalysis?: string;
}

/**
 * Robust resume analysis using Google's Gemini AI.
 * Updated for Feb 2026 compatibility: Uses Gemini 2.0 and stable fallbacks.
 */
export async function analyzeResume(text: string, apiKey: string, jobDescription?: string): Promise<AnalysisResult> {
  const prompt = `
    Analyze this resume text as an expert ATS and Career Coach.
    
    Resume: "${text.substring(0, 15000).replace(/"/g, "'")}"
    ${jobDescription ? `Match against: "${jobDescription.substring(0, 5000).replace(/"/g, "'")}"` : ""}

    Return ONLY a valid JSON object.
    {
      "detectedRole": "Professional role",
      "matchPercentage": 75,
      "categoryScores": [{ "name": "Technical Skills", "score": 80 }, { "name": "Experience Impact", "score": 65 }, { "name": "Education", "score": 90 }, { "name": "Formatting", "score": 70 }],
      "missingSkills": ["skill1", "skill2"],
      "jobRecommendations": ["job1", "job2"],
      "projectIdeas": ["idea1", "idea2"],
      "writingIssues": [{ "issue": "...", "suggestion": "..." }],
      "missingPortions": ["link", "summary"],
      "suggestions": ["advice1"],
      "interviewQuestions": [{ "question": "...", "rationale": "..." }]
      ${jobDescription ? `, "jdMatchScore": 85, "jdAnalysis": "Match analysis"` : ""}
    }
  `;

  // 2026 Model Strategy
  const configs = [
    { name: "gemini-2.0-flash", version: "v1" },
    { name: "gemini-2.0-flash-lite-preview", version: "v1beta" },
    { name: "gemini-2.0-flash-latest", version: "v1" },
    { name: "gemini-pro", version: "v1" }
  ];

  for (const config of configs) {
    try {
      console.log(`Attempting analysis with ${config.name} (${config.version})...`);
      const restUrl = `https://generativelanguage.googleapis.com/${config.version}/models/${config.name}:generateContent?key=${apiKey}`;

      const response = await fetch(restUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
      });

      if (response.ok) {
        const data = await response.json();
        const textOutput = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!textOutput) continue;
        const cleaned = textOutput.replace(/^```json\n|\n```$|^```\n|\n```$/g, "").trim();
        return JSON.parse(cleaned);
      } else {
        const errData = await response.json().catch(() => ({}));
        const errMsg = errData.error?.message || response.statusText;
        console.warn(`${config.name} failed:`, errMsg);
        if (response.status === 429 || response.status === 404) continue;
        if (response.status === 403) throw new Error("API Key verification failed.");
      }
    } catch (e: any) {
      if (e.message?.includes("API Key")) throw e;
      console.error(`Error with ${config.name}:`, e.message);
    }
  }

  throw new Error("AI Analysis reached rate limits. Please try again in 30 seconds.");
}
