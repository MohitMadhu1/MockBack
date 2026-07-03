"use client";

import Link from "next/link";
import { useState, useEffect, useRef, use } from "react";
import { useRouter } from "next/navigation";

interface LogEntry {
  id: string;
  mock_id: string;
  method: string;
  path: string;
  status_code: number;
  latency_ms: number;
  request_body: any;
  response_body: any;
  created_at: string;
}

export default function MockDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: mockId } = use(params);
  const router = useRouter();
  const [mock, setMock] = useState<any>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [sseConnected, setSseConnected] = useState(false);
  const logContainerRef = useRef<HTMLDivElement>(null);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  // Fetch mock details
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
      .then(setMock)
      .catch(() => router.push("/dashboard"))
      .finally(() => setLoading(false));
  }, [apiUrl, mockId, router]);

  // Fetch existing logs
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    fetch(`${apiUrl}/mocks/${mockId}/logs`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setLogs(data.reverse()))
      .catch(console.error);
  }, [apiUrl, mockId]);

  // SSE: Subscribe to real-time log stream
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const eventSource = new EventSource(`${apiUrl}/mocks/${mockId}/logs/stream?token=${token}`);
    eventSource.onopen = () => setSseConnected(true);
    eventSource.onmessage = (event) => {
      const newLog = JSON.parse(event.data);
      setLogs((prev) => [...prev, newLog]);
    };
    eventSource.onerror = () => setSseConnected(false);

    return () => eventSource.close();
  }, [apiUrl, mockId]);

  // Auto-scroll logs
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs]);

  const getMethodClass = (method: string) => {
    switch (method.toUpperCase()) {
      case "GET":
        return "method-get";
      case "POST":
        return "method-post";
      case "PUT":
      case "PATCH":
        return "method-put";
      case "DELETE":
        return "method-delete";
      default:
        return "";
    }
  };

  const getStatusColor = (code: number) => {
    if (code >= 200 && code < 300) return "var(--punk-green)";
    if (code >= 400 && code < 500) return "var(--punk-yellow)";
    return "var(--punk-red)";
  };

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div className="punk-spinner" />
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", position: "relative" }}>
      <div className="halftone-bg" style={{ opacity: 0.03 }} />

      <nav className="punk-nav">
        <Link href="/" className="punk-nav-logo">
          MockBack
        </Link>
        <Link href="/dashboard" className="punk-nav-link">
          ← Dashboard
        </Link>
      </nav>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 24px" }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 32 }}>
          <div>
            <div style={{ display: "flex", gap: 16, alignItems: "center", marginBottom: 12 }}>
              <Link href="/dashboard" className="punk-btn punk-btn-secondary" style={{ padding: "4px 12px", fontSize: "0.8rem" }}>
                ← Dashboard
              </Link>
              <Link href={`/mocks/${mockId}/edit`} className="punk-btn punk-btn-secondary" style={{ padding: "4px 12px", fontSize: "0.8rem", color: "var(--punk-yellow)" }}>
                ✎ Edit Mock
              </Link>
            </div>
            <h1 className="punk-heading" style={{ fontSize: "2.5rem" }}>
              {mock.name}
            </h1>
          </div>
          <div className={`punk-badge ${sseConnected ? "punk-badge-success" : "punk-badge-error"}`}>
            {sseConnected ? "● Live" : "● Disconnected"}
          </div>
        </div>

        {/* Mock URL & Token */}
        <div
          className="punk-card"
          style={{ transform: "rotate(0deg)", marginBottom: 24 }}
        >
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: 250 }}>
              <label
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "0.6rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.15em",
                  color: "var(--punk-cyan)",
                  display: "block",
                  marginBottom: 6,
                }}
              >
                ▸ Base URL
              </label>
              <code
                style={{
                  display: "block",
                  fontSize: "0.8rem",
                  background: "var(--punk-black)",
                  padding: "8px 12px",
                  border: "1px solid var(--punk-grey)",
                  color: "var(--punk-cyan)",
                  wordBreak: "break-all",
                }}
              >
                {apiUrl}/mock/{mockId}
              </code>
            </div>
            <div style={{ flex: 1, minWidth: 200 }}>
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
                ▸ Mock Token
              </label>
              <code
                style={{
                  display: "block",
                  fontSize: "0.8rem",
                  background: "var(--punk-black)",
                  padding: "8px 12px",
                  border: "1px solid var(--punk-grey)",
                  color: "var(--punk-yellow)",
                }}
              >
                {mock?.mock_token}
              </code>
            </div>
          </div>
        </div>

        {/* Routes summary */}
        <div className="punk-card" style={{ transform: "rotate(0.2deg)", marginBottom: 24 }}>
          <div className="tape-strip tape-strip-left" />
          <h3
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "0.8rem",
              textTransform: "uppercase",
              letterSpacing: "0.15em",
              color: "var(--punk-pink)",
              marginBottom: 12,
            }}
          >
            ▸ Routes
          </h3>
          <table className="punk-table">
            <thead>
              <tr>
                <th>Method</th>
                <th>Path</th>
                <th>Auth</th>
                <th>Latency</th>
                <th>Errors</th>
                <th>Limit</th>
              </tr>
            </thead>
            <tbody>
              {mock?.config?.routes?.map((route: any, i: number) => (
                <tr key={i}>
                  <td>
                    <span className={`method-badge ${getMethodClass(route.method)}`}>
                      {route.method}
                    </span>
                  </td>
                  <td style={{ color: "var(--punk-white)" }}>{route.path}</td>
                  <td>
                    {route.protected ? (
                      <span className="punk-badge punk-badge-warn" style={{ transform: "rotate(0deg)" }}>
                        🔒
                      </span>
                    ) : (
                      <span style={{ color: "#555" }}>—</span>
                    )}
                  </td>
                  <td style={{ color: "#aaa" }}>
                    {route.latency_base_ms || 50}ms +{route.latency_jitter_ms || 100}ms
                  </td>
                  <td style={{ color: (route.error_rate || 0) > 0 ? "var(--punk-red)" : "#555" }}>
                    {((route.error_rate || 0) * 100).toFixed(0)}%
                  </td>
                  <td style={{ color: "#aaa" }}>
                    {route.rate_limit_per_minute || "∞"}/min
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ── LIVE LOG STREAM ── */}
        <div className="punk-card scanlines" style={{ transform: "rotate(0deg)", padding: 0, overflow: "hidden" }}>
          <div
            style={{
              padding: "12px 20px",
              borderBottom: "2px solid var(--punk-grey)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <h3
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "0.8rem",
                textTransform: "uppercase",
                letterSpacing: "0.15em",
                color: "var(--punk-green)",
              }}
            >
              ▸ Live Request Log
            </h3>
            <span style={{ fontSize: "0.7rem", color: "#555" }}>
              {logs.length} entries
            </span>
          </div>

          <div
            ref={logContainerRef}
            style={{
              maxHeight: 400,
              overflowY: "auto",
              fontFamily: "var(--font-body)",
              fontSize: "0.78rem",
            }}
          >
            {logs.length === 0 ? (
              <div style={{ padding: 40, textAlign: "center", color: "#555" }}>
                <p style={{ fontFamily: "var(--font-display)", fontSize: "0.9rem", marginBottom: 8 }}>
                  Waiting for requests...
                </p>
                <p style={{ fontSize: "0.75rem" }}>
                  Hit your mock URL and logs will appear here in real time.
                </p>
              </div>
            ) : (
              <table className="punk-table">
                <thead>
                  <tr>
                    <th>Time</th>
                    <th>Method</th>
                    <th>Path</th>
                    <th>Status</th>
                    <th>Latency</th>
                    <th>Response</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr key={log.id}>
                      <td style={{ color: "#666", fontSize: "0.7rem", whiteSpace: "nowrap" }}>
                        {new Date(log.created_at).toLocaleTimeString()}
                      </td>
                      <td>
                        <span className={`method-badge ${getMethodClass(log.method)}`}>
                          {log.method}
                        </span>
                      </td>
                      <td style={{ color: "var(--punk-white)" }}>{log.path}</td>
                      <td>
                        <span style={{ color: getStatusColor(log.status_code), fontWeight: 700 }}>
                          {log.status_code}
                        </span>
                      </td>
                      <td style={{ color: "#aaa" }}>{log.latency_ms}ms</td>
                      <td>
                        <code
                          style={{
                            fontSize: "0.65rem",
                            color: "#777",
                            maxWidth: 200,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            display: "block",
                          }}
                        >
                          {log.response_body ? JSON.stringify(log.response_body).slice(0, 60) + "..." : "—"}
                        </code>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
