import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import api from '../lib/api'
import type { User } from '../types'

interface AuthContextType {
    user: User | null
    loading: boolean
    login: (email: string, password: string) => Promise<void>
    register: (email: string, password: string, name: string) => Promise<void>
    logout: () => Promise<void>
    updateProfile: (data: Partial<User>) => Promise<void>
    refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        checkAuth()
    }, [])

    const checkAuth = async () => {
        try {
            const response = await api.get('/me')
            setUser(response.data.user)
        } catch (error) {
            setUser(null)
        } finally {
            setLoading(false)
        }
    }

    const login = async (email: string, password: string) => {
        const response = await api.post('/auth/login', { email, password })
        setUser(response.data.user)
    }

    const register = async (email: string, password: string, name: string) => {
        const response = await api.post('/auth/register', { email, password, name })
        setUser(response.data.user)
    }

    const logout = async () => {
        await api.post('/auth/logout')
        setUser(null)
    }

    const updateProfile = async (data: Partial<User>) => {
        const response = await api.put('/me', data)
        setUser(response.data.user)
    }

    const refreshUser = async () => {
        const response = await api.get('/me')
        setUser(response.data.user)
    }

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout, updateProfile, refreshUser }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}
