Demo Page: https://ok-ura.github.io/Transcription-Api/

Transcription API is a simple transcription API made using FastAPI and Faster-Whisper. It expects a base64 WebM string as an audio input. After receiving the request, the API will offload the task to a Celery worker so transcriptions can be processed asynchronously.



