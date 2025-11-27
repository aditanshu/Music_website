import type { VercelRequest, VercelResponse } from '@vercel/node'
import { requireAuth } from '../../lib/auth'
import { prisma } from '../../lib/db'

async function handler(req: VercelRequest, res: VercelResponse, user: any) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' })
    }

    try {
        const { title, tracks } = req.body

        if (!title || !Array.isArray(tracks)) {
            return res.status(400).json({ error: 'Title and tracks array are required' })
        }

        // Filter to kept tracks only
        const keptTracks = tracks.filter((t: any) => t.kept === true)

        if (keptTracks.length === 0) {
            return res.status(400).json({ error: 'At least one track must be kept' })
        }

        // Calculate total duration
        const totalDurationSec = keptTracks.reduce((sum: number, t: any) => sum + (t.durationSec || 0), 0)

        // Create playlist
        const playlist = await prisma.playlist.create({
            data: {
                userId: user.userId,
                title,
                description: 'Personalized playlist based on your preferences',
                source: 'AUTO',
                moodTags: [],
                totalDurationSec,
                tracks: {
                    create: keptTracks.map((track: any, index: number) => ({
                        position: index,
                        trackId: track.trackId,
                        artistName: track.artistName,
                        title: track.title,
                        durationSec: track.durationSec || 0,
                        source: 'AUDIUS',
                    })),
                },
            },
            include: {
                tracks: {
                    orderBy: { position: 'asc' },
                },
            },
        })

        // Update feedback for all tracks
        for (const track of tracks) {
            await prisma.feedback.upsert({
                where: {
                    userId_trackId: {
                        userId: user.userId,
                        trackId: track.trackId,
                    },
                },
                create: {
                    userId: user.userId,
                    trackId: track.trackId,
                    score: track.kept ? 1 : -1,
                },
                update: {
                    score: track.kept ? 1 : -1,
                },
            })
        }

        return res.status(201).json({
            playlistId: playlist.id,
            title: playlist.title,
            tracks: playlist.tracks.map(track => ({
                trackId: track.trackId,
                title: track.title,
                artistName: track.artistName,
                durationSec: track.durationSec,
                position: track.position,
            })),
        })
    } catch (error) {
        console.error('Confirm playlist error:', error)
        return res.status(500).json({ error: 'Failed to confirm playlist' })
    }
}

export default requireAuth(handler)
