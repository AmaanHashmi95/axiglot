import { NextRequest } from "next/server";
import { getTranslation, getPhonetics, getAudio } from "@/lib/translation-services";

export async function GET(req: NextRequest) {
  const text = req.nextUrl.searchParams.get("text");
  const lang = req.nextUrl.searchParams.get("lang");

  if (!text || !lang) return Response.json({ error: "Missing parameters" }, { status: 400 });

  try {
    const english = await getTranslation(text, lang);
    const phonetic = await getPhonetics(text, lang);
    const audio = await getAudio(text, lang);

    return Response.json({ english, phonetic, audio });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Translation failed" }, { status: 500 });
  }
}
