// app/api/[platform]/[code]/route.ts
import { createClient } from '@supabase/supabase-js';
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
    title: string | null;
    is_active: boolean;
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

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ platform: string; code: string; }>; }
) {
    console.log('🚀 === REDIRECT API ROUTE STARTED ===');

    const resolvedParams = await params;
    console.log('📥 Received params:', resolvedParams);

    const { platform, code } = resolvedParams;
    console.log('🔍 Extracted platform:', platform);
    console.log('🔍 Extracted code:', code);

    // Log all request headers for debugging
    console.log('📋 Request headers:');
    request.headers.forEach((value, key) => {
        console.log(`  ${key}: ${value}`);
    });

    // Validate platform
    const supportedPlatforms: PlatformEnum[] = ['youtube', 'instagram', 'facebook', 'tiktok', 'google-maps', 'amazon'];
    console.log('✅ Supported platforms:', supportedPlatforms);

    if (!supportedPlatforms.includes(platform as PlatformEnum)) {
        console.log('❌ Unsupported platform detected:', platform);
        return NextResponse.json({ error: 'Unsupported platform' }, { status: 400 });
    }

    console.log('✅ Platform validation passed');

    try {
        console.log('🔍 === DATABASE QUERY STARTING ===');

        // 1. Fetch the link from database
        const { data: linkData, error: fetchError } = await supabase
            .from('links')
            .select(`
        id,
        user_id,
        original_url,
        android_deeplink,
        ios_deeplink,
        platform,
        title,
        is_active
      `)
            .eq('platform', platform)
            .eq('short_code', code)
            .eq('is_active', true)
            .is('deleted_at', null)
            .single();

        console.log('📊 Database query completed');
        console.log('📊 Fetch error:', fetchError);
        console.log('📊 Link data received:', linkData);

        if (fetchError || !linkData) {
            console.error('❌ Link fetch failed:');
            console.error('  - Error:', fetchError);
            console.error('  - Data:', linkData);
            console.error('  - Query params: platform =', platform, ', code =', code);
            return NextResponse.json({ error: 'Link not found or inactive' }, { status: 404 });
        }

        const link = linkData as LinkData;
        console.log('✅ Link found and cast successfully:', link);

        // 2. Check if user can perform click (usage limits)
        console.log('🔍 === USAGE CHECK STARTING ===');
        console.log('👤 Checking usage for user_id:', link.user_id);

        const { data: canClick, error: usageError } = await supabase
            .rpc('can_user_perform_click', { p_user_id: link.user_id });

        console.log('📊 Usage check completed:');
        console.log('  - Can click:', canClick);
        console.log('  - Usage error:', usageError);

        if (usageError) {
            console.error('❌ Usage check error:', usageError);
        }

        // 3. Detect device type and user agent
        console.log('🔍 === DEVICE DETECTION STARTING ===');
        const userAgent = request.headers.get('user-agent') || '';
        console.log('📱 User agent:', userAgent);

        const deviceInfo = detectDevice(userAgent);
        console.log('📱 Device info detected:', deviceInfo);

        // 4. Determine redirect URL based on device
        console.log('🔍 === REDIRECT URL DETERMINATION ===');
        const redirectUrl = determineRedirectUrl(link, deviceInfo, userAgent);
        const redirectType = getRedirectType(link, deviceInfo);

        console.log('🎯 Redirect URL determined:', redirectUrl);
        console.log('🎯 Redirect type:', redirectType);

        // 5. Record the click
        console.log('🔍 === CLICK RECORDING STARTING ===');
        const clientIP = getClientIP(request);
        console.log('🌐 Client IP extracted:', clientIP);

        const clickData: ClickData = {
            link_id: link.id,
            ip_address: clientIP,
            user_agent: userAgent,
            referrer_url: request.headers.get('referer'),
            country_code: null, // You can add IP geolocation service here
            device_type: deviceInfo.type,
            redirect_type: redirectType
        };

        console.log('📝 Click data prepared:', clickData);

        const { error: clickError } = await supabase
            .from('link_clicks')
            .insert(clickData);

        console.log('📊 Click recording completed:');
        console.log('  - Click error:', clickError);

        if (clickError) {
            console.error('❌ Click tracking error:', clickError);
        } else {
            console.log('✅ Click recorded successfully');
        }

        // 6. Increment user click count (only if they can perform click)
        console.log('🔍 === USAGE INCREMENT STARTING ===');
        if (canClick) {
            console.log('✅ User can perform click, incrementing count...');

            const { error: incrementError } = await supabase
                .rpc('increment_user_click_count', { p_user_id: link.user_id });

            console.log('📊 Usage increment completed:');
            console.log('  - Increment error:', incrementError);

            if (incrementError) {
                console.error('❌ Usage increment error:', incrementError);
            } else {
                console.log('✅ Usage count incremented successfully');
            }
        } else {
            console.log('⚠️ User cannot perform click (limit reached or other issue)');
        }

        // 7. Redirect user
        console.log('🔍 === FINAL REDIRECT ===');
        console.log('🎯 Final redirect URL:', redirectUrl);
        console.log('🎯 Redirect status: 307');
        console.log('✅ === REDIRECT API ROUTE COMPLETED SUCCESSFULLY ===');

        return NextResponse.redirect(redirectUrl, { status: 307 });

    } catch (error) {
        console.error('💥 === CRITICAL ERROR IN REDIRECT HANDLER ===');
        console.error('💥 Error object:', error);
        console.error('💥 Error message:', error instanceof Error ? error.message : 'Unknown error');
        console.error('💥 Error stack:', error instanceof Error ? error.stack : 'No stack trace');
        console.error('💥 Request URL:', request.url);
        console.error('💥 Platform:', platform);
        console.error('💥 Code:', code);

        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// Helper functions with enhanced logging
function getClientIP(request: NextRequest): string {
    console.log('🔍 === IP EXTRACTION STARTING ===');

    // Try different headers in order of preference
    const forwarded = request.headers.get('x-forwarded-for');
    const realIP = request.headers.get('x-real-ip');
    const cfIP = request.headers.get('cf-connecting-ip'); // Cloudflare
    const trueClientIP = request.headers.get('true-client-ip'); // Cloudflare Enterprise

    console.log('🌐 IP Headers found:');
    console.log('  - x-forwarded-for:', forwarded);
    console.log('  - x-real-ip:', realIP);
    console.log('  - cf-connecting-ip:', cfIP);
    console.log('  - true-client-ip:', trueClientIP);

    let finalIP = '127.0.0.1';

    if (forwarded) {
        // x-forwarded-for can contain multiple IPs, take the first one
        finalIP = forwarded.split(',')[0].trim();
        console.log('🌐 Using x-forwarded-for IP:', finalIP);
    } else if (realIP) {
        finalIP = realIP;
        console.log('🌐 Using x-real-ip:', finalIP);
    } else if (cfIP) {
        finalIP = cfIP;
        console.log('🌐 Using cf-connecting-ip:', finalIP);
    } else if (trueClientIP) {
        finalIP = trueClientIP;
        console.log('🌐 Using true-client-ip:', finalIP);
    } else {
        console.log('🌐 Using fallback IP:', finalIP);
    }

    return finalIP;
}

function detectDevice(userAgent: string): DeviceInfo {
    console.log('🔍 === DEVICE DETECTION STARTING ===');
    console.log('📱 Input user agent:', userAgent);

    const ua = userAgent.toLowerCase();
    console.log('📱 Lowercase user agent:', ua);

    // Detect platform
    const isAndroid = ua.includes('android');
    const isiOS = ua.includes('iphone') || ua.includes('ipad') || ua.includes('ipod');
    const isMobile = isAndroid || isiOS || ua.includes('mobile');
    const isTablet = ua.includes('tablet') || ua.includes('ipad');

    console.log('📱 Device flags:');
    console.log('  - isAndroid:', isAndroid);
    console.log('  - isiOS:', isiOS);
    console.log('  - isMobile:', isMobile);
    console.log('  - isTablet:', isTablet);

    let type: DeviceType = 'desktop';
    if (isTablet) type = 'tablet';
    else if (isMobile) type = 'mobile';

    const deviceInfo: DeviceInfo = {
        type,
        platform: isAndroid ? 'android' : isiOS ? 'ios' : 'web',
        isAndroid,
        isiOS,
        isMobile,
        isTablet
    };

    console.log('📱 Final device info:', deviceInfo);
    return deviceInfo;
}

function determineRedirectUrl(linkData: LinkData, deviceInfo: DeviceInfo, userAgent: string): string {
    console.log('🔍 === REDIRECT URL DETERMINATION STARTING ===');
    console.log('🔗 Link data for redirect:', {
        android_deeplink: linkData.android_deeplink,
        ios_deeplink: linkData.ios_deeplink,
        original_url: linkData.original_url,
        platform: linkData.platform
    });
    console.log('📱 Device info for redirect:', deviceInfo);

    // Check if device supports deep linking
    if (deviceInfo.isAndroid && linkData.android_deeplink) {
        const appInstalled = hasAppInstalled(linkData.platform, userAgent);
        console.log('🤖 Android device with deeplink available');
        console.log('📱 App installed check:', appInstalled);

        if (appInstalled) {
            console.log('✅ Using Android deeplink:', linkData.android_deeplink);
            return linkData.android_deeplink;
        }
    }

    if (deviceInfo.isiOS && linkData.ios_deeplink) {
        const appInstalled = hasAppInstalled(linkData.platform, userAgent);
        console.log('🍎 iOS device with deeplink available');
        console.log('📱 App installed check:', appInstalled);

        if (appInstalled) {
            console.log('✅ Using iOS deeplink:', linkData.ios_deeplink);
            return linkData.ios_deeplink;
        }
    }

    // Fallback to original URL
    console.log('🌐 Using original URL fallback:', linkData.original_url);
    return linkData.original_url;
}

function getRedirectType(linkData: LinkData, deviceInfo: DeviceInfo): RedirectType {
    console.log('🔍 === REDIRECT TYPE DETERMINATION ===');

    if (deviceInfo.isAndroid && linkData.android_deeplink) {
        console.log('🎯 Redirect type: android_deeplink');
        return 'android_deeplink';
    }
    if (deviceInfo.isiOS && linkData.ios_deeplink) {
        console.log('🎯 Redirect type: ios_deeplink');
        return 'ios_deeplink';
    }

    console.log('🎯 Redirect type: web_fallback');
    return 'web_fallback';
}

function hasAppInstalled(platform: PlatformEnum, userAgent: string): boolean {
    console.log('🔍 === APP INSTALLATION CHECK ===');
    console.log('📱 Platform:', platform);
    console.log('📱 User agent for app check:', userAgent);

    // Simplified check - in production you might want more sophisticated detection
    const ua = userAgent.toLowerCase();

    const appDetection: Record<PlatformEnum, boolean> = {
        'instagram': ua.includes('instagram') || ua.includes('fbav'),
        'youtube': ua.includes('youtube'),
        'facebook': ua.includes('fbav') || ua.includes('facebook'),
        'tiktok': ua.includes('tiktok') || ua.includes('musical_ly'),
        'amazon': ua.includes('amazon'),
        'google-maps': true // Most devices have Maps
    };

    const result = appDetection[platform] || false;
    console.log('📱 App installed result for', platform, ':', result);

    return result;
}
