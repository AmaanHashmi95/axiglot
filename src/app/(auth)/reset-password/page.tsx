"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState } from "react";
import { Input } from "@/app/(main)/components/ui/input";
import { Button } from "@/app/(main)/components/ui/button";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({ token, password }),
    });

    const data = await res.json();
    setMessage(data.message);
    setSubmitted(true);
  }

  return (
    <main className="max-w-md mx-auto mt-32 space-y-6 p-6 bg-white shadow-lg rounded">
      <h1 className="text-2xl font-bold">Reset Password</h1>
      {submitted ? (
        <div className="space-y-4">
          <p className="text-green-600">{message}</p>
          <Button onClick={() => router.push("/login")}>Back to Login</Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="password"
            placeholder="New password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button type="submit">Update Password</Button>
        </form>
      )}
    </main>
  );
}
