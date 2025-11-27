import type { VercelRequest, VercelResponse } from '@vercel/node'
import { prisma } from '../lib/db'
import { hashPassword, generateToken, setAuthCookie } from '../lib/auth'

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' })
    }

    try {
        const { email, password, name } = req.body

        // Validation
        if (!email || !password || !name) {
            return res.status(400).json({ error: 'Email, password, and name are required' })
        }

        if (password.length < 6) {
            return res.status(400).json({ error: 'Password must be at least 6 characters' })
        }

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email },
        })

        if (existingUser) {
            return res.status(400).json({ error: 'User with this email already exists' })
        }

        // Hash password
        const passwordHash = await hashPassword(password)

        // Create user
        const user = await prisma.user.create({
            data: {
                email,
                passwordHash,
                name,
            },
        })

        // Generate JWT
        const token = generateToken({ userId: user.id, email: user.email })

        // Set cookie
        setAuthCookie(res, token)

        // Return user data
        return res.status(201).json({
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                profileImageUrl: user.profileImageUrl,
                createdAt: user.createdAt,
            },
        })
    } catch (error) {
        console.error('Registration error:', error)
        return res.status(500).json({ error: 'Internal server error' })
    }
}
