# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Study Stack is an AI-powered study assistant web app with two features: quiz generation, cheat sheet generation (from uploaded files or pasted text), and a code helper/analysis tool. The backend uses Hugging Face's router API (Qwen2.5-72B for quiz/cheatsheet, DeepSeek-V3 for code analysis).

## Architecture

**Monorepo** with two separate projects:

```
study-stack/
  backend/        # Express.js API server
  frontend/       # React + Vite SPA
```

### Backend (`backend/`)

- **Express 5** server on Node.js, entry point: `server.js`
- **MongoDB/Mongoose** for persistence
- **Auth**: JWT-based (bcryptjs + jsonwebtoken) + Google OAuth via Passport
- **AI Integration**: All three AI features call Hugging Face router API (`router.huggingface.co/v1/chat/completions`)
- **File Upload**: multer handles PDF, DOCX, image (OCR via Tesseract), and TXT parsing

**Route structure:**
- `POST /api/auth/register` / `login` / `google` / `google/callback`
- `POST /api/quiz/generate` — generates MCQ quiz from text using Qwen2.5-72B
- `POST /api/cheatsheet/generate` — analyzes syllabus/PYQs/notes from uploaded files or text, returns structured cheat sheet
- `POST /api/code/analyze` — analyzes code for issues/improvements using DeepSeek-V3
- `GET/POST/DELETE /api/history` — CRUD for user's history (requires JWT auth)

**Models:** `User` (name, email, password, googleId), `History` (stores quiz, cheatsheet, or code analysis results per user)

### Frontend (`frontend/`)

- **React 19** with **Vite 8**, **Tailwind CSS 4**, **react-router-dom 7**
- No test framework configured
- **Pages**: Landing, Home, Login, Register, CodeHelper, Analysis, CheatSheet, History, GoogleSuccess
- **Components**: Layout, Navbar, Sidebar
- **API base**: `src/utils/api.js` — uses `VITE_API_BASE` env var or defaults to `http://localhost:5000`
- Deployed on **Vercel** (`frontend/vercel.json`)

## Development Commands

### Backend
```bash
cd backend
npm install
npm run dev    # nodemon server.js
npm start      # production start
```

### Frontend
```bash
cd frontend
npm install
npm run dev    # starts Vite dev server on port 5173
npm run build  # production build for Vercel
npm run preview  # preview production build
```

## Environment Variables

### Backend (`.env` in `backend/`):
- `MONGO_URI` — MongoDB connection string
- `JWT_SECRET` — JWT signing key
- `HF_API_KEY` — Hugging Face API key (router access)
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` — Google OAuth credentials
- `FRONTEND_URL` — frontend URL (e.g., `http://localhost:5173` for dev)
- `BACKEND_URL` — backend URL for OAuth callback
- `SESSION_SECRET` — session secret for Passport

### Frontend (`.env` in `frontend/`):
- `VITE_API_BASE` — backend API base URL (optional, defaults to `http://localhost:5000`)

## Key Implementation Notes

- The AI models are external (Hugging Face Inference Router), no local model serving needed
- File uploads are stored temporarily in `backend/uploads/` and cleaned up after processing
- The history middleware is inline in `routes/history.js` (not in `middleware/`)
- CORS allows `localhost:5173` (dev) and `https://study-stack-one.vercel.app` (production)
