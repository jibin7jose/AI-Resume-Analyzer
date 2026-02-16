
"use client";

import { useState, useEffect } from 'react';
import Uploader from './Uploader';
import ResultsDashboard from './ResultsDashboard';
import { extractTextFromPDF } from '@/utils/pdfParser';
import { analyzeResume, AnalysisResult } from '@/utils/gemini';
import { ArrowLeft, Cpu, Sun, Moon, Briefcase, FileText } from 'lucide-react';
import styles from './ResumeAnalyzer.module.css';

export default function ResumeAnalyzer() {
    const [jobDescription, setJobDescription] = useState<string>('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [theme, setTheme] = useState<'light' | 'dark'>('dark');
    const [showJDInput, setShowJDInput] = useState(false);

    useEffect(() => {

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
        const targetApiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
        if (!targetApiKey) {
            setError("AI system is currently offline (Missing Configuration).");
            return;
        }

        setIsAnalyzing(true);
        setError(null);

        try {
            const text = await extractTextFromPDF(file);
            console.log("PDF parsed, starting AI analysis...");
            const result = await analyzeResume(text, targetApiKey, jobDescription);
            setAnalysisResult(result);
        } catch (err: any) {
            console.error("Analysis Failed:", err);
            setError(err.message || "Analysis failed. Please check your API key and connection.");
        } finally {
            setIsAnalyzing(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className="fixed inset-0 overflow-hidden -z-10 pointer-events-none opacity-50">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-500/10 blur-[100px] animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-rose-500/10 blur-[100px] animate-pulse" />
            </div>

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

                    {!analysisResult && (
                        <div className={styles.systemBadge}>
                            <Cpu size={14} />
                            AI Ready
                        </div>
                    )}
                </div>
            </header>

            <main className={styles.main}>
                {analysisResult ? (
                    <div className={styles.resultsContainer}>
                        <button
                            onClick={() => {
                                setAnalysisResult(null);
                                setJobDescription('');
                            }}
                            className={styles.backButton}
                        >
                            <ArrowLeft size={18} /> New Deep Scan
                        </button>
                        <ResultsDashboard data={analysisResult} />
                    </div>
                ) : (
                    <div className="w-full max-w-2xl">
                        {/* JD Toggle/Input */}
                        <div className={styles.jdWrapper}>
                            <button
                                onClick={() => setShowJDInput(!showJDInput)}
                                className={`${styles.jdToggleButton} ${showJDInput ? styles.active : ''}`}
                            >
                                <Briefcase size={16} />
                                {showJDInput ? 'Remove Job Description' : 'Match Against Job Description (Optional)'}
                            </button>

                            {showJDInput && (
                                <div className={styles.jdInputContainer}>
                                    <textarea
                                        placeholder="Paste the job requirements or description here to get a precision match score..."
                                        value={jobDescription}
                                        onChange={(e) => setJobDescription(e.target.value)}
                                        className={styles.jdTextarea}
                                    />
                                    <div className={styles.jdHint}>
                                        AI will calculate your specific fit for this role.
                                    </div>
                                </div>
                            )}
                        </div>

                        <Uploader
                            onFileProcess={handleFileProcess}
                            isProcessing={isAnalyzing}
                            error={error}
                        />
                    </div>
                )}
            </main>

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
