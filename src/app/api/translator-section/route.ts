import { NextResponse } from "next/server";
import axios from "axios";

export async function POST(req: Request) {
  try {
    const { text, to, from } = await req.json();
    if (!text || !to) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    console.log("Request received for translation:", { text, from, to });

    // Step 1: Translate text
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

    // Step 2: Transliterate if applicable
    let transliteratedText = "";
    if (["pa", "ur"].includes(to)) {
      try {
        console.log(`Attempting transliteration for ${to}...`);

        // ✅ Fix: Use the correct short forms for Azure's "fromScript"
        const fromScript = to === "pa" ? "Guru" : "Arab"; // Use "Guru" instead of "Gurmukhi"

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
              fromScript, // ✅ Now using the correct short form
              toScript: "Latn", // Convert to Latin script (phonetic)
            },
          }
        );

        transliteratedText = transliterationResponse.data[0]?.text || "";
        console.log("Transliteration successful:", transliteratedText);
      } catch (translitError: any) {
        console.error("Transliteration failed:", translitError.response?.data || translitError.message);
      }
    }

    return NextResponse.json({ translation: translatedText, transliteration: transliteratedText });

  } catch (error: any) {
    console.error("Translation error:", error.response?.data || error.message);
    return NextResponse.json({ error: "Translation failed" }, { status: 500 });
  }
}
