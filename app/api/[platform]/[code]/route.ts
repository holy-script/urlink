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

// Enhanced platform-specific deep link generation functions

// YouTube Deep Link Generation
function createYouTubeDeepLink(originalUrl: string, deviceInfo: DeviceInfo): string {
    const videoId = extractYouTubeVideoId(originalUrl);

    if (deviceInfo.isAndroid) {
        if (videoId) {
            // Android YouTube app intent with video ID - based on URLgenius strategy
            const intentUrl = `intent://www.youtube.com/watch?v=${videoId}#Intent;package=com.google.android.youtube;scheme=https;S.browser_fallback_url=${encodeURIComponent(originalUrl)};end`;
            console.log('🎥 Generated Android YouTube intent:', intentUrl);
            return intentUrl;
        } else {
            // General YouTube intent for channels, playlists, etc.
            const intentUrl = `intent://${originalUrl.replace(/https?:\/\//, '')}#Intent;package=com.google.android.youtube;scheme=https;S.browser_fallback_url=${encodeURIComponent(originalUrl)};end`;
            console.log('🎥 Generated Android YouTube general intent:', intentUrl);
            return intentUrl;
        }
    }

    if (deviceInfo.isiOS) {
        if (videoId) {
            // iOS YouTube app URL scheme - URLgenius approach
            const iosUrl = `youtube://www.youtube.com/watch?v=${videoId}`;
            console.log('🎥 Generated iOS YouTube URL:', iosUrl);
            return iosUrl;
        } else {
            // For iOS, use the original URL with UTM parameters for better app detection
            const url = new URL(originalUrl);
            url.searchParams.set('utm_source', 'urlink_app');
            url.searchParams.set('utm_medium', 'deeplink');
            console.log('🎥 Generated iOS YouTube universal link:', url.toString());
            return url.toString();
        }
    }

    return originalUrl;
}

// Instagram Deep Link Generation
function createInstagramDeepLink(originalUrl: string, deviceInfo: DeviceInfo): string {
    const instagramPath = extractInstagramPath(originalUrl);

    if (deviceInfo.isAndroid) {
        if (instagramPath.type === 'post') {
            const intentUrl = `intent://instagram.com/p/${instagramPath.id}#Intent;package=com.instagram.android;scheme=https;S.browser_fallback_url=${encodeURIComponent(originalUrl)};end`;
            console.log('📷 Generated Android Instagram post intent:', intentUrl);
            return intentUrl;
        } else if (instagramPath.type === 'reel') {
            const intentUrl = `intent://instagram.com/reel/${instagramPath.id}#Intent;package=com.instagram.android;scheme=https;S.browser_fallback_url=${encodeURIComponent(originalUrl)};end`;
            console.log('📷 Generated Android Instagram reel intent:', intentUrl);
            return intentUrl;
        } else {
            // Profile or general Instagram content
            const intentUrl = `intent://instagram.com/${instagramPath.path}#Intent;package=com.instagram.android;scheme=https;S.browser_fallback_url=${encodeURIComponent(originalUrl)};end`;
            console.log('📷 Generated Android Instagram profile intent:', intentUrl);
            return intentUrl;
        }
    }

    if (deviceInfo.isiOS) {
        if (instagramPath.type === 'post' && instagramPath.id) {
            const iosUrl = `instagram://media?id=${instagramPath.id}`;
            console.log('📷 Generated iOS Instagram post URL:', iosUrl);
            return iosUrl;
        } else if (instagramPath.type === 'reel' && instagramPath.id) {
            const iosUrl = `instagram://media?id=${instagramPath.id}`;
            console.log('📷 Generated iOS Instagram reel URL:', iosUrl);
            return iosUrl;
        } else {
            // Enhanced universal link for iOS
            const url = new URL(originalUrl);
            url.searchParams.set('utm_source', 'urlink_app');
            url.searchParams.set('utm_medium', 'deeplink');
            return url.toString();
        }
    }

    return originalUrl;
}

