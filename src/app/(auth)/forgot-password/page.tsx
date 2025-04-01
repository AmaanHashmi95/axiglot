"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    });

    const data = await res.json();
    setMessage(data.message || "Check your email.");
    setSubmitted(true);
  }

  return (
    <main className="max-w-md mx-auto mt-32 space-y-6 p-6 bg-white shadow-lg rounded">
      <h1 className="text-2xl font-bold">Forgot Password</h1>
      {submitted ? (
        <p className="text-green-600">{message}</p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            placeholder="Your email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Button type="submit">Send Reset Link</Button>
        </form>
      )}
    </main>
  );
}
