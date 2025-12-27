import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface BookingEmailRequest {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  retreatName: string;
  retreatLocation: string;
  retreatDuration: string;
  retreatPrice: number;
  numberOfGuests: number;
  specialRequests?: string;
  paymentStatus?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    const ADMIN_EMAIL = Deno.env.get("ADMIN_EMAIL") || Deno.env.get("GMAIL_USER") || "admin@retreatsholidays.com";

    if (!RESEND_API_KEY) {
      console.error("RESEND_API_KEY not configured");
      throw new Error("Email service not configured");
    }

    const resend = new Resend(RESEND_API_KEY);
    const booking: BookingEmailRequest = await req.json();
    
    console.log("Processing booking email for:", booking.customerEmail);
    
    const totalPrice = booking.retreatPrice * booking.numberOfGuests;

    // Send confirmation email to customer
    const customerEmailResponse = await resend.emails.send({
      from: "Retreats Holidays <onboarding@resend.dev>",
      to: [booking.customerEmail],
      subject: `Booking Confirmation - ${booking.retreatName}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8fafc;">
          <div style="background: linear-gradient(135deg, #0ea5e9 0%, #0369a1 100%); padding: 30px; border-radius: 16px 16px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">🌿 Booking Confirmed!</h1>
          </div>
          
          <div style="background: white; padding: 30px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <p style="font-size: 18px; color: #334155;">Dear ${booking.customerName},</p>
            <p style="color: #64748b; line-height: 1.6;">Thank you for choosing Retreats Holidays! We're thrilled to confirm your retreat booking.</p>
            
            <div style="background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); padding: 25px; border-radius: 12px; margin: 25px 0; border-left: 4px solid #0ea5e9;">
              <h2 style="color: #0369a1; margin: 0 0 20px 0; font-size: 20px;">📋 Retreat Details</h2>
              <table style="width: 100%; border-collapse: collapse;">
                <tr><td style="padding: 8px 0; color: #64748b;">Retreat:</td><td style="padding: 8px 0; color: #1e293b; font-weight: 600;">${booking.retreatName}</td></tr>
                <tr><td style="padding: 8px 0; color: #64748b;">Location:</td><td style="padding: 8px 0; color: #1e293b; font-weight: 600;">${booking.retreatLocation}</td></tr>
                <tr><td style="padding: 8px 0; color: #64748b;">Duration:</td><td style="padding: 8px 0; color: #1e293b; font-weight: 600;">${booking.retreatDuration}</td></tr>
                <tr><td style="padding: 8px 0; color: #64748b;">Guests:</td><td style="padding: 8px 0; color: #1e293b; font-weight: 600;">${booking.numberOfGuests}</td></tr>
                <tr><td style="padding: 8px 0; color: #64748b;">Total Price:</td><td style="padding: 8px 0; color: #0ea5e9; font-weight: 700; font-size: 18px;">$${totalPrice.toLocaleString()}</td></tr>
                ${booking.paymentStatus ? `<tr><td style="padding: 8px 0; color: #64748b;">Payment:</td><td style="padding: 8px 0; color: #10b981; font-weight: 600;">✓ ${booking.paymentStatus}</td></tr>` : ''}
                ${booking.specialRequests ? `<tr><td style="padding: 8px 0; color: #64748b; vertical-align: top;">Special Requests:</td><td style="padding: 8px 0; color: #1e293b;">${booking.specialRequests}</td></tr>` : ''}
              </table>
            </div>
            
            <div style="background: #fef3c7; padding: 20px; border-radius: 12px; margin: 25px 0;">
              <h3 style="color: #92400e; margin: 0 0 10px 0; font-size: 16px;">📞 What's Next?</h3>
              <p style="color: #78350f; margin: 0; line-height: 1.6;">Our team will contact you within 24 hours to finalize your booking details and answer any questions.</p>
            </div>
            
            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
              <p style="color: #64748b; font-size: 14px; margin: 0;">Questions? Contact us anytime!</p>
              <a href="https://wa.me/23058461923" style="display: inline-block; margin-top: 15px; background: #25D366; color: white; padding: 12px 25px; border-radius: 25px; text-decoration: none; font-weight: 600;">💬 WhatsApp Us</a>
            </div>
            
            <p style="color: #94a3b8; font-size: 12px; text-align: center; margin-top: 30px;">
              Best regards,<br>
              <strong style="color: #64748b;">The Retreats Holidays Team</strong>
            </p>
          </div>
        </body>
        </html>
      `,
    });

    console.log("Customer email sent:", customerEmailResponse);

    // Send notification email to admin
    const adminEmailResponse = await resend.emails.send({
      from: "Retreats Holidays <onboarding@resend.dev>",
      to: [ADMIN_EMAIL],
      subject: `🔔 New Booking: ${booking.retreatName} - ${booking.customerName}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
        </head>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: #1e293b; padding: 20px; border-radius: 12px 12px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 20px;">🔔 New Booking Received</h1>
          </div>
          
          <div style="background: white; padding: 25px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 12px 12px;">
            <h2 style="color: #0ea5e9; margin-top: 0;">Customer Information</h2>
            <ul style="list-style: none; padding: 0; color: #334155;">
              <li style="padding: 8px 0; border-bottom: 1px solid #f1f5f9;"><strong>Name:</strong> ${booking.customerName}</li>
              <li style="padding: 8px 0; border-bottom: 1px solid #f1f5f9;"><strong>Email:</strong> <a href="mailto:${booking.customerEmail}">${booking.customerEmail}</a></li>
              <li style="padding: 8px 0; border-bottom: 1px solid #f1f5f9;"><strong>Phone:</strong> <a href="tel:${booking.customerPhone}">${booking.customerPhone}</a></li>
            </ul>
            
            <h2 style="color: #0ea5e9;">Booking Details</h2>
            <ul style="list-style: none; padding: 0; color: #334155;">
              <li style="padding: 8px 0; border-bottom: 1px solid #f1f5f9;"><strong>Retreat:</strong> ${booking.retreatName}</li>
              <li style="padding: 8px 0; border-bottom: 1px solid #f1f5f9;"><strong>Location:</strong> ${booking.retreatLocation}</li>
              <li style="padding: 8px 0; border-bottom: 1px solid #f1f5f9;"><strong>Duration:</strong> ${booking.retreatDuration}</li>
              <li style="padding: 8px 0; border-bottom: 1px solid #f1f5f9;"><strong>Guests:</strong> ${booking.numberOfGuests}</li>
              <li style="padding: 8px 0; border-bottom: 1px solid #f1f5f9;"><strong>Total Price:</strong> <span style="color: #10b981; font-weight: bold;">$${totalPrice.toLocaleString()}</span></li>
              ${booking.paymentStatus ? `<li style="padding: 8px 0; border-bottom: 1px solid #f1f5f9;"><strong>Payment Status:</strong> <span style="color: #10b981;">✓ ${booking.paymentStatus}</span></li>` : ''}
              ${booking.specialRequests ? `<li style="padding: 8px 0;"><strong>Special Requests:</strong> ${booking.specialRequests}</li>` : ''}
            </ul>
            
            <div style="margin-top: 20px; padding: 15px; background: #f0fdf4; border-radius: 8px;">
              <p style="margin: 0; color: #166534;"><strong>Action Required:</strong> Contact the customer within 24 hours to confirm booking.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    console.log("Admin email sent:", adminEmailResponse);

    return new Response(JSON.stringify({ 
      success: true,
      message: "Booking confirmed and emails sent successfully!",
      booking: {
        customer: booking.customerName,
        retreat: booking.retreatName,
        total: totalPrice
      }
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error processing booking:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