// TikTok Deep Link Generation
function createTikTokDeepLink(originalUrl: string, deviceInfo: DeviceInfo): string {
    const tiktokPath = extractTikTokPath(originalUrl);

    if (deviceInfo.isAndroid) {
        if (tiktokPath.type === 'video' && tiktokPath.username && tiktokPath.videoId) {
            const intentUrl = `intent://tiktok.com/@${tiktokPath.username}/video/${tiktokPath.videoId}#Intent;package=com.zhiliaoapp.musically;scheme=https;S.browser_fallback_url=${encodeURIComponent(originalUrl)};end`;
            console.log('🎵 Generated Android TikTok video intent:', intentUrl);
            return intentUrl;
        } else {
            const intentUrl = `intent://tiktok.com/${tiktokPath.path}#Intent;package=com.zhiliaoapp.musically;scheme=https;S.browser_fallback_url=${encodeURIComponent(originalUrl)};end`;
            console.log('🎵 Generated Android TikTok general intent:', intentUrl);
            return intentUrl;
        }
    }

    if (deviceInfo.isiOS) {
        if (tiktokPath.type === 'video' && tiktokPath.videoId) {
            const iosUrl = `tiktok://video/${tiktokPath.videoId}`;
            console.log('🎵 Generated iOS TikTok video URL:', iosUrl);
            return iosUrl;
        } else {
            // Enhanced universal link for iOS
            const url = new URL(originalUrl);
            url.searchParams.set('utm_source', 'urlink_app');
            url.searchParams.set('utm_medium', 'deeplink');
            return url.toString();
        }
    }

    return originalUrl;
}

// Amazon Deep Link Generation
function createAmazonDeepLink(originalUrl: string, deviceInfo: DeviceInfo): string {
    const asin = extractAmazonASIN(originalUrl);

    if (deviceInfo.isAndroid) {
        if (asin) {
            const intentUrl = `intent://amazon.com/dp/${asin}#Intent;package=com.amazon.mShop.android.shopping;scheme=https;S.browser_fallback_url=${encodeURIComponent(originalUrl)};end`;
            console.log('🛒 Generated Android Amazon ASIN intent:', intentUrl);
            return intentUrl;
        } else {
            const intentUrl = `intent://${originalUrl.replace(/https?:\/\//, '')}#Intent;package=com.amazon.mShop.android.shopping;scheme=https;S.browser_fallback_url=${encodeURIComponent(originalUrl)};end`;
            console.log('🛒 Generated Android Amazon general intent:', intentUrl);
            return intentUrl;
        }
    }

    if (deviceInfo.isiOS) {
        if (asin) {
            const iosUrl = `com.amazon.mobile.shopping.web://amazon.com/dp/${asin}/`;
            console.log('🛒 Generated iOS Amazon ASIN URL:', iosUrl);
            return iosUrl;
        } else {
            // Enhanced universal link with affiliate tags
            const url = new URL(originalUrl);
            url.searchParams.set('tag', 'urlink-20');
            url.searchParams.set('utm_source', 'urlink_app');
            url.searchParams.set('utm_medium', 'deeplink');
            return url.toString();
        }
    }

    return originalUrl;
}

// Facebook Deep Link Generation
function createFacebookDeepLink(originalUrl: string, deviceInfo: DeviceInfo): string {
    const facebookPath = extractFacebookPath(originalUrl);

    if (deviceInfo.isAndroid) {
        if (facebookPath.type === 'post') {
            const intentUrl = `intent://facebook.com/${facebookPath.path}#Intent;package=com.facebook.katana;scheme=https;S.browser_fallback_url=${encodeURIComponent(originalUrl)};end`;
            console.log('👥 Generated Android Facebook post intent:', intentUrl);
            return intentUrl;
        } else {
            const intentUrl = `intent://facebook.com/${facebookPath.path}#Intent;package=com.facebook.katana;scheme=https;S.browser_fallback_url=${encodeURIComponent(originalUrl)};end`;
            console.log('👥 Generated Android Facebook general intent:', intentUrl);
            return intentUrl;
        }
    }

    if (deviceInfo.isiOS) {
        if (facebookPath.type === 'post') {
            const iosUrl = `fb://post/${facebookPath.path}`;
            console.log('👥 Generated iOS Facebook post URL:', iosUrl);
            return iosUrl;
        } else {
            const iosUrl = `fb://page/${facebookPath.path}`;
            console.log('👥 Generated iOS Facebook page URL:', iosUrl);
            return iosUrl;
        }
    }

    return originalUrl;
}

