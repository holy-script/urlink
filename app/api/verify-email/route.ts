import { verifyToken } from '@/utils/jwt';
import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

// Create admin client for database operations
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    }
);

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
        return NextResponse.redirect(new URL('/verify-email/error?reason=missing-token', request.url));
    }

    try {
        // Verify the JWT token
        const decoded = verifyToken(token);

        console.log('Token verified for user:', decoded.userId);

        // Check if user exists and get current verification status
        const { data: userData, error: fetchError } = await supabaseAdmin
            .from('users')
            .select('id, email, is_email_verified')
            .eq('id', decoded.userId)
            .eq('email', decoded.email)
            .single();

        if (fetchError || !userData) {
            console.error('User fetch error:', fetchError);
            return NextResponse.redirect(new URL('/verify-email/error?reason=user-not-found', request.url));
        }

        // Check if already verified
        if (userData.is_email_verified) {
            return NextResponse.redirect(new URL('/verify-email/success?reason=already-verified', request.url));
        }

        // Update verification status
        const { error: updateError } = await supabaseAdmin
            .from('users')
            .update({
                is_email_verified: true,
                updated_at: new Date().toISOString()
            })
            .eq('id', decoded.userId);

        if (updateError) {
            console.error('Update error:', updateError);
            return NextResponse.redirect(new URL('/verify-email/error?reason=update-failed', request.url));
        }

        console.log('Email verified successfully for user:', decoded.userId);

        // Redirect to success page
        return NextResponse.redirect(new URL('/verify-email/success', request.url));

    } catch (error) {
        console.error('Verification error:', error);

        if (error instanceof Error) {
            if (error.message.includes('expired')) {
                return NextResponse.redirect(new URL('/verify-email/error?reason=expired', request.url));
            } else if (error.message.includes('Invalid')) {
                return NextResponse.redirect(new URL('/verify-email/error?reason=invalid', request.url));
            }
        }

        return NextResponse.redirect(new URL('/verify-email/error?reason=unknown', request.url));
    }
}
