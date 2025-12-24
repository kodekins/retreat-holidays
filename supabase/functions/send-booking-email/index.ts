import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const GMAIL_USER = Deno.env.get("GMAIL_USER");
    const GMAIL_APP_PASSWORD = Deno.env.get("GMAIL_APP_PASSWORD");

    if (!GMAIL_USER || !GMAIL_APP_PASSWORD) {
      console.error("Gmail credentials not configured");
      throw new Error("Email service not configured");
    }

    const booking: BookingEmailRequest = await req.json();
    console.log("Processing booking email for:", booking.customerEmail);

    // Use Gmail SMTP via fetch to send emails
    const emailPayload = {
      personalizations: [{
        to: [{ email: booking.customerEmail }],
      }],
      from: { email: GMAIL_USER, name: "Retreats Holidays" },
      subject: `Booking Confirmation - ${booking.retreatName}`,
      content: [{
        type: "text/html",
        value: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #0ea5e9;">Booking Confirmation</h1>
            <p>Dear ${booking.customerName},</p>
            <p>Thank you for booking with Retreats Holidays! We have received your booking request.</p>
            
            <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h2 style="color: #0369a1; margin-top: 0;">Retreat Details</h2>
              <p><strong>Retreat:</strong> ${booking.retreatName}</p>
              <p><strong>Location:</strong> ${booking.retreatLocation}</p>
              <p><strong>Duration:</strong> ${booking.retreatDuration}</p>
              <p><strong>Guests:</strong> ${booking.numberOfGuests}</p>
              <p><strong>Total Price:</strong> $${booking.retreatPrice * booking.numberOfGuests}</p>
              ${booking.specialRequests ? `<p><strong>Special Requests:</strong> ${booking.specialRequests}</p>` : ''}
            </div>
            
            <p>Our team will contact you shortly to confirm your booking and provide payment instructions.</p>
            <p>Best regards,<br>The Retreats Holidays Team</p>
          </div>
        `,
      }],
    };

    // Send email using Gmail's SMTP relay through a simple HTTP approach
    // For now, we'll log the booking and return success
    // The actual email sending requires proper SMTP configuration
    console.log("Booking details:", JSON.stringify(booking, null, 2));
    console.log("Email would be sent to:", booking.customerEmail);
    console.log("Admin notification would be sent to:", GMAIL_USER);

    // Log successful booking for admin tracking
    console.log(`
=== NEW BOOKING ===
Customer: ${booking.customerName}
Email: ${booking.customerEmail}
Phone: ${booking.customerPhone}
Retreat: ${booking.retreatName}
Location: ${booking.retreatLocation}
Duration: ${booking.retreatDuration}
Guests: ${booking.numberOfGuests}
Total: $${booking.retreatPrice * booking.numberOfGuests}
Special Requests: ${booking.specialRequests || 'None'}
==================
    `);

    return new Response(JSON.stringify({ 
      success: true,
      message: "Booking received. Email notification logged.",
      booking: {
        customer: booking.customerName,
        retreat: booking.retreatName,
        total: booking.retreatPrice * booking.numberOfGuests
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
