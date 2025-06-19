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
    is_billable: boolean;
    billing_month: string | null;
}

// IPinfo Lite API response interface
interface IPinfoLiteResponse {
    ip: string;
    asn: string;
    as_name: string;
    as_domain: string;
    country_code: string;
    country: string;
    continent_code: string;
    continent: string;
}

// Enhanced function to check if IP is private/local (including IPv6)
function isPrivateOrLocalIP(ip: string): boolean {
    // IPv4 loopback and private ranges
    if (ip === '127.0.0.1' ||
        ip.startsWith('192.168.') ||
        ip.startsWith('10.') ||
        ip.startsWith('172.') ||
        ip.startsWith('169.254.')) {
        return true;
    }

    // IPv6 loopback and private ranges
    if (ip === '::1' ||           // IPv6 loopback (equivalent to 127.0.0.1)
        ip === '::' ||            // IPv6 unspecified address
        ip.startsWith('fe80:') || // IPv6 link-local addresses
        ip.startsWith('fc00:') || // IPv6 unique local addresses
        ip.startsWith('fd00:')) { // IPv6 unique local addresses
        return true;
    }

    return false;
}

// IPinfo Lite integration with enhanced IPv6 support
async function getCountryFromIPinfoLite(ip: string): Promise<string | null> {
    console.log('🌐 Checking IP for geolocation:', ip);

    // Enhanced check for private/local IPs including IPv6
    if (isPrivateOrLocalIP(ip)) {
        console.log('🌐 Skipping geolocation for private/local IP:', ip);
        if (ip === '::1') {
            console.log('🌐 Detected IPv6 loopback address (::1)');
        }
        return null;
    }

    try {
        console.log('🌐 Looking up country for IP using IPinfo Lite:', ip);

        const token = process.env.IPINFO_TOKEN;
        if (!token) {
            console.warn('⚠️ IPINFO_TOKEN not found in environment variables');
            return null;
        }

        // Use IPinfo Lite API - handles both IPv4 and IPv6
        const url = `https://api.ipinfo.io/lite/${ip}?token=${token}`;

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'User-Agent': 'URLINK/1.0',
                'Accept': 'application/json'
            },
            // Timeout to ensure redirects aren't delayed
            signal: AbortSignal.timeout(2000)
        });

        if (response.ok) {
            const data: IPinfoLiteResponse = await response.json();

            console.log('🌐 IPinfo Lite result:', {
                ip: data.ip,
                country_code: data.country_code,
                country: data.country,
                continent: data.continent,
                is_ipv6: ip.includes(':') // Log if it's IPv6
            });

            return data.country_code || null;
        } else {
            console.warn('⚠️ IPinfo Lite API error:', response.status, response.statusText);
            return null;
        }
    } catch (error) {
        // Non-blocking: don't let geolocation errors affect redirects
        console.warn('⚠️ IPinfo Lite lookup failed (non-blocking):', error instanceof Error ? error.message : 'Unknown');
        return null;
    }
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

    // Start IP extraction and geolocation early (non-blocking)
    const clientIP = getClientIP(request);
    console.log('🌐 Extracted client IP:', clientIP);

    // Log IP type for debugging
    if (clientIP.includes(':')) {
        console.log('🌐 Detected IPv6 address');
        if (clientIP === '::1') {
            console.log('🌐 This is IPv6 loopback (::1) - equivalent to 127.0.0.1');
        }
    } else {
        console.log('🌐 Detected IPv4 address');
    }

    // Start country lookup asynchronously
    const countryPromise = getCountryFromIPinfoLite(clientIP);

    try {
        console.log('🔍 === DATABASE OPERATIONS ===');

        // Step 1: Fetch link
        console.log('📋 Querying links table...');

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

        if (fetchError) {
            if (fetchError.code === 'PGRST116') {
                console.log('📝 No matching active link found');
                return NextResponse.json({
                    error: 'Link not found or inactive',
                    platform,
                    code
                }, { status: 404 });
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
        console.log('✅ Link found successfully:', link.id);

        // Step 2: Check user click limits (updated for verification + lifetime model)
        console.log('🔍 === USER CLICK LIMIT CHECK ===');
        console.log('👤 Checking limits for user:', link.user_id);

        const { data: canClick, error: usageError } = await supabase
            .rpc('can_user_perform_click', { p_user_id: link.user_id });

        console.log('📊 Usage check result:');
        console.log('  - Can perform click:', canClick);
        console.log('  - Usage error:', usageError?.message || 'none');

        if (!canClick) {
            console.log('🚫 User has exceeded their click limit');

            // Get user verification status to determine redirect
            const { data: userData } = await supabase
                .from('users')
                .select('is_email_verified, lifetime_clicks_used')
                .eq('id', link.user_id)
                .single();

            if (userData && !userData.is_email_verified) {
                // Unverified user exceeded 20 clicks - redirect to email verification
                const verifyUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://smarturlink.com'}/verify-email`;
                console.log('🎯 Redirecting unverified user to email verification:', verifyUrl);
                return NextResponse.redirect(verifyUrl, { status: 307 });
            } else {
                // Verified user exceeded 500 clicks - redirect to billing
                const billingUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://smarturlink.com'}/billing`;
                console.log('🎯 Redirecting verified user to billing page:', billingUrl);
                return NextResponse.redirect(billingUrl, { status: 307 });
            }
        }

        // Step 3: Device detection
        console.log('🔍 === DEVICE DETECTION ===');
        const userAgent = request.headers.get('user-agent') || '';
        const deviceInfo = detectDevice(userAgent);

        console.log('📱 Device analysis:', {
            type: deviceInfo.type,
            platform: deviceInfo.platform,
            isAndroid: deviceInfo.isAndroid,
            isiOS: deviceInfo.isiOS
        });

        // Step 4: Determine redirect URL
        console.log('🔍 === DEEP LINK ROUTING ===');
        const redirectUrl = determineRedirectUrl(link, deviceInfo, userAgent);
        const redirectType = getRedirectType(link, deviceInfo);

        console.log('🎯 Redirect decision:', { redirectUrl, redirectType });

        // Step 5: Record click analytics with enhanced geolocation
        console.log('🔍 === ANALYTICS RECORDING ===');

        // Wait for country lookup with timeout protection
        let country: string | null = null;
        try {
            // Race between country lookup and 1 second timeout
            country = await Promise.race([
                countryPromise,
                new Promise<null>((resolve) => setTimeout(() => resolve(null), 1000))
            ]);
        } catch (error) {
            console.warn('⚠️ Country lookup timed out (non-blocking)');
            country = null;
        }

        // Determine if this click is billable
        const { data: userStatus } = await supabase
            .from('users')
            .select('is_email_verified, lifetime_clicks_used, verified_free_clicks_limit')
            .eq('id', link.user_id)
            .single();

        const isBillable = userStatus &&
            userStatus.is_email_verified &&
            userStatus.lifetime_clicks_used >= (userStatus.verified_free_clicks_limit || 500);

        const clickData: ClickData = {
            link_id: link.id,
            ip_address: clientIP,
            user_agent: userAgent,
            referrer_url: request.headers.get('referer'),
            country_code: country,
            device_type: deviceInfo.type,
            redirect_type: redirectType,
            is_billable: isBillable || false,
            billing_month: isBillable ? new Date().toISOString().slice(0, 7) + '-01' : null
        };

        console.log('📝 Recording click data:');
        console.log('  - Link ID:', clickData.link_id);
        console.log('  - IP:', clientIP, clientIP === '::1' ? '(IPv6 loopback)' : '');
        console.log('  - Country:', country || 'Unknown');
        console.log('  - Device type:', clickData.device_type);
        console.log('  - Is billable:', clickData.is_billable);

        const { error: clickError } = await supabase
            .from('link_clicks')
            .insert(clickData);

        if (clickError) {
            console.error('⚠️ Click tracking failed:', clickError);
        } else {
            console.log('✅ Click analytics recorded with enhanced geolocation');
        }

        // Step 6: Update user usage (updated for verification + lifetime model)
        console.log('🔍 === USAGE INCREMENT ===');
        console.log('💰 Incrementing lifetime click count...');

        const { data: incrementResult, error: incrementError } = await supabase
            .rpc('increment_user_click_count', { p_user_id: link.user_id });

        console.log('📊 Usage increment result:');
        console.log('  - Success:', incrementResult);
        console.log('  - Error:', incrementError?.message || 'none');

        if (incrementError) {
            console.error('⚠️ Failed to increment usage:', incrementError);
        } else {
            console.log('✅ Lifetime click count incremented');

            // Check if we need to deactivate links
            await supabase.rpc('check_and_deactivate_user_links', { p_user_id: link.user_id });
        }

        // Step 7: Execute redirect
        console.log('🔍 === FINAL REDIRECT ===');
        console.log('🎯 Redirecting user to:', redirectUrl);
        console.log('✅ === URLINK REDIRECT COMPLETED ===');

        return NextResponse.redirect(redirectUrl, { status: 307 });

    } catch (error) {
        console.error('💥 === CRITICAL ROUTE ERROR ===');
        console.error('💥 Error:', error instanceof Error ? error.message : 'Unknown error');

        return NextResponse.json({
            error: 'Internal server error',
            timestamp: new Date().toISOString(),
            platform,
            code
        }, { status: 500 });
    }
}

// Helper function: Extract real client IP (with enhanced IPv6 support)
function getClientIP(request: NextRequest): string {
    console.log('🔍 === IP ADDRESS EXTRACTION ===');

    const headers = {
        forwarded: request.headers.get('x-forwarded-for'),
        realIP: request.headers.get('x-real-ip'),
        cfIP: request.headers.get('cf-connecting-ip'),
        trueClientIP: request.headers.get('true-client-ip')
    };

    console.log('🌐 Available IP headers:', headers);

    let finalIP = '127.0.0.1';

    if (headers.forwarded) {
        finalIP = headers.forwarded.split(',')[0].trim();
        console.log('🌐 Using x-forwarded-for IP:', finalIP);
    } else if (headers.realIP) {
        finalIP = headers.realIP;
        console.log('🌐 Using x-real-ip:', finalIP);
    } else if (headers.cfIP) {
        finalIP = headers.cfIP;
        console.log('🌐 Using cf-connecting-ip:', finalIP);
    } else if (headers.trueClientIP) {
        finalIP = headers.trueClientIP;
        console.log('🌐 Using true-client-ip:', finalIP);
    } else {
        console.log('🌐 Using fallback IP:', finalIP);
    }

    if (finalIP.includes(':')) {
        console.log('🌐 Final IP is IPv6:', finalIP);
        if (finalIP === '::1') {
            console.log('🌐 This is IPv6 loopback - local development detected');
        }
    } else {
        console.log('🌐 Final IP is IPv4:', finalIP);
    }

    return finalIP;
}

// All your existing helper functions remain unchanged
function detectDevice(userAgent: string): DeviceInfo {
    const ua = userAgent.toLowerCase();
    const isAndroid = ua.includes('android');
    const isiOS = /iphone|ipad|ipod/.test(ua);
    const isMobile = isAndroid || isiOS || /mobile|android|iphone|ipod|blackberry|iemobile|opera mini/i.test(ua);
    const isTablet = /tablet|ipad|playbook|silk/i.test(ua);

    let type: DeviceType = 'desktop';
    if (isTablet) type = 'tablet';
    else if (isMobile) type = 'mobile';

    return {
        type,
        platform: isAndroid ? 'android' : isiOS ? 'ios' : 'web',
        isAndroid, isiOS, isMobile, isTablet
    };
}

function determineRedirectUrl(linkData: LinkData, deviceInfo: DeviceInfo, userAgent: string): string {
    if (deviceInfo.isAndroid && linkData.android_deeplink) {
        const hasApp = hasAppInstalled(linkData.platform, userAgent);
        if (hasApp) return linkData.android_deeplink;
    }

    if (deviceInfo.isiOS && linkData.ios_deeplink) {
        const hasApp = hasAppInstalled(linkData.platform, userAgent);
        if (hasApp) return linkData.ios_deeplink;
    }

    return linkData.original_url;
}

function getRedirectType(linkData: LinkData, deviceInfo: DeviceInfo): RedirectType {
    if (deviceInfo.isAndroid && linkData.android_deeplink) return 'android_deeplink';
    if (deviceInfo.isiOS && linkData.ios_deeplink) return 'ios_deeplink';
    return 'web_fallback';
}

function hasAppInstalled(platform: PlatformEnum, userAgent: string): boolean {
    const ua = userAgent.toLowerCase();
    const appSignatures: Record<PlatformEnum, string[]> = {
        'instagram': ['instagram', 'fbav'],
        'youtube': ['youtube'],
        'facebook': ['fbav', 'facebook'],
        'tiktok': ['tiktok', 'musical_ly'],
        'amazon': ['amazon'],
        'google-maps': ['googlemaps', 'maps']
    };

    const signatures = appSignatures[platform] || [];
    const detected = signatures.some(sig => ua.includes(sig));

    if (platform === 'google-maps') return true;
    return detected;
}