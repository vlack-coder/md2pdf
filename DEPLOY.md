# DEPLOYMENT GUIDE for md2pdf E-Library

## Quick Deploy to Render (Recommended)

### Prerequisites
- GitHub account
- Supabase project (free tier works)

### Step 1: Set up Supabase
1. Go to [supabase.com](https://supabase.com) and create a free project
2. Go to **Settings > API** and copy:
   - Project URL (SUPABASE_URL)
   - anon/public key (SUPABASE_KEY)
3. Go to **SQL Editor** and run the setup SQL (see `scripts/setup-supabase.mjs` for the full SQL)

### Step 2: Deploy to Render
1. Push this repo to GitHub
2. Go to [render.com](https://render.com) and sign up (free)
3. Click **New > Blueprint**
4. Connect your GitHub repo
5. Render will detect `render.yaml` and configure automatically
6. Set environment variables in the dashboard:
   - `SUPABASE_URL` = your Supabase project URL
   - `SUPABASE_KEY` = your Supabase anon key
7. Click **Apply** and wait for deployment

### Step 3: Access Your App
- Your app will be at: `https://md2pdf.onrender.com` (or your chosen name)
- First load may take ~30 seconds (free tier cold start)

---

## Alternative: Deploy to Railway

1. Go to [railway.app](https://railway.app)
2. Click **New Project > Deploy from GitHub**
3. Select your repo
4. Add environment variables:
   ```
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_KEY=your-anon-key
   ADAPTER_PROVIDER=supabase
   AUTH_ENABLED=true
   ```
5. Railway auto-detects Node.js and deploys

---

## Alternative: Deploy to Fly.io

1. Install Fly CLI: `curl -L https://fly.io/install.sh | sh`
2. Login: `fly auth login`
3. Launch: `fly launch`
4. Set secrets:
   ```bash
   fly secrets set SUPABASE_URL=https://your-project.supabase.co
   fly secrets set SUPABASE_KEY=your-anon-key
   fly secrets set ADAPTER_PROVIDER=supabase
   fly secrets set AUTH_ENABLED=true
   ```
5. Deploy: `fly deploy`

---

## Environment Variables Reference

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `SUPABASE_URL` | Yes (for Supabase) | - | Supabase project URL |
| `SUPABASE_KEY` | Yes (for Supabase) | - | Supabase anon/public key |
| `ADAPTER_PROVIDER` | No | `supabase` | `supabase` or `local` |
| `AUTH_ENABLED` | No | `true` | Enable user authentication |
| `PORT` | No | `3000` | Server port |
| `NODE_ENV` | No | `development` | `production` for deployment |

---

## Local Development

```bash
# Copy environment template
cp .env.example .env

# Edit .env with your Supabase credentials
nano .env

# Install dependencies
npm install

# Start development server
npm start
```

---

## Docker Deployment

```bash
# Build image
docker build -t md2pdf .

# Run with environment variables
docker run -p 3000:3000 \
  -e SUPABASE_URL=https://your-project.supabase.co \
  -e SUPABASE_KEY=your-anon-key \
  -e ADAPTER_PROVIDER=supabase \
  -e AUTH_ENABLED=true \
  md2pdf
```

---

## Troubleshooting

### "Cold start" delays on free tiers
Free tiers spin down after inactivity. First request after sleep takes 10-30 seconds.

### Supabase connection errors
- Verify SUPABASE_URL starts with `https://`
- Verify SUPABASE_KEY is the anon/public key (not service role)
- Check Supabase dashboard for any paused projects

### Storage/upload issues
- Ensure the `library` storage bucket exists in Supabase
- Check bucket is set to private (not public)
