#  AcaTrack – Digital Research Proposal Management System

AcaTrack is a web-based platform that automates the submission, review, approval, and tracking of research proposals in universities and research institutions.

## 🌐 Live Demo

**[https://acatrack.web.app](https://acatrack.web.app)**

> Hosted on Firebase Hosting



## ✨ Features

### Proposal Lifecycle
- Student proposal submission, editing, and version tracking
- Supervisor review, structured feedback comments, and approval workflow
- Resubmission loop for revision-requested proposals
- Real-time status updates (Draft → Under Review → Revision Requested → Approved / Rejected)
- File uploads for research documents (PDF / DOCX)

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
- In-app real-time notifications



## 🛠 Tech Stack

- React + TypeScript + Vite
- Vanilla CSS + custom design tokens
- Firebase (Authentication, Firestore, Storage, Hosting, Cloud Functions)
- React Router



## 🎯 Goal

To streamline and digitize the research proposal lifecycle, improving transparency, efficiency, and collaboration in academic institutions.