// Google Maps Deep Link Generation
function createGoogleMapsDeepLink(originalUrl: string, deviceInfo: DeviceInfo): string {
    const mapsData = extractGoogleMapsData(originalUrl);

    if (deviceInfo.isAndroid) {
        if (mapsData.placeId) {
            const intentUrl = `intent://maps.google.com/maps/place/?q=place_id:${mapsData.placeId}#Intent;package=com.google.android.apps.maps;scheme=https;S.browser_fallback_url=${encodeURIComponent(originalUrl)};end`;
            console.log('🗺️ Generated Android Maps place intent:', intentUrl);
            return intentUrl;
        } else if (mapsData.query) {
            const intentUrl = `intent://maps.google.com/maps?q=${encodeURIComponent(mapsData.query)}#Intent;package=com.google.android.apps.maps;scheme=https;S.browser_fallback_url=${encodeURIComponent(originalUrl)};end`;
            console.log('🗺️ Generated Android Maps query intent:', intentUrl);
            return intentUrl;
        } else {
            const intentUrl = `intent://maps.google.com#Intent;package=com.google.android.apps.maps;scheme=https;S.browser_fallback_url=${encodeURIComponent(originalUrl)};end`;
            return intentUrl;
        }
    }

    if (deviceInfo.isiOS) {
        if (mapsData.query) {
            const iosUrl = `maps://?q=${encodeURIComponent(mapsData.query)}`;
            console.log('🗺️ Generated iOS Maps URL:', iosUrl);
            return iosUrl;
        } else {
            const iosUrl = `maps://?q=${encodeURIComponent(originalUrl)}`;
            return iosUrl;
        }
    }

    return originalUrl;
}

// Enhanced platform-specific deep link creation
function createPlatformDeepLink(linkData: LinkData, deviceInfo: DeviceInfo): string {
    console.log('🔗 Creating platform deep link for:', linkData.platform);

    switch (linkData.platform) {
        case 'youtube':
            return createYouTubeDeepLink(linkData.original_url, deviceInfo);
        case 'instagram':
            return createInstagramDeepLink(linkData.original_url, deviceInfo);
        case 'tiktok':
            return createTikTokDeepLink(linkData.original_url, deviceInfo);
        case 'amazon':
            return createAmazonDeepLink(linkData.original_url, deviceInfo);
        case 'facebook':
            return createFacebookDeepLink(linkData.original_url, deviceInfo);
        case 'google-maps':
            return createGoogleMapsDeepLink(linkData.original_url, deviceInfo);
        default:
            console.log('🌐 No platform-specific deep link available, using original URL');
            return linkData.original_url;
    }
}

