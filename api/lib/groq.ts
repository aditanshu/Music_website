import Groq from 'groq-sdk'

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
})

export interface PlaylistIntent {
    moods: string[]
    genres: string[]
    targetDurationMin: number
    languagePreferences: string[]
    energyCurve: ('low' | 'medium' | 'high')[]
    otherConstraints: string[]
}

export interface PlaylistMetadata {
    title: string
    description: string
}

// Extract playlist intent from natural language prompt
export async function extractPlaylistIntent(prompt: string): Promise<PlaylistIntent> {
    const systemPrompt = `You are a playlist generator AI. Your job is to analyze user prompts and extract structured playlist requirements.

Given a user's natural language description of their desired playlist, respond with ONLY a valid JSON object (no markdown, no explanation) with these fields:
- moods: array of mood keywords (e.g., ["chill", "energetic", "emotional"])
- genres: array of music genres (e.g., ["pop", "hip-hop", "indie"])
- targetDurationMin: target playlist duration in minutes (number)
- languagePreferences: array of language preferences (e.g., ["english", "hindi", "spanish"])
- energyCurve: array describing energy progression (e.g., ["low", "medium", "high"])
- otherConstraints: array of any other specific requirements

Example input: "late night roadtrip, hindi english mix, emotional, 45 mins"
Example output: {"moods":["late night","emotional","roadtrip"],"genres":["pop","indie"],"targetDurationMin":45,"languagePreferences":["hindi","english"],"energyCurve":["medium","medium","low"],"otherConstraints":["mix of languages"]}

Respond with ONLY the JSON object, nothing else.`

    try {
        const completion = await groq.chat.completions.create({
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: prompt },
            ],
            model: 'llama-3.1-70b-versatile',
            temperature: 0.7,
            max_tokens: 500,
        })

        const responseText = completion.choices[0]?.message?.content?.trim() || '{}'

        // Try to parse JSON
        try {
            const intent = JSON.parse(responseText)

            // Validate and provide defaults
            return {
                moods: Array.isArray(intent.moods) ? intent.moods : [],
                genres: Array.isArray(intent.genres) ? intent.genres : [],
                targetDurationMin: typeof intent.targetDurationMin === 'number' ? intent.targetDurationMin : 30,
                languagePreferences: Array.isArray(intent.languagePreferences) ? intent.languagePreferences : [],
                energyCurve: Array.isArray(intent.energyCurve) ? intent.energyCurve : ['medium'],
                otherConstraints: Array.isArray(intent.otherConstraints) ? intent.otherConstraints : [],
            }
        } catch (parseError) {
            console.error('Failed to parse Groq response:', responseText)

            // Retry with explicit JSON instruction
            const retryCompletion = await groq.chat.completions.create({
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: prompt },
                    { role: 'assistant', content: responseText },
                    { role: 'user', content: 'Please respond with ONLY valid JSON, no other text.' },
                ],
                model: 'llama-3.1-70b-versatile',
                temperature: 0.5,
                max_tokens: 500,
            })

            const retryText = retryCompletion.choices[0]?.message?.content?.trim() || '{}'
            const intent = JSON.parse(retryText)

            return {
                moods: Array.isArray(intent.moods) ? intent.moods : [],
                genres: Array.isArray(intent.genres) ? intent.genres : [],
                targetDurationMin: typeof intent.targetDurationMin === 'number' ? intent.targetDurationMin : 30,
                languagePreferences: Array.isArray(intent.languagePreferences) ? intent.languagePreferences : [],
                energyCurve: Array.isArray(intent.energyCurve) ? intent.energyCurve : ['medium'],
                otherConstraints: Array.isArray(intent.otherConstraints) ? intent.otherConstraints : [],
            }
        }
    } catch (error) {
        console.error('Groq API error:', error)
        throw new Error('Failed to extract playlist intent')
    }
}

// Generate playlist title and description
export async function generatePlaylistMetadata(
    prompt: string,
    intent: PlaylistIntent,
    trackCount: number
): Promise<PlaylistMetadata> {
    const systemPrompt = `You are a creative playlist naming assistant. Given a user's playlist request and the extracted intent, generate a catchy title and brief description.

Respond with ONLY a valid JSON object with these fields:
- title: a short, catchy playlist title (max 50 characters)
- description: a brief 1-2 sentence description

Example: {"title":"Late Night Vibes","description":"Emotional Hindi-English mix perfect for late night roadtrips. 45 minutes of soulful tunes."}`

    try {
        const completion = await groq.chat.completions.create({
            messages: [
                { role: 'system', content: systemPrompt },
                {
                    role: 'user',
                    content: `User prompt: "${prompt}"\nMoods: ${intent.moods.join(', ')}\nGenres: ${intent.genres.join(', ')}\nDuration: ${intent.targetDurationMin} minutes\nTracks: ${trackCount}\n\nGenerate title and description:`,
                },
            ],
            model: 'llama-3.1-70b-versatile',
            temperature: 0.8,
            max_tokens: 200,
        })

        const responseText = completion.choices[0]?.message?.content?.trim() || '{}'
        const metadata = JSON.parse(responseText)

        return {
            title: metadata.title || 'AI Generated Playlist',
            description: metadata.description || 'A playlist created just for you.',
        }
    } catch (error) {
        console.error('Groq metadata generation error:', error)
        return {
            title: 'AI Generated Playlist',
            description: 'A personalized playlist based on your preferences.',
        }
    }
}
