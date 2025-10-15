import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { LikeInfo } from "@/lib/types";

type RouteParams = { postId: string };

export async function GET(
  _req: Request,
  { params }: { params: Promise<RouteParams> }
) {
  try {
    const { user: loggedInUser } = await validateRequest();
    if (!loggedInUser) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const { postId } = await params;

    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: {
        likes: { where: { userId: loggedInUser.id }, select: { userId: true } },
        _count: { select: { likes: true } },
      },
    });

    if (!post) return Response.json({ error: "Post not found" }, { status: 404 });

    const data: LikeInfo = {
      likes: post._count.likes,
      isLikedByUser: !!post.likes.length,
    };

    return Response.json(data);
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(
  _req: Request,
  { params }: { params: Promise<RouteParams> }
) {
  try {
    const { user: loggedInUser } = await validateRequest();
    if (!loggedInUser) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const { postId } = await params;

    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { userId: true },
    });
    if (!post) return Response.json({ error: "Post not found" }, { status: 404 });

    await prisma.$transaction([
      prisma.like.upsert({
        where: { userId_postId: { userId: loggedInUser.id, postId } },
        create: { userId: loggedInUser.id, postId },
        update: {},
      }),
      ...(loggedInUser.id !== post.userId
        ? [
            prisma.notification.create({
              data: {
                issuerId: loggedInUser.id,
                recipientId: post.userId,
                postId,
                type: "LIKE",
              },
            }),
          ]
        : []),
    ]);

    return new Response();
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<RouteParams> }
) {
  try {
    const { user: loggedInUser } = await validateRequest();
    if (!loggedInUser) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const { postId } = await params;

    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { userId: true },
    });
    if (!post) return Response.json({ error: "Post not found" }, { status: 404 });

    await prisma.$transaction([
      prisma.like.deleteMany({
        where: { userId: loggedInUser.id, postId },
      }),
      prisma.notification.deleteMany({
        where: {
          issuerId: loggedInUser.id,
          recipientId: post.userId,
          postId,
          type: "LIKE",
        },
      }),
    ]);

    return new Response();
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
