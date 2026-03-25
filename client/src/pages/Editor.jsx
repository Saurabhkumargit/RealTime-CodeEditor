import React from "react";
import { useEffect, useState, useRef, useCallback } from "react";
import { useParams } from "react-router-dom";
import { io } from "socket.io-client";
import Editor from "@monaco-editor/react";
import { useNavigate } from "react-router-dom";
import { avatarColor } from "../utils";

const socket = io("https://realtime-codeeditor-h16u.onrender.com", {
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
});

/* ── Avatar helper ───────────────────────────────────────────────── */
function UserAvatar({ userId }) {
  const initials = userId
    ? userId.replace("user-", "U-").slice(0, 4).toUpperCase()
    : "??";
  const { bg, text } = avatarColor(userId);
  return (
    <div className="avatar" style={{ background: bg, color: text }}>
      {initials.slice(0, 2)}
    </div>
  );
}

/* ── Loading screen ─────────────────────────────────────────────── */
function LoadingScreen() {
  return (
    <div
      className="bg-grid"
      style={{
        height: "100vh",
        background: "var(--bg-primary)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "1.5rem",
      }}
    >
      <div className="spinner" />
      <span style={{ color: "var(--text-secondary)", fontSize: "0.875rem", letterSpacing: "0.04em" }}>
        Connecting to room…
      </span>
    </div>
  );
}

