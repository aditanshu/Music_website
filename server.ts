import express from 'express'
import { createServer as createViteServer } from 'vite'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

async function createServer() {
    const app = express()

    // Add JSON parsing middleware
    app.use(express.json())
    app.use(express.urlencoded({ extended: true }))

    // Create Vite server in middleware mode
    const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: 'spa',
    })

    // API routes - dynamically import from api folder
    // IMPORTANT: This must come BEFORE vite.middlewares
    app.all(/^\/api\/(.*)/, async (req, res) => {
        try {
            const apiPath = req.params[0]
            const handlerPath = join(__dirname, 'api', `${apiPath}.ts`)

            console.log(`[API] ${req.method} /api/${apiPath} -> ${handlerPath}`)

            // Use Vite's ssrLoadModule to transform and load the API handler
            const handler = await vite.ssrLoadModule(handlerPath)

            // Call the default export (Vercel function)
            if (handler.default && typeof handler.default === 'function') {
                await handler.default(req, res)
            } else {
                console.error('No default export found in handler:', handlerPath)
                res.status(500).json({ error: 'Handler not found' })
            }
        } catch (error) {
            console.error('API Error:', error)
            if (error.code === 'ERR_MODULE_NOT_FOUND') {
                res.status(404).json({ error: 'API endpoint not found' })
            } else {
                res.status(500).json({ error: 'Internal server error' })
            }
        }
    })

    // Use vite's connect instance as middleware
    // This handles all non-API routes
    app.use(vite.middlewares)

    const port = process.env.PORT || 3000
    app.listen(port, () => {
        console.log(`🚀 Server running at http://localhost:${port}`)
        console.log(`📱 Frontend: http://localhost:${port}`)
        console.log(`🔌 API: http://localhost:${port}/api/*`)
        console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`)
    })
}

createServer().catch(error => {
    console.error('Failed to start server:', error)
    process.exit(1)
})
