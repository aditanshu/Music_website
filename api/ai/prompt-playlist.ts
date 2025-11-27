import type { VercelRequest, VercelResponse } from '@vercel/node'
import { requireAuth } from '../../lib/auth'
import { extractPlaylistIntent, generatePlaylistMetadata } from '../../lib/groq'
import { searchTracks, searchByGenreAndMood } from '../../lib/audius'
import { prisma } from '../../lib/db'

async function handler(req: VercelRequest, res: VercelResponse, user: any) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' })
    }

    try {
        const { prompt } = req.body

        if (!prompt || typeof prompt !== 'string') {
            return res.status(400).json({ error: 'Prompt is required' })
        }

        // Step 1: Extract intent using Groq AI
        const intent = await extractPlaylistIntent(prompt)

        // Step 2: Search for tracks based on intent
        const targetDurationSec = intent.targetDurationMin * 60
        let allTracks: any[] = []
        let currentDuration = 0

        // Search by moods and genres
        const searchQueries = [
            ...intent.moods.map(mood => `${mood} ${intent.languagePreferences.join(' ')}`),
            ...intent.genres.map(genre => `${genre} ${intent.languagePreferences.join(' ')}`),
        ]

        // If we have specific genre/mood combinations, search for those
        for (const genre of intent.genres) {
            for (const mood of intent.moods) {
                const tracks = await searchByGenreAndMood(genre, mood, 10)
                allTracks.push(...tracks)
            }
        }

        // Also do general searches
        for (const query of searchQueries.slice(0, 3)) {
            const tracks = await searchTracks(query, 10)
            allTracks.push(...tracks)
        }

        // Remove duplicates
        const uniqueTracks = Array.from(
            new Map(allTracks.map(track => [track.trackId, track])).values()
        )

        // Select tracks to match target duration
        const selectedTracks: any[] = []
        const shuffled = uniqueTracks.sort(() => Math.random() - 0.5)

        for (const track of shuffled) {
            if (currentDuration >= targetDurationSec) break
            selectedTracks.push(track)
            currentDuration += track.durationSec
        }

        // Ensure we have at least some tracks
        if (selectedTracks.length === 0) {
            return res.status(404).json({ error: 'No tracks found matching your criteria' })
        }

        // Step 3: Generate playlist metadata
        const metadata = await generatePlaylistMetadata(prompt, intent, selectedTracks.length)

        // Step 4: Save playlist to database
        const playlist = await prisma.playlist.create({
            data: {
                userId: user.userId,
                title: metadata.title,
                description: metadata.description,
                source: 'AI',
                moodTags: intent.moods,
                totalDurationSec: currentDuration,
                tracks: {
                    create: selectedTracks.map((track, index) => ({
                        position: index,
                        trackId: track.trackId,
                        artistName: track.artistName,
                        title: track.title,
                        durationSec: track.durationSec,
                        source: 'AUDIUS',
                    })),
                },
            },
            include: {
                tracks: {
                    orderBy: { position: 'asc' },
                },
            },
        })

        return res.status(201).json({
            playlistId: playlist.id,
            title: playlist.title,
            description: playlist.description,
            totalDurationSec: playlist.totalDurationSec,
            tracks: playlist.tracks.map(track => ({
                trackId: track.trackId,
                title: track.title,
                artistName: track.artistName,
                durationSec: track.durationSec,
                position: track.position,
            })),
        })
    } catch (error) {
        console.error('AI playlist generation error:', error)
        return res.status(500).json({ error: 'Failed to generate playlist' })
    }
}

export default requireAuth(handler)
