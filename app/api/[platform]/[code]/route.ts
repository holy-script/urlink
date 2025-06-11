// app/api/[platform]/[code]/route.ts
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

// Types based on your SQL schema
type PlatformEnum = 'youtube' | 'instagram' | 'facebook' | 'tiktok' | 'google-maps' | 'amazon';
type DeviceType = 'mobile' | 'tablet' | 'desktop';
type RedirectType = 'android_deeplink' | 'ios_deeplink' | 'web_fallback';

interface LinkData {
    id: string;
    user_id: string;
    original_url: string;
    android_deeplink: string | null;
    ios_deeplink: string | null;
    platform: PlatformEnum;
    short_code: string;
    title: string | null;
    is_active: boolean;
    deleted_at: string | null;
    created_at: string;
    updated_at: string;
}

interface DeviceInfo {
    type: DeviceType;
    platform: 'android' | 'ios' | 'web';
    isAndroid: boolean;
    isiOS: boolean;
    isMobile: boolean;
    isTablet: boolean;
}

interface ClickData {
    link_id: string;
    ip_address: string | null;
    user_agent: string | null;
    referrer_url: string | null;
    country_code: string | null;
    device_type: string;
    redirect_type: RedirectType;
}

// Create admin client with explicit service role configuration
function createAdminClient(): SupabaseClient {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

    console.log('🔧 Creating admin client:');
    console.log('  - URL:', supabaseUrl);
    console.log('  - Service key length:', serviceRoleKey.length);
    console.log('  - Service key prefix:', serviceRoleKey.substring(0, 20));

    return createClient(supabaseUrl, serviceRoleKey, {
        auth: {
            persistSession: false,
            autoRefreshToken: false,
        },
        db: {
            schema: 'public'
        },
        global: {
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey
            }
        }
    });
}

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ platform: string; code: string; }>; }
) {
    console.log('🚀 === URLINK REDIRECT API STARTED ===');
    console.log('🎯 Platform: Deep Link Generation & Pay-per-Click Analytics');

    // Environment validation
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
        console.error('❌ Missing environment variables');
        return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    const supabase = createAdminClient();
    const resolvedParams = await params;
    const { platform, code } = resolvedParams;

    console.log('📥 Request details:');
    console.log('  - Platform:', platform);
    console.log('  - Short code:', code);
    console.log('  - URL:', request.url);
    console.log('  - User-Agent:', request.headers.get('user-agent')?.substring(0, 100));
    console.log('  - Referer:', request.headers.get('referer'));

    // Validate platform against your enum
    const supportedPlatforms: PlatformEnum[] = ['youtube', 'instagram', 'facebook', 'tiktok', 'google-maps', 'amazon'];

    if (!supportedPlatforms.includes(platform as PlatformEnum)) {
        console.log('❌ Unsupported platform:', platform);
        return NextResponse.json({
            error: 'Unsupported platform',
            supported: supportedPlatforms,
            received: platform
        }, { status: 400 });
    }

    console.log('✅ Platform validation passed');

    try {
        console.log('🔍 === DATABASE OPERATIONS ===');

        // Step 1: Fetch link using the public policy for redirection
        console.log('📋 Querying links table with public policy...');

        const { data: linkData, error: fetchError } = await supabase
            .from('links')
            .select(`
        id,
        user_id,
        original_url,
        android_deeplink,
        ios_deeplink,
        platform,
        short_code,
        title,
        is_active,
        deleted_at,
        created_at,
        updated_at
      `)
            .eq('platform', platform)
            .eq('short_code', code)
            .eq('is_active', true)
            .is('deleted_at', null)
            .single();

        console.log('📊 Link query result:');
        console.log('  - Success:', !fetchError);
        console.log('  - Data found:', !!linkData);
        console.log('  - Error:', fetchError?.message || 'none');
        console.log('  - Error code:', fetchError?.code || 'none');

        // Handle database errors
        if (fetchError) {
            console.log(fetchError);
            if (fetchError.code === 'PGRST116') {
                console.log('📝 No matching active link found');
                return NextResponse.json({
                    error: 'Link not found or inactive',
                    platform,
                    code
                }, { status: 404 });
            }

            // Log permission error details
            if (fetchError.code === '42501') {
                console.error('🔒 Permission denied - RLS policy issue:');
                console.error('  - Code:', fetchError.code);
                console.error('  - Message:', fetchError.message);
                console.error('  - Details:', fetchError.details);
                console.error('  - Hint:', fetchError.hint);

                return NextResponse.json({
                    error: 'Database access denied',
                    debug: {
                        code: fetchError.code,
                        message: fetchError.message,
                        serviceKeyExists: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
                        serviceKeyLength: process.env.SUPABASE_SERVICE_ROLE_KEY?.length
                    }
                }, { status: 500 });
            }

            console.error('❌ Database query failed:', fetchError);
            return NextResponse.json({
                error: 'Database query failed',
                details: fetchError.message,
                code: fetchError.code
            }, { status: 500 });
        }

        if (!linkData) {
            console.log('❌ Link data is null');
            return NextResponse.json({ error: 'Link not found' }, { status: 404 });
        }

        const link = linkData as LinkData;
        console.log('✅ Link found successfully:');
        console.log('  - Link ID:', link.id);
        console.log('  - User ID:', link.user_id);
        console.log('  - Platform:', link.platform);
        console.log('  - Original URL:', link.original_url);
        console.log('  - Has Android deep link:', !!link.android_deeplink);
        console.log('  - Has iOS deep link:', !!link.ios_deeplink);

        // Step 2: Check user click limits (500 free clicks model from your project doc)
        console.log('🔍 === USER CLICK LIMIT CHECK ===');
        console.log('👤 Checking limits for user:', link.user_id);

        const { data: canClick, error: usageError } = await supabase
            .rpc('can_user_perform_click', { p_user_id: link.user_id });

        console.log('📊 Usage check result:');
        console.log('  - Can perform click:', canClick);
        console.log('  - Usage error:', usageError?.message || 'none');

        if (usageError) {
            console.error('⚠️ Usage check failed:', usageError);
            // Continue with redirect but don't increment usage
        }

        // Step 3: Device detection for deep link routing
        console.log('🔍 === DEVICE DETECTION ===');
        const userAgent = request.headers.get('user-agent') || '';
        const deviceInfo = detectDevice(userAgent);

        console.log('📱 Device analysis:');
        console.log('  - Type:', deviceInfo.type);
        console.log('  - Platform:', deviceInfo.platform);
        console.log('  - Is Android:', deviceInfo.isAndroid);
        console.log('  - Is iOS:', deviceInfo.isiOS);
        console.log('  - Is Mobile:', deviceInfo.isMobile);

        // Step 4: Deep link routing decision
        console.log('🔍 === DEEP LINK ROUTING ===');
        const redirectUrl = determineRedirectUrl(link, deviceInfo, userAgent);
        const redirectType = getRedirectType(link, deviceInfo);

        console.log('🎯 Redirect decision:');
        console.log('  - Final URL:', redirectUrl);
        console.log('  - Redirect type:', redirectType);
        console.log('  - Strategy:', getRedirectStrategy(link, deviceInfo));

        // Step 5: Record click analytics
        console.log('🔍 === ANALYTICS RECORDING ===');
        const clientIP = getClientIP(request);

        const clickData: ClickData = {
            link_id: link.id,
            ip_address: clientIP,
            user_agent: userAgent,
            referrer_url: request.headers.get('referer'),
            country_code: null, // Can integrate IP geolocation service
            device_type: deviceInfo.type,
            redirect_type: redirectType
        };

        console.log('📝 Recording click data:');
        console.log('  - Link ID:', clickData.link_id);
        console.log('  - IP:', clientIP);
        console.log('  - Device type:', clickData.device_type);
        console.log('  - Redirect type:', clickData.redirect_type);

        const { error: clickError } = await supabase
            .from('link_clicks')
            .insert(clickData);

        if (clickError) {
            console.error('⚠️ Click tracking failed:', clickError);
            // Continue with redirect even if analytics fails
        } else {
            console.log('✅ Click analytics recorded successfully');
        }

        // Step 6: Update user usage (pay-per-click model)
        console.log('🔍 === USAGE INCREMENT ===');
        if (canClick) {
            console.log('💰 User within limits, incrementing click count...');

            const { data: incrementResult, error: incrementError } = await supabase
                .rpc('increment_user_click_count', { p_user_id: link.user_id });

            console.log('📊 Usage increment result:');
            console.log('  - Success:', incrementResult);
            console.log('  - Error:', incrementError?.message || 'none');

            if (incrementError) {
                console.error('⚠️ Failed to increment usage:', incrementError);
            } else {
                console.log('✅ User click count incremented (pay-per-click)');
            }
        } else {
            console.log('🚫 User at click limit - redirect continues but no usage increment');
        }

        // Step 7: Execute redirect
        console.log('🔍 === FINAL REDIRECT ===');
        console.log('🎯 Redirecting user to:', redirectUrl);
        console.log('📊 Using HTTP 307 (Temporary Redirect)');
        console.log('✅ === URLINK REDIRECT COMPLETED ===');

        return NextResponse.redirect(redirectUrl, { status: 307 });

    } catch (error) {
        console.error('💥 === CRITICAL ROUTE ERROR ===');
        console.error('💥 Error type:', error?.constructor?.name);
        console.error('💥 Error message:', error instanceof Error ? error.message : 'Unknown error');
        console.error('💥 Error stack:', error instanceof Error ? error.stack : 'No stack');
        console.error('💥 Context:', { platform, code, url: request.url });

        return NextResponse.json({
            error: 'Internal server error',
            timestamp: new Date().toISOString(),
            platform,
            code
        }, { status: 500 });
    }
}

