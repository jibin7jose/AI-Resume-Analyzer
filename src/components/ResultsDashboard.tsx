import { useState, useEffect } from 'react';
import { AnalysisResult } from '@/utils/gemini';
import {
    Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
    ResponsiveContainer, PieChart, Pie, Cell, Tooltip
} from 'recharts';
import {
    AlertCircle, Lightbulb, UserCheck, Activity,
    Search, FileWarning, CheckCircle2, FlaskConical,
    GraduationCap, MessageCircle, Target, Star
} from 'lucide-react';
import styles from './ResultsDashboard.module.css';

interface DashboardProps {
    data: AnalysisResult;
}

export default function ResultsDashboard({ data }: DashboardProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        // Delay mounting for Recharts to ensure layout is ready
        const timer = setTimeout(() => setMounted(true), 100);
        return () => clearTimeout(timer);
    }, []);

    const {
        matchPercentage, categoryScores, missingSkills, suggestions,
        detectedRole, jobRecommendations, projectIdeas,
        writingIssues, missingPortions, interviewQuestions,
        jdMatchScore, jdAnalysis
    } = data;

    const pieData = [
        { name: 'Match', value: matchPercentage },
        { name: 'Gap', value: 100 - matchPercentage }
    ];

    if (!mounted) return null;

    return (
        <div className={styles.dashboard}>
            {/* 0. Target JD Match (Conditional) */}
            {jdAnalysis && (
                <div className={`${styles.card} ${styles.colSpan3} ${styles.jdCard}`}>
                    <div className={styles.cardHeader}>
                        <div className={styles.cardTitle}>
                            <Target className={`${styles.icon} ${styles.iconPink}`} />
                            Target Job Match Analysis
                        </div>
                        {jdMatchScore !== undefined && (
                            <div className={styles.jdBadge}>
                                {jdMatchScore}% Fit
                            </div>
                        )}
                    </div>
                    <div className={styles.jdBody}>
                        <p className={styles.jdDescription}>{jdAnalysis}</p>
                    </div>
                </div>
            )}

            {/* 1. Main Role Overview */}
            <div className={`${styles.card} ${styles.colSpan2}`}>
                <div className={styles.cardHeader}>
                    <div className={styles.cardTitle}>
                        <UserCheck className={`${styles.icon} ${styles.iconPurple}`} />
                        Career Fit Profile
                    </div>
                </div>

                <div className={styles.overviewContainer}>
                    <div className={styles.chartWrapper}>
                        <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={55}
                                    outerRadius={75}
                                    startAngle={180}
                                    endAngle={0}
                                    paddingAngle={5}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    <Cell key="match" fill="var(--primary)" />
                                    <Cell key="gap" fill="var(--glass-border)" />
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className={styles.matchLabel}>
                            <span className={styles.matchVal}>{matchPercentage}%</span>
                            <span className={styles.matchTxt}>Match</span>
                        </div>
                    </div>

                    <div className="flex-1">
                        <h3 className={styles.roleTitle}>{detectedRole}</h3>
                        <div className={styles.list}>
                            {jobRecommendations?.slice(0, 3).map((job, i) => (
                                <div key={i} className={styles.listItem}>
                                    <GraduationCap className="w-4 h-4 text-indigo-400" />
                                    <span>{job}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* 2. Radar Skills */}
            <div className={styles.card}>
                <div className={styles.cardHeader}>
                    <div className={styles.cardTitle}>
                        <Activity className={`${styles.icon} ${styles.iconPink}`} />
                        Core Distribution
                    </div>
                </div>
                <div className={styles.radarWrapper}>
                    <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                        <RadarChart cx="50%" cy="50%" outerRadius="65%" data={categoryScores}>
                            <PolarGrid stroke="var(--glass-border)" />
                            <PolarAngleAxis dataKey="name" tick={{ fill: 'var(--text-muted)', fontSize: 10 }} />
                            <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
                            <Radar
                                name="Accuracy"
                                dataKey="score"
                                stroke="var(--secondary)"
                                strokeWidth={3}
                                fill="var(--secondary)"
                                fillOpacity={0.2}
                            />
                        </RadarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* 3. Interview Prep (NEW) */}
            <div className={`${styles.card} ${styles.colSpan2}`}>
                <div className={styles.cardHeader}>
                    <div className={styles.cardTitle}>
                        <MessageCircle className={`${styles.icon} ${styles.iconBlue}`} />
                        Interview Prep Guide
                    </div>
                </div>
                <div className={styles.list}>
                    {interviewQuestions?.map((item, i) => (
                        <div key={i} className={styles.listItem}>
                            <div className={styles.issueText}>
                                <span className="font-bold text-indigo-400 text-sm">Q: {item.question}</span>
                                <span className="text-xs text-slate-400 mt-1 italic">Rationale: {item.rationale}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* 4. Project Ideas */}
            <div className={styles.card}>
                <div className={styles.cardHeader}>
                    <div className={styles.cardTitle}>
                        <FlaskConical className={`${styles.icon} ${styles.iconBlue}`} />
                        Portfolio Boosters
                    </div>
                </div>
                <div className={styles.list}>
                    {projectIdeas?.map((idea, i) => (
                        <div key={i} className={styles.listItem}>
                            <Star className="w-4 h-4 text-blue-400 fill-blue-400" />
                            <span>{idea}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* 5. Writing Issues */}
            <div className={styles.card}>
                <div className={styles.cardHeader}>
                    <div className={styles.cardTitle}>
                        <FileWarning className={`${styles.icon} ${styles.iconRed}`} />
                        Format Cleanup
                    </div>
                </div>
                <div className={styles.list}>
                    {writingIssues?.map((issue, i) => (
                        <div key={i} className={styles.listItem}>
                            <div className={styles.issueText}>
                                <span className={styles.issueLabel}>Issue: {issue.issue}</span>
                                <span className={styles.correctionLabel}>Fix: {issue.suggestion}</span>
                            </div>
                        </div>
                    ))}
                    {!writingIssues?.length && (
                        <div className={styles.listItem}>
                            <CheckCircle2 className={`${styles.icon} ${styles.iconGreen}`} />
                            <span>No major writing issues found!</span>
                        </div>
                    )}
                </div>
            </div>

            {/* 6. Missing Items */}
            <div className={styles.card}>
                <div className={styles.cardHeader}>
                    <div className={styles.cardTitle}>
                        <Search className={`${styles.icon} ${styles.iconYellow}`} />
                        Gap Analysis
                    </div>
                </div>
                <div className={styles.list}>
                    {missingPortions?.map((item, i) => (
                        <div key={i} className={styles.listItem}>
                            <AlertCircle className="w-4 h-4 text-amber-500" />
                            <span>{item}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* 7. Strategic Roadmap */}
            <div className={`${styles.card} ${styles.colSpan3}`}>
                <div className={styles.cardHeader}>
                    <div className={styles.cardTitle}>
                        <Lightbulb className={`${styles.icon} ${styles.iconYellow}`} />
                        Strategic Roadmap
                    </div>
                </div>
                <div className={styles.grid2}>
                    <div>
                        <h4 className="text-sm font-semibold mb-3 text-indigo-400">Target Keywords (Add These)</h4>
                        <div className="flex flex-wrap gap-2">
                            {missingSkills.map((skill, i) => (
                                <span key={i} className="px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-xs text-indigo-300">
                                    {skill}
                                </span>
                            ))}
                        </div>
                    </div>
                    <div>
                        <h4 className="text-sm font-semibold mb-3 text-emerald-400">Career Strategies</h4>
                        <ul className={styles.list}>
                            {suggestions.map((s, i) => (
                                <li key={i} className="text-xs text-slate-400 flex gap-2">
                                    <div className="w-1 h-1 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                                    {s}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}

