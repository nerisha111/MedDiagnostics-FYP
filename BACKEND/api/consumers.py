import json
from channels.generic.websocket import WebsocketConsumer
import requests  
import base64
import os

class DiagnosisConsumer(WebsocketConsumer):
    def connect(self):
        self.accept()

    def disconnect(self, close_code):
        pass

    def receive(self, text_data):
        data = json.loads(text_data)
        question = data.get('question')
        image_data = data.get('image_data') # base64 string

        if not question or not image_data:
            self.send(text_data=json.dumps({'error': 'Missing question or image data.'}))
            return

 
        inference_api_url = os.environ.get("AI_API_URL", "http://127.0.0.1:8001/diagnose")

        
        image_bytes = base64.b64decode(image_data.split(',')[1])

      
        files = {'image': ('uploaded_image.jpg', image_bytes, 'image/jpeg')}
        payload = {'question': question}

        try:
            
            response = requests.post(inference_api_url, data=payload, files=files, timeout=300) 
            response.raise_for_status()

            
            result = response.json()
            diagnosis = result.get('diagnosis', 'Failed to parse diagnosis from API.')
            
          
            self.send(text_data=json.dumps({'diagnosis': diagnosis}))

        except requests.exceptions.RequestException as e:
            
            self.send(text_data=json.dumps({'error': f"Could not connect to the AI Diagnosis Service: {e}"}))