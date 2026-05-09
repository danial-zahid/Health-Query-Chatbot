# app.py
from __future__ import annotations

import google.generativeai as genai
from flask import Flask, jsonify, render_template, request
from google.generativeai.types import HarmBlockThreshold, HarmCategory

import config
import safety

app = Flask(__name__)

_SAFETY_SETTINGS = [
    {
        "category": HarmCategory.HARM_CATEGORY_HARASSMENT,
        "threshold": HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
        "category": HarmCategory.HARM_CATEGORY_HATE_SPEECH,
        "threshold": HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
        "category": HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
        "threshold": HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
        "category": HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
        "threshold": HarmBlockThreshold.BLOCK_ONLY_HIGH,
    },
]


def _build_models_to_try():
    preferred = (config.GEMINI_MODEL or "gemini-2.5-flash").strip()
    fallbacks = [
        preferred,
        "gemini-2.5-flash",
        "gemini-2.5-flash-lite",
        "gemini-2.0-flash",
        "gemini-2.0-flash-lite",
        "gemini-2.5-pro",
    ]
    seen: set[str] = set()
    ordered: list[str] = []
    for m in fallbacks:
        if m and m not in seen:
            seen.add(m)
            ordered.append(m)
    return ordered


def _extract_text(resp) -> str | None:
    try:
        t = getattr(resp, "text", None)
        if t is not None:
            return t.strip() or None
    except ValueError:
        pass
    cands = getattr(resp, "candidates", None) or []
    if not cands:
        return None
    parts = getattr(getattr(cands[0], "content", None), "parts", None) or []
    chunks: list[str] = []
    for p in parts:
        tx = getattr(p, "text", None)
        if tx:
            chunks.append(tx)
    out = "".join(chunks).strip()
    return out or None


def _generate_once(model_name: str, user_query: str):
    genai.configure(api_key=config.GEMINI_API_KEY)
    mdl = genai.GenerativeModel(
        model_name=model_name,
        system_instruction=config.SYSTEM_PROMPT.strip(),
        safety_settings=_SAFETY_SETTINGS,
    )
    return mdl.generate_content(
        user_query,
        generation_config={
            "temperature": 0.5,
            "max_output_tokens": 1024,
        },
    )


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/chat", methods=["POST"])
def chat():
    if not config.GEMINI_API_KEY:
        return jsonify(
            {
                "response": (
                    "❌ Missing GEMINI_API_KEY. Add your key from https://aistudio.google.com/apikey "
                    "to `.env`, then restart the server."
                )
            }
        ), 503

    data = request.get_json(silent=True) or {}
    user_query = (data.get("query") or "").strip()

    if not user_query:
        return jsonify({"response": "Please enter a valid query."}), 400

    if not safety.check_input_safety(user_query):
        safety_msg = (
            "🚨 It sounds like you might be in distress. I cannot provide advice on this. "
            "Please contact emergency services immediately."
        )
        return jsonify({"response": safety_msg})

    last_error = None
    for model_name in _build_models_to_try():
        try:
            resp = _generate_once(model_name, user_query)
            ai_text = _extract_text(resp)
            if ai_text:
                return jsonify({"response": safety.add_disclaimer(ai_text)})
            last_error = RuntimeError(f"Empty or blocked reply from {model_name}.")
        except Exception as e:
            last_error = e
            err_s = str(e).lower()
            retryable = (
                "404" in err_s
                or "not found" in err_s
                or "429" in err_s
                or "quota" in err_s
                or "resource exhausted" in err_s
            )
            if retryable:
                app.logger.warning("Gemini retry (model=%s): %s", model_name, e)
                continue
            app.logger.exception("Gemini error on model %s: %s", model_name, e)
            break

    app.logger.exception("All Gemini attempts failed; last=%s", last_error)
    return jsonify(
        {
            "response": (
                "❌ Gemini could not answer (model/blocking/network). Check server logs. "
                "If you see \"404\", set GEMINI_MODEL in `.env` to a model listed at "
                "https://ai.google.dev/gemini-api/docs/models and restart."
            ),
        }
    )


if __name__ == "__main__":
    genai.configure(api_key=config.GEMINI_API_KEY)
    app.run(debug=True, host="0.0.0.0", port=5000)
