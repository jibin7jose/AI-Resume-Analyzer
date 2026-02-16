
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
 * Extremely resilient resume analysis.
 * Uses a double-loop strategy (Model + API Version) to bypass regional 404s and 429 quota caps.
 */
export async function analyzeResume(text: string, apiKey: string, jobDescription?: string): Promise<AnalysisResult> {
  const prompt = `
    Resume content: "${text.substring(0, 10000).replace(/"/g, "'")}"
    ${jobDescription ? `Job Description: "${jobDescription.substring(0, 3000).replace(/"/g, "'")}"` : ""}

    Act as a senior technical recruiter. Analyze the resume.
    Return ONLY a valid JSON object:
    {
      "detectedRole": "...",
      "matchPercentage": 0-100,
      "categoryScores": [{"name": "Technical", "score": 0-100}, {"name": "Experience", "score": 0-100}, {"name": "Education", "score": 0-100}, {"name": "Formatting", "score": 0-100}],
      "missingSkills": [],
      "jobRecommendations": [],
      "projectIdeas": [],
      "writingIssues": [{"issue": "...", "suggestion": "..."}],
      "missingPortions": [],
      "suggestions": [],
      "interviewQuestions": [{"question": "...", "rationale": "..."}]
      ${jobDescription ? `, "jdMatchScore": 0-100, "jdAnalysis": "..."` : ""}
    }
  `;

  // 2026-Ready model grid: Prioritizing 2.5 series found in the API discovery
  const models = [
    "gemini-2.5-flash",
    "gemini-2.5-pro",
    "gemini-2.0-flash",
    "gemini-2.0-flash-001",
    "gemini-1.5-flash",
    "gemini-1.5-pro",
    "gemini-pro"
  ];

  // Iterative strategy: Try each version of each model
  for (const modelName of models) {
    const versions = ["v1", "v1beta"];

    for (const version of versions) {
      try {
        console.log(`Checking ${modelName} (${version})...`);
        const restUrl = `https://generativelanguage.googleapis.com/${version}/models/${modelName}:generateContent?key=${apiKey}`;

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

          console.warn(`${modelName} (${version}) failed:`, errMsg);

          if (response.status === 403 && errMsg.includes("API Key")) {
            throw new Error("Invalid API Key. Please check your credentials.");
          }
          continue;
        }
      } catch (e: any) {
        if (e.message?.includes("API Key")) throw e;
        console.error(`Error with ${modelName}:`, e.message);
      }
    }
  }

  throw new Error("AI capacity reached or region mismatch. Please try again in 1 minute.");
}
