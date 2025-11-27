import type { VercelRequest, VercelResponse } from '@vercel/node'
import { prisma } from './lib/db'
import { requireAuth } from './lib/auth'

async function handler(req: VercelRequest, res: VercelResponse, user: any) {
    if (req.method === 'GET') {
        // Get user profile
        try {
            const userData = await prisma.user.findUnique({
                where: { id: user.userId },
                select: {
                    id: true,
                    email: true,
                    name: true,
                    profileImageUrl: true,
                    createdAt: true,
                },
            })

            if (!userData) {
                return res.status(404).json({ error: 'User not found' })
            }

            return res.status(200).json({ user: userData })
        } catch (error) {
            console.error('Get profile error:', error)
            return res.status(500).json({ error: 'Internal server error' })
        }
    } else if (req.method === 'PUT') {
        // Update user profile
        try {
            const { name, profileImageUrl } = req.body

            const updateData: any = {}
            if (name) updateData.name = name
            if (profileImageUrl !== undefined) updateData.profileImageUrl = profileImageUrl

            const updatedUser = await prisma.user.update({
                where: { id: user.userId },
                data: updateData,
                select: {
                    id: true,
                    email: true,
                    name: true,
                    profileImageUrl: true,
                    createdAt: true,
                },
            })

            return res.status(200).json({ user: updatedUser })
        } catch (error) {
            console.error('Update profile error:', error)
            return res.status(500).json({ error: 'Internal server error' })
        }
    } else {
        return res.status(405).json({ error: 'Method not allowed' })
    }
}

export default requireAuth(handler)