// Helper function: Extract real client IP
function getClientIP(request: NextRequest): string {
    const headers = {
        forwarded: request.headers.get('x-forwarded-for'),
        realIP: request.headers.get('x-real-ip'),
        cfIP: request.headers.get('cf-connecting-ip'), // Cloudflare
        trueClientIP: request.headers.get('true-client-ip') // Cloudflare Enterprise
    };

    // Priority order for IP extraction
    if (headers.forwarded) {
        return headers.forwarded.split(',')[0].trim();
    }
    if (headers.realIP) {
        return headers.realIP;
    }
    if (headers.cfIP) {
        return headers.cfIP;
    }
    if (headers.trueClientIP) {
        return headers.trueClientIP;
    }

    return '127.0.0.1'; // Fallback
}

// Helper function: Advanced device detection
function detectDevice(userAgent: string): DeviceInfo {
    const ua = userAgent.toLowerCase();

    // Platform detection
    const isAndroid = ua.includes('android');
    const isiOS = /iphone|ipad|ipod/.test(ua);
    const isMobile = isAndroid || isiOS || /mobile|android|iphone|ipod|blackberry|iemobile|opera mini/i.test(ua);
    const isTablet = /tablet|ipad|playbook|silk/i.test(ua);

    // Device type classification
    let type: DeviceType = 'desktop';
    if (isTablet) {
        type = 'tablet';
    } else if (isMobile) {
        type = 'mobile';
    }

    return {
        type,
        platform: isAndroid ? 'android' : isiOS ? 'ios' : 'web',
        isAndroid,
        isiOS,
        isMobile,
        isTablet
    };
}

