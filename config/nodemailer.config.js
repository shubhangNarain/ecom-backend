import nodemailer from "nodemailer";

// Lazy getter — transporter is created on first use, AFTER dotenv has loaded
let _transporter = null;

function getTransporter() {
  if (_transporter) return _transporter;

  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;

  // Fail fast with a clear message if env vars are missing
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    throw new Error(
      `Nodemailer misconfiguration — missing env vars:\n` +
        `  SMTP_HOST : ${SMTP_HOST || "❌ not set"}\n` +
        `  SMTP_PORT : ${SMTP_PORT || "❌ not set (will default to 587)"}\n` +
        `  SMTP_USER : ${SMTP_USER || "❌ not set"}\n` +
        `  SMTP_PASS : ${SMTP_PASS ? "✅ set" : "❌ not set"}`
    );
  }

  _transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT) || 587,
    secure: Number(SMTP_PORT) === 465, // true only for port 465
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });

  return _transporter;
}

/**
 * Sends a welcome email to a newly registered user.
 * @param {string} to - Recipient email address
 * @param {string} name - Recipient's display name
 */
export async function sendWelcomeEmail(to, name) {
  const transporter = getTransporter();

  const appName = process.env.FROM_NAME || "JautEr";

  const html = `
    <div style="font-family: 'Space Grotesk', 'Inter', Arial, sans-serif; max-width: 600px; margin: auto; padding: 40px; border: 1px solid #f0f0f0; border-radius: 24px; background-color: #ffffff; box-shadow: 0 10px 30px rgba(0,0,0,0.02);">
      <div style="text-align: center; margin-bottom: 32px;">
        <span style="font-size: 28px; font-weight: 800; letter-spacing: -1px; color: #000000; font-family: sans-serif;">
          Jaut<span style="background-color: #000000; color: #c6f135; padding: 2px 8px; border-radius: 4px; margin-left: 2px;">er</span>
        </span>
      </div>
      <h2 style="color: #111111; font-size: 22px; font-weight: 700; margin-bottom: 16px; font-family: sans-serif;">Welcome, ${name}! 🎉</h2>
      <p style="color: #555555; font-size: 15px; line-height: 1.6; margin-bottom: 24px; font-family: sans-serif;">
        Your account has been created successfully. Welcome to <strong>${appName}</strong> — your destination for exclusive drops, premium tech, and fast checkout.
      </p>
      <div style="text-align: center; margin-top: 32px; margin-bottom: 32px;">
        <a href="${process.env.CLIENT_URL || '#'}" style="background-color: #000000; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 12px; font-size: 14px; font-weight: bold; letter-spacing: 1px; text-transform: uppercase; display: inline-block; font-family: sans-serif;">
          Start Exploring
        </a>
      </div>
      <hr style="border: none; border-top: 1px solid #f0f0f0; margin: 32px 0;" />
      <p style="color: #999999; font-size: 11px; text-align: center; line-height: 1.5; font-family: sans-serif;">
        If you didn't create this account, you can safely ignore this email.<br />
        &copy; ${new Date().getFullYear()} ${appName} Inc. All rights reserved.
      </p>
    </div>
  `;

  try {
    const info = await transporter.sendMail({
      from: `"${appName}" <${process.env.SMTP_USER}>`,
      to,
      subject: `Welcome to ${appName}!`,
      html,
    });
    console.log(`✅ Welcome email sent to ${to} — MessageId: ${info.messageId}`);
  } catch (err) {
    // Enrich the error with context before re-throwing
    const enriched = new Error(
      `sendWelcomeEmail failed for "${to}": ${err.message}\n` +
        `  SMTP_HOST : ${process.env.SMTP_HOST}\n` +
        `  SMTP_PORT : ${process.env.SMTP_PORT}\n` +
        `  SMTP_USER : ${process.env.SMTP_USER}\n` +
        `  Error code: ${err.code || "N/A"}\n` +
        `  Response  : ${err.response || "N/A"}`
    );
    enriched.stack = err.stack;
    throw enriched;
  }
}

// Default export for email.utils.js compatibility
export default { sendMail: (...args) => getTransporter().sendMail(...args) };
