import React, { useState, useEffect } from 'react';
// import './index.css'; // This import IS needed for your local setup

// --- Toast Notification Component ---
function Toast({ message, show, onDismiss }) {
    useEffect(() => {
        if (show) {
            const timer = setTimeout(() => {
                onDismiss();
            }, 2000); // Show toast for 2 seconds
            return () => clearTimeout(timer);
        }
    }, [show, onDismiss]);

    return (
        <div
            className={`fixed bottom-10 left-1/2 -translate-x-1/2 bg-gray-700 text-white py-3 px-6 rounded-lg shadow-2xl transition-all duration-300 ${
                show ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
            }`}
            style={{ zIndex: 50 }}
        >
            {message}
        </div>
    );
}

// --- Card Components ---

function QuoteCard({ item }) {
    return (
        <div className="bg-gray-700 rounded-lg shadow-lg p-5 flex flex-col justify-between h-full">
            <div>
                <p className="text-xs font-semibold uppercase text-purple-300 mb-3">Quote</p>
                <p className="text-xl italic text-white">"{item.text}"</p>
            </div>
            {item.author && item.author.toLowerCase() !== 'unknown' && (
                <p className="text-right text-gray-400 mt-4">- {item.author}</p>
            )}
        </div>
    );
}

function SongCard({ item }) {
    const placeholderImg = `https://placehold.co/300x300/334155/93c5fd?text=${encodeURIComponent(item.title)}`;
    return (
        <div className="bg-gray-700 rounded-lg shadow-lg overflow-hidden">
            <img src={item.imageUrl || placeholderImg} alt={`Album art for ${item.title}`} className="w-full h-48 object-cover" />
            <div className="p-5">
                <p className="text-xs font-semibold uppercase text-pink-300 mb-1">Song</p>
                <h3 className="text-2xl font-bold text-white mb-1">{item.title}</h3>
                <p className="text-lg text-gray-300 mb-4">{item.artist}</p>
                <a href={item.url || "#"} target="_blank" rel="noopener noreferrer" className="inline-block bg-green-500 text-white font-bold py-2 px-4 rounded-full hover:bg-green-600 transition-colors">
                    Listen on Spotify
                </a>
            </div>
        </div>
    );
}

// --- NEW MUSIC CARDS ---
function AlbumCard({ item }) {
    const placeholderImg = `https://placehold.co/300x300/334155/ec4899?text=${encodeURIComponent(item.title)}`;
    return (
        <div className="bg-gray-700 rounded-lg shadow-lg overflow-hidden">
            <img src={item.imageUrl || placeholderImg} alt={`Album art for ${item.title}`} className="w-full h-48 object-cover" />
            <div className="p-5">
                <p className="text-xs font-semibold uppercase text-pink-300 mb-1">Album</p>
                <h3 className="text-2xl font-bold text-white mb-1">{item.title}</h3>
                <p className="text-lg text-gray-300 mb-4">{item.artist}</p>
                <a href={item.url || "#"} target="_blank" rel="noopener noreferrer" className="inline-block bg-pink-500 text-white font-bold py-2 px-4 rounded-full hover:bg-pink-600 transition-colors">
                    View Album
                </a>
            </div>
        </div>
    );
}

function PlaylistCard({ item }) {
    return (
        <div className="bg-gray-700 rounded-lg shadow-lg p-5 flex flex-col justify-between h-full">
            <div>
                <p className="text-xs font-semibold uppercase text-green-300 mb-3">Playlist</p>
                <h3 className="text-xl font-semibold text-white mb-2">{item.title}</h3>
                <p className="text-sm text-gray-400 mb-4">A playlist from {item.sourceName}</p>
            </div>
            <a href={item.url || "#"} target="_blank" rel="noopener noreferrer" className="inline-block bg-green-700 text-white font-bold py-2 px-4 rounded-full hover:bg-green-800 transition-colors text-center">
                Listen Now
            </a>
        </div>
    );
}
// --- END NEW MUSIC CARDS ---

