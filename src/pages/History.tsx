import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import api from '../lib/api'
import type { ListeningHistory, SearchHistory } from '../types'
import TrackItem from '../components/TrackItem'

export default function History() {
    const [activeTab, setActiveTab] = useState<'listening' | 'search'>('listening')

    const { data: listeningHistory, isLoading: loadingListening } = useQuery({
        queryKey: ['listening-history'],
        queryFn: async () => {
            const response = await api.get('/me/history/listening')
            return response.data.history as ListeningHistory[]
        },
    })

    const { data: searchHistory, isLoading: loadingSearch } = useQuery({
        queryKey: ['search-history'],
        queryFn: async () => {
            const response = await api.get('/me/history/search')
            return response.data.history as SearchHistory[]
        },
    })

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
            <div>
                <h1 className="text-4xl font-bold mb-2">History</h1>
                <p className="text-dark-500">Your listening and search activity</p>
            </div>

            {/* Tabs */}
            <div className="flex space-x-2 border-b border-dark-300">
                <button
                    onClick={() => setActiveTab('listening')}
                    className={`px-6 py-3 font-medium transition-all ${activeTab === 'listening'
                            ? 'text-primary-500 border-b-2 border-primary-500'
                            : 'text-dark-500 hover:text-white'
                        }`}
                >
                    Listening History
                </button>
                <button
                    onClick={() => setActiveTab('search')}
                    className={`px-6 py-3 font-medium transition-all ${activeTab === 'search'
                            ? 'text-primary-500 border-b-2 border-primary-500'
                            : 'text-dark-500 hover:text-white'
                        }`}
                >
                    Search History
                </button>
            </div>

            {/* Content */}
            {activeTab === 'listening' ? (
                <div>
                    {loadingListening ? (
                        <div className="space-y-4">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <div key={i} className="skeleton h-20 rounded-lg"></div>
                            ))}
                        </div>
                    ) : listeningHistory && listeningHistory.length > 0 ? (
                        <div className="space-y-2">
                            {listeningHistory.map((item) => (
                                <TrackItem
                                    key={item.id}
                                    track={{
                                        trackId: item.trackId,
                                        title: item.title,
                                        artistName: item.artistName,
                                        durationSec: Math.floor(item.playedMs / 1000),
                                        thumbnailUrl: item.thumbnailUrl,
                                    }}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-16 text-dark-500">
                            <p>No listening history yet</p>
                        </div>
                    )}
                </div>
            ) : (
                <div>
                    {loadingSearch ? (
                        <div className="space-y-4">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="skeleton h-16 rounded-lg"></div>
                            ))}
                        </div>
                    ) : searchHistory && searchHistory.length > 0 ? (
                        <div className="space-y-2">
                            {searchHistory.map((item) => (
                                <div key={item.id} className="card">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <p className="font-medium">{item.query}</p>
                                            <p className="text-sm text-dark-500">
                                                {item.resultCount} results • {new Date(item.searchedAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-16 text-dark-500">
                            <p>No search history yet</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
