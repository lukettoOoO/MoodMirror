from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from models import MoodRequest, AIResponse, FeedItem, ItemDetails # Importăm modelele
import google.generativeai as genai
import os
import json
import httpx
from typing import Optional

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
                        # AM ADĂUGAT "book_query" AICI
                        "enum": ["quote", "song", "movie", "book", "tvShow", "article", "podcast", "art", "album", "playlist", "photography", "book_query"]
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
                            "query": {"type": "STRING"} # <--- AM ADĂUGAT ASTA
                        }
                    }
                },
                "required": ["contentType", "details"]
            }
        }
    },
    "required": ["detectedEmotion", "feed"]
}

# --- Funcții Utilitare (Servicii) ---

async def search_google_books(query: str) -> Optional[ItemDetails]:
    """
    Caută o carte folosind Google Books API și returnează un ItemDetails
    """
    # API-ul Google Books nu necesită cheie pentru căutări simple
    BOOKS_API_URL = "https://www.googleapis.com/books/v1/volumes"

    # Folosim un client httpx asincron
    async with httpx.AsyncClient() as client:
        try:
            # Facem cererea GET către API-ul Google Books
            response = await client.get(
                BOOKS_API_URL,
                params={"q": query, "maxResults": 1, "projection": "lite"}
            )
            response.raise_for_status() # Aruncă o eroare dacă cererea eșuează

            data = response.json()

            if "items" in data and len(data["items"]) > 0:
                book = data["items"][0]
                info = book.get("volumeInfo", {})

                # Extragem datele reale
                title = info.get("title", "Titlu necunoscut")
                author = info.get("authors", ["Autor necunoscut"])[0]
                url = info.get("infoLink", "#")
                # Obținem imaginea copertei
                cover_img = info.get("imageLinks", {}).get("thumbnail")

                # Returnăm un model ItemDetails completat cu date reale
                return ItemDetails(
                    title=title,
                    author=author,
                    url=url,
                    coverImg=cover_img
                )

        except httpx.HTTPStatusError as e:
            print(f"Eroare HTTP la căutarea cărții: {e}")
        except Exception as e:
            print(f"Eroare la procesarea Google Books API: {e}")

    return None # Returnează None dacă nu se găsește nimic sau dacă apare o eroare

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
- For "book": **Do not generate book details.** Instead, return: contentType: "book_query", details: {{ "query": "a good search term for a book here" }}
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

        # --- PROCESARE NOUĂ A FEED-ULUI ---
        # Aici se întâmplă magia

        original_feed = response_data.get("feed", [])
        processed_feed = [] # O nouă listă pentru feed-ul procesat

        for item in original_feed:
            content_type = item.get("contentType")
            details = item.get("details", {})

            if content_type == "book_query":
                # Am primit o cerere de carte de la AI!
                query = details.get("query")
                if query:
                    # Căutăm cartea reală folosind funcția noastră
                    print(f"Se caută cartea: {query}")
                    book_details = await search_google_books(query)

                    if book_details:
                        # Dacă găsim o carte, o adăugăm la feed-ul procesat
                        # cu contentType-ul corect "book"
                        processed_feed.append(FeedItem(
                            contentType="book",
                            details=book_details
                        ))
                    else:
                        # Opțional: adaugă un placeholder dacă nu găsești
                        print(f"Nu s-a găsit nicio carte pentru query: {query}")

            else:
                # Pentru orice alt tip de conținut (quote, song, etc.)
                # îl adăugăm direct în listă
                processed_feed.append(FeedItem(
                    contentType=content_type,
                    details=ItemDetails(**details)
                ))

        # Înlocuim feed-ul generat de AI cu feed-ul nostru procesat
        response_data["feed"] = processed_feed

        # --- SFÂRȘIT PROCESARE NOUĂ ---

        # Validează și returnează datele folosind modelul Pydantic
        # Acum response_data["feed"] conține cărți reale!
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