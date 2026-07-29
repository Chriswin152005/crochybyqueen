"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
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
    if (data.role !== "OWNER") {
      setError("This account isn't set up as the workshop owner.");
      return;
    }

    router.push("/admin");
    router.refresh();
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--pine-dark)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div className="card" style={{ width: 380, padding: 36 }}>
        <div className="label" style={{ marginBottom: 8 }}>Workshop owner</div>
        <h1 style={{ fontSize: 24, marginBottom: 24 }}>Dashboard login</h1>

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
      </div>
    </div>
  );
}
