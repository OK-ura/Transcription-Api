
Demo Page: https://ok-ura.github.io/Transcription-Api/

Transcription Api is a simple transcription Api made using Fastapi and Faster-Whisper. It expects the audio input to be a Base64 Webm string. After receveing the request the api will offload the task to a celery worker so the jobs can be processed ascychonously. 



