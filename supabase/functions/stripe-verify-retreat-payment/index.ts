import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.25.0?target=deno";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CompactRetreat {
  id: string;
  n: string;
  l: string;
  c: string;
  du: string;
  dt: string;
  p: number;
  cur: string;
  d: string;
  i: string;
  u: string;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function safeHttpUrl(u: string): string | null {
  try {
    const url = new URL(u);
    if (url.protocol === "http:" || url.protocol === "https:") return url.href;
  } catch {
    /* ignore */
  }
  return null;
}

function decodeRetreatFromMetadata(md: Record<string, string> | null): CompactRetreat | null {
  if (!md) return null;
  const parts = parseInt(String(md.parts || "1"), 10);
  if (!parts || parts > 50) return null;
  let b64 = "";
  for (let p = 0; p < parts; p++) {
    const chunk = md[`r_${p}`];
    if (typeof chunk !== "string") return null;
    b64 += chunk;
  }
  try {
    const json = decodeURIComponent(escape(atob(b64)));
    return JSON.parse(json) as CompactRetreat;
  } catch {
    return null;
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY")?.trim();
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")?.trim();

    if (!STRIPE_SECRET_KEY) {
      throw new Error("STRIPE_SECRET_KEY is not configured.");
    }

    const { sessionId } = await req.json();
    const sid = String(sessionId || "").trim();
    if (!sid.startsWith("cs_")) {
      throw new Error("Invalid session id.");
    }

    const stripe = new Stripe(STRIPE_SECRET_KEY, {
      apiVersion: "2023-10-16",
      httpClient: Stripe.createFetchHttpClient(),
    });

    const session = await stripe.checkout.sessions.retrieve(sid);
    if (session.payment_status !== "paid") {
      return new Response(
        JSON.stringify({ success: false, error: "Payment not completed yet." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const retreat = decodeRetreatFromMetadata(session.metadata as Record<string, string>);
    if (!retreat) {
      throw new Error("Could not read retreat data from payment session.");
    }

    const email =
      session.customer_details?.email ||
      session.customer_email ||
      session.metadata?.customer_email ||
      "";

    if (RESEND_API_KEY && email) {
      const resend = new Resend(RESEND_API_KEY);
      const safeLink = safeHttpUrl(retreat.u);
      const linkHtml = safeLink
        ? `<p style="margin:16px 0;"><a href="${escapeHtml(safeLink)}" style="color:#0369a1;font-weight:600;">Official vendor booking link</a></p>`
        : "";

      const safeImg = safeHttpUrl(retreat.i);

      await resend.emails.send({
        from: "Retreats Holidays <onboarding@resend.dev>",
        to: [email],
        subject: `Your retreat details — ${retreat.n}`.slice(0, 200),
        html: `
          <!DOCTYPE html>
          <html><head><meta charset="utf-8"/></head>
          <body style="font-family:system-ui,sans-serif;max-width:600px;margin:0 auto;padding:24px;color:#1e293b;">
            <h1 style="color:#0369a1;font-size:22px;">Thank you — your match is ready</h1>
            <p>You paid a 5% concierge/redirection fee. Here are the details for your verified provider match. Complete your booking directly with the vendor using the link below.</p>
            <div style="background:#f0f9ff;padding:20px;border-radius:12px;margin:20px 0;">
              <h2 style="margin:0 0 12px;font-size:18px;">${escapeHtml(retreat.n)}</h2>
              <p style="margin:6px 0;"><strong>Location:</strong> ${escapeHtml(retreat.l)}, ${escapeHtml(retreat.c)}</p>
              <p style="margin:6px 0;"><strong>Duration:</strong> ${escapeHtml(retreat.du)}</p>
              <p style="margin:6px 0;"><strong>Dates:</strong> ${escapeHtml(retreat.dt)}</p>
              <p style="margin:6px 0;"><strong>From price (reference):</strong> ${escapeHtml(retreat.cur)} ${escapeHtml(String(retreat.p))}</p>
              <p style="margin:12px 0 0;line-height:1.5;"><strong>Details:</strong> ${escapeHtml(retreat.d)}</p>
            </div>
            ${linkHtml}
            ${safeImg ? `<p><img src="${escapeHtml(safeImg)}" alt="" style="max-width:100%;border-radius:8px;"/></p>` : ""}
            <p style="color:#64748b;font-size:14px;">Questions? <a href="https://wa.me/23058461923">WhatsApp us</a>.</p>
          </body></html>
        `,
      });
    } else if (!RESEND_API_KEY) {
      console.warn("RESEND_API_KEY missing; skipping detail email.");
    }

    return new Response(
      JSON.stringify({
        success: true,
        retreatId: retreat.id,
        retreat: {
          id: retreat.id,
          name: retreat.n,
          location: retreat.l,
          country: retreat.c,
          duration: retreat.du,
          dates: retreat.dt,
          price: retreat.p,
          currency: retreat.cur,
          description: retreat.d,
          image: retreat.i,
          sourceUrl: retreat.u,
        },
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    console.error("stripe-verify-retreat-payment:", e);
    const msg = e instanceof Error ? e.message : "Verification failed";
    return new Response(JSON.stringify({ success: false, error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
