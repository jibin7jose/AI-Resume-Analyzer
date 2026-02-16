
import { GoogleGenerativeAI } from "@google/generative-ai";

export interface CategoryScore {
  name: string;
  score: number;
}

export interface WritingIssue {
  issue: string;
  suggestion: string;
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
}

export async function analyzeResume(text: string, apiKey: string): Promise<AnalysisResult> {
  const prompt = `
    Analyze the following resume text as if you were an expert ATS (Applicant Tracking System) and Career Coach.
    
    Resume Text:
    "${text.substring(0, 15000)}"

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
        { "issue": "Specific spelling/grammar error or weak phrasing found", "suggestion": "How to fix it" }
      ],
      "missingPortions": ["Sections or info missing like 'Summary', 'Portfolio Link', 'Certifications'"],
      "suggestions": ["General career advice based on the profile"]
    }
  `;

  // 2026 Preferred Models
  const models = [
    "gemini-2.5-flash",
    "gemini-flash-latest",
    "gemini-2.0-flash",
    "gemini-2.5-pro"
  ];

  const genAI = new GoogleGenerativeAI(apiKey);

  for (const modelName of models) {
    try {
      console.log(`Trying SDK with ${modelName}...`);
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent(prompt);
      const res = await result.response;
      const jsonText = res.text().replace(/^```json\n|\n```$/g, "").trim();
      return JSON.parse(jsonText);
    } catch (e: any) {
      console.warn(`SDK ${modelName} failed:`, e.message);
    }
  }

  // Fallback REST API
  console.log("SDK failed, attempting direct REST API call...");
  try {
    const restUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
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
    }
  } catch (e: any) {
    console.error("Direct REST call failed:", e.message);
  }

  throw new Error("Analysis failed. Please check your connection or try again later.");
}
