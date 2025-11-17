from pydantic import BaseModel
from typing import List, Dict, Any, Literal, Union

# --- Modele pentru Datele de Intrare ---

class MoodRequest(BaseModel):
    """ Model pentru datele primite de la frontend [cite: 158, 159] """
    text_input: str
    mood_intent: str


# --- Modele pentru Datele de Ieșire (Răspuns) ---
# Acestea reflectă structura JSON pe care o ai în App.js

class ItemDetails(BaseModel):
    """ Un model flexibil care poate conține detaliile pentru orice tip de card """
    text: str | None = None
    author: str | None = None
    title: str | None = None
    artist: str | None = None
    url: str | None = None
    year: int | None = None
    description: str | None = None
    imageUrl: str | None = None
    coverImg: str | None = None
    sourceName: str | None = None
    podcastName: str | None = None

class FeedItem(BaseModel):
    """ Model pentru un singur item din feed """
    contentType: Literal[
        "quote", "song", "movie", "book", "tvShow",
        "article", "podcast", "art", "album",
        "playlist", "photography", "error"
    ]
    details: ItemDetails

class AIResponse(BaseModel):
    """ Modelul pentru întregul răspuns JSON pe care îl va trimite API-ul """
    detectedEmotion: str
    feed: List[FeedItem]