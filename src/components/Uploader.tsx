
"use client";

import { useState, useCallback, ChangeEvent } from 'react';
import { UploadCloud, CheckCircle, AlertCircle, FileText, Loader2 } from 'lucide-react';
import styles from './Uploader.module.css';

interface UploaderProps {
    onFileProcess: (file: File) => Promise<void>;
    isProcessing: boolean;
    error?: string | null;
}

export default function Uploader({ onFileProcess, isProcessing, error }: UploaderProps) {
    const [isDragOver, setIsDragOver] = useState(false);
    const [fileName, setFileName] = useState<string | null>(null);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
    }, []);

    const handleDrop = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault();
            setIsDragOver(false);
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                processFile(files[0]);
            }
        },
        [onFileProcess]
    );

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            processFile(e.target.files[0]);
        }
    };

    const processFile = (file: File) => {
        if (file.type !== 'application/pdf') {
            alert('Please upload a PDF file.');
            return;
        }
        setFileName(file.name);
        onFileProcess(file);
    };

    return (
        <div className={styles.uploaderContainer}>
            <div
                className={`${styles.dropzone} ${isDragOver ? styles.active : ''}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
            >
                <input
                    type="file"
                    accept=".pdf"
                    onChange={handleFileChange}
                    className={styles.fileInput}
                    disabled={isProcessing}
                />

                <div className={styles.content}>
                    <div className={`${styles.iconWrapper} ${isProcessing ? styles.processing : ''} ${fileName ? styles.success : ''}`}>
                        {isProcessing ? (
                            <Loader2 className="w-10 h-10 animate-spin" />
                        ) : fileName ? (
                            <FileText className="w-10 h-10" />
                        ) : (
                            <UploadCloud className="w-10 h-10" />
                        )}
                    </div>

                    <div className={styles.textContainer}>
                        {isProcessing ? (
                            <>
                                <h3 className={styles.title}>Analyzing Resume...</h3>
                                <p className={styles.subtitle}>Extracting skills & experience</p>
                            </>
                        ) : fileName ? (
                            <>
                                <h3 className={styles.title}>Resume Uploaded</h3>
                                <p className={styles.subtitle}>{fileName}</p>
                                <span className="text-xs text-green-400 font-medium flex items-center justify-center gap-1 mt-2">
                                    <CheckCircle className="w-3 h-3" /> Ready for Analysis
                                </span>
                            </>
                        ) : (
                            <>
                                <h3 className={styles.title}>Drop your resume here</h3>
                                <p className={styles.subtitle}>Support for PDF files only. Max 5MB.</p>
                                <div className={styles.footer}>Powered by Advanced AI Intelligence</div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {error && (
                <div className={styles.error}>
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    <p>{error}</p>
                </div>
            )}
        </div>
    );
}
