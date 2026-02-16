# 🤖 AI Resume Analyzer

A premium AI-powered tool that analyzes resumes using Google Gemini AI, providing ATS scores, job recommendations, and interview prep.

## 🚀 Setup Instructions

### 1. Security First (Important!)
To prevent your API keys from being leaked to GitHub:
- I have added `.env.local` to the `.gitignore` file. 
- **NEVER** commit your real API key to the repository.
- Use the `.env.example` file as a template.

### 2. Configure API Key
1. Create a file named `.env.local` in the root folder.
2. Add your Google Gemini API Key:
   ```env
   NEXT_PUBLIC_GEMINI_API_KEY=your_actual_key_here
   ```
   *(Get your key at [Google AI Studio](https://aistudio.google.com/app/apikey))*

### 3. Run Locally
```bash
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to see the app.

## ✨ Features
- **ATS Analysis**: Deep scan for missing skills and formatting issues.
- **JD Matching**: Match your resume against a specific job description for a fit score.
- **Interview Prep**: Get custom behavioral and technical questions based on your profile.
- **Project Ideas**: AI-generated suggestions to boost your portfolio.

## 🔒 Deployment (Safe Way)
When deploying to Vercel or Netlify:
1. Do **not** upload the `.env.local` file.
2. Go to the dashboard of your hosting provider.
3. Add `NEXT_PUBLIC_GEMINI_API_KEY` as an **Environment Variable** in their settings.

---
Developed by **Jibin Jose**
