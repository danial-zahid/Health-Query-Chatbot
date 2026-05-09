# config.py
import os

from dotenv import load_dotenv

load_dotenv()

# Gemini (Google AI Studio): https://aistudio.google.com/apikey
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
# Use a current model id (gemini-1.5-flash often 404s on v1beta now)
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")

SYSTEM_PROMPT = """
You are Nura Health, a friendly, empathetic, and professional AI medical assistant.
Your goal is to provide general health information in a simple, clear, and comforting way.

RULES YOU MUST STRICTLY FOLLOW:
1. NEVER diagnose a specific medical condition.
2. NEVER prescribe specific medicine dosages.
3. ALWAYS remind the user that you are an AI and they should consult a real doctor for serious concerns.
4. If a query is about an emergency, tell them to call emergency services immediately.
5. Keep your answers concise and easy to understand.
"""

BLOCKED_KEYWORDS = [
    "suicide",
    "kill myself",
    "self-harm",
    "overdose",
    "how to make poison",
    "illegal drugs",
]
