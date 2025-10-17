// middleware.ts
import arcjet, { shield, slidingWindow } from "@arcjet/next";

// Build separate clients for reads and writes (if key present)
const key = process.env.ARCJET_KEY ?? null;

const ajRead = key
  ? arcjet({
      key,
      rules: [
        shield({ mode: "LIVE" }),                  // bot heuristics
        slidingWindow({ interval: "1m", max: 1200 }) // reads: ~20 rps/IP
      ],
    })
  : null;

const ajWrite = key
  ? arcjet({
      key,
      rules: [
        shield({ mode: "LIVE" }),
        slidingWindow({ interval: "1m", max: 60 })   // writes: ~1 rps/IP
      ],
    })
  : null;

export default async function middleware(req: Request) {
  const { pathname } = new URL(req.url);

  // Allow health entirely
  if (pathname === "/api/health") return;

  const isWrite = req.method !== "GET";

  // If no key, be lenient on reads and fail closed on writes
  if (!ajRead || !ajWrite) {
    if (isWrite) {
      return new Response("Service unavailable", { status: 503 });
    }
    return;
  }

  // Writes (stricter)
  if (isWrite) {
    const decision = await ajWrite.protect(req);
    if (decision.isDenied()) {
      return new Response("Too Many Requests", {
        status: 429,
        headers: { "Retry-After": "10" },
      });
    }
    return;
  }

  // Reads
  const decision = await ajRead.protect(req);
  if (decision.isDenied()) {
    return new Response("Too Many Requests", {
      status: 429,
      headers: { "Retry-After": "5" },
    });
  }
  return;
}

// Only protect APIs
export const config = { matcher: ["/api/:path*"] };
