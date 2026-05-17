FROM python:3.11-slim

# Install system dependencies needed for audio processing (FFmpeg is required for Whisper)
RUN apt-get update && apt-get install -y \
    ffmpeg \
    gcc \
    pkg-config \
    python3-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Expose port for FastAPI
EXPOSE 8000