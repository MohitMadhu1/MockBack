"use client";

import Link from "next/link";
import { useState } from "react";

export default function LandingPage() {
  const [description, setDescription] = useState("");

  return (
    <div style={{ position: "relative", minHeight: "100vh" }}>
      {/* Halftone background */}
      <div className="halftone-bg" />

      {/* Navigation */}
      <nav className="punk-nav">
        <Link href="/" className="punk-nav-logo">
          MockBase
        </Link>
        <div className="punk-nav-links">
          <Link href="/login" className="punk-nav-link">
            Login
          </Link>
          <Link href="/signup" className="punk-btn" style={{ fontSize: "0.8rem", padding: "8px 20px" }}>
            Sign Up
          </Link>
        </div>
      </nav>

      {/* ── HERO SECTION ── */}
      <section
        style={{
          padding: "80px 32px 60px",
          maxWidth: "900px",
          margin: "0 auto",
          position: "relative",
        }}
      >
        {/* Ink splatter decorations */}
        <div
          className="ink-splat ink-splat-pink"
          style={{ width: 80, height: 80, top: 20, right: -40, position: "absolute" }}
        />
        <div
          className="ink-splat ink-splat-cyan"
          style={{ width: 50, height: 50, bottom: 100, left: -30, position: "absolute" }}
        />

        {/* Sticker label */}
        <div className="sticker" style={{ marginBottom: 24 }}>
          AI-Powered
        </div>

        <h1
          className="punk-heading glitch-text"
          data-text="Describe your API. Get a live mock. Instantly."
          style={{ fontSize: "clamp(2.2rem, 5vw, 3.8rem)", marginBottom: 24, maxWidth: 800 }}
        >
          Describe your API.
          <br />
          Get a live mock.
          <br />
          <span className="text-pink">Instantly.</span>
        </h1>

        <p
          style={{
            fontSize: "1rem",
            color: "#999",
            maxWidth: 550,
            marginBottom: 40,
            lineHeight: 1.8,
          }}
        >
          Type what you need in{" "}
          <span className="text-yellow" style={{ fontWeight: 700 }}>
            plain english
          </span>
          . MockBase generates a shareable API with stateful data, fault injection, and auth simulation.
          No backend required.
        </p>

        {/* ── THE MAIN TEXTAREA ── */}
        <div className="punk-card" style={{ transform: "rotate(0deg)", marginBottom: 24 }}>
          <div className="tape-strip tape-strip-left" />
          <div className="tape-strip tape-strip-right" />

          <label
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "0.8rem",
              textTransform: "uppercase",
              letterSpacing: "0.15em",
              color: "var(--punk-cyan)",
              display: "block",
              marginBottom: 12,
            }}
          >
            ▸ Describe your API
          </label>
          <textarea
            className="punk-textarea"
            placeholder={`"A food delivery API with endpoints for listing restaurants, getting a restaurant's menu, placing orders, and checking order status. Orders should have statuses: pending, preparing, out_for_delivery, delivered. Protect the POST /orders route with auth."`}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={5}
          />
          <div style={{ marginTop: 16, display: "flex", justifyContent: "flex-end" }}>
            <Link
              href={description.trim() ? `/mocks/new?desc=${encodeURIComponent(description)}` : "/signup"}
              className="punk-btn"
            >
              Generate Mock →
            </Link>
          </div>
        </div>

        {/* ── EXAMPLE OUTPUT ── */}
        <div
          className="punk-card crosshatch"
          style={{ transform: "rotate(0.5deg)", fontFamily: "var(--font-body)", fontSize: "0.8rem" }}
        >
          <div style={{ color: "var(--punk-green)", marginBottom: 8 }}>// Generated output</div>
          <pre
            style={{
              color: "var(--punk-white)",
              whiteSpace: "pre-wrap",
              lineHeight: 1.6,
              opacity: 0.85,
            }}
          >
{`POST /orders          201  48ms   { "order_id": "ord_8f2k", "status": "pending" }
GET  /orders/ord_8f2k 200  31ms   { "order_id": "ord_8f2k", "status": "pending" }
GET  /restaurants     429  12ms   Rate limit exceeded
GET  /restaurants     200  243ms  [{ "name": "The Golden Fork", ... }]`}
          </pre>
        </div>
      </section>

      {/* ── FEATURES SECTION ── */}
      <section
        className="torn-edge-bottom"
        style={{
          padding: "80px 32px",
          borderTop: "3px solid var(--punk-grey)",
          position: "relative",
        }}
      >
        <div className="halftone-bg" style={{ opacity: 0.04 }} />
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <div className="sticker" style={{ marginBottom: 32 }}>
            Why MockBase
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: 24,
            }}
          >
            {/* Feature Card 1 */}
            <div className="punk-card" style={{ transform: "rotate(-0.8deg)" }}>
              <h3 style={{ fontSize: "1.2rem", color: "var(--punk-pink)", marginBottom: 12 }}>
                Stateful Mocks
              </h3>
              <p style={{ fontSize: "0.85rem", color: "#aaa", lineHeight: 1.7 }}>
                POST creates a resource. GET retrieves the exact same object. DELETE removes it.
                Your mock behaves like a real database.
              </p>
            </div>

            {/* Feature Card 2 */}
            <div className="punk-card" style={{ transform: "rotate(0.5deg)" }}>
              <h3 style={{ fontSize: "1.2rem", color: "var(--punk-cyan)", marginBottom: 12 }}>
                Fault Injection
              </h3>
              <p style={{ fontSize: "0.85rem", color: "#aaa", lineHeight: 1.7 }}>
                Configurable 429s, 500 errors, and latency jitter per route. Test how your frontend
                handles the chaos.
              </p>
            </div>

            {/* Feature Card 3 */}
            <div className="punk-card" style={{ transform: "rotate(-0.3deg)" }}>
              <h3 style={{ fontSize: "1.2rem", color: "var(--punk-yellow)", marginBottom: 12 }}>
                Shareable URLs
              </h3>
              <p style={{ fontSize: "0.85rem", color: "#aaa", lineHeight: 1.7 }}>
                One URL, works for every team member immediately. No local setup, no Docker, no
                config files on anyone&apos;s machine.
              </p>
            </div>

            {/* Feature Card 4 */}
            <div className="punk-card" style={{ transform: "rotate(0.6deg)" }}>
              <h3 style={{ fontSize: "1.2rem", color: "var(--punk-green)", marginBottom: 12 }}>
                Auth Simulation
              </h3>
              <p style={{ fontSize: "0.85rem", color: "#aaa", lineHeight: 1.7 }}>
                Protected routes that validate Bearer tokens. Write real auth header code before the
                real backend exists.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section style={{ padding: "80px 32px", position: "relative" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <div className="sticker" style={{ marginBottom: 32, background: "var(--punk-cyan)" }}>
            How It Works
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
            {[
              {
                step: "01",
                title: "Describe",
                desc: "Type what your API should do in plain English. That's it.",
                color: "var(--punk-pink)",
              },
              {
                step: "02",
                title: "Generate",
                desc: "Our LLM creates a validated JSON route config. Edit any field before deploying.",
                color: "var(--punk-yellow)",
              },
              {
                step: "03",
                title: "Configure",
                desc: "Set latency, error rates, rate limits, and auth per route via sliders.",
                color: "var(--punk-cyan)",
              },
              {
                step: "04",
                title: "Deploy",
                desc: "One click. Get a live URL. Share with your team. Watch logs in real time.",
                color: "var(--punk-green)",
              },
            ].map((item) => (
              <div
                key={item.step}
                style={{
                  display: "flex",
                  gap: 24,
                  alignItems: "flex-start",
                  padding: "20px 0",
                  borderBottom: "1px solid var(--punk-grey)",
                }}
              >
                <div
                  className="stamp-border"
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "1.5rem",
                    color: item.color,
                    minWidth: 60,
                    height: 60,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  {item.step}
                </div>
                <div>
                  <h3
                    style={{
                      fontFamily: "var(--font-display)",
                      fontSize: "1.3rem",
                      color: item.color,
                      marginBottom: 6,
                    }}
                  >
                    {item.title}
                  </h3>
                  <p style={{ fontSize: "0.9rem", color: "#999", lineHeight: 1.7 }}>
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer
        style={{
          padding: "32px",
          borderTop: "3px solid var(--punk-grey)",
          textAlign: "center",
          fontSize: "0.75rem",
          color: "#555",
          fontFamily: "var(--font-body)",
        }}
      >
        <span className="text-pink">MockBase</span> — Built with NestJS, FastAPI, Redis & pure chaos.
      </footer>
    </div>
  );
}
