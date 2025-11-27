import { useState } from 'react'
import { Search as SearchIcon } from 'lucide-react'
import api from '../lib/api'
import type { Track } from '../types'
import TrackItem from '../components/TrackItem'

export default function Search() {
    const [query, setQuery] = useState('')
    const [tracks, setTracks] = useState<Track[]>([])
    const [loading, setLoading] = useState(false)
    const [searched, setSearched] = useState(false)

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!query.trim()) return

        setLoading(true)
        setSearched(true)

        try {
            const response = await api.get('/search/tracks', {
                params: { q: query, limit: 30 },
            })
            setTracks(response.data.tracks || [])
        } catch (error) {
            console.error('Search failed:', error)
            setTracks([])
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
            {/* Search Header */}
            <div>
                <h1 className="text-4xl font-bold mb-2">Search Music</h1>
                <p className="text-dark-500">Find your favorite tracks and artists</p>
            </div>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="relative">
                <SearchIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-dark-500" />
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search for songs, artists, or genres..."
                    className="input-field pl-12 text-lg"
                />
                <button
                    type="submit"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 btn-primary"
                >
                    Search
                </button>
            </form>

            {/* Results */}
            {loading ? (
                <div className="space-y-4">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="skeleton h-20 rounded-lg"></div>
                    ))}
                </div>
            ) : searched ? (
                <div>
                    <h2 className="text-xl font-bold mb-4">
                        {tracks.length > 0 ? `Found ${tracks.length} tracks` : 'No tracks found'}
                    </h2>
                    <div className="space-y-2">
                        {tracks.map((track) => (
                            <TrackItem key={track.trackId} track={track} />
                        ))}
                    </div>
                </div>
            ) : (
                <div className="text-center py-16">
                    <SearchIcon className="w-16 h-16 text-dark-500 mx-auto mb-4" />
                    <p className="text-dark-500">Start searching to discover music</p>
                </div>
            )}
        </div>
    )
}
