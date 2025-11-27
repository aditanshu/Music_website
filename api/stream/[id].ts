import type { VercelRequest, VercelResponse } from '@vercel/node'

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' })
    }

    try {
        const { id } = req.query
        const trackId = typeof id === 'string' ? id : ''

        if (!trackId) {
            return res.status(400).json({ error: 'Track ID required' })
        }

        console.log('Attempting to stream track:', trackId)
        const audiusUrl = `https://discoveryprovider.audius.co/v1/tracks/${trackId}/stream`
        console.log('Audius URL:', audiusUrl)
        
        const response = await fetch(audiusUrl)
        console.log('Audius response status:', response.status)
        
        if (!response.ok) {
            console.error('Audius stream failed:', response.status, response.statusText)
            return res.status(404).json({ error: 'Track not found or unavailable' })
        }

        // Set CORS headers
        res.setHeader('Access-Control-Allow-Origin', '*')
        res.setHeader('Content-Type', 'audio/mpeg')
        res.setHeader('Accept-Ranges', 'bytes')
        
        // Pipe the audio stream
        const buffer = await response.arrayBuffer()
        console.log('Audio buffer size:', buffer.byteLength)
        res.send(Buffer.from(buffer))
        
    } catch (error) {
        console.error('Stream proxy error:', error)
        res.status(500).json({ error: 'Stream failed' })
    }
}
