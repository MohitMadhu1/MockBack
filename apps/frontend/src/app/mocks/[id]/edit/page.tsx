"use client";

import Link from "next/link";
import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";

function EditMockContent({ mockId }: { mockId: string }) {
  const router = useRouter();
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  const [mockName, setMockName] = useState("");
  const [routes, setRoutes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    fetch(`${apiUrl}/mocks/${mockId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Not found");
        return res.json();
      })
      .then((data) => {
        setMockName(data.name || "");
        setRoutes(data.config?.routes || []);
      })
      .catch((err) => {
        setError("Failed to load mock configuration");
      })
      .finally(() => setLoading(false));
  }, [apiUrl, mockId, router]);

  const updateRoute = (index: number, field: string, value: any) => {
    const newRoutes = [...routes];
    newRoutes[index] = { ...newRoutes[index], [field]: value };
    setRoutes(newRoutes);
  };

  const deleteRoute = (index: number) => {
    const newRoutes = [...routes];
    newRoutes.splice(index, 1);
    setRoutes(newRoutes);
  };

  const addRoute = () => {
    setRoutes([
      ...routes,
      {
        method: "GET",
        path: "/new-route",
        protected: false,
        latency_base_ms: 50,
        latency_jitter_ms: 100,
        error_rate: 0,
        rate_limit_per_minute: null,
        response: {
          type: "object",
          fields: ["id", "name", "status"],
        },
      },
    ]);
  };

  const saveMock = async () => {
    setSaving(true);
    setError("");
    
    // Validation
    if (routes.length === 0) {
      setError("You must have at least one route.");
      setSaving(false);
      return;
    }
    for (const r of routes) {
      if (!r.path || !r.path.trim().startsWith("/")) {
        setError("All routes must have a valid path starting with '/'");
        setSaving(false);
        return;
      }
    }
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${apiUrl}/mocks/${mockId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          config: {
            name: mockName,
            routes,
          },
        }),
      });

      if (!res.ok) throw new Error("Failed to save mock");
      router.push(`/mocks/${mockId}`);
    } catch (err: any) {
      setError(err.message);
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "100px 20px" }}>
        <div className="punk-spinner" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="punk-badge punk-badge-error" style={{ transform: "rotate(0)" }}>
        {error}
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 800, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div className="sticker" style={{ background: "var(--punk-cyan)" }}>
          Edit Mode
        </div>
        <Link href={`/mocks/${mockId}`} className="punk-btn punk-btn-secondary" style={{ padding: "6px 16px", fontSize: "0.8rem" }}>
          Cancel
        </Link>
      </div>

      <h2
        className="punk-heading"
        data-text="Configure Routes"
        style={{ fontSize: "2rem", marginBottom: 12 }}
      >
        Configure <span className="text-yellow">Routes</span>
      </h2>
      <p style={{ color: "#888", fontSize: "0.85rem", marginBottom: 24 }}>
        Edit any field. Tweak latency, error rates, and auth per route. Changes apply instantly!
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
          disabled
          style={{ opacity: 0.7 }}
          title="Mock name cannot be changed here"
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

            <button
              onClick={() => deleteRoute(index)}
              style={{
                background: "none",
                border: "none",
                color: "var(--punk-red)",
                cursor: "pointer",
                fontFamily: "var(--font-display)",
                fontSize: "0.7rem",
                marginLeft: "auto",
              }}
              title="Delete Route"
            >
              ✕
            </button>
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

      <div style={{ display: "flex", gap: 12, justifyContent: "space-between", marginTop: 24 }}>
        <button
          className="punk-btn punk-btn-secondary"
          onClick={addRoute}
          style={{ padding: "8px 16px", fontSize: "0.8rem", color: "var(--punk-green)" }}
        >
          ➕ Add Route
        </button>
        <button className="punk-btn" onClick={saveMock} disabled={saving}>
          {saving ? "Saving..." : "Save Changes →"}
        </button>
      </div>
    </div>
  );
}

export default function EditMockPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return (
    <div style={{ padding: "40px 20px" }}>
      <EditMockContent mockId={id} />
    </div>
  );
}
