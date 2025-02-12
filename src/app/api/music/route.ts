import { NextResponse } from "next/server";
import prisma from "@/lib/prisma"; // Ensure prisma client is set up

export async function GET() {
  const songs = await prisma.song.findMany();
  return NextResponse.json(songs);
}
