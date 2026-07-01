from google.genai import types

from decorators.retry import retry
from decorators.logger import logger
from decorators.timer import timer


@retry
@timer
def gemini_response(client, history):
    contents = [f"{m['role']}: {m['content']}" for m in history]
    grounding_tool = types.Tool(
    google_search = types.GoogleSearch()
    )

    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=contents,
        config = types.GenerateContentConfig(
            tools = [grounding_tool],
            temperature = 2
        )
    )
    return response.text

@retry
@timer
def groq_response(client, history):
    messages = [
        {"role": m["role"], "content": m["content"]}
        for m in history
    ]

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=messages,
    )
    return response.choices[0].message.content

@retry
@timer
@logger
def generate_pdf_response(client, pdf_part, pdf_text, prompt, provider):
    if provider == "gemini":
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=[pdf_part, prompt],
            config=types.GenerateContentConfig(
                system_instruction="Answer within 200 characters"
            ),
        )
        return response.text

    if provider == "groq":
        # Groq expects messages[].content to be a STRING, not a list.
        user_message = (
            f"PDF content (text extracted):\n{pdf_text}\n\n"
            f"User request: {prompt}"
        )

        chat_completion = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": user_message}],
        )
        return chat_completion.choices[0].message.content

    raise ValueError("Invalid provider")    