# Vercel Deployment - Step by Step

## ✅ Prerequisites Complete
- ✓ Code pushed to GitHub
- ✓ vercel.json configured
- ✓ Ready to deploy

---

## **Step 1: Open Vercel Project Settings**

### Navigate to Settings

**URL:** `https://vercel.com/anshul-toppo-s-projects/inter-talk/settings/general`

Or manually:
1. Go to https://vercel.com/dashboard
2. Click **inter-talk** project
3. Click **Settings** tab at top
4. Click **General** in left sidebar

---

## **Step 2: Change Root Directory (CRITICAL)**

Look for this section:

```
┌─ Root Directory ─────────────┐
│                              │
│  Input field showing: /      │  ← CHANGE THIS
│                              │
│  [Save]                      │
└──────────────────────────────┘
```

### What to Do:
1. **Click** the input field
2. **Select all text** (Ctrl+A or Cmd+A)
3. **Delete it**
4. **Type:** `./client`
5. **Press Enter** or click **Save**

✅ Field should now show: `./client`

---

## **Step 3: Set Environment Variables**

In Settings, find **Environment Variables** section:

Click **"Add New"** and create:

```
Name:  NEXT_PUBLIC_API_URL
Value: http://localhost:5000/api
```

(We'll update this after deploying backend)

Click **Save**

---

## **Step 4: Trigger Rebuild**

Go to **Deployments** tab at top:

```
Latest Deployment
├─ Status: Ready ✓
├─ ... (three dots menu)
│   ├─ Redeploy ← CLICK THIS
│   ├─ Promote
│   └─ Delete
```

1. Click the **...** menu on your latest deployment
2. Select **Redeploy**
3. Confirm

**Wait 2-3 minutes** for build to complete

---

## **Step 5: Verify Deployment**

### Check Status
- Go to **Deployments** tab
- Latest deployment should show **"Ready"** in green ✓

### Test the URL
Visit: `https://inter-talk-r6d3j7n95-anshul-toppo-s-projects.vercel.app`

You should see:
- ✅ InterTalk login page loads
- ✅ No "404" error

---

## **If You Still See 404**

### Quick Debug:
1. **Verify Root Directory is set to `./client`** (not `/`)
   - Go back to Settings → General
   - Check the field

2. **Check Build Logs**
   - Deployments tab
   - Click on your deployment
   - Scroll down to "Build Logs"
   - Look for errors

3. **Clear Cache & Redeploy**
   - In Deployments, click **...**
   - Select **Redeploy** again

---

## **Next: Connect Backend API**

Once frontend is working on Vercel:

1. Deploy backend to Railway (separate service)
2. Get Railway backend URL
3. Update in Vercel:
   - Settings → Environment Variables
   - `NEXT_PUBLIC_API_URL` = `https://your-railway-url/api`
4. Redeploy frontend

---

## **Screenshots & Field Locations**

### Settings → General Tab
```
Vercel Project Settings
├─ Framework: Next.js ✓
├─ Build & Development Settings
│  ├─ Build Command: cd client && npm run build
│  ├─ Output Directory: client/.next
│  └─ Root Directory: [INPUT] ← CHANGE TO ./client
├─ Environment Variables
│  └─ NEXT_PUBLIC_API_URL: [VALUE]
```

### Deployments Tab
```
Deployment #1 (Latest)
├─ Status: Ready ✓
├─ Timestamp: 2 hours ago
├─ Branch: main
└─ ... [MENU]
   └─ Redeploy ← CLICK HERE
```

---

## **Common Issues & Fixes**

| Issue | Fix |
|-------|-----|
| 404 on homepage | Root Directory = `./client` |
| "Cannot find next build" | Output Directory = `client/.next` |
| API won't connect | `NEXT_PUBLIC_API_URL` env var not set |
| Build keeps failing | Check Build Logs for exact error |

