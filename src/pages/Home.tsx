import { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Sparkles, Search as SearchIcon, Mic } from 'lucide-react'
import { Link } from 'react-router-dom'
import api from '../lib/api'
import type { PlaylistCandidate } from '../types'
import TrackItem from '../components/TrackItem'

export default function Home() {
    const { user } = useAuth()
    const [suggestions, setSuggestions] = useState<PlaylistCandidate[]>([])
    const [loading, setLoading] = useState(true)
    const [showSuggestionPopup, setShowSuggestionPopup] = useState(false)
    const [selectedCandidate, setSelectedCandidate] = useState<PlaylistCandidate | null>(null)

    useEffect(() => {
        loadSuggestions()
    }, [])

    const loadSuggestions = async () => {
        try {
            const response = await api.get('/home/suggestions')
            setSuggestions(response.data.candidates || [])
            if (response.data.candidates?.length > 0) {
                setShowSuggestionPopup(true)
                setSelectedCandidate(response.data.candidates[0])
            }
        } catch (error) {
            console.error('Failed to load suggestions:', error)
        } finally {
            setLoading(false)
        }
    }

    const getGreeting = () => {
        const hour = new Date().getHours()
        if (hour < 12) return 'Good morning'
        if (hour < 18) return 'Good afternoon'
        return 'Good evening'
    }

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Greeting */}
            <div>
                <h1 className="text-4xl font-bold mb-2">
                    {getGreeting()}, {user?.name}
                </h1>
                <p className="text-dark-500">What would you like to listen to today?</p>
            </div>

            {/* Quick Actions */}
            <div className="grid md:grid-cols-3 gap-6">
                <Link
                    to="/prompt"
                    className="card hover:scale-105 transition-transform cursor-pointer group"
                >
                    <div className="flex items-center space-x-4">
                        <div className="p-4 bg-gradient-to-br from-primary-500 to-purple-500 rounded-xl group-hover:scale-110 transition-transform">
                            <Sparkles className="w-8 h-8" />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg">AI Playlist</h3>
                            <p className="text-sm text-dark-500">Describe your vibe</p>
                        </div>
                    </div>
                </Link>

                <Link
                    to="/search"
                    className="card hover:scale-105 transition-transform cursor-pointer group"
                >
                    <div className="flex items-center space-x-4">
                        <div className="p-4 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl group-hover:scale-110 transition-transform">
                            <SearchIcon className="w-8 h-8" />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg">Search Music</h3>
                            <p className="text-sm text-dark-500">Find your favorite tracks</p>
                        </div>
                    </div>
                </Link>

                <Link
                    to="/recognize"
                    className="card hover:scale-105 transition-transform cursor-pointer group"
                >
                    <div className="flex items-center space-x-4">
                        <div className="p-4 bg-gradient-to-br from-pink-500 to-rose-500 rounded-xl group-hover:scale-110 transition-transform">
                            <Mic className="w-8 h-8" />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg">Recognize Song</h3>
                            <p className="text-sm text-dark-500">What's playing?</p>
                        </div>
                    </div>
                </Link>
            </div>

            {/* Suggestion Popup */}
            {showSuggestionPopup && selectedCandidate && (
                <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4 animate-fade-in">
                    <div className="glass rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto p-6">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h2 className="text-2xl font-bold mb-1">{selectedCandidate.title}</h2>
                                <p className="text-dark-500">{selectedCandidate.subtitle}</p>
                            </div>
                            <button
                                onClick={() => setShowSuggestionPopup(false)}
                                className="text-dark-500 hover:text-white transition-colors text-2xl"
                            >
                                ×
                            </button>
                        </div>

                        {/* Candidate Tabs */}
                        <div className="flex space-x-2 mb-6 overflow-x-auto">
                            {suggestions.map((candidate) => (
                                <button
                                    key={candidate.tempId}
                                    onClick={() => setSelectedCandidate(candidate)}
                                    className={`px-4 py-2 rounded-lg whitespace-nowrap transition-all ${selectedCandidate.tempId === candidate.tempId
                                            ? 'bg-primary-500 text-white'
                                            : 'bg-dark-200 text-dark-500 hover:bg-dark-300'
                                        }`}
                                >
                                    {candidate.title}
                                </button>
                            ))}
                        </div>

                        {/* Track List */}
                        <div className="space-y-2 mb-6">
                            {selectedCandidate.tracks.map((track) => (
                                <TrackItem key={track.trackId} track={track} />
                            ))}
                        </div>

                        <div className="flex space-x-4">
                            <button
                                onClick={() => setShowSuggestionPopup(false)}
                                className="btn-secondary flex-1"
                            >
                                Skip
                            </button>
                            <button
                                onClick={() => {
                                    // TODO: Implement playlist confirmation
                                    setShowSuggestionPopup(false)
                                }}
                                className="btn-primary flex-1"
                            >
                                Save Playlist
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Recommended Section */}
            {loading ? (
                <div className="space-y-4">
                    <div className="skeleton h-8 w-48 rounded"></div>
                    <div className="grid md:grid-cols-3 gap-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="skeleton h-48 rounded-xl"></div>
                        ))}
                    </div>
                </div>
            ) : (
                <div>
                    <h2 className="text-2xl font-bold mb-4">Recommended for You</h2>
                    <div className="grid md:grid-cols-3 gap-6">
                        {suggestions.map((candidate) => (
                            <div key={candidate.tempId} className="card cursor-pointer hover:scale-105 transition-transform">
                                <h3 className="font-bold mb-2">{candidate.title}</h3>
                                <p className="text-sm text-dark-500 mb-4">{candidate.subtitle}</p>
                                <p className="text-xs text-dark-600">{candidate.tracks.length} tracks</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}
