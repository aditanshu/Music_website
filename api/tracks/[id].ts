import type { VercelRequest, VercelResponse } from '@vercel/node'
import { requireAuth } from '../lib/auth'
import { getTrackById, getStreamUrl } from '../lib/audius'
import { prisma } from '../lib/db'

async function handler(req: VercelRequest, res: VercelResponse, user: any) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' })
    }

    try {
        const { id } = req.query
        const trackId = typeof id === 'string' ? id : ''

        if (!trackId) {
            return res.status(400).json({ error: 'Track ID is required' })
        }

        // Check cache first
        let cachedTrack = await prisma.trackCache.findUnique({
            where: { id: trackId },
        })

        // If not in cache or cache is old (> 7 days), fetch from Audius
        if (!cachedTrack || Date.now() - cachedTrack.fetchedAt.getTime() > 7 * 24 * 60 * 60 * 1000) {
            const track = await getTrackById(trackId)

            if (!track) {
                return res.status(404).json({ error: 'Track not found' })
            }

            const streamUrl = await getStreamUrl(trackId)

            // Update cache
            cachedTrack = await prisma.trackCache.upsert({
                where: { id: trackId },
                create: {
                    id: trackId,
                    title: track.title,
                    artistName: track.artistName,
                    durationSec: track.durationSec,
                    genre: track.genre,
                    tags: track.tags || [],
                    audiusStreamUrl: streamUrl || undefined,
                    thumbnailUrl: track.thumbnailUrl,
                },
                update: {
                    title: track.title,
                    artistName: track.artistName,
                    durationSec: track.durationSec,
                    genre: track.genre,
                    tags: track.tags || [],
                    audiusStreamUrl: streamUrl || undefined,
                    thumbnailUrl: track.thumbnailUrl,
                    fetchedAt: new Date(),
                },
            })
        }

        return res.status(200).json({
            track: {
                trackId: cachedTrack.id,
                title: cachedTrack.title,
                artistName: cachedTrack.artistName,
                durationSec: cachedTrack.durationSec,
                genre: cachedTrack.genre,
                tags: cachedTrack.tags,
                streamUrl: cachedTrack.audiusStreamUrl,
                thumbnailUrl: cachedTrack.thumbnailUrl,
            },
        })
    } catch (error) {
        console.error('Get track error:', error)
        return res.status(500).json({ error: 'Failed to get track' })
    }
}

export default requireAuth(handler)
