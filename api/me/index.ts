import type { VercelRequest, VercelResponse } from '@vercel/node'
import { requireAuth } from '../lib/auth'
import { prisma } from '../lib/db'

async function handler(req: VercelRequest, res: VercelResponse, user: any) {
    if (req.method === 'GET') {
        // Get user profile
        try {
            const userProfile = await prisma.user.findUnique({
                where: { id: user.userId },
                select: {
                    id: true,
                    email: true,
                    name: true,
                    profileImageUrl: true,
                    createdAt: true,
                },
            })

            if (!userProfile) {
                return res.status(404).json({ error: 'User not found' })
            }

            return res.status(200).json(userProfile)
        } catch (error) {
            console.error('Get profile error:', error)
            return res.status(500).json({ error: 'Failed to get profile' })
        }
    } else if (req.method === 'PUT') {
        // Update user profile
        try {
            const { name, profileImageUrl } = req.body

            const updatedUser = await prisma.user.update({
                where: { id: user.userId },
                data: {
                    ...(name && { name }),
                    ...(profileImageUrl && { profileImageUrl }),
                },
                select: {
                    id: true,
                    email: true,
                    name: true,
                    profileImageUrl: true,
                    createdAt: true,
                },
            })

            return res.status(200).json(updatedUser)
        } catch (error) {
            console.error('Update profile error:', error)
            return res.status(500).json({ error: 'Failed to update profile' })
        }
    } else {
        return res.status(405).json({ error: 'Method not allowed' })
    }
}

export default requireAuth(handler)
