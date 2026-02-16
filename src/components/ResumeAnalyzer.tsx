
"use client";

import { useState, useEffect } from 'react';
import Uploader from './Uploader';
import ResultsDashboard from './ResultsDashboard';
import { extractTextFromPDF } from '@/utils/pdfParser';
import { analyzeResume, AnalysisResult } from '@/utils/gemini';
import { KeyRound, ArrowLeft, Cpu, Sun, Moon, Sparkles } from 'lucide-react';
import styles from './ResumeAnalyzer.module.css';

export default function ResumeAnalyzer() {
    const [apiKey, setApiKey] = useState<string>('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [theme, setTheme] = useState<'light' | 'dark'>('dark');

    useEffect(() => {
        const envKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
        if (envKey) {
            setApiKey(envKey);
        }

        // Initialize theme from localStorage
        const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
        if (savedTheme) {
            setTheme(savedTheme);
            document.documentElement.setAttribute('data-theme', savedTheme);
        } else {
            document.documentElement.setAttribute('data-theme', 'dark');
        }
    }, []);

    const toggleTheme = () => {
        const newTheme = theme === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
    };

    const handleFileProcess = async (file: File) => {
        if (!apiKey) {
            setError("Please enter your API Key first.");
            return;
        }

        setIsAnalyzing(true);
        setError(null);

        try {
            const text = await extractTextFromPDF(file);
            const result = await analyzeResume(text, apiKey);
            setAnalysisResult(result);
        } catch (err: any) {
            console.error(err);
            setError(err.message || "An unexpected error occurred during analysis.");
        } finally {
            setIsAnalyzing(false);
        }
    };

    return (
        <div className={styles.container}>
            {/* Background Decorative Blobs */}
            <div className="fixed inset-0 overflow-hidden -z-10 pointer-events-none opacity-50">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-500/10 blur-[100px] animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-rose-500/10 blur-[100px] animate-pulse" />
            </div>

            {/* Navigation / Header */}
            <header className={styles.header}>
                <div className={styles.titleContainer}>
                    <div className="flex items-center gap-4 mb-2">
                        <img src="/logo.jpg" alt="AI Resume Logo" className={styles.logo} />
                        <h1 className={styles.title}>AI Resume</h1>
                    </div>
                    <p className={styles.subtitle}>Smart ATS Analysis & Career Insights</p>
                </div>

                <div className={styles.actions}>
                    <button onClick={toggleTheme} className={styles.themeToggle} aria-label="Toggle Theme">
                        {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                    </button>

                    {!process.env.NEXT_PUBLIC_GEMINI_API_KEY && !analysisResult && (
                        <div className={styles.apiKeyContainer}>
                            <KeyRound size={18} className="text-indigo-400" />
                            
                        </div>
                    )}

                    {process.env.NEXT_PUBLIC_GEMINI_API_KEY && !analysisResult && (
                        <div className={styles.systemBadge}>
                            <Cpu size={14} />
                            AI Engine Ready
                        </div>
                    )}
                </div>
            </header>

            {/* Main Application Area */}
            <main className={styles.main}>
                {analysisResult ? (
                    <div className={styles.resultsContainer}>
                        <button
                            onClick={() => setAnalysisResult(null)}
                            className={styles.backButton}
                        >
                            <ArrowLeft size={18} /> New Deep Scan
                        </button>
                        <ResultsDashboard data={analysisResult} />
                    </div>
                ) : (
                    <Uploader
                        onFileProcess={handleFileProcess}
                        isProcessing={isAnalyzing}
                        error={error}
                    />
                )}
            </main>

            {/* Footer with Copyright */}
            <footer className={styles.footer}>
                <p className={styles.copyright}>
                    © {new Date().getFullYear()} AI Resume Analyzer. All rights reserved.
                </p>
                <p className={styles.developedBy}>
                    Developed by <span className={styles.userName}>Jibin Jose</span>
                </p>
            </footer>
        </div>
    );
}
