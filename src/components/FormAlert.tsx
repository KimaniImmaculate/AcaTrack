import React from "react";

type Variant = "error" | "success" | "warning" | "info";

interface FormAlertProps {
    message: string;
    variant?: Variant;
    className?: string;
}

// Inline SVG icons — no external dependency needed
const Icons: Record<Variant, React.ReactElement> = {
    error: (
        <svg className="w-4 h-4 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
    ),
    success: (
        <svg className="w-4 h-4 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
    ),
    warning: (
        <svg className="w-4 h-4 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
    ),
    info: (
        <svg className="w-4 h-4 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="16" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12.01" y2="8" />
        </svg>
    ),
};

const styles: Record<Variant, string> = {
    error:   "bg-rose-50 border-rose-200 text-rose-700",
    success: "bg-emerald-50 border-emerald-200 text-emerald-700",
    warning: "bg-amber-50 border-amber-200 text-amber-700",
    info:    "bg-blue-50 border-blue-200 text-blue-700",
};

export default function FormAlert({
    message,
    variant = "error",
    className = "",
}: FormAlertProps) {
    if (!message) return null;

    return (
        <div
            role="alert"
            style={{ animation: "fadeIn 0.2s ease-out" }}
            className={`flex items-start gap-2.5 rounded-xl px-4 py-3 text-sm font-medium border ${styles[variant]} ${className}`}
        >
            {Icons[variant]}
            <span className="leading-snug">{message}</span>
        </div>
    );
}
