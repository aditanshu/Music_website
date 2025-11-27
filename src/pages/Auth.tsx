import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Music, Mail, Lock, User } from 'lucide-react'

export default function Auth() {
    const [isLogin, setIsLogin] = useState(true)
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [name, setName] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const { login, register } = useAuth()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        try {
            if (isLogin) {
                await login(email, password)
            } else {
                if (!name) {
                    setError('Name is required')
                    setLoading(false)
                    return
                }
                await register(email, password, name)
            }
        } catch (err: any) {
            setError(err.response?.data?.error || 'Authentication failed')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center px-4">
            <div className="w-full max-w-5xl grid md:grid-cols-2 gap-8 items-center">
                {/* Left Side - Branding */}
                <div className="text-center md:text-left space-y-6">
                    <div className="flex items-center justify-center md:justify-start space-x-3">
                        <Music className="w-16 h-16 text-primary-500" />
                        <h1 className="text-5xl font-bold gradient-text">AI Music</h1>
                    </div>
                    <h2 className="text-3xl font-bold">Your Vibe, Powered by AI</h2>
                    <p className="text-lg text-dark-500">
                        Experience ad-free music streaming with AI-powered playlists, smart recommendations, and music recognition.
                    </p>
                    <div className="space-y-2 text-dark-500">
                        <p className="flex items-center space-x-2">
                            <span className="w-2 h-2 bg-primary-500 rounded-full"></span>
                            <span>Natural language playlist generation</span>
                        </p>
                        <p className="flex items-center space-x-2">
                            <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                            <span>Smart music recommendations</span>
                        </p>
                        <p className="flex items-center space-x-2">
                            <span className="w-2 h-2 bg-primary-500 rounded-full"></span>
                            <span>Shazam-like music recognition</span>
                        </p>
                    </div>
                </div>

                {/* Right Side - Auth Form */}
                <div className="card">
                    <h3 className="text-2xl font-bold mb-6">{isLogin ? 'Welcome Back' : 'Create Account'}</h3>

                    {error && (
                        <div className="bg-red-500 bg-opacity-10 border border-red-500 text-red-500 px-4 py-3 rounded-lg mb-4">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {!isLogin && (
                            <div>
                                <label className="block text-sm font-medium mb-2">Name</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-dark-500" />
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="input-field pl-10"
                                        placeholder="Your name"
                                        required={!isLogin}
                                    />
                                </div>
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium mb-2">Email</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-dark-500" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="input-field pl-10"
                                    placeholder="your@email.com"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-dark-500" />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="input-field pl-10"
                                    placeholder="••••••••"
                                    required
                                    minLength={6}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary w-full"
                        >
                            {loading ? 'Loading...' : isLogin ? 'Sign In' : 'Create Account'}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <button
                            onClick={() => setIsLogin(!isLogin)}
                            className="text-primary-500 hover:text-primary-400 transition-colors"
                        >
                            {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
