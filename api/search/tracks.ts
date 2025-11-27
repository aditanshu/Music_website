import type { VercelRequest, VercelResponse } from '@vercel/node'
import { requireAuth } from '../lib/auth'
import { searchTracks } from '../lib/audius'
import { prisma } from '../lib/db'

async function handler(req: VercelRequest, res: VercelResponse, user: any) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' })
    }

    try {
        const { q, limit } = req.query
        const query = typeof q === 'string' ? q : ''
        const searchLimit = typeof limit === 'string' ? parseInt(limit) : 20

        if (!query) {
            return res.status(400).json({ error: 'Query parameter is required' })
        }

        // Search Audius
        const tracks = await searchTracks(query, searchLimit)

        // Log search history
        await prisma.searchHistory.create({
            data: {
                userId: user.userId,
                query,
                resultCount: tracks.length,
            },
        })

        return res.status(200).json({ tracks })
    } catch (error) {
        console.error('Search tracks error:', error)
        return res.status(500).json({ error: 'Failed to search tracks' })
    }
}

export default requireAuth(handler)
