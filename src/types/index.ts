export interface User {
    id: string
    email: string
    name: string
    profileImageUrl?: string
    createdAt: string
}

export interface Track {
    trackId: string
    title: string
    artistName: string
    durationSec: number
    thumbnailUrl?: string
    streamUrl?: string
    genre?: string
    tags?: string[]
    streamUrlAvailable?: boolean
}

export interface Playlist {
    id: string
    title: string
    description?: string
    source: 'AI' | 'MANUAL' | 'AUTO'
    moodTags: string[]
    totalDurationSec: number
    createdAt: string
    tracks: PlaylistTrack[]
}

export interface PlaylistTrack {
    trackId: string
    title: string
    artistName: string
    durationSec: number
    position: number
}

export interface ListeningHistory {
    id: string
    trackId: string
    title: string
    artistName: string
    thumbnailUrl?: string
    playedMs: number
    skipped: boolean
    source: 'AI_PLAYLIST' | 'SEARCH' | 'HISTORY' | 'RECOMMENDED'
    playedAt: string
}

export interface SearchHistory {
    id: string
    query: string
    resultCount: number
    clickedTrackId?: string
    searchedAt: string
}

export interface PlaylistCandidate {
    tempId: string
    title: string
    subtitle: string
    tracks: Track[]
}
