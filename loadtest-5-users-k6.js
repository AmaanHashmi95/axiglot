// loadtest-5-users-k6.js
// Usage:
//   BASE=https://your-domain.com k6 run loadtest-5-users-k6.js
//   # or for local dev
//   BASE=http://localhost:3000 k6 run loadtest-5-users-k6.js
//
// Notes:
// - Starts with 0 VUs and ramps to 5 quickly, holds, then ramps down.
// - By default it tests public routes: "/", "/api/health" (change to what exists in your app).
// - If you have a test login endpoint, uncomment the login() section and adjust paths.
// - Lucia default cookie name is usually "auth_session" — set AUTH_COOKIE if you want to reuse a real cookie.

import http from "k6/http";
import { check, sleep } from "k6";

const BASE = __ENV.BASE || "http://localhost:3000";
const AUTH_COOKIE = __ENV.AUTH_COOKIE || ""; // optional: paste a valid cookie to hit auth-only endpoints

export const options = {
  scenarios: {
    five_users: {
      executor: "ramping-vus",
      startVUs: 0,
      stages: [
        { duration: "10s", target: 5 }, // ramp to 5 VUs
        { duration: "40s", target: 5 }, // hold
        { duration: "10s", target: 0 }, // ramp down
      ],
      gracefulRampDown: "5s",
    },
  },
  thresholds: {
    http_req_duration: ["p(95)<800"], // 95% requests < 800ms
    http_req_failed: ["rate<0.01"],   // <1% failures
  },
};

// Optional login flow if you expose a test-only login endpoint
// function login() {
//   const payload = JSON.stringify({ email: "test@example.com", password: "password123" });
//   const res = http.post(`${BASE}/api/test-auth/login`, payload, {
//     headers: { "Content-Type": "application/json" },
//   });
//   check(res, { "login 200": (r) => r.status === 200 });
//   const cookie = res.cookies["auth_session"]?.[0]?.value;
//   return cookie;
// }

export default function () {
  // const session = login(); // if using login
  const headers = AUTH_COOKIE ? { Cookie: `auth_session=${AUTH_COOKIE}` } : {};

  let res = http.get(`${BASE}/`, { headers });
  check(res, { "GET / ok": (r) => r.status >= 200 && r.status < 400 });

  // Replace "/api/health" with a real lightweight API route in your app
  res = http.get(`${BASE}/api/health`, { headers });
  check(res, { "GET /api/health ok": (r) => r.status >= 200 && r.status < 400 });

  // Simulate think time between actions
  sleep(1 + Math.random() * 1.5);

  // Example write endpoint (adjust to your app)
  // res = http.post(`${BASE}/api/post`, JSON.stringify({ text: "hello from k6" }), {
  //   headers: { "Content-Type": "application/json", ...headers },
  // });
  // check(res, { "POST /api/post ok": (r) => r.status === 200 || r.status === 201 });
}
