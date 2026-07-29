"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const sanitizedEmail = email.trim().toLowerCase();

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: sanitizedEmail, password }),
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || "Something went wrong.");
      return;
    }

    router.push(data.role === "OWNER" ? "/admin" : "/account");
    router.refresh();
  }

  return (
    <div className="container" style={{ maxWidth: 420, padding: "64px 24px" }}>
      <h1 style={{ fontSize: 28, marginBottom: 8 }}>Log in</h1>
      <p style={{ color: "var(--ink-soft)", marginBottom: 28 }}>
        Same login for shopping and for watching workshop videos.
      </p>

      <form onSubmit={handleSubmit}>
        <div className="field">
          <label>Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div className="field">
          <label>Password</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>

        {error && <p className="error-text">{error}</p>}

        <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
          {loading ? "Logging in…" : "Log in"}
        </button>
      </form>

      <p style={{ marginTop: 20, fontSize: 14, color: "var(--ink-soft)" }}>
        New here? <a href="/register" style={{ color: "var(--pine)", fontWeight: 600 }}>Create an account</a>
      </p>
    </div>
  );
}
