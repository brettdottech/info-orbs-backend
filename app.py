from flask import Flask, jsonify, request
from flask_cors import CORS
import uuid

app = Flask(__name__)
CORS(app)

# A dictionary to store JSON payloads for each user based on their token
user_data = {}

# Route to generate a unique token
@app.route('/generate-token', methods=['GET'])
def generate_token():
    token = str(uuid.uuid4())  # Generate a unique token
    user_data[token] = {
        "interval": 5000,
        "displays": [
            {
                "label": "CPU",
                "data": 48,
                "labelColor": "blue",
                "color": "red",
                "background": "silver",
                "alignment": "right"
            },
            {
                "label": "PNY NVME",
                "data": 46.85
            },
            {
                "label": "WD Blue NVME",
                "data": 38.85
            },
            {
                "label": "Uptime",
                "data": [
                    {
                        "type": "circle",
                        "x": 50,
                        "y": 50,
                        "radius": 20,
                        "color": "red",
                        "filled": True
                    },
                    {
                        "type": "text",
                        "x": 120,
                        "y": 170,
                        "font": 1,
                        "text": "TestMe",
                        "color": "white",
                        "background": "darkgrey"
                    },
                    {
                        "type": "rectangle",
                        "x": 70,
                        "y": 180,
                        "height": 50,
                        "width": 100,
                        "filled": True,
                        "color": "blue"
                    },
                    {
                        "type": "triangle",
                        "x": 120,
                        "y": 120,
                        "x2": 180,
                        "y2": 60,
                        "x3": 60,
                        "y3": 60,
                        "filled": False,
                        "color": "red"
                    },
                    {
                        "type": "line",
                        "x": 60,
                        "y": 120,
                        "x2": 180,
                        "y2": 120,
                        "color": "blue"
                    },
                    {
                        "type": "arc",
                        "x": 120,
                        "y": 120,
                        "radius": 30,
                        "innerRadius": 20,
                        "angleStart": 270,
                        "angleEnd": 90,
                        "color": "blue"
                    },
                    {
                        "type": "character",
                        "x": 120,
                        "y": 190,
                        "character": "E",
                        "color": "green",
                        "font": 2
                    }
                ],
                "labelX": 100,
                "labelY": 100
            },
            {
                "label": "Load 1 min",
                "data": "1.51",
                "color": "green",
                "labelColor": "dark green",
                "fullDraw": False
            }
        ]
    }
    return jsonify({"token": token})

# Route to get user-specific JSON payload based on the token
@app.route('/webhook/<token>', methods=['GET'])
def get_webhook(token):
    if token in user_data:
        return jsonify(user_data[token])
    else:
        return jsonify({"error": "Invalid token"}), 404

# Route to update user-specific JSON payload and return the updated JSON
@app.route('/webhook/<token>', methods=['POST'])
def post_webhook(token):
    if token in user_data:
        data = request.json
        if data:
            user_data[token] = data
        return jsonify(user_data[token])  # Return the updated JSON
    else:
        return jsonify({"error": "Invalid token"}), 404

if __name__ == '__main__':
        app.run(host='0.0.0.0', port=5000, debug=True)
