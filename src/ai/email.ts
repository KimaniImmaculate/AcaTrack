export interface AIEmailPayload {
    recipientName: string;
    recipientRole: "student" | "supervisor" | "admin";
    eventType: "proposal_submitted" | "revision_requested" | "proposal_approved" | "meeting_scheduled" | "deadline_reminder";
    details: {
        proposalTitle?: string;
        supervisorName?: string;
        meetingTime?: string;
        meetingLink?: string;
        deadlineDate?: string;
        remarks?: string;
    };
}

export interface AIEmailTemplate {
    subject: string;
    bodyHtml: string;
    bodyText: string;
}

export function generateAIEmailContent(payload: AIEmailPayload): AIEmailTemplate {
    const { recipientName, recipientRole, eventType, details } = payload;
    const title = details.proposalTitle || "Research Proposal";

    switch (eventType) {
        case "proposal_submitted":
            return {
                subject: `[AcaTrack] New Proposal Submission: ${title}`,
                bodyText: `Hello ${recipientName},\n\nA new research proposal titled "${title}" has been submitted and assigned for your review.\n\nPlease log in to AcaTrack to review the draft and leave feedback.`,
                bodyHtml: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; rounded-radius: 8px;">
                        <h2 style="color: #4f46e5;">AcaTrack Proposal Notification</h2>
                        <p>Hello <strong>${recipientName}</strong>,</p>
                        <p>A new research proposal has been submitted for review:</p>
                        <div style="background-color: #f3f4f6; padding: 15px; border-radius: 6px; margin: 15px 0;">
                            <h3 style="margin: 0 0 8px 0; color: #111827;">${title}</h3>
                            <p style="margin: 0; color: #4b5563; font-size: 14px;"><strong>Status:</strong> Submitted & Pending Review</p>
                        </div>
                        <p>Please access your supervisor portal to inspect the document and provide feedback.</p>
                    </div>
                `
            };

        case "revision_requested":
            return {
                subject: `[AcaTrack] Revision Requested for "${title}"`,
                bodyText: `Hello ${recipientName},\n\nYour supervisor ${details.supervisorName || ""} has requested revisions on your research proposal "${title}".\n\nRemarks: ${details.remarks || "Please review supervisor comments on AcaTrack."}`,
                bodyHtml: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
                        <h2 style="color: #d97706;">Revision Requested</h2>
                        <p>Hello <strong>${recipientName}</strong>,</p>
                        <p>Your proposal <strong>"${title}"</strong> has been reviewed. Revisions have been requested by your supervisor.</p>
                        <div style="background-color: #fffbeb; border-left: 4px solid #f59e0b; padding: 15px; margin: 15px 0;">
                            <p style="margin: 0; color: #92400e;"><strong>Supervisor Feedback:</strong></p>
                            <p style="margin: 5px 0 0 0; color: #b45309;">${details.remarks || "Check AcaTrack portal for full notes."}</p>
                        </div>
                        <p>Please edit and resubmit your updated proposal before the institutional deadline.</p>
                    </div>
                `
            };

        case "proposal_approved":
            return {
                subject: `🎉 [AcaTrack] Congratulations! Proposal Approved: "${title}"`,
                bodyText: `Hello ${recipientName},\n\nGreat news! Your research proposal "${title}" has been formally APPROVED by your supervisor.\n\nYou may now proceed to the next phase of your academic research.`,
                bodyHtml: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
                        <h2 style="color: #059669;">🎉 Proposal Approved!</h2>
                        <p>Hello <strong>${recipientName}</strong>,</p>
                        <p>Your research proposal <strong>"${title}"</strong> has been officially <strong>APPROVED</strong>.</p>
                        <p>An official activity log entry and timeline audit record have been registered in AcaTrack.</p>
                    </div>
                `
            };

        case "meeting_scheduled":
            return {
                subject: `[AcaTrack] Supervision Meeting Confirmed`,
                bodyText: `Hello ${recipientName},\n\nA supervision meeting for "${title}" has been scheduled for ${details.meetingTime || "upcoming date"}.\n\nMeeting Link: ${details.meetingLink || "Check AcaTrack portal"}`,
                bodyHtml: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
                        <h2 style="color: #2563eb;">Supervision Meeting Scheduled</h2>
                        <p>Hello <strong>${recipientName}</strong>,</p>
                        <p>A research supervision session has been scheduled.</p>
                        <div style="background-color: #eff6ff; padding: 15px; border-radius: 6px; margin: 15px 0;">
                            <p style="margin: 0;"><strong>Date/Time:</strong> ${details.meetingTime || "TBD"}</p>
                            ${details.meetingLink ? `<p style="margin: 8px 0 0 0;"><strong>Join Link:</strong> <a href="${details.meetingLink}">${details.meetingLink}</a></p>` : ""}
                        </div>
                    </div>
                `
            };

        case "deadline_reminder":
        default:
            return {
                subject: `[AcaTrack Reminder] Academic Proposal Deadline Approaching`,
                bodyText: `Hello ${recipientName},\n\nThis is a reminder that the proposal submission deadline (${details.deadlineDate || "upcoming"}) is approaching. Please ensure your draft is submitted on time.`,
                bodyHtml: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
                        <h2 style="color: #dc2626;">Deadline Reminder</h2>
                        <p>Hello <strong>${recipientName}</strong>,</p>
                        <p>The academic calendar submission deadline (<strong>${details.deadlineDate || "upcoming"}</strong>) is approaching.</p>
                        <p>Please finalize and submit your proposal draft in AcaTrack before the deadline passes.</p>
                    </div>
                `
            };
    }
}
