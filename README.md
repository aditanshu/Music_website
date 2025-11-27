# AI-Powered Music Web Application

A production-ready, AI-driven music streaming web application with natural language playlist generation, smart recommendations, and music recognition capabilities.

## 🎵 Features

- **AI Playlist Generation**: Describe your vibe in natural language and get a personalized playlist
- **Smart Search**: Search for tracks, artists, and genres with Audius integration
- **Music Recognition**: Free Shazam-like song identification using AcoustID + MusicBrainz
- **Personalized Recommendations**: AI-powered suggestions based on listening history
- **Ad-Free Experience**: Clean, modern UI without advertisements
- **Listening History**: Track your music journey
- **Responsive Design**: Works seamlessly on desktop and mobile

## 🛠️ Tech Stack

### Frontend
- **React 18** with **TypeScript**
- **Vite** for fast development and optimized builds
- **Tailwind CSS** for styling
- **React Query** for data fetching and caching
- **Zustand** for global state management
- **React Router** for navigation

### Backend
- **Vercel Serverless Functions** (Node.js + TypeScript)
- **PostgreSQL** database with **Prisma ORM**
- **JWT** authentication with httpOnly cookies

### External APIs
- **Audius**: Music catalog and streaming
- **Groq AI**: Natural language processing for playlist generation
- **AcoustID + MusicBrainz**: Free music recognition (no API key required)
- **Cloudinary**: Image storage

## 📋 Prerequisites

- Node.js 18+ and npm
- PostgreSQL database (Neon, Supabase, or Railway recommended)
- API keys for:
  - Groq API (required)
  - Cloudinary (optional - for profile images)
  - AcoustID (optional - free music recognition, uses demo key if not provided)

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/aditanshu/Music_website.git
cd Music_website
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL="postgresql://user:password@host:5432/database?schema=public"

# JWT Secret (generate a random string)
JWT_SECRET="your-super-secret-jwt-key-change-this"

# Groq API
GROQ_API_KEY="your-groq-api-key"

# AcoustID (Optional - free music recognition)
ACOUSTID_API_KEY=""

# Cloudinary
CLOUDINARY_CLOUD_NAME="your-cloudinary-cloud-name"
CLOUDINARY_UPLOAD_PRESET="your-upload-preset"
CLOUDINARY_API_KEY="your-cloudinary-api-key"
CLOUDINARY_API_SECRET="your-cloudinary-api-secret"

# App URL
APP_URL="http://localhost:5173"
```

### 4. Set Up Database

```bash
# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev --name init

# (Optional) Open Prisma Studio to view your database
npx prisma studio
```

### 5. Run Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## 📦 Building for Production

```bash
# Build the frontend
npm run build

# Preview production build locally
npm run preview
```

## 🌐 Deploying to Vercel

### 1. Install Vercel CLI

```bash
npm install -g vercel
```

### 2. Deploy

```bash
vercel
```

### 3. Configure Environment Variables

In your Vercel dashboard, add all environment variables from your `.env` file.

### 4. Connect Database

Make sure your `DATABASE_URL` points to a production PostgreSQL instance (not localhost).

### 5. Run Migrations on Production

```bash
npx prisma migrate deploy
```

## 🔑 Obtaining API Keys

### Groq API
1. Visit [console.groq.com](https://console.groq.com)
2. Sign up for a free account
3. Create an API key
4. Free tier includes 30 requests/minute

### AcoustID (Optional - Music Recognition)
1. Visit [acoustid.org/new-application](https://acoustid.org/new-application)
2. Register your application (free)
3. Get your API key
4. **Note**: App works with demo key if not provided, but has rate limits
5. **Completely free** for non-commercial use!

### Cloudinary
1. Visit [cloudinary.com](https://cloudinary.com)
2. Sign up for a free account
3. Get your cloud name, API key, and secret
4. Create an unsigned upload preset in settings

## 📁 Project Structure

```
├── api/                    # Vercel serverless functions
│   ├── auth/              # Authentication endpoints
│   ├── ai/                # AI playlist generation
│   ├── search/            # Music search
│   ├── music/             # Music recognition
│   ├── home/              # Recommendations
│   ├── events/            # Listening history tracking
│   ├── me/                # User profile & history
│   └── lib/               # Shared utilities
│       ├── auth.ts        # JWT & auth helpers
│       ├── db.ts          # Prisma client
│       ├── audius.ts      # Audius API wrapper
│       ├── groq.ts        # Groq AI wrapper
│       └── acrcloud.ts    # ACRCloud wrapper
├── prisma/
│   └── schema.prisma      # Database schema
├── src/
│   ├── components/        # React components
│   ├── contexts/          # React contexts
│   ├── pages/             # Page components
│   ├── lib/               # Frontend utilities
│   ├── types/             # TypeScript types
│   └── index.css          # Global styles
└── public/                # Static assets
```

## 🎯 Key Features Implementation

### AI Playlist Generation
Uses Groq's LLaMA model to extract intent from natural language prompts, then searches Audius for matching tracks.

### Music Recognition
Captures audio from the browser, sends to ACRCloud for identification, then matches with Audius tracks.

### Music Recognition
Uses **AcoustID + MusicBrainz** (completely free) instead of paid services:
1. Captures audio from browser microphone (8 seconds)
2. Generates audio fingerprint using simplified Chromaprint algorithm
3. Sends fingerprint to AcoustID API for identification
4. Retrieves metadata from MusicBrainz
5. Matches with Audius tracks for playback

**Note**: For production, consider using [fpcalc.js](https://github.com/acoustid/chromaprint.js) for better fingerprint accuracy.

### Recommendations
Analyzes listening history and user feedback to generate personalized playlist suggestions.

### Authentication
Secure JWT-based authentication with httpOnly cookies for session management.

## 🐛 Troubleshooting

### Database Connection Issues
- Ensure your `DATABASE_URL` is correct
- Check if your database is accessible from your network
- For Vercel deployment, use a hosted database (not localhost)

### API Rate Limits
- Groq free tier: 30 requests/minute
- AcoustID: Rate limited on demo key, get free API key for higher limits
- Implement caching to reduce API calls

### Music Recognition Issues
- Ensure microphone permissions are granted
- Record in a quiet environment for best results
- For better accuracy, get a free AcoustID API key
- Some songs may not be in the AcoustID database

### CORS Issues
- Ensure Vercel serverless functions are properly configured
- Check that cookies are being set with correct domain

## 📝 License

MIT License - feel free to use this project for learning or commercial purposes.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Support

For issues or questions, please open an issue on GitHub.

---

Built with ❤️ using React, TypeScript, and AI
