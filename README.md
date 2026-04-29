# InterTalk — AI Mock Interview Platform

> Real-time voice-based AI mock interviews with adaptive questioning, speech analysis, and detailed performance scoring.

![InterTalk](https://img.shields.io/badge/AI-Gemini%201.5%20Flash-blue) ![Next.js](https://img.shields.io/badge/Next.js-16-black) ![Node.js](https://img.shields.io/badge/Node.js-Express-green) ![MongoDB](https://img.shields.io/badge/Database-MongoDB-brightgreen)

---

## Features

- 🎙️ **Real-time Voice Interview** — Browser Web Speech API captures speech live
- 🔊 **AI Voice** — Text-to-Speech reads questions aloud (toggle on/off)
- 🧠 **Adaptive AI Questions** — Gemini 1.5 Flash adapts each question to your previous answers
- 📊 **5-Axis Scoring** — Content, Communication, Confidence, Problem Solving, Relevance
- 📈 **Progress Tracking** — Score trend chart, session history, personal best
- 💡 **Detailed Feedback** — Per-question scores, strengths, improvements, recommended resources
- 🎯 **5 Interview Tracks** — Software Engineering, Product Management, Behavioral, Data Science, General
- 🔐 **Secure Auth** — JWT with access + refresh token rotation

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16, TypeScript, Vanilla CSS |
| Animations | Framer Motion |
| AI | Google Gemini 1.5 Flash |
| Voice In | Web Speech API (browser STT) |
| Voice Out | SpeechSynthesis API (browser TTS) |
| Backend | Node.js, Express |
| Database | MongoDB + Mongoose |
| Auth | JWT (access + refresh tokens) |

---

## Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- [Gemini API Key](https://aistudio.google.com/app/apikey)

### 1. Clone & Setup

```bash
git clone <your-repo>
cd InterTalk
```

### 2. Configure Server

```bash
cd server
cp .env .env.local  # edit the values
npm install
```

Edit `server/.env`:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/intertalk
JWT_SECRET=your_strong_secret_here
JWT_REFRESH_SECRET=your_refresh_secret_here
GEMINI_API_KEY=your_gemini_api_key_here
CLIENT_URL=http://localhost:3000
```

### 3. Start MongoDB

```bash
# Local
brew services start mongodb-community

# OR use MongoDB Atlas URI in MONGODB_URI
```

### 4. Start Server

```bash
cd server
npm run dev    # → http://localhost:5000
```

### 5. Start Client

```bash
cd client
npm install
npm run dev    # → http://localhost:3000
```

---

## Interview Flow

```
Setup → AI generates Q1 → TTS reads it aloud → User speaks answer
→ AI analyzes answer (5 scores) → Review scores → Next question
→ Repeat × 8 → AI generates full report → Results page
```

---

## Scoring System

| Dimension | Weight | Description |
|-----------|--------|-------------|
| Content Quality | 30% | Accuracy, depth, correctness |
| Communication | 25% | Clarity, structure, conciseness |
| Problem Solving | 20% | Logical thinking, approach |
| Confidence | 15% | Assertiveness, certainty |
| Relevance | 10% | How directly question was answered |

---

## API Endpoints

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/api/auth/register` | — | Create account |
| POST | `/api/auth/login` | — | Get JWT tokens |
| POST | `/api/auth/refresh` | — | Refresh access token |
| GET | `/api/auth/me` | ✓ | Get current user |
| GET | `/api/interviews` | ✓ | List sessions (paginated) |
| POST | `/api/interviews` | ✓ | Create new session |
| GET | `/api/interviews/:id` | ✓ | Get session + full transcript |
| PATCH | `/api/interviews/:id` | ✓ | Update session / finalize |
| POST | `/api/ai/question` | ✓ | Generate next question |
| POST | `/api/ai/analyze` | ✓ | Analyze single response |
| POST | `/api/ai/finalize` | ✓ | Generate full report |

---

## Browser Support

| Feature | Chrome | Edge | Firefox | Safari |
|---------|--------|------|---------|--------|
| Speech Recognition | ✅ | ✅ | ✅ | ❌ |
| Text-to-Speech | ✅ | ✅ | ✅ | ⚠️ |

> **Best experience in Chrome or Edge**

---

## Project Structure

```
InterTalk/
├── client/                  # Next.js frontend
│   └── src/
│       ├── app/             # Pages (/, /auth, /dashboard, /interview, /results/[id])
│       ├── components/ui/   # ScoreRing, ScoreChart, Skeleton, Navbar
│       ├── context/         # AuthContext, ToastContext
│       ├── hooks/           # useSpeech, useTTS, useTimer
│       ├── lib/             # API client (Axios)
│       └── types/           # TypeScript definitions
│
└── server/                  # Express backend
    ├── models/              # User, Interview (Mongoose)
    ├── routes/              # auth, interviews, ai
    ├── services/            # gemini.js (Gemini API)
    └── middleware/          # JWT auth
```
