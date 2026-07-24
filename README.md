# AcaTrack — Digital Research Proposal Management System

AcaTrack is a web-based platform that automates the submission, review, approval, and tracking of research proposals in universities and research institutions.

## Live Demo

**[https://acatrack.web.app](https://acatrack.web.app)**

> Hosted on Firebase Hosting with CI/CD via GitHub Actions


## Features

### Proposal Lifecycle
- Student proposal submission, editing, and version tracking
- Supervisor review, structured feedback comments, and approval workflow
- Resubmission loop for revision-requested proposals
- Real-time status updates (Draft → Under Review → Revision Requested → Approved / Rejected)
- File uploads for research documents (PDF / DOCX)

### AI Review Assistant (Gemini)
- Supervisors get an AI-powered review suggestion panel on every proposal
- Powered by Google Gemini — evaluates abstract, research area, and supervisor feedback
- Proposal Quality Score card with actionable improvement suggestions
- AI assistant integrates directly into the supervisor proposal detail view
- Graceful fallback when the AI service is unavailable

### Academic Calendar Enforcement
- Admin sets global submission start and due dates from the dashboard
- Once the `proposalDueDate` passes, new draft submissions are automatically locked
- Only revision resubmissions remain active after deadline
- Approved / rejected proposals disable all further actions (scheduling, editing)
- Admin can extend deadlines at any time — changes take effect instantly for all users

### Meetings & Supervision
- Students schedule supervision meetings and attach Google Meet / Zoom links
- Supervisors accept, reschedule, or cancel requests with notes stored in Firestore
- Supervisors leave session remarks when marking a meeting as completed
- Remarks visible to students and admins in respective detail views
- Real-time search across all meeting lists (student, supervisor, admin)
- Mobile-friendly horizontal scroll on meeting tables

### Admin Dashboard
- Consolidated stats panels: Users, Proposals, Meetings breakdowns
- Interactive SVG-based donut charts in Reports & Analytics
- Academic Calendar settings with date preview and period progress bar
- Paginated user and proposal management views
- Supervisor assignment interface

### Activity & Audit
- Full activity timeline per proposal (draft → revisions → approval)
- Export Activity Timeline as a print-friendly styled HTML report
- Downloadable for all 3 roles (student, supervisor, admin)

### UX & Navigation
- "Return to Dashboard" back link rendered on all inner subpages automatically
- Role-based access (Student, Supervisor, Admin) with dedicated portals
- Mobile-responsive layouts with off-canvas sidebar drawer
- Login by email, admission number, or staff number
- Supervisor title/prefix support (Dr., Prof., Mr., Mrs., etc.)
- In-app real-time & email notifications
- Styled form validation alerts with icons — no browser-native tooltips
- Consistent icon system throughout (SVG inline icons, no emoji)


## Tech Stack

- React + TypeScript + Vite
- Tailwind CSS v4 with custom design tokens
- Firebase (Authentication, Firestore, Storage, Hosting, Cloud Functions)
- React Router v6
- Google Gemini API (AI Review Assistant)


## Firebase Cloud Functions (Email Service)

The email notification pipeline triggers automatically when notifications are created in the Firestore collection. Emails are built and sent via SMTP.

To build and deploy the email service:

1. Navigate to the `functions/` folder and install dependencies:
   ```bash
   cd functions
   npm install
   ```

2. Compile TypeScript:
   ```bash
   npm run build
   ```

3. Configure SMTP secrets:
   ```bash
   firebase functions:secrets:set SMTP_HOST
   firebase functions:secrets:set SMTP_PORT
   firebase functions:secrets:set SMTP_USER
   firebase functions:secrets:set SMTP_PASS
   firebase functions:secrets:set CONTACT_FROM_EMAIL
   firebase functions:secrets:set CONTACT_FROM_NAME
   ```

4. Deploy the functions:
   ```bash
   firebase deploy --only functions
   ```


## Environment Variables

Create a `.env` file in the project root with:

```env
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_GEMINI_API_KEY=
VITE_CONTACT_API_URL=
```


## Local Development

```bash
pnpm install
pnpm dev
```


## Goal

To streamline and digitize the research proposal lifecycle, improving transparency, efficiency, and collaboration in academic institutions.

---

Built by **Immaculate Kimani**