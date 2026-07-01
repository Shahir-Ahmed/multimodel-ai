from groq import Groq

from config.settings import GROQ_KEY


def create_groq_client() -> Groq:
    groq_api_key = GROQ_KEY
    if not groq_api_key:
        raise ValueError("GROQ_API_KEY not found")

    return Groq(api_key=groq_api_key)