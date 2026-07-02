FROM python:3.12-slim

WORKDIR /app

# Install dependencies first so Docker caches this layer when only
# application code changes — rebuilds stay fast.
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

# Railway assigns its own $PORT at runtime and routes traffic to it - it
# does not respect a hardcoded port. JSON-array form wrapping sh -c so
# $PORT is expanded (falls back to 8000 locally) while still satisfying
# Docker's recommended exec-form signal handling.
CMD ["sh", "-c", "uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}"]
