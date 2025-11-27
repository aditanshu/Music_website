# Troubleshooting Guide

## Common Issues and Solutions

### 1. "Internal Server Error" when accessing API endpoints

**Symptoms:**
- API calls return 500 Internal Server Error
- Console shows database connection errors
- Prisma client errors

**Solutions:**

#### A. Generate Prisma Client
```bash
npx prisma generate
```

#### B. Push Database Schema
```bash
npx prisma db push
```

#### C. Check Environment Variables
Ensure your `.env` file has:
```env
DATABASE_URL="your-postgresql-connection-string"
JWT_SECRET="your-secret-key"
GROQ_API_KEY="your-groq-api-key"
```

### 2. "Cannot find module" errors

**Symptoms:**
- Server fails to start
- Import errors in console

**Solutions:**

#### A. Install Dependencies
```bash
npm install
```

#### B. Check Node.js Version
```bash
node --version  # Should be 18+
npm --version   # Should be 8+
```

#### C. Clear Cache and Reinstall
```bash
rm -rf node_modules package-lock.json
npm install
```

### 3. Database Connection Issues

**Symptoms:**
- "Connection refused" errors
- "Invalid connection string" errors

**Solutions:**

#### A. Verify Database URL
- Check that your PostgreSQL database is running
- Verify the connection string format:
  ```
  postgresql://username:password@host:port/database?sslmode=require
  ```

#### B. Test Connection
```bash
npx prisma db push --accept-data-loss
```

### 4. API Key Issues

**Symptoms:**
- AI playlist generation fails
- Music recognition doesn't work
- Authentication errors

**Solutions:**

#### A. Groq API Key
1. Visit [console.groq.com](https://console.groq.com)
2. Create a free account
3. Generate an API key
4. Add to `.env`: `GROQ_API_KEY="your-key"`

#### B. AcoustID API Key (Optional)
1. Visit [acoustid.org/new-application](https://acoustid.org/new-application)
2. Register your application
3. Add to `.env`: `ACOUSTID_API_KEY="your-key"`

### 5. CORS Issues

**Symptoms:**
- Frontend can't connect to API
- "Access-Control-Allow-Origin" errors

**Solutions:**

#### A. Check Server Configuration
Ensure the server is running on the correct port (3000 by default).

#### B. Update APP_URL
In `.env`:
```env
APP_URL="http://localhost:3000"
```

### 6. WSL/Windows Path Issues

**Symptoms:**
- "UNC paths are not supported" errors
- Commands fail with path errors

**Solutions:**

#### A. Use WSL Terminal
- Open WSL terminal (not Windows CMD)
- Navigate to project directory
- Run commands from WSL

#### B. Install Node.js in WSL
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

## Quick Setup Script

Run the setup script to automatically fix common issues:

```bash
./setup.sh
```

## Development Commands

```bash
# Start development server
npm run dev

# Generate Prisma client
npx prisma generate

# Push database schema
npx prisma db push

# View database
npx prisma studio

# Build for production
npm run build
```

## Environment Variables Reference

```env
# Required
DATABASE_URL="postgresql://user:pass@host:port/db?sslmode=require"
JWT_SECRET="random-secret-key"
GROQ_API_KEY="groq-api-key"

# Optional
ACOUSTID_API_KEY="acoustid-key"
CLOUDINARY_CLOUD_NAME="cloud-name"
CLOUDINARY_UPLOAD_PRESET="upload-preset"
CLOUDINARY_API_KEY="api-key"
CLOUDINARY_API_SECRET="api-secret"
APP_URL="http://localhost:3000"
```

## Getting Help

If you're still experiencing issues:

1. Check the console logs for specific error messages
2. Verify all environment variables are set correctly
3. Ensure your database is accessible
4. Try the setup script: `./setup.sh`
5. Check that all dependencies are installed: `npm install`

## Common Error Messages

### "Prisma Client is not generated"
```bash
npx prisma generate
```

### "Environment variable not found: DATABASE_URL"
Add `DATABASE_URL` to your `.env` file.

### "Invalid `prisma.user.findUnique()` invocation"
Run `npx prisma db push` to sync your database schema.

### "ECONNREFUSED" or "Connection refused"
Check that your database server is running and accessible.
