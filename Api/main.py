import os
import base64

from fastapi import FastAPI 
from pydantic import BaseModel
from celery.result import AsyncResult
from dispatcher import dispatch, transcribeAudio
from fastapi.middleware.cors import CORSMiddleware


class Voice(BaseModel):
    audio: str



app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

""
@app.post("/transcribe")

async def transcribe(log:Voice):


    #dispatch task 
    task = transcribeAudio.delay(log.audio)

    return {"taskID": task.id, "status":"processing"}

@app.get("/status/{taskID}")
async def get_status(taskID: str):

    result = AsyncResult(taskID, app=dispatch)

    if result.state == "PENDING":
        return {"status": "In Queue"}
    elif result.state == "STARTED":
        return {"status": "STARTED"}
    elif result.state == "SUCCESS":
        return {"status": "SUCCESS", "result": result.result}
    elif result.state == "FAILURE":
        return {"status": "FAILURE", "error": str(result.info)}













