"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Login failed");
      localStorage.setItem("token", data.access_token);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", position: "relative" }}>
      <div className="halftone-bg" />

      <nav className="punk-nav">
        <Link href="/" className="punk-nav-logo">
          MockBack
        </Link>
      </nav>

      <div
        style={{
          maxWidth: 420,
          margin: "80px auto 0",
          padding: "0 24px",
          position: "relative",
        }}
      >
        {/* Ink decorations */}
        <div
          className="ink-splat ink-splat-pink"
          style={{ width: 60, height: 60, top: -30, right: -20, position: "absolute" }}
        />

        <div className="sticker" style={{ marginBottom: 24 }}>
          Access Granted
        </div>

        <h1
          className="punk-heading"
          data-text="Log In"
          style={{ fontSize: "2.5rem", marginBottom: 32 }}
        >
          Log <span className="text-pink">In</span>
        </h1>

        <form onSubmit={handleLogin}>
          <div className="punk-card" style={{ transform: "rotate(0deg)" }}>
            <div className="tape-strip tape-strip-left" />

            <div style={{ marginBottom: 20 }}>
              <label
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "0.7rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.15em",
                  color: "var(--punk-cyan)",
                  display: "block",
                  marginBottom: 8,
                }}
              >
                ▸ Email
              </label>
              <input
                type="email"
                className="punk-input"
                placeholder="punk@mockback.dev"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div style={{ marginBottom: 24 }}>
              <label
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "0.7rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.15em",
                  color: "var(--punk-cyan)",
                  display: "block",
                  marginBottom: 8,
                }}
              >
                ▸ Password
              </label>
              <input
                type="password"
                className="punk-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {error && (
              <div
                className="punk-badge punk-badge-error"
                style={{ marginBottom: 16, transform: "rotate(0deg)" }}
              >
                {error}
              </div>
            )}

            <button type="submit" className="punk-btn" style={{ width: "100%" }} disabled={loading}>
              {loading ? "Authenticating..." : "Enter →"}
            </button>
          </div>
        </form>

        <p
          style={{
            marginTop: 24,
            fontSize: "0.85rem",
            color: "#666",
            textAlign: "center",
          }}
        >
          No account?{" "}
          <Link href="/signup" className="text-pink" style={{ textDecoration: "underline" }}>
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
