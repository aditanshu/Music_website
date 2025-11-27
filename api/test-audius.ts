import type { VercelRequest, VercelResponse } from '@vercel/node'

export default async function handler(req: VercelRequest, res: VercelResponse) {
    try {
        // Test Audius search
        const searchResponse = await fetch('https://discoveryprovider.audius.co/v1/tracks/search?query=test&limit=5')
        const searchData = await searchResponse.json()
        
        console.log('Search response:', searchData)
        
        if (searchData.data && searchData.data.length > 0) {
            const firstTrack = searchData.data[0]
            const trackId = firstTrack.id
            
            // Test stream URL
            const streamUrl = `https://discoveryprovider.audius.co/v1/tracks/${trackId}/stream`
            const streamResponse = await fetch(streamUrl, { method: 'HEAD' })
            
            return res.json({
                success: true,
                searchWorking: searchResponse.ok,
                streamWorking: streamResponse.ok,
                sampleTrack: {
                    id: trackId,
                    title: firstTrack.title,
                    artist: firstTrack.user?.name,
                    streamUrl
                }
            })
        }
        
        return res.json({
            success: false,
            error: 'No tracks found in search'
        })
        
    } catch (error) {
        console.error('Audius test error:', error)
        return res.status(500).json({
            success: false,
            error: error.message
        })
    }
}
