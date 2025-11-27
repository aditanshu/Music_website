import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import Navbar from './components/Navbar'
import PlayerBar from './components/PlayerBar'
import Auth from './pages/Auth'
import Home from './pages/Home'
import Search from './pages/Search'
import PromptPlaylist from './pages/PromptPlaylist'
import History from './pages/History'
import Recognize from './pages/Recognize'
import Profile from './pages/Profile'

function App() {
    const { user, loading } = useAuth()

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-dark-500">Loading...</p>
                </div>
            </div>
        )
    }

    if (!user) {
        return (
            <Routes>
                <Route path="/auth" element={<Auth />} />
                <Route path="*" element={<Navigate to="/auth" replace />} />
            </Routes>
        )
    }

    return (
        <div className="min-h-screen flex flex-col pb-24">
            <Navbar />
            <main className="flex-1 container mx-auto px-4 py-8 max-w-7xl">
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/search" element={<Search />} />
                    <Route path="/prompt" element={<PromptPlaylist />} />
                    <Route path="/history" element={<History />} />
                    <Route path="/recognize" element={<Recognize />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </main>
            <PlayerBar />
        </div>
    )
}

export default App
