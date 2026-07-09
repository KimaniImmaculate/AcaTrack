import React from "react";

/**
 * Props expected by the StatCard component.
 */
type StatCardProps = {
    title: string;
    value: number;
    icon?: React.ReactNode;
    /** Optional Tailwind gradient classes e.g. "from-amber-500 to-blue-600" */
    gradient?: string;
};

/**
 * STAT CARD
 * ----------
 * Displays a dashboard statistic with premium styles.
 */
export default function StatCard({
    title,
    value,
    icon,
    gradient,
}: StatCardProps) {
    const iconBg = gradient
        ? `bg-gradient-to-br ${gradient} text-white shadow-md`
        : "bg-slate-50 text-slate-500 group-hover:bg-amber-50 group-hover:text-amber-600";

    return (
        <div className="relative rounded-2xl bg-white border border-slate-200/80 p-6 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 overflow-hidden group">
            <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-blue-50/40 to-transparent rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform duration-300" />
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider">
                        {title}
                    </h3>
                    <p className="mt-2.5 text-3xl font-extrabold bg-gradient-to-r from-slate-900 to-slate-800 bg-clip-text text-transparent">
                        {value}
                    </p>
                </div>
                {icon && (
                    <div className={`p-3 rounded-xl transition-colors duration-300 ${iconBg}`}>
                        {icon}
                    </div>
                )}
            </div>
        </div>
    );
}