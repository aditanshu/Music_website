import axios from 'axios'

const ACOUSTID_API_KEY = process.env.ACOUSTID_API_KEY || 'TS31YbBov5' // Free API key from https://acoustid.org
const ACOUSTID_API_URL = 'https://api.acoustid.org/v2/lookup'
const MUSICBRAINZ_API_URL = 'https://musicbrainz.org/ws/2'

export interface RecognitionResult {
    title: string
    artist: string
    album?: string
    releaseDate?: string
    duration?: number
    confidence?: number
}

/**
 * Recognize music from audio fingerprint using AcoustID
 * @param fingerprint - Chromaprint fingerprint string
 * @param duration - Audio duration in seconds
 */
export async function recognizeMusic(fingerprint: string, duration: number): Promise<RecognitionResult | null> {
    try {
        // Call AcoustID API
        const acoustidResponse = await axios.post(
            ACOUSTID_API_URL,
            new URLSearchParams({
                client: ACOUSTID_API_KEY,
                duration: duration.toString(),
                fingerprint: fingerprint,
                meta: 'recordings releasegroups',
            }),
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            }
        )

        const data = acoustidResponse.data

        if (data.status !== 'ok' || !data.results || data.results.length === 0) {
            console.error('AcoustID recognition failed:', data)
            return null
        }

        // Get the best match (highest score)
        const bestMatch = data.results[0]

        if (!bestMatch.recordings || bestMatch.recordings.length === 0) {
            return null
        }

        const recording = bestMatch.recordings[0]

        // Extract basic info
        const result: RecognitionResult = {
            title: recording.title || 'Unknown',
            artist: recording.artists?.[0]?.name || 'Unknown Artist',
            confidence: bestMatch.score,
        }

        // Get additional metadata from MusicBrainz if available
        if (recording.id) {
            try {
                const mbResponse = await axios.get(
                    `${MUSICBRAINZ_API_URL}/recording/${recording.id}`,
                    {
                        params: {
                            fmt: 'json',
                            inc: 'artist-credits+releases',
                        },
                        headers: {
                            'User-Agent': 'AIMusic/1.0 (contact@example.com)',
                        },
                    }
                )

                const mbData = mbResponse.data

                if (mbData.releases && mbData.releases.length > 0) {
                    result.album = mbData.releases[0].title
                    result.releaseDate = mbData.releases[0].date
                }

                if (mbData.length) {
                    result.duration = Math.floor(mbData.length / 1000)
                }
            } catch (mbError) {
                console.warn('MusicBrainz metadata fetch failed:', mbError)
                // Continue without additional metadata
            }
        }

        return result
    } catch (error) {
        console.error('Music recognition error:', error)
        return null
    }
}

/**
 * Get AcoustID API key from environment or use default
 */
export function getAcoustIDKey(): string {
    // For production, use environment variable
    // For development, you can get a free key from https://acoustid.org/new-application
    return process.env.ACOUSTID_API_KEY || ACOUSTID_API_KEY
}
