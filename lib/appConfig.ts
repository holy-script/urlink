import { AppConfig } from './types';

export const appConfigs: AppConfig[] = [
    {
        name: 'Instagram',
        patterns: [
            /(?:www\.)?instagram\.com\/p\/([^/?]+)/,
            /(?:www\.)?instagram\.com\/reel\/([^/?]+)/,
            /(?:www\.)?instagram\.com\/([^/?]+)/
        ],
        deepLinkFormat: {
            ios: 'instagram://post?id=$1',
            android: 'intent://instagram.com/p/$1#Intent;package=com.instagram.android;scheme=https;end',
            fallback: 'https://instagram.com/p/$1'
        }
    },
    {
        name: 'YouTube',
        patterns: [
            /(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&]+)/,
            /(?:www\.)?youtube\.com\/channel\/([^/?]+)/
        ],
        deepLinkFormat: {
            ios: 'vnd.youtube://$1',
            android: 'intent://youtube.com/watch?v=$1#Intent;package=com.google.android.youtube;scheme=https;end',
            fallback: 'https://youtube.com/watch?v=$1'
        }
    },
    {
        name: 'Amazon',
        patterns: [
            /(?:www\.)?amazon\.(?:com|co\.uk|de|fr|it|es)\/(?:dp|gp\/product)\/([A-Z0-9]+)/,
            /(?:www\.)?amazon\.(?:com|co\.uk|de|fr|it|es)\/(?:[^/]+\/)?d\/([A-Z0-9]+)/
        ],
        deepLinkFormat: {
            ios: 'com.amazon.mobile.shopping://product/$1',
            android: 'intent://amazon.com/dp/$1#Intent;package=com.amazon.mShop.android.shopping;scheme=https;end',
            fallback: 'https://amazon.com/dp/$1'
        }
    },
    {
        name: 'TikTok',
        patterns: [
            /(?:www\.)?tiktok\.com\/@([^/]+)\/video\/(\d+)/,
            /(?:www\.)?tiktok\.com\/@([^/?]+)/
        ],
        deepLinkFormat: {
            ios: 'tiktok://video/$2',
            android: 'intent://tiktok.com/v/$2#Intent;package=com.zhiliaoapp.musically;scheme=https;end',
            fallback: 'https://tiktok.com/@$1/video/$2'
        }
    }
];
