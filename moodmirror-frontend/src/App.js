import React, { useState } from 'react';

export default function App() {
    const [userInput, setUserInput] = useState("");
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    
    const apiKey = process.env.REACT_APP_GEMINI_API_KEY;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!userInput.trim()) return;

        setLoading(true);
        setResult(null);

        const systemPrompt = "You are MoodMirror. Analyze the user's emotion from the provided text. Respond *only* with a JSON object in the format: {\"emotion\": \"emotion_name\", \"recommendation\": \"A short, relevant quote in English\"}. Do not include other text or markdown formatting.";

        const responseSchema = {
            type: "OBJECT",
            properties: {
                "emotion": { "type": "STRING" },
                "recommendation": { "type": "STRING" }
            },
            required: ["emotion", "recommendation"]
        };

        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;

        const payload = {
            contents: [{
                parts: [{ text: userInput }]
            }],
            systemInstruction: {
                parts: [{ text: systemPrompt }]
            },
            generationConfig: {
                responseMimeType: "application/json",
                responseSchema: responseSchema
            }
        };

        // Add exponential backoff for API retries
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

                if (response.ok) {
                    success = true;
                    break;
                } else if (response.status === 429 || response.status >= 500) {
                    // Handle rate limiting or server errors with a retry
                    console.warn(`API request failed with status ${response.status}. Retrying in ${delay}ms...`);
                    await new Promise(res => setTimeout(res, delay));
                    delay *= 2;
                } else {
                    // Other client-side errors (400, 404, etc.) - don't retry
                    throw new Error(`API Error: ${response.status} ${response.statusText}`);
                }

            } catch (error) {
                // Network errors
                console.error("Fetch error:", error);
                if (i < retries - 1) {
                    await new Promise(res => setTimeout(res, delay));
                    delay *= 2;
                } else {
                    // Last retry failed
                    setResult({ emotion: "Error", recommendation: "Could not get a response. Check your network connection." });
                    setLoading(false);
                    return;
                }
            }
        }

        if (!success || !response) {
            setResult({ emotion: "Error", recommendation: "Could not get a response after retries." });
            setLoading(false);
            return;
        }

        try {
            const apiResult = await response.json();
            const jsonText = apiResult.candidates?.[0]?.content?.parts?.[0]?.text;

            if (jsonText) {
                const data = JSON.parse(jsonText);
                setResult(data);
            } else {
                console.error("Invalid response structure:", apiResult);
                throw new Error("Invalid response from API.");
            }

        } catch (error) {
            console.error("Error processing API response:", error);
            setResult({ emotion: "Error", recommendation: "Failed to process the API response." });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white p-4 font-sans">
            <div className="w-full max-w-md bg-gray-800 rounded-2xl shadow-2xl p-6 sm:p-8">

                <div className="text-center mb-8">
                    <h1 className="text-3xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">
                        MoodMirror
                    </h1>
                    <p className="text-gray-400 mt-2">Media that understands you</p>
                </div>

                <form onSubmit={handleSubmit}>
                    <label htmlFor="moodInput" className="block text-sm font-medium text-gray-300 mb-2">
                        How are you feeling today?
                    </label>
                    <div className="flex flex-col sm:flex-row gap-3">
                        <input
                            id="moodInput"
                            type="text"
                            placeholder="Write a few words here..."
                            value={userInput}
                            onChange={(e) => setUserInput(e.target.value)}
                            className="flex-grow px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition duration-200"
                            required
                        />
                        <button
                            type="submit"
                            disabled={loading} // Always enable the button unless loading
                            className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-lg shadow-md hover:from-purple-600 hover:to-pink-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 focus:ring-offset-gray-800 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                        >
                            {loading ? (
                                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            ) : (
                                "Submit"
                            )}
                        </button>
                    </div>
                </form>

                {/* Show a warning if the API key is missing (for local dev) */}
                {/* This logic won't run here, but it's good for your local file */}
                {!apiKey && process.env.NODE_ENV === 'development' && (
                    <div className="mt-4 p-3 bg-red-800 border border-red-600 rounded-lg text-center text-red-200">
                        <strong>API Key Missing.</strong> Please add your <code>REACT_APP_GEMINI_API_KEY</code> to a <code>.env</code> file in your project root.
                    </div>
                )}

                {result && (
                    <div className={`mt-8 p-5 bg-gray-700 rounded-lg border border-gray-600 transition-all duration-500 ease-in-out transform ${result ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
                        <h3 className="text-lg font-semibold mb-2 text-purple-300">
                            Emotion detected:
                        </h3>
                        <p className={`text-2xl font-bold mb-4 ${result.emotion === 'Error' ? 'text-red-400' : 'text-white'}`}>
                            {result.emotion}
                        </p>

                        <h3 className="text-lg font-semibold mb-2 text-pink-300">
                            Recommendation:
                        </h3>
                        <p className="text-gray-200 italic">
                            "{result.recommendation}"
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}