function MovieCard({ item }) {
    const placeholderImg = `https://placehold.co/300x450/334155/93c5fd?text=${encodeURIComponent(item.title)}`;
    return (
        <div className="bg-gray-700 rounded-lg shadow-lg overflow-hidden">
            <img src={item.imageUrl || placeholderImg} alt={`Poster for ${item.title}`} className="w-full h-64 object-cover" />
            <div className="p-5">
                <p className="text-xs font-semibold uppercase text-purple-300 mb-1">Movie</p>
                <h3 className="text-2xl font-bold text-white mb-2">{item.title} ({item.year})</h3>
                <p className="text-gray-300 text-sm mb-4 line-clamp-3">{item.description}</p>
                <a href={item.url || "#"} target="_blank" rel="noopener noreferrer" className="inline-block bg-yellow-500 text-gray-900 font-bold py-2 px-4 rounded-full hover:bg-yellow-600 transition-colors">
                    View on IMDb
                </a>
            </div>
        </div>
    );
}

function BookCard({ item }) {
    const placeholderImg = `https://placehold.co/300x450/334155/c4b5fd?text=${encodeURIComponent(item.title)}`;
    return (
        <div className="bg-gray-700 rounded-lg shadow-lg overflow-hidden">
            <img src={item.coverImg || placeholderImg} alt={`Cover for ${item.title}`} className="w-full h-64 object-cover" />
            <div className="p-5">
                <p className="text-xs font-semibold uppercase text-indigo-300 mb-1">Book</p>
                <h3 className="text-2xl font-bold text-white mb-1">{item.title}</h3>
                <p className="text-lg text-gray-300 mb-4">{item.author}</p>
                <a href={item.url || "#"} target="_blank" rel="noopener noreferrer" className="inline-block bg-indigo-500 text-white font-bold py-2 px-4 rounded-full hover:bg-indigo-600 transition-colors">
                    View on Goodreads
                </a>
            </div>
        </div>
    );
}

function TVShowCard({ item }) {
    const placeholderImg = `https://placehold.co/300x450/334155/a5f3fc?text=${encodeURIComponent(item.title)}`;
    return (
        <div className="bg-gray-700 rounded-lg shadow-lg overflow-hidden">
            <img src={item.imageUrl || placeholderImg} alt={`Poster for ${item.title}`} className="w-full h-64 object-cover" />
            <div className="p-5">
                <p className="text-xs font-semibold uppercase text-cyan-300 mb-1">TV Show</p>
                <h3 className="text-2xl font-bold text-white mb-2">{item.title} ({item.year})</h3>
                <p className="text-gray-300 text-sm mb-4 line-clamp-3">{item.description}</p>
                <a href={item.url || "#"} target="_blank" rel="noopener noreferrer" className="inline-block bg-cyan-500 text-gray-900 font-bold py-2 px-4 rounded-full hover:bg-cyan-600 transition-colors">
                    View Details
                </a>
            </div>
        </div>
    );
}

function ArticleCard({ item }) {
    return (
        <div className="bg-gray-700 rounded-lg shadow-lg p-5 flex flex-col justify-between h-full">
            <div>
                <p className="text-xs font-semibold uppercase text-gray-300 mb-3">Article</p>
                <h3 className="text-xl font-semibold text-white mb-2">{item.title}</h3>
                <p className="text-sm text-gray-400 mb-4">{item.sourceName}</p>
            </div>
            <a href={item.url || "#"} target="_blank" rel="noopener noreferrer" className="inline-block bg-gray-500 text-white font-bold py-2 px-4 rounded-full hover:bg-gray-600 transition-colors text-center">
                Read Article
            </a>
        </div>
    );
}

function PodcastCard({ item }) {
    return (
        <div className="bg-gray-700 rounded-lg shadow-lg p-5 flex flex-col justify-between h-full">
            <div>
                <p className="text-xs font-semibold uppercase text-green-300 mb-3">Podcast</p>
                <h3 className="text-xl font-semibold text-white mb-2">{item.title}</h3>
                <p className="text-sm text-gray-400 mb-4">{item.podcastName}</p>
            </div>
            <a href={item.url || "#"} target="_blank" rel="noopener noreferrer" className="inline-block bg-green-700 text-white font-bold py-2 px-4 rounded-full hover:bg-green-800 transition-colors text-center">
                Listen Now
            </a>
        </div>
    );
}

