import type { VercelRequest, VercelResponse } from '@vercel/node'
import { requireAuth } from '../../../lib/auth'
import { prisma } from '../../../lib/db'

async function handler(req: VercelRequest, res: VercelResponse, user: any) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' })
    }

    try {
        const { limit } = req.query
        const queryLimit = typeof limit === 'string' ? parseInt(limit) : 50

        const history = await prisma.listeningHistory.findMany({
            where: { userId: user.userId },
            orderBy: { playedAt: 'desc' },
            take: queryLimit,
        })

        // Get track details from cache
        const trackIds = [...new Set(history.map(h => h.trackId))]
        const tracks = await prisma.trackCache.findMany({
            where: { id: { in: trackIds } },
        })

        const trackMap = new Map(tracks.map(t => [t.id, t]))

        const enrichedHistory = history.map(h => ({
            id: h.id,
            trackId: h.trackId,
            title: trackMap.get(h.trackId)?.title || 'Unknown',
            artistName: trackMap.get(h.trackId)?.artistName || 'Unknown',
            thumbnailUrl: trackMap.get(h.trackId)?.thumbnailUrl,
            playedMs: h.playedMs,
            skipped: h.skipped,
            source: h.source,
            playedAt: h.playedAt,
        }))

        return res.status(200).json({ history: enrichedHistory })
    } catch (error) {
        console.error('Get listening history error:', error)
        return res.status(500).json({ error: 'Failed to get listening history' })
    }
}

export default requireAuth(handler)
