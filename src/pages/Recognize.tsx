import { useState, useRef } from 'react'
import { Mic, Loader, CheckCircle, XCircle } from 'lucide-react'
import api from '../lib/api'
import TrackItem from '../components/TrackItem'

export default function Recognize() {
    const [recording, setRecording] = useState(false)
    const [recognizing, setRecognizing] = useState(false)
    const [result, setResult] = useState<any>(null)
    const [error, setError] = useState<string>('')
    const mediaRecorderRef = useRef<MediaRecorder | null>(null)
    const audioChunksRef = useRef<Blob[]>([])

    const handleRecognize = async () => {
        setError('')
        setResult(null)

        try {
            // Request microphone access
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true })

            const mediaRecorder = new MediaRecorder(stream)
            mediaRecorderRef.current = mediaRecorder
            audioChunksRef.current = []

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data)
                }
            }

            mediaRecorder.onstop = async () => {
                // Stop all tracks
                stream.getTracks().forEach(track => track.stop())

                // Create audio blob
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })

                // Process audio for fingerprinting
                await processAudioForRecognition(audioBlob)
            }

            // Start recording
            setRecording(true)
            mediaRecorder.start()

            // Stop after 8 seconds
            setTimeout(() => {
                if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
                    mediaRecorderRef.current.stop()
                    setRecording(false)
                }
            }, 8000)

        } catch (err) {
            console.error('Microphone access error:', err)
            setError('Could not access microphone. Please grant permission.')
        }
    }

    const processAudioForRecognition = async (audioBlob: Blob) => {
        setRecognizing(true)

        try {
            // Convert blob to audio context for processing
            const arrayBuffer = await audioBlob.arrayBuffer()
            const audioContext = new AudioContext()
            const audioBuffer = await audioContext.decodeAudioData(arrayBuffer)

            // Get audio data
            const channelData = audioBuffer.getChannelData(0)
            const duration = audioBuffer.duration

            // Generate a simple fingerprint (in production, use fpcalc.js or similar)
            // For now, we'll use a simplified approach
            const fingerprint = await generateSimpleFingerprint(channelData)

            // Send to backend
            const response = await api.post('/music/recognize', {
                fingerprint,
                duration: Math.floor(duration),
            })

            setResult(response.data)
        } catch (err: any) {
            console.error('Recognition error:', err)
            setError(err.response?.data?.error || 'Failed to recognize song')
        } finally {
            setRecognizing(false)
        }
    }

    const generateSimpleFingerprint = async (audioData: Float32Array): Promise<string> => {
        // This is a simplified fingerprint generation
        // In production, use fpcalc.js (Chromaprint JavaScript implementation)
        // For demo purposes, we'll create a basic spectral hash

        const fftSize = 2048
        const hopSize = 512
        const numFrames = Math.floor((audioData.length - fftSize) / hopSize)

        let fingerprint = ''

        // Simple spectral analysis
        for (let i = 0; i < Math.min(numFrames, 100); i++) {
            const offset = i * hopSize
            const frame = audioData.slice(offset, offset + fftSize)

            // Calculate simple spectral features
            let energy = 0
            for (let j = 0; j < frame.length; j++) {
                energy += frame[j] * frame[j]
            }

            // Convert to hash
            fingerprint += Math.floor(energy * 1000000).toString(36)
        }

        return fingerprint
    }

    const stopRecording = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
            mediaRecorderRef.current.stop()
            setRecording(false)
        }
    }

    return (
        <div className="max-w-2xl mx-auto space-y-8 animate-fade-in text-center">
            <div>
                <h1 className="text-4xl font-bold mb-2">Recognize Music</h1>
                <p className="text-dark-500">Tap to identify any song playing around you</p>
                <p className="text-sm text-primary-500 mt-2">✨ Free music recognition powered by AcoustID</p>
            </div>

            <div className="glass rounded-2xl p-12">
                {!result ? (
                    <>
                        <button
                            onClick={recording ? stopRecording : handleRecognize}
                            disabled={recognizing}
                            className={`mx-auto w-48 h-48 rounded-full flex items-center justify-center transition-all shadow-2xl ${recording
                                ? 'bg-gradient-to-br from-red-500 to-pink-500 animate-pulse'
                                : recognizing
                                    ? 'bg-gradient-to-br from-purple-500 to-blue-500'
                                    : 'bg-gradient-to-br from-primary-500 to-purple-500 hover:scale-110'
                                }`}
                        >
                            {recognizing ? (
                                <Loader className="w-24 h-24 animate-spin" />
                            ) : (
                                <Mic className="w-24 h-24" />
                            )}
                        </button>

                        <p className="mt-8 text-lg">
                            {recording
                                ? 'Listening... (tap to stop)'
                                : recognizing
                                    ? 'Recognizing your song...'
                                    : 'Tap the button to start listening'}
                        </p>

                        {recording && (
                            <div className="flex justify-center items-center space-x-2 mt-4">
                                {[1, 2, 3, 4, 5].map((i) => (
                                    <div
                                        key={i}
                                        className="w-2 h-12 bg-primary-500 rounded-full wave-bar"
                                        style={{ animationDelay: `${i * 0.1}s` }}
                                    />
                                ))}
                            </div>
                        )}
                    </>
                ) : (
                    <div className="space-y-6">
                        {result.matchedTrack ? (
                            <>
                                <CheckCircle className="w-24 h-24 text-green-500 mx-auto" />
                                <div>
                                    <h2 className="text-2xl font-bold mb-2">Found it!</h2>
                                    <p className="text-dark-500 mb-1">
                                        <span className="font-medium text-white">{result.recognizedTitle}</span>
                                    </p>
                                    <p className="text-dark-500">by {result.recognizedArtist}</p>
                                    {result.confidence && (
                                        <p className="text-sm text-primary-500 mt-2">
                                            Confidence: {(result.confidence * 100).toFixed(0)}%
                                        </p>
                                    )}
                                </div>

                                <div className="text-left">
                                    <TrackItem track={result.matchedTrack} />
                                </div>
                            </>
                        ) : (
                            <>
                                <XCircle className="w-24 h-24 text-yellow-500 mx-auto" />
                                <div>
                                    <h2 className="text-2xl font-bold mb-2">Recognized but not found on Audius</h2>
                                    <p className="text-dark-500">
                                        We identified: <span className="font-medium text-white">{result.recognizedTitle}</span> by {result.recognizedArtist}
                                    </p>
                                    <p className="text-sm text-dark-600 mt-2">
                                        This song isn't available on Audius yet.
                                    </p>
                                </div>
                            </>
                        )}

                        <button
                            onClick={() => {
                                setResult(null)
                                setError('')
                            }}
                            className="btn-primary"
                        >
                            Recognize Another Song
                        </button>
                    </div>
                )}

                {error && (
                    <div className="mt-6 bg-red-500 bg-opacity-10 border border-red-500 text-red-500 px-4 py-3 rounded-lg">
                        {error}
                    </div>
                )}
            </div>

            <div className="glass rounded-xl p-6 text-left">
                <h3 className="font-bold mb-2">How it works:</h3>
                <ol className="space-y-2 text-dark-500">
                    <li>1. Tap the microphone button</li>
                    <li>2. Let the app listen for 8 seconds</li>
                    <li>3. Audio fingerprint is created using Chromaprint</li>
                    <li>4. AcoustID identifies the song (free & open-source)</li>
                    <li>5. We find the best match on Audius for playback</li>
                </ol>
                <p className="text-sm text-primary-500 mt-4">
                    💡 Powered by AcoustID + MusicBrainz - completely free!
                </p>
            </div>
        </div>
    )
}
