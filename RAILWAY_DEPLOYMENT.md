# Deploy InterTalk on Railway

> Deploy both backend API and frontend on Railway - Simple & Free

---

## **Step 1: Create Railway Account**

1. Go to https://railway.app
2. Click **"Start Free"**
3. Sign up with **GitHub**
4. Authorize Railway to access your GitHub repos

---

## **Step 2: Deploy Backend API**

### 2.1 Create Backend Service

1. In Railway dashboard, click **"New Project"**
2. Select **"Deploy from GitHub repo"**
3. Find and select: `anshultoppo05/InterTalk`
4. Railway auto-detects the `server` folder

### 2.2 Set Environment Variables

Once deployed, go to your service and click **"Variables"**

Add these environment variables:

```
PORT=5000
MONGODB_URI=mongodb+srv://USERNAME:PASSWORD@cluster.mongodb.net/intertalk?retryWrites=true&w=majority
JWT_SECRET=your_random_string_min_32_chars
JWT_REFRESH_SECRET=your_random_string_min_32_chars
GEMINI_API_KEY=your_gemini_api_key_here
CLIENT_URL=http://localhost:3000
```

**Replace with your actual values:**
- `MONGODB_URI` → From MongoDB Atlas
- `GEMINI_API_KEY` → From https://aistudio.google.com/app/apikey
- `JWT_SECRET` & `JWT_REFRESH_SECRET` → Any random strings

### 2.3 Deploy Backend

- Click **"Deploy"**
- Wait for deployment to complete
- Copy your backend URL (e.g., `https://intertalk-api.up.railway.app`)
- Test it: `https://your-url/api/health`

---

## **Step 3: Deploy Frontend on Railway**

### 3.1 Add Frontend Service (Same Project)

1. In your Railway project, click **"Add Service"**
2. Click **"GitHub Repo"**
3. Select `anshultoppo05/InterTalk` again
4. This time, configure for the `client` folder

### 3.2 Set Frontend Environment Variables

In the frontend service, go to **"Variables"** and add:

```
NEXT_PUBLIC_API_URL=https://your-backend-url/api
```

Replace `https://your-backend-url` with your actual Railway backend URL from Step 2.3

### 3.3 Deploy Frontend

- Click **"Deploy"**
- Wait for build to complete
- Railway will give you a frontend URL (e.g., `https://intertalk.up.railway.app`)

---

## **Step 4: Update Backend CORS**

Go back to your **backend service**:

1. Click **"Variables"**
2. Update `CLIENT_URL` to your Railway frontend URL:
   ```
   CLIENT_URL=https://your-frontend-url
   ```
3. Railway will auto-redeploy

---

## **Step 5: Test Your App**

1. Visit your Railway frontend URL
2. You should see the **InterTalk login page**
3. Try signing up with an email
4. Start a mock interview
5. Verify everything works

---

## **Check Deployment Status**

### Backend Logs
1. Go to backend service → **"Logs"** tab
2. Look for: `✅ MongoDB connected` and `🚀 InterTalk server running`

### Frontend Logs
1. Go to frontend service → **"Logs"** tab
2. Look for: build completion message

---

## **Environment Variables Reference**

| Variable | Value | Example |
|----------|-------|---------|
| `MONGODB_URI` | MongoDB Atlas connection | `mongodb+srv://user:pass@cluster.mongodb.net/intertalk` |
| `JWT_SECRET` | Random string for token signing | `your_random_secret_xyz123` |
| `JWT_REFRESH_SECRET` | Random string for refresh tokens | `your_refresh_secret_xyz123` |
| `GEMINI_API_KEY` | Your Gemini API key | `sk-xxx-yyy-zzz` |
| `CLIENT_URL` | Your frontend URL | `https://intertalk.up.railway.app` |
| `NEXT_PUBLIC_API_URL` | Your backend API URL | `https://intertalk-api.up.railway.app/api` |

---

## **Troubleshooting**

### Backend won't deploy
- Check `Dockerfile` exists in root
- Verify `server/package.json` has `"start"` script
- Check logs for error messages

### Frontend shows 404
- Verify `NEXT_PUBLIC_API_URL` is set in frontend variables
- Check that the URL includes `/api` at the end

### Can't connect to MongoDB
- Verify `MONGODB_URI` is correct
- In MongoDB Atlas, whitelist IP: `0.0.0.0/0`

### API errors in frontend console
- Check `CLIENT_URL` is set correctly in backend
- Ensure backend URL is accessible: `curl https://your-backend-url/api/health`

---

## **Cost**

- **MongoDB Atlas**: Free (512MB)
- **Railway**: Free tier (100GB bandwidth/month)
- **Total**: **Free** 🎉

---

## **Next: Domain & Monitoring** (Optional)

- Add custom domain in Railway Settings
- Set up alerts for deployment failures
- Monitor performance in Railway dashboard

