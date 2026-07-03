"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface MockItem {
  id: string;
  mock_id: string;
  name: string;
  mock_token: string;
  config: any;
  created_at: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [mocks, setMocks] = useState<MockItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState<string | null>(null);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    fetch(`${apiUrl}/mocks`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Unauthorized");
        return res.json();
      })
      .then(setMocks)
      .catch(() => {
        localStorage.removeItem("token");
        router.push("/login");
      })
      .finally(() => setLoading(false));
  }, [apiUrl, router]);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const deleteMock = async (mockId: string) => {
    const token = localStorage.getItem("token");
    await fetch(`${apiUrl}/mocks/${mockId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    setMocks(mocks.filter((m) => m.mock_id !== mockId));
  };

  const getMockUrl = (mockId: string) => `${apiUrl}/mock/${mockId}`;

  return (
    <div style={{ minHeight: "100vh", position: "relative" }}>
      <div className="halftone-bg" style={{ opacity: 0.03 }} />

      {/* Nav */}
      <nav className="punk-nav">
        <Link href="/" className="punk-nav-logo">
          MockBase
        </Link>
        <div className="punk-nav-links">
          <Link href="/mocks/new" className="punk-btn" style={{ fontSize: "0.75rem", padding: "8px 18px" }}>
            + New Mock
          </Link>
          <button
            className="punk-nav-link"
            onClick={() => {
              localStorage.removeItem("token");
              router.push("/");
            }}
            style={{ background: "none", border: "none", cursor: "pointer" }}
          >
            Logout
          </button>
        </div>
      </nav>

      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "40px 24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 40 }}>
          <h1
            className="punk-heading"
            data-text="Your Mocks"
            style={{ fontSize: "2.2rem" }}
          >
            Your <span className="text-pink">Mocks</span>
          </h1>
          <div className="sticker" style={{ background: "var(--punk-green)" }}>
            {mocks.length} Active
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: 80 }}>
            <div className="punk-spinner" style={{ margin: "0 auto 16px" }} />
            <p style={{ color: "#666", fontSize: "0.85rem" }}>Loading your mocks...</p>
          </div>
        ) : mocks.length === 0 ? (
          <div
            className="punk-card crosshatch"
            style={{ textAlign: "center", padding: 60, transform: "rotate(0deg)" }}
          >
            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "1.5rem",
                color: "var(--punk-yellow)",
                marginBottom: 16,
              }}
            >
              No mocks yet.
            </h2>
            <p style={{ color: "#888", marginBottom: 24, fontSize: "0.9rem" }}>
              Describe an API and deploy your first mock server.
            </p>
            <Link href="/mocks/new" className="punk-btn">
              Create Your First Mock →
            </Link>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {mocks.map((mock, i) => (
              <div
                key={mock.id}
                className="punk-card"
                style={{ transform: `rotate(${i % 2 === 0 ? "-0.3" : "0.3"}deg)` }}
              >
                <div className="tape-strip tape-strip-left" />

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    flexWrap: "wrap",
                    gap: 16,
                  }}
                >
                  <div>
                    <h3
                      style={{
                        fontFamily: "var(--font-display)",
                        fontSize: "1.3rem",
                        color: "var(--punk-pink)",
                        marginBottom: 8,
                      }}
                    >
                      {mock.name}
                    </h3>

                    {/* Mock URL */}
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                      <code
                        style={{
                          fontSize: "0.8rem",
                          background: "var(--punk-black)",
                          padding: "6px 12px",
                          border: "1px solid var(--punk-grey)",
                          color: "var(--punk-cyan)",
                        }}
                      >
                        {getMockUrl(mock.mock_id)}
                      </code>
                      <button
                        className="copy-btn"
                        onClick={() => copyToClipboard(getMockUrl(mock.mock_id), `url-${mock.mock_id}`)}
                      >
                        {copied === `url-${mock.mock_id}` ? "Copied!" : "Copy"}
                      </button>
                    </div>

                    {/* Mock Token */}
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                      <code
                        style={{
                          fontSize: "0.75rem",
                          background: "var(--punk-black)",
                          padding: "4px 10px",
                          border: "1px solid var(--punk-grey)",
                          color: "var(--punk-yellow)",
                        }}
                      >
                        {mock.mock_token}
                      </code>
                      <button
                        className="copy-btn"
                        onClick={() => copyToClipboard(mock.mock_token, `tkn-${mock.mock_id}`)}
                      >
                        {copied === `tkn-${mock.mock_id}` ? "Copied!" : "Copy"}
                      </button>
                    </div>

                    {/* Route count badge */}
                    <div className="punk-badge punk-badge-info" style={{ marginTop: 4 }}>
                      {mock.config?.routes?.length || 0} routes
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                    <Link
                      href={`/mocks/${mock.mock_id}`}
                      className="punk-btn-secondary punk-btn"
                      style={{ fontSize: "0.7rem", padding: "6px 14px" }}
                    >
                      View Logs
                    </Link>
                    <button
                      onClick={() => deleteMock(mock.mock_id)}
                      className="punk-btn"
                      style={{
                        fontSize: "0.7rem",
                        padding: "6px 14px",
                        background: "var(--punk-red)",
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
