type SendEmailParams = {
  to: { email: string; name?: string };
  subject: string;
  htmlContent: string;
  tags?: string[];
};

type BrevoResponse = { messageId: string };

export async function sendEmail(params: SendEmailParams): Promise<string> {
  const res = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "api-key": process.env.BREVO_API_KEY ?? "",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      sender: {
        email: process.env.BREVO_SENDER_EMAIL,
        name: process.env.BREVO_SENDER_NAME,
      },
      to: [params.to],
      subject: params.subject,
      htmlContent: params.htmlContent,
      tags: params.tags,
    }),
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Brevo error ${res.status}: ${error}`);
  }

  const data = (await res.json()) as BrevoResponse;
  return data.messageId;
}

export function textToHtml(text: string): string {
  return `<html><body><p>${text.replace(/\n\n/g, "</p><p>").replace(/\n/g, "<br>")}</p></body></html>`;
}
