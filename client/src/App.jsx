import { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:3001");

function App() {
  const [code, setCode] = useState("");
  const [users, setUsers] = useState([]);

  const params = new URLSearchParams(window.location.search);
  const roomId = params.get("roomId");

  // Temporary user identity
  const userIdRef = useRef(null);

  if (!userIdRef.current) {
    userIdRef.current = `user-${Math.floor(Math.random() * 10000)}`;
  }

  const userId = userIdRef.current;

  useEffect(() => {
    if (!roomId) return;

    // Join room
    socket.emit("join-room", { roomId, userId });

    // Initial sync
    socket.on("room-state", ({ document, users }) => {
      setCode(document);
      setUsers(users);
    });

    // Code updates
    socket.on("code-update", ({ document }) => {
      setCode(document);
    });

    // Presence
    socket.on("user-joined", ({ userId: joinedUserId }) => {
      if (joinedUserId === userId) return;
      setUsers((prev) => [...prev, joinedUserId]);
    });

    socket.on("user-left", ({ userId }) => {
      setUsers((prev) => prev.filter((u) => u !== userId));
    });

    return () => {
      socket.off("room-state");
      socket.off("code-update");
      socket.off("user-joined");
      socket.off("user-left");
    };
  }, [roomId]);

  const handleChange = (e) => {
    const newCode = e.target.value;
    setCode(newCode);

    socket.emit("code-change", {
      roomId,
      document: newCode,
    });
  };

  if (!roomId) {
    return <div>Missing roomId in URL</div>;
  }

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      {/* Presence Panel */}
      <div
        style={{
          width: "200px",
          borderRight: "1px solid #ddd",
          padding: "10px",
          fontSize: "14px",
        }}
      >
        <strong>Users</strong>
        <ul>
          {users.map((u) => (
            <li key={u}>{u}</li>
          ))}
        </ul>
      </div>

      {/* Editor */}
      <textarea
        value={code}
        onChange={handleChange}
        style={{
          flex: 1,
          padding: "10px",
          fontSize: "16px",
        }}
      />
    </div>
  );
}

export default App;
