import type { VercelRequest, VercelResponse } from '@vercel/node'
import { requireAuth } from '../../lib/auth'

async function handler(req: VercelRequest, res: VercelResponse, user: any) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' })
    }

    try {
        // Return Cloudinary upload configuration
        const cloudName = process.env.CLOUDINARY_CLOUD_NAME
        const uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET

        if (!cloudName || !uploadPreset) {
            return res.status(500).json({ error: 'Cloudinary not configured' })
        }

        return res.status(200).json({
            cloudName,
            uploadPreset,
            uploadUrl: `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        })
    } catch (error) {
        console.error('Profile image token error:', error)
        return res.status(500).json({ error: 'Internal server error' })
    }
}

export default requireAuth(handler)
