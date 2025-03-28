import sys
import os
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS

# Add the parent directory to the Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Import functions from the ML module
from ML.main import get_recommendations, load_recommendation_model

app = Flask(__name__, static_folder='../frontend/build')
CORS(app)  # Enable CORS for all routes


# API route for movie recommendations
@app.route('/api/recommend', methods=['GET'])
def recommend():
    try:
        movie = request.args.get('movie', '')
        top_n = request.args.get('count', 5, type=int)

        if not movie:
            return jsonify({"error": "No movie title provided"}), 400

        # Get movie recommendations
        recommendations = get_recommendations(movie, top_n=top_n)

        return jsonify(recommendations)
    except Exception as e:
        return jsonify({"error": f"Error processing request: {str(e)}"}), 500


# API route to get a list of all available movies (for autocomplete)
@app.route('/api/movies', methods=['GET'])
def get_movies():
    try:
        # Load model to get access to the data
        _, indices, _ = load_recommendation_model()

        # Get all movie titles
        movies = list(indices.index)

        return jsonify({
            "count": len(movies),
            "movies": movies
        })
    except Exception as e:
        return jsonify({"error": f"Error retrieving movies: {str(e)}"}), 500


# Health check endpoint
@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({"status": "healthy"})


# Serve React frontend in production
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    if path != "" and os.path.exists(app.static_folder + '/' + path):
        return send_from_directory(app.static_folder, path)
    else:
        return send_from_directory(app.static_folder, 'index.html')


if __name__ == "__main__":
    print("Loading recommendation model...")
    try:
        # Pre-load the model when the app starts
        load_recommendation_model()
        print("Model loaded successfully!")
    except Exception as e:
        print(f"Warning: Could not pre-load model: {e}")
        print("Model will be loaded on first request")

    # Determine port for the app (use environment variable if available)
    port = int(os.environ.get('PORT', 5000))

    # Start the Flask app
    app.run(debug=True, host='0.0.0.0', port=port)