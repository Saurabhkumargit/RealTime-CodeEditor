import React from "react";
import { useEffect, useState, useRef, useCallback } from "react";
import { useParams } from "react-router-dom";
import { io } from "socket.io-client";
import Editor from "@monaco-editor/react";
import { useNavigate } from "react-router-dom";

const socket = io("http://localhost:3001", {
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
});

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

  const [userId] = useState(() => `user-${Math.floor(Math.random() * 10000)}`);
  const isRemoteUpdate = useRef(false);
  const debounceTimeout = useRef(null);
  const hasJoinedRef = useRef(false);

  useEffect(() => {
    if (socket.disconnected) {
      socket.connect();
    } else if (socket.connected && !hasJoinedRef.current) {
      // If already connected on mount, join immediately

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
        // Reconnect case
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

  // Debounced emit
  const emitChange = useCallback(
    (value) => {
      if (!value) value = "";

      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }

      debounceTimeout.current = setTimeout(() => {
        socket.emit("code-change", {
          roomId: roomCode,
          document: value,
        });
      }, 120);
    },
    [roomCode],
  );

  const handleEditorChange = (value) => {
    setCode(value);

    // Prevent infinite loop
    if (isRemoteUpdate.current) {
      isRemoteUpdate.current = false;
      return;
    }

    emitChange(value);
  };

  const handleLeaveRoom = () => {
    socket.emit("leave-room", { roomId: roomCode });

    socket.disconnect(); // clean disconnect
    navigate("/");
  };

  if (loading) {
    return (
      <div className="h-screen bg-gray-950 text-white flex items-center justify-center">
        Loading...
      </div>
    );
  }

  if (roomError) {
    return (
      <div className="h-screen bg-gray-950 text-white flex flex-col items-center justify-center gap-6">
        <div className="text-xl">{roomError}</div>
        <button
          onClick={() => (window.location.href = "/")}
          className="bg-indigo-600 px-6 py-2 rounded"
        >
          Go Home
        </button>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-950 text-white flex flex-col">
      {/* Header */}
      <div className="h-14 bg-gray-900 border-b border-gray-800 flex items-center justify-between px-6">
        <div className="font-semibold">Real-Time Editor</div>
        <div className="flex items-center gap-4">
          <div
            className={`px-2 py-0.5 rounded text-xs capitalize ${
              connectionStatus === "connected"
                ? "bg-green-500/10 text-green-400"
                : connectionStatus === "disconnected"
                  ? "bg-red-500/10 text-red-400"
                  : "bg-yellow-500/10 text-yellow-400"
            }`}
          >
            {connectionStatus}
          </div>
          <div className="text-sm text-gray-400">
            Room: <span className="text-white">{roomCode}</span>
          </div>
          <button
            onClick={handleLeaveRoom}
            className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm transition-colors"
          >
            Leave
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Users Panel */}
        <div className="w-56 bg-gray-900 border-r border-gray-800 p-4">
          <div className="text-sm text-gray-400 mb-3">Users</div>
          <ul className="space-y-2">
            {users.map((u) => (
              <li key={u} className="bg-gray-800 px-3 py-2 rounded-md text-sm">
                {u}
              </li>
            ))}
          </ul>
        </div>

        {/* Monaco Editor */}
        <div className="flex-1">
          <Editor
            height="100%"
            theme="vs-dark"
            defaultLanguage="javascript"
            value={code}
            onChange={handleEditorChange}
            options={{
              fontSize: 14,
              minimap: { enabled: false },
              automaticLayout: true,
            }}
          />
        </div>
      </div>
    </div>
  );
}

export default RoomEditor;
