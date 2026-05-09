# Nura Health · Health Query Chatbot

A small **Flask** web app with a styled UI (“Nura Health”) that answers **general wellness** questions using the **Google Gemini API**. It applies **basic input safety filters** and appends an **always-on medical disclaimer** (education only—not a substitute for professional care).

## Features

- **Web UI**: responsive layout, suggestions, typing-style bot replies (`templates/`, `static/`).
- **Backend**: Flask `GET /`, `POST /chat` returning JSON `{ "response": "..." }`.
- **LLM**: [Google Gemini](https://ai.google.dev/gemini-api/docs/models) via `google-generativeai`, with **automatic fallback** across several model IDs when one returns 404/quota limits.
- **Safety**: blocked phrases in `config.BLOCKED_KEYWORDS` handled in `safety.py`; Gemini safety thresholds tuned for health Q&A tone.

## Project layout

```
Health_query_chatbot/
├── app.py              # Flask app, Gemini routes
├── config.py           # Loads .env, system prompt, model + keyword list
├── safety.py           # Input checks & response disclaimer
├── requirements.txt    # Python dependencies
├── .env.example        # Copy to .env and fill your key (never commit .env)
├── templates/
│   └── index.html
└── static/
    ├── css/style.css
    ├── js/script.js
    └── images/        # Optional assets (.gitkeep)
```

## Prerequisites

- **Python 3.10+** (3.13 OK)
- A **Gemini API key** from [Google AI Studio](https://aistudio.google.com/apikey)

## Setup

```bash
cd Health_query_chatbot
python -m venv .venv
.venv\Scripts\activate          # Windows
# source .venv/bin/activate       # Linux / macOS

pip install -r requirements.txt
copy .env.example .env           # Windows: copy; then edit .env
# cp .env.example .env           # Unix
```

Put your real key in `.env`:

```env
GEMINI_API_KEY=your_key_here
# Optional override if a model 404s or hits quota—see Gemini docs:
# GEMINI_MODEL=gemini-2.5-flash
```

## Run

```bash
python app.py
```

Open **[http://127.0.0.1:5000](http://127.0.0.1:5000)** in the browser.

## API

| Method | Path   | Body | Response |
|--------|--------|------|----------|
| `POST` | `/chat` | `{ "query": "your question" }` | `{ "response": "..." }` |

## Important disclaimer

This project is for **learning and general information only**. It **does not** diagnose, prescribe, or replace a licensed clinician. For emergencies, use local emergency services.

## License

Use and modify freely for internships or coursework; retain disclaimer and safety-conscious design if you redeploy publicly.
