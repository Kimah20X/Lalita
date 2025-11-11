import axios from "axios";

export const translateText = async (req, res) => {
  try {
    const { text, targetLanguage } = req.body;

    if (!text || !targetLanguage) {
      return res.status(400).json({ error: "Text and targetLanguage are required." });
    }

    // Supported target languages
    const supportedLanguages = ["en", "ha", "pcm"];

    // Validate target language
    if (!supportedLanguages.includes(targetLanguage)) {
      return res.status(400).json({ 
        error: `Unsupported language. Choose from: ${supportedLanguages.join(", ")}` 
      });
    }

    // Google Translate API (free endpoint)
    const response = await axios.get("https://translate.googleapis.com/translate_a/single", {
      params: {
        client: "gtx",
        sl: "auto", // auto-detect source language
        tl: targetLanguage,
        dt: "t",
        q: text,
      },
    });

    // Extract translation safely
    const translatedText = response.data?.[0]?.[0]?.[0] || text;

    // Detect the source language (from Google response)
    const detectedLang = response.data?.[2] || "unknown";

    res.json({
      original: text,
      translated: translatedText,
//      detectedLanguage: detectedLang,
      targetLanguage,
//      fallbackUsed: translatedText === text, // tells if fallback happened
    });

  } catch (error) {
    console.error("Translation error:", error.message);
    res.status(500).json({
      error: "Translation failed. Returning original text.",
      translated: text,

    });
  }
};