// Helper functions for extracting platform-specific identifiers
function extractYouTubeVideoId(url: string): string | null {
    const patterns = [
        /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/,
        /youtube\.com\/embed\/([^&\n?#]+)/,
        /youtube\.com\/v\/([^&\n?#]+)/,
        /youtube\.com\/shorts\/([^&\n?#]+)/
    ];

    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match) {
            console.log('🎥 Extracted YouTube video ID:', match[1]);
            return match[1];
        }
    }

    console.log('🎥 No YouTube video ID found in URL:', url);
    return null;
}

function extractInstagramPath(url: string): { type: string; id?: string; path: string; } {
    try {
        const urlObj = new URL(url);
        const pathParts = urlObj.pathname.split('/').filter(Boolean);

        if (pathParts.includes('p') && pathParts[pathParts.indexOf('p') + 1]) {
            return {
                type: 'post',
                id: pathParts[pathParts.indexOf('p') + 1],
                path: urlObj.pathname.substring(1)
            };
        }

        if (pathParts.includes('reel') && pathParts[pathParts.indexOf('reel') + 1]) {
            return {
                type: 'reel',
                id: pathParts[pathParts.indexOf('reel') + 1],
                path: urlObj.pathname.substring(1)
            };
        }

        return {
            type: 'profile',
            path: urlObj.pathname.substring(1)
        };
    } catch {
        return { type: 'unknown', path: '' };
    }
}

function extractTikTokPath(url: string): { type: string; username?: string; videoId?: string; path: string; } {
    try {
        const urlObj = new URL(url);
        const pathParts = urlObj.pathname.split('/').filter(Boolean);

        // Handle @username/video/videoId format
        if (pathParts.length >= 3 && pathParts[0].startsWith('@') && pathParts[1] === 'video') {
            return {
                type: 'video',
                username: pathParts[0].substring(1),
                videoId: pathParts[2],
                path: urlObj.pathname.substring(1)
            };
        }

        return {
            type: 'profile',
            path: urlObj.pathname.substring(1)
        };
    } catch {
        return { type: 'unknown', path: '' };
    }
}

function extractAmazonASIN(url: string): string | null {
    const asinPatterns = [
        /\/dp\/([A-Z0-9]{10})/,
        /\/gp\/product\/([A-Z0-9]{10})/,
        /\/product\/([A-Z0-9]{10})/
    ];

    for (const pattern of asinPatterns) {
        const match = url.match(pattern);
        if (match) return match[1];
    }

    return null;
}

function extractGoogleMapsData(url: string): { placeId?: string; query?: string; } {
    try {
        const urlObj = new URL(url);

        // Extract place ID if available
        const placeIdMatch = url.match(/place_id:([^&\s]+)/);
        if (placeIdMatch) {
            return { placeId: placeIdMatch[1] };
        }

        // Extract search query
        const query = urlObj.searchParams.get('q');
        if (query) {
            return { query };
        }

        return {};
    } catch {
        return {};
    }
}

function extractFacebookPath(url: string): { type: string; path: string; } {
    try {
        const urlObj = new URL(url);
        const pathParts = urlObj.pathname.split('/').filter(Boolean);

        if (pathParts.includes('posts')) {
            return {
                type: 'post',
                path: urlObj.pathname.substring(1)
            };
        }

        return {
            type: 'page',
            path: urlObj.pathname.substring(1)
        };
    } catch {
        return { type: 'unknown', path: '' };
    }
}

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ platform: string; code: string; }>; }
) {
    console.log('🚀 === URLINK REDIRECT API STARTED ===');
    console.log('🎯 Platform: Enhanced Deep Link Generation & Pay-per-Click Analytics');

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

        // Step 4: Determine redirect URL with enhanced platform-specific logic
        console.log('🔍 === ENHANCED DEEP LINK ROUTING ===');
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

// Enhanced device detection
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

// Updated redirect URL determination with enhanced platform-specific logic
function determineRedirectUrl(linkData: LinkData, deviceInfo: DeviceInfo, userAgent: string): string {
    console.log('🔗 Determining redirect URL for platform:', linkData.platform);

    // For mobile devices, try platform-specific deep links first
    if (deviceInfo.isMobile) {
        const platformDeepLink = createPlatformDeepLink(linkData, deviceInfo);
        if (platformDeepLink !== linkData.original_url) {
            console.log('📱 Using enhanced platform deep link');
            return platformDeepLink;
        }
    }

    // Fallback to stored deep links
    if (deviceInfo.isAndroid && linkData.android_deeplink) {
        console.log('🤖 Using stored Android deep link');
        return linkData.android_deeplink;
    }

    if (deviceInfo.isiOS && linkData.ios_deeplink) {
        console.log('🍎 Using stored iOS deep link');
        return linkData.ios_deeplink;
    }

    console.log('🌐 Falling back to original URL');
    return linkData.original_url;
}

function getRedirectType(linkData: LinkData, deviceInfo: DeviceInfo): RedirectType {
    if (deviceInfo.isAndroid) return 'android_deeplink';
    if (deviceInfo.isiOS) return 'ios_deeplink';
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
