
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.2";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface WaitlistSubmission {
  first_name: string;
  last_name: string;
  email: string;
  interest?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { first_name, last_name, email, interest }: WaitlistSubmission = await req.json();

    console.log("Processing waitlist notification for:", email);

    // Send notification email
    const emailResponse = await resend.emails.send({
      from: "MemDuo Notifications <onboarding@resend.dev>", // Change this to your verified domain
      to: ["your-email@example.com"], // Replace with your actual email
      subject: "New MemDuo Waitlist Submission",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #68d5c4; margin-bottom: 20px;">New Waitlist Submission</h2>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h3 style="margin-top: 0; color: #333;">Contact Information</h3>
            <p><strong>Name:</strong> ${first_name} ${last_name}</p>
            <p><strong>Email:</strong> ${email}</p>
          </div>
          
          ${interest ? `
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px;">
              <h3 style="margin-top: 0; color: #333;">Their Interest</h3>
              <p style="line-height: 1.6;">${interest}</p>
            </div>
          ` : ''}
          
          <p style="color: #666; font-size: 14px; margin-top: 30px;">
            This notification was sent automatically when someone joined your waitlist.
          </p>
        </div>
      `,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error sending notification email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
