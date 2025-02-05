export async function fetchTranslation(text: string, language: string) {
    const apiUrl = `/api/translate?text=${encodeURIComponent(text)}&lang=${language}`;
    const response = await fetch(apiUrl);
    if (!response.ok) throw new Error("Translation API failed");
    return response.json();
  }
  