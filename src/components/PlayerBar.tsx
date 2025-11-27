import { useEffect, useRef, useState } from 'react'
import { usePlayer } from '../contexts/PlayerContext'
import { Play, Pause, SkipBack, SkipForward, Volume2 } from 'lucide-react'
import api from '../lib/api'

export default function PlayerBar() {
    const {
        currentTrack,
        isPlaying,
        progress,
        duration,
        volume,
        togglePlay,
        next,
        previous,
        setProgress,
        setDuration,
        setVolume,
    } = usePlayer()

    const audioRef = useRef<HTMLAudioElement>(null)
    const [isDragging, setIsDragging] = useState(false)

    useEffect(() => {
        if (!audioRef.current || !currentTrack) return

        const audio = audioRef.current

        // Load track
        const loadTrack = async () => {
            try {
                const response = await api.get(`/tracks/${currentTrack.trackId}`)
                const streamUrl = response.data.track.streamUrl

                if (streamUrl) {
                    audio.src = streamUrl
                    audio.load()
                }
            } catch (error) {
                console.error('Failed to load track:', error)
            }
        }

        loadTrack()
    }, [currentTrack])

    useEffect(() => {
        if (!audioRef.current) return

        if (isPlaying) {
            audioRef.current.play().catch(console.error)
        } else {
            audioRef.current.pause()
        }
    }, [isPlaying])

    useEffect(() => {
        if (!audioRef.current) return
        audioRef.current.volume = volume
    }, [volume])

    const handleTimeUpdate = () => {
        if (!audioRef.current || isDragging) return
        setProgress(audioRef.current.currentTime)
    }

    const handleLoadedMetadata = () => {
        if (!audioRef.current) return
        setDuration(audioRef.current.duration)
    }

    const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!audioRef.current || !duration) return

        const rect = e.currentTarget.getBoundingClientRect()
        const percent = (e.clientX - rect.left) / rect.width
        const newTime = percent * duration

        audioRef.current.currentTime = newTime
        setProgress(newTime)
    }

    const formatTime = (seconds: number) => {
        if (isNaN(seconds)) return '0:00'
        const mins = Math.floor(seconds / 60)
        const secs = Math.floor(seconds % 60)
        return `${mins}:${secs.toString().padStart(2, '0')}`
    }

    const handleEnded = () => {
        next()
    }

    if (!currentTrack) return null

    return (
        <div className="fixed bottom-0 left-0 right-0 glass border-t border-dark-300 z-50">
            <audio
                ref={audioRef}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onEnded={handleEnded}
            />

            <div className="container mx-auto px-4 py-4 max-w-7xl">
                {/* Progress Bar */}
                <div
                    className="progress-bar mb-4 cursor-pointer"
                    onClick={handleProgressClick}
                >
                    <div
                        className="progress-fill"
                        style={{ width: `${duration ? (progress / duration) * 100 : 0}%` }}
                    />
                </div>

                <div className="flex items-center justify-between">
                    {/* Track Info */}
                    <div className="flex items-center space-x-4 flex-1 min-w-0">
                        {currentTrack.thumbnailUrl && (
                            <img
                                src={currentTrack.thumbnailUrl}
                                alt={currentTrack.title}
                                className="w-14 h-14 rounded-lg object-cover"
                            />
                        )}
                        <div className="min-w-0 flex-1">
                            <h4 className="font-semibold truncate">{currentTrack.title}</h4>
                            <p className="text-sm text-dark-500 truncate">{currentTrack.artistName}</p>
                        </div>
                    </div>

                    {/* Controls */}
                    <div className="flex items-center space-x-4 mx-8">
                        <button
                            onClick={previous}
                            className="p-2 hover:bg-dark-200 rounded-full transition-all"
                        >
                            <SkipBack className="w-5 h-5" />
                        </button>
                        <button
                            onClick={togglePlay}
                            className="p-3 bg-primary-500 hover:bg-primary-600 rounded-full transition-all hover:scale-110"
                        >
                            {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
                        </button>
                        <button
                            onClick={next}
                            className="p-2 hover:bg-dark-200 rounded-full transition-all"
                        >
                            <SkipForward className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Time & Volume */}
                    <div className="flex items-center space-x-4 flex-1 justify-end">
                        <span className="text-sm text-dark-500">
                            {formatTime(progress)} / {formatTime(duration)}
                        </span>
                        <div className="flex items-center space-x-2">
                            <Volume2 className="w-5 h-5 text-dark-500" />
                            <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.01"
                                value={volume}
                                onChange={(e) => setVolume(parseFloat(e.target.value))}
                                className="w-24 accent-primary-500"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
