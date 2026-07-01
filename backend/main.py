"""
HTTP API for the multimodel AI assistant.

The original project (clients/, decorators/, services/) was built around an
interactive terminal loop using input()/print(). This module reuses that
same client and service layer unchanged and wraps it in a small FastAPI app
so a web frontend can drive the same Gemini/Groq chat and PDF-chat
functionality. Nothing in clients/, decorators/, services/, or utils/ was
modified to make this work - this file is the only new piece.
"""

import time
import uuid

import httpx
from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from google.genai import types
from pydantic import BaseModel

from clients.client_factory import create_client
from services.response_service import gemini_response, groq_response, generate_pdf_response
from utils.pdf_utils import pdf_text_from_bytes

app = FastAPI(title="Multimodel AI API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

PROVIDERS = ("gemini", "groq")

# One client per provider, created on first use and cached for the life of
# the process - mirrors what create_client(provider) did once per CLI run.
_clients: dict[str, object] = {}

# In-memory document store, keyed by a generated doc_id. Fine for local use
# and demos; swap for Redis or a DB if this needs to survive a restart or
# run across multiple server processes.
_documents: dict[str, dict] = {}


def get_client(provider: str):
    if provider not in PROVIDERS:
        raise HTTPException(status_code=400, detail=f"Unknown provider '{provider}'. Choose gemini or groq.")
    if provider not in _clients:
        try:
            _clients[provider] = create_client(provider)
        except ValueError as exc:
            raise HTTPException(status_code=500, detail=str(exc)) from exc
    return _clients[provider]


class Message(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    provider: str
    history: list[Message]


class ChatResponse(BaseModel):
    content: str
    latency_ms: int


class DocumentResponse(BaseModel):
    doc_id: str
    name: str
    char_count: int


class DocumentChatRequest(BaseModel):
    doc_id: str
    provider: str
    prompt: str


@app.get("/api/providers")
def list_providers() -> list[str]:
    return list(PROVIDERS)


@app.post("/api/chat", response_model=ChatResponse)
def chat(req: ChatRequest) -> ChatResponse:
    client = get_client(req.provider)
    history = [m.model_dump() for m in req.history]

    start = time.perf_counter()
    try:
        if req.provider == "gemini":
            content = gemini_response(client, history)
        else:
            content = groq_response(client, history)
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"{req.provider} request failed: {exc}") from exc
    latency_ms = round((time.perf_counter() - start) * 1000)

    if content is None:
        raise HTTPException(status_code=502, detail=f"{req.provider} returned no content.")

    return ChatResponse(content=content, latency_ms=latency_ms)


@app.post("/api/documents/upload", response_model=DocumentResponse)
async def upload_document(file: UploadFile = File(...)) -> DocumentResponse:
    if not (file.filename or "").lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")

    doc_data = await file.read()
    if not doc_data:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")

    return _store_document(doc_data, name=file.filename)


@app.post("/api/documents/from-url", response_model=DocumentResponse)
def add_document_from_url(url: str = Form(...)) -> DocumentResponse:
    try:
        response = httpx.get(url, timeout=30, follow_redirects=True)
        response.raise_for_status()
    except httpx.HTTPError as exc:
        raise HTTPException(status_code=400, detail=f"Could not fetch that URL: {exc}") from exc

    doc_data = response.content
    if not doc_data:
        raise HTTPException(status_code=400, detail="Downloaded content was empty.")

    name = url.rstrip("/").rsplit("/", 1)[-1] or url
    return _store_document(doc_data, name=name)


def _store_document(doc_data: bytes, name: str) -> DocumentResponse:
    try:
        pdf_text = pdf_text_from_bytes(doc_data)
    except Exception as exc:
        raise HTTPException(status_code=400, detail=f"Could not read PDF: {exc}") from exc

    doc_id = uuid.uuid4().hex
    _documents[doc_id] = {"bytes": doc_data, "text": pdf_text, "name": name}

    return DocumentResponse(doc_id=doc_id, name=name, char_count=len(pdf_text))


@app.post("/api/documents/chat", response_model=ChatResponse)
def chat_with_document(req: DocumentChatRequest) -> ChatResponse:
    doc = _documents.get(req.doc_id)
    if doc is None:
        raise HTTPException(status_code=404, detail="Document not found. Upload it again.")

    client = get_client(req.provider)
    pdf_part = types.Part.from_bytes(data=doc["bytes"], mime_type="application/pdf")

    start = time.perf_counter()
    try:
        content = generate_pdf_response(
            client=client,
            pdf_part=pdf_part,
            pdf_text=doc["text"],
            prompt=req.prompt,
            provider=req.provider,
        )
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"{req.provider} request failed: {exc}") from exc
    latency_ms = round((time.perf_counter() - start) * 1000)

    return ChatResponse(content=content, latency_ms=latency_ms)
