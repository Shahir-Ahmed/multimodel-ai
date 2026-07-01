from decorators.validator import validate_provider
from decorators.logger import logger

from clients.gemini_client import create_gemini_client
from clients.groq_client import create_groq_client

@logger
def create_client(provider):
    if provider == "gemini":
        return create_gemini_client()
    if provider == "groq":
        return create_groq_client()

    raise ValueError("Unknown provider")