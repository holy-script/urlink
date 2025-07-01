import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.0';

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface BrevoEmailRequest {
  subject: string;
  htmlContent: string;
  sender: {
    name: string;
    email: string;
  };
  to: Array<{
    email: string;
    name?: string;
  }>;
}

async function sendBrevoEmail(emailData: BrevoEmailRequest): Promise<any> {
  const BREVO_API_KEY = Deno.env.get('BREVO_API_KEY');

  if (!BREVO_API_KEY) {
    throw new Error('BREVO_API_KEY environment variable is not set');
  }

  const response = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'api-key': BREVO_API_KEY,
    },
    body: JSON.stringify(emailData),
  });

  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(`Brevo API error: ${response.status} - ${errorData}`);
  }

  return await response.json();
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    console.log('Function invoked, method:', req.method);

    // Validate request method
    if (req.method !== 'POST') {
      throw new Error('Method not allowed. Only POST requests are accepted.');
    }

    // Get environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing required environment variables');
    }

    // Get authorization header for user verification
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header provided');
    }

    console.log('Auth header found');

    // Initialize Supabase client with service role (bypasses RLS)
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // Initialize regular client for user verification
    const supabaseAuth = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY')!);

    // Get and verify user using regular client
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser(token);

    if (authError) {
      console.error('Auth error:', authError);
      throw new Error(`Authentication failed: ${authError.message}`);
    }

    if (!user) {
      throw new Error('No user found');
    }

    console.log('User authenticated:', user.id);

    // Parse request body
    let requestBody;
    try {
      requestBody = await req.json();
      console.log('Request body:', requestBody);
    } catch (parseError) {
      console.error('Body parse error:', parseError);
      throw new Error('Invalid JSON in request body');
    }

    // Validate email parameter
    const { email } = requestBody;
    if (!email) {
      throw new Error('Email parameter is required');
    }

    // Verify email belongs to authenticated user
    if (user.email !== email) {
      throw new Error('Email does not match authenticated user');
    }

    console.log('Email validation passed');

    // Check if already verified using admin client (bypasses RLS)
    console.log('Checking user verification status...');
    const { data: userData, error: userFetchError } = await supabaseAdmin
      .from('users')
      .select('is_email_verified')
      .eq('id', user.id)
      .single();

    if (userFetchError) {
      console.error('User fetch error:', userFetchError);
      // If users table doesn't exist or has issues, skip verification check
      console.log('Skipping verification check due to table access issues');
    } else if (userData?.is_email_verified) {
      return new Response(
        JSON.stringify({
          error: 'Email is already verified',
          message: 'Your email address is already confirmed.'
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log('User email verification check passed');

    // Generate verification link using admin client
    const { data: verificationData, error: verificationError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'signup',
      email: user.email!,
      options: {
        redirectTo: `${Deno.env.get('SITE_URL') || 'http://localhost:3000'}/auth/callback?verified=true`
      }
    });

    if (verificationError) {
      console.error('Verification link error:', verificationError);
      throw new Error(`Failed to generate verification link: ${verificationError.message}`);
    }

    console.log('Verification link generated');

    // Check Brevo environment variables
    const fromName = Deno.env.get('FROM_NAME') || 'SmartURLink';
    const fromEmail = Deno.env.get('FROM_EMAIL') || 'noreply@smarturlink.com';

    // Prepare email content
    const emailData: BrevoEmailRequest = {
      subject: 'Please verify your email address',
      htmlContent: `
        <html>
          <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #5e17eb; margin-bottom: 10px;">Verify Your Email</h1>
              <p style="color: #666; font-size: 16px;">Please confirm your email address to complete your account setup.</p>
            </div>
            
            <div style="background-color: #f9f9f9; padding: 30px; border-radius: 8px; margin-bottom: 30px;">
              <p style="margin: 0 0 20px 0; color: #333; font-size: 16px;">Hi there,</p>
              <p style="margin: 0 0 20px 0; color: #333; font-size: 16px;">
                Thanks for signing up! To complete your account setup, please verify your email address by clicking the button below:
              </p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${verificationData.properties?.action_link}" 
                   style="background-color: #5e17eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                  Verify Email Address
                </a>
              </div>
              
              <p style="margin: 20px 0 0 0; color: #666; font-size: 14px;">
                If the button doesn't work, you can copy and paste this link into your browser:
              </p>
              <p style="margin: 5px 0 0 0; color: #5e17eb; font-size: 14px; word-break: break-all;">
                ${verificationData.properties?.action_link}
              </p>
            </div>
            
            <div style="text-align: center; color: #666; font-size: 12px;">
              <p>This verification link will expire in 24 hours.</p>
              <p>If you didn't request this email, you can safely ignore it.</p>
            </div>
          </body>
        </html>
      `,
      sender: {
        name: fromName,
        email: fromEmail,
      },
      to: [
        {
          email: user.email!,
          name: user.user_metadata?.name || user.email!.split('@')[0],
        },
      ],
    };

    console.log('Sending email via Brevo...');

    // Send email using Brevo
    const brevoResponse = await sendBrevoEmail(emailData);

    console.log('Email sent successfully:', brevoResponse.messageId);

    return new Response(
      JSON.stringify({
        message: 'Verification email sent successfully',
        messageId: brevoResponse.messageId,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Function error:', error);

    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

    return new Response(
      JSON.stringify({
        error: 'Failed to send verification email',
        message: errorMessage,
        details: error instanceof Error ? error.stack : undefined
      }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
