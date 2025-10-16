// middleware.ts
import arcjet, { shield, slidingWindow } from "@arcjet/next";

const aj = arcjet({
  key: process.env.ARCJET_KEY!,
  rules: [
    shield({ mode: "LIVE" }),                 // bot detection
    slidingWindow({ interval: "1m", max: 1000 }) // 20 req/min per IP
  ],
});

export default async function middleware(req: Request) {
  const decision = await aj.protect(req);
  if (decision.isDenied()) {
    return new Response("Too Many Requests", { status: 429 });
  }
  return; // allow
}

export const config = {
  matcher: ["/api/:path*"], // protect APIs
};
