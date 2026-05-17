import os 
import base64
from tempfile import NamedTemporaryFile
from faster_whisper import WhisperModel
from celery import Celery

dispatch=Celery(
    "tasks",
    broker=os.getenv("RD_URL", "redis://localhost:6367/0"),
    backend =os.getenv("RD_URL", "redis://localhost:6367/0")

)

model=None
@dispatch.task(name="transcribeAudio")
def transcribeAudio(audio:str):
    audio=audio.split(",")[1]
    global model 
    if model is None:

        model = WhisperModel("base.en",device="cpu",compute_type="float32")

    
    with NamedTemporaryFile(suffix=".webm",delete=False) as transcibeable:
        try:
            transcibeable.write(base64.b64decode(audio))
            transcibeable.flush()

            transcibeable.close()

            segments, info = model.transcribe(transcibeable.name, beam_size=5,vad_filter=False)

            segments = list(segments)

            text = "".join([segment.text for segment in segments])

        
            return {"text": text, "language": info.language}
        finally:
            if os.path.exists(transcibeable.name):
                os.unlink(transcibeable.name)