import axios from 'axios'

const AUDIUS_API_BASE = 'https://discoveryprovider.audius.co'

export interface AudiusTrack {
    id: string
    title: string
    user: {
        name: string
    }
    duration: number
    genre: string
    mood?: string
    tags?: string
    artwork?: {
        '150x150'?: string
        '480x480'?: string
        '1000x1000'?: string
    }
}

export interface NormalizedTrack {
    trackId: string
    title: string
    artistName: string
    durationSec: number
    thumbnailUrl?: string
    genre?: string
    tags?: string[]
    streamUrlAvailable: boolean
}

// Search for tracks
export async function searchTracks(query: string, limit: number = 20): Promise<NormalizedTrack[]> {
    try {
        const response = await axios.get(`${AUDIUS_API_BASE}/v1/tracks/search`, {
            params: {
                query,
                limit,
            },
        })

        const tracks: AudiusTrack[] = response.data.data || []

        return tracks.map(track => normalizeTrack(track))
    } catch (error) {
        console.error('Audius search error:', error)
        throw new Error('Failed to search tracks')
    }
}

// Get track by ID
export async function getTrackById(trackId: string): Promise<NormalizedTrack | null> {
    try {
        const response = await axios.get(`${AUDIUS_API_BASE}/v1/tracks/${trackId}`)

        if (!response.data.data) {
            return null
        }

        return normalizeTrack(response.data.data)
    } catch (error) {
        console.error('Audius get track error:', error)
        return null
    }
}

// Get stream URL for a track
export async function getStreamUrl(trackId: string): Promise<string | null> {
    try {
        // Audius stream URL format
        return `${AUDIUS_API_BASE}/v1/tracks/${trackId}/stream`
    } catch (error) {
        console.error('Audius stream URL error:', error)
        return null
    }
}

// Search tracks by genre and mood
export async function searchByGenreAndMood(
    genre?: string,
    mood?: string,
    limit: number = 20
): Promise<NormalizedTrack[]> {
    try {
        const query = [genre, mood].filter(Boolean).join(' ')
        return searchTracks(query, limit)
    } catch (error) {
        console.error('Audius genre/mood search error:', error)
        return []
    }
}

// Get trending tracks
export async function getTrendingTracks(genre?: string, limit: number = 20): Promise<NormalizedTrack[]> {
    try {
        const response = await axios.get(`${AUDIUS_API_BASE}/v1/tracks/trending`, {
            params: {
                genre,
                limit,
            },
        })

        const tracks: AudiusTrack[] = response.data.data || []
        return tracks.map(track => normalizeTrack(track))
    } catch (error) {
        console.error('Audius trending error:', error)
        return []
    }
}

// Normalize track data
function normalizeTrack(track: AudiusTrack): NormalizedTrack {
    return {
        trackId: track.id,
        title: track.title,
        artistName: track.user?.name || 'Unknown Artist',
        durationSec: track.duration,
        thumbnailUrl: track.artwork?.['480x480'] || track.artwork?.['150x150'],
        genre: track.genre,
        tags: track.tags ? track.tags.split(',').map(t => t.trim()) : [],
        streamUrlAvailable: true,
    }
}
