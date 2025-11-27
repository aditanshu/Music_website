import type { VercelRequest, VercelResponse } from '@vercel/node'
import { prisma } from '../lib/db'
import { verifyPassword, generateToken, setAuthCookie } from '../lib/auth'

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' })
    }

    try {
        const { email, password } = req.body

        // Validation
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' })
        }

        // Find user
        const user = await prisma.user.findUnique({
            where: { email },
        })

        if (!user || !user.passwordHash) {
            return res.status(401).json({ error: 'Invalid credentials' })
        }

        // Verify password
        const isValid = await verifyPassword(password, user.passwordHash)

        if (!isValid) {
            return res.status(401).json({ error: 'Invalid credentials' })
        }

        // Generate JWT
        const token = generateToken({ userId: user.id, email: user.email })

        // Set cookie
        setAuthCookie(res, token)

        // Return user data
        return res.status(200).json({
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                profileImageUrl: user.profileImageUrl,
                createdAt: user.createdAt,
            },
        })
    } catch (error) {
        console.error('Login error:', error)
        return res.status(500).json({ error: 'Internal server error' })
    }
}
