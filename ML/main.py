import pandas as pd
import time
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import joblib
import os
import sys

current_dir = os.path.dirname(os.path.abspath(__file__))

parquet_path = os.path.join(current_dir, "small_dataset.parquet")

data = pd.read_parquet(parquet_path)

models_dir = os.path.join(current_dir, "models")


def build_recommendations_model(data):
    try:
        start_time = time.time()
        print("Building recommendation model...")

        os.makedirs(models_dir, exist_ok=True)

        # Removes common English words like "the," "and," "is"
        tfidf = TfidfVectorizer(stop_words='english')

        tfidf_matrix = tfidf.fit_transform(data['combined_features'])

        tfidf_path = os.path.join(models_dir, "tfidf_vectorizer.joblib")
        joblib.dump(tfidf, tfidf_path)

        indices = pd.Series(data.index, index=data['title'].str.lower()).drop_duplicates()

        indices_path = os.path.join(models_dir, "indices_mapping.joblib")
        joblib.dump(indices, indices_path)

        print("Computing cosine similarity matrix...")
        cosine_sim = cosine_similarity(tfidf_matrix, tfidf_matrix)

        # Save the similarity matrix
        print("Saving model files...")
        cosine_sim_path = os.path.join(models_dir, "cosine_sim_matrix.joblib")
        joblib.dump(cosine_sim, cosine_sim_path)

        print(f"Model building completed in {time.time() - start_time:.2f} seconds")

        load_recommendation_model()

        return cosine_sim, indices

    except Exception as e:
        print(f"Error building model: {e}")
        return None, None, None


def load_recommendation_model():
    # Load the movie data
    data = pd.read_parquet(parquet_path)

    try:

        # Load the similarity matrix
        cosine_sim_path = os.path.join(models_dir, "cosine_sim_matrix.joblib")
        cosine_sim = joblib.load(cosine_sim_path)

        # Load the indices mapping
        indices_path = os.path.join(models_dir, "indices_mapping.joblib")
        indices = joblib.load(indices_path)

        return cosine_sim, indices, data

    except FileNotFoundError:

        print("Model files not found. Building model...")
        cosine_sim, indices = build_recommendations_model(data)

        return cosine_sim, indices, data


def get_recommendations(title, top_n=5):
    cosine_sim, indices, data = load_recommendation_model()

    # Check if any component is missing
    if cosine_sim is None or indices is None or data is None:
        return ("Model not found. Please build the model first.")

    title = title.lower()

    response = {
        "input_movie": title,
        "recommendations": []
    }

    if title not in indices:

        response["error"] = f"Movie '{title}' not found in the database!! Sorry for the inconvenience"
        response["message"] = "Here are other top movies you can enjoy :)"

        # Return popular movies as fallback
        popular_movies = data.sort_values('vote_average', ascending=False).head(top_n)

        for _, movie in popular_movies.iterrows():
            movie_info = {
                "title": movie['title'],
                "id": int(movie.name),  # Use the index as ID
                "similarity": None,  # No similarity for popular recommendations
                "poster_path": movie.get('poster_path', ''),  # Add if available in your dataset
                "vote_average": float(movie.get('vote_average', 0))
            }
            response["recommendations"].append(movie_info)

        return response

    index = indices[title]

    sim_scores = list(enumerate(cosine_sim[index]))

    sim_scores = sorted(sim_scores, key=lambda x: x[1], reverse=True)

    sim_scores = sim_scores[1:11]

    movies_indices = [i[0] for i in sim_scores]

    # Get similarity values
    similarity_values = [i[1] for i in sim_scores]

    # Get recommended movies
    recommended_movies = data.iloc[movies_indices]

    # Add each movie to the recommendations list
    for i, (_, movie) in enumerate(recommended_movies.iterrows()):
        movie_info = {
            "title": movie['title'],
            "id": int(movie.name),  # Use the index as ID
            "similarity": float(similarity_values[i]),
            "poster_path": movie.get('poster_path', ''),  # Add if available
            "vote_average": float(movie.get('vote_average', 0))
        }
        response["recommendations"].append(movie_info)

    return response


def final_output(movie):

    try:
        print(f"\nGetting recommendations for movie '{movie}'...")
        recommendations = get_recommendations(movie, top_n=5)
        # Print formatted JSON output
        import json
        print(json.dumps(recommendations, indent=2))

        return recommendations

    except Exception as e:
        error_response = {
            "error": f"Error getting recommendations: {str(e)}"
        }
        import json
        print(json.dumps(error_response, indent=2))
        return error_response


# For command line testing
if __name__ == "__main__":
    final_output("creed")
