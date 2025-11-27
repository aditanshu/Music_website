import { useRef } from 'react'

export default function SimpleAudioTest() {
    const audioRef = useRef<HTMLAudioElement>(null)
    
    const testPlay = () => {
        if (audioRef.current) {
            // Test with a known working audio URL
            audioRef.current.src = 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav'
            audioRef.current.play().catch(console.error)
        }
    }
    
    return (
        <div className="p-4 border rounded">
            <button onClick={testPlay} className="bg-green-500 text-white px-4 py-2 rounded">
                Test Audio (Bell Sound)
            </button>
            <audio ref={audioRef} controls className="w-full mt-2" />
        </div>
    )
}
