# InterTalk Deployment Guide

> Deploy InterTalk to Vercel (frontend) + Railway (backend) with MongoDB Atlas

---

## Prerequisites

- GitHub account (to connect repositories)
- MongoDB Atlas account with URI ready
- Gemini API Key
- Railway account (free tier available at railway.app)
- Vercel account (free tier available at vercel.com)

---

## Step 1: Set Up MongoDB Atlas (if not done)

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Whitelist IP: 0.0.0.0/0 (allow all IPs for cloud deployment)
4. Create database user with username/password
5. Copy connection string: `mongodb+srv://username:password@cluster.mongodb.net/intertalk?retryWrites=true&w=majority`

---

## Step 2: Deploy Backend to Railway

### 2.1 Push to GitHub (if not done)
```bash
git add .
git commit -m "Prepare for cloud deployment"
git push origin main
```

### 2.2 Create Railway Project
1. Go to [Railway.app](https://railway.app)
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your GitHub repo `anshultoppo05/InterTalk`
4. Railway will auto-detect `server/package.json`

### 2.3 Set Environment Variables in Railway
Go to Variables tab and add:

```
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/intertalk?retryWrites=true&w=majority
JWT_SECRET=your_strong_secret_here_min_32_chars
JWT_REFRESH_SECRET=your_refresh_secret_here_min_32_chars
GEMINI_API_KEY=your_gemini_api_key_here
CLIENT_URL=https://your-vercel-app.vercel.app
```

### 2.4 Deploy
- Click "Deploy"
- Railway will generate a URL: `https://something.up.railway.app`
- Save this URL - you'll need it for the frontend

---

## Step 3: Deploy Frontend to Vercel

### 3.1 Create Vercel Project
1. Go to [Vercel.com](https://vercel.com)
2. Click "Add New..." → "Project"
3. Import your GitHub repo
4. Select "Next.js" template (auto-detected)
5. Set root directory to `./client`

### 3.2 Set Environment Variables in Vercel
Go to Settings → Environment Variables and add:

```
NEXT_PUBLIC_API_URL=https://your-railway-app.up.railway.app/api
```

### 3.3 Deploy
- Click "Deploy"
- Vercel will build and deploy automatically
- Your app will be live at: `https://your-app.vercel.app`

---

## Step 4: Update Backend with Vercel URL

In Railway dashboard:
1. Go to Variables
2. Update `CLIENT_URL` to your Vercel URL
3. Railway redeploys automatically

---

## Step 5: Test Deployment

1. Open your Vercel URL
2. Try registering/logging in
3. Start an interview
4. Check backend logs in Railway for errors

---

## Health Checks

**Backend Health:**
```
GET https://your-railway-app.up.railway.app/api/health
```

Should return:
```json
{
  "status": "ok",
  "service": "InterTalk API",
  "timestamp": "2026-05-12T..."
}
```

---

## Troubleshooting

### Backend not connecting to MongoDB
- Check `MONGODB_URI` in Railway variables
- Ensure IP whitelist is set to 0.0.0.0/0 in Atlas

### CORS errors in browser
- Check `CLIENT_URL` is set correctly in Railway
- Ensure frontend is sending requests to correct API URL

### Vercel build fails
- Check `next build` works locally
- Verify root directory is set to `./client`

---

## Costs

- **MongoDB Atlas**: Free (512MB storage)
- **Railway**: Free (5GB bandwidth/month)
- **Vercel**: Free (up to 100GB bandwidth/month)

---

## Next Steps

- Monitor logs in Railway & Vercel dashboards
- Set up GitHub Actions for auto-deployment on push
- Configure custom domain (optional)
