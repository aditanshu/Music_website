import { useRef, useState } from 'react'

export default function AudioTest() {
    const audioRef = useRef<HTMLAudioElement>(null)
    const [testUrl, setTestUrl] = useState('')
    const [status, setStatus] = useState('')

    const testAudio = () => {
        if (!audioRef.current || !testUrl) return
        
        const audio = audioRef.current
        audio.src = testUrl
        
        audio.onloadstart = () => setStatus('Loading...')
        audio.oncanplay = () => setStatus('Can play - trying to play...')
        audio.onplay = () => setStatus('Playing!')
        audio.onerror = (e) => setStatus(`Error: ${e}`)
        audio.onended = () => setStatus('Ended')
        
        audio.load()
        audio.play().catch(e => setStatus(`Play failed: ${e.message}`))
    }

    return (
        <div className="p-4 border rounded">
            <h3>Audio Test</h3>
            <input 
                type="text" 
                value={testUrl} 
                onChange={(e) => setTestUrl(e.target.value)}
                placeholder="Enter audio URL to test"
                className="w-full p-2 border rounded mb-2"
            />
            <button onClick={testAudio} className="bg-blue-500 text-white px-4 py-2 rounded">
                Test Audio
            </button>
            <p>Status: {status}</p>
            <audio ref={audioRef} controls className="w-full mt-2" />
        </div>
    )
}
