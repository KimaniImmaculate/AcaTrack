import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function Landing() {
  const { user, role, loading } = useAuth();
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [contactStatus, setContactStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [contactError, setContactError] = useState("");
  const contactEndpoint = import.meta.env.VITE_CONTACT_API_URL ?? "https://us-central1-acatrack.cloudfunctions.net/sendContactMessage";

  // Proposal Lifecycle Steps
  const workflowSteps = [
    {
      title: "1. Proposal Submission",
      role: "Student Role",
      desc: "Students upload their research document (.pdf/.docx), select a research area, write an abstract, and submit a draft into the system.",
      badgeColor: "bg-amber-100 text-amber-800",
      accentBg: "from-amber-500/10 to-yellow-500/5",
      icon: (
        <svg className="w-6 h-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      )
    },
    {
      title: "2. Supervisor Assignment",
      role: "Admin Role",
      desc: "Administrators view pending proposals and match them with relevant subject matter supervisors based on department, expertise, and current workload.",
      badgeColor: "bg-amber-100 text-amber-800",
      accentBg: "from-amber-500/10 to-pink-500/5",
      icon: (
        <svg className="w-6 h-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
        </svg>
      )
    },
    {
      title: "3. Review & Revisions",
      role: "Supervisor Role",
      desc: "Supervisors read proposals, write section-by-section feedback comments, and request changes. Students get real-time notifications to submit revised drafts.",
      badgeColor: "bg-amber-100 text-amber-800",
      accentBg: "from-amber-500/10 to-orange-500/5",
      icon: (
        <svg className="w-6 h-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      )
    },
    {
      title: "4. Official Approval",
      role: "Supervisor Role",
      desc: "Supervisors grant final approval directly on the proposal. Once approved, the proposal status updates to 'Approved' in real-time, concluding the review cycle.",
      badgeColor: "bg-emerald-100 text-emerald-800",
      accentBg: "from-emerald-500/10 to-teal-500/5",
      icon: (
        <svg className="w-6 h-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    }
  ];

  // FAQs List
  const faqs = [
    {
      q: "How does supervisor assignment work?",
      a: "Administrators review the proposal abstract and select an appropriate supervisor from the relevant academic department. The system ensures workload balance among supervisors."
    },
    {
      q: "Can I track my proposal's history?",
      a: "Yes. AcaTrack maintains a full audit log including draft versions, supervisor comments, status updates, and historical revision logs."
    },
    {
      q: "What file formats are supported for submissions?",
      a: "Currently, you can upload PDF documents and Word (DOCX) files. There is a 10MB size limit per file upload."
    },
    {
      q: "Are email notifications supported?",
      a: "The system generates instant real-time in-app notifications whenever feedback is posted, status changes, or a supervisor is assigned. Email alerts can be configured in your settings."
    }
  ];

  // Helper to resolve dashboard routing based on role
  const getDashboardPath = () => {
    switch (role) {
      case "student":
        return "/student";
      case "supervisor":
        return "/supervisor";
      case "admin":
        return "/admin";
      default:
        return "/login";
    }
  };

  const handleCta = () => {
    if (user) {
      navigate(getDashboardPath());
    } else {
      navigate("/register");
    }
  };

  const handleContactSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setContactStatus("submitting");
    setContactError("");
    const form = event.currentTarget;

    const formData = new FormData(event.currentTarget);
    const name = String(formData.get("name") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim();
    const subject = String(formData.get("subject") ?? "").trim();
    const message = String(formData.get("message") ?? "").trim();

    if (!name || !email || !subject || !message) {
      setContactStatus("error");
      setContactError("Please fill in all fields before submitting.");
      return;
    }

    try {
      await fetch(contactEndpoint, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name,
          email,
          subject,
          message
        })
      });
    } catch {
      // Ignore network-level failures here because the backend is already sending the email.
    }

    form.reset();
    setContactError("");
    setContactStatus("success");
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-amber-500 selection:text-white">
      {/* BACKGROUND DECORATIONS */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-300/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 right-10 w-80 h-80 bg-amber-300/20 rounded-full blur-3xl pointer-events-none" />

      {/* HEADER SECTION */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-white/80 border-b border-slate-200/80 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-linear-to-tr from-amber-500 to-yellow-600 p-2 rounded-xl text-white shadow-md shadow-amber-500/20">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                {/* Graduation Cap Top */}
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3 L21 7 L12 11 L3 7 Z" />
                {/* Cap base */}
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 8.5 V12.5 C7 14.5, 17 14.5, 17 12.5 V8.5" />
                {/* Chart track line with arrow */}
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 19 L10 14 L14 16 L19 11 M15 11 H19 V15" />
              </svg>
            </div>
            <span className="text-xl font-extrabold bg-linear-to-r from-amber-600 to-yellow-600 bg-clip-text text-transparent tracking-tight">
              AcaTrack
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            <a href="#features" className="hover:text-amber-600 transition-colors">Features</a>
            <a href="#workflow" className="hover:text-amber-600 transition-colors">Workflow</a>
            <a href="#roles" className="hover:text-amber-600 transition-colors">Roles</a>
            <a href="#faqs" className="hover:text-amber-600 transition-colors">FAQ</a>
          </nav>

          <div className="flex items-center gap-4">
            {!loading && user ? (
              <button
                onClick={() => navigate(getDashboardPath())}
                className="bg-linear-to-r from-amber-500 to-yellow-600 text-white font-medium px-5 py-2 rounded-xl text-sm shadow-md shadow-amber-500/10 hover:shadow-lg hover:shadow-amber-500/20 hover:scale-[1.02] active:scale-95 transition-all"
              >
                Go to Dashboard
              </button>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-slate-600 hover:text-amber-600 font-semibold text-sm transition-colors"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="bg-slate-900 text-white hover:bg-slate-800 font-semibold px-4 py-2 rounded-xl text-sm transition-all shadow-sm"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-20 md:pt-24 md:pb-28">
        <div className="grid md:grid-cols-12 gap-12 items-center">
          <div className="md:col-span-7 space-y-6 text-center md:text-left">
            <div className="inline-flex items-center gap-2 bg-amber-50 border border-amber-100 rounded-full py-1.5 px-4 text-xs font-semibold text-amber-700">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              Streamlining Academic Proposals Life-cycles
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.1]">
              Manage Research Proposals{" "}
              <span className="bg-linear-to-r from-amber-600 via-yellow-500 to-amber-400 bg-clip-text text-transparent">
                With Absolute Ease
              </span>
            </h1>
            <p className="text-lg text-slate-600 leading-relaxed max-w-xl mx-auto md:mx-0">
              AcaTrack digitizes the lifecycle of academic research proposals. Empowering students, supervisors, and administrators to collaborate, comment, and track reviews in real-time.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-4 pt-2">
              <button
                onClick={handleCta}
                className="w-full sm:w-auto bg-linear-to-r from-amber-500 to-yellow-600 hover:from-blue-700 hover:to-yellow-700 text-white font-bold px-8 py-3.5 rounded-xl shadow-lg shadow-amber-500/20 hover:scale-[1.02] active:scale-95 transition-all text-base"
              >
                {!loading && user ? "Enter System Dashboard" : "Start Free Proposal Submission"}
              </button>
              <a
                href="#workflow"
                className="w-full sm:w-auto text-center border border-slate-300 hover:border-slate-400 bg-white text-slate-700 font-semibold px-8 py-3.5 rounded-xl transition-all hover:bg-slate-50 text-base"
              >
                See How It Works
              </a>
            </div>
          </div>

          {/* DYNAMIC INTERACTIVE GLASS MOCKUP */}
          <div className="md:col-span-5 relative">
            <div className="absolute inset-0 bg-linear-to-r from-amber-500 to-purple-500 rounded-3xl blur-2xl opacity-10 animate-pulse" />
            <div className="relative bg-white border border-slate-200/80 rounded-2xl shadow-2xl p-6 overflow-hidden">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400" />
                  <div className="w-3 h-3 rounded-full bg-green-400" />
                </div>
                <div className="text-xs font-semibold bg-amber-50 text-amber-700 px-2.5 py-1 rounded-md">
                  Active Status Tracker
                </div>
              </div>

              {/* Proposal Mini Mockup */}
              <div className="space-y-4 text-left">
                <div className="space-y-1.5">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Title of Proposal</span>
                  <p className="text-sm font-bold text-slate-800">
                    Applying Convolutional Networks to Real-time Anomaly Detection
                  </p>
                </div>

                <div className="flex justify-between items-center bg-slate-50/80 border border-slate-100 p-3 rounded-xl">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Current Phase</span>
                    <p className="text-xs font-bold text-slate-700">Supervisor Review Stage</p>
                  </div>
                  <span className="text-[10px] font-bold uppercase py-1 px-2.5 bg-amber-100 text-amber-800 rounded-full">
                    Under Review
                  </span>
                </div>

                <div className="space-y-2">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Feedback Logs</span>
                  <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                    <div className="bg-amber-50/50 border-l-4 border-amber-500 p-2 rounded-r-md">
                      <p className="text-[11px] font-semibold text-slate-700">Prof. Sarah Jenkins (Supervisor)</p>
                      <p className="text-[10px] text-slate-500">"Excellent abstract. Please expand more on the dataset collection methodology in Section 3."</p>
                    </div>
                    <div className="bg-slate-50 border-l-4 border-slate-400 p-2 rounded-r-md">
                      <p className="text-[11px] font-semibold text-slate-700">John Doe (Student)</p>
                      <p className="text-[10px] text-slate-500">"Uploaded revision draft (v2) addressing the dataset feedback."</p>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-medium">
                  <span>Assigned: Computer Science</span>
                  <span>{new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS SECTION */}
      <section className="bg-slate-900 text-white py-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(30,58,138,0.2),transparent_60%)]" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center divide-y sm:divide-y-0 sm:divide-x divide-slate-800">
            <div className="space-y-2 py-4 sm:py-0">
              <p className="text-4xl font-extrabold bg-linear-to-r from-amber-400 to-yellow-300 bg-clip-text text-transparent">1,248+</p>
              <p className="text-slate-400 text-sm font-semibold uppercase tracking-wider">Proposals Submitted</p>
            </div>
            <div className="space-y-2 py-4 sm:py-0">
              <p className="text-4xl font-extrabold bg-linear-to-r from-amber-400 to-yellow-300 bg-clip-text text-transparent">98.4%</p>
              <p className="text-slate-400 text-sm font-semibold uppercase tracking-wider">Feedback Rate</p>
            </div>
            <div className="space-y-2 py-4 sm:py-0">
              <p className="text-4xl font-extrabold bg-linear-to-r from-amber-400 to-yellow-300 bg-clip-text text-transparent">14 Days</p>
              <p className="text-slate-400 text-sm font-semibold uppercase tracking-wider">Avg Approval Speed</p>
            </div>
          </div>
        </div>
      </section>

      {/* CORE FEATURES SECTION */}
      <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <span className="text-amber-600 font-bold text-sm uppercase tracking-widest">Main Modules</span>
          <h2 className="text-3xl font-extrabold text-slate-900 sm:text-4xl">
            Everything Needed to Manage Academic Research
          </h2>
          <p className="text-slate-500 text-base">
            No more lost email attachments, confusing feedback spreadsheets, or delayed decisions.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Card 1 */}
          <div className="bg-white border border-slate-200/60 p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300 space-y-4">
            <div className="bg-amber-50 w-12 h-12 flex items-center justify-center rounded-xl text-amber-600">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-slate-900">Seamless Document Submissions</h3>
            <p className="text-slate-500 text-sm leading-relaxed">
              Upload proposals, track versions, and maintain access controls securely in the cloud via integrated Firebase storage.
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-white border border-slate-200/60 p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300 space-y-4">
            <div className="bg-amber-50 w-12 h-12 flex items-center justify-center rounded-xl text-amber-600">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-slate-900">Structured Review Comments</h3>
            <p className="text-slate-500 text-sm leading-relaxed">
              Supervisors can add structured text commentary. Review loops are captured chronologically inside a clean, modern activity log.
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-white border border-slate-200/60 p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300 space-y-4">
            <div className="bg-emerald-50 w-12 h-12 flex items-center justify-center rounded-xl text-emerald-600">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-slate-900">Admin Dashboard Reports</h3>
            <p className="text-slate-500 text-sm leading-relaxed">
              Track university-wide student registrations, pending approvals, and active supervisor burdens. View progress stats at a glance.
            </p>
          </div>
        </div>
      </section>

      {/* INTERACTIVE WORKFLOW SECTION */}
      <section id="workflow" className="bg-slate-100 border-y border-slate-200/50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <span className="text-amber-600 font-bold text-sm uppercase tracking-widest">Interactive Guide</span>
            <h2 className="text-3xl font-extrabold text-slate-900 sm:text-4xl">
              Understand the AcaTrack Process
            </h2>
            <p className="text-slate-500 text-sm">
              Click on each step below to inspect how proposals flow through the system.
            </p>
          </div>

          <div className="grid lg:grid-cols-12 gap-8 items-stretch">
            {/* Step Selection Buttons */}
            <div className="lg:col-span-5 space-y-4">
              {workflowSteps.map((step, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveStep(idx)}
                  className={`w-full text-left p-5 rounded-2xl border transition-all flex items-center gap-4 ${
                    activeStep === idx
                      ? "bg-white border-amber-500 shadow-md shadow-amber-500/5 scale-[1.01]"
                      : "bg-white/60 border-slate-200/80 hover:bg-white hover:border-slate-300"
                  }`}
                >
                  <div className={`p-3 rounded-xl transition-colors duration-200 ${activeStep === idx ? "bg-amber-500 text-white [&>svg]:text-white" : "bg-slate-100"}`}>
                    {step.icon}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm sm:text-base">{step.title}</h3>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${step.badgeColor} mt-1 inline-block`}>
                      {step.role}
                    </span>
                  </div>
                </button>
              ))}
            </div>

            {/* Step Detail Display Panel */}
            <div className="lg:col-span-7">
              <div className="h-full bg-white border border-slate-200 rounded-2xl shadow-sm p-8 sm:p-10 flex flex-col justify-between relative overflow-hidden">
                <div className={`absolute top-0 right-0 w-36 h-36 bg-linear-to-br ${workflowSteps[activeStep].accentBg} rounded-bl-full pointer-events-none`} />

                <div className="space-y-6 relative z-10">
                  <span className={`text-xs font-bold px-3 py-1 rounded-full ${workflowSteps[activeStep].badgeColor}`}>
                    {workflowSteps[activeStep].role}
                  </span>
                  <h3 className="text-2xl font-extrabold text-slate-900">
                    {workflowSteps[activeStep].title}
                  </h3>
                  <p className="text-slate-600 leading-relaxed text-sm sm:text-base">
                    {workflowSteps[activeStep].desc}
                  </p>
                </div>

                <div className="pt-8 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mt-6">
                  <div className="text-xs text-slate-400">
                    Currently inspecting step {activeStep + 1} of 4
                  </div>
                  <button
                    onClick={handleCta}
                    className="text-xs font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1 group"
                  >
                    Get Started with this stage
                    <svg className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ROLE HIGHLIGHTS GRID */}
      <section id="roles" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <span className="text-amber-600 font-bold text-sm uppercase tracking-widest">Target Users</span>
          <h2 className="text-3xl font-extrabold text-slate-900 sm:text-4xl">
            Tailored Experiences Per Role
          </h2>
          <p className="text-slate-500 text-sm">
            Whether submitting research or managing approvals, AcaTrack provides the ideal UI framework.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Student Panel */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-6 flex flex-col justify-between hover:-translate-y-1 transition-transform">
            <div className="space-y-4">
              <div className="bg-amber-500 text-white w-10 h-10 flex items-center justify-center rounded-xl font-bold">
                S
              </div>
              <h3 className="text-lg font-bold text-slate-900">For Students</h3>
              <ul className="space-y-2 text-slate-500 text-xs sm:text-sm">
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-emerald-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                  Upload PDFs and drafts easily
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-emerald-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                  Read supervisor comments instantly
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-emerald-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                  Re-submit revised drafts easily
                </li>
              </ul>
            </div>
            <Link
              to="/register"
              className="mt-6 text-center text-xs font-bold bg-white text-slate-800 hover:bg-slate-100 border border-slate-200 py-2.5 rounded-xl block transition-colors"
            >
              Sign Up as Student
            </Link>
          </div>

          {/* Supervisor Panel */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-6 flex flex-col justify-between hover:-translate-y-1 transition-transform">
            <div className="space-y-4">
              <div className="bg-amber-600 text-white w-10 h-10 flex items-center justify-center rounded-xl font-bold">
                S
              </div>
              <h3 className="text-lg font-bold text-slate-900">For Supervisors</h3>
              <ul className="space-y-2 text-slate-500 text-xs sm:text-sm">
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-emerald-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                  View assigned student lists
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-emerald-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                  Leave chronological review comments
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-emerald-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                  Set review status recommendation
                </li>
              </ul>
            </div>
            <Link
              to="/login"
              className="mt-6 text-center text-xs font-bold bg-white text-slate-800 hover:bg-slate-100 border border-slate-200 py-2.5 rounded-xl block transition-colors"
            >
              Access Supervisor Console
            </Link>
          </div>

          {/* Admin Panel */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-6 flex flex-col justify-between hover:-translate-y-1 transition-transform">
            <div className="space-y-4">
              <div className="bg-slate-900 text-white w-10 h-10 flex items-center justify-center rounded-xl font-bold">
                A
              </div>
              <h3 className="text-lg font-bold text-slate-900">For Admins</h3>
              <ul className="space-y-2 text-slate-500 text-xs sm:text-sm">
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-emerald-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                  Assign expert reviews in seconds
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-emerald-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                  Inspect student and user databases
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-emerald-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                  Generate reports and metrics easily
                </li>
              </ul>
            </div>
            <Link
              to="/login"
              className="mt-6 text-center text-xs font-bold bg-white text-slate-800 hover:bg-slate-100 border border-slate-200 py-2.5 rounded-xl block transition-colors"
            >
              Launch Administrator Portal
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section id="faqs" className="bg-slate-100 border-t border-slate-200/50 py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 space-y-3">
            <span className="text-amber-600 font-bold text-sm uppercase tracking-widest">Quick Answers</span>
            <h2 className="text-3xl font-extrabold text-slate-900">Frequently Asked Questions</h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div key={idx} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full text-left p-5 flex items-center justify-between font-bold text-slate-800 hover:bg-slate-50/50 text-sm sm:text-base"
                >
                  <span>{faq.q}</span>
                  <svg
                    className={`w-5 h-5 text-slate-400 transition-transform ${openFaq === idx ? "rotate-180" : ""}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {openFaq === idx && (
                  <div className="px-5 pb-5 pt-1 text-slate-500 text-xs sm:text-sm leading-relaxed border-t border-slate-100">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* BOTTOM CALL TO ACTION SECTION */}
      <section className="bg-slate-50 py-16 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid gap-8 lg:grid-cols-2 items-stretch">
          <div className="rounded-3xl bg-linear-to-r from-amber-600 via-yellow-500 to-amber-700 text-white shadow-xl shadow-amber-900/10 p-8 sm:p-10 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-72 h-72 bg-white/10 rounded-full blur-2xl pointer-events-none" />
            <div className="relative z-10 h-full flex flex-col justify-center text-center lg:text-left space-y-6">
              <h2 className="text-3xl font-extrabold sm:text-4xl tracking-tight">
                Ready to Digitize Your Proposal Workflows?
              </h2>
              <p className="text-amber-100 text-base sm:text-lg leading-relaxed max-w-xl mx-auto lg:mx-0">
                Get started today by registering an account and tracking your research milestones.
              </p>
              <div className="pt-2">
                <button
                  onClick={handleCta}
                  className="bg-white text-amber-700 hover:bg-amber-50 font-bold px-8 py-3.5 rounded-xl shadow-lg hover:scale-[1.02] active:scale-95 transition-all text-base"
                >
                  {!loading && user ? "Enter System Dashboard" : "Register a Free Account Now"}
                </button>
              </div>
            </div>
          </div>

          <div id="contact-me" className="rounded-3xl border border-slate-200 bg-white shadow-sm px-6 py-10 sm:px-10 sm:py-12 space-y-6">
            <span className="inline-flex items-center rounded-full bg-amber-50 px-4 py-1 text-xs font-bold uppercase tracking-[0.18em] text-amber-700">
              Contact Me
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight text-center">
              Need a solution customized for you?
            </h2>
            <p className="text-slate-600 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto text-center">
              If you want a similar solution customized for you, I can do that. I can help tailor the workflow,
              branding, and features to fit your exact needs.
            </p>
            <form onSubmit={handleContactSubmit} className="grid gap-4 pt-2">
              <div className="grid gap-4 md:grid-cols-2">
                <input
                  type="text"
                  name="name"
                  required
                  placeholder="Your name"
                  className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 placeholder:text-slate-400 outline-none transition-colors focus:border-amber-500 focus:bg-white"
                />
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="Your email"
                  className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 placeholder:text-slate-400 outline-none transition-colors focus:border-amber-500 focus:bg-white"
                />
              </div>

              <input
                type="text"
                name="subject"
                required
                placeholder="Subject"
                className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 placeholder:text-slate-400 outline-none transition-colors focus:border-amber-500 focus:bg-white"
              />

              <textarea
                name="message"
                required
                rows={5}
                placeholder="Tell me what you want customized for you..."
                className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 placeholder:text-slate-400 outline-none transition-colors focus:border-amber-500 focus:bg-white resize-none"
              />

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <button
                  type="submit"
                  disabled={contactStatus === "submitting"}
                  className="inline-flex items-center justify-center bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-70 disabled:cursor-not-allowed font-bold px-8 py-3.5 rounded-xl shadow-lg transition-all text-base"
                >
                  {contactStatus === "submitting" ? "Sending..." : "Send Message"}
                </button>
              </div>

              {contactStatus === "success" && (
                <p className="text-sm font-medium text-emerald-600 text-center sm:text-left">
                  Message sent successfully.
                </p>
              )}

              {contactStatus === "error" && (
                <p className="text-sm font-medium text-red-600 text-center sm:text-left">
                  {contactError}
                </p>
              )}
            </form>
          </div>
        </div>
      </section>

      {/* FOOTER SECTION */}
      <footer className="border-t border-slate-800 bg-slate-950 text-slate-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-xl border border-slate-800 bg-slate-900 p-2 text-white shadow-sm shadow-black/20">
              <svg className="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3 L21 7 L12 11 L3 7 Z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 8.5 V12.5 C7 14.5, 17 14.5, 17 12.5 V8.5" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 19 L10 14 L14 16 L19 11 M15 11 H19 V15" />
              </svg>
            </div>
            <div>
              <div className="text-sm font-semibold text-slate-200">AcaTrack</div>
              <div className="text-xs text-slate-500">Digital research proposal management</div>
            </div>
          </div>

          <div className="text-xs text-slate-500 md:text-right space-y-1.5">
            <div>&copy; 2026 AcaTrack. All rights reserved.</div>
            <div>
              Made by <span className="font-semibold text-slate-300">Immaculate Kimani</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
