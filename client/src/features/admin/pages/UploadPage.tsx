/**
 * @file client/src/features/admin/pages/UploadPage.tsx
 * @description Admin page for uploading referral JSON data to the system
 *
 * @responsibility
 *   - Owns: File upload UI, drag-drop handling, upload API call
 *   - Does NOT own: Data processing logic, referrals state management
 *
 * @lastReviewed 2024-12-24
 */

import { useState, useCallback } from "react";
import { useReferrals } from "@/app/providers/ReferralsProvider.tsx";
import { apiClient } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/shared/ui/primitives/card";
import { Button } from "@/shared/ui/primitives/button";
import {
    Upload,
    FileJson,
    CheckCircle2,
    AlertCircle,
    Loader2,
    X,
    FileText,
    Database
} from "lucide-react";

export default function UploadJson() {
    const { refresh } = useReferrals();
    const [file, setFile] = useState<File | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadStatus, setUploadStatus] = useState<"idle" | "success" | "error">("idle");
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [recordCount, setRecordCount] = useState(0);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile && droppedFile.type === "application/json") {
            setFile(droppedFile);
            setUploadStatus("idle");
            setErrorMessage(null);
        } else {
            setErrorMessage("Please drop a valid JSON file");
        }
    }, []);

    const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            setFile(selectedFile);
            setUploadStatus("idle");
            setErrorMessage(null);
        }
    }, []);

    const handleUpload = async () => {
        if (!file) return;

        setIsUploading(true);
        setErrorMessage(null);

        try {
            const text = await file.text();
            const data = JSON.parse(text);

            // Validate JSON structure
            if (!Array.isArray(data)) {
                throw new Error("JSON must contain an array of referrals");
            }

            // Simulate upload delay
            await new Promise((resolve) => setTimeout(resolve, 1000));

            // Load data into the app
            await apiClient("/uploads", {
                method: "POST",
                body: JSON.stringify(data)
            });

            await refresh();

            setRecordCount(data.length);
            setUploadStatus("success");
            setErrorMessage(null); // Clear any previous error
        } catch (err: any) {
            console.error("Upload failed", err);
            setUploadStatus("error");
            setErrorMessage(err.message || "Failed to parse JSON");
        } finally {
            setIsUploading(false);
        }
    };

    const handleClear = () => {
        setFile(null);
        setUploadStatus("idle");
        setErrorMessage(null);
        setRecordCount(0);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-4xl font-bold text-foreground">Upload Referrals</h1>
                <p className="text-muted-foreground mt-2">
                    Import referral data from a JSON file
                </p>
            </div>

            {/* Upload Card */}
            <Card className="premium-card">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Database className="h-5 w-5 text-primary" />
                        JSON Data Import
                    </CardTitle>
                    <CardDescription>
                        Upload a JSON file containing referral records. The file should contain an array of referral objects.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Drop Zone */}
                    <div
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        className={`
                            relative border-2 border-dashed rounded-xl p-12 text-center transition-all
                            ${isDragging
                                ? "border-primary bg-primary/5"
                                : "border-border/50 hover:border-border hover:bg-muted/30"
                            }
                            ${uploadStatus === "success" ? "border-emerald-500/50 bg-emerald-50/50 dark:bg-emerald-950/20" : ""}
                            ${uploadStatus === "error" ? "border-destructive/50 bg-destructive/5" : ""}
                        `}
                    >
                        {/* Icon */}
                        <div className={`
                            inline-flex items-center justify-center w-16 h-16 rounded-full mb-4
                            ${uploadStatus === "success"
                                ? "bg-emerald-100 dark:bg-emerald-900/40"
                                : uploadStatus === "error"
                                    ? "bg-destructive/10"
                                    : "bg-muted"
                            }
                        `}>
                            {uploadStatus === "success" ? (
                                <CheckCircle2 className="h-8 w-8 text-emerald-500" />
                            ) : uploadStatus === "error" ? (
                                <AlertCircle className="h-8 w-8 text-destructive" />
                            ) : file ? (
                                <FileJson className="h-8 w-8 text-primary" />
                            ) : (
                                <Upload className="h-8 w-8 text-muted-foreground" />
                            )}
                        </div>

                        {/* Status Text */}
                        {uploadStatus === "success" ? (
                            <>
                                <h3 className="text-lg font-semibold text-emerald-600 dark:text-emerald-400 mb-1">
                                    Upload Successful!
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                    Loaded {recordCount} referral records
                                </p>
                            </>
                        ) : uploadStatus === "error" ? (
                            <>
                                <h3 className="text-lg font-semibold text-destructive mb-1">
                                    Upload Failed
                                </h3>
                                <p className="text-sm text-destructive/80">
                                    {errorMessage}
                                </p>
                            </>
                        ) : file ? (
                            <>
                                <h3 className="text-lg font-semibold text-foreground mb-1">
                                    {file.name}
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                    {(file.size / 1024).toFixed(1)} KB
                                </p>
                            </>
                        ) : (
                            <>
                                <h3 className="text-lg font-semibold text-foreground mb-1">
                                    Drop your JSON file here
                                </h3>
                                <p className="text-sm text-muted-foreground mb-4">
                                    or click to browse
                                </p>
                                <input
                                    type="file"
                                    accept=".json,application/json"
                                    onChange={handleFileSelect}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                />
                            </>
                        )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-end gap-3">
                        {(file || uploadStatus !== "idle") && (
                            <Button
                                variant="outline"
                                onClick={handleClear}
                                className="gap-2"
                            >
                                <X className="h-4 w-4" />
                                Clear
                            </Button>
                        )}
                        {file && uploadStatus !== "success" && (
                            <Button
                                onClick={handleUpload}
                                disabled={isUploading}
                                className="gap-2 bg-primary hover:bg-primary/90"
                            >
                                {isUploading ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Uploading...
                                    </>
                                ) : (
                                    <>
                                        <Upload className="h-4 w-4" />
                                        Upload Data
                                    </>
                                )}
                            </Button>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Sample Format Card */}
            <Card className="premium-card">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        Expected JSON Format
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <pre className="p-4 rounded-lg bg-muted/50 text-sm overflow-x-auto">
                        {`[
  {
    "referral_id": "R1",
    "status": "SCHEDULED",
    "active_appointment": {
      "appt_id": "A1",
      "start_time": "2025-01-15T10:30:00Z"
    },
    "events": [
      {
        "seq": 1,
        "event_type": "CREATED",
        "occurred_at": "2025-01-01T09:00:00Z"
      }
    ]
  }
]`}
                    </pre>
                </CardContent>
            </Card>
        </div>
    );
}
