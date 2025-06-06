import { appConfigs } from './appConfig';
import { DeepLinkResult } from './types';

export function generateDeepLink(url: string): DeepLinkResult | null {
    if (!url || typeof url !== 'string') {
        return null;
    }

    // Normalize the URL
    const normalizedUrl = url.trim().toLowerCase()
        .replace(/^https?:\/\/(?:www\.)?/, '')
        .replace(/\/$/, '');

    // Add https:// if not present
    const fullUrl = normalizedUrl.startsWith('http') ? url : `https://${url}`;

    // Find matching app configuration
    for (const appConfig of appConfigs) {
        for (const pattern of appConfig.patterns) {
            const match = normalizedUrl.match(pattern);

            if (match) {
                const id = match[1];
                const secondaryId = match[2]; // For patterns that need two IDs (like TikTok)

                // Replace placeholders in the deep link formats
                const replacePlaceholders = (format: string) => {
                    return format
                        .replace('$1', id)
                        .replace('$2', secondaryId || id);
                };

                const iosLink = replacePlaceholders(appConfig.deepLinkFormat.ios);
                const androidLink = replacePlaceholders(appConfig.deepLinkFormat.android);
                const fallbackUrl = replacePlaceholders(appConfig.deepLinkFormat.fallback);

                // Generate a universal deep link
                const deepLink = `https://urlink.com/redirect?ios=${encodeURIComponent(iosLink)}&android=${encodeURIComponent(androidLink)}&fallback=${encodeURIComponent(fallbackUrl)}`;

                return {
                    platform: appConfig.name,
                    originalUrl: fullUrl,
                    deepLink,
                    iosLink,
                    androidLink,
                    fallbackUrl
                };
            }
        }
    }

    // Fallback for unknown platforms
    return {
        platform: 'Generic',
        originalUrl: fullUrl,
        deepLink: fullUrl,
        iosLink: fullUrl,
        androidLink: fullUrl,
        fallbackUrl: fullUrl
    };
}

// Development helper for debugging
export function debugDeepLink(url: string): void {
    if (process.env.NODE_ENV === 'development') {
        console.group('Deep Link Generation Debug');
        console.log('Input URL:', url);

        try {
            const result = generateDeepLink(url);
            console.log('Generated Deep Link:', result);
        } catch (error) {
            console.error('Deep Link Generation Error:', error);
        }

        console.groupEnd();
    }
}
