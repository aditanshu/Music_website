import { create } from 'zustand'
import type { Track } from '../types'

interface PlayerState {
    currentTrack: Track | null
    isPlaying: boolean
    queue: Track[]
    currentIndex: number
    progress: number
    duration: number
    volume: number

    setCurrentTrack: (track: Track) => void
    play: () => void
    pause: () => void
    togglePlay: () => void
    next: () => void
    previous: () => void
    setQueue: (tracks: Track[]) => void
    addToQueue: (track: Track) => void
    setProgress: (progress: number) => void
    setDuration: (duration: number) => void
    setVolume: (volume: number) => void
    clearQueue: () => void
}

export const usePlayer = create<PlayerState>((set, get) => ({
    currentTrack: null,
    isPlaying: false,
    queue: [],
    currentIndex: 0,
    progress: 0,
    duration: 0,
    volume: 0.7,

    setCurrentTrack: (track) => set({ currentTrack: track, isPlaying: true }),

    play: () => set({ isPlaying: true }),

    pause: () => set({ isPlaying: false }),

    togglePlay: () => set((state) => ({ isPlaying: !state.isPlaying })),

    next: () => {
        const { queue, currentIndex } = get()
        if (currentIndex < queue.length - 1) {
            const nextIndex = currentIndex + 1
            set({
                currentTrack: queue[nextIndex],
                currentIndex: nextIndex,
                isPlaying: true,
                progress: 0,
            })
        }
    },

    previous: () => {
        const { queue, currentIndex } = get()
        if (currentIndex > 0) {
            const prevIndex = currentIndex - 1
            set({
                currentTrack: queue[prevIndex],
                currentIndex: prevIndex,
                isPlaying: true,
                progress: 0,
            })
        }
    },

    setQueue: (tracks) => {
        set({
            queue: tracks,
            currentIndex: 0,
            currentTrack: tracks[0] || null,
            isPlaying: tracks.length > 0,
        })
    },

    addToQueue: (track) => {
        set((state) => ({
            queue: [...state.queue, track],
        }))
    },

    setProgress: (progress) => set({ progress }),

    setDuration: (duration) => set({ duration }),

    setVolume: (volume) => set({ volume }),

    clearQueue: () => set({ queue: [], currentIndex: 0, currentTrack: null, isPlaying: false }),
}))
