# Dockerfile for deploying the FastAPI backend to Hugging Face Spaces (Docker SDK).
# HF Spaces expects the app to listen on port 7860.

FROM python:3.11-slim

# HF Spaces run as a non-root user (uid 1000); set up a home for it.
RUN useradd -m -u 1000 user
USER user
ENV HOME=/home/user \
    PATH=/home/user/.local/bin:$PATH \
    PORT=7860

WORKDIR /home/user/app

# Install dependencies first for better layer caching.
COPY --chown=user requirements.txt ./
RUN pip install --no-cache-dir --upgrade pip \
    && pip install --no-cache-dir -r requirements.txt

# Copy the application code (engine/, api/, search.py).
COPY --chown=user . .

EXPOSE 7860

# Bind to the port HF provides (7860 by default).
CMD ["sh", "-c", "uvicorn api.main:app --host 0.0.0.0 --port ${PORT:-7860}"]
