import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.25.0?target=deno";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const CONCIERGE_FEE_PERCENTAGE = 0.05;
const MIN_CONCIERGE_FEE_USD = 5;

function getConciergeFeeUsd(basePrice: number): number {
  const fee = Math.round(basePrice * CONCIERGE_FEE_PERCENTAGE);
  return Math.max(fee, MIN_CONCIERGE_FEE_USD);
}

/** Compact retreat payload for Stripe metadata (500 chars/value max). */
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

function toCompact(body: Record<string, unknown>): CompactRetreat {
  const desc = String(body.description || "").slice(0, 400);
  return {
    id: String(body.id || ""),
    n: String(body.name || "Retreat").slice(0, 120),
    l: String(body.location || "").slice(0, 80),
    c: String(body.country || "").slice(0, 80),
    du: String(body.duration || "").slice(0, 40),
    dt: String(body.dates || "Flexible Dates").slice(0, 80),
    p: Number(body.price) || 0,
    cur: String(body.currency || "USD").slice(0, 8),
    d: desc,
    i: String(body.image || "").slice(0, 300),
    u: String(body.sourceUrl || body.url || "").slice(0, 400),
  };
}

function encodeRetreatMetadata(r: CompactRetreat): Record<string, string> {
  const json = JSON.stringify(r);
  const b64 = btoa(unescape(encodeURIComponent(json)));
  const chunkSize = 450;
  const partCount = Math.ceil(b64.length / chunkSize) || 1;
  // Stripe allows at most 50 metadata keys per object; reserve space for v, parts, customer fields.
  if (partCount > 44) {
    throw new Error("Retreat payload too large for checkout metadata; shorten description.");
  }
  const meta: Record<string, string> = {
    v: "1",
    parts: String(partCount),
  };
  for (let i = 0, p = 0; i < b64.length; i += chunkSize, p++) {
    meta[`r_${p}`] = b64.slice(i, i + chunkSize);
  }
  return meta;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY")?.trim();
    const SITE_URL = Deno.env.get("SITE_URL")?.trim()?.replace(/\/$/, "");

    if (!STRIPE_SECRET_KEY) {
      throw new Error("STRIPE_SECRET_KEY is not set in Edge Function secrets.");
    }
    if (!SITE_URL) {
      throw new Error(
        "SITE_URL is not set (e.g. https://yourdomain.com). Add it in Supabase Edge Function secrets.",
      );
    }

    const body = await req.json();
    const customerEmail = String(body.customerEmail || "").trim();
    const customerName = String(body.customerName || "").trim();

    if (!customerEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail)) {
      throw new Error("Valid customer email is required.");
    }

    const retreat = toCompact(body.retreat || {});
    const conciergeFeeUsd = getConciergeFeeUsd(retreat.p);
    const conciergeFeeCents = conciergeFeeUsd * 100;

    const stripe = new Stripe(STRIPE_SECRET_KEY, {
      apiVersion: "2023-10-16",
      httpClient: Stripe.createFetchHttpClient(),
    });

    const retreatMeta = encodeRetreatMetadata(retreat);
    const meta: Record<string, string> = {
      ...retreatMeta,
      customer_email: customerEmail.slice(0, 200),
      customer_name: customerName.slice(0, 200),
    };

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: customerEmail,
      line_items: [
        {
          price_data: {
            currency: "usd",
            unit_amount: conciergeFeeCents,
            product_data: {
              name: "Concierge redirection fee (5%)",
              description: `Unlock official vendor booking link for: ${retreat.n}`.slice(0, 500),
            },
          },
          quantity: 1,
        },
      ],
      success_url: `${SITE_URL}/?payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${SITE_URL}/?payment=cancel`,
      metadata: meta,
    });

    if (!session.url) {
      throw new Error("Stripe did not return a checkout URL.");
    }

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("stripe-create-checkout:", e);
    const msg = e instanceof Error ? e.message : "Checkout failed";
    return new Response(JSON.stringify({ error: msg }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
