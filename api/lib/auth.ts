import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import cookie from 'cookie'
import type { VercelRequest, VercelResponse } from '@vercel/node'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this'
const JWT_EXPIRES_IN = '7d'

export interface JWTPayload {
    userId: string
    email: string
}

// Hash password
export async function hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10)
}

// Verify password
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash)
}

// Generate JWT token
export function generateToken(payload: JWTPayload): string {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN })
}

// Verify JWT token
export function verifyToken(token: string): JWTPayload | null {
    try {
        return jwt.verify(token, JWT_SECRET) as JWTPayload
    } catch (error) {
        return null
    }
}

// Set auth cookie
export function setAuthCookie(res: VercelResponse, token: string) {
    const cookieValue = cookie.serialize('auth_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: '/',
    })
    res.setHeader('Set-Cookie', cookieValue)
}

// Clear auth cookie
export function clearAuthCookie(res: VercelResponse) {
    const cookieValue = cookie.serialize('auth_token', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 0,
        path: '/',
    })
    res.setHeader('Set-Cookie', cookieValue)
}

// Get user from request
export function getUserFromRequest(req: VercelRequest): JWTPayload | null {
    const cookies = cookie.parse(req.headers.cookie || '')
    const token = cookies.auth_token

    if (!token) {
        return null
    }

    return verifyToken(token)
}

// Auth middleware
export function requireAuth(handler: (req: VercelRequest, res: VercelResponse, user: JWTPayload) => Promise<void>) {
    return async (req: VercelRequest, res: VercelResponse) => {
        const user = getUserFromRequest(req)

        if (!user) {
            return res.status(401).json({ error: 'Unauthorized' })
        }

        return handler(req, res, user)
    }
}
