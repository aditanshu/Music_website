import type { VercelRequest, VercelResponse } from '@vercel/node'

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' })
    }

    try {
        const { id } = req.query
        const trackId = typeof id === 'string' ? id : ''

        if (!trackId) {
            return res.status(400).json({ error: 'Track ID is required' })
        }

        // Directly fetch from Audius without database caching
        const audiusUrl = `https://discoveryprovider.audius.co/v1/tracks/${trackId}`
        const response = await fetch(audiusUrl)
        
        if (!response.ok) {
            return res.status(404).json({ error: 'Track not found' })
        }

        const data = await response.json()
        const track = data.data

        if (!track) {
            return res.status(404).json({ error: 'Track not found' })
        }

        // Return track with stream URL
        return res.status(200).json({
            track: {
                trackId: track.id,
                title: track.title,
                artistName: track.user?.name || 'Unknown Artist',
                durationSec: track.duration,
                genre: track.genre,
                tags: track.tags || [],
                streamUrl: `/api/stream/${track.id}`,
                thumbnailUrl: track.artwork?.['480x480'] || track.artwork?.['150x150']
            }
        })
    } catch (error) {
        console.error('Get track error:', error)
        return res.status(500).json({ error: 'Failed to get track' })
    }
}
