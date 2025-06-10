import { createClient } from '@/utils/supabase/server';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const requestUrl = new URL(request.url);
    const code = requestUrl.searchParams.get('code');
    const next = requestUrl.searchParams.get('next') ?? '/email-verified';

    if (code) {
        try {
            const supabase = await createClient();
            const { error } = await supabase.auth.exchangeCodeForSession(code);

            if (error) {
                console.error('Error exchanging code for session:', error);
                return NextResponse.redirect(`${requestUrl.origin}/auth/auth-code-error`);
            }

            // Successful authentication - redirect to the next URL or home
            const redirectUrl = `${requestUrl.origin}${next}`;
            return NextResponse.redirect(redirectUrl);
        } catch (error) {
            console.error('Unexpected error during auth callback:', error);
            return NextResponse.redirect(`${requestUrl.origin}/auth/auth-code-error`);
        }
    }

    // No code present - redirect to home
    return NextResponse.redirect(requestUrl.origin);
}
