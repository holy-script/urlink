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

async function sendBrevoEmail(emailData: BrevoEmailRequest): Promise<Record<string, unknown>> {
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

// Generate JWT token without external dependency
async function generateJWT(payload: Record<string, unknown>, secret: string, expiresIn: number): Promise<string> {
  const header = { alg: 'HS256', typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  const exp = now + expiresIn; // expires in seconds

  const jwtPayload = { ...payload, iat: now, exp };

  const encoder = new TextEncoder();
  const headerB64 = btoa(JSON.stringify(header)).replace(/[+/]/g, (c) => ({ '+': '-', '/': '_' }[c]!)).replace(/=/g, '');
  const payloadB64 = btoa(JSON.stringify(jwtPayload)).replace(/[+/]/g, (c) => ({ '+': '-', '/': '_' }[c]!)).replace(/=/g, '');

  const data = `${headerB64}.${payloadB64}`;
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(data));
  const signatureB64 = btoa(String.fromCharCode(...new Uint8Array(signature)))
    .replace(/[+/]/g, (c) => ({ '+': '-', '/': '_' }[c]!)).replace(/=/g, '');

  return `${data}.${signatureB64}`;
}

serve(async (req: Request) => {
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
    const jwtSecret = Deno.env.get('EMAIL_VERIFICATION_JWT_SECRET');

    if (!supabaseUrl || !supabaseServiceKey || !jwtSecret) {
      throw new Error('Missing required environment variables');
    }

    // Get authorization header for user verification
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header provided');
    }

    console.log('Auth header found');

    // Initialize Supabase admin client (bypasses RLS)
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // Verify user token using admin client
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      throw new Error('Authentication failed');
    }

    console.log('User authenticated:', user.id);

    // Parse request body
    const { email } = await req.json();

    if (!email || user.email !== email) {
      throw new Error('Invalid email parameter');
    }

    console.log('Email validation passed');

    // Get user data from users table using admin client
    const { data: userData, error: userFetchError } = await supabaseAdmin
      .from('users')
      .select('is_email_verified, name')
      .eq('email', email)
      .single();

    if (userFetchError) {
      console.error('User fetch error:', userFetchError);
      throw new Error(`Failed to fetch user data: ${userFetchError.message}`);
    }

    if (userData?.is_email_verified) {
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

    // Generate verification JWT token (valid for 24 hours)
    const verificationPayload = {
      userId: user.id,
      email: user.email,
      purpose: 'email_verification'
    };

    const verificationToken = await generateJWT(verificationPayload, jwtSecret, 24 * 60 * 60); // 24 hours

    // Create verification URL
    const siteUrl = Deno.env.get('SITE_URL') || 'http://localhost:3000';
    const verificationUrl = `${siteUrl}/api/verify-email?token=${verificationToken}`;

    console.log('Verification token generated');

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
              <p style="margin: 0 0 20px 0; color: #333; font-size: 16px;">Hi ${userData?.name || 'there'},</p>
              <p style="margin: 0 0 20px 0; color: #333; font-size: 16px;">
                Please verify your email address by clicking the button below:
              </p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${verificationUrl}" 
                   style="background-color: #5e17eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                  Verify Email Address
                </a>
              </div>
              
              <p style="margin: 20px 0 0 0; color: #666; font-size: 14px;">
                If the button doesn't work, you can copy and paste this link into your browser:
              </p>
              <p style="margin: 5px 0 0 0; color: #5e17eb; font-size: 14px; word-break: break-all;">
                ${verificationUrl}
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
        name: Deno.env.get('FROM_NAME') || 'SmartURLink',
        email: Deno.env.get('FROM_EMAIL') || 'noreply@smarturlink.com',
      },
      to: [
        {
          email: user.email!,
          name: userData?.name || user.email!.split('@')[0],
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
        message: errorMessage
      }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
