# safety.py

"""Safety filters for user inputs and AI outputs."""

from config import BLOCKED_KEYWORDS

def check_input_safety(user_query: str) -> bool:
    """
    Check if the user query contains harmful or emergency keywords.
    Returns True if safe, False if blocked.
    """
    query_lower = user_query.lower()
    
    for keyword in BLOCKED_KEYWORDS:
        if keyword in query_lower:
            return False # Unsafe query
            
    return True

def add_disclaimer(ai_response: str) -> str:
    """
    Append a medical disclaimer to every AI response.
    """
    disclaimer = "\n\n⚠️ *Disclaimer: I am an AI, not a doctor. This information is for educational purposes only. Please consult a healthcare professional for medical advice.*"
    return ai_response + disclaimer