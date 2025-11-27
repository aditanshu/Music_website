import type { VercelRequest, VercelResponse } from '@vercel/node'
import { requireAuth } from '../../lib/auth'
import { getTrendingTracks } from '../../lib/audius'
import { prisma } from '../../lib/db'

async function handler(req: VercelRequest, res: VercelResponse, user: any) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' })
    }

    try {
        // Get user's listening history from last 7 days
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

        const recentHistory = await prisma.listeningHistory.findMany({
            where: {
                userId: user.userId,
                playedAt: { gte: sevenDaysAgo },
            },
            orderBy: { playedAt: 'desc' },
            take: 50,
        })

        // Get user feedback (liked tracks)
        const likedTracks = await prisma.feedback.findMany({
            where: {
                userId: user.userId,
                score: 1,
            },
            take: 20,
        })

        // Get track details from cache
        const likedTrackIds = likedTracks.map(f => f.trackId)
        const cachedTracks = await prisma.trackCache.findMany({
            where: {
                id: { in: likedTrackIds },
            },
        })

        // Create suggestion candidates
        const candidates = []

        // Candidate 1: Continue your vibe (based on recent listening)
        const recentTrackIds = recentHistory.slice(0, 10).map(h => h.trackId)
        const recentCached = await prisma.trackCache.findMany({
            where: { id: { in: recentTrackIds } },
            take: 10,
        })

        if (recentCached.length > 0) {
            candidates.push({
                tempId: 'continue-vibe',
                title: 'Continue Your Vibe',
                subtitle: 'Based on what you\'ve been listening to',
                tracks: recentCached.map(track => ({
                    trackId: track.id,
                    title: track.title,
                    artistName: track.artistName,
                    durationSec: track.durationSec,
                    thumbnailUrl: track.thumbnailUrl,
                })),
            })
        }

        // Candidate 2: Fresh mix (trending tracks)
        const trendingTracks = await getTrendingTracks(undefined, 10)

        if (trendingTracks.length > 0) {
            candidates.push({
                tempId: 'fresh-mix',
                title: 'Fresh Mix For You',
                subtitle: 'Discover what\'s trending',
                tracks: trendingTracks.map(track => ({
                    trackId: track.trackId,
                    title: track.title,
                    artistName: track.artistName,
                    durationSec: track.durationSec,
                    thumbnailUrl: track.thumbnailUrl,
                })),
            })
        }

        // Candidate 3: Your favorites (liked tracks)
        if (cachedTracks.length > 0) {
            candidates.push({
                tempId: 'your-favorites',
                title: 'Your Favorites',
                subtitle: 'Tracks you loved',
                tracks: cachedTracks.slice(0, 10).map(track => ({
                    trackId: track.id,
                    title: track.title,
                    artistName: track.artistName,
                    durationSec: track.durationSec,
                    thumbnailUrl: track.thumbnailUrl,
                })),
            })
        }

        return res.status(200).json({ candidates })
    } catch (error) {
        console.error('Home suggestions error:', error)
        return res.status(500).json({ error: 'Failed to generate suggestions' })
    }
}

export default requireAuth(handler)
