from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from models import MoodRequest, AIResponse, FeedItem, ItemDetails # Importăm modelele
import google.generativeai as genai
import os
import json

# --- Configurare Inițială ---

app = FastAPI()

# Ia cheia API din variabilele de mediu
# (Rulează `export GEMINI_API_KEY="cheia_ta"` în terminal înainte de a porni serverul)
API_KEY = os.getenv("GEMINI_API_KEY")
if not API_KEY:
    print("Avertisment: Variabila de mediu GEMINI_API_KEY nu este setată.")
    # Poți seta o cheie de test aici dacă dorești, dar nu este recomandat
    # API_KEY = "CHEIA_TA_API_AICI"

if API_KEY:
    genai.configure(api_key=API_KEY)

# --- Configurare CORS ---
# Permite frontend-ului tău React (care rulează pe portul 3000) să comunice cu acest backend [cite: 119, 126, 127]
origins = [
    "http://localhost:3000",
    # Adaugă aici URL-ul de producție al frontend-ului tău când îl vei avea
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Definirea Schema-ului pentru Răspunsul AI ---
# Am mutat schema din App.js aici, în format Python
response_schema = {
    "type": "OBJECT",
    "properties": {
        "detectedEmotion": {"type": "STRING"},
        "feed": {
            "type": "ARRAY",
            "items": {
                "type": "OBJECT",
                "properties": {
                    "contentType": {
                        "type": "STRING",
                        "enum": ["quote", "song", "movie", "book", "tvShow", "article", "podcast", "art", "album", "playlist", "photography"]
                    },
                    "details": {
                        "type": "OBJECT",
                        "properties": {
                            "text": {"type": "STRING"},
                            "author": {"type": "STRING"},
                            "title": {"type": "STRING"},
                            "artist": {"type": "STRING"},
                            "url": {"type": "STRING"},
                            "year": {"type": "NUMBER"},
                            "description": {"type": "STRING"},
                            "imageUrl": {"type": "STRING"},
                            "coverImg": {"type": "STRING"},
                            "sourceName": {"type": "STRING"},
                            "podcastName": {"type": "STRING"},
                        }
                    }
                },
                "required": ["contentType", "details"]
            }
        }
    },
    "required": ["detectedEmotion", "feed"]
}

# --- Endpoints ---

@app.get("/")
def read_root():
    return {"message": "MoodMirror Backend rulează!"}



@app.post("/recommend", response_model=AIResponse)
async def get_recommendation(request: MoodRequest):
    """
    Acesta este endpoint-ul care înlocuiește apelul direct din App.js
    Primește textul și intenția, apelează Gemini și returnează feed-ul.
    """
    if not API_KEY:
        raise HTTPException(status_code=500, detail="Cheia API Gemini nu este configurată pe server.")

    # Logica `intents` din App.js
    intents = {
        "Reflect": "Find content that matches my feeling",
        "Lift": "Improve my mood",
        "Calm": "Help me relax",
        "Boost": "Get me motivated"
    }
    intent_description = intents.get(request.mood_intent, "Match the feeling")

    # --- System Prompt (Mutat din App.js) ---
    system_prompt = f"""You are MoodMirror's "MirrorMatch Engine". Your task is to generate a personalized content feed.
Analyze the user's emotion from their text input. Then, consider their chosen "intent".
Based on the emotion and intent, return a JSON object containing a 'feed' key.
This 'feed' key must be an array of 5-7 content items.
Mix the content types: include a variety of 'quote', 'song', 'album', 'playlist', 'movie', 'book', 'tvShow', 'article', 'podcast', 'art', and 'photography'.
Ensure at least one media item (not just quotes) is included if possible.
The user's text is: "{request.text_input}"
The user's intent is: "{request.mood_intent}" ({intent_description})

Respond *only* with the JSON object. Do not include markdown.
Each item in the 'feed' array must have a 'contentType' field and a 'details' field.
- For "quote": details must have "text" and "author". If no author is known, use "Unknown".
- For "song": details must have "title", "artist", "url" (a plausible spotify.com link), and "imageUrl" (placeholder).
- For "album": details must have "title", "artist", "url" (spotify.com link), and "imageUrl" (placeholder).
- For "playlist": details must have "title", "sourceName" (e.g., "Spotify", "Apple Music"), and "url".
- For "movie": details must have "title", "year" (number), "description" (1-2 sentences), "url" (imdb.com link), and "imageUrl" (placeholder).
- For "book": details must have "title", "author", "url" (goodreads.com link), and "coverImg" (placeholder).
- For "tvShow": details must have "title", "year" (number), "description" (1-2 sentences), "url" (imdb.com link), and "imageUrl" (placeholder).
- For "article": details must have "title", "sourceName" (e.g., "Medium", "The New York Times"), and "url".
- For "podcast": details must have "title" (episode title), "podcastName" (show name), and "url".
- For "art": details must have "title", "artist", "url" (viewing link), and "imageUrl" (placeholder).
- For "photography": details must have "title", "artist" (photographer), "url", and "imageUrl".
Also include a top-level 'detectedEmotion' field with the emotion you found."""

    try:
        # --- Apelul către API-ul Gemini (Metoda finală) ---

        # 1. Folosim un model direct din lista ta: "models/gemini-2.5-flash"
        model = genai.GenerativeModel(
            model_name="models/gemini-2.5-flash", # Am actualizat la 2.5
            generation_config=genai.GenerationConfig(
                response_mime_type="application/json",
                response_schema=response_schema
            ),
            system_instruction=system_prompt
        )

        # 2. Trimitem un prompt simplu, deoarece tot contextul este
        #    în system_instruction și response_schema
        response = model.generate_content("Analyze the user input and generate the feed.")

        # Parsează răspunsul JSON
        response_data = json.loads(response.text)

        # Validează și returnează datele folosind modelul Pydantic
        return AIResponse(**response_data)

    except Exception as e:
        print(f"Eroare la apelul Gemini: {e}")
        # Returnează un răspuns de eroare structurat
        error_feed_item = FeedItem(
            contentType="error",
            details=ItemDetails(
                title="Eroare Backend",
                description=f"Nu s-a putut contacta API-ul Gemini: {str(e)}"
            )
        )
        return AIResponse(
            detectedEmotion="Eroare",
            feed=[error_feed_item]
        )