import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Helper function to get client IP
function getClientIP(req: Request): string | null {
  const xForwardedFor = req.headers.get('x-forwarded-for');
  if (xForwardedFor) {
    return xForwardedFor.split(',')[0].trim();
  }
  return null;
}

// Helper function to get location from IP
async function getLocationFromIP(ip: string): Promise<{ country_code?: string; city?: string; }> {
  try {
    // You can use a free IP geolocation service
    const response = await fetch(`http://ip-api.com/json/${ip}`);
    const data = await response.json();

    return {
      country_code: data.countryCode,
      city: data.city
    };
  } catch (error) {
    console.error('Error getting location:', error);
    return {};
  }
}

// Helper function to detect device type from User-Agent
function detectDeviceType(userAgent: string): 'android' | 'ios' | 'web' {
  const ua = userAgent.toLowerCase();

  if (ua.includes('android')) {
    return 'android';
  } else if (ua.includes('iphone') || ua.includes('ipad') || ua.includes('ios')) {
    return 'ios';
  } else {
    return 'web';
  }
}

// Helper function to determine redirect type and URL
function getRedirectInfo(link: any, deviceType: 'android' | 'ios' | 'web') {
  switch (deviceType) {
    case 'android':
      return {
        url: link.android_deeplink || link.original_url,
        redirect_type: link.android_deeplink ? 'deeplink' : 'fallback'
      };
    case 'ios':
      return {
        url: link.ios_deeplink || link.original_url,
        redirect_type: link.ios_deeplink ? 'deeplink' : 'fallback'
      };
    default:
      return {
        url: link.original_url,
        redirect_type: 'web'
      };
  }
}

serve(async (req: Request) => {
  // Only handle GET requests
  if (req.method !== 'GET') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    // Initialize Supabase client with service role key to bypass RLS
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Parse URL to get platform and short_code
    const url = new URL(req.url);
    const pathParts = url.pathname.split('/').filter(part => part.length > 0);

    // Expecting URL format: /platform/short_code
    if (pathParts.length !== 2) {
      return new Response('Invalid URL format', { status: 400 });
    }

    const [platform, shortCode] = pathParts;

    // Find the link in database
    const { data: link, error: linkError } = await supabase
      .from('links')
      .select(`
        id,
        user_id,
        original_url,
        android_deeplink,
        ios_deeplink,
        platform,
        is_active,
        deleted_at
      `)
      .eq('platform', platform)
      .eq('short_code', shortCode)
      .eq('is_active', true)
      .is('deleted_at', null)
      .single();

    if (linkError || !link) {
      console.error('Link not found:', linkError);
      return new Response('Link not found', { status: 404 });
    }

    // Check if user has available clicks
    const { data: canClick, error: canClickError } = await supabase.rpc(
      'can_user_perform_click',
      { p_user_id: link.user_id }
    );

    if (canClickError) {
      console.error('Error checking click eligibility:', canClickError);
      return new Response('Error processing request', { status: 500 });
    }

    if (!canClick) {
      // Redirect to a "quota exceeded" page or return error
      return new Response(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Click Limit Reached</title>
          <style>
            body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
            .container { max-width: 500px; margin: 0 auto; }
            h1 { color: #e74c3c; }
            p { color: #666; line-height: 1.6; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>Click Limit Reached</h1>
            <p>The owner of this link has reached their monthly click limit. Please try again next month.</p>
          </div>
        </body>
        </html>
      `, {
        status: 429,
        headers: { 'Content-Type': 'text/html' }
      });
    }

    // Get client information
    const clientIP = getClientIP(req);
    const userAgent = req.headers.get('user-agent') || '';
    const referrer = req.headers.get('referer') || '';
    const deviceType = detectDeviceType(userAgent);

    // Get location data
    let locationData = {};
    if (clientIP) {
      locationData = await getLocationFromIP(clientIP);
    }

    // Increment user's click count
    const { error: incrementError } = await supabase.rpc(
      'increment_user_click_count',
      { p_user_id: link.user_id }
    );

    if (incrementError) {
      console.error('Error incrementing click count:', incrementError);
      // Continue anyway - don't block the redirect
    }

    // Log the click event
    const { error: logError } = await supabase
      .from('link_clicks')
      .insert({
        link_id: link.id,
        ip_address: clientIP,
        user_agent: userAgent,
        referrer_url: referrer,
        country_code: locationData.country_code || null,
        device_type: deviceType,
        redirect_type: null // Will be updated below
      });

    if (logError) {
      console.error('Error logging click:', logError);
      // Continue anyway - don't block the redirect
    }

    // Determine redirect URL based on device type
    const redirectInfo = getRedirectInfo(link, deviceType);

    // Update the click log with redirect type (optional)
    if (!logError) {
      await supabase
        .from('link_clicks')
        .update({ redirect_type: redirectInfo.redirect_type })
        .eq('link_id', link.id)
        .eq('ip_address', clientIP)
        .order('clicked_at', { ascending: false })
        .limit(1);
    }

    // Perform the redirect
    return Response.redirect(redirectInfo.url, 302);

  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
});
