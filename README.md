
Demo Page: https://ok-ura.github.io/Transcription-Api/

Transcription Api is a simple transcription Api made using FastApi and Faster-Whisper. It expects a Base64 Webm string as an audio input. After receveing the request the Api will offload the task to a celery worker so transcriptions can be processed ascychonously. 



