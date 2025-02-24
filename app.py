from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import requests
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)

# Get API keys from environment variables
OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')
STABILITY_API_KEY = os.getenv('STABILITY_API_KEY')

def generate_stability_image(prompt):
    url = "https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image"
    
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {STABILITY_API_KEY}"
    }
    
    payload = {
        "text_prompts": [{"text": prompt}],
        "cfg_scale": 7,
        "height": 1024,
        "width": 1024,
        "steps": 30,
        "samples": 1
    }
    
    try:
        response = requests.post(url, headers=headers, json=payload)
        response.raise_for_status()
        return response.json()['artifacts'][0]['base64']
    except Exception as e:
        print(f"Stability AI Error: {str(e)}")
        raise

def generate_dalle_image(prompt):
    url = "https://api.openai.com/v1/images/generations"
    
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {OPENAI_API_KEY}"
    }
    
    payload = {
        "prompt": prompt,
        "n": 1,
        "size": "1024x1024",
        "response_format": "url"
    }
    
    try:
        response = requests.post(url, headers=headers, json=payload)
        response.raise_for_status()
        return response.json()['data'][0]['url']
    except Exception as e:
        print(f"DALL-E Error: {str(e)}")
        raise

@app.route('/api/generate-images', methods=['POST'])
def generate_images():
    try:
        data = request.get_json()
        prompt = data.get('prompt')
        
        if not prompt:
            return jsonify({"error": "Prompt is required"}), 400
            
        if not OPENAI_API_KEY or not STABILITY_API_KEY:
            return jsonify({"error": "API keys not configured"}), 500

        # Generate images from both services
        stability_image = generate_stability_image(prompt)
        dalle_image = generate_dalle_image(prompt)

        return jsonify({
            "success": True,
            "images": {
                "stabilityAI": stability_image,
                "dalleE": dalle_image
            }
        })

    except Exception as e:
        print(f"Error generating images: {str(e)}")
        return jsonify({
            "error": "Failed to generate images",
            "message": str(e)
        }), 500

if __name__ == '__main__':
    app.run(port=3000, debug=True) 