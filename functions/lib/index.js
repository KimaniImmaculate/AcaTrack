"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendContactMessage = exports.onNotificationCreated = void 0;
const logger = __importStar(require("firebase-functions/logger"));
const https_1 = require("firebase-functions/v2/https");
const firestore_1 = require("firebase-functions/v2/firestore");
const params_1 = require("firebase-functions/params");
const nodemailer_1 = __importDefault(require("nodemailer"));
const admin = __importStar(require("firebase-admin"));
// ── Initialize Firebase Admin ──────────────────────────────────────────────
admin.initializeApp();
const db = admin.firestore();
// ── SMTP Secrets (shared between contact form + notification emails) ────────
const SMTP_HOST = (0, params_1.defineSecret)("SMTP_HOST");
const SMTP_PORT = (0, params_1.defineSecret)("SMTP_PORT");
const SMTP_USER = (0, params_1.defineSecret)("SMTP_USER");
const SMTP_PASS = (0, params_1.defineSecret)("SMTP_PASS");
const CONTACT_FROM_EMAIL = (0, params_1.defineSecret)("CONTACT_FROM_EMAIL");
const CONTACT_FROM_NAME = (0, params_1.defineSecret)("CONTACT_FROM_NAME");
const CONTACT_TO_EMAIL = (0, params_1.defineSecret)("CONTACT_TO_EMAIL");
const DEFAULT_TO_EMAIL = "immakym001@gmail.com";
// ── Helpers ────────────────────────────────────────────────────────────────
function getString(value) {
    return typeof value === "string" ? value.trim() : "";
}
function escapeHtml(value) {
    return value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}
