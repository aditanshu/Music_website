import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Music, Search, Sparkles, History, Mic, User, LogOut } from 'lucide-react'
import { useState } from 'react'

export default function Navbar() {
    const { user, logout } = useAuth()
    const location = useLocation()
    const [showDropdown, setShowDropdown] = useState(false)

    const isActive = (path: string) => location.pathname === path

    const handleLogout = async () => {
        try {
            await logout()
        } catch (error) {
            console.error('Logout failed:', error)
        }
    }

    return (
        <nav className="glass sticky top-0 z-50 border-b border-dark-300">
            <div className="container mx-auto px-4 py-4 max-w-7xl">
                <div className="flex items-center justify-between">
                    {/* Logo */}
                    <Link to="/" className="flex items-center space-x-2 group">
                        <Music className="w-8 h-8 text-primary-500 group-hover:scale-110 transition-transform" />
                        <span className="text-2xl font-bold gradient-text">AI Music</span>
                    </Link>

                    {/* Navigation Links */}
                    <div className="hidden md:flex items-center space-x-1">
                        <Link
                            to="/"
                            className={`px-4 py-2 rounded-lg transition-all ${isActive('/') ? 'bg-primary-500 text-white' : 'text-dark-500 hover:bg-dark-200'
                                }`}
                        >
                            Home
                        </Link>
                        <Link
                            to="/search"
                            className={`px-4 py-2 rounded-lg transition-all flex items-center space-x-2 ${isActive('/search') ? 'bg-primary-500 text-white' : 'text-dark-500 hover:bg-dark-200'
                                }`}
                        >
                            <Search className="w-4 h-4" />
                            <span>Search</span>
                        </Link>
                        <Link
                            to="/prompt"
                            className={`px-4 py-2 rounded-lg transition-all flex items-center space-x-2 ${isActive('/prompt') ? 'bg-primary-500 text-white' : 'text-dark-500 hover:bg-dark-200'
                                }`}
                        >
                            <Sparkles className="w-4 h-4" />
                            <span>AI Playlist</span>
                        </Link>
                        <Link
                            to="/recognize"
                            className={`px-4 py-2 rounded-lg transition-all flex items-center space-x-2 ${isActive('/recognize') ? 'bg-primary-500 text-white' : 'text-dark-500 hover:bg-dark-200'
                                }`}
                        >
                            <Mic className="w-4 h-4" />
                            <span>Recognize</span>
                        </Link>
                        <Link
                            to="/history"
                            className={`px-4 py-2 rounded-lg transition-all flex items-center space-x-2 ${isActive('/history') ? 'bg-primary-500 text-white' : 'text-dark-500 hover:bg-dark-200'
                                }`}
                        >
                            <History className="w-4 h-4" />
                            <span>History</span>
                        </Link>
                    </div>

                    {/* Profile Dropdown */}
                    <div className="relative">
                        <button
                            onClick={() => setShowDropdown(!showDropdown)}
                            className="flex items-center space-x-2 hover:bg-dark-200 px-3 py-2 rounded-lg transition-all"
                        >
                            {user?.profileImageUrl ? (
                                <img src={user.profileImageUrl} alt={user.name} className="w-8 h-8 rounded-full" />
                            ) : (
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-purple-500 flex items-center justify-center text-white font-bold">
                                    {user?.name.charAt(0).toUpperCase()}
                                </div>
                            )}
                            <span className="hidden md:block text-sm font-medium">{user?.name}</span>
                        </button>

                        {showDropdown && (
                            <div className="absolute right-0 mt-2 w-48 glass rounded-lg shadow-xl py-2 animate-slide-down">
                                <Link
                                    to="/profile"
                                    onClick={() => setShowDropdown(false)}
                                    className="flex items-center space-x-2 px-4 py-2 hover:bg-dark-200 transition-all"
                                >
                                    <User className="w-4 h-4" />
                                    <span>Profile</span>
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center space-x-2 px-4 py-2 hover:bg-dark-200 transition-all text-left"
                                >
                                    <LogOut className="w-4 h-4" />
                                    <span>Logout</span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    )
}
