import { NextResponse } from "next/server";
import axios from "axios";

export async function POST(req: Request) {
  try {
    const { text, from } = await req.json();
    if (!text || !from) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    console.log("HoverTranslate Request:", { text, from });

    // Step 1: Translate entire sentence
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
          to: "en",
        },
      }
    );

    const translatedText = translationResponse.data[0]?.translations[0]?.text || "Translation error";
    console.log("HoverTranslate: Translation successful:", translatedText);

    // Step 2: Transliterate entire sentence
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
      } catch (translitError) {
        console.error(
          "HoverTranslate: Transliteration failed:",
          (translitError as Error).message
        );
      }
    }

    // Step 3: Perform word-by-word translation manually
    const words = text.split(" "); // Split sentence into words
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
              to: "en",
            },
          }
        );

        const translatedWord = wordTranslationResponse.data[0]?.translations[0]?.text || "";
        let transliteratedWord = "";

        if (["pa", "ur"].includes(from)) {
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
                  language: from,
                  fromScript: from === "pa" ? "Guru" : "Arab",
                  toScript: "Latn",
                },
              }
            );

            transliteratedWord = wordTransliterationResponse.data[0]?.text || "";
          } catch (error) {
            console.error(
              `Word transliteration failed for "${word}":`,
              (error as Error).message
            );
          }
        }

        wordTranslations.push({
          original: word,
          translation: translatedWord,
          transliteration: transliteratedWord,
        });
      } catch (error) {
        console.error(
          `Word translation failed for "${word}":`,
          (error as Error).message
        );
      }
    }

    console.log("HoverTranslate: Word-by-word translation completed:", wordTranslations);

    return NextResponse.json({
      translation: translatedText,
      transliteration: transliteratedText,
      wordTranslations,
    });

  } catch (error) {
    console.error("HoverTranslate: Translation error:", (error as Error).message);
    return NextResponse.json({ error: "Translation failed" }, { status: 500 });
  }
}
