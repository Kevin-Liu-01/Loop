import { currentUser } from "@clerk/nextjs/server";
import { z } from "zod";

import { getPrimaryAdminEmail } from "@/lib/admin";
import { getServerSupabase } from "@/lib/db/client";
import { EMAIL_FROM, getResendClient } from "@/lib/email/client";
import {
  BRAND_NAME,
  emailWrapper,
  escapeHtml,
  divider,
} from "@/lib/email/html";

const feedbackSchema = z.object({
  message: z.string().min(1).max(5000),
  pageUrl: z.string().url().optional(),
});

function buildFeedbackHtml(
  message: string,
  email: string | null,
  pageUrl: string | null
): string {
  const fromLine = email
    ? `<a href="mailto:${escapeHtml(email)}" style="color:${/* brand */ "#e8650a"};text-decoration:none;">${escapeHtml(email)}</a>`
    : "Anonymous";

  const pageLine = pageUrl
    ? `<tr><td style="padding:4px 0 0;font-size:13px;color:#6b6b78;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">Page: <a href="${escapeHtml(pageUrl)}" style="color:#a0a0ab;text-decoration:underline;">${escapeHtml(pageUrl)}</a></td></tr>`
    : "";

  const body = `<tr>
  <td style="padding:0 0 8px;">
    <h1 style="margin:0;font-size:22px;font-weight:700;color:#e5e5e5;font-family:Georgia,'Times New Roman',serif;letter-spacing:-0.03em;">
      New feedback
    </h1>
    <p style="margin:8px 0 0;font-size:13px;color:#8b8b96;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
      From: ${fromLine}
    </p>
    ${pageLine}
  </td>
</tr>
${divider()}
<tr>
  <td style="padding:0;">
    <div style="padding:16px;background-color:#13131a;border-radius:10px;">
      <p style="margin:0;font-size:14px;line-height:1.65;color:#e5e5e5;white-space:pre-wrap;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">${escapeHtml(message)}</p>
    </div>
  </td>
</tr>`;

  return emailWrapper(body);
}

function buildFeedbackText(
  message: string,
  email: string | null,
  pageUrl: string | null
): string {
  return [
    `New feedback on ${BRAND_NAME}`,
    "=".repeat(24),
    "",
    `From: ${email ?? "Anonymous"}`,
    pageUrl ? `Page: ${pageUrl}` : null,
    "",
    "---",
    message,
    "---",
  ]
    .filter((line): line is string => line !== null)
    .join("\n");
}

export async function POST(request: Request) {
  try {
    const body = feedbackSchema.parse(await request.json());
    const user = await currentUser().catch(() => null);
    const email = user?.emailAddresses[0]?.emailAddress ?? null;

    const supabase = getServerSupabase();
    const { error: dbError } = await supabase.from("feedback").insert({
      clerk_user_id: user?.id ?? null,
      email,
      message: body.message,
      page_url: body.pageUrl ?? null,
    });

    if (dbError) {
      console.error("[feedback] DB insert failed:", dbError);
      return Response.json(
        { error: "Failed to save feedback." },
        { status: 500 }
      );
    }

    const resend = getResendClient();
    if (resend) {
      try {
        await resend.emails.send({
          from: EMAIL_FROM,
          to: [getPrimaryAdminEmail()],
          subject: `[${BRAND_NAME}] New feedback${email ? ` from ${email}` : ""}`,
          html: buildFeedbackHtml(body.message, email, body.pageUrl ?? null),
          text: buildFeedbackText(body.message, email, body.pageUrl ?? null),
          replyTo: email ?? undefined,
        });
      } catch (emailError) {
        console.error("[feedback] Email send failed:", emailError);
      }
    }

    return Response.json({ ok: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json(
        { error: error.issues[0]?.message ?? "Invalid feedback." },
        { status: 400 }
      );
    }

    console.error("[feedback] Unexpected error:", error);
    return Response.json({ error: "Something went wrong." }, { status: 500 });
  }
}
