
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

export async function analyzeResume(text: string, apiKey: string, jobDescription?: string): Promise<AnalysisResult> {
  // Use the most stable models first for production/hosting environments
  const modelNames = [
    "gemini-1.5-flash",
    "gemini-1.5-pro",
    "gemini-1.5-flash-latest"
  ];

  const prompt = `
    Analyze the following resume text as if you were an expert ATS (Applicant Tracking System) and Career Coach.
    
    Resume Text:
    "${text.substring(0, 15000)}"

    ${jobDescription ? `Job Description to match against: "${jobDescription.substring(0, 5000)}"` : ""}

    Return ONLY a valid JSON object with the following structure:
    {
      "detectedRole": "Primary profession detected",
      "matchPercentage": 75,
      "categoryScores": [
        { "name": "Technical Skills", "score": 80 },
        { "name": "Experience Impact", "score": 65 },
        { "name": "Education", "score": 90 },
        { "name": "Formatting", "score": 70 }
      ],
      "missingSkills": ["List of keywords/skills that should be there for this role"],
      "jobRecommendations": ["3-5 Best job titles this person should apply for"],
      "projectIdeas": ["2-3 specific project ideas to boost this specific profile"],
      "writingIssues": [
        { "issue": "Specific spelling/grammar error found", "suggestion": "How to fix it" }
      ],
      "missingPortions": ["Sections or info missing like 'Summary', 'Portfolio Link', 'Certifications'"],
      "suggestions": ["General career advice"],
      "interviewQuestions": [
        { "question": "A challenging technical or behavioral question", "rationale": "Why this question is being asked based on their gaps" }
      ]
      ${jobDescription ? `, "jdMatchScore": 85, "jdAnalysis": "Detailed explanation of how well the resume matches the specific job description provided, highlighting strengths and specific keyword gaps."` : ""}
    }
  `;

  const genAI = new GoogleGenerativeAI(apiKey);

  for (const modelName of modelNames) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent(prompt);
      const res = await result.response;
      const jsonText = res.text().replace(/^```json\n|\n```$/g, "").trim();

      // Basic validation that we got JSON
      if (jsonText.startsWith('{') && jsonText.endsWith('}')) {
        return JSON.parse(jsonText);
      }
    } catch (e: any) {
      console.warn(`Model ${modelName} failed:`, e.message);
      // If unauthorized, don't keep trying other models
      if (e.message?.includes('API_KEY_INVALID') || e.message?.includes('403')) {
        throw new Error("Invalid API Key. Please check your Gemini API key.");
      }
    }
  }

  // Fallback REST API with a hardcoded stable endpoint
  try {
    const restUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    const restRes = await fetch(restUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });

    if (restRes.ok) {
      const data = await restRes.json();
      const textOutput = data.candidates[0].content.parts[0].text;
      const cleaned = textOutput.replace(/^```json\n|\n```$/g, "").trim();
      return JSON.parse(cleaned);
    } else {
      const errData = await restRes.json();
      throw new Error(errData.error?.message || "API request failed");
    }
  } catch (e: any) {
    console.error("Analysis Error:", e.message);
    throw new Error(e.message || "Connection failed. Please check your internet and API key.");
  }
}
