# AskSiddhartha – Multilingual Indian Language Chatbot

A chatbot that supports **multiple Indian languages** with **text and voice** input. Output is **voice** when you speak and **text** when you type. Memory is **session-only** (cleared when you start a new chat or leave). Beautiful, colorful UI.

## Features

- **Languages**: English, Hindi, Bengali, Telugu, Marathi, Tamil, Gujarati, Kannada, Malayalam, Punjabi
- **Input**: Type (with optional English transliteration for Indian scripts) or use the microphone
- **Attach files**: You can attach **screenshots** (PNG, JPG, etc.) or **documents** (PDF, Word). The bot sees them and answers based on the image or document content.
- **Output**: Voice reply if input was voice; text reply if input was text
- **Transliteration**: Type in English (e.g. "namaste") and see the Indian script preview
- **Session-only memory (local)**: Conversation and uploads are cleared when you click **New chat** or **change the language**; a new session starts and previous context is gone.
- **Shared links**: Paste a URL in your message; the bot fetches the page, reads the content, and answers questions based on it (e.g. flight fares, product info). Works best with static or server-rendered pages.
- **Real-time web search** (optional): Set `SERPAPI_API_KEY` (or `GOOGLE_SERP_API_KEY`); the bot runs a Google search for each message and uses the results to give up-to-date answers.
- **Social profile lookups** (optional, with SerpAPI key): When you share a profile URL, the bot can look up public info:
  - **LinkedIn** (`linkedin.com/in/username`): SerpAPI profile data (experience, education, skills).
  - **Facebook** (`facebook.com/PageName` or `profile.php?id=...`): SerpAPI profile data (name, intro, category, followers, etc.).
  - **Instagram** & **Twitter/X** (`instagram.com/username`, `twitter.com/handle`, `x.com/handle`): Web search results about that account (no dedicated API).
  - **Latest post**: Ask for “latest post by [name] on Twitter/Instagram/Facebook/LinkedIn” (with or without pasting the profile URL); the bot runs a search optimized for the most recent post and presents it.

## Run locally

```bash
cd chatbot
python -m venv .venv
.venv\Scripts\activate   # Windows
# source .venv/bin/activate   # macOS/Linux
pip install -r requirements.txt
set OPENAI_API_KEY=your-key   # optional, for AI replies
python app.py
```

Open http://127.0.0.1:5000

## Deploy on Render via GitHub

### 1. Push your code to GitHub

- Repo: [github.com/siddhartha4u2c/RAGA](https://github.com/siddhartha4u2c/RAGA)
- From your project folder, run:

```bash
cd chatbot
git init
git add .
git commit -m "Initial commit: AskSiddhartha chatbot"
git branch -M main
git remote add origin https://github.com/siddhartha4u2c/RAGA.git
git push -u origin main
```

### 2. Create a Web Service on Render

1. Go to [render.com](https://render.com) and sign in (or sign up with GitHub).
2. Click **New +** → **Web Service**.
3. Connect your GitHub account if needed, then select the repository you pushed.
4. Use these settings:
   - **Name**: e.g. `asksiddhartha`
   - **Region**: choose the one closest to you.
   - **Branch**: `main`
   - **Root Directory**: leave blank (if the repo root is the `chatbot` folder with `app.py`, you’re good; if your repo root is the parent folder, set **Root Directory** to `chatbot`).
   - **Runtime**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `gunicorn app:app`  
     (Or leave Start Command blank; Render will use the `Procfile` in the repo.)

### 3. Add environment variables

In the same Web Service, open **Environment** and add:

| Key               | Value                    | Required in prod |
|-------------------|--------------------------|-------------------|
| `SECRET_KEY`      | A long random string     | Yes               |
| `OPENAI_API_KEY`  | Your OpenAI API key      | No (for AI)       |
| `SERPAPI_API_KEY` | Your SerpAPI key (optional) | No            |

To generate a `SECRET_KEY` (e.g. on Git Bash or WSL):  
`openssl rand -hex 32`

### 4. Deploy

Click **Create Web Service**. Render will build and deploy. When it’s done, your app will be at:

`https://YOUR_SERVICE_NAME.onrender.com`

The repo includes a **Procfile** and **runtime.txt** so Render knows how to run the app. Session and uploads are in-memory only; they are not persisted across restarts.

## Environment variables

| Variable           | Required | Description                                                |
|--------------------|----------|------------------------------------------------------------|
| `OPENAI_API_KEY`   | No       | Enables AI replies (OpenAI API)                            |
| `SERPAPI_API_KEY`  | No       | Enables real-time web search (SerpAPI / Google SERP)       |
| `GOOGLE_SERP_API_KEY` | No    | Alternative env name for SerpAPI key (same behavior)      |
| `SECRET_KEY`       | Yes in prod | Secret for Flask session cookies                       |
| `PORT`             | Set by Render | Server port                                            |
| `OPENAI_MODEL`     | No       | Model name (default: `gpt-5.3-chat-latest`)               |

Without `OPENAI_API_KEY`, the bot still runs and returns a short welcome message so you can test the UI and voice/text flow.