function getSmtpConfig() {
    const host = getString(SMTP_HOST.value());
    const portValue = getString(SMTP_PORT.value());
    const user = getString(SMTP_USER.value());
    const pass = getString(SMTP_PASS.value());
    const fromEmail = getString(CONTACT_FROM_EMAIL.value() || user);
    const fromName = getString(CONTACT_FROM_NAME.value() || "AcaTrack") || "AcaTrack";
    const toEmail = getString(CONTACT_TO_EMAIL.value() || DEFAULT_TO_EMAIL) || DEFAULT_TO_EMAIL;
    const port = Number(portValue || "587");
    if (!host || !port || !user || !pass || !fromEmail)
        return null;
    return { host, port, user, pass, fromEmail, fromName, toEmail };
}
function setCorsHeaders(res) {
    res.set("Access-Control-Allow-Origin", "*");
    res.set("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.set("Access-Control-Allow-Headers", "Content-Type, Accept");
    res.set("Access-Control-Max-Age", "3600");
}
function createTransporter(cfg) {
    return nodemailer_1.default.createTransport({
        host: cfg.host,
        port: cfg.port,
        secure: cfg.port === 465,
        auth: { user: cfg.user, pass: cfg.pass },
    });
}
// ── Email template builder ──────────────────────────────────────────────────
function buildNotificationEmail(title, message, fromName) {
    const safeTitle = escapeHtml(title);
    const safeMessage = escapeHtml(message).replace(/\n/g, "<br>");
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>${safeTitle}</title>
</head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;padding:32px 0;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.06);">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#f59e0b,#d97706);padding:28px 32px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:800;letter-spacing:-0.5px;">
                🎓 AcaTrack
              </h1>
              <p style="margin:6px 0 0;color:rgba(255,255,255,0.85);font-size:12px;font-weight:500;text-transform:uppercase;letter-spacing:1px;">
                Research Proposal Management
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:32px 32px 24px;">
              <h2 style="margin:0 0 16px;color:#0f172a;font-size:18px;font-weight:700;">
                ${safeTitle}
              </h2>
              <p style="margin:0;color:#475569;font-size:14px;line-height:1.7;">
                ${safeMessage}
              </p>
            </td>
          </tr>

          <!-- CTA Button -->
          <tr>
            <td style="padding:0 32px 32px;text-align:center;">
              <a href="https://acatrack.web.app" style="display:inline-block;background:linear-gradient(135deg,#f59e0b,#d97706);color:#ffffff;text-decoration:none;font-weight:700;font-size:13px;padding:12px 28px;border-radius:10px;letter-spacing:0.3px;">
                Open AcaTrack →
              </a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:20px 32px;border-top:1px solid #f1f5f9;text-align:center;">
              <p style="margin:0;color:#94a3b8;font-size:11px;line-height:1.6;">
                This is an automated notification from <strong>AcaTrack</strong>.<br/>
                You are receiving this because you are registered on the platform.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
    const text = `${title}\n\n${message}\n\nOpen AcaTrack: https://acatrack.web.app\n\n---\nThis is an automated notification from ${fromName}.`;
    return { subject: `[AcaTrack] ${title}`, html, text };
}
// ─────────────────────────────────────────────────────────────────────────────
// FUNCTION 1: Send email when a notification document is created
// Triggers on: /notifications/{notifId}
// ─────────────────────────────────────────────────────────────────────────────
exports.onNotificationCreated = (0, firestore_1.onDocumentCreated)({
    document: "notifications/{notifId}",
    secrets: [SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, CONTACT_FROM_EMAIL, CONTACT_FROM_NAME, CONTACT_TO_EMAIL],
}, async (event) => {
    const notif = event.data?.data();
    if (!notif)
        return;
    const { recipientId, title, message } = notif;
    if (!recipientId || !title || !message)
        return;
    // 1. Look up the recipient's email from the users collection
    let recipientEmail = null;
    let recipientName = "there";
    try {
        const userSnap = await db.collection("users").doc(recipientId).get();
        if (userSnap.exists) {
            const userData = userSnap.data();
            recipientEmail = userData.email ?? null;
            const first = userData.firstName ?? "";
            const last = userData.lastName ?? "";
            if (first || last)
                recipientName = `${first} ${last}`.trim();
        }
    }
    catch (err) {
        logger.warn("Could not fetch user profile for email notification", { recipientId, err });
    }
    if (!recipientEmail) {
        logger.info("No email found for recipient — skipping email notification", { recipientId });
        return;
    }
    // 2. Build SMTP config
    const cfg = getSmtpConfig();
    if (!cfg) {
        logger.error("SMTP config missing — cannot send notification email");
        return;
    }
    // 3. Build and send the email
    const personalised = message.replace(/^(Your|A student|The student)/i, (match) => {
        if (match.toLowerCase().startsWith("your"))
            return `Hi ${recipientName}, your`;
        return `Hi ${recipientName}, ${match.toLowerCase()}`;
    });
    const { subject, html, text } = buildNotificationEmail(title, personalised || message, cfg.fromName);
    try {
        const transporter = createTransporter(cfg);
        await transporter.sendMail({
            from: `"${cfg.fromName}" <${cfg.fromEmail}>`,
            to: recipientEmail,
            subject,
            text,
            html,
        });
        logger.info("Notification email sent", { recipientId, recipientEmail, title });
    }
    catch (err) {
        logger.error("Failed to send notification email", { recipientId, recipientEmail, err });
    }
});
// ─────────────────────────────────────────────────────────────────────────────
// FUNCTION 2: Contact form handler (unchanged)
// ─────────────────────────────────────────────────────────────────────────────
exports.sendContactMessage = (0, https_1.onRequest)({
    secrets: [SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, CONTACT_FROM_EMAIL, CONTACT_FROM_NAME, CONTACT_TO_EMAIL],
}, async (req, res) => {
    setCorsHeaders(res);
    if (req.method === "OPTIONS") {
        res.status(204).send("");
        return;
    }
    if (req.method !== "POST") {
        res.status(405).json({ ok: false, error: "Method not allowed" });
        return;
    }
    const cfg = getSmtpConfig();
    if (!cfg) {
        logger.error("SMTP config is missing");
        res.status(500).json({ ok: false, error: "Email service is not configured" });
        return;
    }
    const body = (req.body ?? {});
    const name = getString(body.name);
    const email = getString(body.email);
    const subject = getString(body.subject);
    const message = getString(body.message);
    if (!name || !email || !subject || !message) {
        res.status(400).json({ ok: false, error: "Please fill in all fields before submitting." });
        return;
    }
    try {
        const transporter = createTransporter(cfg);
        await transporter.sendMail({
            from: `"${cfg.fromName}" <${cfg.fromEmail}>`,
            to: cfg.toEmail,
            replyTo: email,
            subject: `[AcaTrack] ${subject}`,
            text: [`Name: ${name}`, `Email: ${email}`, `Subject: ${subject}`, "", message].join("\n"),
            html: `
          <div style="font-family:Arial,sans-serif;line-height:1.6;color:#0f172a;">
            <h2 style="margin:0 0 16px;color:#111827;">New AcaTrack Contact Request</h2>
            <p><strong>Name:</strong> ${escapeHtml(name)}</p>
            <p><strong>Email:</strong> ${escapeHtml(email)}</p>
            <p><strong>Subject:</strong> ${escapeHtml(subject)}</p>
            <p><strong>Message:</strong></p>
            <div style="white-space:pre-wrap;padding:16px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;">${escapeHtml(message)}</div>
          </div>`,
        });
        res.status(200).json({ ok: true });
    }
    catch (error) {
        logger.error("Failed to send contact message", error);
        res.status(500).json({ ok: false, error: "Message could not be sent. Please try again." });
    }
});
