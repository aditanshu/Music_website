import type { VercelRequest, VercelResponse } from '@vercel/node'
import { requireAuth } from '../../lib/auth'
import { prisma } from '../../lib/db'

async function handler(req: VercelRequest, res: VercelResponse, user: any) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' })
    }

    try {
        const { limit } = req.query
        const queryLimit = typeof limit === 'string' ? parseInt(limit) : 20

        const history = await prisma.searchHistory.findMany({
            where: { userId: user.userId },
            orderBy: { searchedAt: 'desc' },
            take: queryLimit,
        })

        return res.status(200).json({ history })
    } catch (error) {
        console.error('Get search history error:', error)
        return res.status(500).json({ error: 'Failed to get search history' })
    }
}

export default requireAuth(handler)