/* ── Error screen ───────────────────────────────────────────────── */
function ErrorScreen({ message }) {
  return (
    <div
      className="bg-grid"
      style={{
        height: "100vh",
        background: "var(--bg-primary)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "1.5rem",
        padding: "2rem",
      }}
    >
      <div
        className="glass-card"
        style={{
          padding: "2.5rem",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "1rem",
          maxWidth: "400px",
          width: "100%",
          textAlign: "center",
          borderColor: "rgba(239,68,68,0.2)",
        }}
      >
        <div
          style={{
            width: 52,
            height: 52,
            borderRadius: "50%",
            background: "rgba(239,68,68,0.12)",
            border: "1px solid rgba(239,68,68,0.25)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="var(--red)" strokeWidth="1.5"/>
            <path d="M12 7v6M12 16.5v.5" stroke="var(--red)" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </div>
        <div style={{ fontWeight: 600, color: "#fff", fontSize: "1rem" }}>Room Error</div>
        <div style={{ color: "var(--text-secondary)", fontSize: "0.875rem", lineHeight: 1.6 }}>
          {message}
        </div>
        <button
          className="btn-primary"
          style={{ marginTop: "0.5rem", width: "100%" }}
          onClick={() => (window.location.href = "/")}
        >
          Return Home
        </button>
      </div>
    </div>
  );
}

/* ── Main Editor Page ───────────────────────────────────────────── */
function RoomEditor() {
  const { roomCode } = useParams();
  const navigate = useNavigate();

  const [code, setCode] = useState("");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState(
    socket.connected ? "connected" : "connecting",
  );
  const [roomError, setRoomError] = useState(null);
  const [copied, setCopied] = useState(false);

  const [userId] = useState(() => `user-${Math.floor(Math.random() * 10000)}`);
  const isRemoteUpdate = useRef(false);
  const debounceTimeout = useRef(null);
  const hasJoinedRef = useRef(false);

  useEffect(() => {
    if (socket.disconnected) {
      socket.connect();
    } else if (socket.connected && !hasJoinedRef.current) {
      socket.emit("join-room", { roomId: roomCode, userId });
      hasJoinedRef.current = true;
    }

    socket.on("room-state", ({ document, users }) => {
      isRemoteUpdate.current = true;
      setCode(document);
      setUsers(users);
      setLoading(false);
    });

    socket.on("code-update", ({ document }) => {
      isRemoteUpdate.current = true;
      setCode(document);
    });

    socket.on("user-joined", ({ userId: joinedUserId }) => {
      if (joinedUserId === userId) return;
      setUsers((prev) => [...prev, joinedUserId]);
    });

    socket.on("user-left", ({ userId: leftUserId }) => {
      setUsers((prev) => prev.filter((u) => u !== leftUserId));
    });

    socket.on("room-error", ({ message }) => {
      setRoomError(message);
    });

    socket.on("connect", () => {
      setConnectionStatus("connected");
      if (!hasJoinedRef.current) {
        socket.emit("join-room", { roomId: roomCode, userId });
        hasJoinedRef.current = true;
      } else {
        socket.emit("join-room", { roomId: roomCode, userId });
      }
    });

    socket.on("disconnect", () => {
      setConnectionStatus("reconnecting");
    });

    socket.io.on("reconnect_failed", () => {
      setConnectionStatus("disconnected");
    });

    return () => {
      socket.off("room-state");
      socket.off("code-update");
      socket.off("user-joined");
      socket.off("user-left");
      socket.off("room-error");
      socket.off("connect");
      socket.off("disconnect");
      socket.io.off("reconnect_failed");
    };
  }, [roomCode, userId]);

  const emitChange = useCallback(
    (value) => {
      if (!value) value = "";
      if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
      debounceTimeout.current = setTimeout(() => {
        socket.emit("code-change", { roomId: roomCode, document: value });
      }, 120);
    },
    [roomCode],
  );

  const handleEditorChange = (value) => {
    setCode(value);
    if (isRemoteUpdate.current) {
      isRemoteUpdate.current = false;
      return;
    }
    emitChange(value);
  };

  const handleLeaveRoom = () => {
    socket.emit("leave-room", { roomId: roomCode });
    socket.disconnect();
    navigate("/");
  };

  const copyRoomCode = () => {
    navigator.clipboard.writeText(roomCode).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  };

  if (loading) return <LoadingScreen />;
  if (roomError) return <ErrorScreen message={roomError} />;

  const statusLabel = {
    connected: "Live",
    reconnecting: "Reconnecting",
    disconnected: "Offline",
    connecting: "Connecting",
  }[connectionStatus] ?? connectionStatus;

  return (
    <div
      style={{
        height: "100vh",
        background: "var(--bg-primary)",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {/* ── Header ──────────────────────────────────────────────── */}
      <header
        style={{
          height: "48px",
          background: "var(--bg-secondary)",
          borderBottom: "1px solid var(--border-muted)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 1.25rem",
          flexShrink: 0,
          gap: "1rem",
        }}
      >
        {/* Left: Logo + Room badge */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M8 3L3 12L8 21" stroke="var(--accent-cyan)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M16 3L21 12L16 21" stroke="var(--accent-cyan)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span style={{ fontWeight: 700, fontSize: "0.875rem", letterSpacing: "-0.01em" }}>
              Sync<span style={{ color: "var(--accent-cyan)" }}>Code</span>
            </span>
          </div>

          <div style={{ width: 1, height: 18, background: "var(--border-muted)" }} />

          {/* Room code badge */}
          <button
            onClick={copyRoomCode}
            title="Click to copy room code"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              background: "var(--accent-cyan-dim)",
              border: "1px solid var(--border)",
              borderRadius: "6px",
              padding: "3px 10px",
              cursor: "pointer",
              transition: "all 0.2s",
            }}
          >
            <span
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: "0.75rem",
                color: "var(--accent-cyan)",
                fontWeight: 600,
                letterSpacing: "0.1em",
              }}
            >
              {roomCode}
            </span>
            {copied ? (
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
                <path d="M20 6L9 17L4 12" stroke="var(--green)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            ) : (
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
                <rect x="9" y="9" width="13" height="13" rx="2" stroke="var(--accent-cyan)" strokeWidth="1.5"/>
                <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" stroke="var(--accent-cyan)" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            )}
          </button>
        </div>

        {/* Right: Status + Leave */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          {/* Connection status */}
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <div className={`status-dot ${connectionStatus}`} />
            <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>
              {statusLabel}
            </span>
          </div>

          {/* Collaborator avatar row (up to 3 shown) */}
          {users.length > 0 && (
            <div style={{ display: "flex", alignItems: "center" }}>
              {users.slice(0, 3).map((u, i) => (
                <div key={u} style={{ marginLeft: i === 0 ? 0 : -8, zIndex: 10 - i }}>
                  <UserAvatar userId={u} />
                </div>
              ))}
              {users.length > 3 && (
                <div
                  style={{
                    marginLeft: -8,
                    width: 32,
                    height: 32,
                    borderRadius: "50%",
                    background: "rgba(255,255,255,0.08)",
                    border: "1.5px solid rgba(255,255,255,0.12)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "0.65rem",
                    color: "var(--text-secondary)",
                    fontWeight: 600,
                  }}
                >
                  +{users.length - 3}
                </div>
              )}
            </div>
          )}

          <button className="btn-danger" onClick={handleLeaveRoom}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Leave
          </button>
        </div>
      </header>

      {/* ── Main area ───────────────────────────────────────────── */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>

        {/* ── Collaborators Sidebar ──────────────────────────────── */}
        <aside
          style={{
            width: "200px",
            background: "var(--bg-secondary)",
            borderRight: "1px solid var(--border-muted)",
            display: "flex",
            flexDirection: "column",
            flexShrink: 0,
            overflow: "hidden",
          }}
        >
          {/* Sidebar header */}
          <div
            style={{
              padding: "12px 14px 8px",
              borderBottom: "1px solid var(--border-muted)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <span
                style={{
                  fontSize: "0.6875rem",
                  fontWeight: 600,
                  color: "var(--text-muted)",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                }}
              >
                Collaborators
              </span>
              <span
                style={{
                  fontSize: "0.6875rem",
                  background: "var(--accent-cyan-dim)",
                  color: "var(--accent-cyan)",
                  borderRadius: "9999px",
                  padding: "1px 7px",
                  fontWeight: 600,
                }}
              >
                {users.length}
              </span>
            </div>
          </div>

          {/* User list */}
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "8px 10px",
              display: "flex",
              flexDirection: "column",
              gap: "4px",
            }}
          >
            {/* Current user (you) */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "7px 8px",
                borderRadius: "8px",
                background: "rgba(0,209,255,0.05)",
                border: "1px solid var(--border)",
              }}
            >
              <UserAvatar userId={userId} />
              <div style={{ overflow: "hidden" }}>
                <div style={{ fontSize: "0.75rem", fontWeight: 500, color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  You
                </div>
                <div style={{ fontSize: "0.65rem", color: "var(--accent-cyan)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {userId}
                </div>
              </div>
            </div>

            {/* Remote users */}
            {users
              .filter((u) => u !== userId)
              .map((u) => (
                <div
                  key={u}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "7px 8px",
                    borderRadius: "8px",
                    transition: "background 0.15s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.03)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <UserAvatar userId={u} />
                  <div style={{ overflow: "hidden" }}>
                    <div style={{ fontSize: "0.75rem", fontWeight: 500, color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      Peer
                    </div>
                    <div style={{ fontSize: "0.65rem", color: "var(--text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {u}
                    </div>
                  </div>
                </div>
              ))}

            {users.filter((u) => u !== userId).length === 0 && (
              <div
                style={{
                  padding: "16px 8px",
                  textAlign: "center",
                  color: "var(--text-muted)",
                  fontSize: "0.75rem",
                  lineHeight: 1.5,
                }}
              >
                Share the room code to invite collaborators
              </div>
            )}
          </div>

          {/* Bottom telemetry strip */}
          <div
            style={{
              padding: "10px 14px",
              borderTop: "1px solid var(--border-muted)",
              display: "flex",
              flexDirection: "column",
              gap: "4px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "0.65rem", color: "var(--text-muted)" }}>Sync</span>
              <span style={{ fontSize: "0.65rem", color: connectionStatus === "connected" ? "var(--green)" : "var(--yellow)", fontWeight: 600 }}>
                {connectionStatus === "connected" ? "Active" : "Pending"}
              </span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "0.65rem", color: "var(--text-muted)" }}>Peers</span>
              <span style={{ fontSize: "0.65rem", color: "var(--text-secondary)", fontWeight: 600 }}>
                {users.length}
              </span>
            </div>
          </div>
        </aside>

        {/* ── Monaco Editor ──────────────────────────────────────── */}
        <div
          style={{
            flex: 1,
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Tab bar */}
          <div
            style={{
              height: "36px",
              background: "var(--bg-secondary)",
              borderBottom: "1px solid var(--border-muted)",
              display: "flex",
              alignItems: "stretch",
              paddingLeft: "0",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                padding: "0 16px",
                background: "var(--bg-primary)",
                borderRight: "1px solid var(--border-muted)",
                borderBottom: "2px solid var(--accent-cyan)",
                fontSize: "0.75rem",
                color: "var(--text-primary)",
                fontFamily: "'JetBrains Mono', monospace",
              }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" stroke="var(--accent-cyan)" strokeWidth="1.5"/>
                <path d="M14 2v6h6" stroke="var(--accent-cyan)" strokeWidth="1.5"/>
              </svg>
              main.js
            </div>
          </div>

          {/* Editor */}
          <div style={{ flex: 1, overflow: "hidden" }}>
            <Editor
              height="100%"
              theme="vs-dark"
              defaultLanguage="javascript"
              value={code}
              onChange={handleEditorChange}
              options={{
                fontSize: 14,
                fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                fontLigatures: true,
                minimap: { enabled: false },
                automaticLayout: true,
                scrollBeyondLastLine: false,
                lineNumbersMinChars: 3,
                padding: { top: 12 },
                renderLineHighlight: "all",
                lineHighlightBackground: "#ffffff08",
                cursorSmoothCaretAnimation: "on",
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default RoomEditor;
