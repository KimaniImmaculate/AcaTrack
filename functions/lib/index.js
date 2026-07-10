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
exports.sendContactMessage = void 0;
const logger = __importStar(require("firebase-functions/logger"));
const https_1 = require("firebase-functions/v2/https");
const params_1 = require("firebase-functions/params");
const nodemailer_1 = __importDefault(require("nodemailer"));
const DEFAULT_TO_EMAIL = "immakym001@gmail.com";
const SMTP_HOST = (0, params_1.defineSecret)("SMTP_HOST");
const SMTP_PORT = (0, params_1.defineSecret)("SMTP_PORT");
const SMTP_USER = (0, params_1.defineSecret)("SMTP_USER");
const SMTP_PASS = (0, params_1.defineSecret)("SMTP_PASS");
const CONTACT_FROM_EMAIL = (0, params_1.defineSecret)("CONTACT_FROM_EMAIL");
const CONTACT_FROM_NAME = (0, params_1.defineSecret)("CONTACT_FROM_NAME");
const CONTACT_TO_EMAIL = (0, params_1.defineSecret)("CONTACT_TO_EMAIL");
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
    const fromName = getString(CONTACT_FROM_NAME.value() || "AcaTrack Contact Form") || "AcaTrack Contact Form";
    const toEmail = getString(CONTACT_TO_EMAIL.value() || DEFAULT_TO_EMAIL) || DEFAULT_TO_EMAIL;
    const port = Number(portValue || "587");
    if (!host || !port || !user || !pass || !fromEmail) {
        return null;
    }
    return {
        host,
        port,
        user,
        pass,
        fromEmail,
        fromName,
        toEmail
    };
}
function setCorsHeaders(res) {
    res.set("Access-Control-Allow-Origin", "*");
    res.set("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.set("Access-Control-Allow-Headers", "Content-Type, Accept");
    res.set("Access-Control-Max-Age", "3600");
}
exports.sendContactMessage = (0, https_1.onRequest)({
    secrets: [
        SMTP_HOST,
        SMTP_PORT,
        SMTP_USER,
        SMTP_PASS,
        CONTACT_FROM_EMAIL,
        CONTACT_FROM_NAME,
        CONTACT_TO_EMAIL
    ]
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
    const smtpConfig = getSmtpConfig();
    if (!smtpConfig) {
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
        const transporter = nodemailer_1.default.createTransport({
            host: smtpConfig.host,
            port: smtpConfig.port,
            secure: smtpConfig.port === 465,
            auth: {
                user: smtpConfig.user,
                pass: smtpConfig.pass
            }
        });
        await transporter.sendMail({
            from: `"${smtpConfig.fromName}" <${smtpConfig.fromEmail}>`,
            to: smtpConfig.toEmail,
            replyTo: email,
            subject: `[AcaTrack] ${subject}`,
            text: [
                `Name: ${name}`,
                `Email: ${email}`,
                `Subject: ${subject}`,
                "",
                message
            ].join("\n"),
            html: `
          <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #0f172a;">
            <h2 style="margin: 0 0 16px; color: #111827;">New AcaTrack Contact Request</h2>
            <p><strong>Name:</strong> ${escapeHtml(name)}</p>
            <p><strong>Email:</strong> ${escapeHtml(email)}</p>
            <p><strong>Subject:</strong> ${escapeHtml(subject)}</p>
            <p><strong>Message:</strong></p>
            <div style="white-space: pre-wrap; padding: 16px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px;">${escapeHtml(message)}</div>
          </div>
        `
        });
        res.status(200).json({ ok: true });
    }
    catch (error) {
        logger.error("Failed to send contact message", error);
        res.status(500).json({ ok: false, error: "Message could not be sent. Please try again." });
    }
});
