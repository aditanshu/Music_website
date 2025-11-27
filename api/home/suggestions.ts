import type { VercelRequest, VercelResponse } from '@vercel/node'

export default async function handler(req: VercelRequest, res: VercelResponse) {
    try {
        // Return trending tracks from Audius as suggestions
        const response = await fetch('https://discoveryprovider.audius.co/v1/tracks/trending?limit=10')
        const data = await response.json()
        
        if (data.data) {
            const tracks = data.data.map((track: any) => ({
                trackId: track.id,
                title: track.title,
                artistName: track.user?.name || 'Unknown Artist',
                durationSec: track.duration,
                genre: track.genre,
                thumbnailUrl: track.artwork?.['480x480'] || track.artwork?.['150x150']
            }))
            
            return res.status(200).json({ tracks })
        }
        
        return res.status(200).json({ tracks: [] })
    } catch (error) {
        console.error('Suggestions error:', error)
        return res.status(200).json({ tracks: [] })
    }
}
