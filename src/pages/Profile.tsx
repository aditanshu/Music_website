import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Camera } from 'lucide-react'

export default function Profile() {
    const { user, updateProfile } = useAuth()
    const [name, setName] = useState(user?.name || '')
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState('')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setMessage('')

        try {
            await updateProfile({ name })
            setMessage('Profile updated successfully!')
        } catch (error) {
            setMessage('Failed to update profile')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="max-w-2xl mx-auto space-y-8 animate-fade-in">
            <div>
                <h1 className="text-4xl font-bold mb-2">Profile</h1>
                <p className="text-dark-500">Manage your account settings</p>
            </div>

            <div className="card">
                {/* Profile Picture */}
                <div className="flex items-center space-x-6 mb-8">
                    {user?.profileImageUrl ? (
                        <img
                            src={user.profileImageUrl}
                            alt={user.name}
                            className="w-24 h-24 rounded-full object-cover"
                        />
                    ) : (
                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary-500 to-purple-500 flex items-center justify-center text-4xl font-bold">
                            {user?.name.charAt(0).toUpperCase()}
                        </div>
                    )}
                    <button className="btn-secondary flex items-center space-x-2">
                        <Camera className="w-5 h-5" />
                        <span>Change Photo</span>
                    </button>
                </div>

                {/* Profile Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium mb-2">Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="input-field"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">Email</label>
                        <input
                            type="email"
                            value={user?.email}
                            className="input-field bg-dark-300 cursor-not-allowed"
                            disabled
                        />
                        <p className="text-xs text-dark-500 mt-1">Email cannot be changed</p>
                    </div>

                    {message && (
                        <div className={`px-4 py-3 rounded-lg ${message.includes('success')
                                ? 'bg-green-500 bg-opacity-10 border border-green-500 text-green-500'
                                : 'bg-red-500 bg-opacity-10 border border-red-500 text-red-500'
                            }`}>
                            {message}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="btn-primary w-full"
                    >
                        {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                </form>
            </div>
        </div>
    )
}
