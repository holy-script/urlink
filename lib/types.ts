export interface AppConfig {
    name: string;
    patterns: RegExp[];
    deepLinkFormat: {
        ios: string;
        android: string;
        fallback: string;
    };
}

export interface DeepLinkResult {
    platform: string;
    originalUrl: string;
    deepLink: string;
    iosLink: string;
    androidLink: string;
    fallbackUrl: string;
    id?: string;
}

export interface UserPlanInfo {
    plan: string;
    totalClicks: number;
}

export interface User {
    plan: string;
    click_usage: number;
    click_limit: number;
}

export interface EmailTemplateProps {
    name?: string;
    email?: string;
}

export interface EmailUser {
    email: string;
    name?: string;
}
