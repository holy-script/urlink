// app/api/[platform]/[code]/route.ts
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { lookup, LookupResult, reload } from 'ip-location-api';
import { NextRequest, NextResponse } from 'next/server';

// Configure ip-location-api for synchronous mode (faster for redirects)
// This should be done once at startup
let isConfigured = false;
const configureIpLocationApi = async () => {
    if (!isConfigured) {
        try {
            // Configure for country-only data with synchronous mode for optimal performance
            await reload({
                fields: 'country,country_name,continent,timezone', // Only fields we need
                addCountryInfo: true, // Add country name info
                smallMemory: false, // Use synchronous mode for speed
                silent: true // Reduce console noise
            });
            isConfigured = true;
            console.log('✅ IP Location API configured for synchronous mode');
        } catch (error) {
            console.error('⚠️ Failed to configure IP Location API:', error);
        }
    }
};

// Type guards for handling the union return type
function isPromise<T>(value: T | Promise<T>): value is Promise<T> {
    return value != null && typeof (value as Promise<T>).then === 'function';
}

function isLookupResult(value: any): value is LookupResult {
    return value != null &&
        typeof value === 'object' &&
        ('country' in value || 'country_name' in value);
}

// Enhanced IP and Country extraction with type safety
function getClientIPAndCountry(request: NextRequest): { ip: string; country: string | null; } {
    console.log('🔍 === IP AND GEOLOCATION EXTRACTION ===');

    const headers = {
        forwarded: request.headers.get('x-forwarded-for'),
        realIP: request.headers.get('x-real-ip'),
        cfIP: request.headers.get('cf-connecting-ip'),
        trueClientIP: request.headers.get('true-client-ip')
    };

    console.log('🌐 IP Headers found:', headers);

    // Extract IP with priority order
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

    // Get country from IP using ip-location-api with type safety
    let country: string | null = null;

    try {
        // Skip geolocation for localhost/private IPs
        if (finalIP === '127.0.0.1' || finalIP === '::1' ||
            finalIP.startsWith('192.168.') || finalIP.startsWith('10.') ||
            finalIP.startsWith('172.')) {
            console.log('🌐 Skipping geolocation for local/private IP');
            return { ip: finalIP, country: null };
        }

        console.log('🌐 Looking up country for IP:', finalIP);

        // Call lookup function - it can return LookupResult | Promise<LookupResult | null> | null
        const lookupResult = lookup(finalIP);

        // Type guard to handle the union return type
        if (isPromise(lookupResult)) {
            // This shouldn't happen in sync mode, but handle it just in case
            console.warn('⚠️ Unexpected async result from lookup - this may slow down redirects');
            // For redirect performance, we'll skip async lookup and return null
            console.log('🌐 Skipping async geolocation lookup for performance');
            country = null;
        } else if (isLookupResult(lookupResult)) {
            // Synchronous result - exactly what we want for performance
            country = lookupResult.country || null;

            console.log('🌐 Geolocation result (sync):', {
                ip: finalIP,
                country: country,
                country_name: lookupResult.country_name,
                continent: lookupResult.continent,
                timezone: lookupResult.timezone
            });
        } else {
            // Result is null
            console.log('🌐 No geolocation data found for IP:', finalIP);
            country = null;
        }

    } catch (error) {
        console.error('⚠️ Geolocation lookup failed:', error);
        country = null;
    }

    return { ip: finalIP, country };
}

// Rest of your existing types remain the same
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

// Create admin client (unchanged)
function createAdminClient(): SupabaseClient {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

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

    // Configure IP Location API on first run
    await configureIpLocationApi();

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

        // Step 1: Fetch link (unchanged from your current code)
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
                return NextResponse.json({
                    error: 'Link not found or inactive',
                    platform,
                    code
                }, { status: 404 });
            }

            return NextResponse.json({
                error: 'Database query failed',
                details: fetchError.message,
                code: fetchError.code
            }, { status: 500 });
        }

        if (!linkData) {
            return NextResponse.json({ error: 'Link not found' }, { status: 404 });
        }

        const link = linkData as LinkData;
        console.log('✅ Link found successfully:', link.id);

        // Step 2: Check user click limits (unchanged)
        const { data: canClick, error: usageError } = await supabase
            .rpc('can_user_perform_click', { p_user_id: link.user_id });

        console.log('📊 Usage check result:', { canClick, error: usageError?.message || 'none' });

        // Step 3: Device detection (unchanged)
        const userAgent = request.headers.get('user-agent') || '';
        const deviceInfo = detectDevice(userAgent);

        // Step 4: Determine redirect URL (unchanged)
        const redirectUrl = determineRedirectUrl(link, deviceInfo, userAgent);
        const redirectType = getRedirectType(link, deviceInfo);

        console.log('🎯 Redirect decision:', { redirectUrl, redirectType });

        // Step 5: Record click analytics with geolocation
        console.log('🔍 === ANALYTICS RECORDING ===');
        const { ip: clientIP, country } = getClientIPAndCountry(request);

        const clickData: ClickData = {
            link_id: link.id,
            ip_address: clientIP,
            user_agent: userAgent,
            referrer_url: request.headers.get('referer'),
            country_code: country, // Now properly typed and validated!
            device_type: deviceInfo.type,
            redirect_type: redirectType
        };

        console.log('📝 Recording click data:');
        console.log('  - Link ID:', clickData.link_id);
        console.log('  - IP:', clientIP);
        console.log('  - Country:', country || 'Unknown');
        console.log('  - Device type:', clickData.device_type);

        const { error: clickError } = await supabase
            .from('link_clicks')
            .insert(clickData);

        if (clickError) {
            console.error('⚠️ Click tracking failed:', clickError);
        } else {
            console.log('✅ Click analytics recorded with geolocation');
        }

        // Step 6: Update user usage (unchanged)
        if (canClick) {
            const { error: incrementError } = await supabase
                .rpc('increment_user_click_count', { p_user_id: link.user_id });

            if (incrementError) {
                console.error('⚠️ Failed to increment usage:', incrementError);
            } else {
                console.log('✅ User click count incremented');
            }
        }

        // Step 7: Execute redirect
        console.log('🎯 Redirecting to:', redirectUrl);
        return NextResponse.redirect(redirectUrl, { status: 307 });

    } catch (error) {
        console.error('💥 Critical route error:', error);
        return NextResponse.json({
            error: 'Internal server error',
            timestamp: new Date().toISOString(),
            platform,
            code
        }, { status: 500 });
    }
}

// Keep all your existing helper functions unchanged
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
    if (deviceInfo.isAndroid && linkData.android_deeplink && hasAppInstalled(linkData.platform, userAgent)) {
        return linkData.android_deeplink;
    }
    if (deviceInfo.isiOS && linkData.ios_deeplink && hasAppInstalled(linkData.platform, userAgent)) {
        return linkData.ios_deeplink;
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
    return signatures.some(sig => ua.includes(sig)) || platform === 'google-maps';
}
