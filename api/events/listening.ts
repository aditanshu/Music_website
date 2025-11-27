import type { VercelRequest, VercelResponse } from '@vercel/node'
import { requireAuth } from '../../lib/auth'
import { prisma } from '../../lib/db'

async function handler(req: VercelRequest, res: VercelResponse, user: any) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' })
    }

    try {
        const { trackId, playlistId, positionInPlaylist, playedMs, skipped, source } = req.body

        if (!trackId || playedMs === undefined || !source) {
            return res.status(400).json({ error: 'trackId, playedMs, and source are required' })
        }

        // Create listening history entry
        await prisma.listeningHistory.create({
            data: {
                userId: user.userId,
                trackId,
                playlistId: playlistId || null,
                positionInPlaylist: positionInPlaylist || null,
                playedMs,
                skipped: skipped || false,
                source,
            },
        })

        return res.status(201).json({ message: 'Listening event recorded' })
    } catch (error) {
        console.error('Listening event error:', error)
        return res.status(500).json({ error: 'Failed to record listening event' })
    }
}

export default requireAuth(handler)
