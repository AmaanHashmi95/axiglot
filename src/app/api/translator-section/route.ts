import { NextResponse } from "next/server";
import axios from "axios";

export async function POST(req: Request) {
  try {
    const { text, to, from } = await req.json();
    if (!text || !to) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    console.log("Request received for translation:", { text, from, to });

    // Step 1: Translate full text
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
          to,
        },
      }
    );

    const translatedText = translationResponse.data[0]?.translations[0]?.text || "Translation error";
    console.log("Translation successful:", translatedText);

    // Step 2: Transliterate full text (if applicable)
    let transliteratedText = "";
    if (["pa", "ur"].includes(to)) {
      try {
        console.log(`Attempting transliteration for ${to}...`);

        const fromScript = to === "pa" ? "Guru" : "Arab";

        const transliterationResponse = await axios.post(
          process.env.AZURE_TRANSLATOR_ENDPOINT + "/transliterate",
          [{ Text: translatedText }],
          {
            headers: {
              "Ocp-Apim-Subscription-Key": process.env.AZURE_TRANSLATOR_API_KEY_1!,
              "Ocp-Apim-Subscription-Region": process.env.AZURE_TRANSLATOR_LOCATION!,
              "Content-Type": "application/json",
            },
            params: {
              "api-version": "3.0",
              language: to,
              fromScript,
              toScript: "Latn",
            },
          }
        );

        transliteratedText = transliterationResponse.data[0]?.text || "";
        console.log("Transliteration successful:", transliteratedText);
      } catch (translitError: any) { // ✅ Explicitly cast error type
        console.error("Transliteration failed:", translitError?.response?.data || translitError?.message || translitError);
      }
    }

    // Step 3: Translate word-by-word
    const words = text.split(" ");
    const wordTranslations = [];

    for (const word of words) {
      try {
        const wordTranslationResponse = await axios.post(
          process.env.AZURE_TRANSLATOR_ENDPOINT + "/translate",
          [{ Text: word }],
          {
            headers: {
              "Ocp-Apim-Subscription-Key": process.env.AZURE_TRANSLATOR_API_KEY_1!,
              "Ocp-Apim-Subscription-Region": process.env.AZURE_TRANSLATOR_LOCATION!,
              "Content-Type": "application/json",
            },
            params: {
              "api-version": "3.0",
              from,
              to,
            },
          }
        );

        const translatedWord = wordTranslationResponse.data[0]?.translations[0]?.text || "";
        let transliteratedWord = "";

        if (["pa", "ur"].includes(to)) {
          try {
            const wordTransliterationResponse = await axios.post(
              process.env.AZURE_TRANSLATOR_ENDPOINT + "/transliterate",
              [{ Text: word }],
              {
                headers: {
                  "Ocp-Apim-Subscription-Key": process.env.AZURE_TRANSLATOR_API_KEY_1!,
                  "Ocp-Apim-Subscription-Region": process.env.AZURE_TRANSLATOR_LOCATION!,
                  "Content-Type": "application/json",
                },
                params: {
                  "api-version": "3.0",
                  language: to,
                  fromScript: to === "pa" ? "Guru" : "Arab",
                  toScript: "Latn",
                },
              }
            );

            transliteratedWord = wordTransliterationResponse.data[0]?.text || "";
          } catch (error: any) { // ✅ Explicitly cast error type
            console.error(`Word transliteration failed for "${word}":`, error?.message || error);
          }
        }

        wordTranslations.push({ original: word, translation: translatedWord, transliteration: transliteratedWord });
      } catch (error: any) { // ✅ Explicitly cast error type
        console.error(`Word translation failed for "${word}":`, error?.message || error);
      }
    }

    return NextResponse.json({ translation: translatedText, transliteration: transliteratedText, wordTranslations });

  } catch (error: any) { // ✅ Explicitly cast error type
    console.error("Translation error:", error?.message || error);
    return NextResponse.json({ error: "Translation failed" }, { status: 500 });
  }
}
