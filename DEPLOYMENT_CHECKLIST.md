# InterTalk Deployment Checklist

## ✅ Pre-Deployment

- [ ] Code pushed to GitHub: `https://github.com/anshultoppo05/InterTalk`
- [ ] MongoDB Atlas cluster created
- [ ] Gemini API key obtained from https://aistudio.google.com/app/apikey
- [ ] GitHub account connected to Vercel
- [ ] GitHub account connected to Railway

---

## Backend Deployment (Railway)

### Step 1: Create Railway Project
- [ ] Go to https://railway.app and sign in with GitHub
- [ ] Click "New Project"
- [ ] Select "Deploy from GitHub repo"
- [ ] Find and select `anshultoppo05/InterTalk`

### Step 2: Set Environment Variables
Once Railway loads your project, go to **Variables** tab and add these:

```
PORT=5000
MONGODB_URI=mongodb+srv://USERNAME:PASSWORD@cluster.mongodb.net/intertalk?retryWrites=true&w=majority
JWT_SECRET=your_random_string_min_32_characters_long
JWT_REFRESH_SECRET=your_random_string_min_32_characters_long
GEMINI_API_KEY=your_gemini_api_key_here
CLIENT_URL=https://intertalk.vercel.app
```

- [ ] MONGODB_URI set
- [ ] JWT_SECRET set
- [ ] JWT_REFRESH_SECRET set
- [ ] GEMINI_API_KEY set
- [ ] CLIENT_URL set (you'll fill this after Vercel deployment)

### Step 3: Deploy
- [ ] Click "Deploy"
- [ ] Wait for deployment to complete
- [ ] Copy the Railway URL (e.g., `https://intertalk-api.up.railway.app`)
- [ ] Test health endpoint: `https://your-railway-url/api/health`

---

## Frontend Deployment (Vercel)

### Step 1: Create Vercel Project
- [ ] Go to https://vercel.com and sign in with GitHub
- [ ] Click "Add New" → "Project"
- [ ] Import `anshultoppo05/InterTalk`

### Step 2: Configure Project
- [ ] **Framework**: Select "Next.js"
- [ ] **Root Directory**: Set to `./client`
- [ ] Click "Continue"

### Step 3: Set Environment Variables
In the Environment Variables section, add:

```
NEXT_PUBLIC_API_URL=https://your-railway-url/api
```

Replace `https://your-railway-url` with your actual Railway URL from Step 1.

- [ ] NEXT_PUBLIC_API_URL set correctly

### Step 4: Deploy
- [ ] Click "Deploy"
- [ ] Wait for build to complete
- [ ] Note your Vercel URL (e.g., `https://intertalk.vercel.app`)
- [ ] Visit your Vercel URL to test

---

## Post-Deployment

### Update Backend CORS
Go back to Railway dashboard:
- [ ] Variables → Update `CLIENT_URL` to your Vercel URL
- [ ] Railway will auto-redeploy

### Test the App
- [ ] Open your Vercel URL
- [ ] Try signing up with an email
- [ ] Start a mock interview
- [ ] Verify all features work
- [ ] Check browser console for errors

### Monitor Logs
- **Railway logs**: Dashboard → Logs tab
- **Vercel logs**: Project → Deployments → Logs

---

## Troubleshooting

### CORS Error in Browser
**Fix**: Ensure `CLIENT_URL` in Railway matches your Vercel URL exactly

### MongoDB Connection Error
**Fix**: 
1. Check `MONGODB_URI` in Railway
2. In MongoDB Atlas, ensure IP whitelist includes `0.0.0.0/0`

### Frontend shows 404/Cannot find API
**Fix**: 
1. Check `NEXT_PUBLIC_API_URL` in Vercel
2. Ensure Railway URL is accessible: `curl https://your-railway-url/api/health`

### Railway deployment fails
**Fix**:
1. Check build logs in Railway dashboard
2. Ensure `Dockerfile` is in root directory
3. Verify `server/package.json` has `"start"` script

---

## Monitoring & Maintenance

- **Database**: Monitor MongoDB Atlas usage at https://cloud.mongodb.com
- **Backend**: Check Railway dashboard for CPU/memory usage
- **Frontend**: Check Vercel Analytics for performance

---

## Costs Summary

| Service | Free Tier | Cost |
|---------|-----------|------|
| MongoDB Atlas | 512MB | Free |
| Railway | 5GB bandwidth/month | Free |
| Vercel | 100GB bandwidth/month | Free |
| **Total** | — | **Free** |

---

## Next Steps (Optional)

- [ ] Set up custom domain
- [ ] Configure GitHub Actions for auto-deployment
- [ ] Set up email notifications for errors
- [ ] Add monitoring/alerting
