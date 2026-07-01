from google import genai
from config.settings import GEMINI_KEY


def create_gemini_client() -> genai.Client:
    gemini_api_key = GEMINI_KEY

    if not gemini_api_key:
        raise ValueError("GEMINI_API_KEY not found")

    return genai.Client(api_key=gemini_api_key)