// Helper function: Smart deep link routing
function determineRedirectUrl(linkData: LinkData, deviceInfo: DeviceInfo, userAgent: string): string {
    // Priority 1: Android deep link for Android devices with app
    if (deviceInfo.isAndroid && linkData.android_deeplink) {
        const hasApp = hasAppInstalled(linkData.platform, userAgent);
        if (hasApp) {
            return linkData.android_deeplink;
        }
    }

    // Priority 2: iOS deep link for iOS devices with app
    if (deviceInfo.isiOS && linkData.ios_deeplink) {
        const hasApp = hasAppInstalled(linkData.platform, userAgent);
        if (hasApp) {
            return linkData.ios_deeplink;
        }
    }

    // Fallback: Original web URL
    return linkData.original_url;
}

// Helper function: Get redirect type for analytics
function getRedirectType(linkData: LinkData, deviceInfo: DeviceInfo): RedirectType {
    if (deviceInfo.isAndroid && linkData.android_deeplink) return 'android_deeplink';
    if (deviceInfo.isiOS && linkData.ios_deeplink) return 'ios_deeplink';
    return 'web_fallback';
}

// Helper function: Get human-readable redirect strategy
function getRedirectStrategy(linkData: LinkData, deviceInfo: DeviceInfo): string {
    if (deviceInfo.isAndroid && linkData.android_deeplink) return 'Android app deep link';
    if (deviceInfo.isiOS && linkData.ios_deeplink) return 'iOS app deep link';
    return 'Web browser fallback';
}

// Helper function: App installation detection based on user agent
function hasAppInstalled(platform: PlatformEnum, userAgent: string): boolean {
    const ua = userAgent.toLowerCase();

    // App signature detection for each platform
    const appSignatures: Record<PlatformEnum, string[]> = {
        'instagram': ['instagram', 'fbav'], // Facebook app also handles Instagram
        'youtube': ['youtube'],
        'facebook': ['fbav', 'facebook'],
        'tiktok': ['tiktok', 'musical_ly'],
        'amazon': ['amazon'],
        'google-maps': ['googlemaps', 'maps'] // Most devices have Maps
    };

    const signatures = appSignatures[platform] || [];
    const detected = signatures.some(sig => ua.includes(sig));

    // Special case: Google Maps is usually available on mobile devices
    if (platform === 'google-maps') {
        return true; // Assume Maps is available
    }

    return detected;
}
