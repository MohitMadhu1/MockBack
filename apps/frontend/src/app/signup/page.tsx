"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Signup failed");
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
        <div
          className="ink-splat ink-splat-cyan"
          style={{ width: 70, height: 70, top: -20, left: -30, position: "absolute" }}
        />

        <div className="sticker" style={{ marginBottom: 24, background: "var(--punk-pink)" }}>
          New Member
        </div>

        <h1
          className="punk-heading"
          data-text="Sign Up"
          style={{ fontSize: "2.5rem", marginBottom: 32 }}
        >
          Sign <span className="text-cyan">Up</span>
        </h1>

        <form onSubmit={handleSignup}>
          <div className="punk-card" style={{ transform: "rotate(0.3deg)" }}>
            <div className="tape-strip tape-strip-right" />

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
                placeholder="rebel@mockback.dev"
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
              {loading ? "Creating..." : "Join the Chaos →"}
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
          Already have an account?{" "}
          <Link href="/login" className="text-cyan" style={{ textDecoration: "underline" }}>
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
