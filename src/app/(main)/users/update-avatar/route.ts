import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  const { user } = await validateRequest();
  if (!user) return new Response("Unauthorized", { status: 401 });

  const { avatarUrl } = await req.json();

  await prisma.user.update({
    where: { id: user.id },
    data: { avatarUrl },
  });

  return new Response("Avatar updated");
}
