import fitz

from pathlib import Path

from decorators.timer import timer
from decorators.logger import logger
from decorators.validator import validate_file_extension

def pdf_to_text(file_path) -> str:
    text = []
    with fitz.open(file_path) as document:
        for page in document:
            text.append(page.get_text())
    return "\n".join(text)


def pdf_text_from_bytes(pdf_bytes: bytes) -> str:
    """Extract text from in-memory PDF bytes."""
    text = []
    with fitz.open(stream=pdf_bytes, filetype="pdf") as document:
        for page in document:
            text.append(page.get_text())
    return "\n".join(text)
