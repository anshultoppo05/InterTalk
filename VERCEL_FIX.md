# Vercel Deployment Fix

## If You're Getting 404 Errors on Vercel

### Problem
- The Next.js app isn't loading
- You see "404 not found" on https://your-app.vercel.app

### Solution

**Step 1: Check Vercel Project Settings**

Go to your Vercel project dashboard:

1. Click **Settings** → **General**
2. Verify:
   - **Framework Preset**: NextJS ✓
   - **Root Directory**: `./client` ✓
   - **Node Version**: 18.x or higher ✓

**Step 2: Set Environment Variable**

1. Go to **Settings** → **Environment Variables**
2. Add this variable:
   ```
   NEXT_PUBLIC_API_URL
   https://your-railway-backend-url/api
   ```
   (Replace with your actual Railway URL)

3. Click **Save**

**Step 3: Redeploy**

1. Go to **Deployments**
2. Click the **...** menu on the latest deployment
3. Select **Redeploy**
4. Wait for build to complete

**Step 4: Test**

- Visit https://your-app.vercel.app
- You should see the login page
- Check browser console (F12) for any errors

---

## If Still Not Working

### Option A: Full Redeployment
1. Go to **Deployments**
2. Find the original deployment that's broken
3. Click **...** → **Delete**
4. Go back to main project
5. Click **Redeploy** on the latest deployment

### Option B: Reconnect Repository
1. Go to **Settings** → **Git**
2. Disconnect repository
3. Go back and reconnect your GitHub repo
4. Make a small change to your code (add a space in README)
5. Push: `git add . && git push origin main`
6. Vercel will auto-redeploy

### Option C: Check Build Logs
1. Go to **Deployments**
2. Click on your deployment
3. Scroll down to **Build Logs**
4. Look for error messages

---

## API Connection Issues

If the app loads but can't connect to your API:

1. **Check NEXT_PUBLIC_API_URL** is set in Vercel
2. **Verify Railway backend is running**:
   ```bash
   curl https://your-railway-url/api/health
   ```
   Should return: `{"status":"ok",...}`

3. **Check browser console errors** (F12 → Console tab)
   - Look for CORS errors
   - Check if requests are going to wrong URL

4. **Fix CORS in Railway**:
   - Go to Railway dashboard
   - Variables → Update `CLIENT_URL` to your Vercel URL exactly
   - Railway will auto-redeploy

---

## Common Errors & Fixes

| Error | Cause | Fix |
|-------|-------|-----|
| "Cannot find module 'next'" | Dependencies not installed | Clear cache, redeploy |
| 404 on homepage | Root directory wrong | Change to `./client` in Settings |
| API not connecting | NEXT_PUBLIC_API_URL missing | Add env var with Railway URL |
| "Invalid build output" | Output directory wrong | Use default or set to `client/.next` |

