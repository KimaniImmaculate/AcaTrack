import { useEffect, useState } from "react";
import { subscribeComments, Comment } from "../services/commentService";

export default function CommentsList({ proposalId }: { proposalId: string }) {
    const [comments, setComments] = useState<Comment[]>([]);

    useEffect(() => {
        const unsubscribe = subscribeComments(proposalId, (data) => {
            setComments(data);
        });
        return () => unsubscribe();
    }, [proposalId]);

    const formatCommentDate = (createdAt: any) => {
        if (!createdAt || !createdAt.toDate) return "Just now";
        const date = createdAt.toDate();
        const day = date.getDate();
        const month = date.toLocaleDateString("en-US", { month: "long" });
        const year = date.getFullYear();
        const time = date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
        return `${day} ${month} ${year} • ${time}`;
    };

    if (comments.length === 0) {
        return null; // Don't render anything if there are no comments
    }

    return (
        <div className="mt-8 border rounded-lg bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                Review Feedback & Comments
            </h2>

            <div className="space-y-4">
                {comments.map((comment) => {
                    const isSupervisor = comment.authorRole === "supervisor";
                    const isAdmin = comment.authorRole === "admin";
                    const isStudent = comment.authorRole === "student";

                    return (
                        <div
                            key={comment.id}
                            className={`p-4 rounded-lg border ${isSupervisor
                                    ? "bg-green-50/40 border-green-200"
                                    : isAdmin
                                        ? "bg-amber-50/40 border-purple-200"
                                        : "bg-amber-50/30 border-amber-200"
                                }`}
                        >
                            <div className="flex justify-between items-start gap-4">
                                <div>
                                    <span className="font-bold text-gray-900 text-sm">
                                        {comment.authorName}
                                    </span>
                                    <span
                                        className={`ml-2 text-xs font-semibold px-2 py-0.5 rounded capitalize ${isSupervisor
                                                ? "bg-green-100 text-green-800"
                                                : isAdmin
                                                    ? "bg-amber-100 text-amber-800"
                                                    : "bg-amber-100 text-amber-800"
                                            }`}
                                    >
                                        {comment.authorRole}
                                    </span>
                                </div>
                                <span className="text-xs text-gray-500">
                                    {formatCommentDate(comment.createdAt)}
                                </span>
                            </div>
                            <p className="text-gray-700 text-sm mt-2 whitespace-pre-line">
                                {comment.text}
                            </p>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
