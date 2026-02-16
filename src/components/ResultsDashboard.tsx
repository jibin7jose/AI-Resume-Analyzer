
"use client";

import { AnalysisResult } from '@/utils/gemini';
import {
    Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
    ResponsiveContainer, PieChart, Pie, Cell, Tooltip
} from 'recharts';
import {
    AlertCircle, Lightbulb, UserCheck, Activity,
    Target, ShieldCheck, Briefcase, Search,
    FileWarning, CheckCircle2, FlaskConical, GraduationCap
} from 'lucide-react';
import styles from './ResultsDashboard.module.css';

interface DashboardProps {
    data: AnalysisResult;
}

export default function ResultsDashboard({ data }: DashboardProps) {
    const {
        matchPercentage, categoryScores, missingSkills, suggestions,
        detectedRole, jobRecommendations, projectIdeas,
        writingIssues, missingPortions
    } = data;

    const pieData = [
        { name: 'Match', value: matchPercentage },
        { name: 'Gap', value: 100 - matchPercentage }
    ];

    return (
        <div className={styles.dashboard}>
            {/* 1. Main Role Overview */}
            <div className={`${styles.card} ${styles.colSpan2}`}>
                <div className={styles.cardHeader}>
                    <div className={styles.cardTitle}>
                        <img src="/logo.jpg" alt="Logo" className="w-8 h-8 rounded-lg mr-2 border border-white/10" />
                        Career Fit Profile
                    </div>
                </div>

                <div className={styles.overviewContainer}>
                    <div className={styles.chartWrapper}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={65}
                                    outerRadius={85}
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
                    <ResponsiveContainer width="100%" height="100%">
                        <RadarChart cx="50%" cy="50%" outerRadius="75%" data={categoryScores}>
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

            {/* 3. Writing Issues (Grammar/Spelling) */}
            <div className={styles.card}>
                <div className={styles.cardHeader}>
                    <div className={styles.cardTitle}>
                        <FileWarning className={`${styles.icon} ${styles.iconRed}`} />
                        Writing Issues
                    </div>
                </div>
                <div className={styles.list}>
                    {writingIssues?.map((issue, i) => (
                        <div key={i} className={styles.listItem}>
                            <div className={styles.issueText}>
                                <span className={styles.issueLabel}>Issue: {issue.issue}</span>
                                <span className={styles.correctionLabel}>Suggestion: {issue.suggestion}</span>
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

            {/* 4. Missing Portions */}
            <div className={styles.card}>
                <div className={styles.cardHeader}>
                    <div className={styles.cardTitle}>
                        <Search className={`${styles.icon} ${styles.iconYellow}`} />
                        Missing Items
                    </div>
                </div>
                <div className={styles.list}>
                    {missingPortions?.map((item, i) => (
                        <div key={i} className={styles.listItem}>
                            <AlertCircle className="w-4 h-4 text-amber-500" />
                            <span>Missing: {item}</span>
                        </div>
                    ))}
                    {!missingPortions?.length && (
                        <div className={styles.listItem}>
                            <CheckCircle2 className={`${styles.icon} ${styles.iconGreen}`} />
                            <span>All resume sections appear complete.</span>
                        </div>
                    )}
                </div>
            </div>

            {/* 5. Project Ideas */}
            <div className={styles.card}>
                <div className={styles.cardHeader}>
                    <div className={styles.cardTitle}>
                        <FlaskConical className={`${styles.icon} ${styles.iconBlue}`} />
                        Project Ideas
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

            {/* 6. Skills and Suggestions (Wide) */}
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

function Star({ className, ...props }: any) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
            {...props}
        >
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
    );
}
