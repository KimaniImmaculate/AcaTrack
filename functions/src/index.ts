import * as logger from "firebase-functions/logger";
import { onRequest } from "firebase-functions/v2/https";
import { defineSecret } from "firebase-functions/params";
import type { Response } from "express";
import nodemailer from "nodemailer";

const DEFAULT_TO_EMAIL = "immakym001@gmail.com";

type ContactPayload = {
  name?: unknown;
  email?: unknown;
  subject?: unknown;
  message?: unknown;
};

type SmtpConfig = {
  host: string;
  port: number;
  user: string;
  pass: string;
  fromEmail: string;
  fromName: string;
  toEmail: string;
};

const SMTP_HOST = defineSecret("SMTP_HOST");
const SMTP_PORT = defineSecret("SMTP_PORT");
const SMTP_USER = defineSecret("SMTP_USER");
const SMTP_PASS = defineSecret("SMTP_PASS");
const CONTACT_FROM_EMAIL = defineSecret("CONTACT_FROM_EMAIL");
const CONTACT_FROM_NAME = defineSecret("CONTACT_FROM_NAME");
const CONTACT_TO_EMAIL = defineSecret("CONTACT_TO_EMAIL");

function getString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function getSmtpConfig(): SmtpConfig | null {
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

function setCorsHeaders(res: Response): void {
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.set("Access-Control-Allow-Headers", "Content-Type, Accept");
  res.set("Access-Control-Max-Age", "3600");
}

export const sendContactMessage = onRequest(
  {
    secrets: [
      SMTP_HOST,
      SMTP_PORT,
      SMTP_USER,
      SMTP_PASS,
      CONTACT_FROM_EMAIL,
      CONTACT_FROM_NAME,
      CONTACT_TO_EMAIL
    ]
  },
  async (req, res) => {
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

    const body = (req.body ?? {}) as ContactPayload;
    const name = getString(body.name);
    const email = getString(body.email);
    const subject = getString(body.subject);
    const message = getString(body.message);

    if (!name || !email || !subject || !message) {
      res.status(400).json({ ok: false, error: "Please fill in all fields before submitting." });
      return;
    }

    try {
      const transporter = nodemailer.createTransport({
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
    } catch (error) {
      logger.error("Failed to send contact message", error);
      res.status(500).json({ ok: false, error: "Message could not be sent. Please try again." });
    }
  }
);
