"use client";

import Link from "next/link";
import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function NewMockContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialDesc = searchParams.get("desc") || "";

  const [step, setStep] = useState(1);
  const [description, setDescription] = useState(initialDesc);
  const [routes, setRoutes] = useState<any[]>([]);
  const [mockName, setMockName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Deploy result
  const [deployResult, setDeployResult] = useState<any>(null);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  // Step 1: Generate schema via LLM
  const generateSchema = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${apiUrl}/generate-schema`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description }),
      });
      if (!res.ok) throw new Error("Schema generation failed");
      const data = await res.json();
      setRoutes(data.routes || []);
      setMockName(data.name || "My Mock API");
      setStep(2);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Deploy
  const deployMock = async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }
      const res = await fetch(`${apiUrl}/mocks`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: mockName,
          config: { routes },
        }),
      });
      if (!res.ok) throw new Error("Deploy failed");
      const data = await res.json();
      setDeployResult(data);
      setStep(4);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Route editor helpers
  const updateRoute = (index: number, field: string, value: any) => {
    const updated = [...routes];
    if (field.includes(".")) {
      const [parent, child] = field.split(".");
      updated[index][parent][child] = value;
    } else {
      updated[index][field] = value;
    }
    setRoutes(updated);
  };

  return (
    <div style={{ minHeight: "100vh", position: "relative" }}>
      <div className="halftone-bg" style={{ opacity: 0.03 }} />

      <nav className="punk-nav">
        <Link href="/" className="punk-nav-logo">
          MockBase
        </Link>
        <Link href="/dashboard" className="punk-nav-link">
          ← Dashboard
        </Link>
      </nav>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "40px 24px" }}>
        {/* Step indicator */}
        <div
          style={{
            display: "flex",
            gap: 8,
            marginBottom: 40,
            alignItems: "center",
          }}
        >
          {["Describe", "Configure", "Deploy", "Live!"].map((label, i) => (
            <div key={label} style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div
                className={step > i + 1 ? "stamp-border" : ""}
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "0.75rem",
                  width: 32,
                  height: 32,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: step === i + 1 ? "var(--punk-pink)" : step > i + 1 ? "var(--punk-green)" : "var(--punk-grey)",
                  color: step >= i + 1 ? "var(--punk-black)" : "#666",
                }}
              >
                {step > i + 1 ? "✓" : i + 1}
              </div>
              <span
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "0.7rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  color: step === i + 1 ? "var(--punk-white)" : "#555",
                }}
              >
                {label}
              </span>
              {i < 3 && (
                <div style={{ width: 30, height: 2, background: "var(--punk-grey)", margin: "0 4px" }} />
              )}
            </div>
          ))}
        </div>

        {/* ── STEP 1: DESCRIBE ── */}
        {step === 1 && (
          <>
            <div className="sticker" style={{ marginBottom: 20 }}>
              Step 01
            </div>
            <h2
              className="punk-heading"
              data-text="Describe Your API"
              style={{ fontSize: "2rem", marginBottom: 24 }}
            >
              Describe Your <span className="text-cyan">API</span>
            </h2>

            <div className="punk-card" style={{ transform: "rotate(0deg)" }}>
              <div className="tape-strip tape-strip-left" />
              <textarea
                className="punk-textarea"
                placeholder={`"A food delivery API with endpoints for listing restaurants, getting a restaurant's menu, placing orders, and checking order status..."`}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={6}
              />
              <div style={{ marginTop: 16, display: "flex", justifyContent: "flex-end" }}>
                <button className="punk-btn" onClick={generateSchema} disabled={loading || !description.trim()}>
                  {loading ? (
                    <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span className="punk-spinner" style={{ width: 18, height: 18, borderWidth: 2 }} />
                      Generating...
                    </span>
                  ) : (
                    "Generate Routes →"
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="punk-badge punk-badge-error" style={{ marginTop: 16, transform: "rotate(0deg)" }}>
                {error}
              </div>
            )}
          </>
        )}

        {/* ── STEP 2: CONFIGURE ROUTES ── */}
        {step === 2 && (
          <>
            <div className="sticker" style={{ marginBottom: 20, background: "var(--punk-cyan)" }}>
              Step 02
            </div>
            <h2
              className="punk-heading"
              data-text="Configure Routes"
              style={{ fontSize: "2rem", marginBottom: 12 }}
            >
              Configure <span className="text-yellow">Routes</span>
            </h2>
            <p style={{ color: "#888", fontSize: "0.85rem", marginBottom: 24 }}>
              Edit any field. Tweak latency, error rates, and auth per route.
            </p>

            {/* Mock name */}
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
                ▸ Mock Name
              </label>
              <input
                className="punk-input"
                value={mockName}
                onChange={(e) => setMockName(e.target.value)}
              />
            </div>

            {/* Route cards */}
            {routes.map((route, index) => (
              <div
                key={index}
                className="punk-card"
                style={{
                  marginBottom: 16,
                  transform: `rotate(${index % 2 === 0 ? -0.3 : 0.3}deg)`,
                }}
              >
                {/* Route header */}
                <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 16, flexWrap: "wrap" }}>
                  <select
                    value={route.method}
                    onChange={(e) => updateRoute(index, "method", e.target.value)}
                    style={{
                      fontFamily: "var(--font-display)",
                      fontSize: "0.75rem",
                      padding: "6px 10px",
                      background: "var(--punk-black)",
                      color: "var(--punk-green)",
                      border: "2px solid var(--punk-grey)",
                    }}
                  >
                    {["GET", "POST", "PUT", "PATCH", "DELETE"].map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>

                  <input
                    className="punk-input"
                    value={route.path}
                    onChange={(e) => updateRoute(index, "path", e.target.value)}
                    style={{ flex: 1, minWidth: 180 }}
                  />

                  <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
                    <div
                      className={`punk-toggle ${route.protected ? "active" : ""}`}
                      onClick={() => updateRoute(index, "protected", !route.protected)}
                    />
                    <span
                      style={{
                        fontFamily: "var(--font-display)",
                        fontSize: "0.65rem",
                        textTransform: "uppercase",
                        letterSpacing: "0.1em",
                        color: route.protected ? "var(--punk-pink)" : "#666",
                      }}
                    >
                      Auth
                    </span>
                  </label>
                </div>

                {/* Sliders */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                    gap: 16,
                    fontSize: "0.75rem",
                  }}
                >
                  {/* Latency */}
                  <div>
                    <label
                      style={{
                        fontFamily: "var(--font-display)",
                        fontSize: "0.6rem",
                        textTransform: "uppercase",
                        letterSpacing: "0.15em",
                        color: "var(--punk-yellow)",
                        display: "block",
                        marginBottom: 6,
                      }}
                    >
                      Latency Base: {route.latency_base_ms || 50}ms
                    </label>
                    <input
                      type="range"
                      className="punk-slider"
                      min={0}
                      max={3000}
                      value={route.latency_base_ms || 50}
                      onChange={(e) => updateRoute(index, "latency_base_ms", parseInt(e.target.value))}
                    />
                  </div>

                  {/* Jitter */}
                  <div>
                    <label
                      style={{
                        fontFamily: "var(--font-display)",
                        fontSize: "0.6rem",
                        textTransform: "uppercase",
                        letterSpacing: "0.15em",
                        color: "var(--punk-yellow)",
                        display: "block",
                        marginBottom: 6,
                      }}
                    >
                      Jitter: {route.latency_jitter_ms || 100}ms
                    </label>
                    <input
                      type="range"
                      className="punk-slider"
                      min={0}
                      max={2000}
                      value={route.latency_jitter_ms || 100}
                      onChange={(e) => updateRoute(index, "latency_jitter_ms", parseInt(e.target.value))}
                    />
                  </div>

                  {/* Error Rate */}
                  <div>
                    <label
                      style={{
                        fontFamily: "var(--font-display)",
                        fontSize: "0.6rem",
                        textTransform: "uppercase",
                        letterSpacing: "0.15em",
                        color: "var(--punk-red)",
                        display: "block",
                        marginBottom: 6,
                      }}
                    >
                      Error Rate: {((route.error_rate || 0) * 100).toFixed(0)}%
                    </label>
                    <input
                      type="range"
                      className="punk-slider"
                      min={0}
                      max={100}
                      value={(route.error_rate || 0) * 100}
                      onChange={(e) => updateRoute(index, "error_rate", parseInt(e.target.value) / 100)}
                    />
                  </div>

                  {/* Rate Limit */}
                  <div>
                    <label
                      style={{
                        fontFamily: "var(--font-display)",
                        fontSize: "0.6rem",
                        textTransform: "uppercase",
                        letterSpacing: "0.15em",
                        color: "var(--punk-orange)",
                        display: "block",
                        marginBottom: 6,
                      }}
                    >
                      Rate Limit: {route.rate_limit_per_minute || "∞"}/min
                    </label>
                    <input
                      type="range"
                      className="punk-slider"
                      min={0}
                      max={500}
                      value={route.rate_limit_per_minute || 0}
                      onChange={(e) =>
                        updateRoute(
                          index,
                          "rate_limit_per_minute",
                          parseInt(e.target.value) || null,
                        )
                      }
                    />
                  </div>
                </div>
              </div>
            ))}

            <div style={{ display: "flex", gap: 12, justifyContent: "flex-end", marginTop: 24 }}>
              <button className="punk-btn punk-btn-secondary" onClick={() => setStep(1)}>
                ← Back
              </button>
              <button className="punk-btn" onClick={deployMock} disabled={loading}>
                {loading ? "Deploying..." : "Deploy Mock →"}
              </button>
            </div>
          </>
        )}

        {/* ── STEP 4: DEPLOYED ── */}
        {step === 4 && deployResult && (
          <>
            <div className="sticker" style={{ marginBottom: 20, background: "var(--punk-green)" }}>
              Live!
            </div>
            <h2
              className="punk-heading glitch-text"
              data-text="Your Mock is Live"
              style={{ fontSize: "2rem", marginBottom: 24 }}
            >
              Your Mock is <span className="text-green">Live</span>
            </h2>

            <div className="punk-card" style={{ transform: "rotate(-0.3deg)" }}>
              <div className="tape-strip tape-strip-left" />
              <div className="tape-strip tape-strip-right" />

              <div style={{ marginBottom: 20 }}>
                <label
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "0.65rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.15em",
                    color: "var(--punk-cyan)",
                    display: "block",
                    marginBottom: 8,
                  }}
                >
                  ▸ Mock URL
                </label>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <code
                    style={{
                      flex: 1,
                      fontSize: "0.85rem",
                      background: "var(--punk-black)",
                      padding: "12px 16px",
                      border: "2px solid var(--punk-green)",
                      color: "var(--punk-green)",
                      wordBreak: "break-all",
                    }}
                  >
                    {apiUrl}/mock/{deployResult.mock_id}
                  </code>
                  <button
                    className="copy-btn"
                    onClick={() =>
                      navigator.clipboard.writeText(`${apiUrl}/mock/${deployResult.mock_id}`)
                    }
                  >
                    Copy
                  </button>
                </div>
              </div>

              <div style={{ marginBottom: 20 }}>
                <label
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "0.65rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.15em",
                    color: "var(--punk-yellow)",
                    display: "block",
                    marginBottom: 8,
                  }}
                >
                  ▸ Mock Token (for protected routes)
                </label>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <code
                    style={{
                      flex: 1,
                      fontSize: "0.85rem",
                      background: "var(--punk-black)",
                      padding: "12px 16px",
                      border: "2px solid var(--punk-yellow)",
                      color: "var(--punk-yellow)",
                    }}
                  >
                    {deployResult.mock_token}
                  </code>
                  <button
                    className="copy-btn"
                    onClick={() => navigator.clipboard.writeText(deployResult.mock_token)}
                  >
                    Copy
                  </button>
                </div>
              </div>

              {/* Example cURL */}
              <div>
                <label
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "0.65rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.15em",
                    color: "var(--punk-pink)",
                    display: "block",
                    marginBottom: 8,
                  }}
                >
                  ▸ Try it
                </label>
                <pre
                  className="crosshatch"
                  style={{
                    background: "var(--punk-black)",
                    padding: 16,
                    border: "1px solid var(--punk-grey)",
                    fontSize: "0.75rem",
                    color: "#aaa",
                    overflowX: "auto",
                    whiteSpace: "pre-wrap",
                  }}
                >
{`curl ${apiUrl}/mock/${deployResult.mock_id}/${routes[0]?.path?.replace(/^\//, "") || "resource"}`}
                </pre>
              </div>
            </div>

            <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 32 }}>
              <Link href={`/mocks/${deployResult.mock_id}`} className="punk-btn">
                View Logs →
              </Link>
              <Link href="/dashboard" className="punk-btn punk-btn-secondary">
                Dashboard
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function NewMockPage() {
  return (
    <Suspense fallback={<div style={{ padding: 40, textAlign: "center" }}>Loading...</div>}>
      <NewMockContent />
    </Suspense>
  );
}
