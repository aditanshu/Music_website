import { Play, Plus } from 'lucide-react'
import { usePlayer } from '../contexts/PlayerContext'
import type { Track } from '../types'

interface TrackItemProps {
    track: Track
    onPlay?: () => void
    showAddToQueue?: boolean
}

export default function TrackItem({ track, onPlay, showAddToQueue = true }: TrackItemProps) {
    const { setCurrentTrack, addToQueue } = usePlayer()

    const handlePlay = () => {
        setCurrentTrack(track)
        onPlay?.()
    }

    const handleAddToQueue = (e: React.MouseEvent) => {
        e.stopPropagation()
        addToQueue(track)
    }

    const formatDuration = (seconds: number) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins}:${secs.toString().padStart(2, '0')}`
    }

    return (
        <div className="flex items-center space-x-4 p-3 rounded-lg hover:bg-dark-200 transition-all group">
            {/* Thumbnail */}
            <div className="relative flex-shrink-0">
                {track.thumbnailUrl ? (
                    <img
                        src={track.thumbnailUrl}
                        alt={track.title}
                        className="w-14 h-14 rounded-lg object-cover"
                    />
                ) : (
                    <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-primary-500 to-purple-500" />
                )}
                <button
                    onClick={handlePlay}
                    className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                >
                    <Play className="w-6 h-6 text-white" fill="white" />
                </button>
            </div>

            {/* Track Info */}
            <div className="flex-1 min-w-0">
                <h4 className="font-medium truncate">{track.title}</h4>
                <p className="text-sm text-dark-500 truncate">{track.artistName}</p>
            </div>

            {/* Duration & Actions */}
            <div className="flex items-center space-x-4">
                <span className="text-sm text-dark-500">{formatDuration(track.durationSec)}</span>
                {showAddToQueue && (
                    <button
                        onClick={handleAddToQueue}
                        className="p-2 hover:bg-dark-300 rounded-full transition-all opacity-0 group-hover:opacity-100"
                        title="Add to queue"
                    >
                        <Plus className="w-5 h-5" />
                    </button>
                )}
            </div>
        </div>
    )
}
