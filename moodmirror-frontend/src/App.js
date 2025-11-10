import React, { useState } from 'react';
import './index.css'; // This import IS needed for your local setup

// --- Card Components ---
// We've created separate components for each content type.
// This makes it easy to manage the feed.

// A component to render a "Quote" card
function QuoteCard({ item }) {
    return (
        <div className="bg-gray-700 rounded-lg shadow-lg p-5 flex flex-col justify-between h-full">
            <div>
                <svg className="w-8 h-8 text-purple-300 mb-3" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M6 2a1 1 0 00-1 1v1H4a1 1 0 000 2v10a1 1 0 001 1h12a1 1 0 001-1V6a1 1 0 000-2h-1V3a1 1 0 00-1-1H6zM4 6h12v10H4V6zm4 1a1 1 0 011 1v2a1 1 0 01-2 0V8a1 1 0 011-1zm6 0a1 1 0 011 1v2a1 1 0 01-2 0V8a1 1 0 011-1z"></path></svg>
                <p className="text-xl italic text-white">"{item.text}"</p>
            </div>
            <p className="text-right text-gray-400 mt-4">- {item.author || "Unknown"}</p>
        </div>
    );
}

// A component to render a "Song" card
function SongCard({ item }) {
    // Placeholder image for album art
    const placeholderImg = `https://placehold.co/300x300/334155/93c5fd?text=${encodeURIComponent(item.title)}`;

    return (
        <div className="bg-gray-700 rounded-lg shadow-lg overflow-hidden">
            <img src={placeholderImg} alt={`Album art for ${item.title}`} className="w-full h-48 object-cover" />
            <div className="p-5">
                <p className="text-xs font-semibold uppercase text-pink-300 mb-1">Song</p>
                <h3 className="text-2xl font-bold text-white mb-1">{item.title}</h3>
                <p className="text-lg text-gray-300 mb-4">{item.artist}</p>
                <a
                    href={item.url || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block bg-green-500 text-white font-bold py-2 px-4 rounded-full hover:bg-green-600 transition-colors"
                >
                    Listen on Spotify
                </a>
            </div>
        </div>
    );
}

// A component to render a "Movie" card
function MovieCard({ item }) {
    // Placeholder image for movie poster
    const placeholderImg = `https://placehold.co/300x450/334155/93c5fd?text=${encodeURIComponent(item.title)}`;

    return (
        <div className="bg-gray-700 rounded-lg shadow-lg overflow-hidden">
            <img src={placeholderImg} alt={`Poster for ${item.title}`} className="w-full h-64 object-cover" />
            <div className="p-5">
                <p className="text-xs font-semibold uppercase text-purple-300 mb-1">Movie</p>
                <h3 className="text-2xl font-bold text-white mb-2">{item.title} ({item.year})</h3>
                <p className="text-gray-300 text-sm mb-4 line-clamp-3">{item.description}</p>
                <a
                    href={item.url || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block bg-yellow-500 text-gray-900 font-bold py-2 px-4 rounded-full hover:bg-yellow-600 transition-colors"
                >
                    View on IMDb
                </a>
            </div>
        </div>
    );
}


// --- Main App Component ---

export default function App() {
    const [userInput, setUserInput] = useState("");
    const [selectedIntent, setSelectedIntent] = useState("Reflect"); // "Reflect", "Lift", "Calm", "Boost"
    const [feedItems, setFeedItems] = useState(null); // This will be an array
    const [loading, setLoading] = useState(false);
    const [currentEmotion, setCurrentEmotion] = useState(null); // Store the detected emotion

    const apiKey = process.env.REACT_APP_GEMINI_API_KEY; // This line correctly reads from your .env file

    // Map of intents to their descriptions
    const intents = {
        "Reflect": { description: "Find content that matches my feeling", icon: "🎭" },
        "Lift":    { description: "Improve my mood", icon: "🌤️" },
        "Calm":    { description: "Help me relax", icon: "🧘" },
        "Boost":   { description: "Get me motivated", icon: "⚡" }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!userInput.trim()) return;

        setLoading(true);
        setFeedItems(null); // Clear previous feed
        setCurrentEmotion(null); // Clear previous emotion

        // --- New System Prompt ---
        // This is much more advanced. It asks the AI to act as our "MirrorMatch Engine"
        // and return a full feed of different content types.
        const systemPrompt = `You are MoodMirror's "MirrorMatch Engine". Your task is to generate a personalized content feed.
Analyze the user's emotion from their text input. Then, consider their chosen "intent". Also make sure to diversify the content types in the feed and keep it engaging.
Based on the emotion and intent, return a JSON object containing a 'feed' key.
This 'feed' key must be an array of 5-6 content items.
Mix the content types: include 'quote', 'song', and 'movie' items.
The user's text is: "${userInput}"
The user's intent is: "${selectedIntent}" (${intents[selectedIntent].description})

Respond *only* with the JSON object. Do not include markdown.
Each item in the 'feed' array must have a 'contentType' field ("quote", "song", "movie") and a 'details' field.
- For "quote": details must have "text" and "author".
- For "song": details must have "title", "artist", and a "url" (a plausible spotify.com link).
- For "movie": details must have "title", "year" (as a number), "description" (1-2 sentences), and a "url" (a plausible imdb.com link).
Also include a top-level 'detectedEmotion' field with the emotion you found.`;

        // --- New Response Schema ---
        // This schema matches the complex JSON we're asking for.
        const responseSchema = {
            type: "OBJECT",
            properties: {
                "detectedEmotion": { "type": "STRING" },
                "feed": {
                    type: "ARRAY",
                    items: {
                        type: "OBJECT",
                        properties: {
                            "contentType": { "type": "STRING", enum: ["quote", "song", "movie"] },
                            "details": {
                                type: "OBJECT",
                                properties: {
                                    // Quote properties
                                    "text": { "type": "STRING" },
                                    "author": { "type": "STRING" },
                                    // Song properties
                                    "title": { "type": "STRING" },
                                    "artist": { "type": "STRING" },
                                    // Movie properties
                                    "year": { "type": "NUMBER" },
                                    "description": { "type": "STRING" },
                                    // Shared property
                                    "url": { "type": "STRING" },
                                },
                            }
                        },
                        required: ["contentType", "details"]
                    }
                }
            },
            required: ["detectedEmotion", "feed"]
        };

        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;

        const payload = {
            contents: [{
                parts: [{ text: "Analyze this input." }] // The real prompt is in systemInstruction
            }],
            systemInstruction: {
                parts: [{ text: systemPrompt }]
            },
            generationConfig: {
                responseMimeType: "application/json",
                responseSchema: responseSchema
            }
        };

        // ... (The fetch/retry logic remains the same) ...
        let response;
        let retries = 3;
        let delay = 1000;
        let success = false;

        for (let i = 0; i < retries; i++) {
            try {
                response = await fetch(apiUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                if (response.ok) { success = true; break; }
                if (response.status === 429 || response.status >= 500) {
                    console.warn(`API request failed, retrying in ${delay}ms...`);
                    await new Promise(res => setTimeout(res, delay));
                    delay *= 2;
                } else {
                    throw new Error(`API Error: ${response.status} ${response.statusText}`);
                }
            } catch (error) {
                console.error("Fetch error:", error);
                if (i < retries - 1) {
                    await new Promise(res => setTimeout(res, delay));
                    delay *= 2;
                } else {
                    setFeedItems([{
                        contentType: 'error',
                        details: {
                            emotion: "Error",
                            text: "Could not get a response. Check your network connection."
                        }
                    }]);
                    setLoading(false);
                    return;
                }
            }
        }

        if (!success || !response) {
            setFeedItems([{ contentType: 'error', details: { emotion: "Error", text: "Could not get a response after retries." } }]);
            setLoading(false);
            return;
        }
        // ... (End of fetch/retry logic) ...

        try {
            const apiResult = await response.json();
            const jsonText = apiResult.candidates?.[0]?.content?.parts?.[0]?.text;

            if (jsonText) {
                const data = JSON.parse(jsonText);
                setFeedItems(data.feed); // Set the new feed array
                setCurrentEmotion(data.detectedEmotion); // Set the detected emotion
            } else {
                console.error("Invalid response structure:", apiResult);
                throw new Error("Invalid response from API.");
            }
        } catch (error) {
            console.error("Error processing API response:", error);
            setFeedItems([{
                contentType: 'error',
                details: {
                    emotion: "Error",
                    text: "Failed to process the API response."
                }
            }]);
        } finally {
            setLoading(false);
        }
    };

    // --- New Render Function ---
    // This function decides which card component to use for each item
    const renderFeedItem = (item, index) => {
        const itemWithKey = { ...item.details, key: index };
        switch (item.contentType) {
            case 'quote':
                return <QuoteCard item={itemWithKey} />;
            case 'song':
                return <SongCard item={itemWithKey} />;
            case 'movie':
                return <MovieCard item={itemWithKey} />;
            case 'error':
                return (
                    <div className="bg-red-800 border border-red-600 rounded-lg p-5">
                        <h3 className="text-2xl font-bold text-white mb-2">{item.details.emotion}</h3>
                        <p className="text-red-200">{item.details.text}</p>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white p-4 sm:p-8 font-sans">
            <div className="max-w-6xl mx-auto">

                {/* --- Header --- */}
                <div className="text-center mb-8 sm:mb-12">
                    <h1 className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">
                        MoodMirror
                    </h1>
                    <p className="text-gray-400 mt-2 text-lg">Media that understands you</p>
                </div>

                {/* --- Input Form --- */}
                <div className="w-full max-w-lg mx-auto bg-gray-800 rounded-2xl shadow-2xl p-6 sm:p-8 mb-12">
                    <form onSubmit={handleSubmit}>
                        {/* Text Input */}
                        <label htmlFor="moodInput" className="block text-sm font-medium text-gray-300 mb-2">
                            How are you feeling today?
                        </label>
                        <textarea
                            id="moodInput"
                            rows="3"
                            placeholder="Write a few words, a sentence, or a full thought here..."
                            value={userInput}
                            onChange={(e) => setUserInput(e.target.value)}
                            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition duration-200"
                            required
                        />

                        {/* Mood Intent Buttons */}
                        <label className="block text-sm font-medium text-gray-300 mt-6 mb-2">
                            What's your goal?
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            {Object.entries(intents).map(([intent, { description, icon }]) => (
                                <button
                                    key={intent}
                                    type="button"
                                    onClick={() => setSelectedIntent(intent)}
                                    className={`p-3 text-left rounded-lg transition-all duration-200 border-2 ${
                                        selectedIntent === intent
                                            ? 'bg-purple-600 border-purple-400 shadow-lg'
                                            : 'bg-gray-700 border-gray-600 hover:bg-gray-600'
                                    }`}
                                >
                                    <span className="text-2xl" role="img" aria-label={intent}>{icon}</span>
                                    <p className="font-semibold text-white mt-1">{intent}</p>
                                    <p className="text-xs text-gray-300">{description}</p>
                                </button>
                            ))}
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading || !apiKey}
                            className="w-full mt-8 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-lg shadow-md hover:from-purple-600 hover:to-pink-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 focus:ring-offset-gray-800 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-lg"
                        >
                            {loading ? (
                                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            ) : (
                                "Mirror My Mood"
                            )}
                        </button>
                    </form>

                    {/* API Key Warning */}
                    {!apiKey && (
                        <div className="mt-4 p-3 bg-red-800 border border-red-600 rounded-lg text-center text-red-200">
                            <strong>API Key Missing.</strong> Please add your <code>REACT_APP_GEMINI_API_KEY</code> to a <code>.env</code> file.
                        </div>
                    )}

                </div>

                {/* --- Feed Section --- */}
                {currentEmotion && (
                    <h2 className="text-2xl font-bold text-gray-300 text-center mb-6">
                        Detected Emotion: <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">{currentEmotion}</span>
                    </h2>
                )}

                {/* This is the Pinterest-style layout */}
                {feedItems && (
                    <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-6 space-y-6">
                        {feedItems.map((item, index) => (
                            <div key={index} className="break-inside-avoid">
                                {renderFeedItem(item, index)}
                            </div>
                        ))}
                    </div>
                )}

            </div>
        </div>
    );
}