export async function getTranslation(text: string, lang: string) {
    const apiKey = process.env.GOOGLE_TRANSLATE_API_KEY;
    const response = await fetch(
      `https://translation.googleapis.com/language/translate/v2?key=${apiKey}&q=${encodeURIComponent(text)}&source=${lang}&target=en`
    );
    const data = await response.json();
    return data.data.translations[0].translatedText;
  }
  
  export async function getPhonetics(text: string, lang: string) {
    // Example: OpenAI or another NLP service
    return `Phonetic: ${text}`; // Placeholder for actual phonetic conversion
  }
  
  export async function getAudio(text: string, lang: string) {
    return `https://api.voicerss.org/?key=${process.env.VOICE_RSS_API_KEY}&hl=${lang}&src=${encodeURIComponent(text)}`;
  }
  