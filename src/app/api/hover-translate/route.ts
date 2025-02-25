import { NextResponse } from "next/server";
import axios from "axios";

export async function POST(req: Request) {
  try {
    const { text, from } = await req.json();
    if (!text || !from) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    console.log("HoverTranslate Request:", { text, from });

    // Step 1: Translate text into English
    const translationResponse = await axios.post(
      process.env.AZURE_TRANSLATOR_ENDPOINT + "/translate",
      [{ Text: text }],
      {
        headers: {
          "Ocp-Apim-Subscription-Key": process.env.AZURE_TRANSLATOR_API_KEY_1!,
          "Ocp-Apim-Subscription-Region": process.env.AZURE_TRANSLATOR_LOCATION!,
          "Content-Type": "application/json",
        },
        params: {
          "api-version": "3.0",
          from,
          to: "en", // Always translating to English
        },
      }
    );

    const translatedText = translationResponse.data[0]?.translations[0]?.text || "Translation error";
    console.log("HoverTranslate: Translation successful:", translatedText);

    // Step 2: Fetch transliteration of the **original** text
    let transliteratedText = null;
    if (["pa", "ur"].includes(from)) {
      try {
        console.log(`HoverTranslate: Transliteration requested for ${from}...`);

        const fromScript = from === "pa" ? "Guru" : "Arab"; // Punjabi (Gurmukhi), Urdu (Arabic)

        const transliterationResponse = await axios.post(
          process.env.AZURE_TRANSLATOR_ENDPOINT + "/transliterate",
          [{ Text: text }], // Transliterate the original text
          {
            headers: {
              "Ocp-Apim-Subscription-Key": process.env.AZURE_TRANSLATOR_API_KEY_1!,
              "Ocp-Apim-Subscription-Region": process.env.AZURE_TRANSLATOR_LOCATION!,
              "Content-Type": "application/json",
            },
            params: {
              "api-version": "3.0",
              language: from,
              fromScript,
              toScript: "Latn", // Convert to Latin script (phonetic transliteration)
            },
          }
        );

        transliteratedText = transliterationResponse.data[0]?.text || null;
        console.log("HoverTranslate: Transliteration successful:", transliteratedText);
      } catch (translitError: any) {
        console.error("HoverTranslate: Transliteration failed:", translitError.response?.data || translitError.message);
      }
    }

    return NextResponse.json({ translation: translatedText, transliteration: transliteratedText });

  } catch (error: any) {
    console.error("HoverTranslate: Translation error:", error.response?.data || error.message);
    return NextResponse.json({ error: "Translation failed" }, { status: 500 });
  }
}
