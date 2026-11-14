import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const SCREENSHOT_PATH_REGEX = /^\d{4}\/[0-9a-fA-F-]{36}\.(png|jpg|webp)$/;

interface FeedbackRequestBody {
  rating?: number;
  fullName?: string;
  email?: string;
  message?: string;
  screenshotPath?: string | null;
  locale?: string;
  pageUrl?: string;
}

interface ResendSendResult {
  ok: boolean;
  errorMessage?: string;
}

function jsonResponse(body: Record<string, unknown>, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
    },
  });
}

function escapeHtml(raw: string): string {
  return raw
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function generateTicketCode(): string {
  const now = new Date();
  const yy = String(now.getUTCFullYear()).slice(-2);
  const mm = String(now.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(now.getUTCDate()).padStart(2, '0');
  const suffix = crypto.randomUUID().replaceAll('-', '').slice(0, 4).toUpperCase();
  return `FB-${yy}${mm}${dd}-${suffix}`;
}

function renderStarsText(rating: number): string {
  return '★'.repeat(rating) + '☆'.repeat(5 - rating);
}

function buildAdminEmailHtml(params: {
  ticketCode: string;
  rating: number;
  fullName: string;
  email: string;
  message: string;
  pageUrl: string;
  locale: string;
  screenshotUrl: string | null;
}): string {
  const stars = renderStarsText(params.rating);
  const safeName = escapeHtml(params.fullName || 'Khách ẩn danh');
  const safeEmail = escapeHtml(params.email);
  const safeMessage = escapeHtml(params.message).replaceAll('\n', '<br/>');
  const safePageUrl = escapeHtml(params.pageUrl || '/');

  return `
  <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; background: #ffffff;">
    <div style="height: 4px; background: linear-gradient(90deg, #2563eb, #0ea5e9);"></div>
    <div style="padding: 24px;">
      <p style="margin: 0 0 8px; font-size: 12px; font-weight: 700; color: #2563eb; text-transform: uppercase; letter-spacing: 0.06em;">
        AI Smart Kanban · Phản hồi mới [${escapeHtml(params.ticketCode)}]
      </p>
      <h2 style="margin: 0 0 16px; font-size: 20px; color: #0f172a;">
        <span style="color: #f59e0b; letter-spacing: 2px;">${stars}</span> (${params.rating}/5)
      </h2>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 16px; font-size: 14px; color: #334155;">
        <tr><td style="padding: 6px 0; color: #64748b; width: 140px;">Người gửi:</td><td style="padding: 6px 0; font-weight: 600;">${safeName}</td></tr>
        <tr><td style="padding: 6px 0; color: #64748b;">Email:</td><td style="padding: 6px 0;"><a href="mailto:${safeEmail}" style="color: #2563eb;">${safeEmail}</a></td></tr>
        <tr><td style="padding: 6px 0; color: #64748b;">Ngôn ngữ / Trang:</td><td style="padding: 6px 0;">${escapeHtml(params.locale)} · ${safePageUrl}</td></tr>
      </table>
      <div style="padding: 16px; border-radius: 12px; background: #f8fafc; border: 1px solid #e2e8f0; color: #0f172a; font-size: 14px; line-height: 1.6;">
        ${safeMessage}
      </div>
      ${
        params.screenshotUrl
          ? `<div style="margin-top: 16px;">
              <p style="margin: 0 0 8px; font-size: 13px; font-weight: 600; color: #475569;">Ảnh đính kèm (liên kết có hiệu lực 7 ngày):</p>
              <a href="${escapeHtml(params.screenshotUrl)}" target="_blank" rel="noopener noreferrer" style="display: inline-block; padding: 8px 14px; border-radius: 8px; background: #eff6ff; color: #1d4ed8; font-size: 13px; font-weight: 600; text-decoration: none;">Xem ảnh chụp đính kèm</a>
            </div>`
          : ''
      }
    </div>
  </div>`;
}

function buildUserConfirmationHtml(params: {
  ticketCode: string;
  rating: number;
  fullName: string;
  message: string;
  locale: string;
}): { subject: string; html: string } {
  const isEn = params.locale.startsWith('en');
  const stars = renderStarsText(params.rating);
  const greetingName = escapeHtml(params.fullName || (isEn ? 'there' : 'bạn'));
  const safeMessage = escapeHtml(params.message).replaceAll('\n', '<br/>');

  if (isEn) {
    return {
      subject: `[${params.ticketCode}] Thank you for rating AI Smart Kanban`,
      html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 560px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; background: #ffffff;">
        <div style="height: 4px; background: linear-gradient(90deg, #2563eb, #0ea5e9);"></div>
        <div style="padding: 24px; color: #1e293b; font-size: 14px; line-height: 1.6;">
          <h2 style="margin: 0 0 12px; font-size: 19px; color: #0f172a;">Thank you, ${greetingName}!</h2>
          <p style="margin: 0 0 16px; color: #475569;">We have received your feedback for <strong>AI Smart Kanban</strong>. Below is your submission receipt:</p>
          <p style="margin: 0 0 12px;">
            <strong>Reference ID:</strong> ${escapeHtml(params.ticketCode)}<br/>
            <strong>Rating:</strong> <span style="color: #f59e0b; letter-spacing: 1px;">${stars}</span> (${params.rating}/5)
          </p>
          <blockquote style="margin: 0; padding: 12px 16px; background: #f8fafc; border-left: 3px solid #2563eb; border-radius: 8px; color: #334155;">${safeMessage}</blockquote>
        </div>
      </div>`,
    };
  }

  return {
    subject: `[${params.ticketCode}] Cảm ơn bạn đã gửi đánh giá cho AI Smart Kanban`,
    html: `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 560px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; background: #ffffff;">
      <div style="height: 4px; background: linear-gradient(90deg, #2563eb, #0ea5e9);"></div>
      <div style="padding: 24px; color: #1e293b; font-size: 14px; line-height: 1.6;">
        <h2 style="margin: 0 0 12px; font-size: 19px; color: #0f172a;">Cảm ơn ${greetingName}!</h2>
        <p style="margin: 0 0 16px; color: #475569;">Chúng tôi đã ghi nhận đánh giá của bạn cho <strong>AI Smart Kanban</strong>. Dưới đây là thông tin xác nhận:</p>
        <p style="margin: 0 0 12px;">
          <strong>Mã tham chiếu:</strong> ${escapeHtml(params.ticketCode)}<br/>
          <strong>Đánh giá:</strong> <span style="color: #f59e0b; letter-spacing: 1px;">${stars}</span> (${params.rating}/5)
        </p>
        <blockquote style="margin: 0; padding: 12px 16px; background: #f8fafc; border-left: 3px solid #2563eb; border-radius: 8px; color: #334155;">${safeMessage}</blockquote>
      </div>
    </div>`,
  };
}

async function sendViaResend(params: {
  apiKey: string;
  from: string;
  to: string[];
  subject: string;
  html: string;
  replyTo?: string;
}): Promise<ResendSendResult> {
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${params.apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: params.from,
      to: params.to,
      subject: params.subject,
      html: params.html,
      ...(params.replyTo ? { reply_to: params.replyTo } : {}),
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    return { ok: false, errorMessage: errorText || `Resend HTTP ${response.status}` };
  }

  return { ok: true };
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return jsonResponse({ code: 'VALIDATION_ERROR', error: 'Method not allowed' }, 405);
  }

  let body: FeedbackRequestBody;
  try {
    body = (await req.json()) as FeedbackRequestBody;
  } catch {
    return jsonResponse({ code: 'VALIDATION_ERROR', error: 'Invalid JSON request body' }, 400);
  }

  const rating = Number(body.rating);
  const fullName = String(body.fullName ?? '').trim().slice(0, 80);
  const email = String(body.email ?? '').trim();
  const message = String(body.message ?? '').trim();
  const locale = String(body.locale ?? 'vi').trim().slice(0, 12) || 'vi';
  const pageUrl = String(body.pageUrl ?? '').trim().slice(0, 500);
  const rawScreenshotPath = body.screenshotPath ? String(body.screenshotPath).trim() : null;

  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return jsonResponse({ code: 'VALIDATION_ERROR', error: 'Rating must be between 1 and 5' }, 400);
  }
  if (!EMAIL_REGEX.test(email)) {
    return jsonResponse({ code: 'VALIDATION_ERROR', error: 'Invalid email address' }, 400);
  }
  if (message.length < 10 || message.length > 500) {
    return jsonResponse(
      { code: 'VALIDATION_ERROR', error: 'Message must be 10 to 500 characters' },
      400
    );
  }
  if (rawScreenshotPath && !SCREENSHOT_PATH_REGEX.test(rawScreenshotPath)) {
    return jsonResponse({ code: 'VALIDATION_ERROR', error: 'Invalid screenshot path' }, 400);
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
  if (!supabaseUrl || !serviceRoleKey) {
    return jsonResponse({ code: 'UNKNOWN_ERROR', error: 'Supabase runtime env missing' }, 500);
  }

  const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);
  const ticketCode = generateTicketCode();

  const { data: insertedRow, error: insertError } = await supabaseAdmin
    .from('feedbacks')
    .insert({
      ticket_code: ticketCode,
      rating,
      full_name: fullName,
      email,
      message,
      screenshot_path: rawScreenshotPath,
      locale,
      page_url: pageUrl,
    })
    .select('id, created_at')
    .single();

  if (insertError || !insertedRow) {
    return jsonResponse(
      { code: 'UNKNOWN_ERROR', error: insertError?.message || 'Failed to persist feedback' },
      500
    );
  }

  const feedbackId = insertedRow.id as string;
  const createdAt = insertedRow.created_at as string;

  const resendApiKey = (Deno.env.get('RESEND_API_KEY') ?? '').trim();
  const adminEmail = (Deno.env.get('FEEDBACK_ADMIN_EMAIL') ?? '').trim();
  const fromEmail =
    (Deno.env.get('FEEDBACK_FROM_EMAIL') ?? '').trim() ||
    'AI Smart Kanban <onboarding@resend.dev>';

  if (!resendApiKey || !adminEmail) {
    await supabaseAdmin
      .from('feedbacks')
      .update({ email_error: 'Missing RESEND_API_KEY or FEEDBACK_ADMIN_EMAIL secret' })
      .eq('id', feedbackId);

    return jsonResponse(
      {
        code: 'EMAIL_NOT_CONFIGURED',
        error: 'Feedback saved in DB, but RESEND_API_KEY or FEEDBACK_ADMIN_EMAIL is not configured',
        feedbackId,
        ticketCode,
      },
      503
    );
  }

  let screenshotSignedUrl: string | null = null;
  if (rawScreenshotPath) {
    const { data: signedData } = await supabaseAdmin.storage
      .from('feedback-attachments')
      .createSignedUrl(rawScreenshotPath, 60 * 60 * 24 * 7);
    screenshotSignedUrl = signedData?.signedUrl ?? null;
  }

  const adminSend = await sendViaResend({
    apiKey: resendApiKey,
    from: fromEmail,
    to: [adminEmail],
    replyTo: email,
    subject: `[${ticketCode}] ${rating}/5 - AI Smart Kanban`,
    html: buildAdminEmailHtml({
      ticketCode,
      rating,
      fullName,
      email,
      message,
      pageUrl,
      locale,
      screenshotUrl: screenshotSignedUrl,
    }),
  });

  if (!adminSend.ok) {
    await supabaseAdmin
      .from('feedbacks')
      .update({
        admin_email_sent: false,
        email_error: adminSend.errorMessage ?? 'Admin email delivery failed',
      })
      .eq('id', feedbackId);

    return jsonResponse(
      {
        code: 'EMAIL_DELIVERY_FAILED',
        error: adminSend.errorMessage || 'Failed to deliver admin report email',
        feedbackId,
        ticketCode,
      },
      502
    );
  }

  const userEmailTemplate = buildUserConfirmationHtml({
    ticketCode,
    rating,
    fullName,
    message,
    locale,
  });

  const userSend = await sendViaResend({
    apiKey: resendApiKey,
    from: fromEmail,
    to: [email],
    subject: userEmailTemplate.subject,
    html: userEmailTemplate.html,
  });

  await supabaseAdmin
    .from('feedbacks')
    .update({
      admin_email_sent: true,
      user_email_sent: userSend.ok,
      email_error: userSend.ok ? null : (userSend.errorMessage ?? null),
    })
    .eq('id', feedbackId);

  return jsonResponse(
    {
      feedbackId,
      ticketCode,
      screenshotPath: rawScreenshotPath,
      adminEmailSent: true,
      userConfirmationSent: userSend.ok,
      emailWarning: userSend.ok ? null : (userSend.errorMessage ?? null),
      createdAt,
    },
    201
  );
});
