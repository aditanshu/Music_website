import type { VercelRequest, VercelResponse } from '@vercel/node'
import { requireAuth } from '../lib/auth'
import { recognizeMusic } from '../lib/music-recognition'
import { searchTracks } from '../lib/audius'

async function handler(req: VercelRequest, res: VercelResponse, user: any) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' })
    }

    try {
        const { fingerprint, duration } = req.body

        if (!fingerprint || !duration) {
            return res.status(400).json({ error: 'Fingerprint and duration are required' })
        }

        // Recognize music using AcoustID
        const recognition = await recognizeMusic(fingerprint, duration)

        if (!recognition) {
            return res.status(404).json({ error: 'Could not recognize the song' })
        }

        // Search Audius for the recognized track
        const searchQuery = `${recognition.title} ${recognition.artist}`
        const audiusTracks = await searchTracks(searchQuery, 5)

        const matchedTrack = audiusTracks[0] || null

        return res.status(200).json({
            recognizedTitle: recognition.title,
            recognizedArtist: recognition.artist,
            recognizedAlbum: recognition.album,
            confidence: recognition.confidence,
            matchedTrack: matchedTrack ? {
                trackId: matchedTrack.trackId,
                title: matchedTrack.title,
                artistName: matchedTrack.artistName,
                durationSec: matchedTrack.durationSec,
                thumbnailUrl: matchedTrack.thumbnailUrl,
                streamUrlAvailable: matchedTrack.streamUrlAvailable,
            } : null,
        })
    } catch (error) {
        console.error('Music recognition error:', error)
        return res.status(500).json({ error: 'Failed to recognize music' })
    }
}

export default requireAuth(handler)
