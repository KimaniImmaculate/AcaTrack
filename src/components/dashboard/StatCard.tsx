/**
 * Props expected by the StatCard component.
 */
type StatCardProps = {
    title: string;
    value: number;
};

/**
 * STAT CARD
 * ----------
 * Displays a dashboard statistic.
 *
 * Example:
 * -------------------------
 * | Total Proposals |
 * |        5        |
 * -------------------------
 */
export default function StatCard({
    title,
    value,
}: StatCardProps) {
    return (
        <div className="rounded-lg bg-white p-6 shadow-md border">
            <h3 className="text-gray-500 text-sm">
                {title}
            </h3>

            <p className="mt-2 text-3xl font-bold text-blue-600">
                {value}
            </p>
        </div>
    );
}