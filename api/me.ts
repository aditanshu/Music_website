import type { VercelRequest, VercelResponse } from '@vercel/node'

export default function handler(req: VercelRequest, res: VercelResponse) {
    // Return mock user data for now
    return res.status(200).json({
        user: {
            id: 'demo-user',
            email: 'demo@example.com',
            name: 'Demo User',
            createdAt: new Date().toISOString()
        }
    })
}
