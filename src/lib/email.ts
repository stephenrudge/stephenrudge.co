import { Resend } from "resend";

const INTENT_LABELS: Record<string, string> = {
  collaborate: "Collaborate",
  host: "Host me",
  other: "Something else",
};

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function isEmailConfigured() {
  return Boolean(process.env.RESEND_API_KEY && getNotifyEmail());
}

function getNotifyEmail() {
  return (
    process.env.CONTACT_NOTIFY_EMAIL?.trim() ||
    process.env.NEXT_PUBLIC_CONTACT_EMAIL?.trim() ||
    ""
  );
}

function getFromAddress() {
  return (
    process.env.RESEND_FROM_EMAIL?.trim() ||
    "Stephen Rudge <onboarding@resend.dev>"
  );
}

export async function sendContactNotification(input: {
  name: string;
  email: string;
  intent: string;
  message: string;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  const to = getNotifyEmail();
  if (!apiKey || !to) {
    return { sent: false as const, reason: "not_configured" as const };
  }

  const intentLabel = INTENT_LABELS[input.intent] || input.intent;
  const safeName = escapeHtml(input.name);
  const safeEmail = escapeHtml(input.email);
  const safeIntent = escapeHtml(intentLabel);
  const safeMessage = escapeHtml(input.message).replace(/\n/g, "<br/>");

  const resend = new Resend(apiKey);
  const { error } = await resend.emails.send({
    from: getFromAddress(),
    to: [to],
    replyTo: input.email,
    subject: `Contact: ${intentLabel} — ${input.name}`,
    html: `
      <p><strong>From:</strong> ${safeName} &lt;${safeEmail}&gt;</p>
      <p><strong>Intent:</strong> ${safeIntent}</p>
      <p><strong>Message:</strong></p>
      <p>${safeMessage}</p>
    `,
    text: [
      `From: ${input.name} <${input.email}>`,
      `Intent: ${intentLabel}`,
      "",
      input.message,
    ].join("\n"),
  });

  if (error) {
    console.error("contact email failed", error.message);
    return { sent: false as const, reason: "send_failed" as const };
  }

  return { sent: true as const };
}
