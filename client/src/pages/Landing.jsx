import React, { useState } from "react";
import { useNavigate } from "react-router-dom";


console.log("BUILD CHECK V2");



function Landing() {
  const navigate = useNavigate();
  const [roomInput, setRoomInput] = useState("");
  const [creating, setCreating] = useState(false);

  const createRoom = async () => {
    setCreating(true);
    try {
      const res = await fetch(
        "https://realtime-codeeditor-h16u.onrender.com/rooms",
        { method: "POST" },
      );
      const data = await res.json();
      navigate(`/room/${data.roomCode}`);
    } finally {
      setCreating(false);
    }
  };

  const joinRoom = () => {
    if (!roomInput.trim()) return;
    navigate(`/room/${roomInput.trim()}`);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") joinRoom();
  };

  return (
    <div
      className="bg-grid"
      style={{
        minHeight: "100vh",
        background: "var(--bg-primary)",
        position: "relative",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem 1rem",
      }}
    >
      {/* Glow orbs */}
      <div
        className="orb orb-cyan"
        style={{ width: 560, height: 560, top: "-120px", left: "-160px", animationDelay: "0s" }}
      />
      <div
        className="orb orb-blue"
        style={{ width: 420, height: 420, bottom: "-80px", right: "-100px", animationDelay: "3s" }}
      />
      <div
        className="orb orb-cyan"
        style={{ width: 280, height: 280, top: "60%", left: "60%", animationDelay: "1.5s", opacity: 0.5 }}
      />

      {/* ── Navbar ─────────────────────────────────────────────────── */}
      <header
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "1.25rem 2rem",
          borderBottom: "1px solid var(--border-muted)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {/* Code brackets icon */}
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path d="M8 3L3 12L8 21" stroke="var(--accent-cyan)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M16 3L21 12L16 21" stroke="var(--accent-cyan)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span style={{ fontWeight: 700, fontSize: "1rem", letterSpacing: "-0.01em" }}>
            Sync<span style={{ color: "var(--accent-cyan)" }}>Code</span>
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div
            style={{
              width: 8, height: 8, borderRadius: "50%",
              background: "var(--green)",
              boxShadow: "0 0 6px var(--green)",
            }}
          />
          <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>System Nominal</span>
        </div>
      </header>

      {/* ── Hero ───────────────────────────────────────────────────── */}
      <div
        style={{
          position: "relative",
          zIndex: 10,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          maxWidth: "680px",
          width: "100%",
          gap: "1.5rem",
        }}
      >
        {/* Badge */}
        <div
          className="animate-fade-up"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            background: "var(--accent-cyan-dim)",
            border: "1px solid var(--border)",
            borderRadius: "9999px",
            padding: "4px 14px",
            fontSize: "0.75rem",
            color: "var(--accent-cyan)",
            fontWeight: 500,
            letterSpacing: "0.04em",
            textTransform: "uppercase",
          }}
        >
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--accent-cyan)" }} />
          Real-Time Collaborative Editing
        </div>

        {/* Headline */}
        <h1
          className="animate-fade-up delay-1"
          style={{
            fontSize: "clamp(2.2rem, 5vw, 3.5rem)",
            fontWeight: 800,
            lineHeight: 1.12,
            letterSpacing: "-0.03em",
            color: "#fff",
          }}
        >
          Forge code{" "}
          <span
            style={{
              background: "linear-gradient(135deg, var(--accent-cyan) 0%, #60a5fa 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            together,
          </span>
          <br />
          in real-time.
        </h1>

        {/* Tagline */}
        <p
          className="animate-fade-up delay-2"
          style={{
            color: "var(--text-secondary)",
            fontSize: "1rem",
            lineHeight: 1.6,
            maxWidth: "480px",
          }}
        >
          Experience the next generation of collaborative development with zero-latency peer-to-peer code editing.
        </p>

        {/* ── Quick Connect Card ──────────────────────────────────── */}
        <div
          className="glass-card animate-fade-up delay-3"
          style={{
            width: "100%",
            maxWidth: "440px",
            padding: "2rem",
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
            textAlign: "left",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              marginBottom: "0.25rem",
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="3" fill="var(--accent-cyan)"/>
              <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83" stroke="var(--accent-cyan)" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <span
              style={{
                fontSize: "0.6875rem",
                fontWeight: 600,
                color: "var(--accent-cyan)",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
              }}
            >
              Quick Connect
            </span>
          </div>

          <button
            id="create-room-btn"
            className="btn-primary"
            onClick={createRoom}
            disabled={creating}
            style={{ width: "100%", opacity: creating ? 0.7 : 1 }}
          >
            {creating ? (
              <>
                <span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />
                Creating…
              </>
            ) : (
              <>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                  <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
                </svg>
                Create New Room
              </>
            )}
          </button>

          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ flex: 1, height: 1, background: "var(--border-muted)" }} />
            <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>or</span>
            <div style={{ flex: 1, height: 1, background: "var(--border-muted)" }} />
          </div>

          <div style={{ display: "flex", gap: "8px" }}>
            <input
              id="room-code-input"
              className="input-field"
              placeholder="Enter room code…"
              value={roomInput}
              onChange={(e) => setRoomInput(e.target.value.toUpperCase())}
              onKeyDown={handleKeyDown}
              maxLength={8}
              style={{ flex: 1 }}
            />
            <button
              id="join-room-btn"
              className="btn-secondary"
              onClick={joinRoom}
              style={{ flexShrink: 0, padding: "11px 18px" }}
            >
              Join
            </button>
          </div>
        </div>

        {/* Stats row */}
        <div
          className="animate-fade-up delay-4"
          style={{
            display: "flex",
            gap: "2rem",
            alignItems: "center",
          }}
        >
          {[
            { label: "Global Latency", value: "24ms" },
            { label: "Active Peers", value: "1,402" },
            { label: "System Health", value: "Nominal" },
          ].map((s) => (
            <div key={s.label} style={{ textAlign: "center" }}>
              <div style={{ fontSize: "1rem", fontWeight: 700, color: s.label === "System Health" ? "var(--green)" : "var(--text-primary)" }}>
                {s.value}
              </div>
              <div style={{ fontSize: "0.6875rem", color: "var(--text-muted)", marginTop: "2px", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Landing;