// --- MODIFIED ART/PHOTOGRAPHY CARD ---
function ArtCard({ item }) {
    const isArt = item.contentType === 'art';
    const placeholderImg = `https://placehold.co/300x300/334155/fecdd3?text=${encodeURIComponent(item.title)}`;
    return (
        <div className="bg-gray-700 rounded-lg shadow-lg overflow-hidden">
            <img src={item.imageUrl || placeholderImg} alt={`Artwork: ${item.title}`} className="w-full h-auto object-cover" />
            <div className="p-5">
                <p className="text-xs font-semibold uppercase text-red-300 mb-1">
                    {isArt ? 'Art' : 'Photography'}
                </p>
                <h3 className="text-2xl font-bold text-white mb-1">{item.title}</h3>
                <p className="text-lg text-gray-300 mb-4">{item.artist}</p>
                <a href={item.url || "#"} target="_blank" rel="noopener noreferrer" className="inline-block bg-red-500 text-white font-bold py-2 px-4 rounded-full hover:bg-red-600 transition-colors">
                    View Artwork
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

    // State for the toast notification
    const [toastMessage, setToastMessage] = useState("");
    const [showToast, setShowToast] = useState(false);

    const apiKey = process.env.REACT_APP_GEMINI_API_KEY;; // This line is changed for the Preview environment

    // Function to trigger the toast
    const triggerToast = (message) => {
        setToastMessage(message);
        setShowToast(true);
    };

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

        // --- System Prompt Updated ---
        const systemPrompt = `You are MoodMirror's "MirrorMatch Engine". Your task is to generate a personalized content feed.
Analyze the user's emotion from their text input. Then, consider their chosen "intent".
Based on the emotion and intent, return a JSON object containing a 'feed' key.
This 'feed' key must be an array of 5-7 content items.
Mix the content types: include a variety of 'quote', 'song', 'album', 'playlist', 'movie', 'book', 'tvShow', 'article', 'podcast', 'art', and 'photography'.
Ensure at least one media item (not just quotes) is included if possible.
The user's text is: "${userInput}"
The user's intent is: "${selectedIntent}" (${intents[selectedIntent].description})

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
Also include a top-level 'detectedEmotion' field with the emotion you found.`;

        // --- Response Schema Updated ---
        const responseSchema = {
            type: "OBJECT",
            properties: {
                "detectedEmotion": { "type": "STRING" },
                "feed": {
                    type: "ARRAY",
                    items: {
                        type: "OBJECT",
                        properties: {
                            "contentType": {
                                "type": "STRING",
                                "enum": ["quote", "song", "movie", "book", "tvShow", "article", "podcast", "art", "album", "playlist", "photography"]
                            },
                            "details": {
                                type: "OBJECT",
                                properties: {
                                    // All possible properties
                                    "text": { "type": "STRING" },
                                    "author": { "type": "STRING" },
                                    "title": { "type": "STRING" },
                                    "artist": { "type": "STRING" },
                                    "url": { "type": "STRING" },
                                    "year": { "type": "NUMBER" },
                                    "description": { "type": "STRING" },
                                    "imageUrl": { "type": "STRING" },
                                    "coverImg": { "type": "STRING" },
                                    "sourceName": { "type": "STRING" },
                                    "podcastName": { "type": "STRING" },
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

        // ... (Fetch/retry logic remains the same) ...
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

    // --- Render Function Updated ---
    const renderFeedItem = (item, index) => {
        // Pass contentType to ArtCard so it can change its label
        const itemWithKey = { ...item.details, key: index, contentType: item.contentType };
        switch (item.contentType) {
            case 'quote':
                return <QuoteCard item={itemWithKey} />;
            case 'song':
                return <SongCard item={itemWithKey} />;
            case 'album':
                return <AlbumCard item={itemWithKey} />;
            case 'playlist':
                return <PlaylistCard item={itemWithKey} />;
            case 'movie':
                return <MovieCard item={itemWithKey} />;
            case 'book':
                return <BookCard item={itemWithKey} />;
            case 'tvShow':
                return <TVShowCard item={itemWithKey} />;
            case 'article':
                return <ArticleCard item={itemWithKey} />;
            case 'podcast':
                return <PodcastCard item={itemWithKey} />;
            case 'art':
            case 'photography': // ArtCard handles both
                return <ArtCard item={itemWithKey} />;
            case 'error':
                return (
                    <div className="bg-red-800 border border-red-600 rounded-lg p-5">
                        <h3 className="text-2xl font-bold text-white mb-2">{item.details.emotion}</h3>
                        <p className="text-red-200">{item.details.text}</p>
                    </div>
                );
            default:
                console.warn(`Unknown contentType: ${item.contentType}`);
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white p-4 sm:p-8 font-sans">

            {/* --- Navigation Bar --- */}
            <nav className="max-w-6xl mx-auto flex justify-between items-center mb-8 sm:mb-12">
                <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">
                    MoodMirror
                </h1>
                <div className="flex space-x-4">
                    <button
                        onClick={() => triggerToast("History feature coming soon!")}
                        className="text-gray-400 hover:text-white transition-colors"
                    >
                        History
                    </button>
                    <button
                        onClick={() => triggerToast("Challenges feature coming soon!")}
                        className="text-gray-400 hover:text-white transition-colors"
                    >
                        Challenges
                    </button>
                </div>
            </nav>

            <div className="max-w-6xl mx-auto">
                {/* --- Input Form --- */}
                <div className="w-full max-w-lg mx-auto bg-gray-800 rounded-2xl shadow-2xl p-6 sm:p-8 mb-12">
                    <form onSubmit={handleSubmit}>
                        {/* Text Input */}
                        <label htmlFor="moodInput" className="block text-sm font-medium text-gray-300 mb-2">
                            How are you feeling today?
                        </label>
                        <div className="relative">
                            <textarea
                                id="moodInput"
                                rows="3"
                                placeholder="Write a few words, a sentence, or a full thought here..."
                                value={userInput}
                                onChange={(e) => setUserInput(e.target.value)}
                                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition duration-200"
                                required
                            />
                        </div>

                        {/* MoodScan Alternative Icons */}
                        <div className="flex items-center gap-4 mt-4">
                            <p className="text-sm text-gray-400">Or try:</p>
                            <button
                                type="button"
                                onClick={() => triggerToast("Voice input coming soon!")}
                                className="text-gray-400 hover:text-white transition-colors"
                                title="Use microphone"
                            >
                                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zM10 15a5 5 0 005-5H5a5 5 0 005 5z"></path></svg>
                            </button>
                            <button
                                type="button"
                                onClick={() => triggerToast("Selfie analysis coming soon!")}
                                className="text-gray-400 hover:text-white transition-colors"
                                title="Use camera"
                            >
                                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z"></path><path d="M.002 4.004A2 2 0 012 .004h16a2 2 0 012 2v12a2 2 0 01-2 2H2a2 2 0 01-2-2V4.004zm2 0V16h16V4.004H2.002z"></path></svg>
                            </button>
                        </div>


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
                            disabled={loading} // Always enable the button unless loading
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
                    {/* This logic is wrapped to be safe in the preview environment */}
                    {!apiKey && typeof process !== 'undefined' && process.env.NODE_ENV === 'development' && (
                        <div className="mt-4 p-3 bg-red-800 border border-red-600 rounded-lg text-center text-red-200">
                            <strong>API Key Missing.</strong> Please add your <code>REACT_APP_GEMINI_API_KEY</code> to a <code>.env</code> file.
                        </div>
                    )}

                </div>

                {/* --- Feed Section --- */}
                {currentEmotion && (
                    <div className="flex justify-center items-center gap-4 text-center mb-6">
                        <h2 className="text-2xl font-bold text-gray-300">
                            Detected Emotion: <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">{currentEmotion}</span>
                        </h2>
                        <button
                            onClick={() => triggerToast("Share feature coming soon!")}
                            className="text-gray-400 hover:text-white transition-colors"
                            title="Share this MoodMix"
                        >
                            {/* Simple Share Icon SVG */}
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M13 4v2.25c-3.13 0-5.7 1.2-7.5 3.06.63-2.3 2.94-3.9 5.5-4.31V2l5 5-5 5V9.25C8.04 9.25 6 11.27 6 14c0 .8.17 1.55.44 2.25-.1-.08-.18-.16-.27-.25-1.4-1.4-2.17-3.14-2.17-5C4 7.64 8.05 4 13 4z"></path></svg>
                        </button>
                    </div>
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

            {/* --- Toast Container --- */}
            <Toast
                message={toastMessage}
                show={showToast}
                onDismiss={() => setShowToast(false)}
            />
        </div>
    );
}