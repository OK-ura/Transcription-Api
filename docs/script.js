
const API ="https://pitrsn765-693332174382.us-central1.run.app" //"https://transcription-api-186823278000.us-central1.run.app";

const record = document.getElementById('record');
const listenPV = document.getElementById('listenPV');
const result = document.getElementById('result');
 
let mediaRecorder;
let audioChunks = [];
let isRecording = false;

const toBase64 = (blob) => {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    const base64String = String(reader.result);
                    resolve(base64String);
                };
                reader.onerror = reject;
                reader.readAsDataURL(blob); 
            });
        };

record.addEventListener('click', async () => {
            if (!isRecording) {
                try {
                    
                    const stream = await navigator.mediaDevices.getUserMedia({ 
                        audio: {
                            channelCount: 1,      
                            sampleRate: 16000,    
                            echoCancellation: true,
                            noiseSuppression: true
                        } 
                    });

                    
                    mediaRecorder = new MediaRecorder(stream, { 
                        mimeType: 'audio/webm',
                        audioBitsPerSecond: 128000 
                    });
                    
                    audioChunks = [];

                    mediaRecorder.ondataavailable = e => { 
                        if (e.data.size > 0) audioChunks.push(e.data); 
                    };
                    
                    
                    mediaRecorder.onstop = async () => {
                        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
                        
                        
                        const audioPV = URL.createObjectURL(audioBlob);
                        listenPV.src = audioPV;
                        
                        
                        result.innerText = "Status: Encoding audio payload...";
                        const base64Data = await toBase64(audioBlob);
                        
                        submit(base64Data);
                    };

                    
                    mediaRecorder.start();
                    isRecording = true;
                    
                    record.innerText = "Stop Recording";
                    record.style.backgroundColor = "#dc3545";
                    

                } catch (err) {
                    result.innerText = "Error: Could not access microphone.";
                    console.error(err);
                }
            } else {
                
                mediaRecorder.stop();
                mediaRecorder.stream.getTracks().forEach(track => track.stop());
                
                isRecording = false;
                record.innerText = "Record";
                record.style.backgroundColor = "#ffffff"
            }
        });

async function submit(base64String) {
            result.innerText = "Status: Making request to backend...";
            try {
                const response = await fetch(`${API}/transcribe`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ audio: base64String })
                });
                
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                
                const data = await response.json();
                
                if (!data.taskID ) throw new Error("Missing task ID in response payload");
                
                pollTask(data.taskID);
            } catch (err) {
                result.innerText = "Status: API Submission Failed.";
                console.error(err);
            }
        }

        async function pollTask(taskId) {
            result.innerText = "Status: Task queued...";
            
            const interval = setInterval(async () => {
                try {
                    const response = await fetch(`${API}/status/${taskId}`);
                    const data = await response.json();
                    
                    if (data.status === 'SUCCESS') {
                        clearInterval(interval);
                        
                        
                        let finalResult = data.result;
                        if (data.result && data.result.result !== undefined) {
                            finalResult = data.result.result;
                        }
                        
                        const extractedText = (typeof finalResult === 'object' && finalResult !== null) ? finalResult.text : finalResult;
                        

                        
                        result.innerText = extractedText || "[No speech detected in audio slice]";
                        
                    } else if (data.status === 'FAILURE') {
                        clearInterval(interval);
                        result.innerText = "Status: Processing Failed.";
                    } else {
                        result.innerText = `Status: ${data.status}...`;
                    }
                } catch (err) {
                    clearInterval(interval);
                    result.innerText = "Status: Polling Connection Lost.";
                    
                }
            }, 2000);
        }
