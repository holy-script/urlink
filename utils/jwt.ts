import jwt from 'jsonwebtoken';

export interface VerificationTokenPayload {
    userId: string;
    email: string;
    purpose: 'email_verification';
}

export function generateVerificationToken(payload: VerificationTokenPayload): string {
    const secret = process.env.EMAIL_VERIFICATION_JWT_SECRET;
    if (!secret) {
        throw new Error('EMAIL_VERIFICATION_JWT_SECRET is not set');
    }

    return jwt.sign(payload, secret, {
        expiresIn: '24h',
        issuer: 'smarturlink',
        audience: 'email-verification'
    });
}

export function verifyToken(token: string): VerificationTokenPayload {
    const secret = process.env.EMAIL_VERIFICATION_JWT_SECRET;
    if (!secret) {
        throw new Error('EMAIL_VERIFICATION_JWT_SECRET is not set');
    }

    try {
        const decoded = jwt.verify(token, secret, {
            issuer: 'smarturlink',
            audience: 'email-verification',
            algorithms: ['HS256']
        }) as VerificationTokenPayload;

        return decoded;
    } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
            throw new Error('Verification link has expired');
        } else if (error instanceof jwt.JsonWebTokenError) {
            console.error('Invalid token:', error.message);
            throw new Error('Invalid verification link');
        } else {
            throw new Error('Token verification failed');
        }
    }
}
