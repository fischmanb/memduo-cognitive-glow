import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.2";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ApprovalEmailRequest {
  waitlistSubmissionId: string;
  firstName: string;
  lastName: string;
  email: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { waitlistSubmissionId, firstName, lastName, email }: ApprovalEmailRequest = await req.json();
    
    console.log('Processing approval email for:', { waitlistSubmissionId, email });

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Generate a secure setup token
    const setupToken = crypto.randomUUID();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days from now

    // Insert into approved_users table
    const { data: approvedUser, error: insertError } = await supabase
      .from('approved_users')
      .insert({
        waitlist_submission_id: waitlistSubmissionId,
        setup_token: setupToken,
        expires_at: expiresAt.toISOString(),
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error creating approved user record:', insertError);
      throw new Error('Failed to create setup token');
    }

    console.log('Created approved user record:', approvedUser);

    // Create account setup URL
    const setupUrl = `${req.headers.get('origin') || 'https://memduo.com'}/setup?token=${setupToken}`;

    // Send approval email
    const emailResponse = await resend.emails.send({
      from: "MemDuo <noreply@memduo.com>",
      to: [email],
      subject: "Welcome to MemDuo - Set up your account",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Welcome to MemDuo</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .button { 
              display: inline-block; 
              padding: 12px 24px; 
              background-color: #007bff; 
              color: white; 
              text-decoration: none; 
              border-radius: 6px; 
              margin: 20px 0;
            }
            .footer { margin-top: 30px; font-size: 14px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Welcome to MemDuo!</h1>
            </div>
            
            <p>Hi ${firstName},</p>
            
            <p>Congratulations! Your application to join MemDuo has been approved. We're excited to have you on board!</p>
            
            <p>To complete your registration and set up your account, please click the button below:</p>
            
            <div style="text-align: center;">
              <a href="${setupUrl}" class="button">Set Up Your Account</a>
            </div>
            
            <p>Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all; background: #f5f5f5; padding: 10px; border-radius: 4px;">
              ${setupUrl}
            </p>
            
            <p><strong>Important:</strong> This link will expire in 7 days for security purposes.</p>
            
            <p>If you have any questions or need assistance, please don't hesitate to reach out to our support team.</p>
            
            <p>Best regards,<br>The MemDuo Team</p>
            
            <div class="footer">
              <p>This email was sent because your application to MemDuo was approved. If you didn't apply, please ignore this email.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    console.log("Approval email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ 
      success: true, 
      setupToken,
      emailResponse 
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-approval-email function:", error);
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