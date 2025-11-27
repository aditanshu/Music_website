import { useState } from 'react'
import { Sparkles, Loader } from 'lucide-react'
import api from '../lib/api'
import type { Playlist } from '../types'
import TrackItem from '../components/TrackItem'
import { usePlayer } from '../contexts/PlayerContext'

export default function PromptPlaylist() {
    const [prompt, setPrompt] = useState('')
    const [loading, setLoading] = useState(false)
    const [playlist, setPlaylist] = useState<Playlist | null>(null)
    const { setQueue } = usePlayer()

    const handleGenerate = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!prompt.trim()) return

        setLoading(true)

        try {
            const response = await api.post('/ai/prompt-playlist', { prompt })
            setPlaylist(response.data)
        } catch (error) {
            console.error('Failed to generate playlist:', error)
        } finally {
            setLoading(false)
        }
    }

    const handlePlayAll = () => {
        if (!playlist) return

        const tracks = playlist.tracks.map(t => ({
            trackId: t.trackId,
            title: t.title,
            artistName: t.artistName,
            durationSec: t.durationSec,
        }))

        setQueue(tracks)
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
            {/* Header */}
            <div className="text-center">
                <div className="flex items-center justify-center space-x-3 mb-4">
                    <Sparkles className="w-12 h-12 text-primary-500" />
                    <h1 className="text-4xl font-bold gradient-text">AI Playlist Generator</h1>
                </div>
                <p className="text-dark-500 text-lg">
                    Describe your perfect playlist in natural language, and let AI create it for you
                </p>
            </div>

            {/* Prompt Input */}
            <form onSubmit={handleGenerate} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium mb-2">Describe your vibe</label>
                    <textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="e.g., 'late night roadtrip, hindi english mix, emotional, 45 mins' or 'upbeat workout music, 30 minutes, high energy'"
                        className="input-field min-h-[120px] resize-none"
                        disabled={loading}
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading || !prompt.trim()}
                    className="btn-primary w-full flex items-center justify-center space-x-2"
                >
                    {loading ? (
                        <>
                            <Loader className="w-5 h-5 animate-spin" />
                            <span>Generating your playlist...</span>
                        </>
                    ) : (
                        <>
                            <Sparkles className="w-5 h-5" />
                            <span>Generate Playlist</span>
                        </>
                    )}
                </button>
            </form>

            {/* Example Prompts */}
            {!playlist && !loading && (
                <div className="glass rounded-xl p-6">
                    <h3 className="font-bold mb-4">Try these examples:</h3>
                    <div className="space-y-2">
                        {[
                            'Chill lofi beats for studying, 1 hour, instrumental',
                            'Energetic workout mix, 30 minutes, pop and hip-hop',
                            'Romantic dinner music, soft jazz and soul, 45 mins',
                            'Road trip playlist, indie and alternative, 2 hours',
                        ].map((example, i) => (
                            <button
                                key={i}
                                onClick={() => setPrompt(example)}
                                className="w-full text-left px-4 py-3 rounded-lg bg-dark-200 hover:bg-dark-300 transition-all text-sm"
                            >
                                {example}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Generated Playlist */}
            {playlist && (
                <div className="space-y-6 animate-slide-up">
                    <div className="glass rounded-xl p-6">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h2 className="text-2xl font-bold mb-2">{playlist.title}</h2>
                                <p className="text-dark-500">{playlist.description}</p>
                                <div className="flex items-center space-x-4 mt-2 text-sm text-dark-600">
                                    <span>{playlist.tracks.length} tracks</span>
                                    <span>•</span>
                                    <span>{Math.floor(playlist.totalDurationSec / 60)} minutes</span>
                                </div>
                            </div>
                            <button onClick={handlePlayAll} className="btn-primary">
                                Play All
                            </button>
                        </div>
                    </div>

                    <div className="space-y-2">
                        {playlist.tracks.map((track) => (
                            <TrackItem
                                key={track.trackId}
                                track={{
                                    trackId: track.trackId,
                                    title: track.title,
                                    artistName: track.artistName,
                                    durationSec: track.durationSec,
                                }}
                            />
                        ))}
                    </div>

                    <button
                        onClick={() => {
                            setPlaylist(null)
                            setPrompt('')
                        }}
                        className="btn-secondary w-full"
                    >
                        Generate Another Playlist
                    </button>
                </div>
            )}
        </div>
    )
}
